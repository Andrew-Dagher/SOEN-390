/**
 * @file HomeCard.jsx
 * @description Renders a card component for the home screen which displays an image and a text overlay.
 * The card dimensions and styles are responsive based on the device's screen size.
 */

import React from "react";

import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import { useAppSettings } from "../../AppSettingsContext";
// Get screen dimensions for responsive design.
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

/**
 * HomeCard component displays an image and an overlay text.
 *
 * @component
 * @param {Object} props - The component properties.
 * @param {any} props.image - The source of the image to display.
 * @param {string} props.text - The text to overlay on the image.
 * @returns {JSX.Element} The rendered HomeCard component.
 */
export default function HomeCard(props) {
  const { textSize } = useAppSettings();

  return (
    <View style={styles.card}>
      {/* Container for the image */}
      <View style={styles.imageContainer}>
        <Image source={props.image} style={styles.image} resizeMode="contain" />
      </View>
      {/* Overlay text container */}
      <View style={styles.textContainer}>
        <Text style={[styles.cardText, { fontSize: textSize }]}>
          {props.text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Card container styling with responsive dimensions and shadow effects.
  card: {
    borderRadius: screenWidth * 0.04, // Responsive border radius
    width: screenWidth * 0.85, // Card takes up 85% of screen width
    height: screenHeight * 0.23, // Card takes up 23% of screen height
    overflow: "hidden", // Ensures child elements are clipped to the card's boundaries
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: "#fff",
  },
  // Image container styling with a light background color.
  imageContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5", // Light background for the image container
  },
  // Image styling to fill the container.
  image: {
    width: "100%",
    height: "100%",
  },
  // Text container styling to overlay text at the bottom of the card.
  textContainer: {
    position: "absolute",
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.85)", // Semi-transparent white background
    height: "25%", // Overlay takes up 25% of the card height
    width: "100%",
    justifyContent: "center",
    paddingHorizontal: screenWidth * 0.04,
  },
  // Text styling with bold font and responsive font size.
  cardText: {
    fontWeight: "bold",
    fontSize: screenWidth * 0.045, // Responsive font size
  },
});
