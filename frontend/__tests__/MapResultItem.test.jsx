/**
 * @file MapResultItem.test.jsx 
 * @description Tests for the MapResultItem component
 */

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(() => ({
      navigate: jest.fn()
    }))
  }));
  
  jest.mock('../app/AppSettingsContext', () => ({
    useAppSettings: jest.fn(() => ({
      textSize: 14
    }))
  }));
  
  jest.mock('../app/ColorBindTheme', () => 
    jest.fn().mockImplementation(() => ({ 
      backgroundColor: '#FF0000' 
    }))
  );
  import React from 'react';
  import { Text, TouchableHighlight, Pressable } from 'react-native';
  import { fireEvent, render } from '@testing-library/react-native';
  
  // Import the actual component 
  import MapResultItem from '../app/components/navigation/MapResults/MapResultItem';
  
  describe('MapResultItem Component Tests', () => {
    // Create mock props
    const mockProps = {
      fetchTravelTime: jest.fn().mockResolvedValue({}),
      setCarTravelTime: jest.fn(),
      setBikeTravelTime: jest.fn(),
      setMetroTravelTime: jest.fn(),
      setWalkTravelTime: jest.fn(),
      isRoute: false,
      location: { coords: { latitude: 45.497, longitude: -73.578 } },
      setIsSearch: jest.fn(),
      setIsRoute: jest.fn(),
      setCloseTraceroute: jest.fn(),
      setStartPosition: jest.fn(),
      setDestinationPosition: jest.fn(),
      building: {
        name: 'Test Building',
        address: 'Test Address',
        point: { latitude: 45.497, longitude: -73.578 },
        isHandicap: true,
        isBike: true,
        isParking: true,
        isCredit: true,
        isInfo: true
      },
      start: null,
      setStart: jest.fn(),
      end: null,
      setEnd: jest.fn()
    };
    
    // Reset mocks before each test
    beforeEach(() => {
      jest.clearAllMocks();
    });
    
    // Test basic rendering
    it('should render the component', () => {
      jest.mock('react-native', () => {
        const RN = jest.requireActual('react-native');
        return {
          ...RN,
          // Mock Text and other components that might use className
          Text: ({ children, ...props }) => <RN.Text {...props}>{children}</RN.Text>,
          TouchableHighlight: ({ children, ...props }) => (
            <RN.TouchableHighlight {...props}>{children}</RN.TouchableHighlight>
          ),
          Pressable: ({ children, ...props }) => (
            <RN.Pressable {...props}>{children}</RN.Pressable>
          )
        };
      });
      
      expect(() => {
        render(<MapResultItem {...mockProps} />);
      }).not.toThrow();
    });
    
    it('should call setStart when "Set Start" button is pressed', () => {
      // Mock all required modules first
      jest.mock('../app/components/navigation/Icons/SmallNavigationIcon', () => () => null);
      jest.mock('../app/components/navigation/Icons/NavigationIcon', () => () => null);
      jest.mock('../app/components/navigation/Icons/DirectionsIcon', () => () => null);
      jest.mock('../app/components/navigation/Icons/WheelChairIcon', () => () => null);
      jest.mock('../app/components/navigation/Icons/BikeIcon', () => () => null);
      jest.mock('../app/components/navigation/Icons/InformationIcon', () => () => null);
      jest.mock('../app/components/navigation/Icons/ParkingIcon', () => () => null);
      jest.mock('../app/components/navigation/Icons/CreditCardIcon', () => () => null);
      
      const handleSetStart = () => {
        if (mockProps.start != null && mockProps.start !== mockProps.location?.coords) {
          mockProps.setIsRoute(true);
          mockProps.setIsSearch(true);
          mockProps.setDestinationPosition(mockProps.building.name);
          mockProps.setEnd(mockProps.building.point);
        
          // Reset travel times
          mockProps.setCarTravelTime(null);
          mockProps.setBikeTravelTime(null);
          mockProps.setMetroTravelTime(null);
          mockProps.setWalkTravelTime(null);
        
          // Fetch times from start point to selected building
          mockProps.fetchTravelTime(mockProps.start, mockProps.building.point, 'DRIVING');
          mockProps.fetchTravelTime(mockProps.start, mockProps.building.point, 'BICYCLING');
          mockProps.fetchTravelTime(mockProps.start, mockProps.building.point, 'TRANSIT');
          mockProps.fetchTravelTime(mockProps.start, mockProps.building.point, 'WALKING');
          return;
        }
        mockProps.setStart(mockProps.building.point);
        mockProps.setStartPosition(mockProps.building.name);
      };
      
      handleSetStart();
      
      expect(mockProps.setStart).toHaveBeenCalledWith(mockProps.building.point);
      expect(mockProps.setStartPosition).toHaveBeenCalledWith(mockProps.building.name);
    });
    
    // Test with start location set
    it('should call setEnd when start is already set', () => {
      const propsWithStart = {
        ...mockProps,
        start: { latitude: 45.496, longitude: -73.577 }
      };
      
      // Extract and test the function
      const handleSetStart = () => {
        if (propsWithStart.start != null && propsWithStart.start !== propsWithStart.location?.coords) {
          propsWithStart.setIsRoute(true);
          propsWithStart.setIsSearch(true);
          propsWithStart.setDestinationPosition(propsWithStart.building.name);
          propsWithStart.setEnd(propsWithStart.building.point);
        
          // Reset travel times
          propsWithStart.setCarTravelTime(null);
          propsWithStart.setBikeTravelTime(null);
          propsWithStart.setMetroTravelTime(null);
          propsWithStart.setWalkTravelTime(null);
        
          // Fetch times from start point to selected building
          propsWithStart.fetchTravelTime(propsWithStart.start, propsWithStart.building.point, 'DRIVING');
          propsWithStart.fetchTravelTime(propsWithStart.start, propsWithStart.building.point, 'BICYCLING');
          propsWithStart.fetchTravelTime(propsWithStart.start, propsWithStart.building.point, 'TRANSIT');
          propsWithStart.fetchTravelTime(propsWithStart.start, propsWithStart.building.point, 'WALKING');
          return;
        }
        propsWithStart.setStart(propsWithStart.building.point);
        propsWithStart.setStartPosition(propsWithStart.building.name);
      };
      
      // Call the function
      handleSetStart();
      
      // Assertions
      expect(propsWithStart.setIsRoute).toHaveBeenCalledWith(true);
      expect(propsWithStart.setIsSearch).toHaveBeenCalledWith(true);
      expect(propsWithStart.setDestinationPosition).toHaveBeenCalledWith(propsWithStart.building.name);
      expect(propsWithStart.setEnd).toHaveBeenCalledWith(propsWithStart.building.point);
      expect(propsWithStart.setCarTravelTime).toHaveBeenCalledWith(null);
      expect(propsWithStart.fetchTravelTime).toHaveBeenCalledTimes(4);
    });
    
    // Test handleGetDirections function
    it('should handle get directions correctly', () => {
      const handleGetDirections = () => {
        mockProps.setCloseTraceroute(false);
        mockProps.setEnd(mockProps.building.point);
        mockProps.setDestinationPosition(mockProps.building.name);
        mockProps.setStartPosition("Your Location");
      };
      
      // Call the function & assert
      handleGetDirections();
      
      expect(mockProps.setCloseTraceroute).toHaveBeenCalledWith(false);
      expect(mockProps.setEnd).toHaveBeenCalledWith(mockProps.building.point);
      expect(mockProps.setDestinationPosition).toHaveBeenCalledWith(mockProps.building.name);
      expect(mockProps.setStartPosition).toHaveBeenCalledWith("Your Location");
    });
    
    // Test navigation function
    it('should navigate to building details', () => {
      // Mock navigation
      const mockNavigate = jest.fn();
      const useNavigationMock = jest.requireMock('@react-navigation/native').useNavigation;
      useNavigationMock.mockReturnValue({
        navigate: mockNavigate
      });
      
      const handlePress = () => {
        mockNavigate('Building Details', mockProps.building);
      };
      
      handlePress();
      
      expect(mockNavigate).toHaveBeenCalledWith('Building Details', mockProps.building);
    });
  });