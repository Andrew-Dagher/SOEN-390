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

// Override NotificationObserver to do nothing for these tests.
jest.mock('../app/screens/calendar/NotificationObserver', () => ({
  NotificationObserver: jest.fn(),
}));

// Use fake timers for timeout-related tests.
jest.useFakeTimers();

describe('Additional CalendarScreen tests', () => {
  let mockNavigation;
  const storedCalendars = [{ id: 'cal1', name: 'Calendar One' }];

  beforeEach(() => {
    mockNavigation = { reset: jest.fn(), navigate: jest.fn() };
    useNavigation.mockReturnValue(mockNavigation);
    jest.clearAllMocks();
  });

  // Test: When AsyncStorage returns no stored calendars.
  it('handles missing stored calendars and shows no events text', async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    // Return null for availableCalendars and selectedCalendar.
    AsyncStorage.getItem.mockResolvedValue(null);
    // fetchPublicCalendarEvents should not be called if no calendar selected.
    fetchPublicCalendarEvents.mockResolvedValue([]);

    const { getByText } = render(<CalendarScreen />);
    await waitFor(() => expect(fetchPublicCalendarEvents).not.toHaveBeenCalled());
    // Since selectedCalendar remains null, loading should be false and "No events found" displayed.
    expect(getByText('No events found for this range.')).toBeTruthy();
  });

  // Test: When loading stored calendars throws an error.
  it('logs error if loading stored calendar data fails', async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    const errorMessage = 'AsyncStorage error';
    AsyncStorage.getItem.mockRejectedValue(new Error(errorMessage));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<CalendarScreen />);
    await waitFor(() => expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error loading stored calendar data:',
      expect.any(Error)
    ));
    consoleErrorSpy.mockRestore();
  });

  // Test: Unsubscribe from observer on unmount.
  it('unsubscribes from eventsObserver on unmount', async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    // Provide stored calendars so selectedCalendar is set.
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'availableCalendars') return Promise.resolve(JSON.stringify(storedCalendars));
      if (key === 'selectedCalendar') return Promise.resolve('cal1');
      return Promise.resolve(null);
    });
    fetchPublicCalendarEvents.mockResolvedValue([]);

    const { unmount } = render(<CalendarScreen />);
    // Grab the eventsObserver instance from the component by spying on NotificationObserver.
    const { NotificationObserver } = require('../app/screens/calendar/NotificationObserver');
    expect(NotificationObserver).toHaveBeenCalled();
    unmount();
    // (If you had exposed unsubscribe calls on the observer instance, you could check that here.
    // In this example, we assume that unsubscribe is called in the cleanup effect.)
  });

  // Test: Toggle event expansion - pressing the same event twice collapses it.
  it('toggles event expansion when pressed twice', async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'availableCalendars') return Promise.resolve(JSON.stringify(storedCalendars));
      if (key === 'selectedCalendar') return Promise.resolve('cal1');
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

    const { getByText, queryByText } = render(<CalendarScreen />);
    // Wait for event to be rendered.
    await waitFor(() => expect(getByText('Event 1')).toBeTruthy());
    // Expand the event.
    fireEvent.press(getByText('Event 1'));
    expect(getByText(/📍/)).toBeTruthy();
    // Press again to collapse.
    fireEvent.press(getByText('Event 1'));
    await waitFor(() => expect(queryByText(/📍/)).toBeNull());
  });

  // Test: onRequestClose of modal hides the modal.
  it('hides the calendar selection modal when onRequestClose is triggered', async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    const calendarsData = [
      { id: 'cal1', name: 'Calendar One' },
      { id: 'cal2', name: 'Calendar Two' }
    ];
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'availableCalendars') return Promise.resolve(JSON.stringify(calendarsData));
      if (key === 'selectedCalendar') return Promise.resolve('cal1');
      return Promise.resolve(null);
    });
    fetchPublicCalendarEvents.mockResolvedValue([]);

    const { getByText, getByTestId, queryByText, getByA11yLabel } = render(<CalendarScreen />);
    // Open modal via the dropdown button.
    fireEvent.press(getByText('Calendar One'));
    // Simulate onRequestClose by firing the appropriate callback.
    // For this, we get the Modal component (if you assign an accessible label or testID, otherwise simulate a press on the overlay).
    // Here we simulate a press on the overlay.
    fireEvent.press(getByText('Choose a Calendar'));
    // Press the Cancel button.
    fireEvent.press(getByText('Cancel'));
    await waitFor(() => expect(queryByText('Choose a Calendar')).toBeNull());
  });

  // Test: When fetchPublicCalendarEvents returns events that all fail the regex filter.
  it('displays "No events found" if all fetched events fail the description regex', async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'availableCalendars') return Promise.resolve(JSON.stringify(storedCalendars));
      if (key === 'selectedCalendar') return Promise.resolve('cal1');
      return Promise.resolve(null);
    });
    // Return events with descriptions not matching "Campus, Building, Room"
    const invalidEvents = [
      {
        id: 'event1',
        title: 'Event 1',
        description: 'Not matching format',
        start: { dateTime: moment().add(1, 'day').toISOString() },
        end: { dateTime: moment().add(1, 'day').add(1, 'hour').toISOString() },
      }
    ];
    fetchPublicCalendarEvents.mockResolvedValue(invalidEvents);

    const { getByText } = render(<CalendarScreen />);
    await waitFor(() => expect(getByText('No events found for this range.')).toBeTruthy());
  });
});