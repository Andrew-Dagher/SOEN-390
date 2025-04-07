import React from "react";
import { render, act, waitFor } from "@testing-library/react-native";
import HomeScreen from "../app/screens/home/HomeScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { AppSettingsProvider } from "../app/AppSettingsContext";
import { Text } from "react-native"; // Import Text explicitly

// Use fake timers
jest.useFakeTimers();

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
}));

// Mock useNavigation
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

// Mock Coachmark component
const MockCoachmark = ({ message, visible, onHide, children }) => {
  if (!visible) return null;
  // Simulate onHide immediately in test environment
  if (onHide) setTimeout(() => onHide(), 0);
  return (
    <>
      <Text testID="coachmark-text">{message}</Text>
      {children}
    </>
  );
};

// Apply the mock
jest.mock("react-native-coachmark", () => ({
  Coachmark: jest.fn((props) => <MockCoachmark {...props} />),
}));

describe("HomeScreen", () => {
  beforeEach(() => {
    AsyncStorage.getItem.mockClear();
  });

  const renderComponent = () =>
    render(
      <AppSettingsProvider>
        <NavigationContainer>
          <HomeScreen />
        </NavigationContainer>
      </AppSettingsProvider>
    );

  it("loads user data from AsyncStorage and displays username", async () => {
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify({ fullName: "John Doe" }));

    const { getByText } = renderComponent();

    await act(async () => {
      jest.runAllTimers();
    });

    expect(getByText("John Doe")).toBeTruthy();
  });

  it("transitions coachmark from step 0 to step 1 after 1000ms delay", async () => {
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify({ fullName: "User" }));

    const { getByText, queryByText } = renderComponent();

    // Wait for step 0 coachmark
    await waitFor(() => {
      expect(
        getByText("Hey! Welcome to the step-by-step guide. This is your home screen.")
      ).toBeTruthy();
    }, { timeout: 2000 });

    // Advance timers for the transition
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    // Check step 1 coachmark and ensure step 0 is gone
    await waitFor(() => {
      expect(
        getByText("Tap here to find your next class location on the map!")
      ).toBeTruthy();
      expect(
        queryByText("Hey! Welcome to the step-by-step guide. This is your home screen.")
      ).toBeNull();
    }, { timeout: 2000 });
  });
});