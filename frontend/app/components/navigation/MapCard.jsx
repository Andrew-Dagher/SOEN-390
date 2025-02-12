import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import InformationIcon from "./Icons/InformationIcon";
import MapPinIcon from "./Icons/MapPinIcon";
import WheelChairIcon from "./Icons/WheelChairIcon";
import BikeIcon from "./Icons/BikeIcon";
import CreditCardIcon from "./Icons/CreditCardIcon";
import ParkingIcon from "./Icons/ParkingIcon";

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

  const handlePress = () => {
    // Add a small delay for callouts to prevent immediate dismissal
    if (isCallout) {
      setTimeout(() => {
        navigation.navigate("Building Details", buildingData);
      }, 100);
    } else {
      navigation.navigate("Building Details", buildingData);
    }
  };

  const CardContent = () => {
    // Create an array of icon objects with keys
    const iconComponents = [
      {
        key: "handicap",
        show: buildingData.isHandicap === "true",
        component: <WheelChairIcon />,
      },
      {
        key: "bike",
        show: buildingData.isBike === "true",
        component: <BikeIcon />,
      },
      {
        key: "parking",
        show: buildingData.isParking === "true",
        component: <ParkingIcon />,
      },
      {
        key: "info",
        show: buildingData.isInfo === "true",
        component: <InformationIcon />,
      },
      {
        key: "credit",
        show: buildingData.isCredit === "true",
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

const styles = StyleSheet.create({
  shadow: {
    width: 250,
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

export default MapCard;
