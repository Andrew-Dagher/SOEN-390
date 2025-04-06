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
import { useSSO, useUser, useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ConcordiaLogo from "../../components/ConcordiaLogo";
import * as WebBrowser from "expo-web-browser";
import ContinueWithGoogle from "../../components/ContinueWithGoogle";
import {
  checkExistingSession,
  storeUserData,
  handleGuestLogin,
} from "./LoginHelper"; // Import refactored functions

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
    const checkSession = async () => {
      await checkExistingSession(navigation);
      setIsCheckingSession(false);
    };

    checkSession();
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

  const { startSSOFlow } = useSSO();

  const handleGoogleSignIn = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        extraParams: {
          scope:
            "openid profile email https://www.googleapis.com/auth/calendar.readonly",
        },
      });

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

  useEffect(() => {
    if (isSignedIn && user) {
      storeUserData(user, navigation);
    }
  }, [isSignedIn, user, navigation]);

  if (isCheckingSession) {
    return (
      <View className="flex-1 bg-[#862532] justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View
      testID="login-screen"
      className="flex-1 bg-[#862532] justify-center items-center"
    >
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

          <TouchableOpacity
            className="mt-5"
            onPress={() => handleGuestLogin(navigation)}
          >
            <Text className="text-[#1A73E8] text-lg font-medium underline">
              Continue as Guest
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}
