import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Text, Card, IconButton, ActivityIndicator, Modal } from "react-native-paper";
import { PinchGestureHandler } from "react-native-gesture-handler";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchPublicCalendarEvents } from "../login/LoginHelper";
import CustomizeModal from "./CustomizeModal"; // Import the modal

export default function Planner() {
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [currentWeekStart, setCurrentWeekStart] = useState(moment().startOf("week"));
  const [scale, setScale] = useState(1);
  const [classes, setClasses] = useState([]);
  const [toDoTasks, setToDoTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCustomizeModalVisible, setIsCustomizeModalVisible] = useState(false);
  const [preferences, setPreferences] = useState({});
  const [classColor, setClassColor] = useState("#FFD700");
  const [taskColor, setTaskColor] = useState("#ADD8E6");

  const CLASS_CALENDAR_ID = process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_ID1;
  const TODO_CALENDAR_ID = process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_ID2;

  const loadPreferences = async () => {
    try {
      const storedPrefs = await AsyncStorage.getItem("plannerPreferences");
      if (storedPrefs) {
        console.log("Loaded preferences:", storedPrefs);
        const parsedPrefs = JSON.parse(storedPrefs);
        setClassColor(parsedPrefs.globalClassColor || "#FFD700"); // Global class color
        setTaskColor(parsedPrefs.globalTaskColor || "#ADD8E6"); // Global task color
        
        setPreferences(parsedPrefs[selectedDate] || {});
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const startDate = moment(selectedDate).startOf("day").toISOString();
        const endDate = moment(selectedDate).endOf("day").toISOString();

        console.log(`Fetching events from ${startDate} to ${endDate}`);

        const fetchedClasses = await fetchPublicCalendarEvents(CLASS_CALENDAR_ID, startDate, endDate);
        const fetchedToDoTasks = await fetchPublicCalendarEvents(TODO_CALENDAR_ID, startDate, endDate);

        fetchedClasses.sort((a, b) => new Date(a.start.dateTime) - new Date(b.start.dateTime));
        fetchedToDoTasks.sort((a, b) => new Date(a.start.dateTime) - new Date(b.start.dateTime));

        setClasses(fetchedClasses);
        setToDoTasks(fetchedToDoTasks);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    loadPreferences();
  }, [selectedDate]);
  
  const calculatePosition = (startDateTime, endDateTime) => {
    const startTime = moment(startDateTime);
    const endTime = moment(endDateTime);
    const startHour = startTime.hours() + startTime.minutes() / 60;
    const endHour = endTime.hours() + endTime.minutes() / 60;

    const top = (startHour - 8) * 80 * scale;
    const height = Math.max(50, (endHour - startHour) * 80 * scale);

    return { top, height, displayTime: height > 50 };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="chevron-left" size={26} onPress={() => setCurrentWeekStart(moment(currentWeekStart).subtract(7, "days"))} />
        <View style={styles.headerMiddle}>
          <Text variant="titleLarge" style={styles.headerText}>Planner</Text>
          <Text variant="bodyMedium" style={styles.dateText}>
            {moment(selectedDate).format("MMM DD, YYYY")}
          </Text>
        </View>
        <IconButton icon="chevron-right" size={26} onPress={() => setCurrentWeekStart(moment(currentWeekStart).add(7, "days"))} />
      </View>

      <View style={styles.weekContainer}>
        {Array.from({ length: 7 }, (_, i) => {
          const date = moment(currentWeekStart).add(i, "days").format("YYYY-MM-DD");
          return (
            <TouchableOpacity
              key={date}
              style={[styles.dateButton, selectedDate === date && styles.selectedDate]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={styles.dayText}>{moment(date).format("dd")}</Text>
              <Text style={[styles.dateText, selectedDate === date && styles.selectedDateText]}>
                {moment(date).format("D")}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#862532" style={styles.loadingIndicator} />
      ) : (
        <PinchGestureHandler onGestureEvent={(event) => {
          if (event.nativeEvent.scale > 0.8 && event.nativeEvent.scale < 2) {
            setScale(event.nativeEvent.scale);
          }
        }}>
          <ScrollView
            contentContainerStyle={[styles.scheduleContainer, { height: 1800 * scale }]}
            showsVerticalScrollIndicator={true}
          >
            {Array.from({ length: 15 }, (_, i) => {
              const hour = moment().startOf("day").add(8 + i, "hours").format("h A");
              return (
                <View key={hour} style={[styles.timeSlot, { height: 80 * scale }]}>
                  <Text style={styles.timeText}>{hour}</Text>
                </View>
              );
            })}

            {classes.map((item) => {
              const { top, height, displayTime } = calculatePosition(item.start.dateTime, item.end.dateTime);
              return (
                <Card key={item.id} style={[styles.scheduleCard, { top, height, backgroundColor: classColor }]}>
                  <Card.Content>
                    <Text variant="titleMedium" style={styles.taskText}>{item.title}</Text>
                    {displayTime && (
                      <Text variant="bodySmall">
                        {moment(item.start.dateTime).format("hh:mm A")} - {moment(item.end.dateTime).format("hh:mm A")}
                      </Text>
                    )}
                  </Card.Content>
                </Card>
              );
            })}

            {toDoTasks.map((item) => {
              const { top, height, displayTime } = calculatePosition(item.start.dateTime, item.end.dateTime);
              return (
                <Card key={item.id} style={[styles.scheduleCard, { top, height, backgroundColor: taskColor }]}>
                  <Card.Content>
                    <Text variant="titleMedium" style={styles.taskText}>{item.title}</Text>
                    {displayTime && (
                      <Text variant="bodySmall">
                        {moment(item.start.dateTime).format("hh:mm A")} - {moment(item.end.dateTime).format("hh:mm A")}
                      </Text>
                    )}
                  </Card.Content>
                </Card>
              );
            })}
          </ScrollView>
        </PinchGestureHandler> // not working for now
      )}

      {/* Customize Button */}
      <TouchableOpacity style={styles.customizeButton} onPress={() => setIsCustomizeModalVisible(true)}>
        <Text style={styles.customizeButtonText}>⚙️ Customize</Text>
      </TouchableOpacity>

      <CustomizeModal
        visible={isCustomizeModalVisible}
        onClose={() => setIsCustomizeModalVisible(false)}
        classes={classes}
        toDoTasks={toDoTasks}
        selectedDate={selectedDate}
        onPreferencesSaved={loadPreferences}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    paddingTop: 65, // Avoids overlap with Dynamic Island
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
    borderRadius: 20,
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
    color: "#333", // Ensures text is visible
  },
  customizeButton: { 
    position: "absolute", 
    right: 20, bottom: 40, 
    backgroundColor: "#862532", 
    padding: 12, 
    borderRadius: 25 
  },
  customizeButtonText: { 
    color: "white", 
    fontWeight: "bold" 
  },
});


