// IndoorNavigation.test.js
import React, { useEffect } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { act } from '@testing-library/react-native';

// Mock state setters and dependencies
const mockSetIsSearch = jest.fn();
const mockSetStart = jest.fn();
const mockSetEnd = jest.fn();
const mockSetIsRoute = jest.fn();
const mockSetCarTravelTime = jest.fn();
const mockSetBikeTravelTime = jest.fn();
const mockSetMetroTravelTime = jest.fn();
const mockSetWalkTravelTime = jest.fn();
const mockFetchTravelTime = jest.fn();

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn(),
}));

describe('Indoor Navigation useEffect', () => {
  const setupMocks = () => {
    React.useEffect.mockImplementation((f) => f());
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  const testUseEffect = (params) => {
    const { result } = renderHook(() =>
      useEffect(() => {
        // Your actual useEffect logic here
        if (params?.indoor) {
          try {
            if (params.start && params.end) {
              // ... rest of your useEffect logic ...
              mockFetchTravelTime();
            }
          } catch (e) {
            console.error('Error in mapping of outdoor directions', e);
          }
        }
      }, [params])
    );

    return result;
  };

  it('should handle H building locations', () => {
    act(() => {
      testUseEffect({
        indoor: true,
        start: ['H'],
        end: ['H']
      });
    });

    expect(mockSetStart).toHaveBeenCalledWith({
      latitude: 45.49781725012627,
      longitude: -73.57950979221253
    });
    expect(mockFetchTravelTime).toHaveBeenCalledTimes(4);
  });

  // Add other test cases here
});

// Cleanup
afterEach(() => {
  jest.clearAllMocks();
});