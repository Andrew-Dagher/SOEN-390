import React from "react";
import { render } from "@testing-library/react-native";
import MapPolygonHighlight, { isPointInPolygon } from "../app/components/navigation/MapPolygonHighlight";
import { Polygon } from "react-native-maps";
import { useAppSettings } from "../app/AppSettingsContext";

jest.mock("../app/AppSettingsContext", () => ({
  useAppSettings: jest.fn(),
}));

jest.mock("react-native-maps", () => ({
  Polygon: jest.fn(() => null),
}));

describe("MapPolygonHighlight", () => {
  const mockBuilding = {
    name: "Test Building",
    boundaries: [
      { latitude: 45.495, longitude: -73.578 },
      { latitude: 45.496, longitude: -73.578 },
      { latitude: 45.496, longitude: -73.579 },
      { latitude: 45.495, longitude: -73.579 },
    ],
  };

  const mockLocationInside = {
    coords: { latitude: 45.4955, longitude: -73.5785 },
  };

  const mockLocationOutside = {
    coords: { latitude: 45.497, longitude: -73.580 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders Polygon component", () => {
    useAppSettings.mockReturnValue({ colorBlindMode: "default" });

    render(<MapPolygonHighlight building={mockBuilding} location={mockLocationInside} />);
    expect(Polygon).toHaveBeenCalled();
  });

  test("correctly detects when a point is inside a polygon", () => {
    expect(isPointInPolygon(mockLocationInside.coords, mockBuilding.boundaries)).toBe(true);
  });

  test("correctly detects when a point is outside a polygon", () => {
    expect(isPointInPolygon(mockLocationOutside.coords, mockBuilding.boundaries)).toBe(false);
  });

  test("updates when theme changes", () => {
    // Initial theme
    useAppSettings.mockReturnValue({ colorBlindMode: "default" });

    const { rerender } = render(
      <MapPolygonHighlight building={mockBuilding} location={mockLocationInside} />
    );

    // Mock the theme change
    useAppSettings.mockReturnValue({ colorBlindMode: "protanomaly" });

    rerender(<MapPolygonHighlight building={mockBuilding} location={mockLocationInside} />);

    // Ensure the component re-renders with new theme settings
    expect(Polygon).toHaveBeenCalledTimes(2);
  });
});
