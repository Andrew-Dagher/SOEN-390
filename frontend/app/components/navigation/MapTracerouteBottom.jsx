/**
 * @file MapTracerouteBottom.jsx
 * @description A React Native component for displaying the bottom navigation bar of the traceroute feature.
 */

import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet, View, Dimensions, TouchableOpacity, Text } from 'react-native';
import StartIcon from './Icons/StartIcon';

/**
 * MapTracerouteBottom component for displaying route details and starting navigation.
 * @component
 * @param {Object} props - Component props
 * @param {Boolean} props.isRoute - Indicates whether a route is currently active
 * @param {Function} props.setIsRoute - Function to toggle the route state
 * @param {Object} props.end - Destination coordinates
 * @param {Object} props.start - Start location coordinates
 * @param {Function} props.panToStart - Function to pan the map to the start location
 * @param {Boolean} props.closeTraceroute - Flag to indicate if the traceroute should be closed
 * @param {Function} props.setCloseTraceroute - Function to close the traceroute panel
 */
const MapTracerouteBottom = ({ isRoute, setIsRoute, end, start, panToStart, closeTraceroute, setCloseTraceroute }) => {
  const screenHeight = Dimensions.get('window').height;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current; // Start off-screen

  /**
   * Slides the component into view.
   */
  const slideUp = () => {
    Animated.timing(slideAnim, {
      toValue: screenHeight * 0.9, // Show 10% of the screen
      duration: 1000,
      useNativeDriver: false, 
    }).start();
  };

  /**
   * Slides the component out of view.
   */
  const slideOut = () => {
    Animated.timing(slideAnim, {
      toValue: screenHeight, // Move off-screen
      duration: 500,
      useNativeDriver: false, 
    }).start();
  };

  // Slide up when start or end location changes
  useEffect(() => {
    slideUp(); 
  }, [end, start]);

  // Slide out when closeTraceroute is set to true
  useEffect(() => {
    if (closeTraceroute) {
      slideOut();
    }
  }, [closeTraceroute]);

  /**
   * Handles the start traceroute button click.
   */
  const handleStartTraceroute = () => {
    console.log("Start traceroute clicked");
    panToStart();
  };

  return (
    <Animated.View className='absolute mb-10 bottom-20' style={[styles.slidingView, { top: slideAnim }]}>
      <View className='w-4/6 mb-10 flex flex-row justify-around'>
        <View className='flex flex-row justify-around items-center'>
          <Text className='color-green-500 font-medium mr-2'>30 min</Text>
          <Text className='font-medium'>(20.0 km)</Text>
        </View>
        <TouchableOpacity 
          onPress={handleStartTraceroute} 
          className='bg-primary-red p-3 rounded-3xl pr-4 pl-4 flex flex-row justify-around items-center'
        >
          <StartIcon />
          <Text className='ml-2 color-selected text-lg'>Start</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  slidingView: {
    position: 'absolute',
    height: '30%', // Height relative to screen
    width: '100%', // Full width
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MapTracerouteBottom;
