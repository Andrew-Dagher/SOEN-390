// IndoorScreen.test.jsx
import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';
import InDoorScreen from '../app/screens/indoor/InDoorScreen';

// Mock WebView as a simple jest function
jest.mock('react-native-webview', () => ({
  WebView: jest.fn(() => null),
}));

// Mock navigation dependencies
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
  }),
  useRoute: jest.fn(),
}));

// Mock theme context
jest.mock('../app/ColorBindTheme', () => () => ({
  backgroundColor: 'blue',
}));

// Mock app settings context
jest.mock('../app/AppSettingsContext', () => ({
  useAppSettings: () => ({
    wheelchairAccess: false,
    textSize: 16,
  }),
}));

// Mock indoor utilities
jest.mock('../app/screens/indoor/inDoorUtil', () => ({
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

// Mock Map component
jest.mock('../app/components/navigation/Map', () => () => null);

// Import mocked modules
import * as inDoorUtil from '../app/screens/indoor/inDoorUtil';
import { useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';

describe('InDoorScreen', () => {
  const defaultBuilding = { floorPlans: 'http://example.com/map' };
  const defaultStep1 = { value: '101', value1: '102' };

  beforeEach(() => {
    Platform.OS = 'ios';
    jest.clearAllMocks();
    useRoute.mockReturnValue({
      params: {
        building: defaultBuilding,
        step1: defaultStep1,
      },
    });
  });

  it('renders header and back button', () => {
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
    
    const { getByText } = render(<InDoorScreen />);
    fireEvent.press(getByText('Search'));
    expect(WebView).not.toHaveBeenCalled();
  });

  it('handles same floor scenario', async () => {
    inDoorUtil.areRoomsOnSameFloor.mockReturnValue(true);
    inDoorUtil.getFloorIdByRoomId.mockImplementation((roomId) => 
      roomId === '101' ? '1' : '2'
    );
    inDoorUtil.getUrlByFloorId.mockReturnValue('http://example.com/map?');

    render(<InDoorScreen />);
    fireEvent.press(screen.getByText('Search'));

    await waitFor(() => {
      expect(WebView).toHaveBeenCalledWith(
        expect.objectContaining({
          source: { uri: 'http://example.com/map?&floor=1&location=101&departure=102' }
        }),
        expect.anything()
      );
    });
  });

  it('handles same building scenario', async () => {
    inDoorUtil.areRoomsOnSameFloor.mockReturnValue(false);
    inDoorUtil.areRoomsOnSameBuilding.mockReturnValue(true);
    inDoorUtil.getFloorIdByRoomId.mockImplementation((roomId) => 
      roomId === '101' ? '1' : '2'
    );
    inDoorUtil.getUrlByFloorId.mockReturnValue('http://example.com/map?');
    inDoorUtil.getEntranceByRoomId.mockReturnValue('entrance');

    render(<InDoorScreen />);
    fireEvent.press(screen.getByText('Search'));

    await waitFor(() => {
      expect(WebView).toHaveBeenCalledWith(
        expect.objectContaining({
          source: { uri: 'http://example.com/map?&floor=1&departure=101&location=entrance' }
        }),
        expect.anything()
      );
    });
  });

  it('handles different building scenario', async () => {
    inDoorUtil.areRoomsOnSameFloor.mockReturnValue(false);
    inDoorUtil.areRoomsOnSameBuilding.mockReturnValue(false);
    inDoorUtil.getFloorIdByRoomId.mockImplementation((roomId) => 
      roomId === '101' ? '1' : '2'
    );
    inDoorUtil.getUrlByFloorId.mockReturnValue('http://example.com/map?');
    inDoorUtil.getEntranceByRoomId.mockImplementation((roomId) => 
      roomId === '101' ? 'entrance1' : 'entrance2'
    );
    inDoorUtil.getUrlByRoomId.mockReturnValue('http://example.com/building?');

    const { getByText } = render(<InDoorScreen />);
    fireEvent.press(getByText('Search'));
    
    // Verify departure WebView
    await waitFor(() => {
      expect(WebView).toHaveBeenCalledWith(
        expect.objectContaining({
          source: { uri: 'http://example.com/map?&floor=1&departure=101&location=entrance1' }
        }),
        expect.anything()
      );
    });

    // Move to outdoor directions
    fireEvent.press(getByText('Outdoor Directions'));
    
    // Move to destination step
    fireEvent.press(getByText('Next'));
    
    // Verify destination WebView
    await waitFor(() => {
      expect(WebView).toHaveBeenCalledWith(
        expect.objectContaining({
          source: { uri: 'http://example.com/building?&floor=2&location=102&departure=entrance2' }
        }),
        expect.anything()
      );
    });
  });
});