import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Animated } from 'react-native';
import NextClassButton from '../app/components/calendar/NextClassButton';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));
jest.mock('expo-location', () => ({
  getCurrentPositionAsync: jest.fn(),
}));
jest.mock('../app/components/Calendar/CalendarIcons/CalendarDirectionsIcon', () => 'CalendarDirectionsIcon');

// Mock Animated.timing
jest.spyOn(Animated, 'timing').mockImplementation(() => ({
  start: jest.fn(),
}));

// A helper for creating mock event observers
const createMockObserver = () => ({
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
});

describe('NextClassButton', () => {
  let mockNavigation;

  beforeEach(() => {
    mockNavigation = { navigate: jest.fn() };
    useNavigation.mockReturnValue(mockNavigation);
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 40.7128, longitude: -74.0060 },
    });
    jest.clearAllMocks();
  });

  // Test 1: Component doesn't render when no events
  it('returns null when there are no upcoming events', () => {
    const mockObserver = createMockObserver();
    const { queryByText } = render(<NextClassButton eventObserver={mockObserver} />);

    expect(queryByText('Go to My Next Class')).toBeNull();
    expect(mockObserver.subscribe).toHaveBeenCalled();
  });

  // Test 2: Component renders with upcoming event
  it('renders button when there is an upcoming event', async () => {
    const mockObserver = createMockObserver();
    const { findByText } = render(<NextClassButton eventObserver={mockObserver} />);

    // Simulate event update
    const callback = mockObserver.subscribe.mock.calls[0][0];
    callback([
      {
        start: { dateTime: new Date(Date.now() + 10000).toISOString() },
        description: 'Campus A, Building 1',
      },
    ]);

    const buttonText = await findByText('Go to My Next Class');
    expect(buttonText).toBeTruthy();
    expect(Animated.timing).toHaveBeenCalledWith(
      expect.any(Animated.Value),
      expect.objectContaining({
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    );
  });

  // Test 3: Handles navigation to next class
  it('navigates to next class location when button is pressed', async () => {
    const mockObserver = createMockObserver();
    const { findByText } = render(<NextClassButton eventObserver={mockObserver} />);

    const callback = mockObserver.subscribe.mock.calls[0][0];
    callback([
      {
        start: { dateTime: new Date(Date.now() + 10000).toISOString() },
        description: 'Campus A, Building 1',
      },
    ]);

    const button = await findByText('Go to My Next Class');
    fireEvent.press(button);

    await waitFor(() => {
      expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Navigation', {
        campus: 'campus a',
        buildingName: 'Building 1',
        currentLocation: {
          latitude: 40.7128,
          longitude: -74.0060,
        },
      });
    });
  });

  // Test 4: Handles empty event list
  it('clears location when events array is empty', () => {
    const mockObserver = createMockObserver();
    const { queryByText, rerender } = render(<NextClassButton eventObserver={mockObserver} />);

    const callback = mockObserver.subscribe.mock.calls[0][0];
    callback([]); // Empty event array

    rerender(<NextClassButton eventObserver={mockObserver} />);
    expect(queryByText('Go to My Next Class')).toBeNull();
  });

  // Test 5: Handles error in location fetching
  it('handles location fetching error gracefully', async () => {
    const mockObserver = createMockObserver();
    Location.getCurrentPositionAsync.mockRejectedValue(new Error('Location error'));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const { findByText } = render(<NextClassButton eventObserver={mockObserver} />);

    const callback = mockObserver.subscribe.mock.calls[0][0];
    callback([
      {
        start: { dateTime: new Date(Date.now() + 10000).toISOString() },
        description: 'Campus A, Building 1',
      },
    ]);

    const button = await findByText('Go to My Next Class');
    fireEvent.press(button);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error navigating to next class:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  // Test 6: Cleans up subscription on unmount
  it('unsubscribes from observer on unmount', () => {
    const mockObserver = createMockObserver();
    const { unmount } = render(<NextClassButton eventObserver={mockObserver} />);

    const callback = mockObserver.subscribe.mock.calls[0][0];
    unmount();

    expect(mockObserver.unsubscribe).toHaveBeenCalledWith(callback);
  });

  // Test 7: correctly sorts and selects the earliest upcoming event
  it('correctly sorts and selects the earliest upcoming event', async () => {
    const mockObserver = createMockObserver();
    const { findByText } = render(<NextClassButton eventObserver={mockObserver} />);

    const now = new Date();
    const callback = mockObserver.subscribe.mock.calls[0][0];
    callback([
      {
        start: { dateTime: new Date(now.getTime() + 20000).toISOString() }, // Later event
        description: 'Campus B, Building 2',
      },
      {
        start: { dateTime: new Date(now.getTime() + 10000).toISOString() }, // Earlier event
        description: 'Campus A, Building 1',
      },
      {
        start: { dateTime: new Date(now.getTime() - 10000).toISOString() }, // Past event
        description: 'Campus C, Building 3',
      },
    ]);

    const buttonText = await findByText('Go to My Next Class');
    expect(buttonText).toBeTruthy();

    fireEvent.press(buttonText);
    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith(
        'Navigation',
        expect.objectContaining({
          campus: 'campus a', // Should use the earliest upcoming event (Campus A)
          buildingName: 'Building 1',
        })
      );
    });
  });

  // Test 8: sets location to null when all events are in the past
  it('sets location to null when all events are in the past', () => {
    const mockObserver = createMockObserver();
    const { queryByText, rerender } = render(<NextClassButton eventObserver={mockObserver} />);

    const now = new Date();
    const callback = mockObserver.subscribe.mock.calls[0][0];
    callback([
      {
        start: { dateTime: new Date(now.getTime() - 20000).toISOString() }, // Past event
        description: 'Campus A, Building 1',
      },
      {
        start: { dateTime: new Date(now.getTime() - 10000).toISOString() }, // Past event
        description: 'Campus B, Building 2',
      },
    ]);

    rerender(<NextClassButton eventObserver={mockObserver} />);
    expect(queryByText('Go to My Next Class')).toBeNull(); // Button should not render
  });
});
