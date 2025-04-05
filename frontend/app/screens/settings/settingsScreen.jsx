/**
 * SettingsScreen component allows the user to modify various settings including
 * accessibility options, text size, and profile image. It also provides a logout option.
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@clerk/clerk-expo";
import { useAppSettings } from "../../AppSettingsContext";
import getThemeColors from "../../ColorBindTheme";
import { loadUserData, pickImage, handleLogout } from "../../settingsUtils";
import PropTypes from "prop-types"; 
import RNCSlider from "@react-native-community/slider";

export default function SettingsScreen() {
  const {
    textSize, setTextSize,
    colorBlindMode, setColorBlindMode,
    profileImage, setProfileImage,
      setWheelchairAccess,
      wheelchairAccess, 
  } = useAppSettings();

  const theme = getThemeColors();
  const navigation = useNavigation();
  const { signOut, isSignedIn } = useAuth();


  const [isWheelchairAccessEnabled, setWheelchairAccessEnabled] = useState(wheelchairAccess);
  const [tempProfileImage, setTempProfileImage] = useState(profileImage);
  const [userName, setUserName] = useState("Guest");
  const [isColorBlindModeEnabled, setIsColorBlindModeEnabled] = useState(!!colorBlindMode);
  const [tempSize, setTempSize] = useState(textSize);

  useEffect(() => { loadUserData(setUserName, setProfileImage); }, []);

  const applyChanges = () => {
    setTextSize(tempSize);
    setProfileImage(tempProfileImage);
    setWheelchairAccess(isWheelchairAccessEnabled)
  };

  return (
    <View testID="settings-screen" className="flex-1">
      <ScrollView>
        {/* Profile Section */}
        <View style={[styles.header, { backgroundColor: theme.backgroundColor }]} className="pt-16 pb-8 items-center">
          <TouchableOpacity onPress={() => pickImage(setTempProfileImage)} className="mb-4" accessibilityRole="button" accessibilityLabel="avatar" testID="avatar-button">
            <Image
              source={ profileImage ? { uri: profileImage } : require("../../../assets/default-avatar.png") }
              className="w-24 h-24 rounded-full border-4 border-white"
            />
          </TouchableOpacity>
          <Text style={[styles.userName, { fontSize: 26 }]} className="text-white text-3xl font-medium">{userName}</Text>
        </View>

        {/* Settings Section */}
        <View style={[styles.content, { backgroundColor: "#FFFFFF" }]} className="-mt-6 rounded-t-3xl px-6 pt-6 pb-24">
          <Text style={[styles.userName, { fontSize: textSize }]} className="text-2xl font-bold mb-6">Accessibility Settings</Text>

          {/* Mobility Settings */}
          <SettingToggle 
          label="Mobility disability"
          description="Enable features optimized for wheelchair users."
          value={isWheelchairAccessEnabled}
          onChange={setWheelchairAccessEnabled}
          textSize={textSize} 
        />


          {/* Color Vision Settings */}
          <SettingToggle 
            label="Color vision deficient"
            value={isColorBlindModeEnabled}
            onChange={(value) => {
              setIsColorBlindModeEnabled(value);
              if (!value) setColorBlindMode(null);
            }}
            textSize={textSize}
          />
          
          {/* Color Vision Options */}
          {isColorBlindModeEnabled && (
           ["Deuteranomaly", "Protanomaly", "Tritanomaly"].map((type) => (
            <RadioOption 
              key={type}
              label={type}
              selected={colorBlindMode === type.toLowerCase()}
              onPress={() => setColorBlindMode(type.toLowerCase())}
              textSize={textSize}
            />
          ))
          )}
        
          <View style={{ marginTop: 20 }} /> 

          {/* Text Size Settings */}
          <View className="mb-6">
            <Text style={[{ fontSize: textSize }]} className="text-lg font-medium mb-2">Text size</Text>
            <RNCSlider
              minimumValue={12}
              maximumValue={25}
              step={1}
              value={tempSize}
              onValueChange={setTempSize}
              minimumTrackTintColor={theme.backgroundColor}
              maximumTrackTintColor="#D1D1D6"
              className="w-full h-10"
              accessibilityRole="adjustable"
              testID="slider"
            />
    
            <Text style={{ fontSize: tempSize }} className="text-gray-900 mb-2">Preview text size</Text>
          </View>

          {/* Apply Button */}
          <ActionButton 
          label="Apply Changes" 
          onPress={applyChanges} 
          theme={theme} 
          textSize={textSize}
          />

          {/* Logout Button */}
          <ActionButton 
          label="Logout" 
          onPress={() => handleLogout(signOut, isSignedIn, navigation)} 
          theme={theme} 
          textSize={textSize}  // Pass textSize here
          />

        </View>
      </ScrollView>
    </View>
  );
}

// Extracted Components for Reusability
const SettingToggle = ({ label, description, value, onChange, textSize }) => (
  <View className="mb-6">
    <View className="flex-row justify-between items-center mb-2">
      <Text style={[{ fontSize: textSize }]} className="text-lg font-medium">{label}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
    {description && <Text style={[{ fontSize: textSize - 8 }]} className="text-gray-500 text-sm mb-4">{description}</Text>}
    <View className="h-px bg-gray-200 w-full" />
  </View>
);

SettingToggle.propTypes = {
  label: PropTypes.string.isRequired,
  description: PropTypes.string,
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  textSize: PropTypes.number.isRequired,
};

const RadioOption = ({ label, selected, onPress, textSize }) => (
  <View className="flex-row justify-between items-center h-12">
    <Text style={[{ fontSize: textSize - 2 }]} className="text-lg">{label}</Text>
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.radioButton, { borderColor: selected ? "#7c2933" : "#D1D1D6" }]}>
        {selected && <View style={styles.radioFill} />}
      </View>
    </TouchableOpacity>
  </View>
);

RadioOption.propTypes = {
  label: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  onPress: PropTypes.func.isRequired,
  textSize: PropTypes.number.isRequired,
};

const ActionButton = ({ label, onPress, theme, textSize }) => (
  <TouchableOpacity 
    onPress={onPress} 
    style={[styles.applyButton, { backgroundColor: theme.backgroundColor }]} 
    className="py-3 rounded-lg items-center mt-4"
  >
    <Text style={[{ fontSize: textSize }]} className="text-white text-lg font-medium">{label}</Text>
  </TouchableOpacity>
);

ActionButton.propTypes = {
  label: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  theme: PropTypes.shape({
    backgroundColor: PropTypes.string.isRequired,
  }).isRequired,
  textSize: PropTypes.number.isRequired,
};

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
