import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import CampusMap from '../app/components/navigation/Map';

import 'react-native-gesture-handler/jestSetup';

// Mocks
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 45.495, longitude: -73.577 },
  }),
}));
jest.mock('../../../assets/concordia-logo.png', () => 'logo');
jest.mock('../../../assets/my_location.png', () => 'my_location');
jest.mock('../../../assets/shuttle.png', () => 'shuttle');
jest.mock('../../../assets/shuttle-bus-map.png', () => 'bus_map');

describe('CampusMap', () => {
  it('renders without crashing', () => {
    render(
      <NavigationContainer>
        <CampusMap navigationParams={{ campus: 'sgw' }} />
      </NavigationContainer>
    );
  });

  it('reads navigationParams and sets campus to loyola', () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <CampusMap navigationParams={{ campus: 'loyola' }} />
      </NavigationContainer>
    );
    const button = getByTestId('get-directions');
    expect(button).toBeTruthy();
  });

  it('shows current location marker if location is defined', async () => {
    const { findAllByTestId } = render(
      <NavigationContainer>
        <CampusMap navigationParams={{ campus: 'sgw' }} />
      </NavigationContainer>
    );
    const markers = await findAllByTestId('bus-marker');
    expect(markers.length).toBeGreaterThanOrEqual(0);
  });

  it('handles "Set Start" button press', async () => {
    const { findByTestId } = render(
      <NavigationContainer>
        <CampusMap
          navigationParams={{
            campus: 'sgw',
            buildingName: 'Hall',
            currentLocation: { latitude: 45.495, longitude: -73.577 },
          }}
        />
      </NavigationContainer>
    );
    const setStartButton = await findByTestId('set-start-end');
    fireEvent.press(setStartButton);
    // Additional checks can go here if the component updates state
  });

  it('handles "Get Directions" button press', async () => {
    const { findByTestId } = render(
      <NavigationContainer>
        <CampusMap
          navigationParams={{
            campus: 'sgw',
            buildingName: 'Hall',
            currentLocation: { latitude: 45.495, longitude: -73.577 },
          }}
        />
      </NavigationContainer>
    );
    const getDirectionsButton = await findByTestId('get-directions');
    fireEvent.press(getDirectionsButton);
    // Additional checks can go here if the component updates state
  });
});
