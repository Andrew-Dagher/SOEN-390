import React from "react";
import { render } from "@testing-library/react-native";
import PoiMarker from "../app/components/navigation/POIs/POIMarker";
import { poiTypes } from "../app/services/PoiService";

// Mock react-native-maps module since it's not compatible with Jest
jest.mock("react-native-maps", () => {
  const React = require("react");
  const { View } = require("react-native");
  
  const MockMarker = ({ children, onPress }) => {
    return (
      <View testID="mock-marker" onPress={onPress}>
        {children}
      </View>
    );
  };
  
  const MockCallout = ({ children, tooltip }) => {
    return (
      <View testID="mock-callout" tooltip={tooltip}>
        {children}
      </View>
    );
  };
  
  return {
    Marker: MockMarker,
    Callout: MockCallout,
  };
});

describe("PoiMarker Component", () => {
  // Sample POI data for tests
  const mockPoi = {
    name: "Test Location",
    poiType: "restaurant",
    geometry: {
      location: {
        lat: 37.7749,
        lng: -122.4194,
      },
    },
    vicinity: "123 Test Street",
    rating: 4.5,
    user_ratings_total: 100,
    opening_hours: {
      open_now: true,
    },
  };

  const defaultProps = {
    poi: mockPoi,
    selectedPoiType: "restaurant",
    onPress: jest.fn(),
    textSize: 14,
  };

  it("renders the marker with correct POI information", () => {
    const { getByText, getByTestId } = render(<PoiMarker {...defaultProps} />);
    
    // Check if marker renders
    expect(getByTestId("mock-marker")).toBeTruthy();
    
    // Check if POI name is displayed
    expect(getByText("Test Location")).toBeTruthy();
    
    // Check if vicinity is displayed
    expect(getByText("123 Test Street")).toBeTruthy();
    
    // Check if rating is displayed
    expect(getByText("4.5")).toBeTruthy();
    
    // Check if open status is displayed
    expect(getByText("Open Now")).toBeTruthy();
  });

  it("uses the POI's type when available", () => {
    const { getByText } = render(<PoiMarker {...defaultProps} />);
    
    // Get the restaurant label from poiTypes
    const restaurantLabel = poiTypes.find(
      type => type.value === "restaurant"
    )?.label || "Restaurant";
    
    // Check if the restaurant type label is displayed
    expect(getByText(restaurantLabel)).toBeTruthy();
  });

  it("falls back to selectedPoiType when POI has no type", () => {
    // Create a POI without a type
    const poiWithoutType = {
      ...mockPoi,
      poiType: undefined,
    };
    
    const { getByText } = render(
      <PoiMarker 
        {...defaultProps} 
        poi={poiWithoutType} 
        selectedPoiType="cafe" 
      />
    );
    
    // Get the cafe label from poiTypes
    const cafeLabel = poiTypes.find(
      type => type.value === "cafe"
    )?.label || "Cafe";
    
    // Check if the cafe type label is displayed
    expect(getByText(cafeLabel)).toBeTruthy();
  });

  it("displays closed status when POI is closed", () => {
    // Create a POI that is closed
    const closedPoi = {
      ...mockPoi,
      opening_hours: {
        open_now: false,
      },
    };
    
    const { getByText } = render(
      <PoiMarker {...defaultProps} poi={closedPoi} />
    );
    
    // Check if closed status is displayed
    expect(getByText("Closed")).toBeTruthy();
  });

  it("calls onPress handler when marker is pressed", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <PoiMarker {...defaultProps} onPress={onPress} />
    );
    
    // Trigger press on marker
    const marker = getByTestId("mock-marker");
    marker.props.onPress();
    
    // Check if onPress was called with the POI
    expect(onPress).toHaveBeenCalledWith(mockPoi);
  });

  it("handles POIs without optional fields", () => {
    // Create a minimal POI without optional fields
    const minimalPoi = {
      name: "Minimal Location",
      geometry: {
        location: {
          lat: 37.7749,
          lng: -122.4194,
        },
      },
    };
    
    const { getByText, queryByText } = render(
      <PoiMarker 
        {...defaultProps} 
        poi={minimalPoi} 
        selectedPoiType="grocery_or_supermarket" 
      />
    );
    
    // Check if name is displayed
    expect(getByText("Minimal Location")).toBeTruthy();
    
    // These fields should not be present
    expect(queryByText("Open Now")).toBeNull();
    expect(queryByText("Closed")).toBeNull();
    
    // Get the grocery label from poiTypes
    const groceryLabel = poiTypes.find(
      type => type.value === "grocery_or_supermarket"
    )?.label || "Grocery Store";
    
    // Check if the type is still displayed using selectedPoiType
    expect(getByText(groceryLabel)).toBeTruthy();
  });
});