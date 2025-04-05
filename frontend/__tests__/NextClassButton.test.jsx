import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import NextClassButton from "../app/components/Calendar/NextClassButton";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import { trackEvent } from "@aptabase/react-native";

jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));

jest.mock("expo-location", () => ({
  getCurrentPositionAsync: jest.fn(),
}));

jest.mock("@aptabase/react-native", () => ({
  trackEvent: jest.fn(),
}));

describe("NextClassButton", () => {
  const mockNavigate = jest.fn();
  const now = new Date();
  const futureEvent = {
    start: { dateTime: new Date(now.getTime() + 60000).toISOString() },
    description: "TestCampus, TestBuilding",
  };

  const eventObserver = {
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigation.mockReturnValue({ navigate: mockNavigate });
  });

  it("subscribes and unsubscribes to observer", () => {
    const { unmount } = render(<NextClassButton eventObserver={eventObserver} />);
    expect(eventObserver.subscribe).toHaveBeenCalledTimes(1);
    unmount();
    expect(eventObserver.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("renders button when next event exists", async () => {
    let callback;
    eventObserver.subscribe.mockImplementation((cb) => (callback = cb));

    const { getByText } = render(<NextClassButton eventObserver={eventObserver} />);

    await act(async () => {
      callback([futureEvent]);
    });

    await waitFor(() => {
      expect(getByText("Go to My Next Class")).toBeTruthy();
    });
  });

  it("navigates and tracks event when button is pressed", async () => {
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 1, longitude: 2 },
    });

    let callback;
    eventObserver.subscribe.mockImplementation((cb) => (callback = cb));

    const { getByText } = render(<NextClassButton eventObserver={eventObserver} />);

    await act(async () => {
      callback([futureEvent]);
    });

    const button = await waitFor(() => getByText("Go to My Next Class"));
    fireEvent.press(button);

    await waitFor(() => {
      expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
      expect(trackEvent).toHaveBeenCalledWith("Next Class Button Clicked", {
        campus: "testcampus",
        buildingName: "TestBuilding",
        latitude: 1,
        longitude: 2,
      });
      expect(mockNavigate).toHaveBeenCalledWith("Navigation", {
        campus: "testcampus",
        buildingName: "TestBuilding",
        currentLocation: { latitude: 1, longitude: 2 },
      });
    });
  });

  it("handles location errors gracefully", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    Location.getCurrentPositionAsync.mockRejectedValue(new Error("Location fail"));

    let callback;
    eventObserver.subscribe.mockImplementation((cb) => (callback = cb));

    const { getByText } = render(<NextClassButton eventObserver={eventObserver} />);

    await act(async () => {
      callback([futureEvent]);
    });

    const button = await waitFor(() => getByText("Go to My Next Class"));
    fireEvent.press(button);

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith("Error navigating to next class:", expect.any(Error));
    });

    errorSpy.mockRestore();
  });

  it("does not render when no upcoming events", async () => {
    let callback;
    eventObserver.subscribe.mockImplementation((cb) => (callback = cb));

    const { queryByText } = render(<NextClassButton eventObserver={eventObserver} />);

    await act(async () => {
      callback([]);
    });

    await waitFor(() => {
      expect(queryByText("Go to My Next Class")).toBeNull();
    });
  });
});