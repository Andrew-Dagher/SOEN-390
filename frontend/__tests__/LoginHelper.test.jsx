/**
 * @file LoginHelper.test.jsx
 * @description Test suite for LoginHelper utilities.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fetchCalendarName,
  getAvailableCalendars,
  fetchPublicCalendarEvents,
  checkExistingSession,
  storeUserData,
  handleGuestLogin,
} from "../app/screens/login/LoginHelper";

// Mock global fetch
global.fetch = jest.fn();

// Silence logs in tests
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

beforeEach(() => {
  jest.clearAllMocks();
  process.env.EXPO_PUBLIC_GOOGLE_API_KEY2 = "VALID_API_KEY"; // default API key for tests
});
afterEach(() => {
  delete process.env.EXPO_PUBLIC_GOOGLE_API_KEY2;
  // Remove any test calendar env variables
  Object.keys(process.env)
    .filter((key) => key.startsWith("EXPO_PUBLIC_GOOGLE_CALENDAR_ID"))
    .forEach((key) => delete process.env[key]);
});

// -----------------------------------------------------------------------------
// fetchCalendarName
// -----------------------------------------------------------------------------
describe("fetchCalendarName", () => {
  test("returns fallback + logs error if API key is missing", async () => {
    delete process.env.EXPO_PUBLIC_GOOGLE_API_KEY2;
    const result = await fetchCalendarName("TestCal", 1);
    expect(result).toBe("Calendar 1");
    expect(console.error).toHaveBeenCalledWith("Google API key is missing.");
  });

  test("warns + returns fallback if response not ok", async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 404, json: jest.fn() });
    const result = await fetchCalendarName("BadCal", 2);
    expect(result).toBe("Calendar 2");
    expect(console.warn).toHaveBeenCalledWith(
      "Warning: Unable to fetch calendar name for BadCal (Status: 404)"
    );
  });

  test("returns fallback if JSON has no summary", async () => {
    global.fetch.mockResolvedValue({ ok: true, json: jest.fn().mockResolvedValue({}) });
    const result = await fetchCalendarName("NoSummaryCal", 3);
    expect(result).toBe("Calendar 3");
  });

  test("returns summary if present", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ summary: "My Calendar" }),
    });
    const result = await fetchCalendarName("GoodCal", 4);
    expect(result).toBe("My Calendar");
  });

  test("catches error + logs error + returns fallback", async () => {
    global.fetch.mockRejectedValue(new Error("Network fail"));
    const result = await fetchCalendarName("ErrorCal", 5);
    expect(result).toBe("Calendar 5");
    expect(console.error).toHaveBeenCalledWith(
      "Error fetching calendar name for ErrorCal:",
      expect.any(Error)
    );
  });

  test("returns fallback if calendarId is empty", async () => {
    const result = await fetchCalendarName("", 6);
    expect(result).toBe("Calendar 6");
  });

  test("handles undefined index gracefully", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: jest.fn(),
    });
    const result = await fetchCalendarName("SomeCal", undefined);
    expect(result).toBe("Calendar undefined");
  });
});

// -----------------------------------------------------------------------------
// getAvailableCalendars
// -----------------------------------------------------------------------------
describe("getAvailableCalendars", () => {
  test("returns empty array if no env variables match", async () => {
    const result = await getAvailableCalendars();
    expect(result).toEqual([]);
    expect(console.log).toHaveBeenCalledWith("Available calendars:", []);
  });

  test("fetches names for each calendar ID", async () => {
    process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_ID1 = "cal1@example.com";
    process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_ID2 = "cal2@example.com";

    global.fetch.mockImplementation((url) => {
      if (url.includes("cal1@example.com")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue({ summary: "Cal One" }),
        });
      }
      if (url.includes("cal2@example.com")) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: jest.fn(),
        });
      }
    });

    const result = await getAvailableCalendars();
    expect(result).toEqual([
      { id: "cal1@example.com", name: "Cal One" },
      { id: "cal2@example.com", name: "Calendar 2" },
    ]);
    expect(console.log).toHaveBeenCalledWith("Available calendars:", result);
  });

  test("stops at first missing calendar ID", async () => {
    process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_ID1 = "cal1@example.com";
    process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_ID3 = "cal3@example.com"; // should be ignored

    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ summary: "Cal 1" }),
    });

    const result = await getAvailableCalendars();
    expect(result).toEqual([{ id: "cal1@example.com", name: "Cal 1" }]);
  });
});

// -----------------------------------------------------------------------------
// fetchPublicCalendarEvents
// -----------------------------------------------------------------------------
describe("fetchPublicCalendarEvents", () => {
  test("returns [] + logs error if API key is missing", async () => {
    delete process.env.EXPO_PUBLIC_GOOGLE_API_KEY2;
    const events = await fetchPublicCalendarEvents("MyCal", "2025-01-01", "2025-01-02");
    expect(events).toEqual([]);
    expect(console.error).toHaveBeenCalledWith("Google API key is missing.");
  });

  test("warns + returns [] if response not ok", async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 403, text: jest.fn().mockResolvedValue("") });
    const events = await fetchPublicCalendarEvents("BadCal", "2025-01-01", "2025-01-02");
    expect(events).toEqual([]);
    expect(console.warn).toHaveBeenCalledWith(
      "Warning: Unable to fetch events for BadCal (Status: 403)"
    );
  });

  test("logs + returns [] if no items", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(JSON.stringify({ items: [] })),
    });
    const events = await fetchPublicCalendarEvents("EmptyCal", "2025-01-01", "2025-01-02");
    expect(events).toEqual([]);
    expect(console.log).toHaveBeenCalledWith("No events found for EmptyCal in the given range.");
  });

  test("parses + returns mapped events if data found", async () => {
    const mockData = {
      items: [
        {
          summary: "Event A",
          start: { dateTime: "2025-01-01T10:00:00Z" },
          end: { dateTime: "2025-01-01T11:00:00Z" },
          description: "Desc A",
          location: "Loc A",
          htmlLink: "http://eventA.link",
        },
        {
          start: { date: "2025-01-02" },
          end: { date: "2025-01-02" },
        },
      ],
    };
    global.fetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(JSON.stringify(mockData)),
    });

    const events = await fetchPublicCalendarEvents("FullCal", "2025-01-01", "2025-01-02");
    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({
      id: "FullCal-1",
      title: "Event A",
      description: "Desc A",
      location: "Loc A",
      eventLink: "http://eventA.link",
    });
    expect(events[1]).toMatchObject({
      id: "FullCal-2",
      title: "No Title",
      start: { dateTime: "2025-01-02" },
      end: { dateTime: "2025-01-02" },
    });
  });

  test("catches + logs error + returns [] if fetch throws", async () => {
    global.fetch.mockRejectedValue(new Error("Network fail"));
    const events = await fetchPublicCalendarEvents("ErrCal", "2025-01-01", "2025-01-02");
    expect(events).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      "Error fetching public calendar (ErrCal):",
      expect.any(Error)
    );
  });

  test("handles malformed JSON", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue("INVALID_JSON"),
    });
    const events = await fetchPublicCalendarEvents("BadJsonCal", "2025-01-01", "2025-01-02");
    expect(events).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      "Error fetching public calendar (BadJsonCal):",
      expect.any(Error)
    );
  });

  test("handles event missing start/end", async () => {
    const mockData = {
      items: [
        {
          summary: "Incomplete Event",
          description: "No times",
          htmlLink: "https://event.link",
        },
      ],
    };
    global.fetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(JSON.stringify(mockData)),
    });

    const events = await fetchPublicCalendarEvents("NoTimeCal", "2025-01-01", "2025-01-02");
    expect(events[0]).toMatchObject({
      title: "Incomplete Event",
      start: { dateTime: "Unknown Start" },
      end: { dateTime: "Unknown End" },
    });
  });
});

// -----------------------------------------------------------------------------
// storeUserData
// -----------------------------------------------------------------------------
describe("storeUserData", () => {
  const mockNavigation = { replace: jest.fn() };

  test("stores user data + navigates Home", async () => {
    const user = {
      fullName: "Testing User",
      primaryEmailAddress: { emailAddress: "test@example.com" },
      imageUrl: "https://example.com/photo.png",
    };
    process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_ID1 = "cal@example.com";

    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ summary: "MyCal" }),
    });

    await storeUserData(user, mockNavigation);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "userData",
      JSON.stringify({
        fullName: "Testing User",
        email: "test@example.com",
        imageUrl: "https://example.com/photo.png",
      })
    );
    expect(mockNavigation.replace).toHaveBeenCalledWith("Home");
  });

  test("logs if calendars empty but still navigates", async () => {
    const user = {
      fullName: "Empty Cal User",
      primaryEmailAddress: { emailAddress: "ecal@example.com" },
      imageUrl: "https://example.com/emptycal.png",
    };
    jest
      .spyOn(require("../app/screens/login/LoginHelper"), "getAvailableCalendars")
      .mockResolvedValue([]);

    await storeUserData(user, mockNavigation);
    expect(console.log).toHaveBeenCalledWith("No calendars found.");
    expect(mockNavigation.replace).toHaveBeenCalledWith("Home");
  });

  test("does nothing if user is null", async () => {
    await storeUserData(null, mockNavigation);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(mockNavigation.replace).not.toHaveBeenCalled();
  });

  test("logs error if AsyncStorage fails", async () => {
    const user = { fullName: "Failing User" };
    const mockErr = new Error("Storing error");
    AsyncStorage.setItem.mockRejectedValueOnce(mockErr);
    await storeUserData(user, mockNavigation);
    expect(console.error).toHaveBeenCalledWith("Error storing user data:", mockErr);
  });
});

// -----------------------------------------------------------------------------
// checkExistingSession
// -----------------------------------------------------------------------------
describe("checkExistingSession", () => {
  const mockNavigation = { replace: jest.fn() };

  test("navigates Home if sessionId is found", async () => {
    AsyncStorage.getItem.mockResolvedValueOnce("sessionXYZ");
    await checkExistingSession(mockNavigation);
    expect(mockNavigation.replace).toHaveBeenCalledWith("Home");
  });

  test("navigates Home if guestMode = 'true'", async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    AsyncStorage.getItem.mockResolvedValueOnce("true");
    await checkExistingSession(mockNavigation);
    expect(mockNavigation.replace).toHaveBeenCalledWith("Home");
  });

  test("does nothing if no sessionId or guestMode", async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    await checkExistingSession(mockNavigation);
    expect(mockNavigation.replace).not.toHaveBeenCalled();
  });

  test("logs error if AsyncStorage fails", async () => {
    const err = new Error("Session error");
    AsyncStorage.getItem.mockRejectedValueOnce(err);
    await checkExistingSession(mockNavigation);
    expect(console.error).toHaveBeenCalledWith("Error checking session:", err);
  });

  test("handles unexpected string values from AsyncStorage", async () => {
    AsyncStorage.getItem.mockResolvedValueOnce("false");
    AsyncStorage.getItem.mockResolvedValueOnce("maybe");
    await checkExistingSession(mockNavigation);
    expect(mockNavigation.replace).not.toHaveBeenCalled();
  });
});

// -----------------------------------------------------------------------------
// handleGuestLogin
// -----------------------------------------------------------------------------
describe("handleGuestLogin", () => {
  const mockNavigation = { replace: jest.fn() };

  test("logs + stores guest data + navigates Home", async () => {
    await handleGuestLogin(mockNavigation);
    expect(console.log).toHaveBeenCalledWith("Guest Login Selected");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("guestMode", "true");
    expect(mockNavigation.replace).toHaveBeenCalledWith("Home");
  });

  test("logs error if setting guest data fails", async () => {
    const mockErr = new Error("Failed to store guest data");
    AsyncStorage.setItem.mockRejectedValueOnce(mockErr);
    await handleGuestLogin(mockNavigation);
    expect(console.error).toHaveBeenCalledWith("Error setting guest mode:", mockErr);
  });
});
