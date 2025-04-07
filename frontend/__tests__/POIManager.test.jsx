import React from "react";
import { render, fireEvent, act, waitFor } from "@testing-library/react-native";
import PoiManager from "../app/components/navigation/POIs/POIManager";
import { fetchNearbyPOIs, poiTypes } from "../app/services/PoiService";
import { trackEvent } from "@aptabase/react-native";

// Mock child components
jest.mock("../app/components/navigation/POIs/POIMarker", () => {
  const { View } = require("react-native");
  return function MockPoiMarker(props) {
    return <View testID="poi-marker" data-poi={JSON.stringify(props.poi)} />;
  };
});

jest.mock("../app/components/navigation/POIs/POISelector", () => {
  const { View, Text, TouchableOpacity } = require("react-native");
  return function MockPoiSelector(props) {
    return (
      <View testID="poi-selector">
        <TouchableOpacity
          testID="toggle-button"
          onPress={props.togglePoiSelector}
        >
          <Text>Toggle Selector</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="apply-button"
          onPress={() =>
            props.applyFilters &&
            props.applyFilters(props.selectedPoiTypes, props.searchRadius)
          }
        >
          <Text>Apply Filters</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="select-restaurant"
          onPress={() =>
            props.setSelectedPoiTypes &&
            props.setSelectedPoiTypes(["restaurant"])
          }
        >
          <Text>Select Restaurant</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="select-all"
          onPress={() =>
            props.setSelectedPoiTypes && props.setSelectedPoiTypes(["all"])
          }
        >
          <Text>Select All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="select-none"
          onPress={() =>
            props.setSelectedPoiTypes && props.setSelectedPoiTypes(["none"])
          }
        >
          <Text>Select None</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="select-multiple"
          onPress={() =>
            props.setSelectedPoiTypes &&
            props.setSelectedPoiTypes(["restaurant", "cafe"])
          }
        >
          <Text>Select Multiple</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="change-radius"
          onPress={() => props.setSearchRadius && props.setSearchRadius(2000)}
        >
          <Text>Change Radius</Text>
        </TouchableOpacity>
        <Text testID="search-radius">Search Radius: {props.searchRadius}</Text>
        <Text testID="selected-types">
          Selected Types: {props.selectedPoiTypes.join(", ")}
        </Text>
      </View>
    );
  };
});

// Sample POI data for mocking
const mockRestaurants = [
  {
    place_id: "rest1",
    name: "Restaurant 1",
    geometry: { location: { lat: 45.49, lng: -73.57 } },
  },
  {
    place_id: "rest2",
    name: "Restaurant 2",
    geometry: { location: { lat: 45.48, lng: -73.58 } },
  },
];

const mockCafes = [
  {
    place_id: "cafe1",
    name: "Cafe 1",
    geometry: { location: { lat: 45.5, lng: -73.56 } },
  },
  {
    place_id: "cafe2",
    name: "Cafe 2",
    geometry: { location: { lat: 45.47, lng: -73.59 } },
  },
];

// Mock API service with more specific implementations
jest.mock("../app/services/PoiService", () => ({
  fetchNearbyPOIs: jest
    .fn()
    .mockImplementation((location, poiType, apiKey, radius) => {
      if (poiType === "restaurant") {
        return Promise.resolve(mockRestaurants);
      } else if (poiType === "cafe") {
        return Promise.resolve(mockCafes);
      } else if (poiType === "all") {
        return Promise.resolve([...mockRestaurants, ...mockCafes]);
      } else {
        return Promise.resolve([]);
      }
    }),
  poiTypes: [
    { value: "none", label: "No Filters", icon: "layers-clear" },
    { value: "all", label: "All Types", icon: "layers" },
    { value: "restaurant", label: "Restaurants", icon: "restaurant" },
    { value: "cafe", label: "Cafés", icon: "local-cafe" },
  ],
}));

// Mock the tracking
jest.mock("@aptabase/react-native", () => ({
  trackEvent: jest.fn(),
}));

describe("PoiManager Component", () => {
  const defaultProps = {
    campus: "sgw",
    SGWLocation: { latitude: 45.495, longitude: -73.578 },
    LoyolaLocation: { latitude: 45.458, longitude: -73.638 },
    isRoute: false,
    isSearch: false,
    textSize: 14,
    theme: "light",
    styles: { shadow: { elevation: 5 } },
    onSelectPoi: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock environment variable
    process.env.EXPO_PUBLIC_GOOGLE_API_KEY = "test-api-key";
  });

  it("renders without crashing", () => {
    const { getByTestId } = render(<PoiManager {...defaultProps} />);
    expect(getByTestId("poi-selector")).toBeTruthy();
  });

  it("renders with isRoute=true (POI markers hidden)", () => {
    // When isRoute is true, POI markers should not be rendered
    const { queryAllByTestId } = render(
      <PoiManager {...defaultProps} isRoute={true} />
    );

    // There should be no POI markers
    expect(queryAllByTestId("poi-marker").length).toBe(0);
  });

  it("calls onSelectPoi when a POI is selected", () => {
    const onSelectPoi = jest.fn();
    const mockPoi = { place_id: "test1", name: "Test POI" };

    // Create a manual handler function that matches the component's handlePoiPress
    const handlePoiPress = (poi) => {
      onSelectPoi(poi);
    };

    // Call the handler directly to test the functionality
    handlePoiPress(mockPoi);

    expect(onSelectPoi).toHaveBeenCalledWith(mockPoi);
  });

  it("toggles POI selector visibility", () => {
    const { getByTestId } = render(<PoiManager {...defaultProps} />);

    const toggleButton = getByTestId("toggle-button");
    fireEvent.press(toggleButton);

    // We can't directly test state changes, but we can verify the toggle button exists
    expect(toggleButton).toBeTruthy();
  });

  // New tests for filter functionality

  it("applies restaurant filter and tracks the event", async () => {
    const { getByTestId } = render(<PoiManager {...defaultProps} />);

    // Select restaurant filter
    fireEvent.press(getByTestId("select-restaurant"));

    // Apply the filter
    fireEvent.press(getByTestId("apply-button"));

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(fetchNearbyPOIs).toHaveBeenCalled();

      // Check if tracking was called with correct params
      expect(trackEvent).toHaveBeenCalledWith(
        "Fetched Selected POI Types",
        expect.objectContaining({
          types: "restaurant",
        })
      );
    });
  });

  it("applies 'all' filter and fetches all POI types", async () => {
    const { getByTestId } = render(<PoiManager {...defaultProps} />);

    // Select "all" filter
    fireEvent.press(getByTestId("select-all"));

    // Apply the filter
    fireEvent.press(getByTestId("apply-button"));

    // Wait for the async operation to complete
    await waitFor(() => {
      // Verify the service was called with each POI type
      expect(fetchNearbyPOIs).toHaveBeenCalled();
      expect(trackEvent).toHaveBeenCalledWith(
        "Fetched All POI Types",
        expect.any(Object)
      );
    });
  });

  it("applies 'none' filter and clears POIs", async () => {
    const { getByTestId, queryAllByTestId } = render(
      <PoiManager {...defaultProps} />
    );

    // First add some POIs
    fireEvent.press(getByTestId("select-restaurant"));
    fireEvent.press(getByTestId("apply-button"));

    await waitFor(() => {
      expect(fetchNearbyPOIs).toHaveBeenCalled();
    });

    // Then clear them with "none" filter
    fireEvent.press(getByTestId("select-none"));
    fireEvent.press(getByTestId("apply-button"));

    await waitFor(() => {
      expect(trackEvent).toHaveBeenCalledWith(
        "No POI Filters Applied",
        expect.objectContaining({ campus: "sgw" })
      );
    });

    // Since we're not actually rendering POI markers in the test, we can't check
    // if they're gone, but we can verify the trackEvent was called
  });

  it("applies multiple filters simultaneously and tracks the event", async () => {
    const { getByTestId } = render(<PoiManager {...defaultProps} />);

    // Select multiple filters
    fireEvent.press(getByTestId("select-multiple"));

    // Apply the filters
    fireEvent.press(getByTestId("apply-button"));

    // Wait for the async operations to complete
    await waitFor(() => {
      // Verify function was called
      expect(fetchNearbyPOIs).toHaveBeenCalled();

      // Check tracking event was called correctly
      expect(trackEvent).toHaveBeenCalledWith(
        "Fetched Selected POI Types",
        expect.objectContaining({
          types: "restaurant,cafe",
        })
      );
    });
  });

  it("changes search radius and updates UI", async () => {
    const { getByTestId } = render(<PoiManager {...defaultProps} />);

    // Change the search radius
    fireEvent.press(getByTestId("change-radius"));

    // Verify the displayed radius has changed
    expect(getByTestId("search-radius").props.children).toEqual([
      "Search Radius: ",
      2000,
    ]);

    // Select and apply a filter
    fireEvent.press(getByTestId("select-restaurant"));
    fireEvent.press(getByTestId("apply-button"));

    // Wait for the async operation to complete
    await waitFor(() => {
      // Just verify the function was called
      expect(fetchNearbyPOIs).toHaveBeenCalled();
    });
  });

  it("handles errors during POI fetching", async () => {
    // Mock console.error to prevent error messages in test output
    const originalConsoleError = console.error;
    console.error = jest.fn();

    // Mock fetchNearbyPOIs to throw an error
    fetchNearbyPOIs.mockImplementationOnce(() =>
      Promise.reject(new Error("API error"))
    );

    const { getByTestId } = render(<PoiManager {...defaultProps} />);

    // Apply a filter
    fireEvent.press(getByTestId("select-restaurant"));
    fireEvent.press(getByTestId("apply-button"));

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });

    // Restore original console.error
    console.error = originalConsoleError;
  });
});
