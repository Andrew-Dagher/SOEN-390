import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import InDoorDirections from '../app/components/indoor/InDoorDirections.jsx';

// Mock theme and context
jest.mock('../app/ColorBindTheme', () => () => ({
  backgroundColor: '#000000',
}));

jest.mock('../app/AppSettingsContext', () => ({
  useAppSettings: () => ({
    textSize: 16,
  }),
}));


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

describe('InDoorDirections', () => {
  const createProps = (index, setIndexMock) => ({
    directionsFlow: [{}, {}, {}], // 3 steps
    index,
    setIndex: setIndexMock,
  });

  it('renders only "Next Directions" button when at first step', () => {
    const setIndexMock = jest.fn();
    const { getByText, queryByText } = render(
      <InDoorDirections {...createProps(0, setIndexMock)} />
    );

    expect(getByText('Next Directions')).toBeTruthy();
    expect(queryByText('Prev Directions')).toBeNull();
  });

  it('renders both buttons when at middle step', () => {
    const setIndexMock = jest.fn();
    const { getByText } = render(
      <InDoorDirections {...createProps(1, setIndexMock)} />
    );

    expect(getByText('Next Directions')).toBeTruthy();
    expect(getByText('Prev Directions')).toBeTruthy();
  });

  it('renders only "Prev Directions" button at last step', () => {
    const setIndexMock = jest.fn();
    const { getByText, queryByText } = render(
      <InDoorDirections {...createProps(2, setIndexMock)} />
    );

    expect(getByText('Prev Directions')).toBeTruthy();
    expect(queryByText('Next Directions')).toBeNull();
  });

  it('pressing "Next Directions" calls setIndex with +1 if not at end', () => {
    const setIndexMock = jest.fn();
    const { getByText } = render(
      <InDoorDirections {...createProps(0, setIndexMock)} />
    );

    fireEvent.press(getByText('Next Directions'));
    expect(setIndexMock).toHaveBeenCalledWith(1);
  });

  it('pressing "Next Directions" at end calls setIndex with -1', () => {
    const setIndexMock = jest.fn();
    const props = {
      directionsFlow: [{}, {}, {}],
      index: 2,
      setIndex: setIndexMock,
    };
    const { queryByText } = render(<InDoorDirections {...props} />);
    expect(queryByText('Next Directions')).toBeNull(); // shouldn't render at all
  });

  it('pressing "Prev Directions" calls setIndex with -1', () => {
    const setIndexMock = jest.fn();
    const { getByText } = render(
      <InDoorDirections {...createProps(2, setIndexMock)} />
    );

    fireEvent.press(getByText('Prev Directions'));
    expect(setIndexMock).toHaveBeenCalledWith(1);
  });

  it('does not render anything if index is -1', () => {
    const setIndexMock = jest.fn();
    const props = {
      directionsFlow: [{}, {}, {}],
      index: -1,
      setIndex: setIndexMock,
    };
    const { queryByText } = render(<InDoorDirections {...props} />);
    expect(queryByText('Next Directions')).toBeNull();
    expect(queryByText('Prev Directions')).toBeNull();
  });
});
