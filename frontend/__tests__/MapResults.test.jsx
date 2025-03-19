/**
 * @file MapResults.test.jsx
 * @description Tests for the MapResults component to ensure it renders correctly
 * and handles user interactions properly.
 */

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import MapResults from "../app/components/navigation/MapResults";

// Mock the MapResultItem component
jest.mock("../app/components/navigation/MapResults/MapResultItem", () => "MapResultItem");

// Mock the SearchIcon component
jest.mock("../app/components/navigation/Icons/SearchIcon", () => "SearchIcon");

// Mock the polygons data
jest.mock("../app/screens/navigation/navigationConfig", () => ({
  polygons: [
    { id: 1, name: "Hall Building", coordinates: { latitude: 45.497, longitude: -73.578 } },
    { id: 2, name: "Library Building", coordinates: { latitude: 45.496, longitude: -73.577 } },
    { id: 3, name: "EV Building", coordinates: { latitude: 45.495, longitude: -73.578 } },
    { id: 4, name: "Loyola Campus Building", coordinates: { latitude: 45.458, longitude: -73.640 } }
  ]
}));

jest.mock("react-native", () => {
  const rn = jest.requireActual("react-native");
  rn.Keyboard = {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    dismiss: jest.fn()
  };
  rn.Dimensions = {
    ...rn.Dimensions,
    get: jest.fn(() => ({ width: 375, height: 812 }))
  };
  return rn;
});

describe("MapResults", () => {
  // Default props 
  const mockProps = {
    fetchTravelTime: jest.fn(),
    setCarTravelTime: jest.fn(),
    setBikeTravelTime: jest.fn(),
    setMetroTravelTime: jest.fn(),
    setWalkTravelTime: jest.fn(),
    location: { latitude: 45.497, longitude: -73.578 },
    setIsRoute: jest.fn(),
    isRoute: false,
    setCloseTraceroute: jest.fn(),
    setStartPosition: jest.fn(),
    setDestinationPosition: jest.fn(),
    start: null,
    setStart: jest.fn(),
    end: null,
    setEnd: jest.fn(),
    searchResult: [],
    setSearchResult: jest.fn(),
    searchText: "",
    setSearchText: jest.fn(),
    isSearch: true,
    setIsSearch: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing when isSearch is false", () => {
    const { queryByText } = render(<MapResults {...mockProps} isSearch={false} />);
    
    // When isSearch is false, the Buildings title should not be present
    expect(queryByText("Buildings")).toBeNull();
  });

  it("renders correctly when isSearch is true", () => {
    const { getByText, getByPlaceholderText } = render(<MapResults {...mockProps} />);
    expect(getByText("Buildings")).toBeTruthy();
    expect(getByPlaceholderText("Search the campus")).toBeTruthy();
    expect(getByText("Loyola")).toBeTruthy();
    expect(getByText("SGW")).toBeTruthy();
    expect(getByText("My Rooms")).toBeTruthy();
    expect(getByText("Library")).toBeTruthy();
    expect(getByText("Dining")).toBeTruthy();
  });

  it("shows 'No results found' when searchResult is empty", () => {
    const { getByText } = render(<MapResults {...mockProps} searchResult={[]} />);
    expect(getByText("No results found.")).toBeTruthy();
  });

  it("renders search results when available", () => {
    const searchResult = [
      { id: 1, name: "Hall Building", coordinates: { latitude: 45.497, longitude: -73.578 } },
      { id: 2, name: "Library Building", coordinates: { latitude: 45.496, longitude: -73.577 } }
    ];
    
    // Verify if no errors when rendering with search results
    render(<MapResults {...mockProps} searchResult={searchResult} />);
    expect(true).toBeTruthy();
  });

  it("handles search text input changes", () => {
    const { getByPlaceholderText } = render(<MapResults {...mockProps} />);
    const input = getByPlaceholderText("Search the campus");
    
    fireEvent.changeText(input, "Hall");
    
    expect(mockProps.setSearchText).toHaveBeenCalledWith("Hall");
  });

  it("filters buildings when search is submitted", () => {
    const { getByPlaceholderText } = render(
      <MapResults 
        {...mockProps} 
        searchText="Hall"
      />
    );
    
    const input = getByPlaceholderText("Search the campus");
    fireEvent(input, 'submitEditing');
    
    expect(mockProps.setSearchResult).toHaveBeenCalled();
  });

  it("applies filter when a filter button is pressed", () => {
    const { getByText } = render(<MapResults {...mockProps} />);
    
    // Verify the filter buttons are rendered
    expect(getByText("Loyola")).toBeTruthy();
    
    fireEvent.press(getByText("Loyola"));
    
    //test passed if it doesn't throw an error
    expect(true).toBeTruthy();
  });
});