/**
 * @file LoginScreen.test.js
 * @description Comprehensive tests for the LoginScreen UI and helper functions.
 */

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { ClerkProvider } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginScreen from "../app/screens/login/LoginScreen";

/**
 * Import helper functions from LoginHelper.
 * These functions include storeUserData, fetchPublicCalendarEvents, checkExistingSession,
 * handleGuestLogin, getAvailableCalendars, and fetchCalendarName.
 */
import {
  storeUserData,
  fetchPublicCalendarEvents,
  checkExistingSession,
  handleGuestLogin,
  getAvailableCalendars,
  // If fetchCalendarName is not exported, remove the import below or export it for direct testing.
  fetchCalendarName,
} from "../app/screens/login/LoginHelper";

// --- MOCKS ---

// Mock the Clerk logic to avoid real authentication during tests.
// We provide dummy implementations for ClerkProvider, useOAuth, useUser, useAuth, and useSSO.
jest.mock("@clerk/clerk-expo", () => ({
  ClerkProvider: ({ children }) => <>{children}</>,
  useOAuth: () => ({
    startOAuthFlow: jest
      .fn()
      .mockResolvedValue({ createdSessionId: "mockSessionId", setActive: jest.fn() }),
  }),
  useUser: () => ({ user: null }),
  useAuth: () => ({ isSignedIn: false }),
  useSSO: () => ({ startSSOFlow: jest.fn() }),
}));

// Mock AsyncStorage to avoid actual storage writes during tests.
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock global fetch to simulate API responses.
global.fetch = jest.fn();

// Silence or track console output to keep test logs clean.
const originalConsole = { ...console };
beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.log = originalConsole.log;
});

// Clear mocks and set default environment variables before each test.
beforeEach(() => {
  jest.clearAllMocks();
  process.env.EXPO_PUBLIC_GOOGLE_API_KEY2 = "VALID_API_KEY"; // Default test API key.
});

// Remove environment variables after each test.
afterEach(() => {
  delete process.env.EXPO_PUBLIC_GOOGLE_API_KEY2;
  Object.keys(process.env)
    .filter((k) => k.startsWith("EXPO_PUBLIC_GOOGLE_CALENDAR_ID"))
    .forEach((k) => delete process.env[k]);
});

// --- TESTS ---

/**
 * PART 1: TESTS FOR THE LoginScreen UI
 */
describe("LoginScreen", () => {
  // Test that LoginScreen renders correctly by verifying the testID.
  it("renders correctly with testID", async () => {
    const { getByTestId } = render(
      <ClerkProvider>
        <NavigationContainer>
          <LoginScreen />
        </NavigationContainer>
      </ClerkProvider>
    );
    // Wait for the element with testID "login-screen" to appear.
    await waitFor(() => getByTestId("login-screen"));
    expect(getByTestId("login-screen")).toBeTruthy();
  });

  // Test that the Google sign-in button press is handled.
  it("handles Google sign-in button press", async () => {
    const { getByText } = render(
      <ClerkProvider>
        <NavigationContainer>
          <LoginScreen />
        </NavigationContainer>
      </ClerkProvider>
    );
    // Wait for the "Continue with Google" button to appear.
    const googleButton = await waitFor(() => getByText("Continue with Google"));
    fireEvent.press(googleButton);
    // No further assertions here because startOAuthFlow is mocked.
  });

  // Test that the guest login button press is handled.
  it("handles guest login button press", async () => {
    const { getByText } = render(
      <ClerkProvider>
        <NavigationContainer>
          <LoginScreen />
        </NavigationContainer>
      </ClerkProvider>
    );
    // Wait for the "Continue as Guest" button to appear.
    const guestButton = await waitFor(() => getByText("Continue as Guest"));
    fireEvent.press(guestButton);
    // The detailed behavior of guest login is tested below in the helper function tests.
  });
});

/**
 * PART 2: TESTS FOR HELPER FUNCTIONS (LoginHelper)
 */
describe("LoginHelper - Calendar functions", () => {
  describe("fetchCalendarName", () => {
    // Test fallback behavior if API key is missing.
    it("returns fallback if API key is missing", async () => {
      delete process.env.EXPO_PUBLIC_GOOGLE_API_KEY2;
      const result = await fetchCalendarName("test-calendar", 1);
      expect(result).toBe("Calendar 1");
      expect(global.fetch).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith("Google API key is missing.");
    });

    // Test warning and fallback if response is not ok.
    it("warns and returns fallback if response not ok", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: jest.fn(),
      });
      const result = await fetchCalendarName("test-calendar", 2);
      expect(result).toBe("Calendar 2");
      expect(console.warn).toHaveBeenCalledWith(
        "Warning: Unable to fetch calendar name for test-calendar (Status: 404)"
      );
    });

    // Test fallback when JSON response has no summary.
    it("returns fallback if json has no summary", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });
      const result = await fetchCalendarName("test-calendar", 3);
      expect(result).toBe("Calendar 3");
    });

    // Test valid response returns the calendar summary.
    it("returns data.summary if valid", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ summary: "MyCalendar" }),
      });
      const result = await fetchCalendarName("test-calendar", 4);
      expect(result).toBe("MyCalendar");
    });

    // Test error handling when fetch throws an exception.
    it("logs error and returns fallback if an exception is thrown", async () => {
      global.fetch.mockRejectedValueOnce(new Error("Network error"));
      const result = await fetchCalendarName("test-calendar", 5);
      expect(result).toBe("Calendar 5");
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching calendar name for test-calendar:",
        expect.any(Error)
      );
    });
  });

  // Tests for getAvailableCalendars function.
  describe("getAvailableCalendars", () => {
    it("returns empty array if no calendar IDs are set in env", async () => {
      const result = await getAvailableCalendars();
      expect(result).toEqual([]);
    });

    it("fetches and assigns name for each calendar ID found in env", async () => {
      // Set environment variables for calendar IDs.
      process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_ID1 = "calA";
      process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_ID2 = "calB";

      // Mock fetch for each calendar.
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ summary: "Calendar A" }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: jest.fn(),
        });

      const result = await getAvailableCalendars();
      // Expect calA to return summary and calB to return fallback.
      expect(result).toEqual([
        { id: "calA", name: "Calendar A" },
        { id: "calB", name: "Calendar 2" },
      ]);
    });
  });
});

// Tests for fetching public calendar events.
describe("LoginHelper - fetchPublicCalendarEvents", () => {
  it("returns empty array if API key is missing", async () => {
    delete process.env.EXPO_PUBLIC_GOOGLE_API_KEY2;
    const events = await fetchPublicCalendarEvents("myCal", "2025-01-01", "2025-01-02");
    expect(events).toEqual([]);
    expect(console.error).toHaveBeenCalledWith("Google API key is missing.");
  });

  it("warns and returns empty array if response not ok", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: jest.fn().mockResolvedValue(""),
    });
    const events = await fetchPublicCalendarEvents("myCal", "2025-01-01", "2025-01-02");
    expect(events).toEqual([]);
    expect(console.warn).toHaveBeenCalledWith(
      "Warning: Unable to fetch events for myCal (Status: 403)"
    );
  });

  it("returns empty array if no items are found", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValue(JSON.stringify({ items: [] })),
    });
    const events = await fetchPublicCalendarEvents("myCal", "2025-01-01", "2025-01-02");
    expect(events).toEqual([]);
    expect(console.log).toHaveBeenCalledWith(
      "No events found for myCal in the given range."
    );
  });

  it("parses and returns mapped events if data found", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValue(
        JSON.stringify({
          items: [
            {
              summary: "Event 1",
              start: { dateTime: "2025-01-01T10:00:00Z" },
              end: { dateTime: "2025-01-01T11:00:00Z" },
              description: "Test description",
              location: "Test location",
              htmlLink: "https://link.to/event",
            },
            {
              // Missing some fields to test default values.
              start: { date: "2025-01-02" },
              end: { date: "2025-01-03" },
            },
          ],
        })
      ),
    });

    const events = await fetchPublicCalendarEvents("myCal", "2025-01-01", "2025-01-02");
    expect(events).toEqual([
      {
        id: "myCal-1",
        title: "Event 1",
        start: { dateTime: "2025-01-01T10:00:00Z" },
        end: { dateTime: "2025-01-01T11:00:00Z" },
        description: "Test description",
        location: "Test location",
        eventLink: "https://link.to/event",
      },
      {
        id: "myCal-2",
        title: "No Title",
        start: { dateTime: "2025-01-02" },
        end: { dateTime: "2025-01-03" },
        description: "No description available",
        location: "No location available",
        eventLink: "No link available",
      },
    ]);
  });

  it("returns empty array if fetch throws an error", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network error"));
    const events = await fetchPublicCalendarEvents("myCal", "2025-01-01", "2025-01-02");
    expect(events).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      "Error fetching public calendar (myCal):",
      expect.any(Error)
    );
  });
});

// Tests for session management and user data storage.
describe("LoginHelper - Session & User Data", () => {
  const mockNavigation = { replace: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("checkExistingSession", () => {
    it("navigates if sessionId is found", async () => {
      AsyncStorage.getItem
        .mockResolvedValueOnce("1234") // sessionId found
        .mockResolvedValueOnce(null);   // guestMode not set
      await checkExistingSession(mockNavigation);
      expect(mockNavigation.replace).toHaveBeenCalledWith("Home");
    });

    it("navigates if guestMode is 'true'", async () => {
      AsyncStorage.getItem
        .mockResolvedValueOnce(null)    // no sessionId
        .mockResolvedValueOnce("true"); // guestMode set to true
      await checkExistingSession(mockNavigation);
      expect(mockNavigation.replace).toHaveBeenCalledWith("Home");
    });

    it("does nothing if no session or guest mode", async () => {
      AsyncStorage.getItem
        .mockResolvedValueOnce(null) // no sessionId
        .mockResolvedValueOnce(null); // no guestMode
      await checkExistingSession(mockNavigation);
      expect(mockNavigation.replace).not.toHaveBeenCalled();
    });

    it("logs error on exception", async () => {
      const err = new Error("AsyncStorage error");
      AsyncStorage.getItem.mockRejectedValueOnce(err);
      await checkExistingSession(mockNavigation);
      expect(console.error).toHaveBeenCalledWith("Error checking session:", err);
    });
  });

  describe("storeUserData", () => {
    it("stores user data, fetches calendars, sets default, and navigates to Home", async () => {
      // Provide a dummy user.
      const user = {
        fullName: "Test User",
        primaryEmailAddress: { emailAddress: "test@example.com" },
        imageUrl: "https://example.com/avatar.png",
      };

      // Set an environment variable for a calendar ID.
      process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_ID1 = "cal1@domain.com";

      // Mock fetch call for getAvailableCalendars.
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ summary: "Calendar One" }),
      });

      await storeUserData(user, mockNavigation);

      // Expect AsyncStorage to store userData.
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "userData",
        JSON.stringify({
          fullName: "Test User",
          email: "test@example.com",
          imageUrl: "https://example.com/avatar.png",
        })
      );

      // Expect availableCalendars to be set.
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "availableCalendars",
        JSON.stringify([{ id: "cal1@domain.com", name: "Calendar One" }])
      );
      // Expect default selectedCalendar to be set.
      expect(AsyncStorage.setItem).toHaveBeenCalledWith("selectedCalendar", "cal1@domain.com");
      expect(mockNavigation.replace).toHaveBeenCalledWith("Home");
    });

    it("does nothing if user is null", async () => {
      await storeUserData(null, mockNavigation);
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
      expect(mockNavigation.replace).not.toHaveBeenCalled();
    });

    it("logs an error if an exception is thrown", async () => {
      const user = { fullName: "Err User" };
      const err = new Error("Storage error");
      AsyncStorage.setItem.mockRejectedValueOnce(err);
      await storeUserData(user, mockNavigation);
      expect(console.error).toHaveBeenCalledWith("Error storing user data:", err);
    });
  });

  describe("handleGuestLogin", () => {
    it("sets guest mode, stores userData, and navigates to Home", async () => {
      await handleGuestLogin(mockNavigation);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith("guestMode", "true");
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "userData",
        JSON.stringify({
          guest: true,
          fullName: "Guest User",
          email: "guest@demo.com",
          imageUrl: null,
        })
      );
      expect(mockNavigation.replace).toHaveBeenCalledWith("Home");
    });

    it("logs an error if setting guest mode fails", async () => {
      const err = new Error("setItem failure");
      AsyncStorage.setItem.mockRejectedValueOnce(err);
      await handleGuestLogin(mockNavigation);
      expect(console.error).toHaveBeenCalledWith("Error setting guest mode:", err);
    });
  });
});
