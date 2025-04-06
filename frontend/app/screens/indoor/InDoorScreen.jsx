/**
 * @file IndoorScreen.jsx
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
import { pickerList, handleToCampus } from "./inDoorUtil";
import DropDownPicker from 'react-native-dropdown-picker';
import InDoorDirections from "../../components/indoor/InDoorDirections";
import InDoorView from "../../components/indoor/InDoorView";

const InDoorScreen = () => {
  const { wheelchairAccess } = useAppSettings();
  const navigation = useNavigation();
  const route = useRoute();
  const theme = getThemeColors();
  const { textSize } = useAppSettings();

  // Retrieve the selected floorplan (or map identifier) from route params
  const { building, step1 } = route.params || { selectedFloorplan: "Unknown" };

  const headerPadding = Platform.OS === "ios" ? 48 : 32;
  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [value, setValue] = useState(step1?.value || null);
  const [value1, setValue1] = useState(step1?.value1 || null);
  const [items, setItems] = useState(pickerList);
  const [items1, setItems1] = useState(pickerList);
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [directionsFlow, setDirectionsFlow] = useState([])
  const [index, setIndex] = useState(-1);
  

  

  useEffect(() => {},[directionsFlow, index])

  useEffect(() => {
    if (route.params) {
      route.params.campus = route.params.isSGW ? "sgw" : "loyola";
    }

    // Ensure longName exists and then set buildingName to its lowercase version.
    if (route.params?.longName) {
      route.params.buildingName = route.params.longName.toLowerCase();
    }
  }, [directionsFlow]);
  
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <StatusBar barStyle="dark-content" />
      <View style={{ paddingTop: headerPadding, paddingHorizontal: 16, flexDirection: "row", justifyContent: "space-around", alignItems: "center", height: "15%" }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={{ fontSize: 24, fontWeight: "300" }}>←</Text>
        </Pressable>
        <Text style={{ fontSize: 24, fontWeight: "700" }}>Indoor Directions</Text>
      </View>

      {/* Dropdown selectors */}
      <View style={{ alignItems: "center", marginBottom: 10 }}>
        {/* Start Dropdown */}
        <View style={{ zIndex: 3000, width: "75%", marginBottom: 8 }}>
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
        <View style={{ zIndex: 2000, width: "75%", marginBottom: 8 }}>
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
        
        <View className={'flex flex-row justify-center items-center'}>
          <TouchableHighlight
            style={[styles.shadow, { backgroundColor: theme.backgroundColor, borderRadius: 8, padding: 12, margin: 8 }]}
            onPress={() => handleToCampus(value, value1, wheelchairAccess, setDirectionsFlow, setIndex)}
          >
            <Text style={{ fontSize: textSize, color: "white", fontWeight: "bold" }}>Search</Text>
          </TouchableHighlight>

          <View style={{ flexDirection: "row", justifyContent: "center", margin: 16 }}>
            <InDoorDirections directionsFlow={directionsFlow} index={index} setIndex={setIndex}></InDoorDirections>
          </View>
        </View>
  
      </View>
        
      {directionsFlow.length > 0 && <InDoorView directionsFlow={directionsFlow} index={index} selectedEnd={selectedEnd} selectedStart={selectedStart} />}
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
