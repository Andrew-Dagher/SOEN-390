import React from 'react';
import { render } from '@testing-library/react-native';
import InDoorView from '../app/components/indoor/InDoorView.jsx';


jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    __esModule: true,
    ...actualNav,
    NavigationContainer: ({ children }) => <>{children}</>,
    useNavigation: () => ({
      addListener: jest.fn().mockReturnValue(jest.fn()),
      navigate: jest.fn(),
    }),
    useRoute: () => ({ params: {} }),
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
jest.mock('react-native-webview', () => {
  const { View } = require('react-native');
  return ({ source }) => <View testID="webview" accessibilityLabel={source?.uri} />;
});

jest.mock('../app/components/navigation/Map.jsx', () => {
  const { View } = require('react-native');
  return ({ navigationParams }) => <View testID="map" accessibilityLabel={`map-${navigationParams?.start}-${navigationParams?.end}`} />;
});

describe('InDoorView', () => {
  const selectedStart = 'A';
  const selectedEnd = 'B';

  it('renders WebView when direction is indoor', () => {
    const directionsFlow = [{ is_indoor: true, url: 'https://indoor.com/map' }];
    const { getByTestId, queryByTestId } = render(
      <InDoorView
        directionsFlow={directionsFlow}
        index={0}
        selectedStart={selectedStart}
        selectedEnd={selectedEnd}
      />
    );

    expect(getByTestId('webview')).toBeTruthy();
    expect(queryByTestId('map')).toBeNull();
  });

  it('renders Map when direction is outdoor', () => {
    const directionsFlow = [{ is_indoor: false }];
    const { getByTestId, queryByTestId } = render(
      <InDoorView
        directionsFlow={directionsFlow}
        index={0}
        selectedStart={selectedStart}
        selectedEnd={selectedEnd}
      />
    );

    expect(getByTestId('map')).toBeTruthy();
    expect(queryByTestId('webview')).toBeNull();
  });

  
});
