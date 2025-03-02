/**
 * @file MapTraceroute.jsx
 * @description A React Native component that handles traceroute navigation,
 * allowing users to select start and destination points and choose between different transportation modes.
 */

import React, { useEffect, useRef, useState } from "react";
import "react-native-get-random-values";
import {
  Animated,
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableOpacity,
} from "react-native";
import CarIcon from "./Icons/CarIcon";
import BikeNavIcon from "./Icons/BikeNavIcon";
import MetroNavIcon from "./Icons/MetroNavIcon";
import WalkIcon from "./Icons/WalkIcon";
import CircleIcon from "./Icons/CircleIcon";
import DotsIcon from "./Icons/DotsIcon";
import SmallNavigationIcon from "./Icons/SmallNavigationIcon";
import SwapIcon from "./Icons/SwapIcon";
import ArrowIcon from "./Icons/ArrowIcon";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import {
  SGWShuttlePickup,
  LoyolaShuttlePickup,
} from "../../screens/navigation/navigationConfig";

/**
 * MapTraceroute component for selecting start and destination locations and choosing a transportation mode.
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.setMode - Function to set the transportation mode.
 * @param {Array} props.waypoints - Array of waypoints for the traceroute.
 * @param {Function} props.setWaypoints - Function to update waypoints.
 * @param {Object} props.location - Current user location.
 * @param {Function} props.reset - Function to reset traceroute.
 * @param {boolean} props.isRoute - Boolean indicating if a route is active.
 * @param {Function} props.setIsRoute - Function to update isRoute state.
 * @param {Function} props.setSelectedBuilding - Function to set selected building.
 * @param {Function} props.panToMyLocation - Function to pan the map to the user's location.
 * @param {Object} props.end - Destination coordinates.
 * @param {Object} props.start - Start coordinates.
 * @param {Function} props.setEnd - Function to set the destination.
 * @param {Function} props.setStart - Function to set the start location.
 * @param {string} props.startPosition - Name of the start location.
 * @param {string} props.destinationPosition - Name of the destination.
 * @param {Function} props.setStartPosition - Function to update start position name.
 * @param {Function} props.setDestinationPosition - Function to update destination position name.
 * @param {boolean} props.closeTraceroute - Boolean to control closing traceroute.
 * @param {Function} props.setCloseTraceroute - Function to update closeTraceroute state.
 * @param {Function} props.setIsSearch - Function to set search mode.
 */
const MapTraceroute = ({
  setMode,
  waypoints,
  setWaypoints,
  location,
  reset,
  isRoute,
  setIsRoute,
  setSelectedBuilding,
  panToMyLocation,
  end,
  start,
  setEnd,
  setStart,
  startPosition,
  destinationPosition,
  setStartPosition,
  setDestinationPosition,
  closeTraceroute,
  setCloseTraceroute,
  setIsSearch,
}) => {
  const [selected, setSelected] = useState("");
  const slideAnim = useRef(
    new Animated.Value(-Dimensions.get("window").height * 0.3)
  ).current; // Initially set off-screen

  /**
   * Animates the traceroute panel sliding in.
   */
  const slideIn = () => {
    Animated.timing(slideAnim, {
      toValue: 0, // Slide to visible position
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  /**
   * Animates the traceroute panel sliding out.
   */
  const slideOut = () => {
    Animated.timing(slideAnim, {
      toValue: -Dimensions.get("window").height * 0.3, // Slide back up
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  /**
   * Handles closing traceroute.
   */
  const handleCloseTraceroute = () => {
    slideOut();
    setCloseTraceroute(true);
    reset();
  };

  useEffect(() => {
    if (!closeTraceroute) {
      slideIn();
    }
  }, [closeTraceroute]);

  /**
   * Handles place selection from Google Places Autocomplete.
   * @param {Object} details - Place details.
   * @param {string} flag - Indicates whether it's the origin or destination.
   */
  const onPlaceSelected = (details, flag) => {
    const set = flag === "origin" ? setStart : setEnd;
    const position = {
      latitude: details?.geometry.location.lat || 0,
      longitude: details?.geometry.location.lng || 0,
    };
    set(position);
    panToMyLocation(position);
  };

  /**
   * Input component for selecting locations.
   * @param {Object} props - Component props.
   * @param {string} props.label - Label for the input field.
   * @param {string} props.placeholder - Placeholder text.
   * @param {Function} props.onPlaceSelected - Function to handle place selection.
   */
  const InputAutocomplete = ({ label, placeholder, onPlaceSelected }) => (
    <GooglePlacesAutocomplete
      enableHighAccuracyLocation={true}
      styles={{ textInput: styles.input }}
      placeholder={placeholder || ""}
      fetchDetails
      onPress={(data, details = null) => onPlaceSelected(details)}
      query={{
        key: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
        language: "en-us",
      }}
    />
  );

  return (
    <Animated.View
      className="rounded-xl p-3"
      style={[styles.slidingView, styles.shadow, { top: slideAnim }]}
    >
      <View className="flex h-full w-full flex-col p-2">
        <View className="mt-2 h-5/6 flex flex-row justify-center items-center">
          <TouchableOpacity
            className="mr-4 mb-8"
            onPress={handleCloseTraceroute}
          >
            <ArrowIcon />
          </TouchableOpacity>
          <View className="flex flex-col justify-center items-center mr-4">
            <CircleIcon />
            <DotsIcon />
            <SmallNavigationIcon />
          </View>
          <View className="w-2/3 mt-8">
            <InputAutocomplete
              label="Origin"
              placeholder={startPosition}
              onPlaceSelected={(details) => onPlaceSelected(details, "origin")}
            />
            <InputAutocomplete
              label="Destination"
              placeholder={destinationPosition}
              onPlaceSelected={(details) =>
                onPlaceSelected(details, "destination")
              }
            />
          </View>
          <View className="ml-4">
            <SwapIcon />
          </View>
        </View>
        <View className="flex flex-row items-center justify-around h-1/6">
          <TouchableOpacity
            onPress={() => {
              setSelected("car");
              setWaypoints([SGWShuttlePickup, LoyolaShuttlePickup]);
            }}
            className={`flex p-2 rounded-3xl flex-row items-center ${
              selected === "car" ? "bg-primary-red" : ""
            }`}
          >
            <CarIcon isSelected={selected === "car"} />
            <Text
              className={`ml-2 font-semibold ${
                selected === "car" ? "color-selected" : ""
              }`}
            >
              30 min
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSelected("bike");
              setMode("BICYCLING");
              setWaypoints([]);
            }}
            className={`flex p-2 rounded-3xl flex-row items-center ${
              selected === "bike" ? "bg-primary-red" : ""
            }`}
          >
            <BikeNavIcon isSelected={selected === "bike"} />
            <Text
              className={`ml-2 font-semibold ${
                selected === "bike" ? "color-selected" : ""
              }`}
            >
              30 min
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSelected("metro");
              setMode("TRANSIT");
              setWaypoints([]);
            }}
            className={`flex p-2 rounded-3xl flex-row items-center ${
              selected === "metro" ? "bg-primary-red" : ""
            }`}
          >
            <MetroNavIcon isSelected={selected === "metro"} />
            <Text
              className={`ml-2 font-semibold ${
                selected === "metro" ? "color-selected" : ""
              }`}
            >
              30 min
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSelected("walk");
              setMode("WALKING");
              setWaypoints([]);
            }}
            className={`flex p-2 rounded-3xl flex-row items-center ${
              selected === "walk" ? "bg-primary-red" : ""
            }`}
          >
            <WalkIcon isSelected={selected === "walk"} />
            <Text
              className={`ml-2 font-semibold ${
                selected === "walk" ? "color-selected" : ""
              }`}
            >
              30 min
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    boxShadow:
      "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
    textAlign: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  slidingView: {
    position: "absolute",
    top: 0, // Start from the top of the screen
    height: Dimensions.get("window").height * 0.3, // 30% of screen height
    width: "100%", // Full width
    backgroundColor: "white", // Background color (customizable)
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    borderColor: "#888",
    borderWidth: 2,
  },
});

export default MapTraceroute;
