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
import { useAppSettings } from "../../AppSettingsContext";
import BottomNavBar from "../../components/BottomNavBar/BottomNavBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@clerk/clerk-expo";

export default function SettingsScreen() {
  const {
    textSize, setTextSize,
    colorBlindMode, setColorBlindMode,
    profileImage, setProfileImage
  } = useAppSettings();

  const [isWheelchairAccessEnabled, setWheelchairAccessEnabled] = useState(false);
  const [tempProfileImage, setTempProfileImage] = useState(profileImage);
  const [userName, setUserName] = useState("Guest");
  const [isColorBlindModeEnabled, setColorBlindModeEnabled] = useState(!!colorBlindMode);
  const [tempSize, setTempSize] = useState(textSize);

  const navigation = useNavigation();
  const blinder = require("color-blind");

  // Load user data from AsyncStorage on mount
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

  // Function to transform colors dynamically for color-blind mode
  const transformColor = (color) => {
    if (!color || !colorBlindMode) return color;
    return blinder[colorBlindMode] ? blinder[colorBlindMode](color) : color;
  };

  const baseMaroonColor = "#7c2933";
  const transformedMaroonColor = transformColor(baseMaroonColor);

  // Function to pick an image from gallery
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

  // Apply changes and save settings
  const applyChanges = () => {
    setTextSize(tempSize);
    setProfileImage(tempProfileImage);
  };

  const { signOut, isSignedIn } = useAuth();

  // Handle user logout and clear AsyncStorage
  const handleLogout = async () => {
    try {
      Alert.alert(
        "Logout",
        "Are you sure you want to log out?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Logout",
            onPress: async () => {
              try {
                await AsyncStorage.removeItem("sessionId");
                await AsyncStorage.removeItem("userData");
                await AsyncStorage.removeItem("guestMode");
                console.log("🗑️ Cleared stored session data.");

                if (isSignedIn) {
                  await signOut();
                  console.log("Successfully signed out!");
                }

                navigation.reset({ index: 0, routes: [{ name: "Login" }] });
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
        <View style={[styles.header, { backgroundColor: transformedMaroonColor }]} className="pt-16 pb-8 items-center">
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
          <Text style={[styles.userName, { fontSize: 32 }]} className="text-white text-3xl font-medium">{userName}</Text>
        </View>

        {/* Settings Section */}
        <View style={[styles.content, { backgroundColor: transformColor("#FFFFFF") }]} className="-mt-6 rounded-t-3xl px-6 pt-6 pb-24">
          <Text style={[styles.userName, { fontSize: textSize }]} className="text-2xl font-bold mb-6">Accessibility Settings</Text>

          {/* Mobility Settings */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text style={[{ fontSize: textSize }]} className="text-lg font-medium">Mobility disability</Text>
              <Switch value={isWheelchairAccessEnabled} onValueChange={setWheelchairAccessEnabled} />
            </View>
            <Text className="text-gray-500 text-sm mb-4">Enable features optimized for wheelchair users.</Text>
            <View className="h-px bg-gray-200 w-full" />
          </View>


          {/* Color Vision Settings */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text style={[styles.userName, { fontSize: textSize }]} className="text-lg font-medium">
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
                <View key={type} className="flex-row justify-between items-center h-12">
                  <Text style={[styles.userName, { fontSize: textSize }]} className="text-lg">{type}</Text>
                  <TouchableOpacity onPress={() => isColorBlindModeEnabled && setColorBlindMode(type.toLowerCase())}>
                    <View style={[styles.radioButton, { borderColor: transformedMaroonColor }]}>
                      {colorBlindMode === type.toLowerCase() && isColorBlindModeEnabled && (
                        <View style={[styles.radioFill, { backgroundColor: transformedMaroonColor }]} />
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Text Size Settings */}
          <View className="mb-6">
            <Text style={[styles.userName, { fontSize: textSize }]} className="text-lg font-medium mb-2">Text size</Text>
            <Slider
                minimumValue={12}
                maximumValue={25}
                step={1}
                value={tempSize}
                onValueChange={setTempSize}
                minimumTrackTintColor={transformedMaroonColor}
                maximumTrackTintColor="#D1D1D6"
                className="w-full h-10"
              />
            <Text style={{ fontSize: tempSize }} className="text-gray-900 mb-2">Preview text size</Text>
          </View>

          {/* Apply Button */}
          <TouchableOpacity onPress={applyChanges} style={[styles.applyButton, { backgroundColor: transformedMaroonColor }]} className="py-3 rounded-lg items-center mt-4">
            <Text className="text-white text-lg font-medium">Apply Changes</Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity onPress={handleLogout} style={[styles.applyButton, { backgroundColor: transformedMaroonColor }]} className="py-3 rounded-lg items-center mt-4">
            <Text className="text-white text-lg font-medium">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomNavBar/>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: "#7c2933" },
  content: { backgroundColor: "#FFFFFF" },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#7c2933",
    alignItems: "center", 
    justifyContent: "center", 
  },
  radioFill: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#7c2933",
  },

  applyButton: { backgroundColor: "#7c2933", padding: 10, borderRadius: 8 },
});
