import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import BottomNavBar from "../../components/BottomNavBar/BottomNavBar";
import HomeHeader from "../../components/Homescreen/HomeHeader/HomeHeader";
import HomeCard from "../../components/Homescreen/HomeCard";
import MapPic from "../../../assets/MapScreenshot.png";
import CalendarPic from "../../../assets/CalendarScreenshot.png";
import { useNavigation } from "@react-navigation/native";

// Retrieve screen dimensions for responsive design.
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

/**
 * HomeScreen component renders the main home view.
 * It displays the user's name in the header, provides navigation cards,
 * and includes a bottom navigation bar.
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
      {/* Bottom navigation bar */}
      <View style={styles.navBarContainer}>
        <BottomNavBar />
      </View>
    </View>
  );
}

// Stylesheet for HomeScreen component.
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
