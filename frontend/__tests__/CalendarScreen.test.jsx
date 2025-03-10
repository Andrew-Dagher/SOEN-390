import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CalendarScreen from "../app/screens/calendar/CalendarScreen";
import { fetchPublicCalendarEvents } from "../app/screens/login/LoginHelper";
import { handleGoToClass } from "../app/screens/calendar/CalendarHelper";

// Mock dependencies
jest.mock("@clerk/clerk-expo", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("../app/screens/login/LoginHelper", () => ({
  fetchPublicCalendarEvents: jest.fn(),
}));

jest.mock("../app/screens/calendar/CalendarHelper", () => ({
  handleGoToClass: jest.fn(),
}));

// NotificationObserver is mocked to do nothing or minimal behavior
jest.mock("../app/screens/calendar/NotificationObserver", () => ({
  NotificationObserver: jest.fn(),
}));

// Fake EventObserver so we can track subscription usage
const fakeEventObserver = {
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  notify: jest.fn(),
};
jest.mock("../app/screens/calendar/EventObserver", () => {
  return jest.fn().mockImplementation(() => fakeEventObserver);
});

jest.useFakeTimers();

describe("CalendarScreen Component", () => {
  let mockNavigation;
  beforeEach(() => {
    mockNavigation = { reset: jest.fn(), navigate: jest.fn() };
    useNavigation.mockReturnValue(mockNavigation);
    jest.clearAllMocks();
  });

  // --- GUEST MODE ---
  it("renders guest mode if user is not signed in, calls removeItem, and resets nav on login press", async () => {
    useAuth.mockReturnValue({ isSignedIn: false });
    AsyncStorage.removeItem.mockResolvedValue();

    const { getByText } = render(<CalendarScreen />);
    const loginButton = await waitFor(() => getByText("Login"));
    fireEvent.press(loginButton);
    await waitFor(() => {
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("sessionId");
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("userData");
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("guestMode");
      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: "Login" }],
      });
    });
  });

  // --- LOADING STATE ---
  it("shows ActivityIndicator while events are being fetched", async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === "availableCalendars")
        return Promise.resolve(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));
      if (key === "selectedCalendar") return Promise.resolve("cal1");
      return Promise.resolve(null);
    });
    // Return a never-resolving promise => loading stays true
    fetchPublicCalendarEvents.mockReturnValue(new Promise(() => {}));

    const { getByRole } = render(<CalendarScreen />);
    const progressBar = await waitFor(() => getByRole("progressbar")); // ActivityIndicator has role=progressbar
    expect(progressBar).toBeTruthy();
  });

  // --- NO SELECTED CALENDAR ---
  it("does not fetch events if no selectedCalendar is stored", async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    // Return null for availableCalendars => no selectedCalendar
    AsyncStorage.getItem.mockResolvedValue(null);
    fetchPublicCalendarEvents.mockResolvedValue([]);
    const { getByText } = render(<CalendarScreen />);
    await waitFor(() => expect(fetchPublicCalendarEvents).not.toHaveBeenCalled());
    // Because selectedCalendar is null, loading is turned off, and we see "No events found..."
    expect(getByText("No events found for this range.")).toBeTruthy();
  });

  // --- ERROR LOADING STORED DATA ---
  it("logs an error when stored data fails to load", async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    const errorMessage = "Storage error";
    AsyncStorage.getItem.mockRejectedValue(new Error(errorMessage));
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    render(<CalendarScreen />);
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error loading stored calendar data:",
        expect.any(Error)
      );
    });
    consoleErrorSpy.mockRestore();
  });

  // --- SUBSCRIBE & UNSUBSCRIBE OBSERVER ---
  it("subscribes to the eventsObserver and unsubscribes on unmount", async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));
    fetchPublicCalendarEvents.mockResolvedValue([]);
    const { unmount } = render(<CalendarScreen />);
    // Wait for initial fetch
    await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalled());

    const observerCallback = fakeEventObserver.subscribe.mock.calls[0][0];
    unmount();
    expect(fakeEventObserver.unsubscribe).toHaveBeenCalledWith(observerCallback);
  });

  // --- LOAD CALENDARS & FETCH EVENTS ---
  it("loads calendars from storage, fetches events, and filters invalid descriptions", async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === "availableCalendars")
        return Promise.resolve(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));
      if (key === "selectedCalendar") return Promise.resolve("cal1");
      return Promise.resolve(null);
    });
    // Provide one valid event, one invalid
    const validEvent = {
      id: "event1",
      title: "Valid Event",
      description: "Campus A, Building 1, Room 101",
      start: { dateTime: moment().add(1, "day").toISOString() },
      end: { dateTime: moment().add(1, "day").add(1, "hour").toISOString() },
    };
    const invalidEvent = {
      id: "event2",
      title: "Invalid Event",
      description: "Missing commas",
      start: { dateTime: moment().add(2, "day").toISOString() },
      end: { dateTime: moment().add(2, "day").add(1, "hour").toISOString() },
    };
    fetchPublicCalendarEvents.mockResolvedValue([validEvent, invalidEvent]);

    const { getByText, queryByText } = render(<CalendarScreen />);
    await waitFor(() => expect(getByText("Valid Event")).toBeTruthy());
    expect(queryByText("Invalid Event")).toBeNull(); // Filtered out
  });

  // --- PAGINATION ---
  it("updates date range and refetches events when pressing Previous or Next", async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === "availableCalendars")
        return Promise.resolve(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));
      if (key === "selectedCalendar") return Promise.resolve("cal1");
      return Promise.resolve(null);
    });
    fetchPublicCalendarEvents.mockResolvedValue([]);
    const { getByText } = render(<CalendarScreen />);
    await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalledTimes(1));

    // Press "Previous"
    fireEvent.press(getByText("Previous"));
    await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalledTimes(2));

    // Press "Next"
    fireEvent.press(getByText("Next"));
    await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalledTimes(3));
  });

  // --- CALENDAR MODAL ---
  it("opens calendar selection modal and changes selected calendar", async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    const calendarsData = [
      { id: "cal1", name: "Calendar One" },
      { id: "cal2", name: "Calendar Two" },
    ];
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === "availableCalendars") return Promise.resolve(JSON.stringify(calendarsData));
      if (key === "selectedCalendar") return Promise.resolve("cal1");
      return Promise.resolve(null);
    });
    fetchPublicCalendarEvents.mockResolvedValue([]);

    const { getByText, queryByText } = render(<CalendarScreen />);
    await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalled());

    fireEvent.press(getByText("Calendar One")); // open modal
    expect(getByText("Choose a Calendar")).toBeTruthy();

    fireEvent.press(getByText("Calendar Two"));
    await waitFor(() => {
      expect(queryByText("Choose a Calendar")).toBeNull();
    });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("selectedCalendar", "cal2");
  });

  it("closes modal when Cancel is pressed or overlay is tapped", async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    const calendarsData = [{ id: "cal1", name: "Calendar One" }];
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === "availableCalendars") return Promise.resolve(JSON.stringify(calendarsData));
      if (key === "selectedCalendar") return Promise.resolve("cal1");
      return Promise.resolve(null);
    });
    fetchPublicCalendarEvents.mockResolvedValue([]);

    const { getByText, queryByText } = render(<CalendarScreen />);
    await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalled());
    fireEvent.press(getByText("Calendar One"));
    expect(getByText("Choose a Calendar")).toBeTruthy();

    // Press cancel
    fireEvent.press(getByText("Cancel"));
    await waitFor(() => expect(queryByText("Choose a Calendar")).toBeNull());

    // Reopen
    fireEvent.press(getByText("Calendar One"));
    expect(getByText("Choose a Calendar")).toBeTruthy();
    // Press overlay
    fireEvent.press(getByText("Choose a Calendar"));
    await waitFor(() => expect(queryByText("Choose a Calendar")).toBeNull());
  });

  // --- EVENTS LIST ---
  it("shows 'No events found...' when events array is empty", async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));
    fetchPublicCalendarEvents.mockResolvedValue([]);
    const { getByText } = render(<CalendarScreen />);
    await waitFor(() => expect(getByText("No events found for this range.")).toBeTruthy());
  });

  it("expands an event, shows details, and calls handleGoToClass", async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));
    const event = {
      id: "event1",
      title: "Event 1",
      description: "Campus A, Building 1, Room 101",
      start: { dateTime: moment().add(1, "day").toISOString() },
      end: { dateTime: moment().add(1, "day").add(1, "hour").toISOString() },
    };
    fetchPublicCalendarEvents.mockResolvedValue([event]);

    const { getByText, queryByText } = render(<CalendarScreen />);
    await waitFor(() => expect(getByText("Event 1")).toBeTruthy());
    // Expand
    fireEvent.press(getByText("Event 1"));
    expect(getByText(/📍/)).toBeTruthy();
    // Press "Go to Class"
    fireEvent.press(getByText("Go to Class"));
    expect(handleGoToClass).toHaveBeenCalledWith(event.description, mockNavigation);
    // Collapse
    fireEvent.press(getByText("Event 1"));
    await waitFor(() => expect(queryByText(/📍/)).toBeNull());
  });

  it("handles multiple expansions, toggling between events if needed", async () => {
    // We test that pressing a second event collapses the first if expandedEvent is set by ID
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));

    const eventA = {
      id: "A",
      title: "Event A",
      description: "Campus A, Building 1, Room 101",
      start: { dateTime: moment().add(1, "day").toISOString() },
      end: { dateTime: moment().add(1, "day").add(1, "hour").toISOString() },
    };
    const eventB = {
      id: "B",
      title: "Event B",
      description: "Campus B, Building 2, Room 202",
      start: { dateTime: moment().add(2, "day").toISOString() },
      end: { dateTime: moment().add(2, "day").add(1, "hour").toISOString() },
    };
    fetchPublicCalendarEvents.mockResolvedValue([eventA, eventB]);

    const { getByText, queryByText } = render(<CalendarScreen />);
    await waitFor(() => expect(getByText("Event A")).toBeTruthy());
    // Expand A
    fireEvent.press(getByText("Event A"));
    expect(getByText(/Campus A/)).toBeTruthy();
    // Expand B => should collapse A
    fireEvent.press(getByText("Event B"));
    expect(getByText(/Campus B/)).toBeTruthy();
    expect(queryByText(/Campus A/)).toBeNull();
  });
});