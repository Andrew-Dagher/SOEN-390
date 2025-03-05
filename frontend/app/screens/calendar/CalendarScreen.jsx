/**
 * @file CalendarScreen.jsx
 * @description Renders a calendar view with month display, date selection, and navigation options.
 */

import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Calendar } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";
import BottomNavBar from "../../components/BottomNavBar/BottomNavBar"; // Ensure BottomNavBar is correctly imported
import CalendarDirectionsIcon from "../../components/Calendar/CalendarIcons/CalendarDirectionsIcon.jsx"; // Import CalendarDirectionsIcon
import { useAppSettings } from "../../AppSettingsContext";
import getThemeColors from "../../ColorBindTheme";

/**
 * Fetches public Google Calendar events using the given Calendar ID.
 *
 * @param {string} calendarId
 */
async function fetchPublicCalendarEvents(calendarId) {
  try {
    const GOOGLE_API_KEY = 'AIzaSyCvjUbpw2Otdd5H2Rb7WvIUR_k_qPMV4eY';

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${GOOGLE_API_KEY}&timeMin=2000-01-01T00:00:00Z&singleEvents=true&orderBy=startTime`;

    console.log("Fetching calendar for:", calendarId);

    const response = await fetch(url);
    const textResponse = await response.text();
    console.log("Raw response:", textResponse);

    if (!response.ok) {
      throw new Error(`Error fetching calendar events: ${response.status} - ${response.statusText}`);
    }

    const data = JSON.parse(textResponse);

    console.log("\nFetched Calendar Events:");
    if (!data.items || data.items.length === 0) {
      console.log("No events found.");
    } else {
      data.items.forEach((event, index) => {
        console.log(`\nEvent ${index + 1}:`);
        console.log(`Title: ${event.summary}`);
        console.log(`Start Date: ${event.start?.date || event.start?.dateTime}`);
        console.log(`End Date: ${event.end?.date || event.end?.dateTime}`);
        console.log(`Event Link: ${event.htmlLink}`);
      });
    }
  } catch (error) {
    console.error("Error fetching public calendar:", error);
  }
}

/**
 * CalendarScreen component renders a calendar with navigation and a directions button.
 *
 * @component
 * @returns {JSX.Element} The rendered CalendarScreen component.
 */
export default function CalendarScreen() {
  // React Navigation hook to manage navigation.
  const navigation = useNavigation();
  const theme = getThemeColors();
  const { textSize } = useAppSettings();

  // Fetch Google Calendar events when the calendar screen is accessed.
  useEffect(() => {
    fetchPublicCalendarEvents('88fe87c39a16882b4aee693947161c1aac92560346c58a7423eca4ac22079fb2@group.calendar.google.com');
  }, []);

  // Get screen height and width for multiple phones
  const screenHeight = Dimensions.get("window").height;

  // State for the current month displayed on the header.
  const [currentMonth, setCurrentMonth] = useState("January");

  /**
   * Updates the current month based on the month change event from the Calendar component.
   *
   * @param {Object} monthData - The month data provided by the Calendar component.
   * @param {number} monthData.month - The numeric representation of the month (1-12).
   */
  const handleMonthChange = (monthData) => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    // Convert month number to month name and update state.
    setCurrentMonth(monthNames[monthData.month - 1]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF", flexDirection: "column" }}>
      {/* Header displaying the current month and a static date. */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 16, marginTop: "10%" }}>
        <Text style={{ fontSize: 24, color: "#000000", fontWeight: "bold" }}>{currentMonth}</Text>
        <Text style={{ fontSize: 20, color: "#E6863C" }}>27</Text>
      </View>

      {/* Calendar component with configuration for dates, theme, and event handlers. */}
      <Calendar
        testID="calendar-view"
        current={"2025-01-01"}
        minDate={"2025-01-01"}
        maxDate={"2025-12-31"}
        monthFormat={"yyyy MM"}
        onDayPress={(day) => console.log("selected day", day)}
        onMonthChange={handleMonthChange} // Update month on arrow press.
        theme={{
          selectedDayBackgroundColor: "#E6863C",
          selectedDayTextColor: "#FFFFFF",
          todayTextColor: "#862532",
          arrowColor: "#862532",
        }}
      />

      {/* Button with icon to trigger directions alert. Positioned near the bottom of the screen. */}
      <View style={{ position: "absolute", bottom: "10%", left: 0, right: 0 }}>
        <TouchableOpacity
          style={[styles.buttonContainer, { backgroundColor: theme.backgroundColor }]}
          onPress={() => alert("Directions are coming soon!")}
        >
          <Text style={[styles.buttonText, { backgroundColor: theme.backgroundColor }, { fontSize: textSize }]}>
            Get Directions to My Next Class
          </Text>
          {/* Add the icon after the text */}
          <CalendarDirectionsIcon width={25} height={25} />
        </TouchableOpacity>
      </View>

      {/* Bottom navigation bar component. */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
        <BottomNavBar />
      </View>
    </View>
  );
}

// Styling for the button and its text.
const styles = StyleSheet.create({
  buttonContainer: {
    alignSelf: "center", // Center the button horizontally.
    flexDirection: "row", // Align icon and text on the same line.
    alignItems: "center", // Vertically align text and icon.
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
    marginRight: 10, // Space between text and icon.
  },
});
