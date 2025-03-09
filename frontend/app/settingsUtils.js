import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

/**
 * Loads user data from AsyncStorage.
 * @param {Function} setUserName 
 * @param {Function} setProfileImage 
 */
export const loadUserData = async (setUserName, setProfileImage) => {
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

/**
 * Handles profile image selection.
 * @param {Function} setTempProfileImage 
 */
export const pickImage = async (setTempProfileImage) => {
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

/**
 * Handles logout process including session clearance.
 * @param {Function} signOut 
 * @param {boolean} isSignedIn 
 * @param {Function} navigation 
 */
export const handleLogout = async (signOut, isSignedIn, navigation) => {
  try {
    await AsyncStorage.multiRemove(["sessionId", "userData", "guestMode"]);
    console.log("🗑️ Cleared stored session data.");

    if (isSignedIn) {
      await signOut();
      console.log("Successfully signed out!");
    }

    navigation.reset({ index: 0, routes: [{ name: "Login" }] });

  } catch (error) {
    console.error("Logout Error:", error);
  }
};
