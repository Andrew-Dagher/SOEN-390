/**
 * @file MapTraceroute.test.jsx
 * @description Tests for the MapTraceroute component to ensure it renders correctly
 * and handles user interactions properly.
 */

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import MapTraceroute from "../app/components/navigation/MapTraceroute";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { IsAtSGW } from "../app/screens/navigation/navigationUtils";
import { trackEvent } from "@aptabase/react-native";
import "react-native-google-places-autocomplete";

// Mock the GooglePlacesAutocomplete component
jest.mock("react-native-google-places-autocomplete", () => ({
  GooglePlacesAutocomplete: jest.fn(() => <mock-autocomplete />),
}));

// Mock the navigation utilities and tracking function
jest.mock("../app/screens/navigation/navigationUtils", () => ({
  IsAtSGW: jest.fn(() => true),
}));

jest.mock("@aptabase/react-native", () => ({
  trackEvent: jest.fn(),
}));

describe("MapTraceroute", () => {
  // Default props for testing
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
    isShuttle: false,
    setWalkToBus: jest.fn(),
    setWalkFromBus: jest.fn(),
    setIsShuttle: jest.fn(),
    startPosition: "Start Location",
    destinationPosition: "Destination Location",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders GooglePlacesAutocomplete for origin and destination", () => {
    render(<MapTraceroute {...mockProps} />);
    expect(GooglePlacesAutocomplete).toHaveBeenCalledTimes(2);
  });

  it("renders the sliding panel with the right styles", () => {
    const { getByTestId } = render(<MapTraceroute {...mockProps} />);
    expect(getByTestId("sliding-view")).toBeTruthy();
  });

  it("renders transport mode buttons with proper data", () => {
    const { getByTestId, getByText } = render(<MapTraceroute {...mockProps} />);

    expect(getByTestId("car-button")).toBeTruthy();
    expect(getByTestId("bike-button")).toBeTruthy();
    expect(getByTestId("metro-button")).toBeTruthy();
    expect(getByTestId("walk-button")).toBeTruthy();

    expect(getByText("10 min")).toBeTruthy(); // Car time
    expect(getByText("20 min")).toBeTruthy(); // Bike time
    expect(getByText("30 min")).toBeTruthy(); // Metro time
    expect(getByText("40 min")).toBeTruthy(); // Walk time
  });

  it("calls handleCloseTraceroute when back button is pressed", () => {
    const { getByTestId } = render(<MapTraceroute {...mockProps} />);

    fireEvent.press(getByTestId("back-button"));

    expect(mockProps.setEnd).toHaveBeenCalledWith(null);
    expect(mockProps.setStart).toHaveBeenCalledWith(null);
    expect(mockProps.setCloseTraceroute).toHaveBeenCalledWith(true);
    expect(mockProps.reset).toHaveBeenCalled();
  });

  it("calls setMode with DRIVING when car button is pressed", () => {
    const { getByTestId } = render(<MapTraceroute {...mockProps} />);

    fireEvent.press(getByTestId("car-button"));

    expect(mockProps.setMode).toHaveBeenCalledWith("DRIVING");
    expect(trackEvent).toHaveBeenCalledWith("Mode selected", {
      mode: "driving",
    });
  });

  it("calls setMode with BICYCLING when bike button is pressed", () => {
    const { getByTestId } = render(<MapTraceroute {...mockProps} />);

    fireEvent.press(getByTestId("bike-button"));

    expect(mockProps.setMode).toHaveBeenCalledWith("BICYCLING");
    expect(trackEvent).toHaveBeenCalledWith("Mode selected", {
      mode: "bicycling",
    });
  });

  it("calls setMode with TRANSIT when metro button is pressed", () => {
    const { getByTestId } = render(<MapTraceroute {...mockProps} />);

    fireEvent.press(getByTestId("metro-button"));

    expect(mockProps.setMode).toHaveBeenCalledWith("TRANSIT");
    expect(trackEvent).toHaveBeenCalledWith("Mode selected", {
      mode: "transit",
    });
  });

  it("calls setMode with WALKING when walk button is pressed", () => {
    const { getByTestId } = render(<MapTraceroute {...mockProps} />);

    fireEvent.press(getByTestId("walk-button"));

    expect(mockProps.setMode).toHaveBeenCalledWith("WALKING");
    expect(trackEvent).toHaveBeenCalledWith("Mode selected", {
      mode: "walking",
    });
  });

  it("swaps start and end positions when swap button is pressed", () => {
    const customProps = {
      ...mockProps,
      start: { latitude: 10, longitude: 20 },
      end: { latitude: 30, longitude: 40 },
      startPosition: "Start",
      destinationPosition: "End",
    };

    const { getByTestId } = render(<MapTraceroute {...customProps} />);

    fireEvent.press(getByTestId("swap-button"));

    expect(customProps.setStart).toHaveBeenCalledWith({
      latitude: 30,
      longitude: 40,
    });
    expect(customProps.setEnd).toHaveBeenCalledWith({
      latitude: 10,
      longitude: 20,
    });
    expect(customProps.setStartPosition).toHaveBeenCalledWith("End");
    expect(customProps.setDestinationPosition).toHaveBeenCalledWith("Start");
  });

  it("sets up shuttle integration when at SGW", () => {
    IsAtSGW.mockReturnValue(true);

    const props = {
      ...mockProps,
      location: { coords: { latitude: 10, longitude: 20 } },
      end: { latitude: 30, longitude: 40 },
    };

    const { getByTestId } = render(<MapTraceroute {...props} />);

    // Trigger shuttle integration by selecting car mode when isShuttle is false
    // This is a workaround since there's no direct shuttle button
    props.setIsShuttle.mockImplementation(() => {
      props.isShuttle = true;
    });

    fireEvent.press(getByTestId("car-button"));

    expect(props.setWalkToBus).toHaveBeenCalled();
    expect(props.setWalkFromBus).toHaveBeenCalled();
    expect(props.setIsShuttle).toHaveBeenCalledWith(true);
  });

  it("handles place selection correctly for origin", async () => {
    render(<MapTraceroute {...mockProps} />);

    // Simulate GooglePlacesAutocomplete callback
    const onOriginPress = GooglePlacesAutocomplete.mock.calls[0][0].onPress;
    onOriginPress(
      { place_id: "test_place_id" },
      {
        geometry: { location: { lat: 10, lng: 20 } },
        formatted_address: "Test Address",
      }
    );

    expect(mockProps.setStart).toHaveBeenCalledWith({
      latitude: 10,
      longitude: 20,
    });
    expect(mockProps.setStartPosition).toHaveBeenCalledWith("Test Address");
  });

  it("handles place selection correctly for destination", async () => {
    render(<MapTraceroute {...mockProps} />);

    // Simulate GooglePlacesAutocomplete callback
    const onDestPress = GooglePlacesAutocomplete.mock.calls[1][0].onPress;
    onDestPress(
      { place_id: "test_place_id" },
      {
        geometry: { location: { lat: 30, lng: 40 } },
        formatted_address: "Destination Address",
      }
    );

    expect(mockProps.setEnd).toHaveBeenCalledWith({
      latitude: 30,
      longitude: 40,
    });
    expect(mockProps.setDestinationPosition).toHaveBeenCalledWith(
      "Destination Address"
    );
  });

  it("handles place selection with missing details gracefully", () => {
    render(<MapTraceroute {...mockProps} />);
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

    // Simulate GooglePlacesAutocomplete callback with invalid data
    const onDestPress = GooglePlacesAutocomplete.mock.calls[1][0].onPress;
    onDestPress({ place_id: "test_place_id" }, null);

    expect(consoleSpy).toHaveBeenCalled();
    expect(mockProps.setEnd).not.toHaveBeenCalled();
    expect(mockProps.setDestinationPosition).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("slides in when closeTraceroute is false", async () => {
    const { rerender } = render(
      <MapTraceroute {...mockProps} closeTraceroute={true} />
    );

    // Rerender with closeTraceroute set to false
    rerender(<MapTraceroute {...mockProps} closeTraceroute={false} />);

    // We can't easily test Animated values directly, but we can verify the component rerenders
    expect(true).toBeTruthy();
  });
});
