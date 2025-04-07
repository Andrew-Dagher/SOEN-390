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
    place_id: "test_place_id_123",
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
    const restaurantLabel =
      poiTypes.find((type) => type.value === "restaurant")?.label ||
      "Restaurant";

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
    const cafeLabel =
      poiTypes.find((type) => type.value === "cafe")?.label || "Cafe";

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
    // Create a minimal POI without optional fields but with required place_id
    const minimalPoi = {
      name: "Minimal Location",
      place_id: "minimal_place_123",
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
    const groceryLabel =
      poiTypes.find((type) => type.value === "grocery_or_supermarket")?.label ||
      "Grocery Store";

    // Check if the type is still displayed using selectedPoiType
    expect(getByText(groceryLabel)).toBeTruthy();
  });

  it("renders the correct marker color based on POI type", () => {
    const { getByTestId } = render(<PoiMarker {...defaultProps} />);
    const markerIconContainer = getByTestId("marker-icon-container");
    expect(markerIconContainer.props.style.borderColor).toBe("#FF5252"); // Red for restaurant
  });

  it("renders the correct icon based on POI type", () => {
    const { getByTestId } = render(<PoiMarker {...defaultProps} />);
    const markerIcon = getByTestId("marker-icon-container").props.children;
    expect(markerIcon.props.name).toBe("restaurant");
  });

  // New tests for additional coverage

  it("renders with cafe POI type and correct colors", () => {
    const cafePoi = {
      ...mockPoi,
      poiType: "cafe",
    };

    const { getByTestId } = render(
      <PoiMarker {...defaultProps} poi={cafePoi} />
    );
    const markerIconContainer = getByTestId("marker-icon-container");
    expect(markerIconContainer.props.style.borderColor).toBe("#9C27B0"); // Purple for cafe
  });

  it("renders with library POI type and correct colors", () => {
    const libraryPoi = {
      ...mockPoi,
      poiType: "library",
    };

    const { getByTestId } = render(
      <PoiMarker {...defaultProps} poi={libraryPoi} />
    );
    const markerIconContainer = getByTestId("marker-icon-container");
    expect(markerIconContainer.props.style.borderColor).toBe("#3F51B5"); // Indigo for library
  });

  it("renders with parking POI type and correct colors", () => {
    const parkingPoi = {
      ...mockPoi,
      poiType: "parking",
    };

    const { getByTestId } = render(
      <PoiMarker {...defaultProps} poi={parkingPoi} />
    );
    const markerIconContainer = getByTestId("marker-icon-container");
    expect(markerIconContainer.props.style.borderColor).toBe("#2196F3"); // Blue for parking
  });

  it("renders with atm POI type and correct colors", () => {
    const atmPoi = {
      ...mockPoi,
      poiType: "atm",
    };

    const { getByTestId } = render(
      <PoiMarker {...defaultProps} poi={atmPoi} />
    );
    const markerIconContainer = getByTestId("marker-icon-container");
    expect(markerIconContainer.props.style.borderColor).toBe("#009688"); // Teal for atm
  });

  it("renders with pharmacy POI type and correct colors", () => {
    const pharmacyPoi = {
      ...mockPoi,
      poiType: "pharmacy",
    };

    const { getByTestId } = render(
      <PoiMarker {...defaultProps} poi={pharmacyPoi} />
    );
    const markerIconContainer = getByTestId("marker-icon-container");
    expect(markerIconContainer.props.style.borderColor).toBe("#4CAF50"); // Green for pharmacy
  });

  it("renders with bus_station POI type and correct colors", () => {
    const busPoi = {
      ...mockPoi,
      poiType: "bus_station",
    };

    const { getByTestId } = render(
      <PoiMarker {...defaultProps} poi={busPoi} />
    );
    const markerIconContainer = getByTestId("marker-icon-container");
    expect(markerIconContainer.props.style.borderColor).toBe("#FFC107"); // Amber for bus_station
  });

  it("renders with subway_station POI type and correct colors", () => {
    const subwayPoi = {
      ...mockPoi,
      poiType: "subway_station",
    };

    const { getByTestId } = render(
      <PoiMarker {...defaultProps} poi={subwayPoi} />
    );
    const markerIconContainer = getByTestId("marker-icon-container");
    expect(markerIconContainer.props.style.borderColor).toBe("#FF9800"); // Orange for subway_station
  });

  it("renders with lodging POI type and correct colors", () => {
    const lodgingPoi = {
      ...mockPoi,
      poiType: "lodging",
    };

    const { getByTestId } = render(
      <PoiMarker {...defaultProps} poi={lodgingPoi} />
    );
    const markerIconContainer = getByTestId("marker-icon-container");
    expect(markerIconContainer.props.style.borderColor).toBe("#607D8B"); // Blue Grey for lodging
  });

  it("renders with default color for unknown POI type", () => {
    const unknownPoi = {
      ...mockPoi,
      poiType: "unknown_type_not_in_switch",
    };

    const { getByTestId } = render(
      <PoiMarker {...defaultProps} poi={unknownPoi} />
    );
    const markerIconContainer = getByTestId("marker-icon-container");
    expect(markerIconContainer.props.style.borderColor).toBe("#862532"); // Concordia red (default)
  });

  it("falls back to default icon when POI type is unknown", () => {
    const unknownPoi = {
      ...mockPoi,
      poiType: "unknown_type",
    };

    const { getByTestId } = render(
      <PoiMarker {...defaultProps} poi={unknownPoi} />
    );
    const markerIcon = getByTestId("marker-icon-container").props.children;
    expect(markerIcon.props.name).toBe("place"); // Default icon
  });

  it("renders with custom text size", () => {
    const largerTextSize = 18;
    const { getByTestId } = render(
      <PoiMarker {...defaultProps} textSize={largerTextSize} />
    );
    const nameElement = getByTestId("poi-name");
    expect(nameElement.props.style.fontSize).toBe(largerTextSize);
  });

  it("displays rating count correctly", () => {
    const { getByTestId } = render(<PoiMarker {...defaultProps} />);
    const ratingCount = getByTestId("poi-rating-count");
    expect(ratingCount.props.children).toEqual(["(", 100, ")"]);
  });

  it("handles POIs with zero ratings count", () => {
    const poiWithZeroRatings = {
      ...mockPoi,
      rating: 4.5,
      user_ratings_total: 0,
    };

    const { getByTestId } = render(
      <PoiMarker {...defaultProps} poi={poiWithZeroRatings} />
    );
    const ratingCount = getByTestId("poi-rating-count");
    expect(ratingCount.props.children).toEqual(["(", 0, ")"]);
  });

  it("handles POIs with rating but no rating count", () => {
    const poiWithNoRatingCount = {
      ...mockPoi,
      rating: 4.5,
      user_ratings_total: undefined,
    };

    const { getByTestId } = render(
      <PoiMarker {...defaultProps} poi={poiWithNoRatingCount} />
    );
    const ratingCount = getByTestId("poi-rating-count");
    expect(ratingCount.props.children).toEqual(["(", 0, ")"]);
  });

  it("uses proper POI type label from poiTypes", () => {
    // Test for each POI type to ensure the label is correctly displayed
    poiTypes.forEach((type) => {
      if (type.value === "none" || type.value === "all") return; // Skip non-POI types

      const typedPoi = {
        ...mockPoi,
        poiType: type.value,
      };

      const { getByTestId } = render(
        <PoiMarker {...defaultProps} poi={typedPoi} />
      );
      const typeLabel = getByTestId("poi-type-label");
      expect(typeLabel.props.children).toBe(type.label);
    });
  });

  it("applies the default text size when not provided", () => {
    // Omitting textSize from props should use the default value (14)
    const propsWithoutTextSize = {
      ...defaultProps,
      textSize: undefined,
    };

    const { getByTestId } = render(<PoiMarker {...propsWithoutTextSize} />);
    const nameElement = getByTestId("poi-name");
    expect(nameElement.props.style.fontSize).toBe(14); // Default text size
  });
});
