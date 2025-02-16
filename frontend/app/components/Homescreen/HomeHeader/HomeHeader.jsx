import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Concordia50 from "./Icons/Concordia50/Concordia50";
import getThemeColors from "../../../ColorBindTheme";

// get screen dimensions for responsive design
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function HomeHeader(props) {
  const theme = getThemeColors();

  return (
    <View style={[styles.header, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.welcomeContainer}>
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
