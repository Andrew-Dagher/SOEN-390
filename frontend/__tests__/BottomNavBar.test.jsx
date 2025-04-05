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

// Create a native stack navigator for test navigation
const Stack = createNativeStackNavigator();

// Mock all icon components with proper scoping
jest.mock(
  "../app/components/BottomNavBar/HomeIcons/HomeActive",
  () => () => {
    const React = require("react");
    const { Text } = require("react-native");
    return <Text>HomeActive</Text>;
  }
);

jest.mock(
  "../app/components/BottomNavBar/HomeIcons/HomeInactive",
  () => () => {
    const React = require("react");
    const { Text } = require("react-native");
    return <Text>HomeInactive</Text>;
  }
);

jest.mock(
  "../app/components/BottomNavBar/CalendarIcons/CalendarActive",
  () => () => {
    const React = require("react");
    const { Text } = require("react-native");
    return <Text>CalendarActive</Text>;
  }
);

jest.mock(
  "../app/components/BottomNavBar/CalendarIcons/CalendarInactive",
  () => () => {
    const React = require("react");
    const { Text } = require("react-native");
    return <Text>CalendarInactive</Text>;
  }
);

jest.mock(
  "../app/components/BottomNavBar/NavigationIcons/NavigationActive",
  () => () => {
    const React = require("react");
    const { Text } = require("react-native");
    return <Text>NavigationActive</Text>;
  }
);

jest.mock(
  "../app/components/BottomNavBar/NavigationIcons/NavigationInactive",
  () => () => {
    const React = require("react");
    const { Text } = require("react-native");
    return <Text>NavigationInactive</Text>;
  }
);

jest.mock(
  "../app/components/BottomNavBar/SettingsIcons/SettingsActive",
  () => () => {
    const React = require("react");
    const { Text } = require("react-native");
    return <Text>SettingsActive</Text>;
  }
);

jest.mock(
  "../app/components/BottomNavBar/SettingsIcons/SettingsInactive",
  () => () => {
    const React = require("react");
    const { Text } = require("react-native");
    return <Text>SettingsInactive</Text>;
  }
);

jest.mock(
  "../app/components/BottomNavBar/IndoorIcons/IndoorActive",
  () => () => {
    const React = require("react");
    const { Text } = require("react-native");
    return <Text>IndoorActive</Text>;
  }
);

jest.mock(
  "../app/components/BottomNavBar/IndoorIcons/IndoorInactive",
  () => () => {
    const React = require("react");
    const { Text } = require("react-native");
    return <Text>IndoorInactive</Text>;
  }
);

// Mock navigation
import NavigationActive from "../app/components/BottomNavBar/NavigationIcons/NavigationActive";

describe("NavigationActive", () => {
  it("renders correctly", () => {
    const { toJSON } = render(<NavigationActive />);
    expect(toJSON()).toMatchSnapshot();
  });
});

const mockNavigate = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("<BottomNavBar />", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

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

    expect(getByTestId("bottom-nav")).toBeTruthy();
  });

  test("navigates to Home screen when Home button is pressed", () => {
    const { getByText } = render(
      <AppSettingsProvider>
        <NavigationContainer>
          <BottomNavBar />
        </NavigationContainer>
      </AppSettingsProvider>
    );

    fireEvent.press(getByText("HomeInactive"));
    expect(mockNavigate).toHaveBeenCalledWith("Home");
  });

  test("navigates to Calendar screen when Calendar button is pressed", () => {
    const { getByText } = render(
      <AppSettingsProvider>
        <NavigationContainer>
          <BottomNavBar />
        </NavigationContainer>
      </AppSettingsProvider>
    );

    fireEvent.press(getByText("CalendarInactive"));
    expect(mockNavigate).toHaveBeenCalledWith("Calendar");
  });

  test("navigates to Navigation screen when Navigation button is pressed", () => {
    const { getByText } = render(
      <AppSettingsProvider>
        <NavigationContainer>
          <BottomNavBar />
        </NavigationContainer>
      </AppSettingsProvider>
    );

    fireEvent.press(getByText("NavigationInactive"));
describe("BottomNavBar", () => {
  it("navigates to a different screen when a button is pressed", () => {
    const props = {
      navigation: { navigate: mockNavigate },
      route: { name: "Home" }, // currently on "Home"
    };

    const { UNSAFE_getAllByType } = render(<BottomNavBar {...props} />);

    const pressables = UNSAFE_getAllByType(require("react-native").Pressable);

    // Indexes: 0 - Home, 1 - Navigation, 2 - Calendar, 3 - Settings
    fireEvent.press(pressables[1]); // Navigation
    expect(mockNavigate).toHaveBeenCalledWith("Navigation");
  });

  test("navigates to Settings screen when Settings button is pressed", () => {
    const { getByText } = render(
      <AppSettingsProvider>
        <NavigationContainer>
          <BottomNavBar />
        </NavigationContainer>
      </AppSettingsProvider>
    );

    fireEvent.press(getByText("SettingsInactive"));
    expect(mockNavigate).toHaveBeenCalledWith("Settings");
  });

  it("shows warning when navigation is not available", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();

    const { UNSAFE_getAllByType } = render(<BottomNavBar route={{ name: "Settings" }} />);
    const pressables = UNSAFE_getAllByType(require("react-native").Pressable);

    fireEvent.press(pressables[0]); // Try to navigate to Home with no navigation prop
    expect(warnSpy).toHaveBeenCalledWith("Navigation is not available in this context");

    warnSpy.mockRestore();
  });
});