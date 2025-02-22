import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Alert,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from "react-native";
import BottomNavBar from "../../components/BottomNavBar/BottomNavBar";
import HomeHeader from "../../components/Homescreen/HomeHeader/HomeHeader";
import HomeCard from "../../components/Homescreen/HomeCard";
import MapPic from "../../../assets/MapScreenshot.png";
import CalendarPic from "../../../assets/CalendarScreenshot.png";
import { useNavigation } from "@react-navigation/native";
import { useTextSize } from "../../TextSizeContext";
import { trackEvent } from "@aptabase/react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function HomeScreen() {
  const navigation = useNavigation();
  const { textSize } = useTextSize();
  const { signOut, isSignedIn } = useAuth();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUser = JSON.parse(storedUserData);
          setUsername(parsedUser.fullName || "User");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    try {
      Alert.alert(
        "Logout",
        "Are you sure you want to log out?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Logout",
            onPress: async () => {
              try {
                await AsyncStorage.removeItem("sessionId");
                await AsyncStorage.removeItem("userData");
                await AsyncStorage.removeItem("guestMode");

                if (isSignedIn) {
                  await signOut();
                }

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
    <View style={styles.container}>
      <HomeHeader name={username} />
      <SafeAreaView style={styles.mainContent}>
        <View style={styles.cardContainer}>
          <HomeCard image={MapPic} text="Find your next class" />
          <HomeCard image={CalendarPic} text="Access your calendar" />
        </View>
      </SafeAreaView>
      <View style={styles.navBarContainer}>
        <BottomNavBar />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mainContent: {
    flex: 1,
    paddingBottom: 60,
  },
  cardContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "column",
    gap: screenHeight * 0.02,
    paddingTop: screenHeight * 0.03,
    paddingHorizontal: screenWidth * 0.05,
  },
  navBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});
