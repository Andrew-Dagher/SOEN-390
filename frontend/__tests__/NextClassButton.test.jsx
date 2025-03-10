import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import NextClassButton from "../app/components/calendar/NextClassButton";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { Animated, Text } from "react-native";

// Mock dependencies
jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));

jest.mock("expo-location", () => ({
  getCurrentPositionAsync: jest.fn(),
}));

// We mock CalendarDirectionsIcon as a simple Text element.
jest.mock("../app/components/Calendar/CalendarIcons/CalendarDirectionsIcon", () => {
  return (props) => <Text testID="calendar-directions-icon" {...props}>Icon</Text>;
});

// Spy on Animated.timing so we can verify its configuration.
jest.spyOn(Animated, "timing").mockImplementation(() => ({
  start: jest.fn(),
}));

// Create a fake event observer with subscribe/unsubscribe.
const createFakeObserver = () => ({
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
});

describe("NextClassButton - useEffect and handleGoToNextClass", () => {
  let fakeObserver, mockNavigation;

  beforeEach(() => {
    fakeObserver = createFakeObserver();
    mockNavigation = { navigate: jest.fn() };
    useNavigation.mockReturnValue(mockNavigation);
    jest.clearAllMocks();
  });

  it("subscribes to the eventObserver and unsubscribes on unmount", () => {
    const { unmount } = render(<NextClassButton eventObserver={fakeObserver} />);
    // Get the observer callback that was passed to subscribe.
    const observerCallback = fakeObserver.subscribe.mock.calls[0][0];
    expect(observerCallback).toBeInstanceOf(Function);
    unmount();
    expect(fakeObserver.unsubscribe).toHaveBeenCalledWith(observerCallback);
  });

  it("sets nextEventLocation to null if events is empty or undefined", async () => {
    const { queryByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    const observerCallback = fakeObserver.subscribe.mock.calls[0][0];
    // Call observer callback with no events.
    act(() => {
      observerCallback([]);
    });
    // Because nextEventLocation is null, nothing renders.
    expect(queryByText("Go to My Next Class")).toBeNull();

    act(() => {
      observerCallback(undefined);
    });
    expect(queryByText("Go to My Next Class")).toBeNull();
  });

  it("does not set nextEventLocation if all events are in the past", async () => {
    const pastDate = new Date(Date.now() - 10000).toISOString();
    const pastEvent = { start: { dateTime: pastDate }, description: "Campus A, Building 1" };

    const { queryByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    const observerCallback = fakeObserver.subscribe.mock.calls[0][0];
    act(() => {
      observerCallback([pastEvent]);
    });
    expect(queryByText("Go to My Next Class")).toBeNull();
  });

  it("sets nextEventLocation and starts fade animation when a future event exists", async () => {
    const futureDate = new Date(Date.now() + 10000).toISOString();
    const futureEvent = { start: { dateTime: futureDate }, description: "Campus A, Building 1" };

    const { getByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    const observerCallback = fakeObserver.subscribe.mock.calls[0][0];
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

  it("calls navigation.navigate with parsed parameters when handleGoToNextClass is triggered", async () => {
    const futureDate = new Date(Date.now() + 10000).toISOString();
    const description = "Campus A, Building 1";
    const futureEvent = { start: { dateTime: futureDate }, description };
    const mockCoords = { latitude: 40.7128, longitude: -74.0060 };

    // Simulate successful location retrieval.
    Location.getCurrentPositionAsync.mockResolvedValue({ coords: mockCoords });

    const { getByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    const observerCallback = fakeObserver.subscribe.mock.calls[0][0];
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
        currentLocation: { latitude: 40.7128, longitude: -74.0060 },
      });
    });
  });

  it("handles event description with missing comma gracefully", async () => {
    const futureDate = new Date(Date.now() + 10000).toISOString();
    // Description with no comma results in buildingName as empty string.
    const description = "Campus A";
    const futureEvent = { start: { dateTime: futureDate }, description };
    const mockCoords = { latitude: 1, longitude: 2 };
    Location.getCurrentPositionAsync.mockResolvedValue({ coords: mockCoords });

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
        currentLocation: { latitude: 1, longitude: 2 },
      });
    });
  });

  it("strips <pre> tags from event description before navigating", async () => {
    const futureDate = new Date(Date.now() + 10000).toISOString();
    const description = "<pre>Campus B, <pre>Building 2";
    const futureEvent = { start: { dateTime: futureDate }, description };
    const mockCoords = { latitude: 10, longitude: 20 };
    Location.getCurrentPositionAsync.mockResolvedValue({ coords: mockCoords });

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
        currentLocation: { latitude: 10, longitude: 20 },
      });
    });
  });

  it("does nothing when handleGoToNextClass is called and nextEventLocation is null", async () => {
    // Render without triggering any event so nextEventLocation remains null.
    const { queryByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    // No button rendered because nextEventLocation is null.
    expect(queryByText("Go to My Next Class")).toBeNull();
  });

  it("logs an error if location fetching fails in handleGoToNextClass", async () => {
    const futureDate = new Date(Date.now() + 10000).toISOString();
    const description = "Campus A, Building 1";
    const futureEvent = { start: { dateTime: futureDate }, description };
    Location.getCurrentPositionAsync.mockRejectedValue(new Error("Location error"));

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
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
});