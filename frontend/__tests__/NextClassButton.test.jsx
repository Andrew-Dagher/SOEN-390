import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import NextClassButton from "../app/components/Calendar/NextClassButton";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import { trackEvent } from "@aptabase/react-native";
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Animated } from 'react-native';
import NextClassButton from '../app/components/calendar/NextClassButton';

jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));

jest.mock("expo-location", () => ({
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

jest.mock("@aptabase/react-native", () => ({
  trackEvent: jest.fn(),
}));

describe("NextClassButton", () => {
  const mockNavigate = jest.fn();
  const now = new Date();
  const futureEvent = {
    start: { dateTime: new Date(now.getTime() + 60000).toISOString() },
    description: "TestCampus, TestBuilding",
  };

  const eventObserver = {
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  };

  beforeEach(() => {
    mockNavigation = { navigate: jest.fn() };
    useNavigation.mockReturnValue(mockNavigation);
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 40.7128, longitude: -74.0060 },
    });
    jest.clearAllMocks();
    useNavigation.mockReturnValue({ navigate: mockNavigate });
  });

  it("subscribes and unsubscribes to observer", () => {
    const { unmount } = render(<NextClassButton eventObserver={eventObserver} />);
    expect(eventObserver.subscribe).toHaveBeenCalledTimes(1);
    unmount();
    expect(eventObserver.unsubscribe).toHaveBeenCalledTimes(1);
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

    const button = await waitFor(() => getByText("Go to My Next Class"));
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

  it("handles location errors gracefully", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    Location.getCurrentPositionAsync.mockRejectedValue(new Error("Location fail"));

    let callback;
    eventObserver.subscribe.mockImplementation((cb) => (callback = cb));

    const { findByText } = render(<NextClassButton eventObserver={mockObserver} />);

    const callback = mockObserver.subscribe.mock.calls[0][0];
    callback([
      {
        start: { dateTime: new Date(Date.now() + 10000).toISOString() },
        description: 'Campus A, Building 1',
      },
    ]);

    const button = await waitFor(() => getByText("Go to My Next Class"));
    fireEvent.press(button);

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith("Error navigating to next class:", expect.any(Error));
    });

    errorSpy.mockRestore();
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


it('sets location to null when all events are in the past', () => {
  const mockObserver = createMockObserver();
  const { queryByText, rerender } = render(<NextClassButton eventObserver={mockObserver} />);

  const now = new Date();
  const callback = mockObserver.subscribe.mock.calls[0][0];
  callback([
    {
      start: { dateTime: new Date(now.getTime() - 20000).toISOString() }, // Past event
      description: 'Campus A, Building 1'
    },
    {
      start: { dateTime: new Date(now.getTime() - 10000).toISOString() }, // Past event
      description: 'Campus B, Building 2'
    }
  ]);

  rerender(<NextClassButton eventObserver={mockObserver} />);
  expect(queryByText('Go to My Next Class')).toBeNull(); // Button should not render
});