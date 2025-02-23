/**
 * @file HomeHeader.jsx
 * @description Renders the header component for the home screen. This header displays a welcome message,
 * the user's name, and the Concordia logo. The background color is dynamically determined by the current theme.
 */

import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Concordia50 from "./Icons/Concordia50/Concordia50";
import getThemeColors from "../../../ColorBindTheme";

// Get screen dimensions for responsive design.
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

/**
 * HomeHeader component renders the welcome message and logo on the home screen.
 *
 * @param {Object} props - Component properties.
 * @param {string} props.name - The name of the user to be displayed.
 * @returns {JSX.Element} The rendered HomeHeader component.
 */
export default function HomeHeader(props) {
  const theme = getThemeColors();

  return (
    <View style={[styles.header, { backgroundColor: theme.backgroundColor }]}>
      <View testID="home-header" style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome Back</Text>
        <Text style={styles.nameText}>{props.name}</Text>
      </View>
      <View style={styles.logoContainer}>
        <Concordia50 />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: screenHeight * 0.25,
    maxHeight: 194,
    alignItems: "center",
    flexDirection: "row",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 200,
    elevation: 10,
  },
  welcomeContainer: {
    flex: 2,
    paddingLeft: screenWidth * 0.05,
    paddingTop: screenHeight * 0.02,
  },
  welcomeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: Math.min(screenWidth * 0.08, 30),
  },
  nameText: {
    color: "white",
    fontSize: Math.min(screenWidth * 0.06, 24),
  },
  logoContainer: {
    flex: 1,
    alignItems: "flex-end",
    paddingRight: screenWidth * 0.05,
    paddingTop: screenHeight * 0.03,
  },
});
