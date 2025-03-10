/**
 * NextClassButton.test.jsx
 * Comprehensive tests for NextClassButton.js with fixes.
 */
import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";

import NextClassButton from "../app/components/calendar/NextClassButton";

// ----- Mocks -----
// Avoid using JSX with Text; return a string or use inline require.
jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));

jest.mock("expo-location", () => ({
  getCurrentPositionAsync: jest.fn(),
}));

// Instead of returning JSX using <Text>, return a simple string.
jest.mock("../app/components/calendar/CalendarIcons/CalendarDirectionsIcon", () => "MockCalendarDirectionsIcon");

// Spy on Animated.timing
jest.spyOn(Animated, "timing").mockImplementation(() => ({
  start: jest.fn(),
}));

// Helper to create a fake observer
const createFakeObserver = () => ({
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  notify: jest.fn(),
});

describe("NextClassButton - Comprehensive Tests", () => {
  let fakeObserver;
  let mockNavigation;
  let observerCallback;

  beforeEach(() => {
    fakeObserver = createFakeObserver();
    // Capture subscribe callback so we can trigger observer events manually.
    fakeObserver.subscribe.mockImplementation((cb) => {
      observerCallback = cb;
    });
    mockNavigation = {
      navigate: jest.fn(),
      reset: jest.fn(),
      replace: jest.fn(),
      addListener: jest.fn(() => jest.fn()),
    };
    useNavigation.mockReturnValue(mockNavigation);
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 1, longitude: 2 },
    });
    jest.clearAllMocks();
  });

  // --- Observer Subscription ---
  test("subscribes to and unsubscribes from the event observer", () => {
    const { unmount } = render(<NextClassButton eventObserver={fakeObserver} />);
    expect(fakeObserver.subscribe).toHaveBeenCalledTimes(1);
    const callback = observerCallback;
    unmount();
    expect(fakeObserver.unsubscribe).toHaveBeenCalledWith(callback);
  });

  // --- No Upcoming Events ---
  test("renders nothing if no future events are received", () => {
    const { queryByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    expect(queryByText("Go to My Next Class")).toBeNull();
    act(() => {
      observerCallback([]);
    });
    expect(queryByText("Go to My Next Class")).toBeNull();
  });

  test("does not render the button if only past events exist", () => {
    const pastEvent = {
      start: { dateTime: new Date(Date.now() - 10000).toISOString() },
      description: "Campus A, Building 1",
    };
    const { queryByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    act(() => {
      observerCallback([pastEvent]);
    });
    expect(queryByText("Go to My Next Class")).toBeNull();
  });

  // --- Future Event & Animation ---
  test("shows button and triggers fade animation when a future event exists", async () => {
    const futureEvent = {
      start: { dateTime: new Date(Date.now() + 10000).toISOString() },
      description: "Campus A, Building 1",
    };
    const { getByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    act(() => {
      observerCallback([futureEvent]);
    });
    const button = await waitFor(() => getByText("Go to My Next Class"));
    expect(button).toBeTruthy();
    expect(Animated.timing).toHaveBeenCalledWith(
      expect.any(Animated.Value),
      expect.objectContaining({
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    );
  });

  test("picks the earliest future event if multiple exist", async () => {
    const now = new Date();
    const futureEvent1 = {
      start: { dateTime: new Date(now.getTime() + 30000).toISOString() }, // 30s ahead
      description: "Campus X, Building X",
    };
    const futureEvent2 = {
      start: { dateTime: new Date(now.getTime() + 60000).toISOString() }, // 60s ahead
      description: "Campus Y, Building Y",
    };
    const pastEvent = {
      start: { dateTime: new Date(now.getTime() - 10000).toISOString() },
      description: "Campus Past, Building Past",
    };
    const { getByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    act(() => {
      observerCallback([futureEvent2, futureEvent1, pastEvent]);
    });
    const button = await waitFor(() => getByText("Go to My Next Class"));
    expect(button).toBeTruthy();
    fireEvent.press(button);
    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith("Navigation", {
        campus: "campus x",
        buildingName: "Building X",
        currentLocation: { latitude: 1, longitude: 2 },
      });
    });
  });

  // --- handleGoToNextClass Functionality ---
  test("navigates correctly in handleGoToNextClass", async () => {
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 10, longitude: 20 },
    });
    const futureEvent = {
      start: { dateTime: new Date(Date.now() + 10000).toISOString() },
      description: "Campus A, Building 1",
    };
    const { getByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    act(() => {
      observerCallback([futureEvent]);
    });
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

  test("strips <pre> tags from event description", async () => {
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 50, longitude: 60 },
    });
    const futureEvent = {
      start: { dateTime: new Date(Date.now() + 10000).toISOString() },
      description: "<pre>Campus B, <pre>Building 2",
    };
    const { getByText } = render(<NextClassButton eventObserver={fakeObserver} />);
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

  test("does nothing if nextEventLocation is null", async () => {
    const { queryByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    expect(queryByText("Go to My Next Class")).toBeNull();
    expect(mockNavigation.navigate).not.toHaveBeenCalled();
  });

  test("catches error in handleGoToNextClass if location fetching fails", async () => {
    Location.getCurrentPositionAsync.mockRejectedValue(new Error("Location error"));
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const futureEvent = {
      start: { dateTime: new Date(Date.now() + 10000).toISOString() },
      description: "Campus A, Building 1",
    };
    const { getByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    act(() => {
      observerCallback([futureEvent]);
    });
    const button = await waitFor(() => getByText("Go to My Next Class"));
    fireEvent.press(button);
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error navigating to next class:", expect.any(Error));
    });
    consoleErrorSpy.mockRestore();
  });

  test("hides button if subsequent notify call has no upcoming events", async () => {
    const upcomingEvent = {
      start: { dateTime: new Date(Date.now() + 20000).toISOString() },
      description: "Campus Z, Building Z",
    };
    const { queryByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    act(() => {
      observerCallback([upcomingEvent]);
    });
    expect(await waitFor(() => queryByText("Go to My Next Class"))).toBeTruthy();
    act(() => {
      observerCallback([]);
    });
    expect(queryByText("Go to My Next Class")).toBeNull();
  });
});
