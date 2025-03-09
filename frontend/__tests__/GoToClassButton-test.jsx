import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import GoToClassButton from "../app/components/calendar/GoToClassButton";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";

// ---- Mocks ----
jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));

jest.mock("expo-location", () => ({
  getCurrentPositionAsync: jest.fn(),
}));

describe("GoToClassButton", () => {
  let mockNavigate;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock navigation
    mockNavigate = jest.fn();
    useNavigation.mockReturnValue({ navigate: mockNavigate });
  });

  it("renders the Go to Class button correctly", () => {
    const { getByText } = render(<GoToClassButton locationString="SGW, Hall Building, 913" />);
    expect(getByText("Go to Class")).toBeTruthy();
  });

  it("pressing the button calls Location and navigates with correct params", async () => {
    // Mock location
    Location.getCurrentPositionAsync.mockResolvedValueOnce({
      coords: { latitude: 12.3456, longitude: 65.4321 },
    });

    const { getByText } = render(
      <GoToClassButton locationString="SGW, Hall Building, 913" />
    );

    fireEvent.press(getByText("Go to Class"));

    // Wait for any async logic to complete
    expect(Location.getCurrentPositionAsync).toHaveBeenCalledTimes(1);

    // Check we called navigate with the correct params
    expect(mockNavigate).toHaveBeenCalledWith("Navigation", {
      campus: "sgw",
      buildingName: "Hall Building",
      currentLocation: { latitude: 12.3456, longitude: 65.4321 },
    });
  });

  it("handles parsing error gracefully if locationString is invalid", async () => {
    Location.getCurrentPositionAsync.mockResolvedValueOnce({
      coords: { latitude: 12.3456, longitude: 65.4321 },
    });

    // Provide an invalid string or partial string
    const invalidString = "Not Enough Commas";
    const { getByText } = render(<GoToClassButton locationString={invalidString} />);

    fireEvent.press(getByText("Go to Class"));

    // We still call Location, but the parse might fail
    expect(Location.getCurrentPositionAsync).toHaveBeenCalledTimes(1);
    // Check that it attempts navigation, but the splitted location won't have 3 parts
    expect(mockNavigate).toHaveBeenCalledWith("Navigation", {
      campus: "not enough commas", // campus.toLowerCase().trim()
      buildingName: "",            // buildingName => undefined => "" if we do .replace calls
      currentLocation: { latitude: 12.3456, longitude: 65.4321 },
    });
  });
});
