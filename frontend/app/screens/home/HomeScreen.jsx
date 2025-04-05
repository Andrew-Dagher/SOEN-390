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
import { Coachmark } from "react-native-coachmark";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function HomeScreen() {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [step, setStep] = useState(0);
  const [showCoachmark, setShowCoachmark] = useState(true);

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

  const handleHide = (nextStep) => {
    setShowCoachmark(false);
    setTimeout(() => {
      setStep(nextStep);
      setShowCoachmark(true);
    }, 1000); // Delay to avoid flicker
  };

  return (
    <View style={styles.container}>
      {/* Step 0: Welcome Message */}
      {step === 0 && (
        <View style={styles.coachmarkWrapper}>
          <Coachmark
            message="Hey! Welcome to the step-by-step guide. This is your home screen."
            autoShow
            visible={showCoachmark}
            onHide={() => handleHide(1)}
          >
            <View style={styles.anchorPoint} />
          </Coachmark>
        </View>
      )}

      <HomeHeader name={username} />

      <SafeAreaView style={styles.mainContent}>
        <View style={styles.cardContainer}>
          {/* Step 1: Find Class Coachmark */}
          {step === 1 ? (
            <Coachmark
              message="Tap here to find your next class location on the map!"
              autoShow
              visible={showCoachmark}
              onHide={() => handleHide(2)}
            >
              <TouchableOpacity onPress={() => navigation.navigate("Navigation")}>
                <HomeCard image={MapPic} text="Find your next class" />
              </TouchableOpacity>
            </Coachmark>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate("Navigation")}>
              <HomeCard image={MapPic} text="Find your next class" />
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => navigation.navigate("Calendar")}>
            <HomeCard image={CalendarPic} text="Access your calendar" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  coachmarkWrapper: {
    position: "absolute",
    top: screenHeight * 0.25,
    left: screenWidth * 0.1,
    zIndex: 999,
  },
  anchorPoint: {
    width: 1,
    height: 1,
  },
});