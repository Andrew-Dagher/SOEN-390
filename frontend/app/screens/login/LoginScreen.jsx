/**
 * @file LoginScreen.jsx
 * @description Provides the login screen with animated logo, OAuth login via Google,
 * guest login option, and automatic session detection. Handles the initial authentication
 * flow and navigates to the Home screen upon successful login or session detection.
 */

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useOAuth, useUser, useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ConcordiaLogo from "../../components/ConcordiaLogo";
import * as WebBrowser from "expo-web-browser";
import ContinueWithGoogle from "../../components/ContinueWithGoogle";
import { fetchPublicCalendarEvents, getAvailableCalendars } from "./calendarApi"; // Import shared functions

/**
 * LoginScreen component serves as the default export and wraps the LoginScreenContent.
 *
 * @component
 * @returns {JSX.Element} The rendered LoginScreen component.
 */
export default function LoginScreen() {
  return <LoginScreenContent />;
}

/**
 * LoginScreenContent component handles the login process including:
 * - Warm-up for OAuth via WebBrowser.
 * - Checking for an existing session or guest mode.
 * - Animated logo transition and form appearance.
 * - Google OAuth login and guest login functionality.
 * - Storing user data in AsyncStorage upon successful login.
 *
 * @component
 * @returns {JSX.Element} The rendered LoginScreenContent component.
 */
function LoginScreenContent() {
  const navigation = useNavigation();
  const logoPosition = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    WebBrowser.warmUpAsync();
    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const sessionId = await AsyncStorage.getItem("sessionId");
        const guestMode = await AsyncStorage.getItem("guestMode");

        if (sessionId) {
          console.log("Existing session found, navigating to Home");
          navigation.replace("Home");
          return;
        }

        if (guestMode === "true") {
          console.log("Guest mode detected, navigating to Home");
          navigation.replace("Home");
          return;
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkExistingSession();
  }, [navigation]);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoPosition, {
        toValue: -200,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoPosition, formOpacity]);

  const { startOAuthFlow } = useOAuth({
    strategy: "oauth_google",
    extraParams: {
      scope:
        "openid profile email https://www.googleapis.com/auth/calendar.readonly",
    },
  });

  const handleGoogleSignIn = async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        await AsyncStorage.setItem("sessionId", createdSessionId);
        setActive({ session: createdSessionId });
      }
    } catch (error) {
      console.error("OAuth Error:", error);
      if (error.message.includes("cancelled")) {
        console.log("User cancelled the login process.");
      } else {
        alert("Login failed. Please try again later.");
      }
    }
  };

  const { user } = useUser();
  const { isSignedIn } = useAuth();

  /**
   * Stores user data (name, email, image) in AsyncStorage once the user is signed in.
   * Navigates to the Home screen after successfully storing the user data.
   * Fetches the public Google Calendar events for all available calendars.
   */
useEffect(() => {
  const storeUserData = async () => {
    if (isSignedIn && user) {
      try {
        const userData = {
          fullName: user.fullName,
          email: user.primaryEmailAddress?.emailAddress,
          imageUrl: user.imageUrl,
        };

        await AsyncStorage.setItem("userData", JSON.stringify(userData));
        console.log("Stored User Data:\n", JSON.stringify(userData, null, 2));

        // Fetch available calendars
        const calendars = await getAvailableCalendars();
        if (calendars.length === 0) {
          console.log("No calendars found in environment variables.");
        } else {
          // Store calendars in AsyncStorage
          await AsyncStorage.setItem("availableCalendars", JSON.stringify(calendars));
          console.log("Stored available calendars:", calendars);

          // Set first calendar as default
          await AsyncStorage.setItem("selectedCalendar", calendars[0]?.id || "");
        }

        navigation.replace("Home");
      } catch (error) {
        console.error("Error storing user data:", error);
      }
    }
  };

  storeUserData();
}, [isSignedIn, user, navigation]);


  const handleGuestLogin = async () => {
    console.log("Guest Login Selected");
    try {
      const guestData = {
        guest: true,
        fullName: "Guest User",
        email: "guest@demo.com",
        imageUrl: null,
      };

      await AsyncStorage.setItem("guestMode", "true");
      await AsyncStorage.setItem("userData", JSON.stringify(guestData));

      navigation.replace("Home");
    } catch (error) {
      console.error("Error setting guest mode:", error);
    }
  };

  if (isCheckingSession) {
    return (
      <View className="flex-1 bg-[#862532] justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View testID="login-screen" className="flex-1 bg-[#862532] justify-center items-center">
      <Animated.View style={{ transform: [{ translateY: logoPosition }] }}>
        <ConcordiaLogo width={288} height={96} />
      </Animated.View>

      <Animated.View
        className="absolute bottom-0 w-full items-center"
        style={{ opacity: formOpacity }}
      >
        <View className="w-full bg-white rounded-t-[50px] py-32 px-6 items-center shadow-md">
          <TouchableOpacity>
            <ContinueWithGoogle onPress={handleGoogleSignIn} />
          </TouchableOpacity>

          <TouchableOpacity className="mt-5" onPress={handleGuestLogin}>
            <Text className="text-[#1A73E8] text-lg font-medium underline">
              Continue as Guest
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}