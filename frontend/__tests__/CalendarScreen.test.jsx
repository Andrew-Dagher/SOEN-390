// CalendarScreen.test.jsx
// This file does not use inline jest.mock() calls for calendar-related modules.
// Instead, it manually overrides functions/properties after import.

import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import moment from "moment";

// Import the component under test
import CalendarScreen from "../app/screens/calendar/CalendarScreen";

// Import modules that CalendarScreen depends on
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ClerkExpo from "@clerk/clerk-expo";
import * as NavigationNative from "@react-navigation/native";
import * as LoginHelper from "../app/screens/login/LoginHelper";
import * as CalendarHelper from "../app/screens/calendar/CalendarHelper";
import * as NotificationObserverModule from "../app/screens/calendar/NotificationObserver";

// --- Manual Overrides of Dependencies ---
// Override useAuth to be a stub that we can change per test.
ClerkExpo.useAuth = () => ({ isSignedIn: false });
// Override useNavigation to return a stub navigation object.
NavigationNative.useNavigation = () => ({
  reset: jest.fn(),
  navigate: jest.fn(),
  replace: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
});

// Override AsyncStorage methods with jest functions.
AsyncStorage.getItem = jest.fn();
AsyncStorage.setItem = jest.fn();
AsyncStorage.removeItem = jest.fn();

// Override fetchPublicCalendarEvents to be a jest function.
LoginHelper.fetchPublicCalendarEvents = jest.fn();

// Override handleGoToClass to be a jest function.
CalendarHelper.handleGoToClass = jest.fn();

// Override NotificationObserver to return a fake observer.
// We also create a local variable so we can simulate calls.
const fakeObserver = {
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  notify: jest.fn(),
};
NotificationObserverModule.NotificationObserver = () => fakeObserver;

// Ensure that any module (like react-native-css-interop) is manually mocked in your __mocks__ folder.
// For example, in __mocks__/react-native-css-interop.js, have:
//   module.exports = {};

jest.useFakeTimers();

describe("CalendarScreen - Comprehensive Tests", () => {
  // We’ll override useAuth per test as needed.
  let navigationStub;
  beforeEach(() => {
    // Reset manual stubs before each test.
    navigationStub = {
      reset: jest.fn(),
      navigate: jest.fn(),
      replace: jest.fn(),
      addListener: jest.fn(() => jest.fn()),
    };
    NavigationNative.useNavigation = () => navigationStub;
    // Reset AsyncStorage methods.
    AsyncStorage.getItem.mockReset();
    AsyncStorage.setItem.mockReset();
    AsyncStorage.removeItem.mockReset();
    // Reset fetchPublicCalendarEvents and handleGoToClass.
    LoginHelper.fetchPublicCalendarEvents.mockReset();
    CalendarHelper.handleGoToClass.mockReset();
    // Reset fake observer
    fakeObserver.subscribe.mockReset();
    fakeObserver.unsubscribe.mockReset();
    fakeObserver.notify.mockReset();
  });

  // --- Guest Mode & Basic Rendering ---
  it("renders guest mode if user is not signed in and shows the Login button", async () => {
    // Override useAuth to return not-signed-in.
    ClerkExpo.useAuth = () => ({ isSignedIn: false });
    AsyncStorage.removeItem.mockResolvedValue();

    let screen;
    await act(async () => {
      screen = render(<CalendarScreen />);
    });

    // Expect that the rendered output includes a button with text "Login"
    // (Assuming your manual __mocks__ for GoToLoginButton renders a button with title "Login")
    const loginButton = screen.getByText("Login");
    expect(loginButton).toBeTruthy();

    await act(async () => {
      fireEvent.press(loginButton);
    });

    await waitFor(() => {
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("sessionId");
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("userData");
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("guestMode");
      expect(navigationStub.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: "Login" }],
      });
    });
  });

  it("shows a loading indicator while fetching events", async () => {
    ClerkExpo.useAuth = () => ({ isSignedIn: true });
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === "availableCalendars") {
        return Promise.resolve(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));
      }
      if (key === "selectedCalendar") {
        return Promise.resolve("cal1");
      }
      return Promise.resolve(null);
    });
    // Simulate a never-resolving fetch so that loading indicator remains.
    LoginHelper.fetchPublicCalendarEvents.mockReturnValue(new Promise(() => {}));

    let screen;
    await act(async () => {
      screen = render(<CalendarScreen />);
    });
    // Assume that the loading indicator has a testID of "loading-indicator" (or role "progressbar")
    // Adjust the query according to your implementation.
    expect(screen.getByRole("progressbar")).toBeTruthy();
  });

  it("does not fetch events if no selectedCalendar is stored", async () => {
    ClerkExpo.useAuth = () => ({ isSignedIn: true });
    AsyncStorage.getItem.mockResolvedValue(null);
    LoginHelper.fetchPublicCalendarEvents.mockResolvedValue([]);
    let screen;
    await act(async () => {
      screen = render(<CalendarScreen />);
    });
    await waitFor(() => {
      expect(LoginHelper.fetchPublicCalendarEvents).not.toHaveBeenCalled();
    });
    expect(await screen.findByText("No events found for this range.")).toBeTruthy();
  });

  // --- Stored Data & Error Handling ---
  it("logs an error when stored data fails to load", async () => {
    ClerkExpo.useAuth = () => ({ isSignedIn: true });
    const errorMessage = "Storage error";
    AsyncStorage.getItem.mockRejectedValue(new Error(errorMessage));
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    await act(async () => {
      render(<CalendarScreen />);
    });
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error loading stored calendar data:", expect.any(Error));
    });
    consoleErrorSpy.mockRestore();
  });

  // --- Observer & In-App Notification ---
  it("subscribes to the observer and unsubscribes on unmount", async () => {
    ClerkExpo.useAuth = () => ({ isSignedIn: true });
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));
    LoginHelper.fetchPublicCalendarEvents.mockResolvedValue([]);
    let screen;
    await act(async () => {
      screen = render(<CalendarScreen />);
    });
    await waitFor(() => expect(LoginHelper.fetchPublicCalendarEvents).toHaveBeenCalledTimes(1));
    // Assume that CalendarScreen calls fakeObserver.subscribe(callback)
    const callback = fakeObserver.subscribe.mock.calls[0][0];
    await act(async () => {
      screen.unmount();
    });
    expect(fakeObserver.unsubscribe).toHaveBeenCalledWith(callback);
  });

  it("triggers in-app notification and hides it after 5 sec", async () => {
    ClerkExpo.useAuth = () => ({ isSignedIn: true });
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));
    LoginHelper.fetchPublicCalendarEvents.mockResolvedValue([]);
    let screen;
    await act(async () => {
      screen = render(<CalendarScreen />);
    });
    // Simulate the observer triggering a notification.
    await act(async () => {
      fakeObserver.notify([{ title: "FakeEvent" }]);
    });
    let notif;
    await waitFor(() => {
      notif = screen.queryByTestId("in-app-notif");
      expect(notif).toBeTruthy();
    });
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    await waitFor(() => {
      expect(screen.queryByTestId("in-app-notif")).toBeNull();
    });
  });

  // --- Fetching & Filtering Events ---
  it("fetches events, filters out invalid descriptions, and sets state", async () => {
    ClerkExpo.useAuth = () => ({ isSignedIn: true });
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === "availableCalendars") {
        return Promise.resolve(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));
      }
      if (key === "selectedCalendar") {
        return Promise.resolve("cal1");
      }
      return Promise.resolve(null);
    });
    const validEvent = {
      id: "v1",
      title: "Valid Event",
      description: "Campus A, Building 1, Room 101", // valid format
      start: { dateTime: moment().add(1, "day").toISOString() },
      end: { dateTime: moment().add(1, "day").add(1, "hour").toISOString() },
    };
    const invalidEvent = {
      id: "v2",
      title: "Invalid Event",
      description: "MissingCommasHere",
      start: { dateTime: moment().add(2, "day").toISOString() },
      end: { dateTime: moment().add(2, "day").add(1, "hour").toISOString() },
    };
    LoginHelper.fetchPublicCalendarEvents.mockResolvedValue([validEvent, invalidEvent]);
    let screen;
    await act(async () => {
      screen = render(<CalendarScreen />);
    });
    expect(await screen.findByText("Valid Event")).toBeTruthy();
    expect(screen.queryByText("Invalid Event")).toBeNull();
  });

  it("updates date range when pressing Previous or Next and refetches events", async () => {
    ClerkExpo.useAuth = () => ({ isSignedIn: true });
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === "availableCalendars") {
        return Promise.resolve(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));
      }
      if (key === "selectedCalendar") return Promise.resolve("cal1");
      return Promise.resolve(null);
    });
    LoginHelper.fetchPublicCalendarEvents.mockResolvedValue([]);
    let screen;
    await act(async () => {
      screen = render(<CalendarScreen />);
    });
    await waitFor(() => expect(LoginHelper.fetchPublicCalendarEvents).toHaveBeenCalledTimes(1));
    await act(async () => {
      fireEvent.press(screen.getByText("Previous"));
    });
    await waitFor(() => expect(LoginHelper.fetchPublicCalendarEvents).toHaveBeenCalledTimes(2));
    await act(async () => {
      fireEvent.press(screen.getByText("Next"));
    });
    await waitFor(() => expect(LoginHelper.fetchPublicCalendarEvents).toHaveBeenCalledTimes(3));
  });

  // --- Calendar Modal & Selection ---
  it("opens calendar selection modal and changes selected calendar", async () => {
    ClerkExpo.useAuth = () => ({ isSignedIn: true });
    const calendarsData = [
      { id: "cal1", name: "Calendar One" },
      { id: "cal2", name: "Calendar Two" },
    ];
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === "availableCalendars")
        return Promise.resolve(JSON.stringify(calendarsData));
      if (key === "selectedCalendar") return Promise.resolve("cal1");
      return Promise.resolve(null);
    });
    LoginHelper.fetchPublicCalendarEvents.mockResolvedValue([]);
    let screen;
    await act(async () => {
      screen = render(<CalendarScreen />);
    });
    await waitFor(() => expect(LoginHelper.fetchPublicCalendarEvents).toHaveBeenCalled());
    await act(async () => {
      fireEvent.press(screen.getByText("Calendar One"));
    });
    expect(screen.getByText("Choose a Calendar")).toBeTruthy();
    await act(async () => {
      fireEvent.press(screen.getByText("Calendar Two"));
    });
    await waitFor(() => {
      expect(screen.queryByText("Choose a Calendar")).toBeNull();
    });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("selectedCalendar", "cal2");
  });

  it("closes calendar modal when Cancel is pressed", async () => {
    ClerkExpo.useAuth = () => ({ isSignedIn: true });
    const calendarsData = [{ id: "cal1", name: "Calendar One" }];
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === "availableCalendars")
        return Promise.resolve(JSON.stringify(calendarsData));
      if (key === "selectedCalendar") return Promise.resolve("cal1");
      return Promise.resolve(null);
    });
    LoginHelper.fetchPublicCalendarEvents.mockResolvedValue([]);
    let screen;
    await act(async () => {
      screen = render(<CalendarScreen />);
    });
    await waitFor(() => expect(LoginHelper.fetchPublicCalendarEvents).toHaveBeenCalled());
    await act(async () => {
      fireEvent.press(screen.getByText("Calendar One"));
    });
    expect(screen.getByText("Choose a Calendar")).toBeTruthy();
    await act(async () => {
      fireEvent.press(screen.getByText("Cancel"));
    });
    await waitFor(() => expect(screen.queryByText("Choose a Calendar")).toBeNull());
  });

  // --- Expanding Events & handleGoToClass ---
  it("expands an event, shows details, and calls handleGoToClass when 'Go to Class' is pressed", async () => {
    ClerkExpo.useAuth = () => ({ isSignedIn: true });
    AsyncStorage.getItem.mockReturnValue(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));
    const event = {
      id: "event1",
      title: "Event 1",
      description: "Campus A, Building 1, Room 101",
      start: { dateTime: moment().add(1, "day").toISOString() },
      end: { dateTime: moment().add(1, "day").add(1, "hour").toISOString() },
    };
    LoginHelper.fetchPublicCalendarEvents.mockResolvedValue([event]);
    let screen;
    await act(async () => {
      screen = render(<CalendarScreen />);
    });
    expect(await screen.findByText("Event 1")).toBeTruthy();
    await act(async () => {
      fireEvent.press(screen.getByText("Event 1"));
    });
    expect(screen.getByText(/📍 Campus A, Building 1, Room 101/)).toBeTruthy();
    await act(async () => {
      fireEvent.press(screen.getByText("Go to Class"));
    });
    expect(CalendarHelper.handleGoToClass).toHaveBeenCalledWith(event.description, navigationStub);
    await act(async () => {
      fireEvent.press(screen.getByText("Event 1"));
    });
    await waitFor(() => expect(screen.queryByText(/📍/)).toBeNull());
  });

  it("handles multiple event expansions (only one expanded at a time)", async () => {
    ClerkExpo.useAuth = () => ({ isSignedIn: true });
    AsyncStorage.getItem.mockReturnValue(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));
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
    LoginHelper.fetchPublicCalendarEvents.mockResolvedValue([eventA, eventB]);
    let screen;
    await act(async () => {
      screen = render(<CalendarScreen />);
    });
    expect(await screen.findByText("Event A")).toBeTruthy();
    act(() => {
      fireEvent.press(screen.getByText("Event A"));
    });
    expect(screen.getByText(/Campus A/)).toBeTruthy();
    act(() => {
      fireEvent.press(screen.getByText("Event B"));
    });
    expect(screen.getByText(/Campus B/)).toBeTruthy();
    expect(screen.queryByText(/Campus A/)).toBeNull();
  });

  // --- NextClassButton Rendering ---
  it("renders NextClassButton within CalendarScreen without crashing", async () => {
    ClerkExpo.useAuth = () => ({ isSignedIn: true });
    AsyncStorage.getItem.mockReturnValue(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));
    LoginHelper.fetchPublicCalendarEvents.mockResolvedValue([]);
    let screen;
    await act(async () => {
      screen = render(<CalendarScreen />);
    });
    expect(screen.toJSON()).toBeTruthy();
  });
});
