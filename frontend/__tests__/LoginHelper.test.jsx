import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  storeUserData,
  fetchPublicCalendarEvents,
  checkExistingSession,
  handleGuestLogin,
} from "../app/screens/login/LoginHelper";

global.fetch = jest.fn();
jest.mock("@react-native-async-storage/async-storage");

describe("LoginHelper functions", () => {
  const mockNavigation = { replace: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("storeUserData stores user data in AsyncStorage", async () => {
    const user = {
      fullName: "Test User",
      primaryEmailAddress: { emailAddress: "test@test.com" },
      imageUrl: "https://test.com/image.png",
    };

    await storeUserData(user, mockNavigation);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "userData",
      JSON.stringify({
        fullName: "Test User",
        email: "test@test.com",
        imageUrl: "https://test.com/image.png",
      })
    );
    expect(mockNavigation.replace).toHaveBeenCalledWith("Home");
  });

  test("storeUserData does not call navigation if no replace function", async () => {
    const user = {
      fullName: "Test User",
      primaryEmailAddress: { emailAddress: "test@test.com" },
      imageUrl: "https://test.com/image.png",
    };

    await storeUserData(user, {});

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "userData",
      JSON.stringify({
        fullName: "Test User",
        email: "test@test.com",
        imageUrl: "https://test.com/image.png",
      })
    );
  });

  test("fetchPublicCalendarEvents returns empty array if API key is missing", async () => {
    process.env.EXPO_PUBLIC_GOOGLE_API_KEY2 = "";
    const events = await fetchPublicCalendarEvents("calendar-id", "2025-03-10", "2025-03-11");
    expect(events).toEqual([]);
  });

  test("checkExistingSession navigates to Home if session exists", async () => {
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify({ fullName: "Test User" }));
    await checkExistingSession(mockNavigation);
    expect(mockNavigation.replace).toHaveBeenCalledWith("Home");
  });

  test("checkExistingSession does nothing if no session found", async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    await checkExistingSession(mockNavigation);
    expect(mockNavigation.replace).not.toHaveBeenCalled();
  });

  test("handleGuestLogin sets guest mode and navigates", async () => {
    await handleGuestLogin(mockNavigation);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("guestMode", "true");
    expect(mockNavigation.replace).toHaveBeenCalledWith("Home");
  });

  test("handleGuestLogin handles errors gracefully", async () => {
    AsyncStorage.setItem.mockRejectedValue(new Error("Storage error"));
    await expect(handleGuestLogin(mockNavigation)).resolves.not.toThrow();
  });
});