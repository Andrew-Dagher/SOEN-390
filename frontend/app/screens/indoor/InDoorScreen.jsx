/**
 * @file IndoorMap.jsx
 * @description Displays a map placeholder along with a back button and fields for setting start and destination.
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StatusBar,
  Platform,
  StyleSheet,
  TouchableHighlight
} from "react-native";

import Map from '../../components/navigation/Map';
import { useNavigation, useRoute } from "@react-navigation/native";
import { WebView } from 'react-native-webview';
import getThemeColors from "../../ColorBindTheme";
import { useAppSettings } from "../../AppSettingsContext";
import { pickerList, areRoomsOnSameFloor, areRoomsOnSameBuilding, getFloorIdByRoomId, getEntranceByRoomId, getUrlFromRoomId } from "./inDoorUtil";
import DropDownPicker from 'react-native-dropdown-picker';

const InDoorScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = getThemeColors();
  const { textSize } = useAppSettings();

  // Retrieve the selected floorplan (or map identifier) from route params
  const { building, step1 } = route.params || { selectedFloorplan: "Unknown" };

  const headerPadding = Platform.OS === "ios" ? 48 : 32;
  const [floorPlanURL, setFloorPlanURL] = useState(building.floorPlans);
  const [nextFloorPlanURL, setNextFloorPlanURL] = useState(building.floorPlans);
  const [isSameFloor, setIsSameFloor] = useState(true);
  const [isNextFloor, setIsNextFloor] = useState(false);
  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [value, setValue] = useState(step1?.value || null);
  const [value1, setValue1] = useState(step1?.value1 || null);
  const [items, setItems] = useState(pickerList);
  const [items1, setItems1] = useState(pickerList);
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  
  // currentStep: 0 = Search, 1 = Departure Indoor, 2 = Outdoor Directions, 3 = Destination Indoor
  const [currentStep, setCurrentStep] = useState(0);

  const handleNextFloor = () => {
    if (isNextFloor) setIsNextFloor(false);
    else setIsNextFloor(true);
  };

  const handleToCampus = () => {
    if (value == null || value1 == null) return;

    let floorId = getFloorIdByRoomId(value);
    let nextFloorId = getFloorIdByRoomId(value1);
    let entranceLoc = getEntranceByRoomId(value);
    let nextEntranceLoc = getEntranceByRoomId(value1);

    if (areRoomsOnSameFloor(value, value1)) {
      // If rooms are on the same floor, directly show the indoor map
      setFloorPlanURL(building.floorPlans + "&floor=" + floorId + "&location=" + value + "&departure=" + value1);
      setCurrentStep(1);
    } else {
      // Multi-floor or multi-building navigation
      setIsSameFloor(false);
      // Step 1: Departure indoor map with departure information
      setFloorPlanURL(building.floorPlans + "&floor=" + floorId + "&departure=" + value + "&location=" + entranceLoc);

      let buildingURL = areRoomsOnSameBuilding(value, value1) ? building.floorPlans : getUrlFromRoomId(value1);
      // Prepare destination indoor map URL (for step 3)
      setNextFloorPlanURL(buildingURL + "&floor=" + nextFloorId + "&location=" + value1 + "&departure=" + nextEntranceLoc);
      
      // Begin at step 1 (departure indoor). User can then proceed to outdoor directions.
      setCurrentStep(1);
    }
  };

  const goToOutdoorDirections = () => {
    setCurrentStep(2);
  };

  const goToDestinationIndoor = () => {
    setCurrentStep(3);
  };

  const goBackStep = () => {
    setCurrentStep(prev => (prev > 1 ? prev - 1 : prev));
  };

  useEffect(() => {
    console.log("Departure URL:", floorPlanURL);
    console.log("Destination URL:", nextFloorPlanURL);
  }, [floorPlanURL, nextFloorPlanURL]);

  useEffect(() => {
    if (currentStep === 2) {
      console.log("Route in step 2:", route);
  
      if (route.params?.isSGW) {
        route.params.campus = "sgw";
      } else {
        route.params.campus = "loyola";
      }
  
      // Ensure longName exists and then set buildingName to its lowercase version.
      if (route.params?.longName) {
        route.params.buildingName = route.params.longName.toLowerCase();
      }
    }
  }, [currentStep, route]);
  
  

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <StatusBar barStyle="dark-content" />
      <View style={{ paddingTop: headerPadding, paddingHorizontal: 16, flexDirection: "row", justifyContent: "space-around", alignItems: "center", height: "15%" }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={{ fontSize: 24, fontWeight: "300" }}>←</Text>
        </Pressable>
        <Text style={{ fontSize: 24, fontWeight: "700" }}>Map of {building.name}</Text>
      </View>

      {/* Dropdown selectors */}
      <View style={{ alignItems: "center", marginBottom: 10 }}>
        {/* Start Dropdown */}
        <View style={{ zIndex: open ? 3000 : 3000, width: "75%", marginBottom: 8 }}>
          <Text style={{ margin: 8, fontWeight: "bold" }}>Start</Text>
          <DropDownPicker
            style={{ zIndex: 3000, elevation: 3000 }}
            dropDownContainerStyle={{ zIndex: 3000, elevation: 3000 }}
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
            onSelectItem={(item) => {
              setSelectedStart(item.label); // Update label state when item is selected
            }}
          />
        </View>

        {/* Destination Dropdown */}
        <View style={{ zIndex: open1 ? 2000 : 2000, width: "75%", marginBottom: 8 }}>
          <Text style={{ margin: 8, fontWeight: "bold" }}>Destination</Text>
          <DropDownPicker
            style={{ zIndex: 2000, elevation: 2000 }}
            dropDownContainerStyle={{ zIndex: 2000, elevation: 2000 }}
            open={open1}
            value={value1}
            items={items1}
            setOpen={setOpen1}
            setValue={setValue1}
            setItems={setItems1}
            onSelectItem={(item) => {
              setSelectedEnd(item.label); // Update label state when item is selected
            }}
          />
        </View>
        
        
          <TouchableHighlight
            style={[styles.shadow, { backgroundColor: theme.backgroundColor, borderRadius: 8, padding: 12, margin: 8 }]}
            onPress={handleToCampus}
          >
            <Text style={{ fontSize: textSize, color: "white", fontWeight: "bold" }}>Search</Text>
          </TouchableHighlight>
  
      </View>

      {/* Render views based on current step */}
      {currentStep === 1 && (
        <View style={{ flex: 1 }}>
          <WebView
            style={{
              flex: 1,
              marginHorizontal: 16,
              marginBottom: 50,
              backgroundColor: "#D1D5DB",
              borderRadius: 8,
            }}
            source={{ uri: floorPlanURL }}
          />
          {!isSameFloor && (
            <View style={{ flexDirection: "row", justifyContent: "center", margin: 16 }}>
              <TouchableHighlight
                style={[styles.shadow, { backgroundColor: theme.backgroundColor, padding: 12, borderRadius: 8 }]}
                onPress={goToOutdoorDirections}
              >
                <Text style={{ fontSize: textSize, color: "white", fontWeight: "bold" }}>Outdoor Directions</Text>
              </TouchableHighlight>
            </View>
          )}
        </View>
      )}

      {currentStep === 2 && (
        <View style={{ flex: 1 }}>
          <Map navigationParams={{ start: selectedStart, end: selectedEnd, indoor: true }} />
          <View style={{ flexDirection: "row", justifyContent: "space-around", margin: 16 }}>
            <TouchableHighlight
              style={[styles.shadow, { backgroundColor: theme.backgroundColor, padding: 12, borderRadius: 8 }]}
              onPress={goBackStep}
            >
              <Text style={{ fontSize: textSize, color: "white", fontWeight: "bold" }}>Back</Text>
            </TouchableHighlight>
            <TouchableHighlight
              style={[styles.shadow, { backgroundColor: theme.backgroundColor, padding: 12, borderRadius: 8 }]}
              onPress={goToDestinationIndoor}
            >
              <Text style={{ fontSize: textSize, color: "white", fontWeight: "bold" }}>Next</Text>
            </TouchableHighlight>
          </View>
        </View>
      )}

      {currentStep === 3 && (
        <View style={{ flex: 1 }}>
        <WebView
          style={{
            flex: 1,
            marginHorizontal: 16,
            marginBottom: 50,
            backgroundColor: "#D1D5DB",
            borderRadius: 8,
          }}
          source={{ uri: nextFloorPlanURL }}
        />
        
          <View style={{ flexDirection: "row", justifyContent: "center", margin: 16 }}>
            <TouchableHighlight
              style={[styles.shadow, { backgroundColor: theme.backgroundColor, padding: 12, borderRadius: 8 }]}
              onPress={goToOutdoorDirections}
            >
              <Text style={{ fontSize: textSize, color: "white", fontWeight: "bold" }}>Back</Text>
            </TouchableHighlight>
          </View>
 
      </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
  },
  shadow: {
    boxShadow:
      "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
    textAlign: "center",
  },
});

export default InDoorScreen;
