import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import PropTypes from 'prop-types'; // Import PropTypes

export default function InAppNotification({ message, visible }) {
  const [fadeAnim] = useState(new Animated.Value(0)); // For fade-in effect
  const [translateY] = useState(new Animated.Value(-50)); // Start slightly above

  useEffect(() => {
    if (visible) {
      console.log("📢 Rendering In-App Notification:", message);

      // Start fade-in + slide down
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300, // Smooth fade-in
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0, // Moves it into view
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after 5 seconds (stay visible for 3s, then slide up & fade out)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300, // Smooth fade-out
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -50, // Moves it up before disappearing
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, 2000); // Stay visible for 3 seconds before sliding up
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.notificationContainer,
        { opacity: fadeAnim, transform: [{ translateY }] },
      ]}
    >
      <Text style={styles.notificationText}>{message}</Text>
    </Animated.View>
  );
}

// Prop types validation
InAppNotification.propTypes = {
  message: PropTypes.string.isRequired, // 'message' should be a string and is required
  visible: PropTypes.bool.isRequired, // 'visible' should be a boolean and is required
};

const styles = StyleSheet.create({
  notificationContainer: {
    position: "absolute",
    top: 60, // Position near top
    left: 20,
    right: 20,
    backgroundColor: "#862532", // Deep red theme
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    elevation: 10, // Shadow on Android
    shadowColor: "#000", // Shadow on iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  notificationText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
