import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Calendar } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";
import BottomNavBar from "../../components/BottomNavBar/BottomNavBar"; // Ensure BottomNavBar is correctly imported
import CalendarDirectionsIcon from "../../components/Calendar/CalendarIcons/CalendarDirectionsIcon.jsx"; // Import CalendarDirectionsIcon

export default function CalendarScreen() {
  const navigation = useNavigation();

  // Google API issues no need for current sprint
  // Here we would put the code to fetch the calendar with Google API

  // Get screen height and width for multiple phones
  const screenHeight = Dimensions.get("window").height;

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF", flexDirection: "column" }}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 16, marginTop: "10%" }}>
        <Text style={{ fontSize: 24, color: "#000000", fontWeight: "bold" }}>January</Text>
        <Text style={{ fontSize: 20, color: "#E6863C" }}>27</Text>
      </View>

      {/* Calendar */}
      <Calendar
        current={"2025-01-01"}
        minDate={"2025-01-01"}
        maxDate={"2025-12-31"}
        monthFormat={"yyyy MM"}
        onDayPress={(day) => console.log("selected day", day)}
        theme={{
          selectedDayBackgroundColor: "#E6863C",
          selectedDayTextColor: "#FFFFFF",
          todayTextColor: "#862532",
          arrowColor: "#862532",
        }}
      />

      {/* Button with Icon */}
      <View style={{ position: "absolute", bottom: "10%", left: 0, right: 0 }}>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => alert("Directions are coming soon!")}
        >
          <Text style={styles.buttonText}>Get Directions to My Next Class</Text>
          {/* Add the icon after the text */}
          <CalendarDirectionsIcon width={25} height={25} />
        </TouchableOpacity>
      </View>

      {/* Bottom Nav Bar */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
        <BottomNavBar />
      </View>
    </View>
  );
}

// Button styling
const styles = StyleSheet.create({
  buttonContainer: {
    alignSelf: "center", // This will center the button horizontally
    flexDirection: "row", // Align icon and text on the same line
    alignItems: "center", // Ensure vertical alignment of text and icon
    justifyContent: "space-between",
    backgroundColor: "#862532",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 10, // Add space between text and icon
  },
});
