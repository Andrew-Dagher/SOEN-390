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
  Button,
  Dimensions,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import PropTypes from "prop-types";
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
import { SGWShuttlePickup, LoyolaShuttlePickup } from '../../screens/navigation/navigationConfig';
import { IsAtSGW } from '../../screens/navigation/navigationUtils';
import { trackEvent } from "@aptabase/react-native";


// Define the styles outside of the component
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
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  input: {
    borderColor: "#E0E0E0",
    borderWidth: 1,
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#F8F8F8",
    color: "#333333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  // Search container styles with z-index
  searchContainer: {
    position: "relative",
    zIndex: 1,
    width: "70%",
    height: 150, // Set a fixed height for the container to prevent compression
  },
  originContainer: {
    position: "relative",
    zIndex: 3000,
    marginBottom: 60, // Increased space between inputs to prevent overlap
  },
  destinationContainer: {
    position: "relative",
    zIndex: 2000,
    marginTop: 10, // Added top margin to further separate from origin input
  },
  // Autocomplete styles
  autocompleteContainer: {
    position: "absolute",
    zIndex: 9999,
    backgroundColor: "transparent",
    width: "100%",
    left: 0,
    right: 0,
    height: 50, // Fixed height for the autocomplete container
  },
  listView: {
    position: "absolute",
    top: 50, // Position below the input field
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    zIndex: 10000,
    width: "100%",
    maxHeight: 220,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  row: {
    padding: 15,
    height: "auto",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
  },
  separator: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginLeft: 12,
    marginRight: 12,
  },
  description: {
    fontSize: 15,
    color: "#333333",
  },
  poweredContainer: {
    justifyContent: "flex-end",
    alignItems: "center",
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderColor: "#E0E0E0",
    borderTopWidth: 0.5,
    paddingVertical: 8,
  },
});

/**
 * Input component for selecting locations.
 * Using JavaScript default parameters instead of defaultProps
 *
 * @param {Object} props - Component props.
 * @param {string} props.placeholder - Placeholder text.
 * @param {string} props.flag - Indicates whether it's origin or destination.
 * @param {Function} props.onPlaceSelected - Function to handle place selection.
 */
const InputAutocomplete = ({
  placeholder,
  flag,
  onPlaceSelected,
}) => (
  <GooglePlacesAutocomplete
    enableHighAccuracyLocation={true}
    styles={{
      textInput: styles.input,
      container: styles.autocompleteContainer,
      listView: styles.listView,
      row: styles.row,
      poweredContainer: styles.poweredContainer,
      separator: styles.separator,
      description: styles.description,
      predefinedPlacesDescription: {
        color: "#1faadb",
      },
    }}
    placeholder={placeholder || "Search location..."}
    fetchDetails
    enablePoweredByContainer={true}
    minLength={2}
    nearbyPlacesAPI="GooglePlacesSearch"
    debounce={300}
    numberOfLines={2}
    listViewDisplayed="auto"
    onPress={(data, details = null) => onPlaceSelected(details, flag)}
    textInputProps={{
      placeholderTextColor: "#999",
      returnKeyType: "search",
      autoCapitalize: "none",
      autoCorrect: false,
      defaultValue: placeholder || "",
    }}
    query={{
      key: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
      language: "en-us",
      types: "geocode|establishment",
    }}
  />
);

// Define PropTypes for InputAutocomplete component
InputAutocomplete.propTypes = {
  placeholder: PropTypes.string,
  flag: PropTypes.oneOf(["origin", "destination"]).isRequired,
  onPlaceSelected: PropTypes.func.isRequired,
};

/**
 * MapTraceroute component for selecting start and destination locations and choosing a transportation mode.
 * Using JavaScript default parameters instead of defaultProps
 *
 * @param {Object} props - Component props
 * @param {Function} props.setMode - Sets the transportation mode (DRIVING, WALKING, etc).
 * @param {Array} props.waypoints - Array of waypoints for the route.
 * @param {Function} props.setWaypoints - Sets the waypoints for the route.
 * @param {Object} props.location - Current location of the user.
 * @param {Function} props.reset - Function to reset the component state.
 * @param {boolean} props.isRoute - Indicates if a route is currently active.
 * @param {Function} props.setIsRoute - Sets the route active state.
 * @param {Function} props.setSelectedBuilding - Sets the selected building.
 * @param {Function} props.panToMyLocation - Function to pan the map to user's current location.
 * @param {Object} props.end - Coordinates of the destination.
 * @param {Object} props.start - Coordinates of the starting point.
 * @param {Function} props.setEnd - Sets the destination coordinates.
 * @param {Function} props.setStart - Sets the starting point coordinates.
 * @param {string} props.startPosition - The text representation of the starting position.
 * @param {string} props.destinationPosition - The text representation of the destination position.
 * @param {Function} props.setStartPosition - Sets the text representation of the starting position.
 * @param {Function} props.setDestinationPosition - Sets the text representation of the destination position.
 * @param {boolean} props.closeTraceroute - Indicates if the traceroute panel should be closed.
 * @param {Function} props.setCloseTraceroute - Sets the traceroute panel close state.
 * @param {Function} props.setIsSearch - Sets the search active state.
 * @param {string} props.carTravelTime - Estimated travel time by car.
 * @param {string} props.bikeTravelTime - Estimated travel time by bike.
 * @param {string} props.metroTravelTime - Estimated travel time by public transit.
 * @param {string} props.walkTravelTime - Estimated travel time by walking.
 * @returns {JSX.Element} A React Native component for route selection and display.
 */
const MapTraceroute = ({
  isShuttle,
  setWalkToBus,
  setWalkFromBus,
  setIsShuttle,
  setMode,
  location,
  reset,
  panToMyLocation,
  end,
  setEnd,
  setStart,
  startPosition,
  setStartPosition,
  destinationPosition,
  setDestinationPosition,
  closeTraceroute,
  setCloseTraceroute,
  carTravelTime,
  bikeTravelTime,
  metroTravelTime,
  walkTravelTime,
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
    setEnd(null);
    setStart(null);
    setWalkFromBus({start:null,end:null});
    setWalkToBus({start:null,end:null})
    setIsShuttle(false);
    setCloseTraceroute(true);
    reset();
  };

  useEffect(() => {
    if (!closeTraceroute) {
      slideIn();
    }
  }, [closeTraceroute]);

  /*
    Handles the shuttle integration. If the user is closer to SGW they will have to walk to SGW bus stop.
    If they are closer to loyola they will have to walk to Loyola shuttle pickup. This renders 3 Map directions
    1 to walk to bus from start
    1 bus ride
    1 to walk from bus to destination
  */
  const handleShuttleIntegration = () => {
    if (isShuttle) {
      setSelected("");
      setIsShuttle(false);
      return;
    }
    setSelected("car");
    let isSGW = IsAtSGW(location?.coords)
    if (isSGW) {
      setWalkToBus({
        start: location?.coords,
        end: SGWShuttlePickup
      })
      setWalkFromBus({
        start: LoyolaShuttlePickup,
        end: end
      })
    } else {
      setWalkToBus({
        start: location?.coords,
        end: LoyolaShuttlePickup
      })
      setWalkFromBus({
        start: SGWShuttlePickup,
        end: end
      })
    }
    setIsShuttle(true);
  }

  /**
   * Handles place selection from Google Places Autocomplete.
   * @param {Object} details - Place details.
   * @param {string} flag - Indicates whether it's the origin or destination.
   */
  const onPlaceSelected = (details, flag) => {
    const set = flag === "origin" ? setStart : setEnd;
    const setPosition =
      flag === "origin" ? setStartPosition : setDestinationPosition;

    const position = {
      latitude: details?.geometry.location.lat || 0,
      longitude: details?.geometry.location.lng || 0,
    };

    // Update the coordinates for the selected point
    set(position);

    // Update the text display in the input field
    setPosition(details?.formatted_address || details?.name || "");
  };

  return (
    <Animated.View
      className="rounded-xl p-3"
      testID="sliding-view"
      style={[styles.slidingView, styles.shadow, { top: slideAnim }]}
    >
      <View className="flex h-full w-full flex-col p-2">
        <View className="mt-2 h-5/6 flex flex-row justify-center items-center">
          <TouchableOpacity
            testID="back-button"
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

          {/* Search fields container */}
          <View style={styles.searchContainer} className="w-2/3 mt-14">
            {/* Origin field - higher z-index */}
            <View style={styles.originContainer}>
              <InputAutocomplete
                placeholder={startPosition}
                flag="origin"
                onPlaceSelected={onPlaceSelected}
              />
            </View>

            {/* Destination field - lower z-index */}
            <View style={styles.destinationContainer}>
              <InputAutocomplete
                placeholder={destinationPosition}
                flag="destination"
                onPlaceSelected={onPlaceSelected}
              />
            </View>
          </View>

          <View className="ml-4">
            <TouchableOpacity
              testID="swap-button"
              onPress={() => {
                // Swap start and end positions
                const tempStart = start;
                const tempStartPosition = startPosition;

                setStart(end);
                setStartPosition(destinationPosition);

                setEnd(tempStart);
                setDestinationPosition(tempStartPosition);
              }}
            >
              <SwapIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* Transportation Mode Selection */}
        <View className="flex h-1/6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex flex-row items-center justify-around">
              <TouchableOpacity
                testID="car-button"
                onPress={() => {
                  handleShuttleIntegration();
                  setMode("DRIVING");
                  trackEvent("Mode selected", {"mode":"car"})
                }}
                className={`flex mr-1 p-2 rounded-3xl flex-row justify-around items-center ${
                  selected === "car" ? "bg-primary-red" : ""
                }`}
              >
                <CarIcon isSelected={selected === "car"} />
                <Text
                  className={`ml-2 font-semibold ${
                    selected === "car" ? "color-selected" : ""
                  }`}
                >
                  {carTravelTime || "Calculating..."}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="bike-button"
                onPress={() => {
                  setSelected("bike");
                  setMode("BICYCLING");
                  trackEvent("Mode selected", {"mode":"bycicling"})
                }}
                className={`flex mr-1 p-2 rounded-3xl flex-row justify-around items-center ${
                  selected === "bike" ? "bg-primary-red" : ""
                }`}
              >
                <BikeNavIcon isSelected={selected === "bike"} />
                <Text
                  className={`ml-2 font-semibold ${
                    selected === "bike" ? "color-selected" : ""
                  }`}
                >
                  {bikeTravelTime || "Calculating..."}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="metro-button"
                onPress={() => {
                  setSelected("metro");
                  setMode("TRANSIT");
                  trackEvent("Mode selected", {"mode":"transit"})
                }}
                className={`flex p-2 rounded-3xl flex-row justify-around items-center ${
                  selected === "metro" ? "bg-primary-red" : ""
                }`}
              >
                <MetroNavIcon isSelected={selected === "metro"} />
                <Text
                  className={`ml-2 font-semibold ${
                    selected === "metro" ? "color-selected" : ""
                  }`}
                >
                  {metroTravelTime || "Calculating..."}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="walk-button"
                onPress={() => {
                  setSelected("walk");
                  setMode("WALKING");
                  trackEvent("Mode selected", {"mode":"walking"})
                }}
                className={`flex p-2 rounded-3xl flex-row justify-around items-center ${
                  selected === "walk" ? "bg-primary-red" : ""
                }`}
              >
                <WalkIcon isSelected={selected === "walk"} />
                <Text
                  className={`ml-2 font-semibold ${
                    selected === "walk" ? "color-selected" : ""
                  }`}
                >
                  {walkTravelTime || "Calculating..."}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Animated.View>
  );
};

// Define PropTypes for the main MapTraceroute component
MapTraceroute.propTypes = {
  setMode: PropTypes.func.isRequired,
  waypoints: PropTypes.array,
  setWaypoints: PropTypes.func,
  location: PropTypes.object,
  reset: PropTypes.func.isRequired,
  isRoute: PropTypes.bool,
  setIsRoute: PropTypes.func,
  setSelectedBuilding: PropTypes.func,
  panToMyLocation: PropTypes.func,
  end: PropTypes.object,
  start: PropTypes.object,
  setEnd: PropTypes.func.isRequired,
  setStart: PropTypes.func.isRequired,
  startPosition: PropTypes.string,
  destinationPosition: PropTypes.string,
  setStartPosition: PropTypes.func.isRequired,
  setDestinationPosition: PropTypes.func.isRequired,
  closeTraceroute: PropTypes.bool.isRequired,
  setCloseTraceroute: PropTypes.func.isRequired,
  setIsSearch: PropTypes.func,
  carTravelTime: PropTypes.string,
  bikeTravelTime: PropTypes.string,
  metroTravelTime: PropTypes.string,
  walkTravelTime: PropTypes.string,
};

export default MapTraceroute;
