
/**
 * @file BuildingDetails.jsx
 * @description Displays detailed information about a building including its departments,
 * services, and relevant icons. Provides tab navigation between departments and services,
 * and handles external link opening.
 */

import PropTypes from "prop-types"; // Import PropTypes
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  Platform,
  StatusBar,
  Image,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import MapPinIcon from "../../components/navigation/Icons/MapPinIcon";
import WheelChairIcon from "../../components/navigation/Icons/WheelChairIcon";
import BikeIcon from "../../components/navigation/Icons/BikeIcon";
import InformationIcon from "../../components/navigation/Icons/InformationIcon";
import CreditCardIcon from "../../components/navigation/Icons/CreditCardIcon";
import ParkingIcon from "../../components/navigation/Icons/ParkingIcon";

const BuildingDetails = ({ route }) => {
  const [activeTab, setActiveTab] = useState("Departments");
  const navigation = useNavigation();
  const building = route.params;

  const icons = [
    building?.isHandicap && <WheelChairIcon key="wheelchair" />,
    building?.isBike && <BikeIcon key="bike" />,
    building?.isParking && <ParkingIcon key="parking" />,
    building?.isCredit && <CreditCardIcon key="credit" />,
    building?.isInfo && <InformationIcon key="info" />,
  ].filter(Boolean);

  const handleLinkPress = (url) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const handleFloorplanPress = (floorplan) => {
    navigation.navigate("InDoorScreen", { building: building, selectedFloorplan: floorplan });
  };

  // Updated: Use item itself as key instead of the array index.
  const renderListItem = (item, link) => {
    if (!item) return null;

    if (activeTab === "Floorplans") {
      return (
        <Pressable
          key={`list-item-${item}`}
          onPress={() => handleFloorplanPress(link)}
          className="py-4"
        >
          <Text className="text-blue-600">{item}</Text>
        </Pressable>
      );
    }

    return (
      <Pressable
        key={`list-item-${item}`}
        onPress={() => handleLinkPress(link)}
        className="flex flex-row items-center py-4 bg-white"
      >
        <Text className="flex-1 text-base text-gray-800">{item}</Text>
        {link && <Text className="text-gray-400 text-lg ml-2">›</Text>}
      </Pressable>
    );
  };

  const renderContent = () => {

    let items, links;
    switch (activeTab) {
      case "Departments":
        items = building.Departments;
        links = building.DepartmentLink;
        break;
      case "Services":
        items = building.Services;
        links = building.ServiceLink;
        break;
      case "Floorplans":
        items = building.floorPlans;
        links = building.floorPlans;
        break;
      default:
        items = [];
        links = [];
    }

    if (!items || items.length === 0) {
      return (
        <Text className="p-4 text-gray-500">
          No {activeTab.toLowerCase()} available
        </Text>
      );
    }

    const itemsArray = Array.isArray(items) ? items : [items];
    const linksArray = Array.isArray(links) ? links : [links];
    if (activeTab == 'Floorplans') {
      return (
        <View className="px-4">
          <Pressable
            onPress={() => handleFloorplanPress(links)}
            className="py-4"
          >
            <Text className="text-blue-600">Indoor Map</Text>
          </Pressable>
            
        </View>
      )

    }
    return (
      <View className="px-4">
        {itemsArray.map((item, idx, array) => (
          <View key={`list-wrapper-${item}`}>
            {renderListItem(item, linksArray[idx])}
            {idx < array.length - 1 && (
              <View className="border-b border-gray-100" />
            )}
          </View>
        ))}
      </View>
    );
  };

  const headerPadding = Platform.OS === "ios" ? "pt-12" : "pt-8";

  return (
    <View className="flex-1 bg-gray-100">
      <StatusBar barStyle="dark-content" />

      <View className="bg-gray-100">
        <View className={`px-4 ${headerPadding} mb-4`}>
          <Pressable
            onPress={() => navigation.goBack()}
            className="mb-6 py-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text className="text-3xl font-light">←</Text>
          </Pressable>

          <View className="mb-4">
            <Text className="text-2xl font-bold" numberOfLines={2}>
              {building.longName}
            </Text>
          </View>

          <View className="flex flex-row items-center">
            <MapPinIcon />
            <Text className="ml-2 text-gray-400">{building.address}</Text>
            <Text className="mx-2 text-gray-400">|</Text>
            <View className="flex flex-row items-center gap-2 ml-4">
              {icons}
            </View>
          </View>
        </View>
      </View>

      <View className="flex-1">
        <View className="mx-4 bg-white rounded-xl overflow-hidden">
          <View className="flex flex-row border-b border-gray-200">
            {['Departments', 'Services', 'Floorplans'].map((tab) => (
              
              (tab !== 'Floorplans' || (building.floorPlans && building.floorPlans.length > 0)) && (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  className={`flex-1 py-4 ${activeTab === tab ? "border-b-2 border-red-800" : ""}`}
                >
                  <Text className={`text-center text-base ${activeTab === tab ? "text-red-800 font-semibold" : "text-gray-500"}`}>
                    {tab}
                  </Text>
                </Pressable>
              )
            ))}
          </View>

          <ScrollView>{renderContent()}</ScrollView>
        </View>
      </View>

    </View>
  );
};

// Prop types validation
BuildingDetails.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      longName: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      isHandicap: PropTypes.bool,
      isBike: PropTypes.bool,
      isParking: PropTypes.bool,
      isCredit: PropTypes.bool,
      isInfo: PropTypes.bool,
      Departments: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
      ]),
      Services: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
      ]),
      DepartmentLink: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
      ]),
      ServiceLink: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
      ]),
      floorPlans: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
  }).isRequired,
};

export default BuildingDetails;
