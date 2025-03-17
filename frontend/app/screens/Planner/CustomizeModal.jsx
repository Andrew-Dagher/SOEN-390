import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Modal, Text, Switch, Button, IconButton } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CustomizeModal({ visible, onClose, classes = [], toDoTasks = [], selectedDate, onPreferencesSaved }) {
  const [preferences, setPreferences] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [classColor, setClassColor] = useState("#FFD700");
  const [taskColor, setTaskColor] = useState("#ADD8E6");

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const storedPrefs = await AsyncStorage.getItem("plannerPreferences");
        if (storedPrefs) {
          const parsedPrefs = JSON.parse(storedPrefs);
          setPreferences(parsedPrefs[selectedDate] || {});
          setClassColor(parsedPrefs.globalClassColor || "#FFD700");
          setTaskColor(parsedPrefs.globalTaskColor || "#ADD8E6");
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      }
    };

    if (visible) {
      loadPreferences();
    }
  }, [visible, selectedDate]);

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const toggleSkippable = (classItem) => {
    setPreferences((prev) => ({
      ...prev,
      [classItem.id]: {
        title: classItem.title, // Store the course name
        skippable: !prev[classItem.id]?.skippable,
      },
    }));
  };

  const toggleImportant = (taskItem) => {
    setPreferences((prev) => ({
      ...prev,
      [taskItem.id]: {
        title: taskItem.title, // Store the task name
        important: !prev[taskItem.id]?.important,
      },
    }));
  };

  const savePreferences = async () => {
    try {
      const storedPrefs = await AsyncStorage.getItem("plannerPreferences");
      const parsedPrefs = storedPrefs ? JSON.parse(storedPrefs) : {};

      const updatedPrefs = {
        ...parsedPrefs,
        [selectedDate]: { ...(parsedPrefs[selectedDate] || {}), ...preferences },
        globalClassColor: classColor,
        globalTaskColor: taskColor,
      };

      await AsyncStorage.setItem("plannerPreferences", JSON.stringify(updatedPrefs));

      onPreferencesSaved({ classColor, taskColor });

      onClose();
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  return (
    <Modal visible={visible} onDismiss={onClose} contentContainerStyle={styles.modalContainer}>
      <Text style={styles.title}>Customize Planner</Text>
      <ScrollView style={styles.scrollContainer}>

        <Text style={styles.sectionTitle}>Classes</Text>
        {classes.length > 0 ? (
          classes.map((item) => (
            <View key={item.id} style={styles.itemContainer}>
              <TouchableOpacity onPress={() => toggleSection(item.id)} style={styles.sectionToggle}>
                <Text style={[styles.classText, { color: "#666" }]}>{item.title}</Text>
                <IconButton icon={expandedSections[item.id] ? "chevron-up" : "chevron-down"} size={20} />
              </TouchableOpacity>

              {expandedSections[item.id] && (
                <View style={styles.options}>
                  <View style={styles.optionRow}>
                    <Text style={styles.optionTitle}>Skippable:</Text>
                    <Switch
                      value={preferences[item.id]?.skippable || false}
                      onValueChange={() => toggleSkippable(item)}
                    />
                  </View>
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No classes for this day</Text>
        )}

        {/* Global Class Color Picker */}
        <Text style={styles.optionTitle}>Class Color:</Text>
        <View style={styles.colorContainer}>
          {["#FFD700", "#87CEEB", "#90EE90", "#FF6347"].map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color, borderWidth: classColor === color ? 2 : 0 },
              ]}
              onPress={() => setClassColor(color)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>To-Do Tasks</Text>
        {toDoTasks.length > 0 ? (
          toDoTasks.map((item) => (
            <View key={item.id} style={styles.itemContainer}>
              <TouchableOpacity onPress={() => toggleSection(item.id)} style={styles.sectionToggle}>
                <Text style={[styles.classText, { color: "#666" }]}>{item.title}</Text>
                <IconButton icon={expandedSections[item.id] ? "chevron-up" : "chevron-down"} size={20} />
              </TouchableOpacity>

              {expandedSections[item.id] && (
                <View style={styles.options}>
                  <View style={styles.optionRow}>
                    <Text style={styles.optionTitle}>Important:</Text>
                    <Switch
                      value={preferences[item.id]?.important || false}
                      onValueChange={() => toggleImportant(item)}
                    />
                  </View>
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No tasks for this day</Text>
        )}

        <Text style={styles.optionTitle}>To-Do Task Color:</Text>
        <View style={styles.colorContainer}>
          {["#FFB6C1", "#ADD8E6", "#98FB98", "#FFA07A"].map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color, borderWidth: taskColor === color ? 2 : 0 },
              ]}
              onPress={() => setTaskColor(color)}
            />
          ))}
        </View>

      </ScrollView>

      {/* SAVE BUTTON */}
      <Button mode="contained" onPress={savePreferences} style={styles.saveButton}>
        Save Preferences
      </Button>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "#FFF",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  scrollContainer: {
    maxHeight: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#862532",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingBottom: 5,
  },
  itemContainer: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginVertical: 4,
  },
  sectionToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  classText: {
    fontSize: 15,
    fontWeight: "600",
  },
  options: {
    paddingTop: 8,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  colorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 5,
  },
  colorOption: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  saveButton: {
    marginTop: 15,
    backgroundColor: "#862532",
    paddingVertical: 8,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
  },
});
