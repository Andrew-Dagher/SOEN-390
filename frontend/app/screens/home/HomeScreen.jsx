import React from "react";
import { View, Text, Button } from "react-native";
import BottomNavBar from "../../components/BottomNavBar/BottomNavBar";
import HomeHeader from "../../components/Homescreen/HomeHeader/HomeHeader";
import HomeCard from "../../components/Homescreen/HomeCard/HomeCard";
import MapPic from "../../../assets/MapScreenshot.png";
import CalendarPic from "../../../assets/CalendarScreenshot.png";
export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <HomeHeader />
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
