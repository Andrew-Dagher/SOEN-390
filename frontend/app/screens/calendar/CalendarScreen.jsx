import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { Calendar } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@clerk/clerk-expo";
import BottomNavBar from "../../components/BottomNavBar/BottomNavBar";
import CalendarDirectionsIcon from "../../components/Calendar/CalendarIcons/CalendarDirectionsIcon";
import { fetchGoogleCalendarEvents } from "../login/googleCalendarService";
import moment from "moment";

export default function CalendarScreen() {
  const navigation = useNavigation();
  const { isSignedIn, getToken } = useAuth(); // ✅ Ensure getToken is extracted from useAuth
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState(null);

  useEffect(() => {
    if (isSignedIn && getToken) {
      loadCalendarEvents(getToken); // ✅ Pass getToken explicitly
    } else {
      Alert.alert("Authentication Error", "Please sign in to access Google Calendar.");
    }
  }, [isSignedIn]);

  const loadCalendarEvents = async (getToken) => {
    try {
      setLoading(true);
      console.log("🔄 Attempting to retrieve Google OAuth token...");

      const token = await getToken({ template: "oauth_google" }); // ✅ Use the getToken function correctly
      if (!token) {
        throw new Error("No valid Google OAuth token retrieved.");
      }

      const data = await fetchGoogleCalendarEvents(token); // ✅ Pass token, not getToken
      if (data && data.items) {
        processEvents(data.items);
      }
    } catch (error) {
      console.error("❌ Error fetching Google Calendar events:", error);
      Alert.alert("Error", "Failed to load Google Calendar events.");
    } finally {
      setLoading(false);
    }
  };

  const processEvents = (items) => {
    let formattedEvents = {};
    items.forEach((event) => {
      if (event.start && event.start.dateTime) {
        const eventDate = moment(event.start.dateTime).format("YYYY-MM-DD");
        formattedEvents[eventDate] = { marked: true, dotColor: "#862532" };
      }
    });
    setEvents(formattedEvents);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 16, marginTop: "10%" }}>
        <Text style={{ fontSize: 24, color: "#000000", fontWeight: "bold" }}>Google Calendar</Text>
        <Text style={{ fontSize: 20, color: "#E6863C" }}>{moment().format("DD")}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#862532" style={{ marginTop: 20 }} />
      ) : (
        <Calendar
          current={moment().format("YYYY-MM-DD")}
          markedDates={events}
          theme={{
            selectedDayBackgroundColor: "#E6863C",
            selectedDayTextColor: "#FFFFFF",
            todayTextColor: "#862532",
            arrowColor: "#862532",
          }}
        />
      )}

      <View style={{ position: "absolute", bottom: "10%", left: 0, right: 0 }}>
        <TouchableOpacity style={styles.buttonContainer} onPress={() => alert("Directions are coming soon!")}>
          <Text style={styles.buttonText}>Get Directions to My Next Class</Text>
          <CalendarDirectionsIcon width={25} height={25} />
        </TouchableOpacity>
      </View>

      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
        <BottomNavBar />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
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
    marginRight: 10,
  },
});
