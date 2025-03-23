import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Text, Card, IconButton, ActivityIndicator } from "react-native-paper";
import { PinchGestureHandler } from "react-native-gesture-handler";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

import { fetchPublicCalendarEvents } from "../login/LoginHelper";
import CustomizeModal from "./CustomizeModal";

export default function Planner() {
  // Date & Layout
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

  // Week Events (for indicator dots)
  const [weekEvents, setWeekEvents] = useState({});

  // Preferences (Single source of truth)
  const [allPreferences, setAllPreferences] = useState({});
  const [classColor, setClassColor] = useState("#FFBCBC"); // Light salmon color like in the image
  const [taskColor, setTaskColor] = useState("#AEE1FC"); // Light blue
  const [thirdColor, setThirdColor] = useState("#C8F7D6"); // Light green for third event type

  // Modal Visibility
  const [isCustomizeModalVisible, setIsCustomizeModalVisible] = useState(false);

  // Environment Calendar IDs
  const CLASS_CALENDAR_ID = process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_ID1;
  const TODO_CALENDAR_ID = process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_ID2;

  // Load preferences from AsyncStorage (once on mount)
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

  // Fetch events for the entire week to show indicator dots
  useEffect(() => {
    const fetchWeekEvents = async () => {
      try {
        const startDate = moment(currentWeekStart).toISOString();
        const endDate = moment(currentWeekStart)
          .add(6, "days")
          .endOf("day")
          .toISOString();

        const weekClasses = await fetchPublicCalendarEvents(
          CLASS_CALENDAR_ID,
          startDate,
          endDate
        );
        const weekTasks = await fetchPublicCalendarEvents(
          TODO_CALENDAR_ID,
          startDate,
          endDate
        );

        // Organize events by date
        const eventsByDate = {};

        weekClasses.forEach((event) => {
          const date = moment(event.start.dateTime).format("YYYY-MM-DD");
          if (!eventsByDate[date]) {
            eventsByDate[date] = {
              hasClass: false,
              hasTask: false,
              hasThird: false,
            };
          }
          eventsByDate[date].hasClass = true;
        });

        weekTasks.forEach((event) => {
          const date = moment(event.start.dateTime).format("YYYY-MM-DD");
          if (!eventsByDate[date]) {
            eventsByDate[date] = {
              hasClass: false,
              hasTask: false,
              hasThird: false,
            };
          }
          eventsByDate[date].hasTask = true;
        });

        // Just for demo, randomly assign a third type of event to some days
        // In a real app, you'd fetch this from a third calendar or category
        Object.keys(eventsByDate).forEach((date) => {
          if (Math.random() > 0.7) {
            eventsByDate[date].hasThird = true;
          }
        });

        setWeekEvents(eventsByDate);
      } catch (error) {
        console.error("Error fetching week events:", error);
      }
    };

    fetchWeekEvents();
  }, [currentWeekStart]);

  // Fetch events whenever selectedDate changes
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

        // Sort events by start time
        fetchedClasses.sort(
          (a, b) => new Date(a.start.dateTime) - new Date(b.start.dateTime)
        );
        fetchedToDoTasks.sort(
          (a, b) => new Date(a.start.dateTime) - new Date(b.start.dateTime)
        );

        setClasses(fetchedClasses);
        setToDoTasks(fetchedToDoTasks);

        console.log("Fetched classes:", fetchedClasses);
        console.log("Fetched to-do tasks:", fetchedToDoTasks);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedDate]);

  // Merge and save preferences (make sure we don't create nested keys)
  const handleSavePreferences = async (
    datePrefs,
    newClassColor,
    newTaskColor
  ) => {
    try {
      // Replace the date's preferences rather than merging nested objects
      const updated = {
        ...allPreferences,
        [selectedDate]: {
          ...datePrefs,
        },
        globalClassColor: newClassColor,
        globalTaskColor: newTaskColor,
      };

      setAllPreferences(updated);
      setClassColor(newClassColor);
      setTaskColor(newTaskColor);

      await AsyncStorage.setItem("plannerPreferences", JSON.stringify(updated));
      console.log(
        "Updated prefs in Planner:",
        JSON.stringify(updated, null, 2)
      );
    } catch (error) {
      console.error("Error saving preferences in Planner:", error);
    }
  };

  // Calculate the top and height of each event for the schedule view
  const calculatePosition = (startDateTime, endDateTime) => {
    const startTime = moment(startDateTime);
    const endTime = moment(endDateTime);
    const startHour = startTime.hours() + startTime.minutes() / 60;
    const endHour = endTime.hours() + endTime.minutes() / 60;
    const top = (startHour - 8) * 60 * scale; // Adjusted for 30-minute intervals (60px per hour)
    const height = Math.max(40, (endHour - startHour) * 60 * scale);
    return { top, height, displayTime: height > 40 };
  };

  // Helper to extract location from event description
  const extractLocation = (description) => {
    if (!description) return "Unknown Location";
    const match = description.match(/<pre>(.*?)<\/pre>/);
    return match ? match[1] : description;
  };

  // Format time display for events
  const formatEventTime = (startTime, endTime) => {
    return `${moment(startTime).format("HH:mm")} - ${moment(endTime).format(
      "HH:mm"
    )}`;
  };

  // Handle planning (send data to Gemini and update calendar with optimized schedule)
  const handlePlan = async () => {
    if (planning) return;
    setPlanning(true);
    const datePrefs = allPreferences[selectedDate] || {};

    // Build schedule data (invert skippable if needed, adjust according to your logic)
    const scheduleData = {
      classes: classes.map((item) => {
        // Retrieve the preferences for this class on the selected date
        const prefs = (allPreferences[selectedDate] || {})[item.id] || {};
        // Use grey background for skippable classes in the UI; for Gemini, we can send the actual value.
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
        important: !!(allPreferences[selectedDate] || {})[item.id]?.important,
      })),
    };

    console.log("schedule Data:", JSON.stringify(scheduleData, null, 2));

    // Gemini prompt with explicit formatting instructions
    const geminiPrompt = `
Optimize the following schedule to minimize walking distance between locations.

Constraints and Guidelines:
1. Classes (fixed):
   - Cannot be moved from their scheduled times.
   - Each class has an "id", "name", "location", "start_time", "end_time", and a "skippable" flag.
   - If a class is marked "skippable", tasks may overlap it.
   - If a class is not skippable, no tasks may overlap its time.

2. Tasks (flexible):
   - Each task has an "id", "name", "location", "start_time", "end_time", and an "important" flag.
   - Tasks can be rescheduled if it helps minimize walking distance.
   - If a task is "important", keep it at the same time or schedule it as early as possible.
   - Under no circumstance should a task overlap with a class that is not skippable.

3. Minimize walking distance by scheduling tasks as close as possible to the locations of adjacent classes.

**EVENTS SHOULD NOT CHANGE DURATION**
Return the optimized schedule in valid JSON exactly as follows:

{
  "classes": [
    {
      "id": "<event id>",
      "name": "<class name>",
      "location": "<location>",
      "start_time": "HH:mm",
      "end_time": "HH:mm",
      "skippable": <true/false>
    },
    ...
  ],
  "tasks": [
    {
      "id": "<event id>",
      "name": "<task name>",
      "location": "<location>",
      "start_time": "HH:mm",
      "end_time": "HH:mm",
      "important": <true/false>
    },
    ...
  ]
}

Here is the schedule data:
${JSON.stringify(scheduleData)}
`.trim();

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: geminiPrompt }],
        },
      ],
    };

    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-002:generateContent?key=${apiKey}`;

    console.log("what is sent to gemini:\n", geminiPrompt);

    try {
      const res = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = await res.json();
      console.log("Gemini Raw Response:", JSON.stringify(data, null, 2));

      if (data?.candidates?.length > 0) {
        let geminiText = data.candidates[0].content.parts[0].text;
        const regex = /```json\s*([\s\S]*?)\s*```/;
        const match = regex.exec(geminiText);
        if (match && match[1]) {
          geminiText = match[1].trim();
        } else {
          geminiText = geminiText
            .split("\n")
            .filter((line) => line.trim().startsWith("{"))
            .join("\n");
        }
        console.log("Gemini Optimized Text:", geminiText);

        try {
          const optimizedSchedule = JSON.parse(geminiText);
          if (optimizedSchedule.tasks) {
            const updatedTasks = optimizedSchedule.tasks.map((t) => ({
              id: t.id,
              title: t.name,
              description: `Location: ${t.location}`,
              start: {
                dateTime: moment(
                  `${selectedDate} ${t.start_time}`,
                  "YYYY-MM-DD HH:mm"
                ).toISOString(),
              },
              end: {
                dateTime: moment(
                  `${selectedDate} ${t.end_time}`,
                  "YYYY-MM-DD HH:mm"
                ).toISOString(),
              },
            }));
            setToDoTasks(updatedTasks);
            console.log("Updated tasks with Gemini result:", updatedTasks);
          }
          // Optionally, update classes if optimizedSchedule.classes is provided.
        } catch (parseErr) {
          console.error("Error parsing Gemini JSON output:", parseErr);
        }
      } else {
        console.warn("No candidates returned from Gemini.");
      }
    } catch (error) {
      console.error("Error calling Gemini:", error);
    } finally {
      setPlanning(false);
    }
  };

  // Get current month and year
  const currentMonthYear = moment(selectedDate).format("MMMM YYYY");

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeftContainer}>
          <IconButton
            icon="chevron-left"
            size={24}
            onPress={() =>
              setCurrentWeekStart(moment(currentWeekStart).subtract(7, "days"))
            }
          />
        </View>
        <View style={styles.headerMiddle}>
          <Text variant="titleLarge" style={styles.headerTitle}>
            My Planner
          </Text>
          <Text variant="bodyMedium" style={styles.headerMonth}>
            {currentMonthYear}
          </Text>
        </View>
        <View style={styles.headerRightContainer}>
          <IconButton
            icon="dots-vertical"
            size={24}
            onPress={() => setIsCustomizeModalVisible(true)}
          />
          <IconButton
            icon="chevron-right"
            size={24}
            onPress={() =>
              setCurrentWeekStart(moment(currentWeekStart).add(7, "days"))
            }
          />
        </View>
      </View>

      {/* WEEK SELECTOR */}
      <View style={styles.weekContainer}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName, i) => {
          const date = moment(currentWeekStart)
            .add(i, "days")
            .format("YYYY-MM-DD");
          const isSelected = selectedDate === date;
          const dateEvents = weekEvents[date] || {
            hasClass: false,
            hasTask: false,
            hasThird: false,
          };
          const dayNumber = moment(date).format("D");

          // Week Selector section for the calendar
          // In the return statement inside the map function:

          return (
            <TouchableOpacity
              key={date}
              style={[styles.dateButton, isSelected && styles.selectedDate]}
              onPress={() => setSelectedDate(date)}
            >
              <Text
                style={[
                  styles.dayNameText,
                  isSelected && styles.selectedDateText,
                ]}
              >
                {dayName}
              </Text>
              <Text
                style={[
                  styles.dayNumberText,
                  // Apply selected text styling first if selected
                  // (this will override any other styling)
                  isSelected
                    ? styles.selectedDateText
                    : // Only apply current day styling if not selected
                      moment(date).isSame(moment(), "day") &&
                      styles.currentDayText,
                ]}
              >
                {dayNumber}
              </Text>

              {/* Event indicator dots */}
              {(dateEvents.hasClass ||
                dateEvents.hasTask ||
                dateEvents.hasThird) && (
                <View style={styles.indicatorContainer}>
                  {dateEvents.hasClass && (
                    <View
                      style={[
                        styles.eventIndicator,
                        // Use white dots for selected day, otherwise use class color
                        {
                          backgroundColor: isSelected ? "#FFFFFF" : classColor,
                        },
                      ]}
                    />
                  )}
                  {dateEvents.hasTask && (
                    <View
                      style={[
                        styles.eventIndicator,
                        // Use white dots for selected day, otherwise use task color
                        { backgroundColor: isSelected ? "#FFFFFF" : taskColor },
                      ]}
                    />
                  )}
                  {dateEvents.hasThird && (
                    <View
                      style={[
                        styles.eventIndicator,
                        // Use white dots for selected day, otherwise use third color
                        {
                          backgroundColor: isSelected ? "#FFFFFF" : thirdColor,
                        },
                      ]}
                    />
                  )}
                </View>
              )}
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
            {/* Time slots - every 30 minutes from 8:00 to 22:00 */}
            {Array.from({ length: 30 }, (_, i) => {
              const minutes = i * 30;
              const hours = Math.floor(minutes / 60) + 8;
              const mins = minutes % 60;
              const timeLabel = `${hours}:${mins === 0 ? "00" : mins}`;
              const isHour = mins === 0;

              return (
                <View
                  key={timeLabel}
                  style={[
                    styles.timeSlot,
                    { height: 30 * scale },
                    isHour ? styles.hourTimeSlot : styles.halfHourTimeSlot,
                  ]}
                >
                  <Text
                    style={[
                      styles.timeText,
                      isHour ? styles.hourTimeText : styles.halfHourTimeText,
                    ]}
                  >
                    {timeLabel}
                  </Text>
                  <View style={styles.timeSlotLine} />
                </View>
              );
            })}

            {classes.map((item) => {
              // Check the saved preferences for this class on the selected date
              const prefs = (allPreferences[selectedDate] || {})[item.id] || {};
              // If skippable is true, show grey; otherwise, use the global classColor.
              const bgColor = prefs.skippable ? "#D3D3D3" : classColor;
              const { top, height, displayTime } = calculatePosition(
                item.start.dateTime,
                item.end.dateTime
              );
              return (
                <View
                  key={item.id}
                  style={[
                    styles.eventCard,
                    { top, height, backgroundColor: bgColor },
                  ]}
                >
                  {displayTime && (
                    <Text style={styles.eventTime}>
                      {formatEventTime(item.start.dateTime, item.end.dateTime)}
                    </Text>
                  )}
                  <Text style={styles.eventTitle}>{item.title}</Text>
                </View>
              );
            })}

            {toDoTasks.map((item, index) => {
              const { top, height, displayTime } = calculatePosition(
                item.start.dateTime,
                item.end.dateTime
              );
              return (
                <View
                  key={`task-${index}`}
                  style={[
                    styles.eventCard,
                    { top, height, backgroundColor: taskColor },
                  ]}
                >
                  {displayTime && (
                    <Text style={styles.eventTime}>
                      {formatEventTime(item.start.dateTime, item.end.dateTime)}
                    </Text>
                  )}
                  <Text style={styles.eventTitle}>{item.title}</Text>
                </View>
              );
            })}
          </ScrollView>
        </PinchGestureHandler>
      )}

      <TouchableOpacity
        style={styles.planButtonContainer}
        onPress={handlePlan}
        disabled={planning}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#872432", "#9E2A3D"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.planButton}
        >
          {planning ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Feather
                name="calendar"
                size={16}
                color="white"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Plan My Day</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
      <CustomizeModal
        visible={isCustomizeModalVisible}
        onClose={() => setIsCustomizeModalVisible(false)}
        classes={classes}
        toDoTasks={toDoTasks}
        selectedDate={selectedDate}
        datePreferences={allPreferences[selectedDate] || {}}
        initialClassColor={classColor}
        initialTaskColor={taskColor}
        onSavePreferences={handleSavePreferences}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  headerMiddle: {
    alignItems: "center",
    flex: 1,
    position: "absolute",
    left: 0,
    right: 0,
    top: 10,
    bottom: 0,
    paddingHorizontal: 20,
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  headerMonth: {
    fontSize: 16,
    color: "#666666",
  },
  // Week selector styles
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  dateButton: {
    alignItems: "center",
    padding: 8,
    borderRadius: 12,
    width: 48,
  },
  selectedDate: {
    backgroundColor: "#862532",
    shadowColor: "#862532",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  dayNameText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  dayNumberText: {
    fontSize: 18,
    fontWeight: "600",
  },
  currentDayText: {
    color: "#862532",
  },
  selectedDateText: {
    color: "#FFFFFF",
  },

  // Day event indicators styles
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
    height: 6,
  },
  eventIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 1,
  },
  scheduleContainer: {
    position: "relative",
    paddingLeft: 60, // Space for time labels
    paddingRight: 15,
    backgroundColor: "#FBFBFB",
    borderRightWidth: 0.5, // Thinner border
    borderRightColor: "#E8E8E8",
  },
  timeSlot: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    backgroundColor: "#FFFFFF",
  },
  hourTimeSlot: {
    borderTopWidth: 1,
    borderColor: "#EEEEEE",
  },
  halfHourTimeSlot: {
    borderTopWidth: 1,
    borderColor: "#F5F5F5",
    borderStyle: "dashed",
  },
  timeText: {
    position: "absolute",
    left: -55,
    width: 50,
    textAlign: "right",
  },
  hourTimeText: {
    fontSize: 14,
    color: "#333333",
  },
  halfHourTimeText: {
    fontSize: 12,
    color: "#999999",
  },
  timeSlotLine: {
    flex: 1,
    height: 1,
  },
  eventCard: {
    position: "absolute",
    left: 60,
    width: "95%",
    borderRadius: 8,
    padding: 10,
    justifyContent: "center",
    marginLeft: 10,
  },
  eventTime: {
    fontSize: 12,
    color: "#555555",
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  loadingIndicator: {
    marginTop: 40,
  },
  planButtonContainer: {
    position: "absolute",
    bottom: 80,
    right: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.5,
    borderRadius: 10,
  },
  planButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginRight: 8,
  },
});
