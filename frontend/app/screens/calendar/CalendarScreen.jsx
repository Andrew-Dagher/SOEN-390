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
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@clerk/clerk-expo";
import BottomNavBar from "../../components/BottomNavBar/BottomNavBar";
import moment from "moment";


//calendar Events
const Events = [
  { id: "1", summary: "SOEN-352", description: "Software Process Engineering", location: "SGW H-513", start: { dateTime: "2025-02-24T09:00:00" } },
  { id: "2", summary: "SOEN-445", description: "Data Warehousing and Mining", location: "SGW MB-S2.330", start: { dateTime: "2025-02-24T11:00:00" } },
  { id: "3", summary: "PHYS-201", description: "General Physics - Mechanics", location: "SGW H-544", start: { dateTime: "2025-02-24T13:00:00" } },
  { id: "4", summary: "ENGR-361", description: "Engineering Economics", location: "SGW H-937", start: { dateTime: "2025-02-24T15:00:00" } },
  { id: "5", summary: "SOEN-343", description: "Software Architecture and Design", location: "SGW H-849", start: { dateTime: "2025-02-24T17:00:00" } },
  { id: "6", summary: "SOEN-352", description: "Software Process Engineering", location: "SGW H-513", start: { dateTime: "2025-02-25T09:00:00" } },
  { id: "7", summary: "SOEN-445", description: "Data Warehousing and Mining", location: "SGW MB-S2.330", start: { dateTime: "2025-02-25T11:00:00" } },
  { id: "8", summary: "PHYS-201", description: "General Physics - Mechanics", location: "SGW H-544", start: { dateTime: "2025-02-26T13:00:00" } },
  { id: "9", summary: "ENGR-361", description: "Engineering Economics", location: "SGW H-937", start: { dateTime: "2025-02-27T15:00:00" } },
  { id: "10", summary: "SOEN-343", description: "Software Architecture and Design", location: "SGW H-849", start: { dateTime: "2025-02-28T17:00:00" } }
];
//Json sending campus, building and room that will ne provided to next page
const handleGoToClass = (location) => {
  const [campus, building, room] = location.split(" ");
  const jsonData = {
    Campus: campus,
    Building: building.split("-")[0],
    Room: building.includes("-") ? building.split("-")[1] : room,
  };
  alert(JSON.stringify(jsonData, null, 2));
};

export default function CalendarScreen() {
  const navigation = useNavigation();
  const { isSignedIn } = useAuth();
  const [expandedEvent, setExpandedEvent] = useState(null);

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

      <View style={styles.container}>
        <FlatList
          data={Events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item }) => (
            <View style={styles.eventBox}>
              <TouchableOpacity onPress={() => setExpandedEvent(expandedEvent === item.id ? null : item.id)}>
                <Text style={styles.eventTitle}>{item.summary}</Text>
              </TouchableOpacity>
              {expandedEvent === item.id && (
                <View>
                  <Text style={styles.eventDescription}>{item.description}</Text>
                  <Text style={styles.eventLocation}>📍 {item.location}</Text>
                  <Text style={styles.eventTime}>{moment(item.start.dateTime).format("YYYY-MM-DD HH:mm")}</Text>
                  <TouchableOpacity style={styles.nextClassButton} onPress={() => handleGoToClass(item.location)}>
                    <Text style={styles.nextClassButtonText}>Go to Class</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      </View>

      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
        <BottomNavBar />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  eventBox: {
    backgroundColor: "#F5F5F5",
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    width: "100%",
    alignSelf: "center",
    elevation: 3,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  eventDescription: {
    color: "#555",
    marginTop: 5,
  },
  eventLocation: {
    color: "#007AFF",
    marginTop: 5,
  },
  eventTime: {
    color: "#862532",
    marginTop: 5,
  },
  nextClassButton: {
    backgroundColor: "#862532",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  nextClassButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
