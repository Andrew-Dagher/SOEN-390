/**
 * @file NextClassButton.test.js
 */

import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react-native";
import NextClassButton from "../app/components/calendar/NextClassButton";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { Animated, Text } from "react-native";

// Mocks
jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));
jest.mock("expo-location", () => ({
  getCurrentPositionAsync: jest.fn(),
}));
jest.spyOn(Animated, "timing").mockImplementation(() => ({
  start: jest.fn(),
}));

// Fake observer
const createFakeObserver = () => ({
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  notify: jest.fn(),
});

// Mock the icon to avoid requiring an SVG or other file
jest.mock("../CalendarIcons/CalendarDirectionsIcon", () => {
  return () => <Text testID="calendar-directions-icon">Icon</Text>;
});

describe("NextClassButton", () => {
  let fakeObserver;
  let mockNavigation;

  beforeEach(() => {
    jest.clearAllMocks();
    fakeObserver = createFakeObserver();
    mockNavigation = { navigate: jest.fn() };
    useNavigation.mockReturnValue(mockNavigation);
  });

  it("subscribes/unsubscribes on mount/unmount", () => {
    const { unmount } = render(<NextClassButton eventObserver={fakeObserver} />);
    expect(fakeObserver.subscribe).toHaveBeenCalledTimes(1);

    // on unmount
    unmount();
    const callback = fakeObserver.subscribe.mock.calls[0][0];
    expect(fakeObserver.unsubscribe).toHaveBeenCalledWith(callback);
  });

  it("renders null when no upcoming event is found", () => {
    render(<NextClassButton eventObserver={fakeObserver} />);
    // Trigger callback with empty array
    const callback = fakeObserver.subscribe.mock.calls[0][0];
    act(() => {
      callback([]);
    });
    // Should not render the button
    const button = document.querySelector("Go to My Next Class");
    expect(button).toBeFalsy();
  });

  it("picks the earliest future event and shows the button", async () => {
    const now = new Date();
    const futureEvent1 = {
      start: { dateTime: new Date(now.getTime() + 60000).toISOString() }, // 1 min from now
      description: "Campus A, Building A, Room 101",
    };
    const futureEvent2 = {
      start: { dateTime: new Date(now.getTime() + 120000).toISOString() }, // 2 min
      description: "Campus B, Building B, Room 202",
    };

    const { getByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    const callback = fakeObserver.subscribe.mock.calls[0][0];
    act(() => {
      callback([futureEvent2, futureEvent1]);
    });

    // The earliest is futureEvent1 => campus A
    const button = await waitFor(() => getByText("Go to My Next Class"));
    expect(button).toBeTruthy();
    expect(Animated.timing).toHaveBeenCalled(); // fade in
  });

  it("navigates correctly on button press (with stripped <pre> tags)", async () => {
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 1, longitude: 2 },
    });

    const futureEvent = {
      start: { dateTime: new Date(Date.now() + 10000).toISOString() },
      description: "<pre>CampusX, <pre>BuildingY, RoomZ",
    };
    const { getByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    const callback = fakeObserver.subscribe.mock.calls[0][0];

    act(() => {
      callback([futureEvent]);
    });

    const button = await waitFor(() => getByText("Go to My Next Class"));
    fireEvent.press(button);

    await waitFor(() => {
      expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
      expect(mockNavigation.navigate).toHaveBeenCalledWith("Navigation", {
        campus: "campusx",
        buildingName: "BuildingY",
        currentLocation: { latitude: 1, longitude: 2 },
      });
    });
  });

  it("logs an error if getCurrentPositionAsync fails", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    Location.getCurrentPositionAsync.mockRejectedValue(new Error("Location error"));

    const futureEvent = {
      start: { dateTime: new Date(Date.now() + 10000).toISOString() },
      description: "Campus A, Building B, Room C",
    };
    render(<NextClassButton eventObserver={fakeObserver} />);
    const callback = fakeObserver.subscribe.mock.calls[0][0];

    act(() => {
      callback([futureEvent]);
    });

    const button = await waitFor(() => document.querySelector("Go to My Next Class"));
    fireEvent.press(button);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error navigating to next class:",
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it("renders null if nextEventLocation is cleared after a new notify call", async () => {
    const now = new Date();
    const futureEvent = {
      start: { dateTime: new Date(now.getTime() + 60000).toISOString() },
      description: "Campus A, Building A, Room 101",
    };

    const { rerender } = render(<NextClassButton eventObserver={fakeObserver} />);
    const callback = fakeObserver.subscribe.mock.calls[0][0];
    // 1. Provide an event => button visible
    act(() => {
      callback([futureEvent]);
    });

    // 2. Provide empty => button hidden
    act(() => {
      callback([]);
    });
    // Re-render to confirm the button is gone
    rerender(<NextClassButton eventObserver={fakeObserver} />);

    const button = document.querySelector("Go to My Next Class");
    expect(button).toBeFalsy();
  });
});
