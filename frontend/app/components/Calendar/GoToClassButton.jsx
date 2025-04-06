import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import PropTypes from 'prop-types';  // Import PropTypes
import getThemeColors from "../../ColorBindTheme";

export default function GoToClassButton({ locationString }) {
  const navigation = useNavigation();
  const theme = getThemeColors();
  const handleGoToClass = async () => {
    try {
      // Safely split the string
      const parts = locationString.split(",").map((str) => str.trim());

      // Fallback to empty strings if there's not enough data
      const c = parts[0] || "";
      const b = parts[1] || "";

      // Get current device location
      const currentLocation = await Location.getCurrentPositionAsync({});

      // Navigate even if some parts are empty
      navigation.navigate("Navigation", {
        campus: c.toLowerCase().replace("<pre>", "").replace("</pre>", "").trim(),
        buildingName: b.replace("<pre>", "").replace("</pre>", "").trim(),
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
    <TouchableOpacity style={[styles.nextClassButton, { backgroundColor: theme.backgroundColor }]} onPress={handleGoToClass}>
      <Text style={styles.nextClassButtonText}>Go to Class</Text>
    </TouchableOpacity>
  );
}

GoToClassButton.propTypes = {
  locationString: PropTypes.string.isRequired,  // Validate locationString
};

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