import React, { useEffect, useState } from "react";
import * as Analytics from "expo-firebase-analytics";
import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import BottomNavBar from "../../components/BottomNavBar/BottomNavBar";
import HomeHeader from "../../components/Homescreen/HomeHeader/HomeHeader";
import HomeCard from "../../components/Homescreen/HomeCard";
import MapPic from "../../../assets/MapScreenshot.png";
import CalendarPic from "../../../assets/CalendarScreenshot.png";
import { useNavigation } from "@react-navigation/native";
import { useTextSize } from "../../TextSizeContext";
import { analytics, logEvent } from "../../../firebase.config";

export default function HomeScreen() {
  const navigation = useNavigation();
  useEffect(() => {
    Analytics.logEvent(analytics, "screen_view", {
      screen_name: "HomeScreen"
    });
  }, []);

  const { textSize, setTextSize } = useTextSize(); // Get global text size from context

  // Apply theme colors based on selected mode

  const { signOut, isSignedIn } = useAuth();
  const [username, setUsername] = useState("");

  // Fetch user data from AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUser = JSON.parse(storedUserData);
          console.log("Loaded User Data:", parsedUser);

          // Set the username or full name
          setUsername(parsedUser.fullName || "User");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  // Handle logout and clear storage
  const handleLogout = async () => {
    try {
      // Confirm logout
      Alert.alert(
        "Logout",
        "Are you sure you want to log out?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Logout",
            onPress: async () => {
              try {
                // Clear all stored data
                await AsyncStorage.removeItem("sessionId");
                await AsyncStorage.removeItem("userData");
                await AsyncStorage.removeItem("guestMode");
                console.log("🗑️ Cleared stored session data.");

                // Sign out only if the user is signed in
                if (isSignedIn) {
                  await signOut();
                  console.log("Successfully signed out!");
                }

                // Reset navigation history and navigate to Login screen
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Login" }],
                });
              } catch (error) {
                console.error("Logout Error:", error);
              }
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <HomeHeader name={username} />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 20,
          paddingBottom: 160,
        }}
      >
        <HomeCard image={MapPic} text="Find your next class" />
        <HomeCard image={CalendarPic} text="Access your calendar" />
      </View>
      <BottomNavBar />
    </View>
  );
}
