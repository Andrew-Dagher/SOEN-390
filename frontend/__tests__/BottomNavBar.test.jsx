/**
 * @file BottomNavBar.test.jsx
 * @description Tests the rendering of the BottomNavBar component and its navigation functionality.
 */

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BottomNavBar from "../app/components/BottomNavBar/BottomNavBar";
import { AppSettingsProvider } from "../app/AppSettingsContext";

// Create a native stack navigator for test navigation.
const Stack = createNativeStackNavigator();

// Mock all the icon components
jest.mock(
  "../app/components/BottomNavBar/HomeIcons/HomeActive",
  () => "HomeActive"
);
jest.mock(
  "../app/components/BottomNavBar/HomeIcons/HomeInactive",
  () => "HomeInactive"
);
jest.mock(
  "../app/components/BottomNavBar/CalendarIcons/CalendarActive",
  () => "CalendarActive"
);
jest.mock(
  "../app/components/BottomNavBar/CalendarIcons/CalendarInactive",
  () => "CalendarInactive"
);
jest.mock(
  "../app/components/BottomNavBar/NavigationIcons/NavigationActive",
  () => "NavigationActive"
);
jest.mock(
  "../app/components/BottomNavBar/NavigationIcons/NavigationInactive",
  () => "NavigationInactive"
);
jest.mock(
  "../app/components/BottomNavBar/SettingsIcons/SettingsActive",
  () => "SettingsActive"
);
jest.mock(
  "../app/components/BottomNavBar/SettingsIcons/SettingsInactive",
  () => "SettingsInactive"
);

// Mock navigation
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
    useRoute: () => ({
      name: "Home", // Default route for tests
    }),
  };
});

/**
 * Test suite for the <BottomNavBar /> component.
 */
describe("<BottomNavBar />", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  /**
   * Verifies that the BottomNavBar component renders correctly.
   */
  test("Bottom Nav Bar renders correctly", () => {
    const { getByTestId } = render(
      <AppSettingsProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={BottomNavBar} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppSettingsProvider>
    );

    // Retrieve the BottomNavBar component using its testID.
    const viewComponent = getByTestId("bottom-nav");

    // Assert that the component exists in the rendered output.
    expect(viewComponent).toBeTruthy();
  });

  /**
   * Tests that navigation is triggered when Home button is pressed
   */
  test("navigates to Home screen when Home button is pressed", () => {
    const { getByText } = render(
      <AppSettingsProvider>
        <NavigationContainer>
          <BottomNavBar />
        </NavigationContainer>
      </AppSettingsProvider>
    );

    // Press the Home button
    const homeButton = getByText("HomeInactive");
    fireEvent.press(homeButton);

    // Verify navigation was called with correct screen
    expect(mockNavigate).toHaveBeenCalledWith("Home");
  });

  /**
   * Tests that navigation is triggered when Calendar button is pressed
   */
  test("navigates to Calendar screen when Calendar button is pressed", () => {
    const { getByText } = render(
      <AppSettingsProvider>
        <NavigationContainer>
          <BottomNavBar />
        </NavigationContainer>
      </AppSettingsProvider>
    );

    // Press the Calendar button
    const calendarButton = getByText("CalendarInactive");
    fireEvent.press(calendarButton);

    // Verify navigation was called with correct screen
    expect(mockNavigate).toHaveBeenCalledWith("Calendar");
  });

  /**
   * Tests that navigation is triggered when Navigation button is pressed
   */
  test("navigates to Navigation screen when Navigation button is pressed", () => {
    const { getByText } = render(
      <AppSettingsProvider>
        <NavigationContainer>
          <BottomNavBar />
        </NavigationContainer>
      </AppSettingsProvider>
    );

    // Press the Navigation button
    const navigationButton = getByText("NavigationInactive");
    fireEvent.press(navigationButton);

    // Verify navigation was called with correct screen
    expect(mockNavigate).toHaveBeenCalledWith("Navigation");
  });

  /**
   * Tests that navigation is triggered when Settings button is pressed
   */
  test("navigates to Settings screen when Settings button is pressed", () => {
    const { getByText } = render(
      <AppSettingsProvider>
        <NavigationContainer>
          <BottomNavBar />
        </NavigationContainer>
      </AppSettingsProvider>
    );

    // Press the Settings button
    const settingsButton = getByText("SettingsInactive");
    fireEvent.press(settingsButton);

    // Verify navigation was called with correct screen
    expect(mockNavigate).toHaveBeenCalledWith("Settings");
  });

  /**
   * Tests that the correct active icons are shown based on the current route
   */
  test("shows active icons based on current route", () => {
    // Mock useRoute to return different routes
    jest
      .spyOn(require("@react-navigation/native"), "useRoute")
      .mockImplementation(() => ({
        name: "Calendar",
      }));

    const { getByText } = render(
      <AppSettingsProvider>
        <NavigationContainer>
          <BottomNavBar />
        </NavigationContainer>
      </AppSettingsProvider>
    );

    // Since we're on the Calendar route, it should show CalendarActive
    expect(getByText("CalendarActive")).toBeTruthy();
    expect(getByText("HomeInactive")).toBeTruthy();
    expect(getByText("NavigationInactive")).toBeTruthy();
    expect(getByText("SettingsInactive")).toBeTruthy();
  });
});
