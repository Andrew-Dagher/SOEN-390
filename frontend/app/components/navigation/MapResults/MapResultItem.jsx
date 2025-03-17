import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  TouchableHighlight,
  PanResponder,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import WheelChairIcon from "../Icons/WheelChairIcon";
import BikeIcon from "../Icons/BikeIcon";
import MetroIcon from "../Icons/MetroIcon";
import InformationIcon from "../Icons/InformationIcon";
import NavigationIcon from "../Icons/NavigationIcon";
import DirectionsIcon from "../Icons/DirectionsIcon";
import { useEffect, useRef } from "react";
import SmallNavigationIcon from "../Icons/SmallNavigationIcon";
import { useAppSettings } from "../../../AppSettingsContext";
import getThemeColors from "../../../ColorBindTheme";
import ParkingIcon from "../Icons/ParkingIcon";
import CreditCardIcon from "../Icons/CreditCardIcon";

const MapResultItem = ({
  fetchTravelTime,
  setCarTravelTime,
  setBikeTravelTime,
  setMetroTravelTime,
  setWalkTravelTime,
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
  const { textSize } = useAppSettings();
  const theme = getThemeColors();

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
  
      // Reset travel times
      setCarTravelTime(null);
      setBikeTravelTime(null);
      setMetroTravelTime(null);
      setWalkTravelTime(null);
  
      // Fetch times from start point to selected building
      const fetchAllTravelTimes = async () => {
        await Promise.all([
          fetchTravelTime(start, building.point, 'DRIVING'),
          fetchTravelTime(start, building.point, 'BICYCLING'),
          fetchTravelTime(start, building.point, 'TRANSIT'),
          fetchTravelTime(start, building.point, 'WALKING'),
        ]);
      };
      fetchAllTravelTimes();
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
    building?.isHandicap && <WheelChairIcon key="wheelchair" />,
    building?.isBike && <BikeIcon key="bike" />,
    building?.isParking && <ParkingIcon key="parking" />,
    building?.isCredit && <CreditCardIcon key="credit" />,
    building?.isInfo && <InformationIcon key="info" />,
  ].filter(Boolean);

  return (
    <View
      style={styles.shadow}
      className="w-full mb-4 bg-primary-bg p-4 rounded-lg flex flex-col justify-center items-center"
    >
      {/* Pressable wrapper for navigating to building details */}
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => pressed && { opacity: 0.7 }}
        className="w-full mb-4"
      >
        {/* Building name and associated icons */}
        <View className="flex flex-row items-center mb-4">
          <Text className="font-bold" style={[{ fontSize: textSize }]}>{building.name}</Text>
          <View className="flex flex-row items-center gap-2 ml-4">{icons}</View>
        </View>
        <View className="mb-4 flex flex-row">
          <SmallNavigationIcon />
          <Text className="color-slate-400 text-xs ml-2">{building.address}</Text>
        </View>
        <View className="flex flex-row justify-around items-center">
          <TouchableHighlight
            onPress={handleSetStart}
            style={[
              styles.shadow,
              { backgroundColor: theme.backgroundColor },
              { fontSize: textSize },
            ]}
            className="mr-4 rounded-xl p-4 bg-primary-red"
          >
            <View className="flex flex-row justify-around items-center">
              {start != null && start != location?.coords ? (
                <Text
                  style={[{ fontSize: textSize }]}
                  className="color-white mr-4 font-bold"
                >
                  Set Destination
                </Text>
              ) : (
                <Text
                  style={[{ fontSize: textSize }]}
                  className="color-white mr-4 font-bold"
                >
                  Set Start
                </Text>
              )}
              <NavigationIcon />
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            onPress={handleGetDirections}
            style={[styles.shadow, { backgroundColor: theme.backgroundColor }]}
            className="rounded-xl p-4 bg-primary-red"
          >
            <View className="flex flex-row justify-around items-center">
              <Text
                style={[{ fontSize: textSize }]}
                className="color-white mr-4 font-bold"
              >
                Get Directions
              </Text>
              <DirectionsIcon />
            </View>
          </TouchableHighlight>
        </View>
      </Pressable>
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
