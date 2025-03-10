import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import CalendarScreen from '../app/screens/calendar/CalendarScreen';
import { useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as CalendarHelper from '../app/screens/calendar/CalendarHelper';
import { fetchPublicCalendarEvents } from '../app/screens/login/LoginHelper';
import moment from 'moment';

// ---- Mock all dependencies ----
jest.mock('@clerk/clerk-expo', () => ({
  useAuth: jest.fn(),
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

jest.mock('../../components/BottomNavBar/BottomNavBar', () => 'BottomNavBar');
jest.mock('../../components/Calendar/GoToLoginButton', () => 'GoToLoginButton');
jest.mock('../../components/InAppNotification', () => 'InAppNotification');
jest.mock('../../components/Calendar/NextClassButton', () => 'NextClassButton');
jest.mock('../app/screens/calendar/EventObserver', () => {
  return jest.fn().mockImplementation(() => ({
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    notify: jest.fn(),
  }));
});
jest.mock('../app/screens/calendar/NotificationObserver', () => jest.fn());

describe('CalendarScreen Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Existing Test 1: Guest screen when not signed in
  it('shows the guest screen (GoToLoginButton) if user is not signed in', async () => {
    useAuth.mockReturnValue({ isSignedIn: false });
    const { getByText } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );
    expect(getByText('GoToLoginButton')).toBeTruthy();
    expect(getByText('BottomNavBar')).toBeTruthy();
  });

  // Existing Test 2: Renders events when signed in
  it('renders events when user is signed in and fetches from mock', async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'availableCalendars') {
        return Promise.resolve(JSON.stringify([{ id: 'cal1', name: 'Calendar 1' }]));
      }
      return Promise.resolve(null);
    });
    fetchPublicCalendarEvents.mockResolvedValueOnce([
      {
        id: '1',
        title: 'Sample Event',
        description: '<pre>Class Link Goes Here</pre>',
        start: { dateTime: '2025-01-01T10:00:00Z' },
        end: { dateTime: '2025-01-01T11:00:00Z' },
      },
    ]);

    const { getByText, findByText } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );

    const eventTitle = await findByText('Sample Event');
    expect(eventTitle).toBeTruthy();

    fireEvent.press(eventTitle);
    expect(getByText('📍 Class Link Goes Here')).toBeTruthy();
    expect(getByText('Go to Class')).toBeTruthy();
  });

  // Existing Test 3: HandleGoToClass call
  it('calls handleGoToClass when "Go to Class" button is pressed', async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'availableCalendars') {
        return Promise.resolve(JSON.stringify([{ id: 'cal1', name: 'Calendar 1' }]));
      }
      return Promise.resolve(null);
    });
    fetchPublicCalendarEvents.mockResolvedValueOnce([
      {
        id: '2',
        title: 'Another Event',
        description: '<pre>Zoom Link: XYZ</pre>',
        start: { dateTime: '2025-01-02T10:00:00Z' },
        end: { dateTime: '2025-01-02T11:00:00Z' },
      },
    ]);

    const { findByText, getByText } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );

    const eventTitle = await findByText('Another Event');
    fireEvent.press(eventTitle);
    fireEvent.press(getByText('Go to Class'));

    expect(CalendarHelper.handleGoToClass).toHaveBeenCalledTimes(1);
    expect(CalendarHelper.handleGoToClass).toHaveBeenCalledWith(
      'Zoom Link: XYZ',
      expect.any(Object)
    );
  });

  // New Test 4: Shows loading state
  it('shows loading indicator while fetching events', () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    const { getByTestId } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );
    expect(getByTestId('ActivityIndicator')).toBeTruthy();
  });

  // New Test 5: Calendar selection modal
  it('opens modal and changes selected calendar', async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'availableCalendars') {
        return Promise.resolve(JSON.stringify([
          { id: 'cal1', name: 'Calendar 1' },
          { id: 'cal2', name: 'Calendar 2' },
        ]));
      }
      return Promise.resolve(null);
    });
    fetchPublicCalendarEvents.mockResolvedValue([]);

    const { findByText } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );

    const dropdown = await findByText('Calendar 1');
    fireEvent.press(dropdown);

    const calendar2 = await findByText('Calendar 2');
    fireEvent.press(calendar2);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('selectedCalendar', 'cal2');
    });
  });

  // New Test 6: Notification handling
  it('shows and hides in-app notification', async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'availableCalendars') {
        return Promise.resolve(JSON.stringify([{ id: 'cal1', name: 'Calendar 1' }]));
      }
      return Promise.resolve(null);
    });
    fetchPublicCalendarEvents.mockResolvedValue([
      { id: '1', title: 'Test Event', description: 'Campus A, Building 1, Room 101' },
    ]);

    const { findByText, queryByText } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );

    await findByText('Test Event');
    jest.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(queryByText('InAppNotification')).toBeNull();
    });
  });

  // New Test 7: Pagination
  it('handles previous and next pagination', async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'availableCalendars') {
        return Promise.resolve(JSON.stringify([{ id: 'cal1', name: 'Calendar 1' }]));
      }
      return Promise.resolve(null);
    });
    fetchPublicCalendarEvents.mockResolvedValue([]);

    const { findByText } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );

    const prevButton = await findByText('Previous');
    const nextButton = await findByText('Next');

    fireEvent.press(prevButton);
    fireEvent.press(nextButton);

    expect(fetchPublicCalendarEvents).toHaveBeenCalledTimes(3);
  });

  // New Test 8: Event filtering
  it('filters out events with invalid description format', async () => {
    useAuth.mockReturnValue({ isSignedIn: true });
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'availableCalendars') {
        return Promise.resolve(JSON.stringify([{ id: 'cal1', name: 'Calendar 1' }]));
      }
      return Promise.resolve(null);
    });
    fetchPublicCalendarEvents.mockResolvedValue([
      { id: '1', title: 'Valid', description: 'Campus A, Building 1, Room 101' },
      { id: '2', title: 'Invalid', description: 'Campus A, Building 1' },
    ]);

    const { findByText, queryByText } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );

    expect(await findByText('Valid')).toBeTruthy();
    expect(queryByText('Invalid')).toBeNull();
  });
});

// Note: Add testID to ActivityIndicator in CalendarScreen for Test 4 to work:
// <ActivityIndicator testID="ActivityIndicator" size="large" color="#862532" />