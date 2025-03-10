import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import NextClassButton from '../app/components/calendar/NextClassButton';
import { Animated } from 'react-native';

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

// Mock event observer
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
      coords: { latitude: 40.7128, longitude: -74.0060 }
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
    callback([{
      start: { dateTime: new Date(Date.now() + 10000).toISOString() },
      description: 'Campus A, Building 1'
    }]);

    const buttonText = await findByText('Go to My Next Class');
    expect(buttonText).toBeTruthy();
    expect(Animated.timing).toHaveBeenCalledWith(
      expect.any(Animated.Value),
      expect.objectContaining({
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      })
    );
  });

  // Test 3: Handles navigation to next class
  it('navigates to next class location when button is pressed', async () => {
    const mockObserver = createMockObserver();
    const { findByText } = render(<NextClassButton eventObserver={mockObserver} />);

    const callback = mockObserver.subscribe.mock.calls[0][0];
    callback([{
      start: { dateTime: new Date(Date.now() + 10000).toISOString() },
      description: 'Campus A, Building 1'
    }]);

    const button = await findByText('Go to My Next Class');
    fireEvent.press(button);

    await waitFor(() => {
      expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
      expect(mockNavigation.navigate).toHaveBeenCalledWith(
        'Navigation',
        {
          campus: 'campus a',
          buildingName: 'Building 1',
          currentLocation: {
            latitude: 40.7128,
            longitude: -74.0060
          }
        }
      );
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
    callback([{
      start: { dateTime: new Date(Date.now() + 10000).toISOString() },
      description: 'Campus A, Building 1'
    }]);

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
});



it('correctly sorts and selects the earliest upcoming event', async () => {
  const mockObserver = createMockObserver();
  const { findByText } = render(<NextClassButton eventObserver={mockObserver} />);

  const now = new Date();
  const callback = mockObserver.subscribe.mock.calls[0][0];
  callback([
    {
      start: { dateTime: new Date(now.getTime() + 20000).toISOString() }, // Later event
      description: 'Campus B, Building 2'
    },
    {
      start: { dateTime: new Date(now.getTime() + 10000).toISOString() }, // Earlier event
      description: 'Campus A, Building 1'
    },
    {
      start: { dateTime: new Date(now.getTime() - 10000).toISOString() }, // Past event
      description: 'Campus C, Building 3'
    }
  ]);

  const buttonText = await findByText('Go to My Next Class');
  expect(buttonText).toBeTruthy();

  fireEvent.press(buttonText);
  await waitFor(() => {
    expect(mockNavigation.navigate).toHaveBeenCalledWith(
      'Navigation',
      expect.objectContaining({
        campus: 'campus a', // Should use the earliest upcoming event (Campus A)
        buildingName: 'Building 1'
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

  test("Picks the earliest future event if multiple exist", async () => {
    const now = new Date();
    const futureEvent1 = {
      start: { dateTime: new Date(now.getTime() + 30000).toISOString() }, // 30s from now
      description: "Campus X, Building X",
    };
    const futureEvent2 = {
      start: { dateTime: new Date(now.getTime() + 60000).toISOString() }, // 60s from now
      description: "Campus Y, Building Y",
    };

    const { getByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    const observerCallback = fakeObserver.subscribe.mock.calls[0][0];

    // Provide both future events
    act(() => {
      observerCallback([futureEvent2, futureEvent1]);
    });

    // The earliest is futureEvent1 => "Campus X"
    const button = await waitFor(() => getByText("Go to My Next Class"));
    expect(button).toBeTruthy();
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith("Navigation", expect.objectContaining({
        campus: "campus x",
      }));
    });
  });

  test("Updates and hides the button if a subsequent notify call has no upcoming events", async () => {
    // First call: we have an upcoming event => button visible
    const upcomingEvent = {
      start: { dateTime: new Date(Date.now() + 10000).toISOString() },
      description: "Campus Z, Building Z",
    };

    const { queryByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    const observerCallback = fakeObserver.subscribe.mock.calls[0][0];

    // 1) Provide an event => show button
    act(() => {
      observerCallback([upcomingEvent]);
    });
    expect(await waitFor(() => queryByText("Go to My Next Class"))).toBeTruthy();

    // 2) Now provide empty => no future events => button disappears
    act(() => {
      observerCallback([]);
    });

    // After re-render, button should be gone
    expect(queryByText("Go to My Next Class")).toBeNull();
  });

  test("Handles null or undefined coords from getCurrentPositionAsync gracefully", async () => {
    // If expo-location returns an object with missing coords, we can see if it logs an error or does nothing
    Location.getCurrentPositionAsync.mockResolvedValue({ coords: null });

    const futureEvent = {
      start: { dateTime: new Date(Date.now() + 20000).toISOString() },
      description: "Campus A, Building B",
    };

    const { getByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    const observerCallback = fakeObserver.subscribe.mock.calls[0][0];

    act(() => {
      observerCallback([futureEvent]);
    });

    const button = await waitFor(() => getByText("Go to My Next Class"));
    fireEvent.press(button);

    // We expect either no navigation or a console.error. Adjust as needed:
    expect(mockNavigation.navigate).not.toHaveBeenCalled();
  });
// Additional tests for NextClassButton observer callback logic

describe("NextClassButton Observer Callback", () => {
  let observerCallback;
  beforeEach(() => {
    // Recreate the fake observer so we can directly access its subscribe callback
    fakeObserver = {
      subscribe: jest.fn((cb) => {
        observerCallback = cb;
      }),
      unsubscribe: jest.fn(),
      notify: jest.fn(),
    };
    // Re-render component with our fresh fakeObserver
  });

  it("sets nextEventLocation to null if events is undefined", async () => {
    const { queryByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    // Simulate undefined events
    act(() => {
      observerCallback(undefined);
    });
    expect(queryByText("Go to My Next Class")).toBeNull();
  });

  it("sets nextEventLocation to null if events array is empty", async () => {
    const { queryByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    act(() => {
      observerCallback([]);
    });
    expect(queryByText("Go to My Next Class")).toBeNull();
  });

  it("sets nextEventLocation to null if only past events exist", async () => {
    const pastEvent = {
      start: { dateTime: new Date(Date.now() - 60000).toISOString() },
      description: "Campus Past, Building Past",
    };
    const { queryByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    act(() => {
      observerCallback([pastEvent]);
    });
    expect(queryByText("Go to My Next Class")).toBeNull();
  });

  it("triggers fade animation and sets nextEventLocation for a future event", async () => {
    const futureEvent = {
      start: { dateTime: new Date(Date.now() + 60000).toISOString() },
      description: "Campus Future, Building Future",
    };
    const { getByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    act(() => {
      observerCallback([futureEvent]);
    });
    const button = await waitFor(() => getByText("Go to My Next Class"));
    expect(button).toBeTruthy();
    expect(Animated.timing).toHaveBeenCalledWith(
      expect.any(Animated.Value),
      expect.objectContaining({
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    );
  });

  it("handleGoToNextClass does nothing if nextEventLocation is null", async () => {
    // Render with an observer that sets no event (empty array)
    const { queryByText } = render(<NextClassButton eventObserver={fakeObserver} />);
    act(() => {
      observerCallback([]);
    });
    // Button should not be rendered so nothing to press.
    expect(queryByText("Go to My Next Class")).toBeNull();
  });
});

});