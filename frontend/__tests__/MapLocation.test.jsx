import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import MapLocation from "../app/components/navigation/MapLocation";

jest.mock("expo-location", () => ({
    requestForegroundPermissionsAsync: jest.fn(),
    getCurrentPositionAsync: jest.fn(),
  }));
  
  describe("MapLocation Component", () => {
    let panToMyLocation, setLocation;
  
    beforeEach(() => {
      panToMyLocation = jest.fn();
      setLocation = jest.fn();
    });
  
    it("renders correctly", () => {
      const { getByTestId } = render(
        <MapLocation panToMyLocation={panToMyLocation} setLocation={setLocation} />
      );
      expect(getByTestId("map-location-button")).toBeTruthy();
    });
  
    it("calls panToMyLocation when the button is pressed", () => {
      const { getByTestId } = render(
        <MapLocation panToMyLocation={panToMyLocation} setLocation={setLocation} />
      );
  
      const button = getByTestId("map-location-button");
      fireEvent.press(button);
      expect(panToMyLocation).toHaveBeenCalled();
    });
  });
  