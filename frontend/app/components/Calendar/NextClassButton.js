import React, { useState, useEffect } from "react";
import { TouchableOpacity, Text, StyleSheet, Animated, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import PropTypes from "prop-types";
import CalendarDirectionsIcon from "./CalendarIcons/CalendarDirectionsIcon"; // Import the icon

export default function NextClassButton({ eventObserver }) {
  const navigation = useNavigation();
  const [nextEventLocation, setNextEventLocation] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0)); // Fade animation

  useEffect(() => {
    const observerCallback = (events) => {
      if (!events || events.length === 0) {
        setNextEventLocation(null);
        return;
      }

      const now = new Date();
      const upcomingEvent = events
        .filter((evt) => new Date(evt.start.dateTime) > now)
        .sort((a, b) => new Date(a.start.dateTime) - new Date(b.start.dateTime))[0];

      if (upcomingEvent) {
        setNextEventLocation(upcomingEvent.description);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        setNextEventLocation(null);
      }
    };

    eventObserver.subscribe(observerCallback);

    return () => {
      eventObserver.unsubscribe(observerCallback);
    };
  }, [eventObserver, fadeAnim]);

  const handleGoToNextClass = async () => {
    if (!nextEventLocation) return;

    try {
      const parts = nextEventLocation.split(",").map((p) => p.trim());
      const campus = (parts[0] || "").toLowerCase().replace(/<\/?pre>/g, "").trim();
      const buildingName = (parts[1] || "").replace(/<\/?pre>/g, "").trim();

      const currentLocation = await Location.getCurrentPositionAsync({});

      navigation.navigate("Navigation", {
        campus,
        buildingName,
        currentLocation: {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        },
      });
    } catch (error) {
      console.error("Error navigating to next class:", error);
    }
  };

  if (!nextEventLocation) return null;

  return (
    <Animated.View style={[styles.floatingContainer, { opacity: fadeAnim }]}>
      <TouchableOpacity style={[styles.floatingButton, { backgroundColor: theme.backgroundColor }]} onPress={handleGoToNextClass}>
        <Text style={styles.floatingButtonText}>Go to My Next Class</Text>
        <CalendarDirectionsIcon style={styles.icon} />
      </TouchableOpacity>
    </Animated.View>
  );
}

NextClassButton.propTypes = {
  eventObserver: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: "absolute",
    bottom: 70, // Keep it at the bottom
    left: 0,
    right: 0,
    alignItems: "center", // Center horizontally
    zIndex: 1000, // Ensure it stays on top
  },
  floatingButton: {
    flexDirection: "row", // Arrange text and icon in a row
    alignItems: "center", // Align vertically in center
    backgroundColor: "#862532",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Android shadow
  },
  floatingButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginRight: 10, // Space between text and icon
  },
  icon: {
    width: 24,
    height: 24,
  },
});
