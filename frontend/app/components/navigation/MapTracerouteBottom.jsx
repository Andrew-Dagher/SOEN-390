/**
 * @file MapTracerouteBottom.jsx
 * @description A React Native component for displaying the bottom navigation bar of the traceroute feature.
 */

import React, { useRef, useEffect } from "react";
import {
  Animated,
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
} from "react-native";
import StartIcon from "./Icons/StartIcon";

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

const MapTracerouteBottom = ({
  isRoute,
  setIsRoute,
  end,
  start,
  panToStart,
  closeTraceroute,
  setCloseTraceroute,
}) => {
  const screenHeight = Dimensions.get("window").height;
  const slideAnim = useRef(new Animated.Value(100)).current;

  /**
   * Slides the component into view.
   */
  const slideUp = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  /**
   * Slides the component out of view.
   */
  const slideOut = () => {
    Animated.timing(slideAnim, {
      toValue: 100,
      duration: 500,
      useNativeDriver: true,
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
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.contentWrapper}>
        <View style={styles.timeDistanceContainer}>
          <Text style={styles.timeText}>30 min</Text>
          <Text style={styles.distanceText}>(20.0 km)</Text>
        </View>
        <TouchableOpacity
          onPress={handleStartTraceroute}
          style={styles.startButton}
        >
          <StartIcon />
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    bottom: 40,
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  contentWrapper: {
    width: "66.67%",
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  timeDistanceContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  timeText: {
    color: "green",
    fontWeight: "500",
    marginRight: 8,
  },
  distanceText: {
    fontWeight: "500",
  },
  startButton: {
    backgroundColor: "rgba(108, 12, 12, 0.8)",
    padding: 12,
    borderRadius: 24,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  startButtonText: {
    marginLeft: 8,
    color: "white",
    fontSize: 18,
  },
});

export default MapTracerouteBottom;
