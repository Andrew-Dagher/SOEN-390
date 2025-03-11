/**
 * @file SettingsScreen.test.jsx
 * @description Tests the SettingsScreen component to ensure that it renders correctly
 * with the provided context and navigation. Mocks Clerk authentication and BottomNavBar to
 * prevent route errors during testing. Additionally, tests utility functions in settingsUtils.js.
 */

import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import SettingsScreen from "../app/screens/settings/settingsScreen";
import { AppSettingsProvider } from "../app/AppSettingsContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { loadUserData, pickImage, handleLogout } from "../app/settingsUtils";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock ImagePicker
jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: "images" },
}));

// Mock Clerk's useAuth hook to simulate an authenticated user.
jest.mock("@clerk/clerk-expo", () => ({
  useAuth: () => ({
    isSignedIn: true,
    signOut: jest.fn(),
  }),
  ClerkProvider: ({ children }) => <>{children}</>,
}));

// Mock BottomNavBar to prevent useRoute errors during tests.
jest.mock("../app/components/BottomNavBar/BottomNavBar", () => "BottomNavBar");

/**
 * Test suite for the <SettingsScreen /> component.
 */
describe("<SettingsScreen />", () => {
  /**
   * Verifies that the SettingsScreen component renders without errors.
   */
  test("Text renders correctly on Settings Screen", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <AppSettingsProvider>
          <SettingsScreen />
        </AppSettingsProvider>
      </NavigationContainer>
    );

    // Retrieve the SettingsScreen component using its testID.
    const viewComponent = getByTestId("settings-screen");

    // Assert that the SettingsScreen component is rendered.
    expect(viewComponent).toBeTruthy();
  });
});

/**
 * Test suite for settingsUtils.js functions.
 */
describe("settingsUtils.js functions", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset mocks before each test
  });

  /**
   * Tests that loadUserData correctly loads user data from AsyncStorage.
   */
  test("loadUserData loads user data from AsyncStorage", async () => {
    const setUserNameMock = jest.fn();
    const setProfileImageMock = jest.fn();
    
    AsyncStorage.getItem.mockResolvedValueOnce(
      JSON.stringify({ fullName: "John Doe", imageUrl: "https://example.com/avatar.jpg" })
    );

    await loadUserData(setUserNameMock, setProfileImageMock);

    expect(AsyncStorage.getItem).toHaveBeenCalledWith("userData");
    expect(setUserNameMock).toHaveBeenCalledWith("John Doe");
    expect(setProfileImageMock).toHaveBeenCalledWith("https://example.com/avatar.jpg");
  });

  /**
   * Tests that pickImage correctly sets a profile image when an image is selected.
   */
  test("pickImage sets profile image when image is selected", async () => {
    const setTempProfileImageMock = jest.fn();

    // Mock ImagePicker response
    ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: "https://example.com/image.jpg" }],
    });

    await pickImage(setTempProfileImageMock);

    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
    expect(setTempProfileImageMock).toHaveBeenCalledWith("https://example.com/image.jpg");
  });

  /**
   * Tests that pickImage does nothing if the user cancels image selection.
   */
  test("pickImage does nothing if image selection is canceled", async () => {
    const setTempProfileImageMock = jest.fn();

    ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({ canceled: true });

    await pickImage(setTempProfileImageMock);

    expect(setTempProfileImageMock).not.toHaveBeenCalled();
  });

  /**
   * Tests that handleLogout clears AsyncStorage and calls signOut when logged in.
   */
  test("handleLogout clears AsyncStorage and calls signOut", async () => {
    const signOutMock = jest.fn();
    const navigationMock = { reset: jest.fn() };

    await handleLogout(signOutMock, true, navigationMock);

    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(["sessionId", "userData", "guestMode"]);
    expect(signOutMock).toHaveBeenCalled();
    expect(navigationMock.reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: "Login" }] });
  });

  /**
   * Tests that handleLogout clears AsyncStorage but does not call signOut when not logged in.
   */
  test("handleLogout clears AsyncStorage but does not call signOut when user is not signed in", async () => {
    const signOutMock = jest.fn();
    const navigationMock = { reset: jest.fn() };

    await handleLogout(signOutMock, false, navigationMock);

    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(["sessionId", "userData", "guestMode"]);
    expect(signOutMock).not.toHaveBeenCalled();
    expect(navigationMock.reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: "Login" }] });
  });
});
