import React, { memo } from "react";
import { View, Pressable, StyleSheet, Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import HomeActive from "./HomeIcons/HomeActive";
import HomeInactive from "./HomeIcons/HomeInactive";
import CalendarActive from "./CalendarIcons/CalendarActive";
import CalendarInactive from "./CalendarIcons/CalendarInactive";
import NavigationActive from "./NavigationIcons/NavigationActive";
import NavigationInactive from "./NavigationIcons/NavigationInactive";
import SettingsActive from "./SettingsIcons/SettingsActive";
import SettingsInactive from "./SettingsIcons/SettingsInactive";

// Memoized individual tab button component
const TabButton = memo(
  ({ name, isActive, onPress, ActiveIcon, InactiveIcon }) => {
    return (
      <Pressable
        onPress={onPress}
        style={styles.button}
        testID={`${name.toLowerCase()}-tab`}
        android_ripple={{
          color: "rgba(0, 0, 0, 0.1)",
          borderless: true,
        }}
      >
        {isActive ? <ActiveIcon /> : <InactiveIcon />}
      </Pressable>
    );
  }
);

TabButton.displayName = "TabButton";

// Main navigation bar component
const BottomNavBar = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Define tab configuration
  const tabs = [
    {
      name: "Home",
      ActiveIcon: HomeActive,
      InactiveIcon: HomeInactive,
    },
    {
      name: "Navigation",
      ActiveIcon: NavigationActive,
      InactiveIcon: NavigationInactive,
    },
    {
      name: "Calendar",
      ActiveIcon: CalendarActive,
      InactiveIcon: CalendarInactive,
    },
    {
      name: "Settings",
      ActiveIcon: SettingsActive,
      InactiveIcon: SettingsInactive,
    },
  ];

  return (
    <View testID="bottom-nav" style={styles.container}>
      {tabs.map((tab) => (
        <TabButton
          key={tab.name}
          name={tab.name}
          isActive={route.name === tab.name}
          onPress={() => navigation.navigate(tab.name)}
          ActiveIcon={tab.ActiveIcon}
          InactiveIcon={tab.InactiveIcon}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: Platform.OS === "ios" ? 68 : 60,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#d6d6d6",
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
  },
  button: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
});

export default memo(BottomNavBar);
