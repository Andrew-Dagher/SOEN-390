/**
 * @file App.jsx
 * @description The root component of the application. Initializes providers for authentication,
 * settings, text size, and analytics, and sets up the navigation stack with the main screens.
 */

import React from "react";
import { Text, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Constants from "expo-constants";
import { NavigationContainer } from "@react-navigation/native";
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";

import { AppSettingsProvider } from './AppSettingsContext';

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
  return (
    // Wrap the app in ClerkProvider for authentication.
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      {/* Ensure Clerk has finished loading */}
      <ClerkLoaded>
        {/* Provide application-wide settings (e.g., color blind mode) */}
        <AppSettingsProvider>
            {/* Set up the navigation container */}
            <NavigationContainer>
              <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{ headerShown: false }}
              >
                {/* Define each screen in the navigation stack */}
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Calendar" component={CalendarScreen} />
                <Stack.Screen name="Navigation" component={NavigationScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
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
            </NavigationContainer>
        </AppSettingsProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
