/**
 * @file MapCard.test.jsx
 * @description Tests for the MapCard component to ensure it renders correctly when provided
 * with building data and within a navigation context.
 */

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import MapCard from "../app/components/navigation/MapCard";
import MapTraceroute from "../app/components/navigation/MapTraceroute";

// Mock the useNavigation hook from React Navigation to provide a mock navigate function.
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
  };
});

/**
 * Test suite for the <MapCard /> component.
 */
describe("<MapCard />", () => {
  // Sample building data for testing.
  const mockBuilding = {
    name: "Test Building",
    address: "123 Test St",
    isHandicap: "false",
    isBike: "false",
    isParking: "false",
    isInfo: "false",
    isCredit: "false",
  };

  /**
   * Verifies that the MapCard component renders correctly within a navigation context.
   */
  test("renders correctly with navigation context", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <MapCard building={mockBuilding} />
      </NavigationContainer>
    );

    // Retrieve the MapCard component using its testID.
    const viewComponent = getByTestId("mapcard-view");

    // Assert that the component is rendered.
    expect(viewComponent).toBeTruthy();
  });

  /**
   * Verifies that the MapCard component renders correctly within a navigation context.
   */

  describe("<MapTraceroute />", () => {
    it("updates the selected transportation mode when clicked", () => {
      const setModeMock = jest.fn();
      const setWalkToBus = jest.fn();
      const setWalkFromBus = jest.fn();
      const setIsShuttle = jest.fn();

      const { getByTestId } = render(
        <NavigationContainer>
          <MapTraceroute
            setMode={setModeMock}
            setIsShuttle={setIsShuttle}
            setWalkToBus={setWalkToBus}
            setWalkFromBus={setWalkFromBus}
          />
        </NavigationContainer>
      );

      //Simulate selecting each button
      fireEvent.press(getByTestId("car-button"));
      expect(setModeMock).toHaveBeenCalledWith("DRIVING");

      fireEvent.press(getByTestId("bike-button"));
      expect(setModeMock).toHaveBeenCalledWith("BICYCLING");

      fireEvent.press(getByTestId("metro-button"));
      expect(setModeMock).toHaveBeenCalledWith("TRANSIT");

      fireEvent.press(getByTestId("walk-button"));
      expect(setModeMock).toHaveBeenCalledWith("WALKING");
    });

    /**
     * Ensures that travel times are displayed correctly.
     */
    it("displays the correct travel times", () => {
      const { getByText } = render(
        <MapTraceroute carTravelTime="10 mins" bikeTravelTime="5 mins" />
      );

      expect(getByText("10 mins")).toBeTruthy(); // Car travel time
      expect(getByText("5 mins")).toBeTruthy(); // Bike travel time
    });
  });
});
