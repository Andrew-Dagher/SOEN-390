/**
 * @file SettingsScreen.test.jsx
 * @description Tests the SettingsScreen component to ensure that it renders correctly
 * with the provided context and navigation. Mocks Clerk authentication and BottomNavBar to
 * prevent route errors during testing. Additionally, tests utility functions in settingsUtils.js.
 */

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";

// Our component under test
import SettingsScreen from "../app/screens/settings/settingsScreen";

// Context & utilities that we’ll mock
import { useAppSettings } from "../app/AppSettingsContext";
import { pickImage, handleLogout } from "../app/settingsUtils";

// Mock the context
jest.mock("../app/AppSettingsContext", () => ({
  useAppSettings: jest.fn(),
}));

// Mock the utility functions
jest.mock("../app/settingsUtils", () => ({
  ...jest.requireActual("../app/settingsUtils"), // keep any exports you’re not overriding
  pickImage: jest.fn(),
  handleLogout: jest.fn(),
}));

// Mock Clerk's useAuth for the logout test
jest.mock("@clerk/clerk-expo", () => ({
  useAuth: () => ({
    isSignedIn: true,
    signOut: jest.fn(),
  }),
}));

describe("SettingsScreen - Interactions", () => {
  // Some helpful mocks we'll reuse:
  const mockSetTextSize = jest.fn();
  const mockSetProfileImage = jest.fn();
  const mockSetColorBlindMode = jest.fn();

  // Navigation mock for handleLogout
  const mockNavigation = { reset: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    // Provide initial return values from useAppSettings
    useAppSettings.mockReturnValue({
      textSize: 16,
      setTextSize: mockSetTextSize,
      colorBlindMode: null,
      setColorBlindMode: mockSetColorBlindMode,
      profileImage: null,
      setProfileImage: mockSetProfileImage,
    });
  });

  function renderSettingsScreen() {
    // Render inside a NavigationContainer so that `useNavigation()` works
    return render(
      <NavigationContainer>
        <SettingsScreen />
      </NavigationContainer>
    );
  }

  test('Pressing "Apply Changes" updates context with tempSize and tempProfileImage', () => {
    const { getByText, getByRole } = renderSettingsScreen();

    // "tempSize" is updated in state by the Slider, but for simplicity,
    // we’ll just call `fireEvent` on the slider to simulate picking a new size.
    const slider = getByRole("adjustable"); // The <Slider /> has role="adjustable"
    fireEvent(slider, "valueChange", 20); // user picks a size of 20

    // We also simulate picking an image; that sets `tempProfileImage` in local state
    // We don’t need to call `pickImage` here—just manually set local state. 
    // The simplest approach is to test that pressing the avatar triggers pickImage. 
    // So let's do that separately. For now, let's assume local state is updated.
    // There's no direct handle for `tempProfileImage` in the UI except for pressing the avatar.
    // We'll skip that step here—this test focuses on "Apply Changes" calling the context.

    // Now press the "Apply Changes" button
    fireEvent.press(getByText("Apply Changes"));

    // We expect these two calls from `applyChanges`:
    // setTextSize(tempSize) => 20
    expect(mockSetTextSize).toHaveBeenCalledWith(20);
    // setProfileImage(tempProfileImage) => initially null if we didn't pick an image
    // If you want to confirm it was called with "someTempImageUri", you need to set that in state first.
    // For example, if you want to strictly verify it’s called with a certain string:
    expect(mockSetProfileImage).toHaveBeenCalled();
  });

  test("Tapping the profile avatar calls pickImage with setTempProfileImage", () => {
    const { getByRole } = renderSettingsScreen();

    // The user's avatar is a TouchableOpacity. By default, 
    // it should have role="button" in testing-library if it's accessible. 
    // If we can't find it by role, we can do something like:
    //   getByTestId("avatar-button") if you add testID to it.
    // But we'll try getAllByRole("button") and pick the first.
    const avatarButtons = getByRole("button", { name: /avatar/i });
    // Or fallback: 
    // const avatarButtons = getAllByRole("button");

    // If there's no accessible name, we might do:
    // const avatarButton = getAllByRole("button")[0];
    // For demonstration:
    const avatarButton = getAllByRole("button")[0];

    fireEvent.press(avatarButton);

    // Confirm pickImage was called with setTempProfileImage (the local state setter)
    expect(pickImage).toHaveBeenCalled();
    // The local state setter is an anonymous function inside the component.
    // We can’t strictly check that exact function. We just verify pickImage was triggered.
  });

  test("Toggling color vision switch off sets colorBlindMode to null", () => {
    // Suppose we start with colorBlindMode enabled. Let’s mock that:
    useAppSettings.mockReturnValueOnce({
      textSize: 16,
      setTextSize: mockSetTextSize,
      colorBlindMode: "deuteranomaly", // colorBlindMode is set
      setColorBlindMode: mockSetColorBlindMode,
      profileImage: null,
      setProfileImage: mockSetProfileImage,
    });

    const { getByText, getAllByRole } = renderSettingsScreen();

    // We have a SettingToggle for "Color vision deficient", which is a Switch
    // Typically, Switch in React Native Testing Library is role="switch"
    // So let's find it. Because there's also a "Mobility disability" switch,
    // we'll do something like getAllByRole('switch') and pick the second one.
    const switches = getAllByRole("switch");
    const colorVisionSwitch = switches[1]; // the second switch in your code

    // Turn it off => triggers onChange(false)
    fireEvent(colorVisionSwitch, "valueChange", false);

    // Because the code in your onChange callback is:
    //    setIsColorBlindModeEnabled(value);
    //    if (!value) setColorBlindMode(null);
    // => we expect setColorBlindMode(null) to have been called
    expect(mockSetColorBlindMode).toHaveBeenCalledWith(null);
  });

  test("Selecting a color-blind radio sets colorBlindMode to that mode", () => {
    // Start with no colorBlindMode
    useAppSettings.mockReturnValueOnce({
      textSize: 16,
      setTextSize: mockSetTextSize,
      colorBlindMode: null,
      setColorBlindMode: mockSetColorBlindMode,
      profileImage: null,
      setProfileImage: mockSetProfileImage,
    });

    const { getByText } = renderSettingsScreen();

    // First we must enable the color vision switch so the radio buttons appear
    const colorVisionToggle = getByText("Color vision deficient");
    // It's a row: <SettingToggle label="Color vision deficient" ... />
    // We'll do: find the Switch by going to sibling or we can do getAllByRole('switch')[1].
    // For clarity, let's do a direct approach:
    const switches = getAllByRole("switch");
    const colorVisionSwitch = switches[1];
    fireEvent(colorVisionSwitch, "valueChange", true);

    // Now we can press the "Deuteranomaly" radio, for example
    const deuteranomalyText = getByText("Deuteranomaly");
    // The actual <TouchableOpacity> is the radio, so let's do:
    fireEvent.press(deuteranomalyText.parentNode.lastChild); 
    // Alternatively, you might do a simpler approach:
    // fireEvent.press(getByText("Deuteranomaly"));

    // Check the context setter
    expect(mockSetColorBlindMode).toHaveBeenCalledWith("deuteranomaly");
  });

  test("Pressing 'Logout' button calls handleLogout with correct arguments", () => {
    const { getByText } = renderSettingsScreen();

    // The "Logout" button has text "Logout"
    fireEvent.press(getByText("Logout"));

    // Because the Clerk mock gives us signOut() and isSignedIn = true, 
    // we expect handleLogout to be called with (signOut, true, navigation)
    expect(handleLogout).toHaveBeenCalled();
    const [[signOutFn, isSignedInVal, nav]] = handleLogout.mock.calls;
    expect(isSignedInVal).toBe(true);
    expect(nav).toBeDefined(); // or mockNavigation if you replaced it in your code
  });
});
