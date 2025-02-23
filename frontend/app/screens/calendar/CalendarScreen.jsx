import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@clerk/clerk-expo";
import BottomNavBar from "../../components/BottomNavBar/BottomNavBar";
import CalendarDirectionsIcon from "../../components/Calendar/CalendarIcons/CalendarDirectionsIcon";
import { useGoogleAccessToken } from "../login/useGoogleAccessToken"; // ✅ Import hook
import { fetchGoogleCalendarEvents } from "../login/googleCalendarService"; // ✅ Import service
import moment from "moment";

export default function CalendarScreen() {
  const navigation = useNavigation();
  const { isSignedIn } = useAuth();
  const { googleToken, error } = useGoogleAccessToken(); // ✅ Use the hook
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (googleToken) {
      loadCalendarEvents(googleToken);
    }
  }, [googleToken]);

  const loadCalendarEvents = async (token) => {
    try {
      const fetchedEvents = await fetchGoogleCalendarEvents(token);
      setEvents(fetchedEvents);
    } catch (error) {
      Alert.alert("Error", "Failed to load Google Calendar events.");
    }
  };

  if (!isSignedIn) {
    Alert.alert("Authentication Error", "Please sign in to access Google Calendar.");
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 16, marginTop: "10%" }}>
        <Text style={{ fontSize: 24, color: "#000000", fontWeight: "bold" }}>Google Calendar</Text>
        <Text style={{ fontSize: 20, color: "#E6863C" }}>{moment().format("DD")}</Text>
      </View>

      {googleToken === null && !error ? (
        <ActivityIndicator size="large" color="#862532" style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.container}>
          {googleToken ? (
            <>
              <Text style={styles.tokenText}>
                ✅ OAuth Token Retrieved
              </Text>
              <FlatList
                data={events}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.eventItem}>
                    <Text style={styles.eventTitle}>{item.summary || "No Title"}</Text>
                    <Text style={styles.eventDescription}>{item.description || "No Description"}</Text>
                    <Text style={styles.eventTime}>
                      {moment(item.start?.dateTime || item.start?.date).format("YYYY-MM-DD HH:mm")}
                    </Text>
                  </View>
                )}
              />
            </>
          ) : (
            <Text style={styles.errorText}>{error || "❌ Failed to retrieve Google OAuth token."}</Text>
          )}
        </View>
      )}

      {/* Navigation & Button */}
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
  container: {
    marginTop: 20,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  tokenText: {
    color: "#862532",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
  eventItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  eventDescription: {
    color: "#555",
  },
  eventTime: {
    color: "#862532",
  },
});
