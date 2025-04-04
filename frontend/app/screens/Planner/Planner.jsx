import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Text,
  StyleSheet,
  Button,
  SafeAreaView as SafeView,
  Modal,
  Pressable,
} from "react-native";
import { fetchGeminiData } from "./GeminiProcessor";
import { useNavigation } from "@react-navigation/native";
export default function TaskList() {
  const navigation = useNavigation();
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [path, setPath] = useState({});

  const handleSubmit = async () => {
    fetchGeminiData(tasks)
      .then((locations) => {
        // console.log("Locations:", locations);
        if (locations.length > 0) {
          setModalVisible(true);
          setPath(locations);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const addTask = () => {
    if (task.trim() !== "") {
      setTasks([...tasks, task]);
      setTask("");
    }
  };

  const removeTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
  };

  return (
    <SafeView style={styles.container}>
      <Text style={styles.title}>Task List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter a task"
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.taskItem}>
            <Text style={styles.taskText}>{item}</Text>
            <TouchableOpacity onPress={() => removeTask(index)}>
              <Text style={styles.removeButton}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Button title="Submit" onPress={handleSubmit} />
      <Button title="Clear All" onPress={() => setTasks([])} />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View
            style={{
              width: 300,
              height: 200,
              backgroundColor: "white",
              padding: 20,
            }}
          >
            <Text>Route Generated! Want to see your path?</Text>
            <Pressable
              style={{ marginTop: 20, backgroundColor: "#2196F3", padding: 10 }}
              onPress={() => {
                // Handle the action to show the path
                setModalVisible(!modalVisible);
                navigation.navigate("Navigation", { path });
              }}
            >
              <Text style={{ color: "white" }}>Show me the way!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F9F9F9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: "#862532",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  taskText: {
    fontSize: 16,
    color: "#333",
  },
  removeButton: {
    color: "#862532",
    fontWeight: "bold",
  },
});
