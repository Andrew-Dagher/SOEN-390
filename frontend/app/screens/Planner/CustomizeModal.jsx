import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Modal, Text, Switch, Button, IconButton } from "react-native-paper";

/**
 * CustomizeModal
 * 
 * @param {boolean} visible
 * @param {() => void} onClose
 * @param {Array} classes
 * @param {Array} toDoTasks
 * @param {string} selectedDate
 * @param {Object} datePreferences
 * @param {string} initialClassColor
 * @param {string} initialTaskColor
 * @param {(localPrefs, classColor, taskColor) => void} onSavePreferences
 */
export default function CustomizeModal({
  visible,
  onClose,
  classes = [],
  toDoTasks = [],
  selectedDate,
  datePreferences = {},
  initialClassColor = "#FFD700",
  initialTaskColor = "#ADD8E6",
  onSavePreferences,
}) {

  const [localPrefs, setLocalPrefs] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [classColor, setClassColor] = useState(initialClassColor);
  const [taskColor, setTaskColor] = useState(initialTaskColor);

  useEffect(() => {
    if (visible) {
      setLocalPrefs(datePreferences);
      setClassColor(initialClassColor);
      setTaskColor(initialTaskColor);
    }
  }, [visible, selectedDate, datePreferences, initialClassColor, initialTaskColor]);

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const toggleSkippable = (classItem) => {
    setLocalPrefs((prev) => ({
      ...prev,
      [classItem.id]: {
        ...prev[classItem.id],
        title: classItem.title,
        skippable: !prev[classItem.id]?.skippable,
      },
    }));
  };

  const toggleImportant = (taskItem) => {
    setLocalPrefs((prev) => ({
      ...prev,
      [taskItem.id]: {
        ...prev[taskItem.id],
        title: taskItem.title,
        important: !prev[taskItem.id]?.important,
      },
    }));
  };

  const handleSavePreferences = () => {
    onSavePreferences(localPrefs, classColor, taskColor);
    onClose();
  };

  return (
    <Modal visible={visible} onDismiss={onClose} contentContainerStyle={styles.modalContainer}>
      <Text style={styles.title}>Customize Planner</Text>
      <ScrollView style={styles.scrollContainer}>

        <Text style={styles.sectionTitle}>Classes</Text>
        {classes.length > 0 ? (
          classes.map((item) => (
            <View key={item.id} style={styles.itemContainer}>
              <TouchableOpacity
                onPress={() => toggleSection(item.id)}
                style={styles.sectionToggle}
              >
                <Text style={[styles.classText, { color: "#666" }]}>{item.title}</Text>
                <IconButton
                  icon={expandedSections[item.id] ? "chevron-up" : "chevron-down"}
                  size={20}
                />
              </TouchableOpacity>

              {expandedSections[item.id] && (
                <View style={styles.options}>
                  <View style={styles.optionRow}>
                    <Text style={styles.optionTitle}>Skippable:</Text>
                    <Switch
                      value={!!localPrefs[item.id]?.skippable}
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

        <Text style={styles.optionTitle}>Class Color:</Text>
        <View style={styles.colorContainer}>
          {["#FFD6E0", "#FFEFCF", "#D1F0FF"].map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                {
                  backgroundColor: color,
                  borderWidth: classColor === color ? 2 : 0,
                },
              ]}
              onPress={() => setClassColor(color)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>To-Do Tasks</Text>
        {toDoTasks.length > 0 ? (
          toDoTasks.map((item) => (
            <View key={item.id} style={styles.itemContainer}>
              <TouchableOpacity
                onPress={() => toggleSection(item.id)}
                style={styles.sectionToggle}
              >
                <Text style={[styles.classText, { color: "#666" }]}>{item.title}</Text>
                <IconButton
                  icon={expandedSections[item.id] ? "chevron-up" : "chevron-down"}
                  size={20}
                />
              </TouchableOpacity>

              {expandedSections[item.id] && (
                <View style={styles.options}>
                  <View style={styles.optionRow}>
                    <Text style={styles.optionTitle}>Important:</Text>
                    <Switch
                      value={!!localPrefs[item.id]?.important}
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
          {["#D9F2D9", "#E2D9F2", "#FFE4CA"].map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                {
                  backgroundColor: color,
                  borderWidth: taskColor === color ? 2 : 0,
                },
              ]}
              onPress={() => setTaskColor(color)}
            />
          ))}
        </View>

      </ScrollView>

      <Button
        mode="contained"
        onPress={handleSavePreferences}
        style={styles.saveButton}
      >
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
