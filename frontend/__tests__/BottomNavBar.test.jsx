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

/**
 * Instead of referencing Text at the top level, we import it within each jest.mock factory.
 * This prevents the "out-of-scope variables" error in Jest.
 */
jest.mock("../app/components/BottomNavBar/HomeIcons/HomeActive", () => {
  return () => {
    const { Text } = require("react-native");
    return <Text>HomeActive</Text>;
  };
});
jest.mock("../app/components/BottomNavBar/HomeIcons/HomeInactive", () => {
  return () => {
    const { Text } = require("react-native");
    return <Text>HomeInactive</Text>;
  };
});
jest.mock("../app/components/BottomNavBar/CalendarIcons/CalendarActive", () => {
  return () => {
    const { Text } = require("react-native");
    return <Text>CalendarActive</Text>;
  };
});
jest.mock("../app/components/BottomNavBar/CalendarIcons/CalendarInactive", () => {
  return () => {
    const { Text } = require("react-native");
    return <Text>CalendarInactive</Text>;
  };
});
jest.mock("../app/components/BottomNavBar/NavigationIcons/NavigationActive", () => {
  return () => {
    const { Text } = require("react-native");
    return <Text>NavigationActive</Text>;
  };
});
jest.mock("../app/components/BottomNavBar/NavigationIcons/NavigationInactive", () => {
  return () => {
    const { Text } = require("react-native");
    return <Text>NavigationInactive</Text>;
  };
});
jest.mock("../app/components/BottomNavBar/SettingsIcons/SettingsActive", () => {
  return () => {
    const { Text } = require("react-native");
    return <Text>SettingsActive</Text>;
  };
});
jest.mock("../app/components/BottomNavBar/SettingsIcons/SettingsInactive", () => {
  return () => {
    const { Text } = require("react-native");
    return <Text>SettingsInactive</Text>;
  };
});

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

  /**
   * EXTRA TEST #1:
   * Covers the "if (navigation) { ... } else { console.warn(...) }" branch
   * by not passing a navigation prop, so it will fallback to console.warn.
   */
  test("warns when navigation is not available in this context", () => {
    const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    // Provide NO navigation or route props:
    // This triggers the else clause in 'navigateTo'.
    const { getByText } = render(
      <AppSettingsProvider>
        <BottomNavBar />
      </AppSettingsProvider>
    );

    fireEvent.press(getByText("HomeInactive"));

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Navigation is not available in this context"
    );

    consoleWarnSpy.mockRestore();
  });

  /**
   * EXTRA TEST #2:
   * Covers the "Only navigate if we're not already on that screen" condition.
   * i.e., currentScreen === screenName, so it doesn't call navigate().
   */
  test("does not call navigation if current screen is the same as pressed screen", () => {
    const localNav = { navigate: jest.fn() };
    const localRoute = { name: "Home" }; // The current screen is "Home"

    const { getByText } = render(
      <AppSettingsProvider>
        {/* Provide the component with explicit navigation and route */}
        <BottomNavBar navigation={localNav} route={localRoute} />
      </AppSettingsProvider>
    );

    // Because the route is "Home", we get "HomeActive" for that button
    const homeButton = getByText("HomeActive");
    fireEvent.press(homeButton);

    // We expect NOT to call navigation, because we're already on Home
    expect(localNav.navigate).not.toHaveBeenCalled();
  });
});
