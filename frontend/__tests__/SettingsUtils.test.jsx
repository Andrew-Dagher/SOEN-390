/**
 * @file settingsUtils.test.js
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import {
  loadUserData,
  pickImage,
  handleLogout,
} from "../app/settingsUtils";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock expo-image-picker
jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: "images" },
}));

describe("settingsUtils", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("loadUserData", () => {
    it("loads and sets user data when stored data exists", async () => {
      const mockUserData = {
        fullName: "Alice",
        imageUrl: "http://example.com/avatar.jpg",
      };
      const setUserNameMock = jest.fn();
      const setProfileImageMock = jest.fn();

      // Simulate AsyncStorage returning the user's data
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockUserData));

      await loadUserData(setUserNameMock, setProfileImageMock);

      expect(AsyncStorage.getItem).toHaveBeenCalledWith("userData");
      expect(setUserNameMock).toHaveBeenCalledWith("Alice");
      expect(setProfileImageMock).toHaveBeenCalledWith("http://example.com/avatar.jpg");
    });

    it("sets defaults if no stored data is found", async () => {
      // If there's nothing stored, getItem resolves to null
      AsyncStorage.getItem.mockResolvedValueOnce(null);

      const setUserNameMock = jest.fn();
      const setProfileImageMock = jest.fn();

      await loadUserData(setUserNameMock, setProfileImageMock);

      expect(setUserNameMock).not.toHaveBeenCalledWith(expect.anything()); // no calls with a real name
      expect(setProfileImageMock).not.toHaveBeenCalledWith(expect.anything()); 
      // or, if your code sets defaults like 'Guest' or null, you can check that:
      // expect(setUserNameMock).toHaveBeenCalledWith("Guest");
      // expect(setProfileImageMock).toHaveBeenCalledWith(null);
    });

    it("logs an error if AsyncStorage throws an error", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      AsyncStorage.getItem.mockRejectedValueOnce(new Error("Storage Error"));

      const setUserNameMock = jest.fn();
      const setProfileImageMock = jest.fn();

      await loadUserData(setUserNameMock, setProfileImageMock);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error loading user data:",
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe("pickImage", () => {
    it("sets image URI when user picks an image", async () => {
      const setTempProfileImageMock = jest.fn();
      ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
        canceled: false,
        assets: [{ uri: "file:///fake-path.jpg" }],
      });

      await pickImage(setTempProfileImageMock);
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      expect(setTempProfileImageMock).toHaveBeenCalledWith("file:///fake-path.jpg");
    });

    it("does not set image if user cancels selection", async () => {
      const setTempProfileImageMock = jest.fn();
      ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({ canceled: true });

      await pickImage(setTempProfileImageMock);

      expect(setTempProfileImageMock).not.toHaveBeenCalled();
    });
  });

  describe("handleLogout", () => {
    const signOutMock = jest.fn();
    const navigationMock = { reset: jest.fn() };

    it("clears storage, calls signOut if signed in, and resets navigation", async () => {
      await handleLogout(signOutMock, true, navigationMock);

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(["sessionId", "userData", "guestMode"]);
      expect(signOutMock).toHaveBeenCalled();
      expect(navigationMock.reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: "Login" }] });
    });

    it("clears storage, does not call signOut if not signed in, and resets navigation", async () => {
      await handleLogout(signOutMock, false, navigationMock);

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(["sessionId", "userData", "guestMode"]);
      expect(signOutMock).not.toHaveBeenCalled();
      expect(navigationMock.reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: "Login" }] });
    });

    it("logs an error if something goes wrong", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      AsyncStorage.multiRemove.mockRejectedValueOnce(new Error("Remove Error"));

      await handleLogout(signOutMock, true, navigationMock);

      expect(consoleErrorSpy).toHaveBeenCalledWith("Logout Error:", expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });
});
