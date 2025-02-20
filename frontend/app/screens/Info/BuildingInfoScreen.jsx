import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  Platform,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import MapPinIcon from "../../components/navigation/Icons/MapPinIcon";
import WheelChairIcon from "../../components/navigation/Icons/WheelChairIcon";
import BikeIcon from "../../components/navigation/Icons/BikeIcon";
import MetroIcon from "../../components/navigation/Icons/MetroIcon";
import InformationIcon from "../../components/navigation/Icons/InformationIcon";
import CreditCardIcon from "../../components/navigation/Icons/CreditCardIcon";

const BuildingDetails = ({ route }) => {
  const [activeTab, setActiveTab] = useState("Departments");
  const navigation = useNavigation();
  const building = route.params;

  const handleLinkPress = (url) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const renderListItem = (item, link, index) => {
    if (!item) return null;
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
    const items =
      activeTab === "Departments" ? building.Departments : building.Services;
    const links =
      activeTab === "Departments"
        ? building.DepartmentLink
        : building.ServiceLink;

    // Handle empty or undefined cases
    if (!items || items.length === 0) {
      return (
        <Text className="p-4 text-gray-500">
          No {activeTab.toLowerCase()} available
        </Text>
      );
    }

    // Ensure items and links are always arrays
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

  // Calculate safe area padding for the header
  const headerPadding = Platform.OS === "ios" ? "pt-12" : "pt-8";

  return (
    <View className="flex-1 bg-gray-100">
      <StatusBar barStyle="dark-content" />

      {/* Fixed Header */}
      <View className="bg-gray-100">
        <View className={`px-4 ${headerPadding} mb-4`}>
          {/* Back button with better touch target */}
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
            {building.isHandicap === "true" && <WheelChairIcon />}
            {building.isBike === "true" && <BikeIcon />}
            {building.isMetro === "true" && <MetroIcon />}
            {building.isInfo === "true" && <InformationIcon />}
            {building.isCredit === "true" && <CreditCardIcon />}
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <View className="flex-1">
        <View className="mx-4 bg-white rounded-xl overflow-hidden">
          <View className="flex flex-row border-b border-gray-200">
            <Pressable
              onPress={() => setActiveTab("Departments")}
              className={`flex-1 py-4 ${
                activeTab === "Departments" ? "border-b-2 border-red-800" : ""
              }`}
            >
              <Text
                className={`text-center text-base ${
                  activeTab === "Departments"
                    ? "text-red-800 font-semibold"
                    : "text-gray-500"
                }`}
              >
                Departments
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab("Services")}
              className={`flex-1 py-4 ${
                activeTab === "Services" ? "border-b-2 border-red-800" : ""
              }`}
            >
              <Text
                className={`text-center text-base ${
                  activeTab === "Services"
                    ? "text-red-800 font-semibold"
                    : "text-gray-500"
                }`}
              >
                Services
              </Text>
            </Pressable>
          </View>

          {/* Scrollable List */}
          <ScrollView>{renderContent()}</ScrollView>
        </View>
      </View>

      {/* Fixed Footer */}
      <View className="p-4 bg-white border-t border-gray-200">
        <View className="flex flex-row gap-4"></View>
      </View>
    </View>
  );
};

export default BuildingDetails;
