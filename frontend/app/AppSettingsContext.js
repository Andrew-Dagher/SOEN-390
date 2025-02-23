import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AppSettingsContext = createContext();

export const AppSettingsProvider = ({ children }) => {
  const [textSize, setTextSize] = useState(16);
  const [colorBlindMode, setColorBlindMode] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedTextSize = await AsyncStorage.getItem("textSize");
        if (storedTextSize !== null) {
          setTextSize(parseInt(storedTextSize, 10)); // Convert to integer
        }

        const storedColorBlindMode = await AsyncStorage.getItem("colorBlindMode");
        if (storedColorBlindMode !== null) {
          setColorBlindMode(storedColorBlindMode);
        }

        const storedProfileImage = await AsyncStorage.getItem("profileImage");
        if (storedProfileImage !== null) {
          setProfileImage(storedProfileImage);
        }
      } catch (error) {
        console.error("Error loading app settings:", error);
      }
    };

    loadSettings();
  }, []);

  // Save settings to AsyncStorage whenever they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem("textSize", textSize.toString());
        await AsyncStorage.setItem("colorBlindMode", colorBlindMode || ""); // Store null as empty string
        await AsyncStorage.setItem("profileImage", profileImage || ""); // Store null as empty string
      } catch (error) {
        console.error("Error saving app settings:", error);
      }
    };

    saveSettings();
  }, [textSize, colorBlindMode, profileImage]);

  return (
    <AppSettingsContext.Provider value={{
      textSize, setTextSize,
      colorBlindMode, setColorBlindMode,
      profileImage, setProfileImage
    }}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => useContext(AppSettingsContext);
