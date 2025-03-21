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


const hallFloorGraphs= {
  // HALL BUILDING NODES
  1: {
    Hall_Entrance: { x: 110, y: 360, neighbors: ['Main_walway', 'Hall_1st_Basement_Escalator'] },
    Main_walway: { x: 110, y: 292, neighbors: ['Hall_Entrance', 'Hallway'] },
    Hallway: { x: 265, y: 292, neighbors: ['Main_walway', 'Hall_1st_Elevator'] },
    Hall_1st_Elevator: { x: 265, y: 302, neighbors: ['Hallway'] },
    Hall_1st_Basement_Escalator: { x: 275, y: 360, neighbors: ['Hall_Entrance'] },
  },
  2: {},
  8: {
    // hallway intersections
    hallwayLowerLeftCorner: { x: 70, y: 289, neighbors: ['hallwayMiddleLower', 'hallwayMiddleLeft','h849', 'h847', 'h845', 'h843', 'h842', 'h841', 'h857', 'h855', 'h854', 'h853', 'h852', 'h851'] },
    hallwayLowerRightCorner: { x: 305, y: 289, neighbors: ['hallwayMiddleLower', 'hallwayHigherRightCorner', 'h837', 'h835', 'h833', 'h832', 'h831', 'h829', 'h827', 'h825', 'h823', 'h822', 'h821', 'h820'] },
    hallwayHigherRightCorner: { x: 305, y: 78, neighbors: ['hallwayMiddleUpper', 'hallwayLowerRightCorner', 'h827', 'h825', 'h823', 'h822', 'h821', 'h820', 'h819', 'h817', 'h815', 'h813', 'h811', 'mensBathroom'] },
    hallwayHigherLeftCorner: { x: 65, y: 78, neighbors: ['hallwayHigherRightCorner', 'hallwayMiddleLeft', 'h807', 'h805', 'h803', 'h801', 'womensBathroom', 'h867', 'h865', 'h863', 'h861'] },
    hallwayMiddleLower: { x: 200, y: 289, neighbors: ['hallwayMiddleMiddle', 'hallwayLowerLeftCorner', 'hallwayLowerRightCorner', 'h845', 'h843', 'h842', 'h841', 'h837', 'h835', 'h832'] },
    hallwayMiddleMiddle: { x: 200, y: 145, neighbors: ['hallwayMiddleUpper', 'hallwayMiddleLower', 'hallwayMiddleLeft', 'h806', 'h862', 'h860'] },
    hallwayMiddleUpper: { x: 200, y: 78, neighbors: ['hallwayHigherRightCorner', 'hallwayHigherLeftCorner', 'hallwayMiddleMiddle','h806', 'h862', 'h860', 'h813', 'h811', 'h807', 'h806', 'h805', 'h803', 'h801', 'womensBathroom', 'mensBathroom'] },
    hallwayMiddleLeft:{ x: 65, y: 145, neighbors: ['hallwayMiddleMiddle', 'hallwayLowerLeftCorner', 'hallwayHigherLeftCorner', 'h863', 'h862', 'h861', 'h860', 'h859', 'h857', 'h855', 'h854', 'h853', 'h852'] },

    // lower section
    h849: { x: 30, y: 325, neighbors: ['hallwayLowerLeftCorner'] },
    h847: { x: 70, y: 325, neighbors: ['hallwayLowerLeftCorner'] },
    h845: { x: 105, y: 325, neighbors: ['hallwayLowerLeftCorner', 'hallwayMiddleLower'] },
    h843: { x: 135, y: 325, neighbors: ['hallwayLowerLeftCorner', 'hallwayMiddleLower'] },
    h842: { x: 145, y: 235, neighbors: ['hallwayLowerLeftCorner', 'hallwayMiddleLower'] },
    h841: { x: 165, y: 325, neighbors: ['hallwayLowerLeftCorner', 'hallwayMiddleLower'] },
    h837: { x: 235, y: 325, neighbors: ['hallwayLowerRightCorner', 'hallwayMiddleLower'] },
    h835: { x: 265, y: 325, neighbors: ['hallwayLowerRightCorner', 'hallwayMiddleLower'] },
    h833: { x: 300, y: 325, neighbors: ['hallwayLowerRightCorner'] },
    h832: { x: 232, y: 245, neighbors: ['hallwayLowerRightCorner','hallwayMiddleLower'] },
    h831: { x: 345, y: 325, neighbors: ['hallwayLowerRightCorner'] },

    // Right section
    h829: { x: 345, y: 285, neighbors: ['hallwayLowerRightCorner'] },
    h827: { x: 345, y: 220, neighbors: ['hallwayLowerRightCorner', 'hallwayHigherRightCorner'] },
    h825: { x: 345, y: 190, neighbors: ['hallwayLowerRightCorner', 'hallwayHigherRightCorner'] },
    h823: { x: 345, y: 155, neighbors: ['hallwayLowerRightCorner', 'hallwayHigherRightCorner'] },
    h822: { x: 285, y: 222, neighbors: ['hallwayLowerRightCorner', 'hallwayHigherRightCorner'] },
    h821: { x: 345, y: 120, neighbors: ['hallwayLowerRightCorner', 'hallwayHigherRightCorner'] },
    h820: { x: 265, y: 168, neighbors: ['hallwayLowerRightCorner', 'hallwayHigherRightCorner'] },
    h819: { x: 345, y: 85, neighbors: ['hallwayHigherRightCorner'] },
    h817: { x: 345, y: 50, neighbors: ['hallwayHigherRightCorner'] },

    // Top section
    h815: { x: 305, y: 40, neighbors: ['hallwayHigherRightCorner'] },
    h813: { x: 270, y: 40, neighbors: ['hallwayHigherRightCorner', 'hallwayMiddleUpper'] },
    h811: { x: 230, y: 40, neighbors: ['hallwayHigherRightCorner', 'hallwayMiddleUpper'] },
    h807: { x: 173, y: 40, neighbors: ['hallwayHigherLeftCorner', 'hallwayMiddleUpper'] },
    h806: { x: 176, y: 120, neighbors: ['hallwayMiddleMiddle', 'hallwayMiddleUpper'] },
    h805: { x: 143, y: 40, neighbors: ['hallwayHigherLeftCorner', 'hallwayMiddleUpper'] },
    h803: { x: 110, y: 40, neighbors: ['hallwayHigherLeftCorner', 'hallwayMiddleUpper'] },
    h801: { x: 75, y: 40, neighbors: ['hallwayHigherLeftCorner', 'hallwayMiddleUpper'] },
    womensBathroom: { x: 143, y: 95, neighbors: ['hallwayHigherLeftCorner', 'hallwayMiddleUpper'] },
    mensBathroom: { x: 235, y: 95, neighbors: ['hallwayHigherRightCorner', 'hallwayMiddleUpper'] },

    // Right section
    h867: { x: 35, y: 40, neighbors: ['hallwayHigherLeftCorner'] },
    h865: { x: 27, y: 64, neighbors: ['hallwayHigherLeftCorner'] },
    h863: { x: 27, y: 90, neighbors: ['hallwayHigherLeftCorner', 'hallwayMiddleLeft'] },
    h862: { x: 138, y: 165, neighbors: ['hallwayMiddleMiddle', 'hallwayMiddleLeft'] },
    h861: { x: 27, y: 120, neighbors: ['hallwayHigherLeftCorner', 'hallwayMiddleLeft'] },
    h860: { x: 98, y: 180, neighbors: ['hallwayMiddleMiddle', 'hallwayMiddleLeft'] },
    h859: { x: 27, y: 150, neighbors: ['hallwayMiddleLeft'] },
    h857: { x: 27, y: 180, neighbors: ['hallwayMiddleLeft', 'hallwayLowerLeftCorner'] },
    h855: { x: 27, y: 215, neighbors: ['hallwayMiddleLeft', 'hallwayLowerLeftCorner'] },
    h854: { x: 98, y: 215, neighbors: ['hallwayLowerLeftCorner', 'hallwayMiddleLeft'] },
    h853: { x: 27, y: 248, neighbors: ['hallwayMiddleLeft', 'hallwayLowerLeftCorner'] },
    h852: { x: 90, y: 235, neighbors: ['hallwayLowerLeftCorner', 'hallwayMiddleLeft'] },
    h851: { x: 27, y: 285, neighbors: ['hallwayLowerLeftCorner'] },
  },
  9: {
    // Hallway Nodes
    hallwayLowerLeftCorner: { x: 73, y: 289, neighbors: ['hallwayMiddleLower', 'hallwayMiddleLeftCorner'] },
    hallwayMiddleLeftCorner: { x: 73, y: 140, neighbors: ['hallwayLowerLeftCorner','hallwayHigherLeftCorner'] },
    hallwayHigherLeftCorner: { x: 73, y: 66, neighbors: ['hallwayMiddleLeftCorner','h929'] },
    hallwayMiddleLower: { x: 178, y: 289, neighbors: ['hallwayLowerLeftCorner', 'hallwayLowerRightCorner','womensBathroom'] },
    hallwayLowerRightCorner: { x: 305, y: 289, neighbors: ['hallwayMiddleLower'] },
    h929: { x: 53, y: 66, neighbors: ['hallwayHigherLeftCorner'] },
    womensBathroom: { x: 228, y: 275, neighbors: ['hallwayMiddleLower'] },
    Elevator9th: { x: 241, y: 235, neighbors: ['h962'] },
    h962: { x: 235, y: 205, neighbors: ['Elevator9th'] },
  },
};

// JOHN MOLSON BUILDING NODES
const jmFloorGraphs= {
  1: {},
  'S2': {
    Tunnel: { x: 53, y: 176, neighbors: ['hallway'] },
    hallway: { x: 168, y: 166, neighbors: ['Tunnel','s2101'] },
    s2101: { x: 168, y: 60, neighbors: ['hallway'] },
  },
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

      <Modal testID="floorplanModal" visible={modalVisible} transparent={true} animationType="fade">
        <Pressable
         testID="modal-background"
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center" }}
          onPress={(e) => {
            console.log("Image pressed at:", e.nativeEvent.locationX, e.nativeEvent.locationY);
            setModalVisible(false)}}
        >
          
          {selectedFloorplan && (
            <Image source={floorplanImages[selectedFloorplan]} style={{ width: "90%", height: "90%", resizeMode: "contain" }} allowUniversalAccessFromFileURLs={true}  testID="modal-image"/>
          )}
        </Pressable>
      </Modal>
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
