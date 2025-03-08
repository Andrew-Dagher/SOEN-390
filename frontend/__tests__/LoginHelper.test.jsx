import { storeUserData } from "../app/screens/login/LoginHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe("LoginHelper functions", () => {
  test("storeUserData stores user data", async () => {
    const user = {
      fullName: "Test User",
      primaryEmailAddress: { emailAddress: "test@test.com" },
      imageUrl: "https://test.com/image.png",
    };

    await storeUserData(user, { replace: jest.fn() });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "userData",
      JSON.stringify({
        fullName: "Test User",
        email: "test@test.com",
        imageUrl: "https://test.com/image.png",
      })
    );
  });
});
