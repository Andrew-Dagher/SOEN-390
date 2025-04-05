import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Text, Card, IconButton, ActivityIndicator } from "react-native-paper";
import { PinchGestureHandler } from "react-native-gesture-handler";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { polygons } from "../../screens/navigation/navigationConfig";
import { fetchPublicCalendarEvents } from "../login/LoginHelper";
import { fetchGeminiData } from "./GeminiProcessor";
export default function Planner() {
  // Date & Layout state
  const [selectedDate, setSelectedDate] = useState(
    moment().format("YYYY-MM-DD")
  );
  const [currentWeekStart, setCurrentWeekStart] = useState(
    moment().startOf("week")
  );
  const [scale, setScale] = useState(1);

  // Calendar Data
  const [classes, setClasses] = useState([]);
  const [toDoTasks, setToDoTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planning, setPlanning] = useState(false);

  // Preferences
  const [allPreferences, setAllPreferences] = useState({});
  const [classColor, setClassColor] = useState("#DCEDC8");
  const [taskColor, setTaskColor] = useState("#F0D9E2");

  // Gemini optimized schedule overlay
  const [optimizedPlan, setOptimizedPlan] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);

  // Environment Calendar IDs
  const CLASS_CALENDAR_ID = process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_ID1;
  const TODO_CALENDAR_ID = process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_ID2;

  const navigation = useNavigation();

  // Load saved preferences
  useEffect(() => {
    (async () => {
      try {
        const storedPrefs = await AsyncStorage.getItem("plannerPreferences");
        if (storedPrefs) {
          const parsedPrefs = JSON.parse(storedPrefs) || {};
          setAllPreferences(parsedPrefs);
          if (parsedPrefs.globalClassColor)
            setClassColor(parsedPrefs.globalClassColor);
          if (parsedPrefs.globalTaskColor)
            setTaskColor(parsedPrefs.globalTaskColor);
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      }
    })();
  }, []);

  // Fetch events for selected date
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const startDate = moment(selectedDate).startOf("day").toISOString();
        const endDate = moment(selectedDate).endOf("day").toISOString();
        console.log(`Fetching events from ${startDate} to ${endDate}`);

        const fetchedClasses = await fetchPublicCalendarEvents(
          CLASS_CALENDAR_ID,
          startDate,
          endDate
        );
        const fetchedToDoTasks = await fetchPublicCalendarEvents(
          TODO_CALENDAR_ID,
          startDate,
          endDate
        );

        // Sort by start time
        fetchedClasses.sort(
          (a, b) => new Date(a.start.dateTime) - new Date(b.start.dateTime)
        );
        fetchedToDoTasks.sort(
          (a, b) => new Date(a.start.dateTime) - new Date(b.start.dateTime)
        );

        setClasses(fetchedClasses);
        setToDoTasks(fetchedToDoTasks);

        console.log("Fetched classes:", fetchedClasses);
        console.log("Fetched tasks:", fetchedToDoTasks);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedDate]);

  // Calculate top and height for schedule cards
  const calculatePosition = (startDateTime, endDateTime) => {
    const startTime = moment(startDateTime);
    const endTime = moment(endDateTime);
    const startHour = startTime.hours() + startTime.minutes() / 60;
    const endHour = endTime.hours() + endTime.minutes() / 60;
    const top = (startHour - 8) * 80 * scale;
    const height = Math.max(50, (endHour - startHour) * 80 * scale);
    return { top, height, displayTime: height > 50 };
  };

  // Helper to extract location from event description
  const extractLocation = (description) => {
    if (!description) return "Unknown Location";
    const match = description.match(/<pre>(.*?)<\/pre>/);
    return match ? match[1] : description;
  };

  // Handle planning – call Gemini API to optimize schedule
  const handlePlan = async () => {
    if (planning) return;
    setPlanning(true);
    const datePrefs = allPreferences[selectedDate] || {};

    const scheduleData = {
      classes: classes.map((item) => {
        const prefs = allPreferences[selectedDate]?.[item.id] ?? {};
        return {
          id: item.id,
          name: item.title,
          location: extractLocation(item.description),
          start_time: moment(item.start.dateTime).format("HH:mm"),
          end_time: moment(item.end.dateTime).format("HH:mm"),
          skippable: !!prefs.skippable,
        };
      }),
      tasks: toDoTasks.map((item) => ({
        id: item.id,
        name: item.title,
        location: extractLocation(item.description),
        start_time: moment(item.start.dateTime).format("HH:mm"),
        end_time: moment(item.end.dateTime).format("HH:mm"),
        important: !!allPreferences[selectedDate]?.[item.id]?.important,
      })),
    };

    // Call Gemini
    fetchGeminiData(scheduleData)
      .then((response) => {
        console.log("Gemini response:", response);

        navigation.navigate("Navigation", { path: response });
      })
      .catch((error) => {
        console.error("Error fetching Gemini data:", error);
      });
    setPlanning(false);
  };

  // Navigate to Map (Navigation screen) with waypoints generated from optimizedPlan events
  const goToMap = () => {
    if (!optimizedPlan) return;
    // Merge classes and tasks from the optimized schedule
    const events = [
      ...(optimizedPlan.classes || []),
      ...(optimizedPlan.tasks || []),
    ];
    // Sort events by start_time
    const sortedEvents = events.toSorted((a, b) =>
      moment(a.start_time, "HH:mm").diff(moment(b.start_time, "HH:mm"))
    );
    // Create waypoints: for each event, extract the building name from location,
    // then look up its coordinates in polygons.
    const waypoints = sortedEvents
      .map((event) => {
        const parts = event.location.split(",");
        const buildingName = parts[parts.length - 1].trim().toLowerCase();
        const building = polygons.find(
          (b) => b.name.toLowerCase() === buildingName
        );
        return {
          name: event.name,
          location: event.location,
          start_time: event.start_time,
          end_time: event.end_time,
          coordinates: building ? building.point : null,
        };
      })
      .filter((wp) => wp.coordinates !== null);

    // Navigate to your Navigation screen (registered as "Navigation") and pass the waypoints
    navigation.navigate("Navigation", { waypoints });
  };

  return (
    <View style={styles.container} testID="planner-screen">
      {/* HEADER */}
      <View style={styles.header}>
        <IconButton
          icon="chevron-left"
          size={26}
          onPress={() =>
            setCurrentWeekStart(moment(currentWeekStart).subtract(7, "days"))
          }
        />
        <View style={styles.headerMiddle}>
          <Text variant="titleLarge" style={styles.headerText}>
            Planner
          </Text>
          <Text variant="bodyMedium" style={styles.dateText}>
            {moment(selectedDate).format("MMM DD, YYYY")}
          </Text>
        </View>
        <IconButton
          icon="chevron-right"
          size={26}
          onPress={() =>
            setCurrentWeekStart(moment(currentWeekStart).add(7, "days"))
          }
        />
      </View>

      {/* WEEK SELECTOR */}
      <View style={styles.weekContainer}>
        {Array.from({ length: 7 }, (_, i) => {
          const date = moment(currentWeekStart)
            .add(i, "days")
            .format("YYYY-MM-DD");
          return (
            <TouchableOpacity
              key={date}
              style={[
                styles.dateButton,
                selectedDate === date && styles.selectedDate,
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text
                style={[
                  styles.dayText,
                  selectedDate === date && styles.selectedDateText,
                ]}
              >
                {moment(date).format("dd")}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  selectedDate === date && styles.selectedDateText,
                ]}
              >
                {moment(date).format("D")}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#862532"
          style={styles.loadingIndicator}
        />
      ) : (
        <PinchGestureHandler
          onGestureEvent={(event) => {
            if (event.nativeEvent.scale > 0.8 && event.nativeEvent.scale < 2) {
              setScale(event.nativeEvent.scale);
            }
          }}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scheduleContainer,
              { height: 1800 * scale },
            ]}
            showsVerticalScrollIndicator
          >
            {Array.from({ length: 15 }, (_, i) => {
              const hourLabel = moment()
                .startOf("day")
                .add(8 + i, "hours")
                .format("h A");
              return (
                <View
                  key={hourLabel}
                  style={[styles.timeSlot, { height: 80 * scale }]}
                >
                  <Text style={styles.timeText}>{hourLabel}</Text>
                </View>
              );
            })}

            {classes.map((item) => {
              const prefs = allPreferences[selectedDate]?.[item.id] ?? {};
              const bgColor = prefs.skippable ? "#D3D3D3" : classColor;
              const { top, height, displayTime } = calculatePosition(
                item.start.dateTime,
                item.end.dateTime
              );
              return (
                <Card
                  key={item.id}
                  style={[
                    styles.scheduleCard,
                    { top, height, backgroundColor: bgColor },
                  ]}
                >
                  <Card.Content>
                    <Text variant="titleMedium" style={styles.taskText}>
                      {item.title}
                    </Text>
                    {displayTime && (
                      <Text variant="bodySmall">
                        {moment(item.start.dateTime).format("hh:mm A")} -{" "}
                        {moment(item.end.dateTime).format("hh:mm A")}
                      </Text>
                    )}
                  </Card.Content>
                </Card>
              );
            })}

            {toDoTasks.map((item) => {
              const { top, height, displayTime } = calculatePosition(
                item.start.dateTime,
                item.end.dateTime
              );
              return (
                <Card
                  key={`task-${item.id}`}
                  style={[
                    styles.scheduleCard,
                    { top, height, backgroundColor: taskColor },
                  ]}
                >
                  <Card.Content>
                    <Text variant="titleMedium" style={styles.taskText}>
                      {item.title}
                    </Text>
                    {displayTime && (
                      <Text variant="bodySmall">
                        {moment(item.start.dateTime).format("hh:mm A")} -{" "}
                        {moment(item.end.dateTime).format("hh:mm A")}
                      </Text>
                    )}
                  </Card.Content>
                </Card>
              );
            })}
          </ScrollView>
        </PinchGestureHandler>
      )}

      <TouchableOpacity
        style={styles.planButton}
        onPress={handlePlan}
        disabled={planning}
      >
        {planning ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.buttonText}>Plan</Text>
        )}
      </TouchableOpacity>

      {/* Overlay with Optimized Plan and Go to Map Button */}
      {showOverlay && optimizedPlan && (
        <View style={styles.overlayBackground}>
          <View style={styles.overlayContainer}>
            <Text style={styles.overlayTitle}>Your Optimized Day Plan</Text>
            {[...(optimizedPlan.classes || []), ...(optimizedPlan.tasks || [])]
              .sort((a, b) =>
                moment(a.start_time, "HH:mm").diff(
                  moment(b.start_time, "HH:mm")
                )
              )
              .map((item, index) => (
                <Text key={item.id} style={styles.overlayText}>
                  {`${index + 1}. ${item.start_time} - ${item.end_time}: ${
                    item.name
                  } at ${item.location}`}
                </Text>
              ))}
            <TouchableOpacity
              style={styles.mapButton}
              onPress={goToMap}
              activeOpacity={0.9}
            >
              <Text style={styles.mapButtonText}>Go to Map</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowOverlay(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    paddingTop: 65,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  headerMiddle: {
    alignItems: "center",
    flex: 1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#862532",
  },
  dateText: {
    fontSize: 14,
    color: "#666",
  },
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  dateButton: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: "#E0E0E0",
    width: 45,
  },
  selectedDate: {
    backgroundColor: "#862532",
  },
  selectedDateText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  dayText: {
    fontSize: 14,
    color: "#555",
  },
  scheduleContainer: {
    position: "relative",
    paddingHorizontal: 20,
  },
  timeSlot: {
    justifyContent: "center",
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
  },
  timeText: {
    fontSize: 14,
    color: "#666",
  },
  scheduleCard: {
    position: "absolute",
    left: 70,
    width: "75%",
    borderRadius: 10,
    paddingVertical: 10,
    justifyContent: "center",
    elevation: 3,
  },
  taskText: {
    fontWeight: "bold",
    color: "#333",
  },
  loadingIndicator: {
    marginTop: 40,
  },
  planButton: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    backgroundColor: "#862532",
    padding: 15,
    borderRadius: 25,
  },
  customizeButton: {
    position: "absolute",
    right: 20,
    bottom: 80,
    backgroundColor: "#862532",
    padding: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  overlayBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayContainer: {
    width: "80%",
    minHeight: 220,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  overlayText: {
    fontSize: 14,
    marginBottom: 5,
    color: "#444",
    textAlign: "left",
    width: "100%",
  },
  mapButton: {
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#862532",
    borderRadius: 8,
  },
  mapButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  closeButtonText: {
    color: "#862532",
    fontSize: 14,
    fontWeight: "bold",
  },
});
