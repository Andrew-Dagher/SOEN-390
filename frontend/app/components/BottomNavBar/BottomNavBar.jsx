import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import HomeActive from "./HomeIcons/HomeActive";
import HomeInactive from "./HomeIcons/HomeInactive";
import CalendarActive from "./CalendarIcons/CalendarActive";
import CalendarInactive from "./CalendarIcons/CalendarInactive";
import NavigationActive from "./NavigationIcons/NavigationActive";
import NavigationInactive from "./NavigationIcons/NavigationInactive";
import SettingsActive from "./SettingsIcons/SettingsActive";
import SettingsInactive from "./SettingsIcons/SettingsInactive";

export default function BottomNavBar() {
  const navigation = useNavigation();
  const route = useRoute();

  return (
    <View testID="bottom-nav" style={styles.container}>
      <Pressable onPress={() => navigation.navigate("Home")}>
        {route.name === "Home" ? <HomeActive /> : <HomeInactive />}
      </Pressable>

      <Pressable onPress={() => navigation.navigate("Navigation")}>
        {route.name === "Navigation" ? (
          <NavigationActive />
        ) : (
          <NavigationInactive />
        )}
      </Pressable>

      <Pressable onPress={() => navigation.navigate("Calendar")}>
        {route.name === "Calendar" ? <CalendarActive /> : <CalendarInactive />}
      </Pressable>

      <Pressable onPress={() => navigation.navigate("Settings")}>
        {route.name === "Settings" ? <SettingsActive /> : <SettingsInactive />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#d6d6d6",
  },
});
