import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function HomeCard(props) {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={props.image} style={styles.image} resizeMode="cover" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.cardText}>{props.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    width: screenWidth * 0.9,
    maxWidth: 360,
    height: screenHeight * 0.25,
    maxHeight: 190,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    position: "absolute",
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.85)",
    height: screenHeight * 0.06,
    maxHeight: 50,
    width: "100%",
    justifyContent: "center",
    paddingLeft: screenWidth * 0.05,
  },
  cardText: {
    fontWeight: "bold",
    fontSize: Math.min(screenWidth * 0.05, 20),
  },
});
