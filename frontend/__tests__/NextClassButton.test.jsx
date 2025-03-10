import React from "react";
import { render, act, fireEvent, waitFor } from "@testing-library/react-native";
import { Animated } from "react-native";
import NextClassButton from "../app/components/calendar/NextClassButton";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";

// We'll assume these are already mocked in your file:
jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));
jest.mock("expo-location", () => ({
  getCurrentPositionAsync: jest.fn(),
}));

describe("NextClassButton (New Lines Coverage)", () => {
  let fakeObserver;
  let mockNavigation;
  let observerCallback;

  beforeEach(() => {
    mockNavigation = { navigate: jest.fn() };
    useNavigation.mockReturnValue(mockNavigation);
    fakeObserver = {
      subscribe: jest.fn((cb) => {
        observerCallback = cb; // so we can call it directly
      }),
      unsubscribe: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("sets nextEventLocation to null if no events or only past events", () => {
    const { queryByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    // On mount, subscribe is called
    expect(fakeObserver.subscribe).toHaveBeenCalled();

    // 1) No events => nextEventLocation = null
    act(() => {
      observerCallback([]);
    });
    expect(queryByText("Go to My Next Class")).toBeNull();

    // 2) Only past events => nextEventLocation = null
    act(() => {
      observerCallback([
        {
          start: { dateTime: new Date(Date.now() - 60000).toISOString() }, // Past
          description: "Campus Past, Building Past",
        },
      ]);
    });
    expect(queryByText("Go to My Next Class")).toBeNull();
  });

  it("picks earliest future event, triggers fade animation, and sets nextEventLocation", async () => {
    const now = new Date();
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 10, longitude: 20 },
    });

    const { getByText } = render(<NextClassButton eventObserver={fakeObserver} />);

    // Provide multiple events, including a past one, ensuring we pick the earliest future
    act(() => {
      observerCallback([
        {
          start: { dateTime: new Date(now.getTime() + 30000).toISOString() }, // 30s from now
          description: "Campus B, Building B",
        },
        {
          start: { dateTime: new Date(now.getTime() + 15000).toISOString() }, // 15s from now (earliest future)
          description: "Campus A, Building A",
        },
        {
          start: { dateTime: new Date(now.getTime() - 10000).toISOString() }, // Past
          description: "Campus Past, Building Past",
        },
      ]);
    });

    // Button should appear for the earliest future event
    const button = await waitFor(() => getByText("Go to My Next Class"));
    expect(button).toBeTruthy();
    // Check fade animation
    expect(Animated.timing).toHaveBeenCalledWith(
      expect.any(Animated.Value),
      expect.objectContaining({
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    );

    // Press the button => triggers handleGoToNextClass
    fireEvent.press(button);
    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith("Navigation", {
        campus: "campus a",
        buildingName: "Building A",
        currentLocation: { latitude: 10, longitude: 20 },
      });
    });
  });

  it("does nothing in handleGoToNextClass if !nextEventLocation", async () => {
    const { rerender, queryByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    act(() => {
      observerCallback([]); // empty => no nextEventLocation
    });
    // Button doesn't exist
    expect(queryByText("Go to My Next Class")).toBeNull();

    // Even if we try to press it, there's nothing to press
    expect(mockNavigation.navigate).not.toHaveBeenCalled();
  });

  it("catches error if getCurrentPositionAsync fails in handleGoToNextClass", async () => {
    Location.getCurrentPositionAsync.mockRejectedValue(new Error("GPS error"));
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const futureEvent = {
      start: { dateTime: new Date(Date.now() + 60000).toISOString() },
      description: "Campus X, Building X",
    };

    const { getByText } = render(<NextClassButton eventObserver={fakeObserver} />);
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

  it("unsubscribes on unmount", () => {
    const { unmount } = render(<NextClassButton eventObserver={fakeObserver} />);
    unmount();
    expect(fakeObserver.unsubscribe).toHaveBeenCalledWith(observerCallback);
  });
});
