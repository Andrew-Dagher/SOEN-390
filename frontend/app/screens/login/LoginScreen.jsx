import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ConcordiaLogo from "../../components/ConcordiaLogo";
import ContinueWithGoogle from "../../components/ContinueWithGoogle";
import * as WebBrowser from "expo-web-browser";
import { useGoogleAuth } from "./useGoogleAccessToken";

export default function LoginScreen() {
  return <LoginScreenContent />;
}

function LoginScreenContent() {
  const navigation = useNavigation();
  const logoPosition = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Import Firebase authentication functions
  const { user, googleToken, loginWithGoogle, logout, error } = useGoogleAuth();

  // Warm-up WebBrowser for OAuth login
  useEffect(() => {
    WebBrowser.warmUpAsync();
    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  // Check for existing session or guest mode on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        const guestMode = await AsyncStorage.getItem("guestMode");

        if (storedUserData || guestMode === "true") {
          console.log("Session found, navigating to Home");
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

  // Logo animation effect
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
  }, []);

  // Store user data after login
  useEffect(() => {
    const storeUserData = async () => {
      if (user && googleToken) {
        try {
          const userData = {
            fullName: user.displayName,
            email: user.email,
            imageUrl: user.photoURL,
          };
          await AsyncStorage.setItem("userData", JSON.stringify(userData));
          console.log("Stored User Data:\n", JSON.stringify(userData, null, 2));
          navigation.replace("Home");
        } catch (error) {
          console.error("Error storing user data:", error);
        }
      }
    };

    storeUserData();
  }, [user, googleToken, navigation]);

  // Guest login function
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
          {user ? (
            <>
              <Text className="text-black text-lg font-semibold mb-4">
                Welcome, {user.displayName}!
              </Text>
              <TouchableOpacity>
                <Text className="text-[#D32F2F] text-lg font-medium underline" onPress={logout}>
                  Sign Out
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity>
                <ContinueWithGoogle onPress={loginWithGoogle} />
              </TouchableOpacity>
              <TouchableOpacity className="mt-5" onPress={handleGuestLogin}>
                <Text className="text-[#1A73E8] text-lg font-medium underline">Continue as Guest</Text>
              </TouchableOpacity>
              {error && <Text className="text-red-500 mt-2">{error}</Text>}
            </>
          )}
        </View>
      </Animated.View>
    </View>
  );
}
