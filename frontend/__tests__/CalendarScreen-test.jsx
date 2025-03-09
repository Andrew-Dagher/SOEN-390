import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import CalendarScreen from "../app/screens/calendar/CalendarScreen";
import GoToClassButton from "../app/components/Calendar/GoToClassButton";
import GoToLoginButton from "../app/components/Calendar/GoToLoginButton";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as CalendarHelper from "../app/screens/calendar/CalendarHelper";
import { fetchPublicCalendarEvents } from "../app/screens/login/LoginHelper";

// Mock react-native-gesture-handler
jest.mock("react-native-gesture-handler", () => {
  const { View, TouchableOpacity, FlatList } = require("react-native");
  return {
    GestureHandlerRootView: ({ children }) => <View>{children}</View>,
    PanGestureHandler: ({ children }) => <View>{children}</View>,
    TouchableOpacity: TouchableOpacity,
    FlatList: FlatList,
    RNGestureHandlerModule: {
      install: jest.fn(),
      attachGestureHandler: jest.fn(),
      createGestureHandler: jest.fn(),
      dropGestureHandler: jest.fn(),
      updateGestureHandler: jest.fn(),
      State: {},
      Directions: {},
    },
  };
});

// Mock react-native Image
jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native");
  return {
    ...RN,
    Image: ({ source, style, resizeMode }) => (
      <RN.View testID="mock-image" style={style} />
    ),
  };
});

// Mock geolocation (allow failure case)
global.navigator = global.navigator || {};
global.navigator.geolocation = {
  getCurrentPosition: jest.fn((success, error) => error(new Error("Geolocation failed"))),
};

// Mock additional components
jest.mock("../../components/BottomNavBar/BottomNavBar", () => () => (
  <View testID="bottom-nav-bar" />
));
jest.mock("../../components/InAppNotification", () => ({ visible, message }) =>
  visible ? <Text testID="notification">{message}</Text> : null
);

// Mock Navigation
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      reset: jest.fn(),
    }),
  };
});

jest.mock("@clerk/clerk-expo", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("../app/screens/calendar/CalendarHelper", () => ({
  handleGoToClass: jest.fn(),
}));

jest.mock("../app/screens/login/LoginHelper", () => ({
  fetchPublicCalendarEvents: jest.fn(),
}));

jest.mock("moment", () => () => ({
  format: () => "Mar 08",
  startOf: () => ({ toISOString: () => "2025-03-08T00:00:00Z" }),
  clone: () => ({
    add: () => ({ format: () => "Mar 17", toISOString: () => "2025-03-17T00:00:00Z" }),
    subtract: () => ({ format: () => "Feb 27" }),
  }),
}));

const mockEvents = [
  {
    id: "1",
    title: "Sample Event",
    description: "SGW, Hall Building, 913",
    start: { dateTime: "2025-03-10T10:00:00Z" },
    end: { dateTime: "2025-03-10T11:00:00Z" },
  },
];

const Stack = createStackNavigator();

describe("<CalendarScreen />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null); // Default: no stored data
  });

  test("renders GoToLoginButton when user is not signed in", () => {
    useAuth.mockReturnValue({ isSignedIn: false });

    const { getByText } = render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="CalendarScreen" component={CalendarScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );

    expect(getByText("Go to Login")).toBeTruthy();
  });

  test("renders calendar and events when user is signed in", async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    fetchPublicCalendarEvents.mockResolvedValue(mockEvents);
    AsyncStorage.getItem
      .mockResolvedValueOnce(JSON.stringify([{ id: "cal1", name: "Test Calendar" }])) // availableCalendars
      .mockResolvedValueOnce("cal1"); // selectedCalendar

    const { getByText } = render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="CalendarScreen" component={CalendarScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );

    expect(getByText("Google Calendar")).toBeTruthy();
    await waitFor(() => expect(getByText("Sample Event")).toBeTruthy());
  });
});

describe("<GoToClassButton />", () => {
  test("renders correctly and triggers navigation on press", async () => {
    // Assuming GoToClassButton logs an error but still calls handleGoToClass on failure
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const { getByText } = render(<GoToClassButton locationString="SGW, Hall Building, 913" />);

    const button = getByText("Go to Class");
    expect(button).toBeTruthy();

    fireEvent.press(button);
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching location or parsing location string:",
        expect.any(Error)
      );
      expect(CalendarHelper.handleGoToClass).toHaveBeenCalledWith("SGW, Hall Building, 913");
    });

    consoleErrorSpy.mockRestore();
  });
});

describe("<GoToLoginButton />", () => {
  test("renders correctly and calls onPress function when pressed", () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(<GoToLoginButton onPress={mockOnPress} />);

    const button = getByText("Go to Login");
    expect(button).toBeTruthy();

    fireEvent.press(button);
    expect(mockOnPress).toHaveBeenCalled();
  });
});