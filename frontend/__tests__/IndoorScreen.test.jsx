// IndoorMap.test.jsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import InDoorScreen from '../app/screens/indoor/InDoorScreen.jsx' 
import { WebView } from 'react-native-webview';

// Mocking navigation and route hooks
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
  }),
  useRoute: jest.fn(),
}));

// Mock ColorBindTheme and AppSettingsContext
jest.mock('../../ColorBindTheme', () => () => ({
  backgroundColor: 'blue',
}));
jest.mock('../../AppSettingsContext', () => ({
  useAppSettings: () => ({
    wheelchairAccess: false,
    textSize: 16,
  }),
}));

// Mock the inDoorUtil functions and picker list
jest.mock('./inDoorUtil', () => ({
  pickerList: [
    { label: 'Room 101', value: '101' },
    { label: 'Room 102', value: '102' },
  ],
  areRoomsOnSameFloor: jest.fn(),
  areRoomsOnSameBuilding: jest.fn(),
  getFloorIdByRoomId: jest.fn(),
  getUrlByFloorId: jest.fn(),
  getEntranceByRoomId: jest.fn(),
  getUrlByRoomId: jest.fn(),
}));

// Optionally, mock the Map component to simplify testing
jest.mock('../../components/navigation/Map', () => {
  return () => <></>;
});

import * as inDoorUtil from './inDoorUtil';
import { useRoute } from '@react-navigation/native';

describe('InDoorScreen', () => {
  const defaultBuilding = { floorPlans: 'http://example.com/map' };
  const defaultStep1 = { value: '101', value1: '102' };

  beforeEach(() => {
    // Reset platform for header padding (if needed)
    Platform.OS = 'ios';
    // Clear previous mock implementations
    jest.clearAllMocks();
  });

  it('renders header and back button', () => {
    useRoute.mockReturnValue({
      params: {
        building: defaultBuilding,
        step1: defaultStep1,
      },
    });
    const { getByText } = render(<InDoorScreen />);
    expect(getByText('Indoor Directions')).toBeTruthy();
    expect(getByText('←')).toBeTruthy();
  });

  it('does nothing when search is pressed with null values', () => {
    useRoute.mockReturnValue({
      params: {
        building: defaultBuilding,
        step1: { value: null, value1: null },
      },
    });
    const { getByText, queryByTestId } = render(<InDoorScreen />);
    const searchButton = getByText('Search');
    fireEvent.press(searchButton);
    // Since no valid values, the state should not advance to rendering a WebView.
    expect(queryByTestId('webview-departure')).toBeNull();
  });

  it('handles same floor scenario', async () => {
    useRoute.mockReturnValue({
      params: {
        building: defaultBuilding,
        step1: defaultStep1,
      },
    });
    // Set up mocks for same floor scenario
    inDoorUtil.getFloorIdByRoomId.mockImplementation((roomId) => (roomId === '101' ? '1' : '2'));
    inDoorUtil.getUrlByFloorId.mockReturnValue('http://example.com/map?');
    inDoorUtil.getEntranceByRoomId.mockReturnValue('entrance');
    inDoorUtil.areRoomsOnSameFloor.mockReturnValue(true);
    
    const { getByText, UNSAFE_getByType } = render(<InDoorScreen />);
    
    const searchButton = getByText('Search');
    fireEvent.press(searchButton);
    
    // Expect that the WebView is rendered with the departure URL
    await waitFor(() => {
      const webview = UNSAFE_getByType(WebView);
      expect(webview.props.source.uri).toBe(
        'http://example.com/map?&floor=1&location=101&departure=102'
      );
    });
  });

  it('handles same building scenario', async () => {
    useRoute.mockReturnValue({
      params: {
        building: defaultBuilding,
        step1: defaultStep1,
      },
    });
    // Setup mocks: rooms are not on the same floor but in the same building.
    inDoorUtil.getFloorIdByRoomId.mockImplementation((roomId) => (roomId === '101' ? '1' : '2'));
    inDoorUtil.getUrlByFloorId.mockReturnValue('http://example.com/map?');
    inDoorUtil.getEntranceByRoomId.mockReturnValue('entrance');
    inDoorUtil.areRoomsOnSameFloor.mockReturnValue(false);
    inDoorUtil.areRoomsOnSameBuilding.mockReturnValue(true);
    
    const { getByText, UNSAFE_getByType, queryByText } = render(<InDoorScreen />);
    
    fireEvent.press(getByText('Search'));
    
    // The departure WebView should have the URL composed for same building scenario
    await waitFor(() => {
      const webview = UNSAFE_getByType(WebView);
      expect(webview.props.source.uri).toBe(
        'http://example.com/map?&floor=1&departure=101&location=entrance'
      );
    });
    
    // Also verify that the Next Directions button (for same building) is rendered
    expect(queryByText('Next Directions')).toBeTruthy();
  });

  it('handles different building scenario and outdoor directions flow', async () => {
    useRoute.mockReturnValue({
      params: {
        building: defaultBuilding,
        step1: defaultStep1,
        // Additional params can be added if needed for outdoor routing.
      },
    });
    // Setup mocks: rooms are neither on the same floor nor same building.
    inDoorUtil.getFloorIdByRoomId.mockImplementation((roomId) => (roomId === '101' ? '1' : '2'));
    inDoorUtil.getUrlByFloorId.mockReturnValue('http://example.com/map?');
    inDoorUtil.getEntranceByRoomId
      .mockImplementation((roomId, wheelchair = false, isDeparture = false) =>
        roomId === '101' ? 'entrance1' : 'entrance2'
      );
    inDoorUtil.areRoomsOnSameFloor.mockReturnValue(false);
    inDoorUtil.areRoomsOnSameBuilding.mockReturnValue(false);
    inDoorUtil.getUrlByRoomId.mockReturnValue('http://example.com/building?');
    
    const { getByText, UNSAFE_getByType, queryByText } = render(<InDoorScreen />);
    
    // Press Search to simulate indoor departure mapping.
    fireEvent.press(getByText('Search'));
    
    // Verify the departure WebView URL is correct.
    await waitFor(() => {
      const webview = UNSAFE_getByType(WebView);
      expect(webview.props.source.uri).toBe(
        'http://example.com/map?&floor=1&departure=101&location=entrance1'
      );
    });
    
    // The "Outdoor Directions" button should be visible.
    const outdoorBtn = getByText('Outdoor Directions');
    expect(outdoorBtn).toBeTruthy();
    
    // Move to outdoor directions (currentStep becomes 2) where the Map component is rendered.
    fireEvent.press(outdoorBtn);
    await waitFor(() => {
      // Because we mocked the Map component to render nothing,
      // we can check for the presence of the "Back" and "Next" buttons.
      expect(getByText('Back')).toBeTruthy();
      expect(getByText('Next')).toBeTruthy();
    });
    
    // Simulate pressing "Next" to move to step 3 and show the destination WebView.
    fireEvent.press(getByText('Next'));
    await waitFor(() => {
      const webview = UNSAFE_getByType(WebView);
      // Expected destination URL is composed from getUrlByRoomId and nextFloorId etc.
      expect(webview.props.source.uri).toBe(
        'http://example.com/building?&floor=2&location=102&departure=entrance2'
      );
    });
  });
});
