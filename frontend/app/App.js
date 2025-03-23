/**
 * @file App.jsx
 * @description The root component of the application. Initializes providers for authentication,
 * settings, text size, and analytics, and sets up the navigation stack with the main screens.
 */

import React, { useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Constants from "expo-constants";
import { NavigationContainer } from "@react-navigation/native";
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";

import { AppSettingsProvider } from "./AppSettingsContext";

import Aptabase from "@aptabase/react-native";

// Import global styles.
import "../global.css";

// Import screen components.
import HomeScreen from "./screens/home/HomeScreen";
import CalendarScreen from "./screens/calendar/CalendarScreen";
import NavigationScreen from "./screens/navigation/NavigationScreen";
import LoginScreen from "./screens/login/LoginScreen";
import SettingsScreen from "./screens/settings/settingsScreen";
import BuildingInfoScreen from "./screens/Info/BuildingInfoScreen";

// Import BottomNavBar - now included at the app level
import BottomNavBar from "./components/BottomNavBar/BottomNavBar";
import Planner from "./screens/Planner/Planner";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Import BusService
import busService from "./services/BusService";

// Create a native stack navigator for navigation.
const Stack = createNativeStackNavigator();

// Initialize Aptabase analytics with the provided key.
Aptabase.init(process.env.EXPO_PUBLIC_APTABASE_KEY);

/**
 * App component sets up the application's providers and navigation stack.
 *
 * @component
 * @returns {JSX.Element} The rendered App component.
 */
export default function App() {
  // Start the bus service.
  busService.start();

  // State to track current navigation state
  const [currentRoute, setCurrentRoute] = useState(null);
  const navigationRef = useRef(null);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Wrap the app in ClerkProvider for authentication. */}
      <ClerkProvider
        publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      >
        {/* Ensure Clerk has finished loading */}
        <ClerkLoaded>
          {/* Provide application-wide settings (e.g., color blind mode) */}
          <AppSettingsProvider>
            {/* Set up the navigation container */}
            <NavigationContainer
              ref={navigationRef}
              onStateChange={() => {
                const currentRouteName =
                  navigationRef.current?.getCurrentRoute()?.name;
                setCurrentRoute(currentRouteName);
              }}
            >
              <View style={styles.container}>
                <Stack.Navigator
                  initialRouteName="Login"
                  screenOptions={{ headerShown: false }}
                >
                  {/* Define each screen in the navigation stack */}
                  <Stack.Screen name="Home" component={HomeScreen} />
                  <Stack.Screen name="Calendar" component={CalendarScreen} />
                  <Stack.Screen
                    name="Navigation"
                    component={NavigationScreen}
                  />
                  <Stack.Screen name="Settings" component={SettingsScreen} />
                  <Stack.Screen name="Planner" component={Planner} />
                  <Stack.Screen
                    name="Building Details"
                    component={BuildingInfoScreen}
                  />
                  <Stack.Screen
                    name="Login"
                    options={{ headerShown: false }}
                    component={LoginScreen}
                  />
                </Stack.Navigator>

                {/* Bottom Navigation Bar - with navigation props */}
                {/* Only show navbar if not on Login screen */}
                {currentRoute && currentRoute !== "Login" && (
                  <BottomNavBar
                    navigation={navigationRef.current}
                    route={{ name: currentRoute }}
                  />
                )}
              </View>
            </NavigationContainer>
          </AppSettingsProvider>
        </ClerkLoaded>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
});
