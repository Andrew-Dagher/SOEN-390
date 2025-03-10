import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import moment from 'moment';
import CalendarScreen from '../app/screens/calendar/CalendarScreen';
import { useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchPublicCalendarEvents } from '../app/screens/login/LoginHelper';
import { handleGoToClass } from '../app/screens/calendar/CalendarHelper';
import { useNavigation } from '@react-navigation/native';

// Mocks for external dependencies.
jest.mock('@clerk/clerk-expo', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('../app/screens/login/LoginHelper', () => ({
  fetchPublicCalendarEvents: jest.fn(),
}));

jest.mock('../app/screens/calendar/CalendarHelper', () => ({
  handleGoToClass: jest.fn(),
}));

// To simulate the In-App Notification, we override NotificationObserver.
// (NotificationObserver is imported from "./NotificationObserver")
jest.mock('../app/screens/calendar/NotificationObserver', () => ({
  NotificationObserver: (events, showNotification /*, currentStartDate */) => {
    // Immediately trigger a notification for testing purposes.
    showNotification('Test Notification');
  },
}));

// Use fake timers for timeout-related tests.
jest.useFakeTimers();

describe('CalendarScreen', () => {
  let mockNavigation;
  const storedCalendars = [{ id: 'cal1', name: 'Calendar One' }];

  beforeEach(() => {
    mockNavigation = { reset: jest.fn(), navigate: jest.fn() };
    useNavigation.mockReturnValue(mockNavigation);
    jest.clearAllMocks();
  });

  // Test 1: Renders guest view when not signed in.
  it('renders guest view when not signed in', async () => {
    useAuth.mockReturnValue({ isSignedIn: false });

    const { getByText } = render(<CalendarScreen />);

    // Expect the guest view to show a login button.
    const loginButton = await waitFor(() => getByText(/login/i));
    expect(loginButton).toBeTruthy();

    // Simulate a press on the login button.
    fireEvent.press(loginButton);
    await waitFor(() => {
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("sessionId");
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("userData");
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("guestMode");
      expect(mockNavigation.reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: "Login" }] });
    });
  });

  // Test 2: Shows a loading indicator when events are being fetched.
  it('shows loading indicator when events are being fetched', async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    // Simulate stored calendars.
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'availableCalendars') {
        return Promise.resolve(JSON.stringify(storedCalendars));
      }
      if (key === 'selectedCalendar') {
        return Promise.resolve('cal1');
      }
      return Promise.resolve(null);
    });
    // Return a promise that never resolves immediately.
    fetchPublicCalendarEvents.mockReturnValue(new Promise(() => {}));

    const { getByA11yRole } = render(<CalendarScreen />);
    // ActivityIndicator has accessibilityRole="progressbar"
    const progressBar = await waitFor(() => getByA11yRole("progressbar"));
    expect(progressBar).toBeTruthy();
  });

  // Test 3: Renders main UI with events (filters out events that do not match the regex).
  it('renders main UI when signed in and events available', async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'availableCalendars') {
        return Promise.resolve(JSON.stringify(storedCalendars));
      }
      if (key === 'selectedCalendar') {
        return Promise.resolve('cal1');
      }
      return Promise.resolve(null);
    });
    // Provide two events: one valid and one invalid (invalid event will be filtered out).
    const validEvent = {
      id: 'event1',
      title: 'Event 1',
      description: 'Campus A, Building 1, Room 101',
      start: { dateTime: moment().add(1, 'day').toISOString() },
      end: { dateTime: moment().add(1, 'day').add(1, 'hour').toISOString() },
    };
    const invalidEvent = {
      id: 'event2',
      title: 'Event 2',
      description: 'Invalid Format',
      start: { dateTime: moment().add(2, 'day').toISOString() },
      end: { dateTime: moment().add(2, 'day').add(1, 'hour').toISOString() },
    };
    fetchPublicCalendarEvents.mockResolvedValue([validEvent, invalidEvent]);

    const { getByText, queryByText } = render(<CalendarScreen />);
    await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalled());
    expect(getByText('Event 1')).toBeTruthy();
    expect(queryByText('Event 2')).toBeNull();
    expect(getByText('Google Calendar')).toBeTruthy();
  });

  // Test 4: Pagination buttons update the displayed date range and trigger a refetch.
  it('handles pagination button presses', async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'availableCalendars') {
        return Promise.resolve(JSON.stringify(storedCalendars));
      }
      if (key === 'selectedCalendar') {
        return Promise.resolve('cal1');
      }
      return Promise.resolve(null);
    });
    fetchPublicCalendarEvents.mockResolvedValue([]);

    const { getByText } = render(<CalendarScreen />);
    await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalled());

    // Initial date range.
    const initialRange = moment().startOf("day").format("MMM DD") + " - " +
      moment().startOf("day").add(9, "days").format("MMM DD");
    expect(getByText(initialRange)).toBeTruthy();

    // Press "Previous" and verify the new date range appears.
    fireEvent.press(getByText('Previous'));
    const previousRange = moment().startOf("day").subtract(10, "days").format("MMM DD") + " - " +
      moment().startOf("day").subtract(10, "days").add(9, "days").format("MMM DD");
    await waitFor(() => expect(getByText(previousRange)).toBeTruthy());

    // Press "Next" and ensure fetchPublicCalendarEvents is called again.
    fireEvent.press(getByText('Next'));
    await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalledTimes(2));
  });

  // Test 5: Calendar selection modal (dropdown) works.
  it('handles modal dropdown for calendar selection', async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    const calendarsData = [
      { id: 'cal1', name: 'Calendar One' },
      { id: 'cal2', name: 'Calendar Two' }
    ];
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'availableCalendars') {
        return Promise.resolve(JSON.stringify(calendarsData));
      }
      if (key === 'selectedCalendar') {
        return Promise.resolve('cal1');
      }
      return Promise.resolve(null);
    });
    fetchPublicCalendarEvents.mockResolvedValue([]);

    const { getByText, queryByText } = render(<CalendarScreen />);
    await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalled());
    // The dropdown button should show "Calendar One"
    expect(getByText('Calendar One')).toBeTruthy();

    // Open modal.
    fireEvent.press(getByText('Calendar One'));
    expect(getByText('Choose a Calendar')).toBeTruthy();

    // Select "Calendar Two"
    fireEvent.press(getByText('Calendar Two'));
    await waitFor(() => {
      expect(queryByText('Choose a Calendar')).toBeNull();
    });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("selectedCalendar", "cal2");
  });

  // Test 6: Expand an event and press "Go to Class" to call handleGoToClass.
  it('expands an event and triggers handleGoToClass when "Go to Class" button is pressed', async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'availableCalendars') {
        return Promise.resolve(JSON.stringify(storedCalendars));
      }
      if (key === 'selectedCalendar') {
        return Promise.resolve('cal1');
      }
      return Promise.resolve(null);
    });
    const event = {
      id: 'event1',
      title: 'Event 1',
      description: 'Campus A, Building 1, Room 101',
      start: { dateTime: moment().add(1, 'day').toISOString() },
      end: { dateTime: moment().add(1, 'day').add(1, 'hour').toISOString() },
    };
    fetchPublicCalendarEvents.mockResolvedValue([event]);

    const { getByText } = render(<CalendarScreen />);
    await waitFor(() => expect(getByText('Event 1')).toBeTruthy());
    // Expand the event.
    fireEvent.press(getByText('Event 1'));
    expect(getByText(/📍/)).toBeTruthy();
    // Press the "Go to Class" button.
    fireEvent.press(getByText('Go to Class'));
    expect(handleGoToClass).toHaveBeenCalledWith('Campus A, Building 1, Room 101', mockNavigation);
  });

  // Test 7: Displays a message when no events are found.
  it('shows "No events found for this range." when events list is empty', async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'availableCalendars') {
        return Promise.resolve(JSON.stringify(storedCalendars));
      }
      if (key === 'selectedCalendar') {
        return Promise.resolve('cal1');
      }
      return Promise.resolve(null);
    });
    fetchPublicCalendarEvents.mockResolvedValue([]);

    const { getByText } = render(<CalendarScreen />);
    await waitFor(() => expect(getByText('No events found for this range.')).toBeTruthy());
  });

  // Test 8: In-app notification displays and then hides after timeout.
  it('shows in-app notification and hides after timeout', async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'availableCalendars') {
        return Promise.resolve(JSON.stringify(storedCalendars));
      }
      if (key === 'selectedCalendar') {
        return Promise.resolve('cal1');
      }
      return Promise.resolve(null);
    });
    fetchPublicCalendarEvents.mockResolvedValue([]);

    const { getByText, queryByText } = render(<CalendarScreen />);
    // Because we overrode NotificationObserver to immediately call showNotification,
    // the in-app notification should appear.
    await waitFor(() => expect(getByText('Test Notification')).toBeTruthy());

    // Fast-forward timers to hide the notification (5 seconds).
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    await waitFor(() => expect(queryByText('Test Notification')).toBeNull());
  });
});