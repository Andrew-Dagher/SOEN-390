import React from "react";
import PropTypes from "prop-types"; // Import PropTypes
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import InformationIcon from "./Icons/InformationIcon";
import MapPinIcon from "./Icons/MapPinIcon";
import WheelChairIcon from "./Icons/WheelChairIcon";
import BikeIcon from "./Icons/BikeIcon";
import CreditCardIcon from "./Icons/CreditCardIcon";
import ParkingIcon from "./Icons/ParkingIcon";

/**
 * A card component displaying building information, including accessibility, parking, and other features.
 * @param {Object} props - The component props.
 * @param {Object} props.building - The building data.
 * @param {boolean} [props.isCallout=false] - Determines if the card is used as a callout.
 * @returns {JSX.Element} - A Pressable component displaying building details.
 */
const MapCard = ({ building, isCallout = false }) => {
  const navigation = useNavigation();

  const buildingData = building || {
    name,
    address,
    isHandicap,
    isBike,
    isParking,
    isInfo,
    isCredit,
  };

  /**
   * Handles navigation to the "Building Details" screen.
   */
  const handlePress = () => {
    if (isCallout) {
      setTimeout(() => {
        navigation.navigate("Building Details", buildingData);
      }, 100);
    } else {
      navigation.navigate("Building Details", buildingData);
    }
  };

  /**
   * Renders the icons associated with the building features.
   * @returns {JSX.Element} - The set of icons for the building features.
   */
  const CardContent = () => {
    const iconComponents = [
      {
        key: "handicap",
        show: buildingData.isHandicap === true,
        component: <WheelChairIcon />,
      },
      {
        key: "bike",
        show: buildingData.isBike === true,
        component: <BikeIcon />,
      },
      {
        key: "parking",
        show: buildingData.isParking === true,
        component: <ParkingIcon />,
      },
      {
        key: "info",
        show: buildingData.isInfo === true,
        component: <InformationIcon />,
      },
      {
        key: "credit",
        show: buildingData.isCredit === true,
        component: <CreditCardIcon />,
      },
    ];

    return (
      <>
        <View className="flex flex-row items-center">
          <Text className="font-bold">{buildingData.name}</Text>
          <View className="flex flex-row items-center gap-2 ml-4">
            {iconComponents
              .filter((icon) => icon.show)
              .map((icon) => (
                <View key={icon.key}>{icon.component}</View>
              ))}
          </View>
        </View>
        <View className="mt-2 flex flex-row items-center">
          <MapPinIcon />
          <Text className="color-slate-400 ml-2">{buildingData.address}</Text>
        </View>
      </>
    );
  };

  return (
    <Pressable
      testID="mapcard-view"
      style={({ pressed }) => [styles.shadow, pressed && { opacity: 0.7 }]}
      className="flex bg-white p-6 rounded-lg"
      onPress={handlePress}
      delayPressIn={isCallout ? 100 : 0}
    >
      <CardContent />
    </Pressable>
  );
};

// Define PropTypes for MapCard component
MapCard.propTypes = {
  building: PropTypes.shape({
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    isHandicap: PropTypes.bool,
    isBike: PropTypes.bool,
    isParking: PropTypes.bool,
    isInfo: PropTypes.bool,
    isCredit: PropTypes.bool,
  }).isRequired,
  isCallout: PropTypes.bool,
};

const styles = StyleSheet.create({
  shadow: {
    width: 250,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    textAlign: "center",
  },
});

export default MapCard;
