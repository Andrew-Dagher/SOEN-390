import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import MapTraceroute from "../app/components/navigation/MapTraceroute";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { findClosestPoint, IsAtSGW } from "../../screens/navigation/navigationUtils";
import "react-native-google-places-autocomplete";

// Mock the GooglePlacesAutocomplete component
jest.mock("react-native-google-places-autocomplete", () => ({
  GooglePlacesAutocomplete: jest.fn(() => <mock-autocomplete />),
}));

describe("navigationUtils functions", () => {
  describe("findClosestPoint", () => {
    it("returns the closest point based on the Haversine distance", () => {
      const reference = { latitude: 45.5, longitude: -73.6 };
      const points = [
        { lat: 45.5, lng: -73.55 },
        { lat: 45.55, lng: -73.65 },
        { lat: 45.49, lng: -73.59 },
      ];

      const closest = findClosestPoint(reference, points);
      expect(closest).toEqual({ lat: 45.49, lng: -73.59 });
    });

    it("returns null if points array is empty", () => {
      const reference = { latitude: 45.5, longitude: -73.6 };
      expect(findClosestPoint(reference, [])).toBeNull();
    });
  });

  describe("IsAtSGW", () => {
    it("returns true if closer to SGW", () => {
      const currentLocation = { latitude: SGWLocation.latitude + 0.001, longitude: SGWLocation.longitude + 0.001 };
      expect(IsAtSGW(currentLocation)).toBe(true);
    });

    it("returns false if closer to Loyola", () => {
      const currentLocation = { latitude: LoyolaLocation.latitude + 0.001, longitude: LoyolaLocation.longitude + 0.001 };
      expect(IsAtSGW(currentLocation)).toBe(false);
    });

    it("returns false for null or undefined input", () => {
      expect(IsAtSGW(null)).toBe(false);
      expect(IsAtSGW(undefined)).toBe(false);
    });
  });
});

describe("MapTraceroute", () => {
  const mockProps = {
    setMode: jest.fn(),
    waypoints: [],
    setWaypoints: jest.fn(),
    location: { latitude: 0, longitude: 0 },
    reset: jest.fn(),
    isRoute: false,
    setIsRoute: jest.fn(),
    setSelectedBuilding: jest.fn(),
    panToMyLocation: jest.fn(),
    panToRegion: jest.fn(),
    end: null,
    start: null,
    setEnd: jest.fn(),
    setStart: jest.fn(),
    setStartPosition: jest.fn(),
    setDestinationPosition: jest.fn(),
    closeTraceroute: false,
    setCloseTraceroute: jest.fn(),
    setIsSearch: jest.fn(),
    carTravelTime: "10 min",
    bikeTravelTime: "20 min",
    metroTravelTime: "30 min",
    walkTravelTime: "40 min",
  };

  it("renders GooglePlacesAutocomplete for origin and destination", () => {
    const { getByPlaceholderText } = render(<MapTraceroute {...mockProps} />);
    expect(GooglePlacesAutocomplete).toHaveBeenCalledTimes(2);
  });

  it("calls setStart and setStartPosition when origin place is selected", async () => {
    const mockDetails = {
      geometry: { location: { lat: 1, lng: 2 } },
      formatted_address: "Test Origin Address",
    };
    const { rerender } = render(<MapTraceroute {...mockProps} />);

    // Simulate GooglePlacesAutocomplete's onPress with mock details
    const onOriginPress = GooglePlacesAutocomplete.mock.calls[0][0].onPress;
    onOriginPress({ place_id: "test_place_id" }, mockDetails);

    expect(mockProps.setStart).toHaveBeenCalledWith({
      latitude: 1,
      longitude: 2,
    });
    expect(mockProps.setStartPosition).toHaveBeenCalledWith(
      "Test Origin Address"
    );
  });

  it("calls setEnd and setDestinationPosition when destination place is selected", async () => {
    const mockDetails = {
      geometry: { location: { lat: 3, lng: 4 } },
      formatted_address: "Test Destination Address",
    };

    render(<MapTraceroute {...mockProps} />);

    // Simulate GooglePlacesAutocomplete's onPress with mock details
    const onDestinationPress =
      GooglePlacesAutocomplete.mock.calls[1][0].onPress;
    onDestinationPress({ place_id: "test_place_id" }, mockDetails);

    expect(mockProps.setEnd).toHaveBeenCalledWith({
      latitude: 3,
      longitude: 4,
    });
    expect(mockProps.setDestinationPosition).toHaveBeenCalledWith(
      "Test Destination Address"
    );
  });

  it("handles shuttle integration correctly based on proximity to SGW or Loyola", () => {
    const { getByTestId } = render(<MapTraceroute {...mockProps} />);
    const carButton = getByTestId("car-button");
    fireEvent.press(carButton);

    expect(mockProps.setIsShuttle).toHaveBeenCalledWith(true);
  });

  it("calls setStart and setStartPosition when origin place is selected", () => {
    const mockDetails = {
      geometry: { location: { lat: 1, lng: 2 } },
      formatted_address: "Test Origin Address",
    };
    render(<MapTraceroute {...mockProps} />);
    const onOriginPress = GooglePlacesAutocomplete.mock.calls[0][0].onPress;
    onOriginPress({ place_id: "test_place_id" }, mockDetails);
    expect(mockProps.setStart).toHaveBeenCalledWith({ latitude: 1, longitude: 2 });
    expect(mockProps.setStartPosition).toHaveBeenCalledWith("Test Origin Address");
  });

});
