// ---------------------------------------------------------------------------
// Mock the AppSettingsContext so that useAppSettings always returns { colorBlindMode: false }
// This is used to simulate application settings in tests.
jest.mock("../app/AppSettingsContext", () => ({
  useAppSettings: () => ({ colorBlindMode: false }),
}));

// ---------------------------------------------------------------------------
// Mock the expo-location module with dummy implementations for its methods.
// This avoids actual location requests during tests.
jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

// ---------------------------------------------------------------------------
// Import React and the required methods from the testing library
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

// Import the components to be tested
import MapLocation from "../app/components/navigation/MapLocation";
import LocationIcon from "../app/components/navigation/Icons/LocationIcon";

// ---------------------------------------------------------------------------
// Test suite for the LocationIcon component
describe("LocationIcon Component", () => {
  it("renders correctly", () => {
    // Render the LocationIcon component
    const { getByTestId } = render(<LocationIcon />);
    // Verify that the element with testID "location-icon" exists in the rendered output
    expect(getByTestId("location-icon")).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Test suite for the MapLocation component
describe("MapLocation Component", () => {
  // Declare variables to hold the mock functions for component callbacks
  let panToMyLocation, setLocation;

  // Before each test, initialize the mock functions to ensure a fresh state
  beforeEach(() => {
    panToMyLocation = jest.fn();
    setLocation = jest.fn();
  });

  // Test to verify that the MapLocation component renders correctly
  it("renders correctly", () => {
    // Render the MapLocation component with the mocked callback functions
    const { getByTestId } = render(
      <MapLocation panToMyLocation={panToMyLocation} setLocation={setLocation} />
    );
    // Expect that the button with testID "map-location-button" is rendered
    expect(getByTestId("map-location-button")).toBeTruthy();
  });

  // Test to verify that the panToMyLocation callback is called when the button is pressed
  it("calls panToMyLocation when the button is pressed", () => {
    // Render the MapLocation component with the mocked callback functions
    const { getByTestId } = render(
      <MapLocation panToMyLocation={panToMyLocation} setLocation={setLocation} />
    );
    // Retrieve the button using its testID
    const button = getByTestId("map-location-button");
    // Simulate a press event on the button
    fireEvent.press(button);
    // Assert that the panToMyLocation function was called as a result of the button press
    expect(panToMyLocation).toHaveBeenCalled();
  });
});
