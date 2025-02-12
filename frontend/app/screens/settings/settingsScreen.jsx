import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Button,
  Alert,
} from "react-native";
import Slider from "@react-native-community/slider";
import * as ImagePicker from "expo-image-picker";
import {
  ColorMatrix,
  concatColorMatrices,
  colorMatrices,
} from "react-native-color-matrix-image-filters";
import { useAppSettings } from "../../TextSizeContext";
import { useTextSize } from "../../TextSizeContext";
import BottomNavBar from "../../components/BottomNavBar/BottomNavBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@clerk/clerk-expo";

export default function SettingsScreen() {
  const [isWheelchairAccessEnabled, setWheelchairAccessEnabled] =
    useState(false);
  const [tempProfileImage, setTempProfileImage] = useState(profileImage);
  const [userName, setUserName] = useState("Guest");
  const navigation = useNavigation();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUser = JSON.parse(storedUserData);
          setUserName(parsedUser.fullName || "Guest");
          setProfileImage(parsedUser.imageUrl || null);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    loadUserData();
  }, []);

  const { colorBlindMode, setColorBlindMode } = useAppSettings();
  const [isColorBlindModeEnabled, setColorBlindModeEnabled] = useState(
    !!colorBlindMode
  );
  const { textSize, setTextSize, profileImage, setProfileImage } =
    useTextSize();
  const [tempSize, setTempSize] = useState(textSize);
  const blinder = require("color-blind");

  const transformColor = (color) => {
    if (!color || !colorBlindMode) return color;
    return blinder[colorBlindMode] ? blinder[colorBlindMode](color) : color;
  };

  const baseMaroonColor = "#7c2933";
  const transformedMaroonColor = transformColor(baseMaroonColor);

  const styles = StyleSheet.create({
    header: {
      backgroundColor: transformedMaroonColor,
    },
    content: {
      backgroundColor: transformColor("#FFFFFF"),
    },
    radioButton: {
      borderColor: transformedMaroonColor,
    },
    radioFill: {
      backgroundColor: transformedMaroonColor,
    },
    applyButton: {
      backgroundColor: transformedMaroonColor,
    },
  });

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setTempProfileImage(result.assets[0].uri);
    }
  };

  const applyChanges = () => {
    setTextSize(tempSize);
    setProfileImage(tempProfileImage);
  };

  const { signOut, isSignedIn } = useAuth();
    // Handle logout and clear storage
    const handleLogout = async () => {
      try {
        // Confirm logout
        Alert.alert(
          "Logout",
          "Are you sure you want to log out?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Logout",
              onPress: async () => {
                try {
                  // Clear all stored data
                  await AsyncStorage.removeItem("sessionId");
                  await AsyncStorage.removeItem("userData");
                  await AsyncStorage.removeItem("guestMode");
                  console.log("🗑️ Cleared stored session data.");
  
                  // Sign out only if the user is signed in
                  if (isSignedIn) {
                    await signOut();
                    console.log("Successfully signed out!");
                  }
  
                  // Reset navigation history and navigate to Login screen
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "Login" }],
                  });
                } catch (error) {
                  console.error("Logout Error:", error);
                }
              },
            },
          ],
          { cancelable: false }
        );
      } catch (error) {
        console.error("Logout Error:", error);
      }
    };

  return (
    <View testID="settings-screen" className="flex-1">
      <ScrollView>
        {/* Profile Section */}
        <View style={styles.header} className="pt-16 pb-8 items-center">
          <TouchableOpacity onPress={pickImage} className="mb-4">
            <Image
              source={
                profileImage
                  ? { uri: profileImage }
                  : require("../../../assets/default-avatar.png")
              }
              className="w-24 h-24 rounded-full border-4 border-white"
            />
          </TouchableOpacity>
          <Text className="text-white text-3xl font-medium">{userName}</Text>
        </View>

        {/* Settings Section */}
        <View
          style={styles.content}
          className="-mt-6 rounded-t-3xl px-6 pt-6 pb-24"
        >
          <Text className="text-2xl font-bold mb-6">
            Accessibility Settings
          </Text>

          {/* Mobility Settings */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-medium">Mobility disability</Text>
              <Switch
                value={isWheelchairAccessEnabled}
                onValueChange={setWheelchairAccessEnabled}
                trackColor={{ false: "#D1D1D6", true: "#34C759" }}
              />
            </View>
            <Text className="text-gray-500 text-sm mb-4">
              Enable features optimized for wheelchair users / Offer directions
              that use elevators/escalators for persons with limited mobility.
            </Text>
            <View className="h-px bg-gray-200 w-full" />
          </View>

          {/* Color Vision Settings */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-medium">
                Color vision deficient
              </Text>
              <Switch
                value={isColorBlindModeEnabled}
                onValueChange={(value) => {
                  setColorBlindModeEnabled(value);
                  if (!value) setColorBlindMode(null);
                }}
                trackColor={{ false: "#D1D1D6", true: "#34C759" }}
              />
            </View>

            {/* Color Vision Options */}
            <View className="mt-4 w-full">
              {["Deuteranomaly", "Protanomaly", "Tritanomaly"].map((type) => (
                <View
                  key={type}
                  className="flex-row justify-between items-center h-12"
                >
                  <Text
                    className={
                      isColorBlindModeEnabled
                        ? "text-lg text-gray-900"
                        : "text-lg text-gray-300"
                    }
                  >
                    {type}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      isColorBlindModeEnabled &&
                      setColorBlindMode(type.toLowerCase())
                    }
                    disabled={!isColorBlindModeEnabled}
                    className="items-center justify-center"
                  >
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        isColorBlindModeEnabled ? "" : "border-gray-300"
                      }`}
                      style={
                        isColorBlindModeEnabled ? styles.radioButton : null
                      }
                    >
                      {colorBlindMode === type.toLowerCase() &&
                        isColorBlindModeEnabled && (
                          <View
                            style={styles.radioFill}
                            className="w-3.5 h-3.5 rounded-full"
                          />
                        )}
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View className="h-px bg-gray-200 w-full mt-4" />
          </View>

          {/* Text Size Settings */}
          <View className="mb-6">
            <Text className="text-lg font-medium mb-2">Text size</Text>
            <View className="mb-2">
              <Slider
                minimumValue={12}
                maximumValue={24}
                step={1}
                value={tempSize}
                onValueChange={setTempSize}
                minimumTrackTintColor={transformedMaroonColor}
                maximumTrackTintColor="#D1D1D6"
                className="w-full h-10"
              />
            </View>
            <Text style={{ fontSize: tempSize }} className="text-gray-900 mb-2">
              Preview text size
            </Text>
            <Text className="text-gray-500 text-sm mb-4">
              Adjust the text size to improve readability
            </Text>
            <View className="h-px bg-gray-200 w-full" />
          </View>

          {/* Apply Button */}
          <TouchableOpacity
            onPress={applyChanges}
            style={styles.applyButton}
            className="py-3 rounded-lg items-center mt-4"
          >
            <Text className="text-white text-lg font-medium">
              Apply Changes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.applyButton}
            className="py-3 rounded-lg items-center mt-4"
          >
            <Text className="text-white text-lg font-medium">
              Logout
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
      <BottomNavBar />
    </View>
  );
}