/**
 * @file MapLocation.jsx
 * @description A React Native component that provides a button to fetch and center the user's current location on the map.
 */

import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import PropTypes from "prop-types"; // Import PropTypes
import LocationIcon from "./Icons/LocationIcon";
import * as Location from "expo-location";
import { useEffect } from "react";

/**
 * MapLocation component provides a button to pan to the user's current location.
 * @component
 * @param {Function} panToMyLocation - Function to center the map on the user's location.
 * @param {Function} setLocation - Function to update the user's location state.
 */
const MapLocation = ({ panToMyLocation, setLocation }) => {
  /**
   * Fetches the user's current location and updates the state.
   * If permission is denied, an error message is set.
   */
  /* Function already exists in Map.jsx
  async function getCurrentLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
  }

  */
  /**
   * Handles the button click event to fetch and center the user's location.
   */
  const handleClick = () => {
    panToMyLocation();
  };

  return (
    <View className="absolute justify-end items-center right-4 h-full">
      <TouchableOpacity
        testID="map-location-button"
        onPress={handleClick}
        style={styles.shadow}
        className="mb-40 flex items-center justify-center rounded-3xl bg-white p-2 mr-4"
      >
        <LocationIcon />
      </TouchableOpacity>
    </View>
  );
};

// Define PropTypes for MapLocation component
MapLocation.propTypes = {
  panToMyLocation: PropTypes.func.isRequired,
  setLocation: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  shadow: {
    width: 30,
    height: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    textAlign: "center",
  },
});

export default MapLocation;
