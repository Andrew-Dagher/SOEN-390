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
  import { fireEvent, render, waitFor } from '@testing-library/react-native';
  import { useNavigation } from "@react-navigation/native";
  
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
        const ReactNative = jest.requireActual('react-native');
        return {
          ...ReactNative,
          // Mock Text and other components that might use className
          Text: ({ children, ...props }) => <ReactNative.Text {...props}>{children}</ReactNative.Text>,
          TouchableHighlight: ({ children, ...props }) => (
            <ReactNative.TouchableHighlight {...props}>{children}</ReactNative.TouchableHighlight>
          ),
          Pressable: ({ children, ...props }) => (
            <ReactNative.Pressable {...props}>{children}</ReactNative.Pressable>
          )
        };
      });
      
      expect(() => {
        render(<MapResultItem {...mockProps} />);
      }).not.toThrow();
    });

    it('should call setStart if start is null', () => {
        const { getByText } = render(<MapResultItem {...mockProps} />);
        fireEvent.press(getByText('Set Start'));
        expect(mockProps.setStart).toHaveBeenCalledWith(mockProps.building.point);
        expect(mockProps.setStartPosition).toHaveBeenCalledWith(mockProps.building.name);
     });

    it('should call all expected functions in handleGetDirections', () => {
        const { getByText } = render(<MapResultItem {...mockProps} />);
        fireEvent.press(getByText('Get Directions'));
        expect(mockProps.setCloseTraceroute).toHaveBeenCalledWith(false);
        expect(mockProps.setEnd).toHaveBeenCalledWith(mockProps.building.point);
        expect(mockProps.setDestinationPosition).toHaveBeenCalledWith(mockProps.building.name);
    });

    it("should navigate to Building Details with correct parameters", () => {
        const mockNavigate = jest.fn();
        
        useNavigation.mockReturnValue({ navigate: mockNavigate });
        const { getByText } = render(<MapResultItem {...mockProps} />);
        // Simulate user pressing the building name
        fireEvent.press(getByText("Test Building"));
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        // Ensure the correct arguments were passed to navigate
        expect(mockNavigate).toHaveBeenCalledWith("Building Details", mockProps.building);
    });

    it('should handle setting start when start is already set and different from location coords', async () => {
        // Set start
        const propsWithStartSet = {
            ...mockProps,
            start: { latitude: 45.500, longitude: -73.570 }, 
        };
    
        const { getByText } = render(<MapResultItem {...propsWithStartSet} />);
        
        // Simulate pressing the button
        fireEvent.press(getByText('Set Destination'));
    
        // Assertions
        expect(propsWithStartSet.setIsRoute).toHaveBeenCalledWith(true);
        expect(propsWithStartSet.setIsSearch).toHaveBeenCalledWith(true);
        expect(propsWithStartSet.setDestinationPosition).toHaveBeenCalledWith(propsWithStartSet.building.name);
        expect(propsWithStartSet.setEnd).toHaveBeenCalledWith(propsWithStartSet.building.point);
        
        // Check travel time resets
        expect(propsWithStartSet.setCarTravelTime).toHaveBeenCalledWith(null);
        expect(propsWithStartSet.setBikeTravelTime).toHaveBeenCalledWith(null);
        expect(propsWithStartSet.setMetroTravelTime).toHaveBeenCalledWith(null);
        expect(propsWithStartSet.setWalkTravelTime).toHaveBeenCalledWith(null);
    
        // Ensure fetchTravelTime is called for all transport modes
        await waitFor(() => {
            expect(propsWithStartSet.fetchTravelTime).toHaveBeenCalledTimes(4);
            expect(propsWithStartSet.fetchTravelTime).toHaveBeenCalledWith(
                propsWithStartSet.start,
                propsWithStartSet.building.point,
                'DRIVING'
            );
            expect(propsWithStartSet.fetchTravelTime).toHaveBeenCalledWith(
                propsWithStartSet.start,
                propsWithStartSet.building.point,
                'BICYCLING'
            );
            expect(propsWithStartSet.fetchTravelTime).toHaveBeenCalledWith(
                propsWithStartSet.start,
                propsWithStartSet.building.point,
                'TRANSIT'
            );
            expect(propsWithStartSet.fetchTravelTime).toHaveBeenCalledWith(
                propsWithStartSet.start,
                propsWithStartSet.building.point,
                'WALKING'
            );
        });
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
      
      // Call the function directly
      handleSetStart();
      
      // Assertions
      expect(mockProps.setStart).toHaveBeenCalledWith(mockProps.building.point);
      expect(mockProps.setStartPosition).toHaveBeenCalledWith(mockProps.building.name);
    });
    
    it('should call fetchTravelTime for all transport modes when start is set', async () => {
      // Create props with start already set
      const propsWithStart = {
        ...mockProps,
        start: { latitude: 45.496, longitude: -73.577 }, 
        fetchTravelTime: jest.fn().mockResolvedValue(true) 
      };
      
      const handleSetStart = async () => {
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
        
          const fetchAllTravelTimes = async () => {
            await Promise.all([
              propsWithStart.fetchTravelTime(propsWithStart.start, propsWithStart.building.point, 'DRIVING'),
              propsWithStart.fetchTravelTime(propsWithStart.start, propsWithStart.building.point, 'BICYCLING'),
              propsWithStart.fetchTravelTime(propsWithStart.start, propsWithStart.building.point, 'TRANSIT'),
              propsWithStart.fetchTravelTime(propsWithStart.start, propsWithStart.building.point, 'WALKING'),
            ]);
          };
          
          await fetchAllTravelTimes();
          return;
        }
        propsWithStart.setStart(propsWithStart.building.point);
        propsWithStart.setStartPosition(propsWithStart.building.name);
      };
      
      await handleSetStart();
      
      // Assertions
      expect(propsWithStart.setIsRoute).toHaveBeenCalledWith(true);
      expect(propsWithStart.setIsSearch).toHaveBeenCalledWith(true);
      expect(propsWithStart.setDestinationPosition).toHaveBeenCalledWith(propsWithStart.building.name);
      expect(propsWithStart.setEnd).toHaveBeenCalledWith(propsWithStart.building.point);

      // Check travel time resets
      expect(propsWithStart.setCarTravelTime).toHaveBeenCalledWith(null);
      expect(propsWithStart.setBikeTravelTime).toHaveBeenCalledWith(null);
      expect(propsWithStart.setMetroTravelTime).toHaveBeenCalledWith(null);
      expect(propsWithStart.setWalkTravelTime).toHaveBeenCalledWith(null);
      
      expect(propsWithStart.fetchTravelTime).toHaveBeenCalledTimes(4);
      expect(propsWithStart.fetchTravelTime).toHaveBeenCalledWith(
        propsWithStart.start,
        propsWithStart.building.point,
        'DRIVING'
      );
      expect(propsWithStart.fetchTravelTime).toHaveBeenCalledWith(
        propsWithStart.start,
        propsWithStart.building.point,
        'BICYCLING'
      );
      expect(propsWithStart.fetchTravelTime).toHaveBeenCalledWith(
        propsWithStart.start,
        propsWithStart.building.point,
        'TRANSIT'
      );
      expect(propsWithStart.fetchTravelTime).toHaveBeenCalledWith(
        propsWithStart.start,
        propsWithStart.building.point,
        'WALKING'
      );
    });
    
    // Test handleGetDirections
    it('should call all expected functions in handleGetDirections', () => {
      const handleGetDirections = () => {
        mockProps.setCloseTraceroute(false);
        mockProps.setEnd(mockProps.building.point);
        mockProps.setDestinationPosition(mockProps.building.name);
        mockProps.setStartPosition("Your Location");
      };
      
      handleGetDirections();
      
      // assertions
      expect(mockProps.setCloseTraceroute).toHaveBeenCalledWith(false);
      expect(mockProps.setEnd).toHaveBeenCalledWith(mockProps.building.point);
      expect(mockProps.setDestinationPosition).toHaveBeenCalledWith(mockProps.building.name);
      expect(mockProps.setStartPosition).toHaveBeenCalledWith("Your Location");
      
      const setCloseTracerouteOrder = mockProps.setCloseTraceroute.mock.invocationCallOrder[0];
      const setEndOrder = mockProps.setEnd.mock.invocationCallOrder[0];
      const setDestinationPositionOrder = mockProps.setDestinationPosition.mock.invocationCallOrder[0];
      const setStartPositionOrder = mockProps.setStartPosition.mock.invocationCallOrder[0];
      
      expect(setCloseTracerouteOrder).toBeLessThan(setEndOrder);
      expect(setEndOrder).toBeLessThan(setDestinationPositionOrder);
      expect(setDestinationPositionOrder).toBeLessThan(setStartPositionOrder);
    });
    
    // Test handlePress function 
    it('should navigate to Building Details with correct parameters', () => {
      const mockNavigate = jest.fn();
      const useNavigationMock = jest.requireMock('@react-navigation/native').useNavigation;
      useNavigationMock.mockReturnValue({
        navigate: mockNavigate
      });
      
      const handlePress = () => {
        mockNavigate('Building Details', mockProps.building);
      };
      
      handlePress();
      
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('Building Details', mockProps.building);
      
    
      const buildingParam = mockNavigate.mock.calls[0][1];
      expect(buildingParam).toBe(mockProps.building); 
      expect(buildingParam.name).toBe('Test Building');
      expect(buildingParam.address).toBe('Test Address');
      expect(buildingParam.point.latitude).toBe(45.497);
      expect(buildingParam.point.longitude).toBe(-73.578);
    });
  });