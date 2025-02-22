/**
 * @file MapResultItem.jsx
 * @description A React Native component that displays a building result in a search or route mapping feature.
 * It includes building details, accessibility icons, and actions for setting start and destination points.
 */

import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import WheelChairIcon from "../Icons/WheelChairIcon";
import BikeIcon from "../Icons/BikeIcon";
import InformationIcon from "../Icons/InformationIcon";
import NavigationIcon from "../Icons/NavigationIcon";
import DirectionsIcon from "../Icons/DirectionsIcon";
import SmallNavigationIcon from "../Icons/SmallNavigationIcon";
import ParkingIcon from "../Icons/ParkingIcon";

/**
 * MapResultItem component displays a search result or a location in the mapping interface.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {boolean} props.isRoute - Indicates whether the user is currently setting a route.
 * @param {Object} props.location - Current user location.
 * @param {Function} props.setIsSearch - Function to toggle search visibility.
 * @param {Function} props.setIsRoute - Function to enable routing mode.
 * @param {Function} props.setCloseTraceroute - Function to close traceroute.
 * @param {Function} props.setStartPosition - Function to set the starting position name.
 * @param {Function} props.setDestinationPosition - Function to set the destination position name.
 * @param {Object} props.building - The building data object.
 * @param {Object} props.start - The starting point coordinates.
 * @param {Function} props.setStart - Function to set the start location.
 * @param {Object} props.end - The destination point coordinates.
 * @param {Function} props.setEnd - Function to set the destination location.
 * @returns {JSX.Element} The rendered MapResultItem component.
 */
const MapResultItem = ({
  isRoute,
  location,
  setIsSearch,
  setIsRoute,
  setCloseTraceroute,
  setStartPosition,
  setDestinationPosition,
  building,
  start,
  setStart,
  end,
  setEnd,
}) => {
  const navigation = useNavigation();

  /**
   * Handles setting the start location for the route.
   * If the start is already set, it updates the destination instead.
   */
  const handleSetStart = () => {
    if (start != null && start !== location?.coords) {
      setIsRoute(true);
      setIsSearch(true);
      setDestinationPosition(building.name);
      setEnd(building.point);
      return;
    }
    setStart(building.point);
    setStartPosition(building.name);
  };

  /**
   * Handles retrieving directions from the current location to the selected building.
   */
  const handleGetDirections = () => {
    setCloseTraceroute(false);
    setEnd(building.point);
    setDestinationPosition(building.name);
    setStartPosition("Your Location");
  };

  /**
   * Navigates to the "Building Details" screen with the selected building's details.
   */
  const handlePress = () => {
    navigation.navigate("Building Details", building);
  };

  /**
   * Creates an array of icons representing building features.
   * Only includes icons for features that are enabled (e.g., wheelchair accessibility, bike parking).
   */
  const icons = [
    building.isHandicap === "true" && <WheelChairIcon key="wheelchair" />,
    building.isBike === "true" && <BikeIcon key="bike" />,
    building.isParking === "true" && <ParkingIcon key="parking" />,
    building.isInfo === "true" && <InformationIcon key="info" />,
  ].filter(Boolean); // Removes falsy values (i.e., features that are not enabled)

  return (
    <View
      style={styles.shadow}
      className="w-full mb-4 bg-secondary-bg p-4 rounded-lg flex flex-col justify-center items-center"
    >
      {/* Pressable wrapper for navigating to building details */}
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => pressed && { opacity: 0.7 }}
        className="w-full mb-4"
      >
        {/* Building name and associated icons */}
        <View className="flex flex-row items-center mb-4">
          <Text className="font-bold">{building.name}</Text>
          <View className="flex flex-row items-center gap-2 ml-4">{icons}</View>
        </View>

        {/* Address information */}
        <View className="mb-4 flex flex-row items-center">
          <SmallNavigationIcon />
          <Text className="color-slate-400 text-xs ml-2">
            {building.address}
          </Text>
        </View>
      </Pressable>

      {/* Action buttons for setting start and getting directions */}
      <View className="flex flex-row justify-around items-center">
        {/* Button to set start or destination */}
        <TouchableHighlight
          onPress={handleSetStart}
          style={styles.shadow}
          className="mr-4 rounded-xl p-4 bg-primary-red"
        >
          <View className="flex flex-row justify-around items-center">
            <Text className="color-white mr-4 font-bold">
              {start != null && start !== location?.coords
                ? "Set Destination"
                : "Set Start"}
            </Text>
            <NavigationIcon />
          </View>
        </TouchableHighlight>

        {/* Button to get directions */}
        <TouchableHighlight
          onPress={handleGetDirections}
          style={styles.shadow}
          className="rounded-xl p-4 bg-primary-red"
        >
          <View className="flex flex-row justify-around items-center">
            <Text className="color-white mr-4 font-bold">Get Directions</Text>
            <DirectionsIcon />
          </View>
        </TouchableHighlight>
      </View>
    </View>
  );
};

/**
 * Stylesheet for the component.
 */
const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    textAlign: "center",
  },
});

export default MapResultItem;
