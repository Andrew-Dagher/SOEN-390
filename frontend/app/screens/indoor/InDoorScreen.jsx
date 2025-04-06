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
import { pickerList, areRoomsOnSameFloor, areRoomsOnSameBuilding, getUrlByFloorId, getFloorIdByRoomId, getEntranceByRoomId, getUrlByRoomId, getEntranceFloor, isEntranceFloor } from "./inDoorUtil";
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
  

  const handleToCampus = () => {
    if (value == null || value1 == null) return;

    let floorId = getFloorIdByRoomId(value);
    let startUrl = getUrlByFloorId(floorId);
    let nextFloorId = getFloorIdByRoomId(value1);
    let entranceLoc = getEntranceByRoomId(value);
    let nextEntranceLoc = getEntranceByRoomId(value1);

    if (wheelchairAccess){
      entranceLoc=getEntranceByRoomId(value, true)
      nextEntranceLoc= getEntranceByRoomId(value1, true)
    }


    if (areRoomsOnSameFloor(value, value1)) {
      // If rooms are on the same floor, directly show the indoor map
      let url = startUrl + "&floor=" + floorId + "&location=" + value1 + "&departure=" + value
      let flow = [
        {url: url, is_indoor: true}
      ]
      setDirectionsFlow(flow);
      setIndex(0);
      return;
    } 
    if (areRoomsOnSameBuilding(value, value1)) {
      // rooms are on different floors but same building
      let url1 = startUrl+ "&floor=" + floorId + "&departure=" + value + "&location=" + entranceLoc;
      let url2 = startUrl + "&floor=" + nextFloorId + "&location=" + value1 + "&departure=" + nextEntranceLoc;
      let flow = [
        {url: url1, is_indoor: true},
        {url: url2, is_indoor: true}
      ]
      console.log("hhi");
      console.log(flow);
      setDirectionsFlow(flow);
      setIndex(0);
      return;
    }
    // If rooms are on different buildings, get outdoor navigations
    // Multi-floor or multi-building navigation
    let buildingURL = getUrlByRoomId(value1);
    let entranceFloor = getEntranceFloor(floorId); // get the information for the first floor of the building
    let entranceFloor2 = getEntranceFloor(nextFloorId); // get the information for the first floor of the building destination
    if (wheelchairAccess){
      nextEntranceLoc=getEntranceByRoomId(value1, true,true)
    }
    else{
      nextEntranceLoc=getEntranceByRoomId(value1, false, true)
    }

    let url1 = startUrl + "&floor=" + floorId + "&departure=" + value + "&location=" + entranceLoc;
    let url2 = startUrl+"&floor="+ entranceFloor.floor_id + "&departure="+entranceFloor.exit+"&location="+entranceFloor.entrance;
    let url3 = buildingURL + "&floor=" + entranceFloor2.floor_id + "&departure=" + entranceFloor2.exit+"&location="+entranceFloor2.entrance; // build the building destination first floor
    let url4 = buildingURL + "&floor=" + nextFloorId + "&location=" + value1 + "&departure=" + nextEntranceLoc;
    if (isEntranceFloor(floorId)) {
      url2 = null;
    }
    if (isEntranceFloor(nextFloorId)) {
      url3 = null;
    }
    let flow = [
      {url: url1, is_indoor: true},
      ...(url2 ? [{url: url2, is_indoor: true}] : []),
      {is_indoor: false},
      ...(url3 ? [{url: url3, is_indoor: true}] : []),
      {url: url4, is_indoor: true}
    ]
    setDirectionsFlow(flow);
    setIndex(0);
  };

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
            onPress={handleToCampus}
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
