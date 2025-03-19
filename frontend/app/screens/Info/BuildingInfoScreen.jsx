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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import MapPinIcon from "../../components/navigation/Icons/MapPinIcon";
import WheelChairIcon from "../../components/navigation/Icons/WheelChairIcon";
import BikeIcon from "../../components/navigation/Icons/BikeIcon";
import InformationIcon from "../../components/navigation/Icons/InformationIcon";
import CreditCardIcon from "../../components/navigation/Icons/CreditCardIcon";
import ParkingIcon from "../../components/navigation/Icons/ParkingIcon";

/**
 * BuildingDetails component displays building information with tabs for departments and services.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.route - The route object provided by React Navigation.
 * @param {Object} props.route.params - The building details passed through navigation parameters.
 * @returns {JSX.Element} The rendered BuildingDetails component.
 */
const BuildingDetails = ({ route }) => {
  // State for managing active tab ("Departments" or "Services")
  const [activeTab, setActiveTab] = useState("Departments");

  // Navigation hook for managing navigation actions.
  const navigation = useNavigation();

  // Retrieve building details from route parameters.
  const building = route.params;

  const icons = [
    building?.isHandicap && <WheelChairIcon key="wheelchair" />,
    building?.isBike && <BikeIcon key="bike" />,
    building?.isParking && <ParkingIcon key="parking" />,
    building?.isCredit && <CreditCardIcon key="credit" />,
    building?.isInfo && <InformationIcon key="info" />,
  ].filter(Boolean);

  /**
   * Opens a provided URL using the Linking API.
   *
   * @param {string} url - The URL to open.
   */
  const handleLinkPress = (url) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  /**
   * Renders a list item with an optional link indicator.
   *
   * @param {string} item - The text content for the list item.
   * @param {string} link - The URL associated with the item.
   * @param {number} index - The index of the item in the list.
   * @returns {JSX.Element|null} The rendered list item or null if the item is not defined.
   */
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

  /**
   * Renders the content for the active tab (Departments or Services).
   *
   * @returns {JSX.Element} The rendered content view.
   */
  const renderContent = () => {
    // Choose items and links based on the active tab.
    const items =
      activeTab === "Departments" ? building.Departments : building.Services;
    const links =
      activeTab === "Departments"
        ? building.DepartmentLink
        : building.ServiceLink;

    // Handle cases when there are no items.
    if (!items || items.length === 0) {
      return (
        <Text className="p-4 text-gray-500">
          No {activeTab.toLowerCase()} available
        </Text>
      );
    }

    /**
     * Creates an array of icons representing building features.
     * Only includes icons for features that are enabled (e.g., wheelchair accessibility, bike parking).
     */

    // Ensure items and links are arrays for consistent rendering.
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

  // Determine safe area padding for header based on the platform.
  const headerPadding = Platform.OS === "ios" ? "pt-12" : "pt-8";

  return (
    <View className="flex-1 bg-gray-100">
      {/* Set the status bar style */}
      <StatusBar barStyle="dark-content" />

      {/* Fixed Header */}
      <View className="bg-gray-100">
        <View className={`px-4 ${headerPadding} mb-4`}>
          {/* Back button with expanded touch target */}
          <Pressable
            onPress={() => navigation.goBack()}
            className="mb-6 py-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text className="text-3xl font-light">←</Text>
          </Pressable>

          {/* Display building long name */}
          <View className="mb-4">
            <Text className="text-2xl font-bold" numberOfLines={2}>
              {building.longName}
            </Text>
          </View>

          {/* Display building address and amenity icons */}
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

      {/* Scrollable Content Area */}
      <View className="flex-1">
        <View className="mx-4 bg-white rounded-xl overflow-hidden">
          {/* Tab navigation for Departments and Services */}
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

          {/* Render the list content based on the active tab */}
          <ScrollView>{renderContent()}</ScrollView>
        </View>
      </View>

      {/* Fixed Footer (currently empty but reserved for future content) */}
      <View className="p-4 bg-white border-t border-gray-200">
        <View className="flex flex-row gap-4"></View>
      </View>
    </View>
  );
};
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
    }).isRequired,
  }).isRequired,
};

export default BuildingDetails;
