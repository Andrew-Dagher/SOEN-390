/**
 * @file LoginHelper.test.jsx
 * @description Test suite specifically covering lines 17-33, 52-56, 62, 86-124, 177-179
 *              in the provided LoginHelper code.
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
// LINES 17–33: fetchCalendarName
// -----------------------------------------------------------------------------
describe("fetchCalendarName", () => {
  test("Line 17–33: returns fallback + logs error if API key is missing", async () => {
    // force missing API key
    delete process.env.EXPO_PUBLIC_GOOGLE_API_KEY2;

    const result = await fetchCalendarName("TestCal", 1);
    expect(result).toBe("Calendar 1");
    expect(console.error).toHaveBeenCalledWith("Google API key is missing.");
  });

  test("warns + returns fallback if response not ok", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: jest.fn(),
    });

    const result = await fetchCalendarName("BadCal", 2);
    expect(result).toBe("Calendar 2");
    expect(console.warn).toHaveBeenCalledWith(
      "Warning: Unable to fetch calendar name for BadCal (Status: 404)"
    );
  });

  test("returns fallback if JSON has no summary", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });

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
});

// -----------------------------------------------------------------------------
// LINES 52–56, 62: getAvailableCalendars
// (looping through env, no calendar IDs, multiple IDs, etc.)
// -----------------------------------------------------------------------------
describe("getAvailableCalendars", () => {
  test("returns empty array if no env variables match EXPO_PUBLIC_GOOGLE_CALENDAR_ID*", async () => {
    // no env set => should break immediately => line 52–56
    const result = await getAvailableCalendars();
    expect(result).toEqual([]);
    expect(console.log).toHaveBeenCalledWith("Available calendars:", []);
  });

  test("fetches names for each calendar ID in the loop", async () => {
    // lines 52–56 => if (!calendarId) break
    // line 62 => after we fetch all names => console.log
    process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_ID1 = "cal1@example.com";
    process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_ID2 = "cal2@example.com";

    // For cal1 => ok => summary: "Cal One"
    // For cal2 => not ok => fallback => "Calendar 2"
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
      return Promise.reject(new Error("Unexpected URL in test"));
    });

    const result = await getAvailableCalendars();
    expect(result).toEqual([
      { id: "cal1@example.com", name: "Cal One" },
      { id: "cal2@example.com", name: "Calendar 2" },
    ]);
    // line 62 => console.log
    expect(console.log).toHaveBeenCalledWith("Available calendars:", result);
  });
});

// -----------------------------------------------------------------------------
// LINES 86–124: fetchPublicCalendarEvents
// (missing API key, no events, error, normal parse, etc.)
// -----------------------------------------------------------------------------
describe("fetchPublicCalendarEvents", () => {
  test("returns [] + logs error if API key is missing (line ~86–90)", async () => {
    delete process.env.EXPO_PUBLIC_GOOGLE_API_KEY2;

    const events = await fetchPublicCalendarEvents("MyCal", "2025-01-01", "2025-01-02");
    expect(events).toEqual([]);
    expect(console.error).toHaveBeenCalledWith("Google API key is missing.");
  });

  test("warns + returns [] if response not ok (line ~96–100)", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 403,
      text: jest.fn().mockResolvedValue(""),
    });

    const events = await fetchPublicCalendarEvents("BadCal", "2025-01-01", "2025-01-02");
    expect(events).toEqual([]);
    expect(console.warn).toHaveBeenCalledWith(
      "Warning: Unable to fetch events for BadCal (Status: 403)"
    );
  });

  test("logs + returns [] if no items (line ~106–110)", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(JSON.stringify({ items: [] })),
    });

    const events = await fetchPublicCalendarEvents("EmptyCal", "2025-01-01", "2025-01-02");
    expect(events).toEqual([]);
    expect(console.log).toHaveBeenCalledWith(
      "No events found for EmptyCal in the given range."
    );
  });

  test("parses + returns mapped events if data found (line ~112–124)", async () => {
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
          // missing summary => "No Title"
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

  test("catches + logs error + returns [] if fetch throws (line ~122–124)", async () => {
    global.fetch.mockRejectedValue(new Error("Network fail"));

    const events = await fetchPublicCalendarEvents("ErrCal", "2025-01-01", "2025-01-02");
    expect(events).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      "Error fetching public calendar (ErrCal):",
      expect.any(Error)
    );
  });
});

// -----------------------------------------------------------------------------
// LINES 177–179: storeUserData (the final navigation.replace("Home") call)
// -----------------------------------------------------------------------------
describe("storeUserData", () => {
  const mockNavigation = { replace: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("stores user data + calls navigation.replace('Home') eventually (lines ~177–179)", async () => {
    const user = {
      fullName: "Testing User",
      primaryEmailAddress: { emailAddress: "test@example.com" },
      imageUrl: "https://example.com/photo.png",
    };

    // Provide some env variable to get a single calendar
    process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_ID1 = "cal@example.com";
    // This fetch => ok => summary => "MyCal"
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ summary: "MyCal" }),
    });

    // Perform storeUserData
    await storeUserData(user, mockNavigation);

    // Confirm user data was stored
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "userData",
      JSON.stringify({
        fullName: "Testing User",
        email: "test@example.com",
        imageUrl: "https://example.com/photo.png",
      })
    );
    // Confirm we set availableCalendars + selectedCalendar
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "availableCalendars",
      JSON.stringify([{ id: "cal@example.com", name: "MyCal" }])
    );
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "selectedCalendar",
      "cal@example.com"
    );
    // Finally, lines 177–179 => navigation.replace("Home")
    expect(mockNavigation.replace).toHaveBeenCalledWith("Home");
  });

  test("logs 'No calendars found.' if calendars array is empty and still replaces Home", async () => {
    const user = {
      fullName: "Empty Cal User",
      primaryEmailAddress: { emailAddress: "ecal@example.com" },
      imageUrl: "https://example.com/emptycal.png",
    };

    // Mock no calendars
    jest
      .spyOn(require("../app/screens/login/LoginHelper"), "getAvailableCalendars")
      .mockResolvedValue([]);

    await storeUserData(user, mockNavigation);
    expect(console.log).toHaveBeenCalledWith("No calendars found.");
    // navigation.replace("Home") is still called
    expect(mockNavigation.replace).toHaveBeenCalledWith("Home");
  });

  test("does nothing if user is null", async () => {
    await storeUserData(null, mockNavigation);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(mockNavigation.replace).not.toHaveBeenCalled();
  });

  test("logs error + does not replace if an exception is thrown", async () => {
    const user = { fullName: "Failing User" };
    const mockErr = new Error("Storing error");
    AsyncStorage.setItem.mockRejectedValueOnce(mockErr);

    await storeUserData(user, mockNavigation);
    expect(console.error).toHaveBeenCalledWith("Error storing user data:", mockErr);
    expect(mockNavigation.replace).not.toHaveBeenCalled();
  });
});

// -----------------------------------------------------------------------------
// For completeness: checkExistingSession & handleGuestLogin coverage
// -----------------------------------------------------------------------------
describe("checkExistingSession", () => {
  const mockNavigation = { replace: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("navigates Home if sessionId is found", async () => {
    AsyncStorage.getItem.mockResolvedValueOnce("sessionXYZ");
    await checkExistingSession(mockNavigation);
    expect(mockNavigation.replace).toHaveBeenCalledWith("Home");
  });

  test("navigates Home if guestMode = 'true'", async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null); // sessionId
    AsyncStorage.getItem.mockResolvedValueOnce("true"); // guestMode
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
});

describe("handleGuestLogin", () => {
  const mockNavigation = { replace: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("logs 'Guest Login Selected', sets data, and calls Home", async () => {
    await handleGuestLogin(mockNavigation);
    expect(console.log).toHaveBeenCalledWith("Guest Login Selected");
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

  test("logs error if setting fails", async () => {
    const mockErr = new Error("Failed to store guest data");
    AsyncStorage.setItem.mockRejectedValueOnce(mockErr);

    await expect(handleGuestLogin(mockNavigation)).resolves.not.toThrow();
    expect(console.error).toHaveBeenCalledWith("Error setting guest mode:", mockErr);
  });
});
