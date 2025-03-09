// GoToClassButton.jsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";

/**
 * This component renders a "Go to Class" button and handles navigation to the class location.
 *
 * @param {string} locationString - e.g. "SGW, Hall Building, 913"
 */
export default function GoToClassButton({ locationString }) {
  const navigation = useNavigation();

  const handleGoToClass = async () => {
    try {
      const [campus, buildingName, room] = locationString
        .split(",")
        .map((str) => str.trim());

      const currentLocation = await Location.getCurrentPositionAsync({});

      navigation.navigate("Navigation", {
        campus: campus.toLowerCase().replace("<pre>", "").trim(),
        buildingName: buildingName
          .replace("<pre>", "")
          .replace("</pre>", "")
          .trim(),
        currentLocation: {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        },
      });
    } catch (error) {
      console.error("Error fetching location or parsing location string:", error);
    }
  };

  return (
    <TouchableOpacity style={styles.nextClassButton} onPress={handleGoToClass}>
      <Text style={styles.nextClassButtonText}>Go to Class</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  nextClassButton: {
    backgroundColor: "#862532",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  nextClassButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
