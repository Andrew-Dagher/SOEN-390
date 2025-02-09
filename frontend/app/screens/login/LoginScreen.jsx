import React, { useEffect, useRef, useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useOAuth, useUser, useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ConcordiaLogo from "../../components/ConcordiaLogo";
import * as WebBrowser from "expo-web-browser";

export default function LoginScreen() {
  return <LoginScreenContent />;
}

function LoginScreenContent() {
  const navigation = useNavigation();
  const logoPosition = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const [isCheckingSession, setIsCheckingSession] = useState(true); // State to manage session check loading

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

  // OAuth login setup for Google
  const { startOAuthFlow } = useOAuth({
    strategy: "oauth_google",
    extraParams: {
      scope:
        "openid profile email https://www.googleapis.com/auth/calendar.readonly",
    },
  });

  // Function to handle Google Sign-In
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

  // Store only name, email, and image in AsyncStorage after login
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
          navigation.replace("Home");
        } catch (error) {
          console.error("Error storing user data:", error);
        }
      }
    };

    storeUserData();
  }, [isSignedIn, user, navigation]);

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
    <View className="flex-1 bg-[#862532] justify-center items-center">
      <Animated.View style={{ transform: [{ translateY: logoPosition }] }}>
        <ConcordiaLogo width={288} height={96} />
      </Animated.View>

      <Animated.View
        className="absolute bottom-0 w-full items-center"
        style={{ opacity: formOpacity }}
      >
        <View className="w-full bg-white rounded-t-[50px] py-32 px-6 items-center shadow-md">
          {/* Google Sign-In Button */}
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            className="flex-row items-center bg-white rounded-xl py-3 px-6 shadow-md"
          >
            <Image
              source={{
                uri: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg",
              }}
              className="w-6 h-6 mr-3"
            />
            <Text className="text-black text-lg font-semibold">
              Continue with Google
            </Text>
          </TouchableOpacity>

          {/* Guest Login Button */}
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
