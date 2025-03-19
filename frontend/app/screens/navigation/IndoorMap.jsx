/**
 * @file IndoorMap.jsx
 * @description Displays a map placeholder along with a back button and fields for setting start and destination.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StatusBar,
  Platform,
  TextInput,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const MapPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // Retrieve the selected floorplan (or map identifier) from route params
  const { selectedFloorplan } = route.params || { selectedFloorplan: "Unknown" };

  const headerPadding = Platform.OS === "ios" ? 48 : 32;
  // States for Start and Destination fields
  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("");

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <StatusBar barStyle="dark-content" />
      <View style={{ paddingTop: headerPadding, paddingHorizontal: 16, marginBottom: 16 }}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={{ fontSize: 24, fontWeight: "300" }}>←</Text>
        </Pressable>
        <Text style={{ fontSize: 24, fontWeight: "700", marginVertical: 8 }}>
          Map of {selectedFloorplan}
        </Text>
      </View>

      {/* Input fields for Start and Destination */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#D1D5DB",
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
            backgroundColor: "#FFFFFF",
          }}
          placeholder="Start"
          value={start}
          onChangeText={setStart}
        />
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#D1D5DB",
            borderRadius: 8,
            padding: 12,
            backgroundColor: "#FFFFFF",
          }}
          placeholder="Destination"
          value={destination}
          onChangeText={setDestination}
        />
      </View>

      {/* Map Placeholder */}
      <View
        style={{
          flex: 1,
          marginHorizontal: 16,
          marginBottom: 16,
          backgroundColor: "#D1D5DB",
          borderRadius: 8,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 18, color: "#4B5563" }}>Map Placeholder</Text>
      </View>
    </View>
  );
};

export default MapPage;
