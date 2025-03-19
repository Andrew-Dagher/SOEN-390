import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Text, Card, IconButton, ActivityIndicator } from "react-native-paper";
import { PinchGestureHandler } from "react-native-gesture-handler";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { fetchPublicCalendarEvents } from "../login/LoginHelper";
import CustomizeModal from "./CustomizeModal";

export default function Planner() {
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [currentWeekStart, setCurrentWeekStart] = useState(moment().startOf("week"));
  const [scale, setScale] = useState(1);

  const [classes, setClasses] = useState([]);
  const [toDoTasks, setToDoTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planning, setPlanning] = useState(false);

  const [allPreferences, setAllPreferences] = useState({});
  const [classColor, setClassColor] = useState("#DCEDC8");
  const [taskColor, setTaskColor] = useState("#F0D9E2");

  const [isCustomizeModalVisible, setIsCustomizeModalVisible] = useState(false);

  const CLASS_CALENDAR_ID = process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_ID1;
  const TODO_CALENDAR_ID = process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_ID2;
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  useEffect(() => {
    (async () => {
      try {
        const storedPrefs = await AsyncStorage.getItem("plannerPreferences");
        if (storedPrefs) {
          const parsedPrefs = JSON.parse(storedPrefs) || {};
          setAllPreferences(parsedPrefs);
          if (parsedPrefs.globalClassColor) setClassColor(parsedPrefs.globalClassColor);
          if (parsedPrefs.globalTaskColor) setTaskColor(parsedPrefs.globalTaskColor);
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      }
    })();
  }, []);

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

  const handleSavePreferences = async (datePrefs, newClassColor, newTaskColor) => {
    try {
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
      console.log("Updated prefs in Planner:", JSON.stringify(updated, null, 2));
    } catch (error) {
      console.error("Error saving preferences in Planner:", error);
    }
  };

  const calculatePosition = (startDateTime, endDateTime) => {
    const startTime = moment(startDateTime);
    const endTime = moment(endDateTime);
    const startHour = startTime.hours() + startTime.minutes() / 60;
    const endHour = endTime.hours() + endTime.minutes() / 60;
    const top = (startHour - 8) * 80 * scale;
    const height = Math.max(50, (endHour - startHour) * 80 * scale);
    return { top, height, displayTime: height > 50 };
  };

  const extractLocation = (description) => {
    if (!description) return "Unknown Location";
    const match = description.match(/<pre>(.*?)<\/pre>/);
    return match ? match[1] : description;
  };

  const handlePlan = async () => {
    if (planning) return;
    setPlanning(true);
    const datePrefs = allPreferences[selectedDate] || {};

    const scheduleData = {
      classes: classes.map((item) => {
        const prefs = (allPreferences[selectedDate] || {})[item.id] || {};
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
          geminiText = geminiText.split("\n").filter(line => line.trim().startsWith("{")).join("\n");
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
                dateTime: moment(`${selectedDate} ${t.start_time}`, "YYYY-MM-DD HH:mm").toISOString(),
              },
              end: {
                dateTime: moment(`${selectedDate} ${t.end_time}`, "YYYY-MM-DD HH:mm").toISOString(),
              },
            }));
            setToDoTasks(updatedTasks);
            console.log("Updated tasks with Gemini result:", updatedTasks);
          }
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="chevron-left"
          size={26}
          onPress={() =>
            setCurrentWeekStart(moment(currentWeekStart).subtract(7, "days"))
          }
        />
        <View style={styles.headerMiddle}>
          <Text variant="titleLarge" style={styles.headerText}>Planner</Text>
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

      <View style={styles.weekContainer}>
        {Array.from({ length: 7 }, (_, i) => {
          const date = moment(currentWeekStart).add(i, "days").format("YYYY-MM-DD");
          return (
            <TouchableOpacity
              key={date}
              style={[styles.dateButton, selectedDate === date && styles.selectedDate]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[styles.dayText, selectedDate === date && styles.selectedDateText]}>
                {moment(date).format("dd")}
              </Text>
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
        <PinchGestureHandler
          onGestureEvent={(event) => {
            if (event.nativeEvent.scale > 0.8 && event.nativeEvent.scale < 2) {
              setScale(event.nativeEvent.scale);
            }
          }}
        >
          <ScrollView
            contentContainerStyle={[styles.scheduleContainer, { height: 1800 * scale }]}
            showsVerticalScrollIndicator
          >
            {Array.from({ length: 15 }, (_, i) => {
              const hourLabel = moment().startOf("day").add(8 + i, "hours").format("h A");
              return (
                <View key={hourLabel} style={[styles.timeSlot, { height: 80 * scale }]}>
                  <Text style={styles.timeText}>{hourLabel}</Text>
                </View>
              );
            })}

            {classes.map((item) => {
              const prefs = (allPreferences[selectedDate] || {})[item.id] || {};
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

            {toDoTasks.map((item, index) => {
              const { top, height, displayTime } = calculatePosition(
                item.start.dateTime,
                item.end.dateTime
              );
              return (
                <Card
                  key={`task-${index}`}
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

      <TouchableOpacity
        style={styles.customizeButton}
        onPress={() => setIsCustomizeModalVisible(true)}
      >
        <Text style={styles.buttonText}>⚙️ Customize</Text>
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
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#862532",
    padding: 15,
    borderRadius: 25,
  },
  customizeButton: {
    position: "absolute",
    right: 20,
    bottom: 40,
    backgroundColor: "#862532",
    padding: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
