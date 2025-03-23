/**
 * @file BottomNavBar.jsx
 * @description A fixed bottom navigation bar with five navigation options: Home, Navigation, Calendar, Library, and Settings.
 * The component conditionally uses React Navigation's hooks and handles cases when not in a navigation context.
 */

import React from "react";
import {
  View,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Platform,
} from "react-native";
import PropTypes from "prop-types";
import HomeActive from "./HomeIcons/HomeActive";
import HomeInactive from "./HomeIcons/HomeInactive";
import CalendarActive from "./CalendarIcons/CalendarActive";
import CalendarInactive from "./CalendarIcons/CalendarInactive";
import NavigationActive from "./NavigationIcons/NavigationActive";
import NavigationInactive from "./NavigationIcons/NavigationInactive";
import SettingsActive from "./SettingsIcons/SettingsActive";
import SettingsInactive from "./SettingsIcons/SettingsInactive";
import PlannerActive from "./PlannerIcons/PlannerActive";
import PlannerInactive from "./PlannerIcons/PlannerInactive";

/**
 * BottomNavBar component renders a fixed bottom navigation bar with navigation options.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Optional navigation object passed from parent
 * @param {Object} props.route - Optional route object passed from parent
 * @returns {JSX.Element} The rendered bottom navigation bar.
 */
export default function BottomNavBar({ navigation = null, route = null }) {
  // This component can now be used both inside and outside a navigation context

  // Determine current screen - default to empty if route is not provided
  const currentScreen = route?.name || "";

  // Safe navigation function that checks if navigation exists before using it
  const navigateTo = (screenName) => {
    if (navigation) {
      // Only navigate if we're not already on that screen
      if (currentScreen !== screenName) {
        navigation.navigate(screenName);
      }
    } else {
      console.warn("Navigation is not available in this context");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View testID="bottom-nav" style={styles.navbarContent}>
        {/* Home Button: Navigate to Home screen */}
        <Pressable onPress={() => navigateTo("Home")} style={styles.navButton}>
          {currentScreen === "Home" ? <HomeActive /> : <HomeInactive />}
        </Pressable>

        {/* Navigation Button: Navigate to Navigation screen */}
        <Pressable
          onPress={() => navigateTo("Navigation")}
          style={styles.navButton}
        >
          {currentScreen === "Navigation" ? (
            <NavigationActive />
          ) : (
            <NavigationInactive />
          )}
        </Pressable>

        {/* Calendar Button: Navigate to Calendar screen */}
        <Pressable
          onPress={() => navigateTo("Calendar")}
          style={styles.navButton}
        >
          {currentScreen === "Calendar" ? (
            <CalendarActive />
          ) : (
            <CalendarInactive />
          )}
        </Pressable>

        {/* Planner Button: Navigate to Planner screen */}
        <Pressable
          onPress={() => navigateTo("Planner")}
          style={styles.navButton}
        >
          {currentScreen === "Planner" ? (
            <PlannerActive />
          ) : (
            <PlannerInactive />
          )}
        </Pressable>

        {/* Settings Button: Navigate to Settings screen */}
        <Pressable
          onPress={() => navigateTo("Settings")}
          style={styles.navButton}
        >
          {currentScreen === "Settings" ? (
            <SettingsActive />
          ) : (
            <SettingsInactive />
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// PropTypes validation for the BottomNavBar component
BottomNavBar.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }),
  route: PropTypes.shape({
    name: PropTypes.string,
  }),
};

// Styles for the BottomNavBar component
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  navbarContent: {
    flexDirection: "row", // Arrange buttons in a row
    justifyContent: "space-evenly", // Changed from space-around to space-evenly for more balanced spacing
    alignItems: "center", // Center items vertically
    height: 50, // Reduced height for the navigation bar
    backgroundColor: "#FFFFFF", // White background
    borderTopWidth: 1, // Top border width
    borderTopColor: "#d6d6d6", // Light gray border color
    paddingHorizontal: 6, // Added horizontal padding to bring icons closer to edges
    paddingTop: 4, // Reduced padding at the top
    marginBottom: Platform.OS === "android" ? 0 : -18,
  },
  navButton: {
    flex: 0, // Changed from flex: 1 to flex: 0 to avoid equal spacing
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
    paddingVertical: 6, // Vertical padding for touch area
    paddingHorizontal: 8, // Reduced horizontal padding to bring icons closer
    minWidth: 40, // Set minimum width to ensure touch target
  },
});
