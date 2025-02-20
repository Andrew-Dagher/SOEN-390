import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function HomeCard(props) {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={props.image} style={styles.image} resizeMode="contain" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.cardText}>{props.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: screenWidth * 0.04, // Responsive border radius
    width: screenWidth * 0.85, // Take up 85% of screen width
    height: screenHeight * 0.23, // Take up 23% of screen height
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: "#fff",
  },
  imageContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5", // Light background for image container
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    position: "absolute",
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.85)",
    height: "25%", // Take up 25% of card height
    width: "100%",
    justifyContent: "center",
    paddingHorizontal: screenWidth * 0.04,
  },
  cardText: {
    fontWeight: "bold",
    fontSize: screenWidth * 0.045, // Responsive font size
  },
});
