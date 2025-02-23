/**
 * @file MapCard.test.jsx
 * @description Tests for the MapCard component to ensure it renders correctly when provided
 * with building data and within a navigation context.
 */

import React from "react";
import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import MapCard from "../app/components/navigation/MapCard";

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
});
