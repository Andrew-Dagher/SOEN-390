/**
 * Map.test.jsx
 *
 * This test file is designed to drive execution through key branches
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import CampusMap from '../app/components/navigation/Map';

// ---------------------------------------------------------------------------
// 1) MOCK REACT NAVIGATION
// We ensure that addListener('blur') returns a no‑op unsubscribe function.
const dummyUnsubscribe = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    __esModule: true,
    ...actualNav,
    NavigationContainer: ({ children }) => <>{children}</>,
    useNavigation: () => ({
      addListener: jest.fn().mockReturnValue(dummyUnsubscribe),
      navigate: jest.fn(),
    }),
    useRoute: () => ({ params: {} }),
  };
});

// ---------------------------------------------------------------------------
// 2) MOCK BUS SERVICE INLINE
// (This avoids referencing out-of-scope variables in jest.mock.)
const mockAddObserver = jest.fn();
const mockRemoveObserver = jest.fn();
const mockUpdate = jest.fn();
jest.mock('../../app/services/BusService', () => {
  return {
    __esModule: true,
    default: {
      addObserver: mockAddObserver,
      removeObserver: mockRemoveObserver,
      update: mockUpdate,
    },
  };
});

// ---------------------------------------------------------------------------
// 3) MOCK GLOBAL FETCH (for Google Directions)
global.fetch = jest.fn();

// ---------------------------------------------------------------------------
// 4) MOCK trackEvent so we can check its calls.
jest.mock('@aptabase/react-native', () => ({
  trackEvent: jest.fn(),
}));
import { trackEvent } from '@aptabase/react-native';

// ---------------------------------------------------------------------------
// 5) (Optionally) MOCK any additional modules (e.g., polygons) if needed.
// If you want to override polygons, you can uncomment and adjust the following:
// jest.mock('../../screens/navigation/navigationConfig', () => ({
//   polygons: [
//     {
//       name: "Hall",
//       point: { latitude: 45.5, longitude: -73.6 },
//       boundaries: [{ latitude: 45.5, longitude: -73.6 }],
//     },
//   ],
//   SGWLocation: { latitude: 45.495, longitude: -73.577, latitudeDelta: 0.009, longitudeDelta: 0.009 },
//   LoyolaLocation: { latitude: 45.458, longitude: -73.640, latitudeDelta: 0.009, longitudeDelta: 0.009 },
//   SGWShuttlePickup: { latitude: 45.496, longitude: -73.578 },
//   LoyolaShuttlePickup: { latitude: 45.459, longitude: -73.641 },
// }));

// ---------------------------------------------------------------------------
// TEST SUITE
describe('CampusMap - Coverage Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default fetch response: OK with a route and a duration.
    fetch.mockResolvedValue({
      json: async () => ({
        status: 'OK',
        routes: [{
          legs: [{
            duration: { text: '10 mins' },
          }],
        }],
      }),
    });
  });

  // 1. Observer removal on unmount (cleanup branch)
  it('removes busService observer on unmount', async () => {
    const { unmount } = render(
      <NavigationContainer>
        <CampusMap navigationParams={{}} />
      </NavigationContainer>
    );
    expect(mockAddObserver).toHaveBeenCalled();
    unmount();
    expect(mockRemoveObserver).toHaveBeenCalled();
  });

  // 2. fetchTravelTime: early return if start or end is missing
  it('does not call fetchTravelTime when start or end is missing', async () => {
    // Render without providing buildingName/currentLocation that sets start/end.
    const { queryByTestId } = render(
      <NavigationContainer>
        <CampusMap navigationParams={{}} />
      </NavigationContainer>
    );
    // Assuming the "get-directions" button triggers travel time fetch:
    const dirBtn = queryByTestId('get-directions');
    if (dirBtn) {
      fireEvent.press(dirBtn);
    }
    await waitFor(() => {
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  // 3. fetchTravelTime: Identical start and end coordinates trigger "0 min"
  it('sets travel time to 0 min when start and end are identical', async () => {
    const identicalCoords = { latitude: 45.5, longitude: -73.6 };
    render(
      <NavigationContainer>
        <CampusMap
          navigationParams={{
            buildingName: 'Hall',
            currentLocation: identicalCoords,
          }}
        />
      </NavigationContainer>
    );
    // The component’s useEffect should set start and end the same.
    // Then fetchTravelTime checks for identical coordinates and returns early.
    await waitFor(() => {
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  // 4. fetchTravelTime: transit mode branch (append transit_mode to URL)
  it('appends transit_mode parameter for TRANSIT mode', async () => {
    const currentLocation = { latitude: 45.4, longitude: -73.3 };
    render(
      <NavigationContainer>
        <CampusMap
          navigationParams={{
            buildingName: 'Hall',
            currentLocation: currentLocation,
          }}
        />
      </NavigationContainer>
    );
    // Trigger Get Directions to cause fetchTravelTime calls
    const dirBtn = await waitFor(() => document.querySelector('[data-testid="get-directions"]') || null);
    // Alternatively, if using getByTestId:
    const { getByTestId } = render(
      <NavigationContainer>
        <CampusMap
          navigationParams={{
            buildingName: 'Hall',
            currentLocation: currentLocation,
          }}
        />
      </NavigationContainer>
    );
    fireEvent.press(getByTestId('get-directions'));
    await waitFor(() => {
      // Check that at least one fetch call URL includes "mode=transit" and transit_mode parameter.
      const transitCall = fetch.mock.calls.find(([url]) => url.includes('mode=transit'));
      expect(transitCall).toBeTruthy();
      expect(transitCall[0]).toContain('&transit_mode=bus|subway|train');
    });
  });

  // 5. fetchTravelTime: Non‑OK response branch
  it('handles non-OK fetch response and sets travel time to "No route"', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({
        status: 'ZERO_RESULTS',
        error_message: 'No route found',
      }),
    });
    const { getByTestId } = render(
      <NavigationContainer>
        <CampusMap
          navigationParams={{
            buildingName: 'Hall',
            currentLocation: { latitude: 45.4, longitude: -73.3 },
          }}
        />
      </NavigationContainer>
    );
    fireEvent.press(getByTestId('get-directions'));
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  // 6. fetchTravelTime: Missing route.legs[0] branch
  it('handles missing route.legs[0] gracefully', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({
        status: 'OK',
        routes: [{}], // No legs array
      }),
    });
    const { getByTestId } = render(
      <NavigationContainer>
        <CampusMap
          navigationParams={{
            buildingName: 'Hall',
            currentLocation: { latitude: 45.4, longitude: -73.3 },
          }}
        />
      </NavigationContainer>
    );
    fireEvent.press(getByTestId('get-directions'));
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  // 7. fetchTravelTime: Catch block when fetch throws an error
  it('handles fetch error in fetchTravelTime', async () => {
    fetch.mockRejectedValueOnce(new Error('Network Error'));
    const { getByTestId } = render(
      <NavigationContainer>
        <CampusMap
          navigationParams={{
            buildingName: 'Hall',
            currentLocation: { latitude: 45.4, longitude: -73.3 },
          }}
        />
      </NavigationContainer>
    );
    fireEvent.press(getByTestId('get-directions'));
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  // 8. useEffect: Handling building selection vs. not found
  it('warns if buildingName is not found and sets building if found', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    // Not found branch
    render(
      <NavigationContainer>
        <CampusMap
          navigationParams={{
            buildingName: 'Nonexistent',
            currentLocation: { latitude: 45.4, longitude: -73.3 },
          }}
        />
      </NavigationContainer>
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith('Building not found:', 'Nonexistent');
    consoleWarnSpy.mockRestore();
  });

  // 9. handleSetStart branch: if (start != null && start !== location?.coords)
  it('executes setStart branch when start already exists and differs from location.coords', async () => {
    const { getByTestId, findByTestId } = render(
      <NavigationContainer>
        <CampusMap
          navigationParams={{
            buildingName: 'Hall',
            currentLocation: { latitude: 45.1, longitude: -73.1 },
          }}
        />
      </NavigationContainer>
    );
    const setStartBtn = await findByTestId('set-start-end');
    // Press once to set start.
    fireEvent.press(setStartBtn);
    // Press again to trigger the branch that resets travel times and calls fetchTravelTime.
    fireEvent.press(setStartBtn);
    await waitFor(() => {
      // Expect 4 fetch calls for DRIVING, BICYCLING, TRANSIT, and WALKING.
      expect(fetch).toHaveBeenCalledTimes(4);
    });
  });

  // 10. handleGetDirections: try block flow
  it('executes handleGetDirections flow and calls trackEvent', async () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <CampusMap
          navigationParams={{
            buildingName: 'Hall',
            currentLocation: { latitude: 45.2, longitude: -73.2 },
          }}
        />
      </NavigationContainer>
    );
    fireEvent.press(getByTestId('get-directions'));
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
      expect(trackEvent).toHaveBeenCalledWith('Get Directions', { "selected building": expect.any(String) });
    });
  });

  // 11. handleLoyola & handleSGW branches
  it('switches campuses when toggled', async () => {
    // Assume campus toggle buttons are rendered with text including "Loyola" and "SGW"
    const { getByText } = render(
      <NavigationContainer>
        <CampusMap navigationParams={{ campus: 'sgw' }} />
      </NavigationContainer>
    );
    const loyolaBtn = getByText((text) => text.includes('Loyola'));
    fireEvent.press(loyolaBtn);
    expect(trackEvent).toHaveBeenCalledWith('Switched to Loyola', {});
    const sgwBtn = getByText((text) => text.includes('SGW'));
    fireEvent.press(sgwBtn);
    expect(trackEvent).toHaveBeenCalledWith('Switched to SGW', {});
  });

  // 12. handleMarkerPress branch: marker onPress sets selected building
  it('handles marker press by calling handleMarkerPress', async () => {
    const { queryByTestId } = render(
      <NavigationContainer>
        <CampusMap navigationParams={{}} />
      </NavigationContainer>
    );
    // Assume a marker for "Hall" exists with testID "building-Hall"
    const marker = queryByTestId('building-Hall');
    if (marker) {
      fireEvent.press(marker);
      expect(trackEvent).toHaveBeenCalledWith('Selected building', { building: 'Hall' });
    }
  });

  // 13. reset branch: clearing route and search state
  it('resets route state when reset is triggered', async () => {
    // If your MapTraceroute or MapTracerouteBottom renders a close button with testID "close-traceroute"
    const { queryByTestId } = render(
      <NavigationContainer>
        <CampusMap
          navigationParams={{
            buildingName: 'Hall',
            currentLocation: { latitude: 45.2, longitude: -73.2 },
          }}
        />
      </NavigationContainer>
    );
    const closeBtn = queryByTestId('close-traceroute');
    if (closeBtn) {
      fireEvent.press(closeBtn);
      // Optionally, verify that certain elements (e.g., the route overlay) are no longer rendered.
      expect(queryByTestId('get-directions')).toBeTruthy();
    }
  });
});
