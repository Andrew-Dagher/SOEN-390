import React from "react";
import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import MapCard from "../app/components/navigation/MapCard";

// Mock navigation hook
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
  };
});

describe("<MapCard />", () => {
  // Sample building data for testing
  const mockBuilding = {
    name: "Test Building",
    address: "123 Test St",
    isHandicap: "false",
    isBike: "false",
    isParking: "false",
    isInfo: "false",
    isCredit: "false",
  };

  test("renders correctly with navigation context", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <MapCard building={mockBuilding} />
      </NavigationContainer>
    );

    const viewComponent = getByTestId("mapcard-view");
    expect(viewComponent).toBeTruthy();
  });
});
