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

// These components are not our focus so we return simple mocks.
jest.mock("../../components/BottomNavBar/BottomNavBar", () => "BottomNavBar");
jest.mock("../../components/InAppNotification", () => (props) =>
  props.visible ? <>{props.message}</> : null
);
jest.mock("../../components/Calendar/GoToLoginButton", () => (props) => (
  <TouchableOpacity onPress={props.onPress}>
    <Text>Login</Text>
  </TouchableOpacity>
));

// For EventObserver we simulate subscribe, unsubscribe and notify.
const fakeEventObserver = {
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  notify: jest.fn(),
};
jest.mock("../app/screens/calendar/EventObserver", () => {
  return jest.fn().mockImplementation(() => fakeEventObserver);
});

// Override NotificationObserver to immediately trigger a notification when events exist.
jest.mock("../app/screens/calendar/NotificationObserver", () => ({
  NotificationObserver: jest.fn((events, showInAppNotification, currentStartDate) => {
    if (events && events.length > 0) {
      showInAppNotification("Test Notification");
    }
  }),
}));

// Dummy styles for our component.
jest.mock("./CalendarScreenStyles", () => ({
  guestContainer: {},
  bottomNavBar: {},
  loadingContainer: {},
  screen: {},
  header: {},
  paginationButton: {},
  paginationButtonText: {},
  headerText: {},
  centeredDateContainer: {},
  centeredDateText: {},
  dropdownContainer: {},
  dropdownButton: {},
  dropdownButtonText: {},
  modalOverlay: {},
  modalDropdown: {},
  modalTitle: {},
  modalItem: {},
  modalLastItem: {},
  modalItemText: {},
  modalCancel: {},
  modalCancelText: {},
  container: {},
  noEventsText: {},
  eventBox: {},
  eventTitle: {},
  eventLocation: {},
  eventTime: {},
  nextClassButton: {},
  nextClassButtonText: {},
}));

// For React Native components.
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

// Use fake timers for setTimeout.
jest.useFakeTimers();

// --- Test Suite ---

describe("CalendarScreen", () => {
  let mockNavigation;
  beforeEach(() => {
    mockNavigation = { reset: jest.fn(), navigate: jest.fn() };
    useNavigation.mockReturnValue(mockNavigation);
    jest.clearAllMocks();
  });

  // --- Guest View Tests ---
  describe("Guest view", () => {
    it("renders guest view when not signed in and handles login button press", async () => {
      useAuth.mockReturnValue({ isSignedIn: false });
      AsyncStorage.removeItem.mockResolvedValue();
      const { getByText } = render(<CalendarScreen />);
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

  // --- Loading State Tests ---
  describe("Loading state", () => {
    it("renders an ActivityIndicator while events are being fetched", async () => {
      useAuth.mockReturnValue({ isSignedIn: true });
      // Simulate stored calendars and selected calendar so fetchEvents is called.
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === "availableCalendars")
          return Promise.resolve(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));
        if (key === "selectedCalendar") return Promise.resolve("cal1");
        return Promise.resolve(null);
      });
      // Never-resolving promise simulates pending fetch.
      fetchPublicCalendarEvents.mockReturnValue(new Promise(() => {}));
      const { getByRole } = render(<CalendarScreen />);
      const indicator = await waitFor(() => getByRole("progressbar"));
      expect(indicator).toBeTruthy();
    });
  });

  // --- Main UI and Events ---
  describe("Main UI and events", () => {
    const sampleValidEvent = {
      id: "event1",
      title: "Event 1",
      description: "Campus A, Building 1, Room 101",
      start: { dateTime: moment().add(1, "day").toISOString() },
      end: { dateTime: moment().add(1, "day").add(1, "hour").toISOString() },
    };
    const sampleInvalidEvent = {
      id: "event2",
      title: "Event 2",
      description: "Invalid description",
      start: { dateTime: moment().add(2, "day").toISOString() },
      end: { dateTime: moment().add(2, "day").add(1, "hour").toISOString() },
    };

    beforeEach(() => {
      useAuth.mockReturnValue({ isSignedIn: true });
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === "availableCalendars")
          return Promise.resolve(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));
        if (key === "selectedCalendar") return Promise.resolve("cal1");
        return Promise.resolve(null);
      });
    });

    it('renders "No events found for this range." when fetch returns an empty array', async () => {
      fetchPublicCalendarEvents.mockResolvedValue([]);
      const { getByText } = render(<CalendarScreen />);
      await waitFor(() => {
        expect(getByText("No events found for this range.")).toBeTruthy();
      });
    });

    it("renders event list with valid events and filters out invalid events", async () => {
      fetchPublicCalendarEvents.mockResolvedValue([sampleValidEvent, sampleInvalidEvent]);
      const { getByText, queryByText } = render(<CalendarScreen />);
      await waitFor(() => {
        expect(getByText("Event 1")).toBeTruthy();
        expect(queryByText("Event 2")).toBeNull();
      });
    });

    it('expands an event and triggers "Go to Class" button press', async () => {
      fetchPublicCalendarEvents.mockResolvedValue([sampleValidEvent]);
      const { getByText } = render(<CalendarScreen />);
      await waitFor(() => getByText("Event 1"));
      fireEvent.press(getByText("Event 1"));
      const goToClassButton = getByText("Go to Class");
      expect(goToClassButton).toBeTruthy();
      fireEvent.press(goToClassButton);
      expect(handleGoToClass).toHaveBeenCalledWith(sampleValidEvent.description, mockNavigation);
    });

    it("toggles event expansion on repeated presses", async () => {
      fetchPublicCalendarEvents.mockResolvedValue([sampleValidEvent]);
      const { getByText, queryByText } = render(<CalendarScreen />);
      await waitFor(() => getByText("Event 1"));
      // Expand event.
      fireEvent.press(getByText("Event 1"));
      expect(getByText(/📍/)).toBeTruthy();
      // Collapse event.
      fireEvent.press(getByText("Event 1"));
      await waitFor(() => {
        expect(queryByText(/📍/)).toBeNull();
      });
    });
  });

  // --- Pagination and Date Range ---
  describe("Pagination and Date Range", () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ isSignedIn: true });
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === "availableCalendars")
          return Promise.resolve(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));
        if (key === "selectedCalendar") return Promise.resolve("cal1");
        return Promise.resolve(null);
      });
      fetchPublicCalendarEvents.mockResolvedValue([]);
    });

    it('updates the displayed date range when "Previous" and "Next" are pressed', async () => {
      const { getByText } = render(<CalendarScreen />);
      await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalled());
      const initialRange =
        moment().startOf("day").format("MMM DD") +
        " - " +
        moment().startOf("day").add(9, "days").format("MMM DD");
      expect(getByText(initialRange)).toBeTruthy();
      // Press "Previous"
      fireEvent.press(getByText("Previous"));
      const previousRange =
        moment().startOf("day").subtract(10, "days").format("MMM DD") +
        " - " +
        moment().startOf("day").subtract(10, "days").add(9, "days").format("MMM DD");
      await waitFor(() => expect(getByText(previousRange)).toBeTruthy());
      // Press "Next"
      fireEvent.press(getByText("Next"));
      await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalledTimes(2));
    });
  });

  // --- Calendar Selection Modal ---
  describe("Calendar Selection Modal", () => {
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

    it("opens modal on dropdown button press and selects a calendar", async () => {
      const { getByText, queryByText } = render(<CalendarScreen />);
      await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalled());
      // Dropdown shows current calendar.
      const dropdownButton = getByText("Calendar One");
      fireEvent.press(dropdownButton);
      expect(getByText("Choose a Calendar")).toBeTruthy();
      // Press a different calendar option.
      fireEvent.press(getByText("Calendar Two"));
      await waitFor(() => {
        expect(queryByText("Choose a Calendar")).toBeNull();
      });
      expect(AsyncStorage.setItem).toHaveBeenCalledWith("selectedCalendar", "cal2");
    });

    it("closes modal when Cancel is pressed", async () => {
      const { getByText, queryByText } = render(<CalendarScreen />);
      await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalled());
      fireEvent.press(getByText("Calendar One"));
      expect(getByText("Choose a Calendar")).toBeTruthy();
      fireEvent.press(getByText("Cancel"));
      await waitFor(() => expect(queryByText("Choose a Calendar")).toBeNull());
    });

    it("closes modal when overlay is pressed", async () => {
      const { getByText, queryByText } = render(<CalendarScreen />);
      await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalled());
      fireEvent.press(getByText("Calendar One"));
      expect(getByText("Choose a Calendar")).toBeTruthy();
      // Simulate overlay press by pressing on the modal title (part of the overlay).
      fireEvent.press(getByText("Choose a Calendar"));
      await waitFor(() => expect(queryByText("Choose a Calendar")).toBeNull());
    });
  });

  // --- In-App Notification ---
  describe("In-App Notification", () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ isSignedIn: true });
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === "availableCalendars")
          return Promise.resolve(JSON.stringify([{ id: "cal1", name: "Calendar One" }]));
        if (key === "selectedCalendar") return Promise.resolve("cal1");
        return Promise.resolve(null);
      });
      fetchPublicCalendarEvents.mockResolvedValue([]);
    });

    it("displays a notification when triggered and hides it after 5 seconds", async () => {
      const { getByText, queryByText } = render(<CalendarScreen />);
      // Trigger NotificationObserver by calling notify on our fake observer.
      act(() => {
        fakeEventObserver.notify([
          {
            id: "dummy",
            title: "dummy",
            description: "Dummy, Dummy, Dummy",
            start: { dateTime: moment().toISOString() },
            end: { dateTime: moment().toISOString() },
          },
        ]);
      });
      await waitFor(() => {
        expect(getByText("Test Notification")).toBeTruthy();
      });
      // Fast-forward 5 seconds.
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      await waitFor(() => {
        expect(queryByText("Test Notification")).toBeNull();
      });
    });
  });

  // --- Stored Calendar Data Loading & Error Handling ---
  describe("Stored Calendar Data Loading", () => {
    it("loads stored calendar data and sets selectedCalendar correctly", async () => {
      const calendarsData = [{ id: "cal1", name: "Calendar One" }];
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === "availableCalendars")
          return Promise.resolve(JSON.stringify(calendarsData));
        if (key === "selectedCalendar") return Promise.resolve("cal1");
        return Promise.resolve(null);
      });
      useAuth.mockReturnValue({ isSignedIn: true });
      fetchPublicCalendarEvents.mockResolvedValue([]);
      const { getByText } = render(<CalendarScreen />);
      await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalled());
      expect(getByText("Calendar One")).toBeTruthy();
    });

    it("logs an error when loading stored calendar data fails", async () => {
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
  });

  // --- No selectedCalendar Scenario ---
  describe("No selectedCalendar scenario", () => {
    it("sets loading to false if no selectedCalendar is available", async () => {
      // Simulate missing availableCalendars (and thus no selectedCalendar)
      AsyncStorage.getItem.mockImplementation((key) => Promise.resolve(null));
      useAuth.mockReturnValue({ isSignedIn: true });
      fetchPublicCalendarEvents.mockResolvedValue([]);
      const { getByText } = render(<CalendarScreen />);
      await waitFor(() => {
        expect(getByText("No events found for this range.")).toBeTruthy();
      });
    });
  });
});