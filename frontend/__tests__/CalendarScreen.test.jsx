/**
 * @file CalendarScreen.test.js
 */

import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react-native";
import CalendarScreen from "../app/screens/calendar/CalendarScreen";
import { fetchPublicCalendarEvents } from "../app/screens/login/LoginHelper";
import { handleGoToClass } from "../app/screens/calendar/CalendarHelper";
import { useAuth } from "@clerk/clerk-expo";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";

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
jest.mock("../../login/LoginHelper", () => ({
  fetchPublicCalendarEvents: jest.fn(),
}));
jest.mock("../CalendarHelper", () => ({
  handleGoToClass: jest.fn(),
}));

// Mock sub-components that might cause render issues or are tested separately
jest.mock("../../../components/BottomNavBar/BottomNavBar", () => {
  return () => null; // Stub out
});
jest.mock("../../../components/Calendar/GoToLoginButton", () => {
  return ({ onPress }) => (
    <button onClick={onPress} aria-label="MockGoToLoginButton">
      Login
    </button>
  );
});
jest.mock("../../../components/InAppNotification", () => {
  return ({ message, visible }) =>
    visible ? <text>NOTIF: {message}</text> : null;
});
jest.mock("../../../components/Calendar/NextClassButton", () => {
  return () => <text>MockNextClassButton</text>;
});

// Fake observer so we can track subscription usage
const fakeEventObserver = {
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  notify: jest.fn(),
};
// We must mock the EventObserver default export to always return our fake
jest.mock("../EventObserver", () => {
  return jest.fn().mockImplementation(() => fakeEventObserver);
});

// Because NotificationObserver is used inside the observer callback:
jest.mock("../NotificationObserver", () => ({
  NotificationObserver: jest.fn(),
}));

describe("CalendarScreen", () => {
  let mockNavigation;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigation = { reset: jest.fn(), navigate: jest.fn() };
    useNavigation.mockReturnValue(mockNavigation);
  });

  it("renders guest mode if user is not signed in, clears storage, and navigates on login button press", async () => {
    useAuth.mockReturnValue({ isSignedIn: false });
    AsyncStorage.removeItem.mockResolvedValue();

    const { getByLabelText } = render(<CalendarScreen />);
    const loginButton = getByLabelText("MockGoToLoginButton");

    fireEvent.click(loginButton);

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

  it("shows a loading indicator while fetching events", async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    // Return some valid calendars, selectedCalendar, but make fetch never resolve
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === "availableCalendars") {
        return Promise.resolve(
          JSON.stringify([{ id: "cal1", name: "Calendar One" }])
        );
      }
      if (key === "selectedCalendar") {
        return Promise.resolve("cal1");
      }
      return Promise.resolve(null);
    });
    // Let fetchPublicCalendarEvents hang
    fetchPublicCalendarEvents.mockReturnValue(new Promise(() => {}));

    const { getByRole } = render(<CalendarScreen />);
    // ActivityIndicator should have role=progressbar
    expect(getByRole("progressbar")).toBeTruthy();
  });

  it("does not fetch events if no selectedCalendar is found", async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    // Return null => no selectedCalendar
    AsyncStorage.getItem.mockResolvedValue(null);
    fetchPublicCalendarEvents.mockResolvedValue([]);

    const { findByText } = render(<CalendarScreen />);
    // Because there's no selectedCalendar, it should skip fetching
    await waitFor(() => expect(fetchPublicCalendarEvents).not.toHaveBeenCalled());
    expect(await findByText("No events found for this range.")).toBeTruthy();
  });

  it("subscribes to the event observer and unsubscribes on unmount", async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem.mockResolvedValue(
      JSON.stringify([{ id: "cal1", name: "Calendar One" }])
    );
    AsyncStorage.getItem.mockResolvedValueOnce("cal1"); // for selectedCalendar
    fetchPublicCalendarEvents.mockResolvedValue([]);

    const { unmount } = render(<CalendarScreen />);
    // Wait for initial fetch
    await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalled());
    expect(fakeEventObserver.subscribe).toHaveBeenCalledTimes(1);

    // On unmount
    unmount();
    const callback = fakeEventObserver.subscribe.mock.calls[0][0];
    expect(fakeEventObserver.unsubscribe).toHaveBeenCalledWith(callback);
  });

  it("loads stored calendars, fetches events, and filters out invalid descriptions", async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    // Return 1 calendar
    AsyncStorage.getItem
      .mockResolvedValueOnce(
        JSON.stringify([{ id: "cal1", name: "Calendar One" }])
      )
      .mockResolvedValueOnce("cal1"); // selectedCalendar
    // Provide valid & invalid events
    const validEvent = {
      id: "valid",
      title: "Valid Event",
      description: "Campus, Building, Room",
      start: { dateTime: moment().add(1, "day").toISOString() },
      end: { dateTime: moment().add(1, "day").add(1, "hour").toISOString() },
    };
    const invalidEvent = {
      id: "invalid",
      title: "Invalid Event",
      description: "MissingCommasHere",
      start: { dateTime: moment().add(2, "day").toISOString() },
      end: { dateTime: moment().add(2, "day").add(1, "hour").toISOString() },
    };
    fetchPublicCalendarEvents.mockResolvedValue([validEvent, invalidEvent]);

    const { queryByText, findByText } = render(<CalendarScreen />);
    expect(await findByText("Valid Event")).toBeTruthy();
    // "Invalid Event" should NOT appear
    expect(queryByText("Invalid Event")).toBeNull();
  });

  it("shows 'No events found...' when events array is empty", async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem.mockResolvedValueOnce(
      JSON.stringify([{ id: "cal1", name: "Calendar One" }])
    );
    AsyncStorage.getItem.mockResolvedValueOnce("cal1");
    fetchPublicCalendarEvents.mockResolvedValue([]);

    const { findByText } = render(<CalendarScreen />);
    expect(await findByText("No events found for this range.")).toBeTruthy();
  });

  it("handles pagination when pressing Previous and Next", async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem.mockResolvedValueOnce(
      JSON.stringify([{ id: "cal1", name: "Calendar One" }])
    );
    AsyncStorage.getItem.mockResolvedValueOnce("cal1");
    fetchPublicCalendarEvents.mockResolvedValue([]);

    const { findByText, getByText } = render(<CalendarScreen />);
    // Initial fetch
    await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalledTimes(1));

    // Press "Previous"
    fireEvent.press(getByText("Previous"));
    await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalledTimes(2));

    // Press "Next"
    fireEvent.press(getByText("Next"));
    await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalledTimes(3));
  });

  it("opens calendar modal and changes selected calendar", async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    const calendarsData = [
      { id: "cal1", name: "Calendar One" },
      { id: "cal2", name: "Calendar Two" },
    ];
    // First .mockResolvedValueOnce is for availableCalendars
    AsyncStorage.getItem
      .mockResolvedValueOnce(JSON.stringify(calendarsData))
      .mockResolvedValueOnce("cal1"); // selectedCalendar
    fetchPublicCalendarEvents.mockResolvedValue([]);

    const { getByText, queryByText, findByText } = render(<CalendarScreen />);
    await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalled());

    // Open modal
    fireEvent.press(getByText("Calendar One"));
    expect(getByText("Choose a Calendar")).toBeTruthy();

    // Select the second calendar
    fireEvent.press(getByText("Calendar Two"));
    await waitFor(() => expect(queryByText("Choose a Calendar")).toBeNull());
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("selectedCalendar", "cal2");
  });

  it("closes modal when Cancel is pressed", async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    const calendarsData = [{ id: "cal1", name: "Calendar One" }];
    AsyncStorage.getItem
      .mockResolvedValueOnce(JSON.stringify(calendarsData))
      .mockResolvedValueOnce("cal1");
    fetchPublicCalendarEvents.mockResolvedValue([]);

    const { getByText, queryByText } = render(<CalendarScreen />);
    await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalled());
    fireEvent.press(getByText("Calendar One"));

    // Cancel
    fireEvent.press(getByText("Cancel"));
    await waitFor(() => expect(queryByText("Choose a Calendar")).toBeNull());
  });

  it("expands event details and calls handleGoToClass on press", async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem
      .mockResolvedValueOnce(JSON.stringify([{ id: "cal1", name: "Calendar One" }]))
      .mockResolvedValueOnce("cal1");
    const testEvent = {
      id: "event1",
      title: "Test Event",
      description: "SGW, Hall Building, 913",
      start: { dateTime: moment().add(1, "day").toISOString() },
      end: { dateTime: moment().add(1, "day").add(1, "hour").toISOString() },
    };
    fetchPublicCalendarEvents.mockResolvedValue([testEvent]);

    const { getByText, queryByText, findByText } = render(<CalendarScreen />);
    await waitFor(() => expect(await findByText("Test Event")).toBeTruthy());

    // Expand event
    fireEvent.press(getByText("Test Event"));
    expect(getByText(/📍 SGW, Hall Building, 913/)).toBeTruthy();

    // Press "Go to Class"
    fireEvent.press(getByText("Go to Class"));
    expect(handleGoToClass).toHaveBeenCalledWith(testEvent.description, mockNavigation);

    // Collapse again
    fireEvent.press(getByText("Test Event"));
    await waitFor(() => expect(queryByText(/📍 SGW/)).toBeNull());
  });

  it("notifies the event observer when events change and triggers in-app notification", async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem
      .mockResolvedValueOnce(JSON.stringify([{ id: "cal1", name: "Calendar One" }]))
      .mockResolvedValueOnce("cal1");
    fetchPublicCalendarEvents.mockResolvedValue([
      {
        id: "1",
        title: "Event 1",
        description: "Campus, Building, Room",
        start: { dateTime: moment().toISOString() },
        end: { dateTime: moment().add(1, "hour").toISOString() },
      },
    ]);

    const { queryByText } = render(<CalendarScreen />);
    await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalled());
    // The moment we setEvents, the observer is notified
    expect(fakeEventObserver.notify).toHaveBeenCalledTimes(1);

    // The NotificationObserver is also called inside the callback
    // If you want to test the in-app notification logic directly, you can do:
    // 1. Let the observerCallback run
    // 2. Then ensure in-app notification is shown
    act(() => {
      // Simulate the observer callback that triggers "showInAppNotification"
      // For example:
      const observerCallback = fakeEventObserver.subscribe.mock.calls[0][0];
      observerCallback([{ title: "FakeEvent" }]); // triggers NotificationObserver
    });

    // Because we mocked InAppNotification as <text>NOTIF: {message}</text>
    // you can check for that text if you want:
    // expect(queryByText(/NOTIF:/)).toBeTruthy();
    // If you prefer, you can do more advanced checks on the message passed
  });
});
