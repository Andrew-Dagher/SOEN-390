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
  TextInput,
  StyleSheet,
  TouchableHighlight
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { WebView } from 'react-native-webview';
import getThemeColors from "../../ColorBindTheme";
import { useAppSettings } from "../../AppSettingsContext";
import { pickerList, areRoomsOnSameFloor, areRoomsOnSameBuilding, getFloorIdByRoomId, getEntranceByRoomId, getUrlFromRoomId} from "./inDoorUtil";
import DropDownPicker from 'react-native-dropdown-picker';

const InDoorScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = getThemeColors();
  const { textSize } = useAppSettings();
  
  // Retrieve the selected floorplan (or map identifier) from route params
  const { building, step1 } = route.params || { selectedFloorplan: "Unknown" };
  
  const headerPadding = Platform.OS === "ios" ? 48 : 32;
  const [floorPlanURL, setFloorPlanURL] = useState(building.floorPlans)
  const [nextFloorPlanURL, setNextFloorPlanURL] = useState(building.floorPlans);
  const [isSameFloor, setIsSameFloor] = useState(true);
  const [isNextFloor, setIsNextFloor] = useState(false);
  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [value, setValue] = useState(step1?.value || null);
  const [value1, setValue1] = useState(step1?.value1 || null);
  const [items, setItems] = useState(pickerList);
  const [items1, setItems1] = useState(pickerList);
  const [openWebView, setOpenWebView] = useState(false);

  const handleNextFloor = () => {
    if (isNextFloor) setIsNextFloor(false);
    if (!isNextFloor) setIsNextFloor(true);
  }

  const handleToCampus = () => {
    if (value == null || value1 == null) return;

    let floorId = getFloorIdByRoomId(value);
    let nextFloorId = getFloorIdByRoomId(value1);
    let entranceLoc = getEntranceByRoomId(value);
    let nextEntranceLoc = getEntranceByRoomId(value1);

    if (areRoomsOnSameFloor(value, value1)) {
      setFloorPlanURL(building.floorPlans+"&floor="+floorId+"&location="+value+"&departure="+value1);
      setOpenWebView(true);
      return;
    } else {
      setIsSameFloor(false);
      setFloorPlanURL(building.floorPlans+"&floor="+floorId+"&departure="+value+"&location="+entranceLoc);

      let buildingURL = areRoomsOnSameBuilding(value, value1) ? building.floorPlans : getUrlFromRoomId(value1);
      setNextFloorPlanURL(buildingURL+"&floor="+nextFloorId+"&location="+value1+"&departure="+nextEntranceLoc);
      setOpenWebView(true);
    }
  }

  useEffect(() => {
    console.log(floorPlanURL)
    console.log(nextFloorPlanURL)
  }, [openWebView, isNextFloor, isSameFloor, nextFloorPlanURL])

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <StatusBar barStyle="dark-content" />
      <View className={" h-1/6 flex flex-row justify-around items-center"} style={{ paddingTop: headerPadding, paddingHorizontal: 16 }}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={{ fontSize: 24, fontWeight: "300" }}>←</Text>
        </Pressable>
        <Text style={{ fontSize: 24, fontWeight: "700", marginVertical: 8 }}>
          Map of {building.name}
        </Text>
   
      </View>

     
      {/* Map Placeholder */}
      <View>
        <View className={'flex items-center'}>
          <View className={'flex flex-row items-center justify-center w-3/4 mb-2'}>
            <Text className={'m-2 font-bold'}>Start</Text>
            <DropDownPicker
              open={open}
              value={value}
              items={items}
              setOpen={setOpen}
              setValue={setValue}
              setItems={setItems}
            />
          </View>
          <View className={'flex flex-row items-center justify-center w-3/4'}>
            <Text className={'m-2 font-bold'}>Destination</Text>
            <DropDownPicker
              open={open1}
              value={value1}
              items={items1}
              setOpen={setOpen1}
              setValue={setValue1}
              setItems={setItems1}
            />
          </View>
          
          <View className='flex flex-row justify-between items-center'>
            <TouchableHighlight
              style={[
                styles.shadow,
                { backgroundColor: theme.backgroundColor },
              ]}
              className="rounded-xl p-4 bg-primary-red m-2"
              onPress={handleToCampus}
            >
              <View className="flex flex-row justify-around items-center">
                <Text
                  style={[{ fontSize: textSize }]}
                  className="color-white  font-bold"
                >
                  Search
                </Text>
              </View>
            </TouchableHighlight>

            {openWebView && !isSameFloor && <TouchableHighlight
              style={[
                styles.shadow,
                { backgroundColor: theme.backgroundColor },
              ]}
              className={`rounded-xl p-4 ${!isNextFloor ? 'bg-primary-red' : 'bg-primary-accent'} m-2`}
              onPress={handleNextFloor}
            >
              <View className="flex flex-row justify-around items-center">
                <Text
                  style={[{ fontSize: textSize }]}
                  className="color-white  font-bold"
                >
                  {!isNextFloor ? 'Next Floor' : 'Prev Floor'}
                </Text>
              </View>
            </TouchableHighlight>}
          </View>
        </View>
        <WebView
          className={"h-5/6"}
          style={{
            flex: 1,
            marginHorizontal: 16,
            marginBottom: 50,
            backgroundColor: "#D1D5DB",
            borderRadius: 8,
            justifyContent: "center",
            alignItems: "center",
          }}
          source={{ uri: building.floorPlans }}
        />
      </View>
    {openWebView && (
      <WebView
        style={[{
          flex: 1,
          marginHorizontal: 16,
          marginBottom: 50,
          backgroundColor: "#D1D5DB",
          borderRadius: 8,
          justifyContent: "center",
          alignItems: "center",
        },
        styles.shadow]}
        source={{ uri: !isNextFloor ? floorPlanURL : nextFloorPlanURL }}
      />  
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
