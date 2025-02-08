import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { AppSettingsProvider } from './TextSizeContext';
import { TextSizeProvider } from './TextSizeContext';

import "../global.css";
import HomeScreen from "./screens/home/HomeScreen";
import CalendarScreen from "./screens/calendar/CalendarScreen";
import NavigationScreen from "./screens/navigation/NavigationScreen";
import LoginScreen from "./screens/login/LoginScreen";
import LoadingScreen from "./screens/login/LoadingScreen";
import SettingsScreen from './screens/settings/settingsScreen';

const Stack = createNativeStackNavigator();


export default function App() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <ClerkLoaded>
            <AppSettingsProvider>
    <TextSizeProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="Loading"
              component={LoadingScreen}
            />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Calendar" component={CalendarScreen} />
            <Stack.Screen name="Navigation" component={NavigationScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen
              name="Login"
              options={{ headerShown: false }}
              component={LoginScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
        </TextSizeProvider>
        </AppSettingsProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
