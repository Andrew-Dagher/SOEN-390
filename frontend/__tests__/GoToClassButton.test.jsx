/**
 * @file GoToClassButton.test.jsx
 * @description Tests the NextClassButton component for rendering, event updates, and navigation behavior.
 */

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import NextClassButton from "../app/components/Calendar/GoToClassButton";
import * as Location from "expo-location";
import { trackEvent } from "@aptabase/react-native";
import { useNavigation } from "@react-navigation/native";

// Mock navigation
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock expo-location
jest.mock("expo-location", () => ({
  getCurrentPositionAsync: jest.fn(),
}));

// Mock aptabase
jest.mock("@aptabase/react-native", () => ({
  trackEvent: jest.fn(),
}));

describe("NextClassButton", () => {
  let observer;

  beforeEach(() => {
    jest.clearAllMocks();
    observer = {
      callbacks: [],
      subscribe: function (cb) {
        this.callbacks.push(cb);
      },
      unsubscribe: function (cb) {
        this.callbacks = this.callbacks.filter((c) => c !== cb);
      },
      emit: function (events) {
        this.callbacks.forEach((cb) => cb(events));
      },
    };
  });

  it("does not render when there is no upcoming event", () => {
    const { queryByText } = render(<NextClassButton eventObserver={observer} />);
    observer.emit([]);
    expect(queryByText("Go to My Next Class")).toBeNull();
  });

  it("renders when there is an upcoming event", async () => {
    const futureTime = new Date(Date.now() + 100000).toISOString();
    const event = {
      start: { dateTime: futureTime },
      description: "SGW, H-110",
    };

    const { getByText } = render(<NextClassButton eventObserver={observer} />);
    observer.emit([event]);

    await waitFor(() => {
      expect(getByText("Go to My Next Class")).toBeTruthy();
    });
  });

  it("navigates to Navigation screen with correct params on press", async () => {
    const futureTime = new Date(Date.now() + 100000).toISOString();
    const event = {
      start: { dateTime: futureTime },
      description: "SGW, H-110",
    };

    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 45.5, longitude: -73.6 },
    });

    const { getByText } = render(<NextClassButton eventObserver={observer} />);
    observer.emit([event]);

    const button = await waitFor(() => getByText("Go to My Next Class"));
    fireEvent.press(button);

    await waitFor(() => {
      expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
      expect(trackEvent).toHaveBeenCalledWith("Next Class Button Clicked", {
        campus: "sgw",
        buildingName: "H-110",
        latitude: 45.5,
        longitude: -73.6,
      });
      expect(mockNavigate).toHaveBeenCalledWith("Navigation", {
        campus: "sgw",
        buildingName: "H-110",
        currentLocation: {
          latitude: 45.5,
          longitude: -73.6,
        },
      });
    });
  });

  it("handles errors during location fetch gracefully", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    const futureTime = new Date(Date.now() + 100000).toISOString();

    const event = {
      start: { dateTime: futureTime },
      description: "SGW, H-110",
    };

    Location.getCurrentPositionAsync.mockRejectedValue(new Error("Location error"));

    const { getByText } = render(<NextClassButton eventObserver={observer} />);
    observer.emit([event]);

    const button = await waitFor(() => getByText("Go to My Next Class"));
    fireEvent.press(button);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        "Error navigating to next class:",
        expect.any(Error)
      );
    });

    consoleError.mockRestore();
  });

  it("does not render if events are null", () => {
    const { queryByText } = render(<NextClassButton eventObserver={observer} />);
    observer.emit(null);
    expect(queryByText("Go to My Next Class")).toBeNull();
  });
  
  it("does not render if all events are in the past", () => {
    const pastTime = new Date(Date.now() - 100000).toISOString();
    const { queryByText } = render(<NextClassButton eventObserver={observer} />);
    observer.emit([
      { start: { dateTime: pastTime }, description: "SGW, H-110" },
      { start: { dateTime: pastTime }, description: "SGW, H-120" },
    ]);
    expect(queryByText("Go to My Next Class")).toBeNull();
  });
  
});
