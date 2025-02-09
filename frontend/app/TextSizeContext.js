import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AppSettingsContext = createContext();
const TextSizeContext = createContext();

export const AppSettingsProvider = ({ children }) => {
  const [textSize, setTextSize] = useState(16);
  const [colorBlindMode, setColorBlindMode] = useState(null);

  useEffect(() => {
    // Load from AsyncStorage on mount
    const loadSettings = async () => {
      try {
        const storedTextSize = await AsyncStorage.getItem("textSize");
        if (storedTextSize !== null) {
          setTextSize(parseInt(storedTextSize, 10)); // Parse to int
        }

        const storedColorBlindMode = await AsyncStorage.getItem(
          "colorBlindMode"
        );
        if (storedColorBlindMode !== null) {
          setColorBlindMode(storedColorBlindMode);
        }
      } catch (error) {
        console.error("Error loading app settings:", error);
      }
    };

    loadSettings();
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    // Save to AsyncStorage whenever settings change
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem("textSize", textSize.toString());
        await AsyncStorage.setItem("colorBlindMode", colorBlindMode || ""); // Store null as empty string
      } catch (error) {
        console.error("Error saving app settings:", error);
      }
    };

    saveSettings();
  }, [textSize, colorBlindMode]); // Run when textSize or colorBlindMode changes

  return (
    <AppSettingsContext.Provider
      value={{ textSize, setTextSize, colorBlindMode, setColorBlindMode }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => useContext(AppSettingsContext);

export const TextSizeProvider = ({ children }) => {
  const [textSize, setTextSize] = useState(16);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const loadTextSizeAndImage = async () => {
      try {
        const storedTextSize = await AsyncStorage.getItem("textSize");
        if (storedTextSize !== null) {
          setTextSize(parseInt(storedTextSize, 10));
        }

        const storedProfileImage = await AsyncStorage.getItem("profileImage");
        if (storedProfileImage !== null) {
          setProfileImage(storedProfileImage);
        }
      } catch (error) {
        console.error("Error loading text size and image:", error);
      }
    };

    loadTextSizeAndImage();
  }, []);

  useEffect(() => {
    const saveTextSizeAndImage = async () => {
      try {
        await AsyncStorage.setItem("textSize", textSize.toString());
        await AsyncStorage.setItem("profileImage", profileImage || ""); // Store null as empty string
      } catch (error) {
        console.error("Error saving text size and image:", error);
      }
    };

    saveTextSizeAndImage();
  }, [textSize, profileImage]);

  return (
    <TextSizeContext.Provider
      value={{ textSize, setTextSize, profileImage, setProfileImage }}
    >
      {children}
    </TextSizeContext.Provider>
  );
};

export const useTextSize = () => useContext(TextSizeContext);
