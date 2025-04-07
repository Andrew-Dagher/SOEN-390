/**
 * @file App.test.jsx
 * @description Tests for the App component to ensure it renders correctly and initializes services.
 */

import React from "react";
import { render, act, screen } from "@testing-library/react-native";
import App from "../app/App";
import busService from "../app/services/BusService";
import Aptabase from "@aptabase/react-native";

// Mock dependencies
jest.mock("../app/services/BusService", () => ({
  start: jest.fn(),
  stop: jest.fn(),
}));

jest.mock("@aptabase/react-native", () => ({
  init: jest.fn(),
}));

jest.mock("../app/AppSettingsContext", () => ({
  AppSettingsProvider: ({ children }) => children,
}));

jest.mock("@clerk/clerk-expo", () => ({
  ClerkProvider: ({ children }) => children,
  ClerkLoaded: ({ children }) => children,
  useAuth: () => ({ isSignedIn: false }),
}));

jest.mock("@react-navigation/native", () => ({
  NavigationContainer: ({ children }) => children,
}));

jest.mock("@react-navigation/native-stack", () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock all screen components
jest.mock("../app/screens/home/HomeScreen", () => "HomeScreen");
jest.mock("../app/screens/calendar/CalendarScreen", () => "CalendarScreen");
jest.mock(
  "../app/screens/navigation/NavigationScreen",
  () => "NavigationScreen"
);
jest.mock("../app/screens/login/LoginScreen", () => "LoginScreen");
jest.mock("../app/screens/settings/settingsScreen", () => "SettingsScreen");
jest.mock("../app/screens/Info/BuildingInfoScreen", () => "BuildingInfoScreen");

// Set environment variables for testing
beforeEach(() => {
  process.env.EXPO_PUBLIC_APTABASE_KEY = "test-api-key";
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = "test-clerk-key";
});

afterEach(() => {
  delete process.env.EXPO_PUBLIC_APTABASE_KEY;
  delete process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
});

describe("App Component", () => {
  test("renders without crashing", () => {
    const { getByText } = render(<App />);
    expect(getByText("LoginScreen")).toBeTruthy();
  });

  test("initializes Aptabase with the correct API key", () => {
    render(<App />);
    expect(Aptabase.init).toHaveBeenCalledWith("test-api-key");
  });

  test("starts the bus service on mount", () => {
    render(<App />);
    expect(busService.start).toHaveBeenCalled();
  });

  test("stops the bus service on unmount", () => {
    const { unmount } = render(<App />);

    act(() => {
      unmount();
    });

    expect(busService.stop).toHaveBeenCalled();
  });

  test("does not initialize Aptabase if API key is missing", () => {
    delete process.env.EXPO_PUBLIC_APTABASE_KEY;
    Aptabase.init.mockClear();

    render(<App />);

    expect(Aptabase.init).not.toHaveBeenCalled();
  });

  test("sets up the navigation container with screens", () => {
    const { getByText } = render(<App />);

    // Check that all screens are included
    expect(getByText("HomeScreen")).toBeTruthy();
    expect(getByText("CalendarScreen")).toBeTruthy();
    expect(getByText("NavigationScreen")).toBeTruthy();
    expect(getByText("SettingsScreen")).toBeTruthy();
    expect(getByText("BuildingInfoScreen")).toBeTruthy();
    expect(getByText("LoginScreen")).toBeTruthy();
  });

  test('renders header element', () => {
    render(<App />);
    const headerElement = screen.getByRole('banner');
    expect(headerElement).toBeInTheDocument();
  });

  test('renders Map component', () => {
    render(<App />);
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toBeInTheDocument();
  });
});
