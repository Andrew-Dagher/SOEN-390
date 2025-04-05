import React from "react";
import PropTypes from "prop-types";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import InformationIcon from "./Icons/InformationIcon";
import MapPinIcon from "./Icons/MapPinIcon";
import WheelChairIcon from "./Icons/WheelChairIcon";
import BikeIcon from "./Icons/BikeIcon";
import CreditCardIcon from "./Icons/CreditCardIcon";
import ParkingIcon from "./Icons/ParkingIcon";

/**
 * A component displaying building details including its icons and address.
 * This component is defined outside the parent MapCard component.
 */
const CardContent = ({ buildingData }) => {
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
      <View style={styles.row}>
        <Text style={styles.buildingName}>{buildingData.name}</Text>
        <View style={styles.iconRow}>
          {iconComponents
            .filter((icon) => icon.show)
            .map((icon) => (
              <View key={icon.key}>{icon.component}</View>
            ))}
        </View>
      </View>
      <View style={styles.row}>
        <MapPinIcon />
        <Text style={styles.addressText}>{buildingData.address}</Text>
      </View>
    </>
  );
};

CardContent.propTypes = {
  buildingData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    isHandicap: PropTypes.bool,
    isBike: PropTypes.bool,
    isParking: PropTypes.bool,
    isInfo: PropTypes.bool,
    isCredit: PropTypes.bool,
  }).isRequired,
};

/**
 * A card component displaying building information.
 * It supports multiple press actions through separate methods.
 */
const MapCard = ({ building, isCallout = false }) => {
  const navigation = useNavigation();
  const buildingData = building; // building is required, so no fallback is necessary

  // Method for non-callout press action
  const handlePressDefault = () => {
    navigation.navigate("Building Details", buildingData);
  };

  // Method for callout press action (with a short delay)
  const handlePressCallout = () => {
    setTimeout(() => {
      navigation.navigate("Building Details", buildingData);
    }, 100);
  };

  // Select the appropriate method based on isCallout
  const handlePress = isCallout ? handlePressCallout : handlePressDefault;

  return (
    <Pressable
      testID="mapcard-view"
      style={({ pressed }) => [pressed && { opacity: 0.7 }]}
      onPress={handlePress}
      delayPressIn={isCallout ? 100 : 0}
    >
    <View style={styles.shadow}>
      <CardContent buildingData={buildingData} />
    </View>
    </Pressable>
  );
};

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
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  buildingName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  addressText: {
    color: "#718096",
    marginLeft: 4,
  },
});

export default MapCard;
