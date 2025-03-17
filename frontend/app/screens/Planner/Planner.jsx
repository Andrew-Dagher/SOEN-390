import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Text, Card, IconButton } from "react-native-paper";
import moment from "moment";

export default function Planner() {
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [currentWeekStart, setCurrentWeekStart] = useState(moment().startOf("week"));
  const [scale, setScale] = useState(1);

  const weekDates = Array.from({ length: 7 }, (_, i) =>
    moment(currentWeekStart).add(i, "days").format("YYYY-MM-DD")
  );

  const schedule = [
    { id: 1, name: "SOEN 363", startTime: "08:00", endTime: "09:00", color: "#D3E4CD" },
    { id: 2, name: "SOEN 345", startTime: "10:00", endTime: "11:00", color: "#D5C6E0" },
    { id: 3, name: "Buy Coffee", startTime: "09:15", endTime: "09:30", color: "#FFE5B4" },
    { id: 4, name: "Pick Up Notes", startTime: "14:15", endTime: "14:30", color: "#FFC3A0" },
  ];

  const changeWeek = (direction) => {
    setCurrentWeekStart(moment(currentWeekStart).add(direction * 7, "days"));
  };

  const calculatePosition = (start, end) => {
    const startTime = moment(start, "HH:mm");
    const endTime = moment(end, "HH:mm");
    const height = Math.max(50, (endTime.diff(startTime, "minutes") / 60) * 80) * scale;

    return {
      top: ((startTime.hours() - 8) * 80 + startTime.minutes()) * scale,
      height,
      displayTime: height > 50,
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="chevron-left" size={26} onPress={() => changeWeek(-1)} />
        <View style={styles.headerMiddle}>
          <Text variant="titleLarge" style={styles.headerText}>Planner</Text>
          <Text variant="bodyMedium" style={styles.dateText}>
            {moment(selectedDate).format("MMM DD, YYYY")}
          </Text>
        </View>
        <IconButton icon="chevron-right" size={26} onPress={() => changeWeek(1)} />
      </View>

      <View style={styles.weekContainer}>
        {weekDates.map((date) => (
          <TouchableOpacity
            key={date}
            style={[styles.dateButton, selectedDate === date && styles.selectedDate]}
            onPress={() => setSelectedDate(date)}
          >
            <Text style={styles.dayText}>{moment(date).format("dd")}</Text>
            <Text style={styles.dateText}>{moment(date).format("D")}</Text>
          </TouchableOpacity>
        ))}
      </View>

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

          {schedule.map((item) => {
            const { top, height, displayTime } = calculatePosition(item.startTime, item.endTime);
            return (
              <Card key={item.id} style={[styles.scheduleCard, { top, height, backgroundColor: item.color }]}>
                <Card.Content>
                  <Text variant="titleMedium" style={styles.taskText}>{item.name}</Text>
                  {displayTime && <Text variant="bodySmall">{`${item.startTime} - ${item.endTime}`}</Text>}
                </Card.Content>
              </Card>
            );
          })}
        </ScrollView>
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
});
