import React from "react";
import { render } from "@testing-library/react-native";
import PoiManager from "../app/components/navigation/POIs/POIManager";

// Mock child components
jest.mock("../app/components/navigation/POIs/POIMarker", () => {
  const React = require("react");
  const { View } = require("react-native");
  return function MockPoiMarker() {
    return <View testID="poi-marker" />;
  };
});

jest.mock("../app/components/navigation/POIs/POISelector", () => {
  const React = require("react");
  const { View } = require("react-native");
  return function MockPoiSelector() {
    return <View testID="poi-selector" />;
  };
});

// Mock the service calls
jest.mock("../app/services/PoiService", () => ({
  fetchNearbyPOIs: jest.fn(() => Promise.resolve([])),
  poiTypes: [
    { value: "none", label: "No Filters", icon: "layers-clear" },
    { value: "all", label: "All Types", icon: "layers" },
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
    theme: { backgroundColor: "#800000" },
    styles: { shadow: { elevation: 5 } },
    onSelectPoi: jest.fn(),
  };

  it("renders without crashing", () => {
    // Suppress console errors during test
    const originalError = console.error;
    console.error = jest.fn();

    try {
      const { getByTestId } = render(<PoiManager {...defaultProps} />);
      expect(getByTestId("poi-selector")).toBeTruthy();
    } finally {
      console.error = originalError;
    }
  });
});
