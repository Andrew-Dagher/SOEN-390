import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import Map from "../app/components/navigation/Map";
import * as Location from "expo-location";
import BusService from "../app/services/BusService";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AppSettingsProvider } from "../app/AppSettingsContext";

jest.mock("../app/services/BusService");
jest.mock("expo-location");
jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));
jest.mock("@aptabase/react-native", () => ({
  trackEvent: jest.fn(),
}));
jest.mock("../app/ColorBindTheme", () => ({
  __esModule: true,
  default: () => ({
    backgroundColor: "white",
    polygonFillColor: "lightblue",
  }),
}));

describe("Map Component - Bus Related Tests", () => {
  const mockNavigation = {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    navigate: jest.fn(),
  };
  const mockRoute = {};

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigation.mockReturnValue(mockNavigation);
    useRoute.mockReturnValue(mockRoute);
    Location.requestForegroundPermissionsAsync.mockResolvedValue({
      status: "granted",
    });
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 45.497, longitude: -73.579 },
    });
  });

  it("renders bus markers when bus data is updated", async () => {
    BusService.addObserver.mockImplementation((observer) => {
      observer.update({
        d: {
          Points: [
            { ID: "BUS1", Latitude: 45.4975, Longitude: -73.5785 },
            { ID: "BUS2", Latitude: 45.498, Longitude: -73.5795 },
          ],
        },
      });
    });

    const { findAllByTestId } = render(
      <AppSettingsProvider>
        <Map />
      </AppSettingsProvider>
    );

    await waitFor(
      async () => {
        const busMarkers = await findAllByTestId("bus-marker");
        const busMarkerCoordinates = busMarkers.map(
          (marker) => marker.props.coordinate
        );
        expect(busMarkerCoordinates).toEqual([
          { latitude: 45.4975, longitude: -73.5785 },
          { latitude: 45.498, longitude: -73.5795 },
        ]);
      },
      { timeout: 10000 }
    );
  });

  it("adds observer on mount and updates bus data", async () => {
    const { rerender } = render(
      <AppSettingsProvider>
        <Map />
      </AppSettingsProvider>
    );

    expect(BusService.addObserver).toHaveBeenCalled();

    BusService.addObserver.mock.calls[0][0].update({
      d: {
        Points: [{ ID: "BUS3", Latitude: 45.5, Longitude: -73.58 }],
      },
    });

    rerender(
      <AppSettingsProvider>
        <Map />
      </AppSettingsProvider>
    );

    await waitFor(async () => {
      expect(BusService.addObserver).toHaveBeenCalledTimes(1);
    });
  });

  it("Handles blur event and removes observer", () => {
    render(
      <AppSettingsProvider>
        <Map />
      </AppSettingsProvider>
    );

    const unsubscribeBlur = mockNavigation.addListener.mock.calls.find(
      (call) => call[0] === "blur"
    )[1];

    unsubscribeBlur();

    expect(BusService.removeObserver).toHaveBeenCalled();
  });
});
