import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import NextClassButton from "../app/components/calendar/NextClassButton";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { Animated } from "react-native";

// Mock dependencies
jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));
jest.mock("expo-location", () => ({
  getCurrentPositionAsync: jest.fn(),
}));
// Mock the CalendarDirectionsIcon to simply render a string
jest.mock("../app/components/Calendar/CalendarIcons/CalendarDirectionsIcon", () => "CalendarDirectionsIcon");

// Spy on Animated.timing so we can assert its use.
jest.spyOn(Animated, "timing").mockImplementation(() => ({
  start: jest.fn(),
}));

// Utility: Create a fake event observer with subscribe/unsubscribe.
const createFakeObserver = () => ({
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
});

describe("NextClassButton", () => {
  let mockNavigation;
  let fakeObserver;

  beforeEach(() => {
    fakeObserver = createFakeObserver();
    mockNavigation = { navigate: jest.fn() };
    useNavigation.mockReturnValue(mockNavigation);
    jest.clearAllMocks();
  });

  it("returns null when no events or empty events array", () => {
    const { queryByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    // Since no event observer callback has set a next event location, button should not render.
    expect(queryByText("Go to My Next Class")).toBeNull();
    // Verify that subscribe was called.
    expect(fakeObserver.subscribe).toHaveBeenCalled();
  });

  it("unsubscribes from the eventObserver on unmount", () => {
    const { unmount } = render(<NextClassButton eventObserver={fakeObserver} />);
    const observerCallback = fakeObserver.subscribe.mock.calls[0][0];
    unmount();
    expect(fakeObserver.unsubscribe).toHaveBeenCalledWith(observerCallback);
  });

  it("sets nextEventLocation and starts animation when a future event is received", async () => {
    // Create a future event.
    const futureDate = new Date(Date.now() + 10000).toISOString();
    const event = {
      start: { dateTime: futureDate },
      description: "Campus A, Building 1",
    };

    render(<NextClassButton eventObserver={fakeObserver} />);
    const observerCallback = fakeObserver.subscribe.mock.calls[0][0];
    act(() => {
      observerCallback([event]);
    });

    // The button should appear.
    const button = await waitFor(() => {
      return require("@testing-library/react-native").getByText("Go to My Next Class");
    });
    expect(button).toBeTruthy();

    // Verify Animated.timing was called with proper config.
    expect(Animated.timing).toHaveBeenCalledWith(
      expect.any(Animated.Value),
      expect.objectContaining({
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    );
  });

  it("filters out past events and does not render the button if no future events exist", async () => {
    // Create an event that is in the past.
    const pastDate = new Date(Date.now() - 10000).toISOString();
    const event = { start: { dateTime: pastDate }, description: "Campus A, Building 1" };

    const { queryByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    const observerCallback = fakeObserver.subscribe.mock.calls[0][0];
    act(() => {
      observerCallback([event]);
    });

    // Button should not render.
    expect(queryByText("Go to My Next Class")).toBeNull();
  });

  it("navigates with correct parameters when button is pressed", async () => {
    const futureDate = new Date(Date.now() + 10000).toISOString();
    const eventDescription = "Campus A, Building 1";
    const event = { start: { dateTime: futureDate }, description: eventDescription };

    // Mock location fetch.
    const mockCoords = { latitude: 1, longitude: 2 };
    Location.getCurrentPositionAsync.mockResolvedValue({ coords: mockCoords });

    const { getByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    const observerCallback = fakeObserver.subscribe.mock.calls[0][0];
    act(() => {
      observerCallback([event]);
    });

    const button = await waitFor(() => getByText("Go to My Next Class"));
    fireEvent.press(button);

    await waitFor(() => {
      expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
      expect(mockNavigation.navigate).toHaveBeenCalledWith("Navigation", {
        campus: "campus a",
        buildingName: "Building 1",
        currentLocation: { latitude: 1, longitude: 2 },
      });
    });
  });

  it("handles event description with missing comma gracefully", async () => {
    // Event description without a comma.
    const futureDate = new Date(Date.now() + 10000).toISOString();
    const eventDescription = "Campus A";
    const event = { start: { dateTime: futureDate }, description: eventDescription };

    const mockCoords = { latitude: 10, longitude: 20 };
    Location.getCurrentPositionAsync.mockResolvedValue({ coords: mockCoords });

    const { getByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    const observerCallback = fakeObserver.subscribe.mock.calls[0][0];
    act(() => {
      observerCallback([event]);
    });

    const button = await waitFor(() => getByText("Go to My Next Class"));
    fireEvent.press(button);

    await waitFor(() => {
      // With only one part, buildingName should be empty.
      expect(mockNavigation.navigate).toHaveBeenCalledWith("Navigation", {
        campus: "campus a",
        buildingName: "",
        currentLocation: { latitude: 10, longitude: 20 },
      });
    });
  });

  it("strips <pre> tags from event description before navigation", async () => {
    // Event description with <pre> tags.
    const futureDate = new Date(Date.now() + 10000).toISOString();
    const eventDescription = "<pre>Campus B, <pre>Building 2";
    const event = { start: { dateTime: futureDate }, description: eventDescription };

    const mockCoords = { latitude: 100, longitude: 200 };
    Location.getCurrentPositionAsync.mockResolvedValue({ coords: mockCoords });

    const { getByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    const observerCallback = fakeObserver.subscribe.mock.calls[0][0];
    act(() => {
      observerCallback([event]);
    });

    const button = await waitFor(() => getByText("Go to My Next Class"));
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith("Navigation", {
        campus: "campus b",
        buildingName: "Building 2",
        currentLocation: { latitude: 100, longitude: 200 },
      });
    });
  });

  it("does not navigate if nextEventLocation is not set", async () => {
    // Render without triggering any event (nextEventLocation remains null).
    const { queryByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    expect(queryByText("Go to My Next Class")).toBeNull();
  });

  it("logs error when location fetching fails in handleGoToNextClass", async () => {
    const futureDate = new Date(Date.now() + 10000).toISOString();
    const eventDescription = "Campus A, Building 1";
    const event = { start: { dateTime: futureDate }, description: eventDescription };

    // Simulate a failure in getting the current location.
    Location.getCurrentPositionAsync.mockRejectedValue(new Error("Location error"));
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const { getByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    const observerCallback = fakeObserver.subscribe.mock.calls[0][0];
    act(() => {
      observerCallback([event]);
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