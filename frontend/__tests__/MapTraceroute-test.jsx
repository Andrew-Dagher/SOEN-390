import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import MapTraceroute from "../app/components/navigation/MapTraceroute";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import "react-native-google-places-autocomplete";

// Mock the GooglePlacesAutocomplete component
jest.mock("react-native-google-places-autocomplete", () => ({
  GooglePlacesAutocomplete: jest.fn(() => <mock-autocomplete />),
}));

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
});
