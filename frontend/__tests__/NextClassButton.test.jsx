import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Animated, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";

import NextClassButton from "../app/components/calendar/NextClassButton";

// Mock useNavigation from React Navigation
jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));

// Mock expo-location
jest.mock("expo-location", () => ({
  getCurrentPositionAsync: jest.fn(),
}));

// Mock the CalendarDirectionsIcon
jest.mock("../app/components/Calendar/CalendarIcons/CalendarDirectionsIcon", () => {
  return (props) => <Text testID="calendar-directions-icon">Icon</Text>;
});

// Spy on Animated.timing
jest.spyOn(Animated, "timing").mockImplementation(() => ({
  start: jest.fn(),
}));

// Helper to create a fake observer
const createFakeObserver = () => ({
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  // We won't typically call notify from outside, but let's keep it for completeness
  notify: jest.fn(),
});

describe("NextClassButton Component", () => {
  let fakeObserver, mockNavigation;

  beforeEach(() => {
    fakeObserver = createFakeObserver();
    mockNavigation = { navigate: jest.fn() };
    // Make useNavigation return our mockNavigation
    useNavigation.mockReturnValue(mockNavigation);
    jest.clearAllMocks();
  });

  test("Subscribes/unsubscribes to the event observer in useEffect", () => {
    const { unmount } = render(<NextClassButton eventObserver={fakeObserver} />);
    expect(fakeObserver.subscribe).toHaveBeenCalledTimes(1);

    // On unmount, should unsubscribe
    unmount();
    const callback = fakeObserver.subscribe.mock.calls[0][0];
    expect(fakeObserver.unsubscribe).toHaveBeenCalledWith(callback);
  });

  test("Renders nothing if no future events are received", () => {
    // No events => no button
    const { queryByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    expect(queryByText("Go to My Next Class")).toBeNull();

    // Provide an empty array
    const observerCallback = fakeObserver.subscribe.mock.calls[0][0];
    act(() => {
      observerCallback([]);
    });
    expect(queryByText("Go to My Next Class")).toBeNull();
  });

  test("Does not render the button if only past events exist", () => {
    const pastEvent = {
      start: { dateTime: new Date(Date.now() - 10000).toISOString() },
      description: "Campus A, Building 1",
    };

    const { queryByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    const observerCallback = fakeObserver.subscribe.mock.calls[0][0];

    act(() => {
      observerCallback([pastEvent]);
    });
    expect(queryByText("Go to My Next Class")).toBeNull();
  });

  test("Shows button and triggers fade animation if a future event exists", async () => {
    const futureEvent = {
      start: { dateTime: new Date(Date.now() + 10000).toISOString() },
      description: "Campus A, Building 1",
    };

    const { getByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    const observerCallback = fakeObserver.subscribe.mock.calls[0][0];

    act(() => {
      observerCallback([futureEvent]);
    });

    const button = await waitFor(() => getByText("Go to My Next Class"));
    expect(button).toBeTruthy();
    // Check animation
    expect(Animated.timing).toHaveBeenCalledWith(
      expect.any(Animated.Value),
      expect.objectContaining({
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    );
  });

  test("handleGoToNextClass navigates with parsed campus and buildingName", async () => {
    const mockCoords = { latitude: 10, longitude: 20 };
    Location.getCurrentPositionAsync.mockResolvedValue({ coords: mockCoords });

    const futureEvent = {
      start: { dateTime: new Date(Date.now() + 10000).toISOString() },
      description: "Campus A, Building 1",
    };

    const { getByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    const observerCallback = fakeObserver.subscribe.mock.calls[0][0];
    act(() => {
      observerCallback([futureEvent]);
    });

    // Press button
    const button = await waitFor(() => getByText("Go to My Next Class"));
    fireEvent.press(button);

    await waitFor(() => {
      expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
      expect(mockNavigation.navigate).toHaveBeenCalledWith("Navigation", {
        campus: "campus a",
        buildingName: "Building 1",
        currentLocation: { latitude: 10, longitude: 20 },
      });
    });
  });

  test("Strips <pre> tags from event description", async () => {
    const mockCoords = { latitude: 50, longitude: 60 };
    Location.getCurrentPositionAsync.mockResolvedValue({ coords: mockCoords });

    const futureEvent = {
      start: { dateTime: new Date(Date.now() + 10000).toISOString() },
      description: "<pre>Campus B, <pre>Building 2",
    };

    const { getByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    const observerCallback = fakeObserver.subscribe.mock.calls[0][0];
    act(() => {
      observerCallback([futureEvent]);
    });

    const button = await waitFor(() => getByText("Go to My Next Class"));
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith("Navigation", {
        campus: "campus b",
        buildingName: "Building 2",
        currentLocation: { latitude: 50, longitude: 60 },
      });
    });
  });

  test("Does nothing if nextEventLocation is null", async () => {
    // If no event => nextEventLocation is null => no button => no navigation
    const { queryByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    expect(queryByText("Go to My Next Class")).toBeNull();
    expect(mockNavigation.navigate).not.toHaveBeenCalled();
  });

  test("Logs an error if location fetching fails", async () => {
    Location.getCurrentPositionAsync.mockRejectedValue(new Error("Location error"));
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const futureEvent = {
      start: { dateTime: new Date(Date.now() + 10000).toISOString() },
      description: "Campus A, Building 1",
    };

    const { getByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    const observerCallback = fakeObserver.subscribe.mock.calls[0][0];
    act(() => {
      observerCallback([futureEvent]);
    });

    const button = await waitFor(() => getByText("Go to My Next Class"));
    fireEvent.press(button);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error navigating to next class:",
        expect.any(Error)
      );
    });
    consoleErrorSpy.mockRestore();
  });

  test("Handles event description with no comma (only campus)", async () => {
    const mockCoords = { latitude: 99, longitude: 100 };
    Location.getCurrentPositionAsync.mockResolvedValue({ coords: mockCoords });

    const futureEvent = {
      start: { dateTime: new Date(Date.now() + 10000).toISOString() },
      description: "Campus A",
    };

    const { getByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    const observerCallback = fakeObserver.subscribe.mock.calls[0][0];
    act(() => {
      observerCallback([futureEvent]);
    });

    const button = await waitFor(() => getByText("Go to My Next Class"));
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith("Navigation", {
        campus: "campus a",
        buildingName: "",
        currentLocation: { latitude: 99, longitude: 100 },
      });
    });
  });
});