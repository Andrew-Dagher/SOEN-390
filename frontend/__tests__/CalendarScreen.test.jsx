import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import moment from "moment";
import CalendarScreen from "../app/screens/calendar/CalendarScreen";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchPublicCalendarEvents } from "../app/screens/login/LoginHelper";
import { handleGoToClass } from "../app/screens/calendar/CalendarHelper";

// --- Mocks ---

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

// Mock BottomNavBar, InAppNotification, and GoToLoginButton for simplicity.
jest.mock("../../components/BottomNavBar/BottomNavBar", () => () => <div>BottomNavBar</div>);
jest.mock("../../components/InAppNotification", () => (props) =>
  props.visible ? <div>{props.message}</div> : null
);
jest.mock("../../components/Calendar/GoToLoginButton", () => (props) => (
  <button onClick={props.onPress}>Login</button>
));

// Fake styles so our component renders without error.
jest.mock("./CalendarScreenStyles", () => ({
  guestContainer: { testID: "guestContainer" },
  bottomNavBar: { testID: "bottomNavBar" },
  loadingContainer: { testID: "loadingContainer" },
  screen: { testID: "screen" },
  header: { testID: "header" },
  paginationButton: { testID: "paginationButton" },
  paginationButtonText: {},
  headerText: {},
  centeredDateContainer: { testID: "centeredDateContainer" },
  centeredDateText: {},
  dropdownContainer: { testID: "dropdownContainer" },
  dropdownButton: { testID: "dropdownButton" },
  dropdownButtonText: {},
  modalOverlay: { testID: "modalOverlay" },
  modalDropdown: { testID: "modalDropdown" },
  modalTitle: {},
  modalItem: {},
  modalLastItem: {},
  modalItemText: {},
  modalCancel: { testID: "modalCancel" },
  modalCancelText: {},
  container: { testID: "container" },
  noEventsText: {},
  eventBox: { testID: "eventBox" },
  eventTitle: { testID: "eventTitle" },
  eventLocation: {},
  eventTime: {},
  nextClassButton: { testID: "nextClassButton" },
  nextClassButtonText: {},
}));

// For EventObserver, we create a fake instance with subscribe, unsubscribe, and notify.
const fakeEventObserver = {
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  notify: jest.fn(),
};
jest.mock("../app/screens/calendar/EventObserver", () => {
  return jest.fn().mockImplementation(() => fakeEventObserver);
});

// For NotificationObserver, we simulate it by immediately calling the provided showInAppNotification if events are present.
jest.mock("../app/screens/calendar/NotificationObserver", () => ({
  NotificationObserver: jest.fn((events, showInAppNotification, currentStartDate) => {
    if (events && events.length > 0) {
      showInAppNotification("Test Notification");
    }
  }),
}));

// Use fake timers for setTimeout in the in-app notification.
jest.useFakeTimers();

// --- Test Suite ---

describe("CalendarScreen", () => {
  let mockNavigation;
  beforeEach(() => {
    mockNavigation = { reset: jest.fn(), navigate: jest.fn() };
    useNavigation.mockReturnValue(mockNavigation);
    jest.clearAllMocks();
  });

  // --- Guest View ---
  describe("Guest view", () => {
    it("renders guest view when not signed in and handles login button press", async () => {
      useAuth.mockReturnValue({ isSignedIn: false });
      AsyncStorage.removeItem.mockResolvedValue();
      const { getByText } = render(<CalendarScreen />);
      // GoToLoginButton renders a button with text "Login"
      const loginButton = await waitFor(() => getByText("Login"));
      expect(loginButton).toBeTruthy();
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
  });

  // --- Loading State ---
  describe("Loading state", () => {
    it("shows an ActivityIndicator when events are being fetched", async () => {
      useAuth.mockReturnValue({ isSignedIn: true });
      // Simulate stored calendars so fetchEvents is attempted.
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === "availableCalendars")
          return Promise.resolve(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));
        if (key === "selectedCalendar") return Promise.resolve("cal1");
        return Promise.resolve(null);
      });
      // Return a pending promise.
      fetchPublicCalendarEvents.mockReturnValue(new Promise(() => {}));
      const { getByTestId } = render(<CalendarScreen />);
      // Our loading container is identified by testID "loadingContainer" (from our dummy styles)
      const loadingContainer = await waitFor(() => getByTestId("loadingContainer"));
      expect(loadingContainer).toBeTruthy();
    });
  });

  // --- Stored Data & Fetching Events ---
  describe("Stored calendar data & event fetching", () => {
    const calendarsData = [{ id: "cal1", name: "Calendar One" }];
    beforeEach(() => {
      useAuth.mockReturnValue({ isSignedIn: true });
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === "availableCalendars") return Promise.resolve(JSON.stringify(calendarsData));
        if (key === "selectedCalendar") return Promise.resolve("cal1");
        return Promise.resolve(null);
      });
    });

    it("loads stored calendars and sets selectedCalendar", async () => {
      fetchPublicCalendarEvents.mockResolvedValue([]);
      const { getByText } = render(<CalendarScreen />);
      await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalled());
      expect(getByText("Calendar One")).toBeTruthy();
    });

    it("logs error if loading stored calendar data fails", async () => {
      const errorMessage = "Storage error";
      AsyncStorage.getItem.mockRejectedValue(new Error(errorMessage));
      useAuth.mockReturnValue({ isSignedIn: true });
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      render(<CalendarScreen />);
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith("Error loading stored calendar data:", expect.any(Error));
      });
      consoleErrorSpy.mockRestore();
    });

    it("sets loading to false if no selectedCalendar is available", async () => {
      AsyncStorage.getItem.mockImplementation(() => Promise.resolve(null));
      useAuth.mockReturnValue({ isSignedIn: true });
      fetchPublicCalendarEvents.mockResolvedValue([]);
      const { getByText } = render(<CalendarScreen />);
      await waitFor(() => {
        expect(getByText("No events found for this range.")).toBeTruthy();
      });
    });

    it("fetches events, filters by regex, and sets loading to false", async () => {
      // Provide one valid event and one invalid event.
      const validEvent = {
        id: "event1",
        title: "Event 1",
        description: "Campus A, Building 1, Room 101",
        start: { dateTime: moment().add(1, "day").toISOString() },
        end: { dateTime: moment().add(1, "day").add(1, "hour").toISOString() },
      };
      const invalidEvent = {
        id: "event2",
        title: "Event 2",
        description: "Invalid description",
        start: { dateTime: moment().add(2, "day").toISOString() },
        end: { dateTime: moment().add(2, "day").add(1, "hour").toISOString() },
      };
      fetchPublicCalendarEvents.mockResolvedValue([validEvent, invalidEvent]);
      const { getByText, queryByText } = render(<CalendarScreen />);
      await waitFor(() => {
        expect(getByText("Event 1")).toBeTruthy();
      });
      // Invalid event should be filtered out.
      expect(queryByText("Event 2")).toBeNull();
    });
  });

  // --- Observer and Notification ---
  describe("EventObserver and In-App Notification", () => {
    it("subscribes to eventsObserver and unsubscribes on unmount", async () => {
      useAuth.mockReturnValue({ isSignedIn: true });
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));
      fetchPublicCalendarEvents.mockResolvedValue([]);
      const { unmount } = render(<CalendarScreen />);
      // The first useEffect subscribes to eventsObserver.
      const observerCallback = fakeEventObserver.subscribe.mock.calls[0][0];
      unmount();
      expect(fakeEventObserver.unsubscribe).toHaveBeenCalledWith(observerCallback);
    });

    it("calls NotificationObserver and shows in-app notification", async () => {
      useAuth.mockReturnValue({ isSignedIn: true });
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));
      fetchPublicCalendarEvents.mockResolvedValue([]);
      const { getByText, queryByText } = render(<CalendarScreen />);
      // Trigger NotificationObserver by simulating a notify call.
      act(() => {
        fakeEventObserver.notify([{ id: "dummy", title: "dummy", description: "Dummy, Dummy, Dummy", start: { dateTime: moment().toISOString() }, end: { dateTime: moment().toISOString() } }]);
      });
      await waitFor(() => expect(getByText("Test Notification")).toBeTruthy());
      // Advance timers to hide notification after 5 seconds.
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      await waitFor(() => expect(queryByText("Test Notification")).toBeNull());
    });
  });

  // --- UI: Main Screen, Pagination, and Modal ---
  describe("Main UI and interactions", () => {
    const calendarsData = [
      { id: "cal1", name: "Calendar One" },
      { id: "cal2", name: "Calendar Two" },
    ];
    beforeEach(() => {
      useAuth.mockReturnValue({ isSignedIn: true });
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === "availableCalendars") return Promise.resolve(JSON.stringify(calendarsData));
        if (key === "selectedCalendar") return Promise.resolve("cal1");
        return Promise.resolve(null);
      });
      fetchPublicCalendarEvents.mockResolvedValue([]);
    });

    it("renders header with pagination buttons and date range", async () => {
      const { getByText } = render(<CalendarScreen />);
      const headerText = await waitFor(() => getByText("Google Calendar"));
      expect(headerText).toBeTruthy();

      // Check date range text.
      const rangeText = moment().startOf("day").format("MMM DD") + " - " + moment().startOf("day").add(9, "days").format("MMM DD");
      expect(getByText(rangeText)).toBeTruthy();
    });

    it("updates date range when Previous and Next buttons are pressed", async () => {
      const { getByText } = render(<CalendarScreen />);
      await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalled());

      // Press Previous.
      fireEvent.press(getByText("Previous"));
      const prevRange = moment().startOf("day").subtract(10, "days").format("MMM DD") +
        " - " +
        moment().startOf("day").subtract(10, "days").add(9, "days").format("MMM DD");
      await waitFor(() => expect(getByText(prevRange)).toBeTruthy());

      // Press Next.
      fireEvent.press(getByText("Next"));
      await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalledTimes(2));
    });

    it("opens calendar selection modal and selects a new calendar", async () => {
      const { getByText, queryByText } = render(<CalendarScreen />);
      await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalled());
      // Dropdown button shows current calendar.
      const dropdown = getByText("Calendar One");
      fireEvent.press(dropdown);
      expect(getByText("Choose a Calendar")).toBeTruthy();

      // Select Calendar Two.
      fireEvent.press(getByText("Calendar Two"));
      await waitFor(() => {
        expect(queryByText("Choose a Calendar")).toBeNull();
      });
      expect(AsyncStorage.setItem).toHaveBeenCalledWith("selectedCalendar", "cal2");
    });

    it("closes calendar modal when Cancel or overlay is pressed", async () => {
      const { getByText, queryByText } = render(<CalendarScreen />);
      await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalled());
      fireEvent.press(getByText("Calendar One"));
      expect(getByText("Choose a Calendar")).toBeTruthy();
      // Press Cancel.
      fireEvent.press(getByText("Cancel"));
      await waitFor(() => expect(queryByText("Choose a Calendar")).toBeNull());

      // Open modal again.
      fireEvent.press(getByText("Calendar One"));
      expect(getByText("Choose a Calendar")).toBeTruthy();
      // Simulate overlay press (press the modal title text for example).
      fireEvent.press(getByText("Choose a Calendar"));
      await waitFor(() => expect(queryByText("Choose a Calendar")).toBeNull());
    });

    it("renders event list; expands and collapses events; and calls handleGoToClass", async () => {
      // Provide one valid event.
      const validEvent = {
        id: "event1",
        title: "Event 1",
        description: "Campus A, Building 1, Room 101",
        start: { dateTime: moment().add(1, "day").toISOString() },
        end: { dateTime: moment().add(1, "day").add(1, "hour").toISOString() },
      };
      fetchPublicCalendarEvents.mockResolvedValue([validEvent]);
      const { getByText, queryByText } = render(<CalendarScreen />);
      await waitFor(() => expect(getByText("Event 1")).toBeTruthy());
      // Expand the event.
      fireEvent.press(getByText("Event 1"));
      expect(getByText(/📍/)).toBeTruthy();
      // Press "Go to Class" button.
      fireEvent.press(getByText("Go to Class"));
      expect(handleGoToClass).toHaveBeenCalledWith(validEvent.description, mockNavigation);
      // Collapse event.
      fireEvent.press(getByText("Event 1"));
      await waitFor(() => expect(queryByText(/📍/)).toBeNull());
    });
  });
});