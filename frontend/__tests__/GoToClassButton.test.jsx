import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import GoToClassButton from "../app/components/calendar/GoToClassButton";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";

// Mock the navigation object
jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));

// Mock expo-location
jest.mock("expo-location", () => ({
  getCurrentPositionAsync: jest.fn(),
}));

describe("GoToClassButton", () => {
  const mockNavigate = jest.fn();

  beforeAll(() => {
    // Make sure useNavigation returns our mocked navigate function
    useNavigation.mockReturnValue({
      navigate: mockNavigate,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the button with correct text", () => {
    const { getByText } = render(<GoToClassButton locationString="FooCampus, BarBuilding, B123" />);
    expect(getByText("Go to Class")).toBeTruthy();
  });

  it("calls navigate with correct params when pressed and locationString is fully provided", async () => {
    // Mock current device location
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 12.345, longitude: 67.89 },
    });

    const { getByText } = render(<GoToClassButton locationString="FooCampus, BarBuilding, B123" />);
    const button = getByText("Go to Class");

    fireEvent.press(button);

    // Wait for any async calls to finish
    // (In testing-library/react-native, we can wait for all React updates)
    // But typically a waitFor might not even be needed if using a test environment with the flushPromises trick.
    // Just do so to ensure navigate is called.
    await new Promise(setImmediate);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("Navigation", {
      campus: "foocampus",
      buildingName: "BarBuilding",
      currentLocation: {
        latitude: 12.345,
        longitude: 67.89,
      },
    });
  });

  it("falls back to empty strings if locationString is missing parts", async () => {
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 10, longitude: 20 },
    });

    const { getByText } = render(<GoToClassButton locationString="OnlyCampus" />);
    fireEvent.press(getByText("Go to Class"));
    await new Promise(setImmediate);

    // "OnlyCampus" => parts[0] = 'OnlyCampus', parts[1] -> '', parts[2] -> ''
    expect(mockNavigate).toHaveBeenCalledWith("Navigation", {
      campus: "onlycampus",
      buildingName: "",
      currentLocation: {
        latitude: 10,
        longitude: 20,
      },
    });
  });

  it("handles errors in try/catch block gracefully", async () => {
    // Spy on console.error to check if it's called
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    // Force getCurrentPositionAsync to throw
    Location.getCurrentPositionAsync.mockRejectedValue(new Error("Location Error"));

    const { getByText } = render(<GoToClassButton locationString="FooCampus, BarBuilding" />);
    fireEvent.press(getByText("Go to Class"));
    await new Promise(setImmediate);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error fetching location or parsing location string:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});