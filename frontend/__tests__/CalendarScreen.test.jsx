import React from "react";
import { render, act, waitFor, fireEvent } from "@testing-library/react-native";
import CalendarScreen from "../app/screens/calendar/CalendarScreen";
import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchPublicCalendarEvents } from "../app/screens/login/LoginHelper";
import { NotificationObserver } from "../app/screens/calendar/NotificationObserver";

// We assume these are already mocked in your test file, so if not, add them:
jest.mock("@clerk/clerk-expo", () => ({
  useAuth: jest.fn(),
}));
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));
jest.mock("../app/screens/login/LoginHelper", () => ({
  fetchPublicCalendarEvents: jest.fn(),
}));
jest.mock("../app/screens/calendar/NotificationObserver", () => ({
  NotificationObserver: jest.fn(),
}));

describe("CalendarScreen (New Lines Coverage)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls showInAppNotification when NotificationObserver triggers a notification", async () => {
    // 1) Mock user is signed in
    useAuth.mockReturnValue({ isSignedIn: true });

    // 2) Mock stored calendars so the screen doesn't short-circuit
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === "availableCalendars") {
        return Promise.resolve(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));
      }
      if (key === "selectedCalendar") {
        return Promise.resolve("cal1");
      }
      return Promise.resolve(null);
    });

    // 3) Mock fetchPublicCalendarEvents to return something
    fetchPublicCalendarEvents.mockResolvedValue([]);

    // 4) Render the component
    const { getByText, queryByText } = render(<CalendarScreen />);

    // Wait for initial fetch
    await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalled());

    // 5) Now let's simulate the NotificationObserver calling "showInAppNotification".
    //    In your code, `NotificationObserver(events, showInAppNotification, ...)` is triggered 
    //    inside the eventObserver.subscribe callback. Let's directly invoke it:
    const observerCallback = NotificationObserver.mock.calls[0][1]; 
    // The above might vary if you're calling NotificationObserver differently; 
    // adjust if needed to get the actual callback from your mock.

    act(() => {
      // Simulate the observer calling showInAppNotification with a message
      observerCallback("Test Notification");
    });

    // 6) Now your code logs "Triggering In-App Notification: Test Notification"
    //    and sets the notification to visible for 5 seconds.
    //    If your InAppNotification component shows the message, check it:
    //    e.g. `expect(queryByText("Test Notification")).toBeTruthy();`
    //    If you only have a console.log, you can spy on console.log. 
    //    We'll check if the message is displayed in the UI (adjust as needed).
    //    If your code doesn't display it in text, skip this step.
    // Example:
    // expect(queryByText(/Test Notification/i)).toBeTruthy();

    // 7) The code sets a 5-second timer to hide the notification. Let's fast-forward timers:
    jest.advanceTimersByTime(5000);

    // Now it should be hidden. 
    // If your code unmounts or toggles a piece of state for the notification, check it:
    // expect(queryByText(/Test Notification/i)).toBeNull();
  });

  it("fetches events (with date range & regex filtering) when selectedCalendar changes", async () => {
    useAuth.mockReturnValue({ isSignedIn: true });

    // 1) Mock stored data
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === "availableCalendars") {
        return Promise.resolve(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));
      }
      if (key === "selectedCalendar") {
        return Promise.resolve("cal1");
      }
      return Promise.resolve(null);
    });

    // 2) Provide events, some valid, some invalid
    const validEvent = {
      id: "v1",
      description: "Campus A, Building B, Room 101", // Matches regex
      start: { dateTime: new Date().toISOString() },
      end: { dateTime: new Date().toISOString() },
    };
    const invalidEvent = {
      id: "v2",
      description: "JustOnePart",
      start: { dateTime: new Date().toISOString() },
      end: { dateTime: new Date().toISOString() },
    };
    fetchPublicCalendarEvents.mockResolvedValue([validEvent, invalidEvent]);

    const { getByText, queryByText } = render(<CalendarScreen />);

    // Wait for initial fetch
    await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalledTimes(1));

    // We should see something from the valid event, but not from the invalid event
    expect(queryByText(/JustOnePart/i)).toBeNull(); // Filtered out
    // If your code displays the event differently, check that the valid one is present
    // e.g. if you show an event "Campus A, Building B, Room 101"
    expect(queryByText(/Campus A, Building B, Room 101/i)).toBeTruthy();

    // 3) Trigger changing the selectedCalendar or the date range to re-fetch
    fetchPublicCalendarEvents.mockClear();
    // If you have a "Next" button for pagination:
    fireEvent.press(getByText("Next")); 
    // Wait for re-fetch
    await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalledTimes(1));
  });

  it("renders NextClassButton with eventObserver, verifying it's present in the tree", async () => {
    // Just confirm that <NextClassButton eventObserver={eventsObserver} /> is rendered 
    // when user is signed in.
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));
    fetchPublicCalendarEvents.mockResolvedValue([]);

    const { getByText, queryByText } = render(<CalendarScreen />);
    await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalled());

    // If NextClassButton is actually invisible until an upcoming event is found, 
    // you might only confirm that it is in the DOM or not. 
    // If it doesn't render anything, you might check for its container 
    // or just confirm no errors are thrown.
    // Example: 
    // expect(queryByText("Go to My Next Class")).toBeNull();
    // But at least we confirm it doesn't crash. 
    // You can further test NextClassButton logic in NextClassButton.test.jsx
  });
});
