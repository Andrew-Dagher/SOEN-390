import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import HomeHeader from "../../components/Homescreen/HomeHeader/HomeHeader";
import HomeCard from "../../components/Homescreen/HomeCard";
import MapPic from "../../../assets/MapScreenshot.png";
import CalendarPic from "../../../assets/CalendarScreenshot.png";
import { useNavigation } from "@react-navigation/native";

// Retrieve screen dimensions for responsive design.
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

/**
 * HomeScreen component renders the main home view.
 * It displays the user's name in the header and provides navigation cards.
 *
 * @component
 * @returns {JSX.Element} The rendered HomeScreen component.
 */
export default function HomeScreen() {
  // Hook to manage navigation between screens.
  const navigation = useNavigation();

  // State to store the user's full name.
  const [username, setUsername] = useState("");

  /**
   * Loads the user data from AsyncStorage when the component mounts.
   * Updates the username state with the full name from the stored user data.
   *
   * @async
   * @function loadUserData
   */
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

  return (
    <View style={styles.container}>
      {/* Header displaying the user's name */}
      <HomeHeader name={username} />
      <SafeAreaView style={styles.mainContent}>
        {/* Container holding navigation cards */}
        <View style={styles.cardContainer}>
          <TouchableOpacity onPress={() => navigation.navigate("Navigation")}>
            <HomeCard image={MapPic} text="Find your next class" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Calendar")}>
            <HomeCard image={CalendarPic} text="Access your calendar" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      {/* Bottom navigation is now rendered in App.js and stays fixed across screens */}
    </View>
  );
}

// Stylesheet for HomeScreen component.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    // Add bottom padding to ensure content doesn't get hidden behind the navbar
    paddingBottom: 60,
  },
  mainContent: {
    flex: 1,
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
});
