/**
 * @file BottomNavBar.jsx
 * @description Renders the bottom navigation bar with four navigation options: Home, Navigation, Calendar, and Settings.
 * The component uses React Navigation's hooks to determine the current route and display the corresponding active or inactive icon.
 */

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

/**
 * BottomNavBar component renders a fixed bottom navigation bar with four navigation options.
 *
 * @component
 * @returns {JSX.Element} The rendered bottom navigation bar.
 */
export default function BottomNavBar() {
  // Hook to access the navigation object for screen transitions.
  const navigation = useNavigation();
  // Hook to access the current route, used to determine which icon is active.
  const route = useRoute();

  return (
    <View testID="bottom-nav" style={styles.container}>
      {/* Home Button: Navigate to Home screen */}
      <Pressable onPress={() => navigation.navigate("Home")}>
        {route.name === "Home" ? <HomeActive /> : <HomeInactive />}
      </Pressable>

      {/* Navigation Button: Navigate to Navigation screen */}
      <Pressable onPress={() => navigation.navigate("Navigation")}>
        {route.name === "Navigation" ? (
          <NavigationActive />
        ) : (
          <NavigationInactive />
        )}
      </Pressable>

      {/* Calendar Button: Navigate to Calendar screen */}
      <Pressable onPress={() => navigation.navigate("Calendar")}>
        {route.name === "Calendar" ? <CalendarActive /> : <CalendarInactive />}
      </Pressable>

      {/* Settings Button: Navigate to Settings screen */}
      <Pressable onPress={() => navigation.navigate("Settings")}>
        {route.name === "Settings" ? <SettingsActive /> : <SettingsInactive />}
      </Pressable>
    </View>
  );
}

// Styles for the BottomNavBar component.
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",           // Arrange buttons in a row.
    justifyContent: "space-around", // Distribute space evenly around the buttons.
    alignItems: "center",           // Center items vertically.
    height: 60,                     // Fixed height for the navigation bar.
    backgroundColor: "#FFFFFF",     // White background.
    borderTopWidth: 1,              // Top border width.
    borderTopColor: "#d6d6d6",        // Light gray border color.
    paddingBottom: 15,              // Padding at the bottom to provide spacing.
  },
});
