import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavBar from "../../components/BottomNavBar/BottomNavBar";
import moment from "moment";
import { fetchPublicCalendarEvents, handleGoToClass } from "../login/calendarApi";

export default function CalendarScreen() {
  const navigation = useNavigation();
  const { isSignedIn } = useAuth();
  const [events, setEvents] = useState([]);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState(null);
  const [currentStartDate, setCurrentStartDate] = useState(moment().startOf("day")); // Start today
  const [dropdownOpen, setDropdownOpen] = useState(false);



  // 🚀 Guest Mode Check: Redirect guests to login
  useEffect(() => {
    const checkGuestMode = async () => {
      try {
        const guestMode = await AsyncStorage.getItem("guestMode");

        if (guestMode === "true" || !isSignedIn) {
          console.log("Guest mode detected. Redirecting to login...");
          navigation.replace("Login");
          return;
        }
      } catch (error) {
        console.error("Error checking guest mode:", error);
        navigation.replace("Login"); // Fallback redirect
      }
    };

    checkGuestMode();
  }, [isSignedIn, navigation]);


  /**
   * Parses location information and sends a JSON object to the next page.
   *
   * @param {string} location - The location string in the format "SWG, EV, 711"
   */
  const handleGoToClass = (location) => {
    const [campus, building, room] = location.split(" ");
    const jsonData = {
      Campus: campus,
      Building: building.split("-")[0],
      Room: building.includes("-") ? building.split("-")[1] : room,
    };
    alert(JSON.stringify(jsonData, null, 2));
  };

  // Load stored calendars and selected calendar
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedCalendars = await AsyncStorage.getItem("availableCalendars");
        const storedSelectedCalendar = await AsyncStorage.getItem("selectedCalendar");

        if (storedCalendars) {
          const parsedCalendars = JSON.parse(storedCalendars);
          setCalendars(parsedCalendars);
          setSelectedCalendar(storedSelectedCalendar || parsedCalendars[0]?.id);
        } else {
          console.log("No calendars found in storage.");
        }
      } catch (error) {
        console.error("Error loading stored calendar data:", error);
      }
    };

    loadStoredData();
  }, []);

  // Fetch events for selected calendar within the 10-day range
  useEffect(() => {
    const fetchEvents = async () => {
      if (!selectedCalendar) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const startDate = currentStartDate.toISOString();
      const endDate = currentStartDate.clone().add(10, "days").toISOString();

      const fetchedEvents = await fetchPublicCalendarEvents(selectedCalendar, startDate, endDate);
      setEvents(fetchedEvents);
      setLoading(false);
    };

    fetchEvents();
  }, [selectedCalendar, currentStartDate]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#862532" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Header with Pagination */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.paginationButton} onPress={() => setCurrentStartDate(currentStartDate.clone().subtract(10, "days"))}>
            <Text style={styles.paginationButtonText}>Previous</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>Google Calendar</Text>
          <TouchableOpacity style={styles.paginationButton} onPress={() => setCurrentStartDate(currentStartDate.clone().add(10, "days"))}>
            <Text style={styles.paginationButtonText}>Next</Text>
          </TouchableOpacity>
        </View>



      {/* Date Range Display */}
        <View style={styles.centeredDateContainer}>
          <Text style={styles.centeredDateText}>
            {currentStartDate.format("MMM DD")} - {currentStartDate.clone().add(9, "days").format("MMM DD")}
          </Text>
        </View>


        {/* Calendar Selection (Dropdown) */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setDropdownOpen(!dropdownOpen)}
          >
            <Text style={styles.dropdownButtonText}>
              {calendars.find(c => c.id === selectedCalendar)?.name || "Select Calendar"}
            </Text>
          </TouchableOpacity>

          {dropdownOpen && (
            <View style={styles.dropdownMenu}>
              {calendars.map((calendar) => (
                <TouchableOpacity
                  key={calendar.id}
                  style={styles.dropdownItem}
                  onPress={async () => {
                    setSelectedCalendar(calendar.id);
                    await AsyncStorage.setItem("selectedCalendar", calendar.id);
                    setDropdownOpen(false); // Close dropdown after selection
                  }}
                >
                  <Text style={styles.dropdownItemText}>{calendar.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>


      {/* Events List */}
      <View style={styles.container}>
        {events.length === 0 ? (
          <Text style={styles.noEventsText}>No events found for this range.</Text>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 80 }}
            renderItem={({ item }) => (
              <View style={styles.eventBox}>
                <TouchableOpacity onPress={() => setExpandedEvent(expandedEvent === item.id ? null : item.id)}>
                  <Text style={styles.eventTitle}>{item.title}</Text>
                </TouchableOpacity>
                {expandedEvent === item.id && (
                  <View>
                    <Text style={styles.eventLocation}>📍 {item.description}</Text>
                    <Text style={styles.eventTime}>
                      {moment(item.start.dateTime).format("YYYY-MM-DD HH:mm")} - {moment(item.end.dateTime).format("HH:mm")}
                    </Text>
                    <TouchableOpacity style={styles.nextClassButton} onPress={() => handleGoToClass(item.description)}>
                      <Text style={styles.nextClassButtonText}>Go to Class</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          />
        )}
      </View>

      <View style={styles.bottomNavBar}>
        <BottomNavBar />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    marginTop: "10%",
  },
  headerText: {
    fontSize: 24,
    color: "#000000",
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 20,
    color: "#E6863C",
  },
  calendarListContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  calendarButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    marginHorizontal: 5,
  },
  selectedCalendarButton: {
    backgroundColor: "#862532",
  },
  calendarButtonText: {
    fontSize: 16,
    color: "#000",
  },
  selectedCalendarButtonText: {
    color: "#FFFFFF",
  },
  container: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 16,
  },
  eventBox: {
    backgroundColor: "#F5F5F5",
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    elevation: 3,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
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
  noEventsText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 20,
  },
  bottomNavBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  centeredDateContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  centeredDateText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E6863C",
    textAlign: "center",
  },


dropdownContainer: {
  marginHorizontal: 16,
  marginBottom: 10,
},
dropdownButton: {
  backgroundColor: "#F0F0F0",
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 8,
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
},
dropdownButtonText: {
  fontSize: 16,
  color: "#000",
  fontWeight: "bold",
},
dropdownMenu: {
  backgroundColor: "#FFF",
  borderRadius: 8,
  paddingVertical: 8,
  elevation: 5,
  marginTop: 5,
  width: "100%",
},
dropdownItem: {
  paddingVertical: 10,
  paddingHorizontal: 16,
  alignItems: "center",
},
dropdownItemText: {
  fontSize: 16,
  color: "#000",
},



});
