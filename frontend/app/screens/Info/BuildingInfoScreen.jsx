/**
 * @file BuildingDetails.jsx
 * @description Displays detailed information about a building including its departments,
 * services, and relevant icons. Provides tab navigation between departments and services,
 * and handles external link opening.
 */

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

const floorplanImages = {
  "Hall 1": require("../../../assets/floor_plans/Hall-1.png"),
  "Hall 2": require("../../../assets/floor_plans/Hall-2.png"),
  "Hall 8": require("../../../assets/floor_plans/Hall-8.png"),
  "Hall 9": require("../../../assets/floor_plans/Hall-9.png"),
  "MB 1": require("../../../assets/floor_plans/Hall-1.png"),
  "MB S2": require("../../../assets/floor_plans/MB-S2.png"),
  "CC1": require("../../../assets/floor_plans/CC1.png"),
  "VE 1": require("../../../assets/floor_plans/VE-1.png"),
  "VE 2": require("../../../assets/floor_plans/VE-2.png"),
  "VL 1": require("../../../assets/floor_plans/VL-1.png"),
  "VL 2": require("../../../assets/floor_plans/VL-2.png"),
};


const BuildingDetails = ({ route }) => {
  const [activeTab, setActiveTab] = useState("Departments");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFloorplan, setSelectedFloorplan] = useState(null);
  
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

  const handleFloorplanPress = (imagePath) => {
    setSelectedFloorplan(imagePath);
    setModalVisible(true);
  };

  const renderListItem = (item, link, index) => {
    if (!item) return null;

    // Handle Floor Plans separately
    if (activeTab === "Floorplans") {
      return (
        <Pressable
          key={index}
          onPress={() => handleFloorplanPress(link)}
          className="py-4"
        >
          <Text className="text-blue-600">{item}</Text>
        </Pressable>
      );
    }

    return (
      <Pressable
        key={index}
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

    return (
      <View className="px-4">
        {itemsArray.map((item, index, array) => (
          <View key={index}>
            {renderListItem(item, linksArray[index], index)}
            {index < array.length - 1 && (
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
            <Pressable
              onPress={() => setActiveTab("Departments")}
              className={`flex-1 py-4 ${activeTab === "Departments" ? "border-b-2 border-red-800" : ""}`}
            >
              <Text className={`text-center text-base ${activeTab === "Departments" ? "text-red-800 font-semibold" : "text-gray-500"}`}>
                Departments
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab("Services")}
              className={`flex-1 py-4 ${activeTab === "Services" ? "border-b-2 border-red-800" : ""}`}
            >
              <Text className={`text-center text-base ${activeTab === "Services" ? "text-red-800 font-semibold" : "text-gray-500"}`}>
                Services
              </Text>
            </Pressable>
            {building.floorPlans && building.floorPlans.length > 0 && (
              <Pressable
                onPress={() => setActiveTab("Floorplans")}
                className={`flex-1 py-4 ${activeTab === "Floorplans" ? "border-b-2 border-red-800" : ""}`}
              >
                <Text className={`text-center text-base ${activeTab === "Floorplans" ? "text-red-800 font-semibold" : "text-gray-500"}`}>
                  Floorplans
                </Text>
              </Pressable>
            )}
          </View>

          <ScrollView>{renderContent()}</ScrollView>
        </View>
      </View>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center" }}
          onPress={() => setModalVisible(false)}
        >
          
          {selectedFloorplan && (
            <Image source={floorplanImages[selectedFloorplan]} style={{ width: "90%", height: "90%", resizeMode: "contain" }} allowUniversalAccessFromFileURLs={true}/>
          )}
        </Pressable>
      </Modal>
    </View>
  );
};

export default BuildingDetails;
