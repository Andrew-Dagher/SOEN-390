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

// Override NotificationObserver to do nothing (or minimal behavior) for these tests.
jest.mock('../app/screens/calendar/NotificationObserver', () => ({
  NotificationObserver: jest.fn(),
}));

jest.useFakeTimers();

describe('Additional Button Interaction Tests in CalendarScreen', () => {
  let mockNavigation;
  const storedCalendars = [{ id: 'cal1', name: 'Calendar One' }];

  beforeEach(() => {
    mockNavigation = { reset: jest.fn(), navigate: jest.fn() };
    useNavigation.mockReturnValue(mockNavigation);
    jest.clearAllMocks();
  });

  // Test: Guest view "Go to Login" button behavior.
  it('handles "Go to Login" button press in guest view', async () => {
    // When user is not signed in.
    useAuth.mockReturnValue({ isSignedIn: false });

    const { getByText } = render(<CalendarScreen />);
    // Our guest view renders a GoToLoginButton. Look for text that matches "login".
    const loginButton = await waitFor(() => getByText(/login/i));
    fireEvent.press(loginButton);
    await waitFor(() => {
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("sessionId");
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("userData");
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("guestMode");
      expect(mockNavigation.reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: "Login" }] });
    });
  });

  // Test: Modal overlay press closes the calendar selection modal.
  it('closes modal when the overlay is pressed', async () => {
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

    const { getByText, queryByText } = render(<CalendarScreen />);
    await waitFor(() => expect(fetchPublicCalendarEvents).toHaveBeenCalled());

    // Open the calendar selection modal by pressing on the dropdown button.
    const dropdownButton = getByText('Calendar One');
    fireEvent.press(dropdownButton);
    // The modal should appear.
    expect(getByText('Choose a Calendar')).toBeTruthy();

    // Simulate a press on the overlay. In our component, the outer TouchableOpacity covers the modal.
    // We can press on the "Choose a Calendar" text since it is inside the overlay.
    fireEvent.press(getByText('Choose a Calendar'));
    await waitFor(() => expect(queryByText('Choose a Calendar')).toBeNull());
  });

  // Test: Double-pressing an event title toggles expansion (expand then collapse).
  it('toggles event expansion when pressing the event title twice', async () => {
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
    await waitFor(() => expect(getByText('Event 1')).toBeTruthy());
    // First press: expand event details.
    fireEvent.press(getByText('Event 1'));
    expect(getByText(/📍/)).toBeTruthy();
    // Second press: collapse event details.
    fireEvent.press(getByText('Event 1'));
    await waitFor(() => expect(queryByText(/📍/)).toBeNull());
  });
});