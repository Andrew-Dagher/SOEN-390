import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
// Fix the import path - adjust based on your project structure
import PoiSelector from "../app/components/navigation/POIs/POISelector";
import { poiTypes } from "../app/services/PoiService";

describe("PoiSelector Component", () => {
  // Default props for testing
  const defaultProps = {
    showPoiSelector: false,
    togglePoiSelector: jest.fn(),
    selectedPoiTypes: ["none"],
    setSelectedPoiTypes: jest.fn(),
    searchRadius: 1500,
    setSearchRadius: jest.fn(),
    theme: { backgroundColor: "#007AFF" },
    textSize: 16,
    styles: { shadow: { elevation: 5 } },
    applyFilters: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Simplified test cases
  it("renders the POI filter button", () => {
    const { getByTestId } = render(<PoiSelector {...defaultProps} />);
    expect(getByTestId("poi-filter-button")).toBeTruthy();
  });

  it("calls togglePoiSelector when filter button is pressed", () => {
    const togglePoiSelector = jest.fn();
    const { getByTestId } = render(
      <PoiSelector {...defaultProps} togglePoiSelector={togglePoiSelector} />
    );

    fireEvent.press(getByTestId("poi-filter-button"));
    expect(togglePoiSelector).toHaveBeenCalledTimes(1);
  });

  it("shows POI selector content when showPoiSelector is true", () => {
    const { getByText } = render(
      <PoiSelector {...defaultProps} showPoiSelector={true} />
    );

    expect(getByText("Filter Points of Interest")).toBeTruthy();
    expect(getByText("Filter by type:")).toBeTruthy();
  });

  it("closes selector when close button is pressed", () => {
    const togglePoiSelector = jest.fn();
    const { getByTestId } = render(
      <PoiSelector
        {...defaultProps}
        showPoiSelector={true}
        togglePoiSelector={togglePoiSelector}
      />
    );

    fireEvent.press(getByTestId("close-button"));
    expect(togglePoiSelector).toHaveBeenCalledTimes(1);
  });

  it("applies filters with correct values", () => {
    const setSelectedPoiTypes = jest.fn();
    const setSearchRadius = jest.fn();
    const applyFilters = jest.fn();
    const togglePoiSelector = jest.fn();

    const { getByText } = render(
      <PoiSelector
        {...defaultProps}
        showPoiSelector={true}
        setSelectedPoiTypes={setSelectedPoiTypes}
        setSearchRadius={setSearchRadius}
        applyFilters={applyFilters}
        togglePoiSelector={togglePoiSelector}
      />
    );

    // Press apply button
    fireEvent.press(getByText("Apply Filters"));

    // Default values should be applied
    expect(setSelectedPoiTypes).toHaveBeenCalledWith(["none"]);
    expect(setSearchRadius).toHaveBeenCalledWith(1500);
    expect(applyFilters).toHaveBeenCalledWith(["none"], 1500);
    expect(togglePoiSelector).toHaveBeenCalled();
  });
});
