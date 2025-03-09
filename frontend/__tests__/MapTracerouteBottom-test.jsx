/**
 * @file MapTracerouteBottom.test.jsx
 * @description Tests the MapTracerouteBottom component to ensure that it renders correctly with the provided props.
 */

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import MapTracerouteBottom from "../app/components/navigation/MapTracerouteBottom";

// Mock the StartIcon component
jest.mock("../app/components/navigation/Icons/StartIcon", () => "StartIcon");

describe("<MapTracerouteBottom />", () => {
  // Create mock props for testing
  const mockProps = {
    isRoute: true,
    setIsRoute: jest.fn(),
    end: { latitude: 37.7749, longitude: -122.4194 },
    start: { latitude: 37.3352, longitude: -121.8811 },
    panToStart: jest.fn(),
    closeTraceroute: false,
    setCloseTraceroute: jest.fn(),
  };

  /**
   * Verifies that the MapTracerouteBottom component renders with the expected content.
   */
  test("renders correctly with provided props", () => {
    const { getByText } = render(<MapTracerouteBottom {...mockProps} />);

    // Assert that the time is rendered
    expect(getByText("30 min")).toBeTruthy();

    // Assert that the distance is rendered
    expect(getByText("(20.0 km)")).toBeTruthy();

    // Assert that the start button is rendered
    expect(getByText("Start")).toBeTruthy();
  });

  /**
   * Tests the Start button functionality.
   */
  test("calls panToStart when the Start button is pressed", () => {
    const { getByText } = render(<MapTracerouteBottom {...mockProps} />);

    // Press the Start button
    fireEvent.press(getByText("Start"));

    // Assert that panToStart was called
    expect(mockProps.panToStart).toHaveBeenCalled();
  });
});
