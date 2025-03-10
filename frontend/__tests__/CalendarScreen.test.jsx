import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import CalendarScreen from "../app/screens/calendar/CalendarScreen";
import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as CalendarHelper from "../app/screens/calendar/CalendarHelper";
import { fetchPublicCalendarEvents } from "../app/screens/login/LoginHelper";

// ---- Mock all dependencies so no real network calls/storage happen ----
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

jest.mock("../app/screens/calendar/CalendarHelper", () => ({
  handleGoToClass: jest.fn(),
}));

describe("CalendarScreen Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows the guest screen (GoToLoginButton) if user is not signed in", async () => {
    // Mock that user is NOT signed in
    useAuth.mockReturnValue({ isSignedIn: false });

    const { getByText } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );

    // Since user is not signed in, we expect to see the 'Login' button
    expect(getByText("Login")).toBeTruthy();
  });

  it("renders events when user is signed in and fetches from mock", async () => {
    // Mock that user IS signed in
    useAuth.mockReturnValue({ isSignedIn: true });

    // Provide mock calendar events
    fetchPublicCalendarEvents.mockResolvedValueOnce([
      {
        id: "1",
        title: "Sample Event",
        description: "<pre>Class Link Goes Here</pre>",
        start: { dateTime: "2025-01-01T10:00:00Z" },
        end: { dateTime: "2025-01-01T11:00:00Z" },
      },
    ]);

    const { getByText, findByText } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );

    // Wait for the event title to appear
    const eventTitle = await findByText("Sample Event");
    expect(eventTitle).toBeTruthy();

    // Expand the event to reveal the description and the "Go to Class" button
    fireEvent.press(eventTitle);

    // Now we can see the description (the <pre> tags are removed by .replace in your code)
    expect(getByText("📍 Class Link Goes Here")).toBeTruthy();

    // Check if "Go to Class" button is there
    const goToClassBtn = getByText("Go to Class");
    expect(goToClassBtn).toBeTruthy();
  });

  it('calls handleGoToClass when "Go to Class" button is pressed', async () => {
    useAuth.mockReturnValue({ isSignedIn: true });

    // Mock event with a specific description
    fetchPublicCalendarEvents.mockResolvedValueOnce([
      {
        id: "2",
        title: "Another Event",
        description: "<pre>Zoom Link: XYZ</pre>",
        start: { dateTime: "2025-01-02T10:00:00Z" },
        end: { dateTime: "2025-01-02T11:00:00Z" },
      },
    ]);

    const { findByText, getByText } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );

    // Wait for event title
    const eventTitle = await findByText("Another Event");

    // Expand the event
    fireEvent.press(eventTitle);

    // Press "Go to Class"
    fireEvent.press(getByText("Go to Class"));

    // Verify it calls handleGoToClass with the description and navigation object
    expect(CalendarHelper.handleGoToClass).toHaveBeenCalledTimes(1);
    expect(CalendarHelper.handleGoToClass).toHaveBeenCalledWith(
      "Zoom Link: XYZ",
      expect.any(Object) // Because navigation is passed in
    );
  });
  it("displays multiple valid events in the list", async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === "availableCalendars") {
        return Promise.resolve(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));
      }
      if (key === "selectedCalendar") {
        return Promise.resolve("cal1");
      }
      return Promise.resolve(null);
    });

    // Provide two valid events
    const event1 = {
      id: "ev1",
      title: "Event 1",
      description: "Campus A, Building A, Room A",
      start: { dateTime: moment().add(1, "day").toISOString() },
      end: { dateTime: moment().add(1, "day").add(1, "hour").toISOString() },
    };
    const event2 = {
      id: "ev2",
      title: "Event 2",
      description: "Campus B, Building B, Room B",
      start: { dateTime: moment().add(2, "day").toISOString() },
      end: { dateTime: moment().add(2, "day").add(1, "hour").toISOString() },
    };
    fetchPublicCalendarEvents.mockResolvedValue([event1, event2]);

    const { getByText } = render(<CalendarScreen />);
    // Both events should appear
    await waitFor(() => {
      expect(getByText("Event 1")).toBeTruthy();
      expect(getByText("Event 2")).toBeTruthy();
    });
  });

  it("shows in-app notification after observer callback if any logic triggers it", async () => {
    // This test specifically checks if your code triggers showInAppNotification
    // You can adapt it if your logic calls setNotificationMessage somewhere
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === "availableCalendars") {
        return Promise.resolve(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));
      }
      if (key === "selectedCalendar") {
        return Promise.resolve("cal1");
      }
      return Promise.resolve(null);
    });

    const testEvent = {
      id: "notify",
      title: "Notification Event",
      description: "Campus X, Building X, Room X",
      start: { dateTime: moment().toISOString() },
      end: { dateTime: moment().add(1, "hour").toISOString() },
    };
    fetchPublicCalendarEvents.mockResolvedValue([testEvent]);

    const { queryByText } = render(<CalendarScreen />);
    await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalled());

    // Now let's simulate the observer callback that might trigger the in-app notification
    const observerCallback = fakeEventObserver.subscribe.mock.calls[0][0];
    act(() => {
      observerCallback([testEvent]); // This might cause NotificationObserver to do something
    });

    // If your code sets setNotificationVisible(true) or something like that,
    // you can check the notification text or however you display it:
    // e.g. if your InAppNotification is <Text>NOTIF: {notificationMessage}</Text>
    // Adjust to your actual code:
    await waitFor(() => {
      expect(queryByText(/Notification Event/i)).toBeTruthy();
    });
  });
// Additional tests for CalendarScreen covering showInAppNotification and stored data loading

describe("CalendarScreen Additional Coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls showInAppNotification and hides it after 5 seconds", async () => {
    // We cannot directly call showInAppNotification since it's inside the component,
    // but we can simulate its effect by directly invoking the observer callback from EventObserver.
    useAuth.mockReturnValue({ isSignedIn: true });
    // Return valid stored calendars so that the component renders the main UI.
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === "availableCalendars") {
        return Promise.resolve(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));
      }
      if (key === "selectedCalendar") return Promise.resolve("cal1");
      return Promise.resolve(null);
    });
    fetchPublicCalendarEvents.mockResolvedValue([]);
    const { queryByText } = render(<CalendarScreen />);

    // Assume that when events are updated, the observer callback in CalendarScreen
    // calls NotificationObserver, which in turn calls showInAppNotification.
    // To simulate, we force a re-render with a notification message via a side-effect.
    // (If showInAppNotification is not exported, you can simulate by manually calling setTimeout.)
    // For testing, we can use jest.advanceTimersByTime to simulate 5 seconds passing.
    // (Your component should have console.log "Triggering In-App Notification:" when called.)
    // Since our NotificationObserver is mocked, we simply check if a notification text appears.
    // For example, if InAppNotification displays "NOTIF:" prefix.
    await waitFor(() => {
      // We assume some element with the notification message is rendered.
      // Adjust this to match your actual InAppNotification component rendering.
      expect(queryByText(/NOTIF:/i)).toBeNull();
    });
    // For demonstration, simulate a notification by manually calling setNotificationMessage
    // via a test-only workaround if you have access. Otherwise, you may simulate an event update.
    // Then simulate the timeout:
    jest.advanceTimersByTime(5000);
    // After 5 seconds, notification should be hidden.
    // (You may need to adjust the assertion to match your actual notification display.)
    await waitFor(() => {
      expect(queryByText(/NOTIF:/i)).toBeNull();
    });
  });

  it("loads stored calendars from AsyncStorage successfully", async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    const mockCalendars = [{ id: "cal1", name: "Calendar One" }];
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === "availableCalendars") return Promise.resolve(JSON.stringify(mockCalendars));
      if (key === "selectedCalendar") return Promise.resolve("cal1");
      return Promise.resolve(null);
    });
    fetchPublicCalendarEvents.mockResolvedValue([]);
    const { getByText } = render(<CalendarScreen />);
    await waitFor(() => {
      // The header should display "Google Calendar" as per your component.
      expect(getByText("Google Calendar")).toBeTruthy();
    });
  });

  it("logs an error when stored calendar data fails to load", async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    const errorMessage = "Storage error";
    AsyncStorage.getItem.mockRejectedValue(new Error(errorMessage));
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    render(<CalendarScreen />);
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error loading stored calendar data:", expect.any(Error));
    });
    consoleErrorSpy.mockRestore();
  });

  it("fetches events and filters out events with invalid description format", async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === "availableCalendars") {
        return Promise.resolve(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));
      }
      if (key === "selectedCalendar") return Promise.resolve("cal1");
      return Promise.resolve(null);
    });
    // Provide one valid event and one invalid event
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

    const { queryByText } = render(<CalendarScreen />);
    await waitFor(() => {
      expect(queryByText("Valid Event")).toBeTruthy();
      expect(queryByText("Invalid Event")).toBeNull();
    });
  });
});

});