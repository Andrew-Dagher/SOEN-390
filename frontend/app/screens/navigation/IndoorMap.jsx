/**
 * @file IndoorMap.jsx
 * @description Displays a map placeholder along with a back button.
 */

import React from "react";
import { View, Text, Pressable, StatusBar, Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const MapPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // Retrieve the selected floorplan (or map identifier) from route params
  const { selectedFloorplan } = route.params || { selectedFloorplan: "Unknown" };

  // Adjust header padding based on the platform
  const headerPadding = Platform.OS === "ios" ? 48 : 32;

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
