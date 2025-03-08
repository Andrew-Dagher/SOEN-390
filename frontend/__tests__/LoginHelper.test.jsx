import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  storeUserData,
  fetchPublicCalendarEvents,
  checkExistingSession,
  handleGuestLogin,
  getAvailableCalendars,
  // Export fetchCalendarName for testing if it's not already exported
  fetchCalendarName,
} from "../app/screens/login/LoginHelper";

global.fetch = jest.fn();

// Utility to silence expected console outputs during tests.
const noop = () => {};
console.error = jest.fn(noop);
console.warn = jest.fn(noop);
console.log = jest.fn(noop);

describe("Calendar Functions", () => {
  const validApiKey = "VALID_API_KEY";

  beforeEach(() => {
    process.env.EXPO_PUBLIC_GOOGLE_API_KEY2 = validApiKey;
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_GOOGLE_API_KEY2;
    // Remove any calendar env variables
    Object.keys(process.env)
      .filter((key) => key.startsWith("EXPO_PUBLIC_GOOGLE_CALENDAR_ID"))
      .forEach((key) => delete process.env[key]);
  });

  describe("fetchCalendarName", () => {
    test("returns fallback if API key is missing", async () => {
      process.env.EXPO_PUBLIC_GOOGLE_API_KEY2 = "";
      const result = await fetchCalendarName("testCalendar", 3);
      expect(result).toEqual("Calendar 3");
    });

    test("returns fallback if response is not ok", async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: jest.fn(),
      });
      const result = await fetchCalendarName("testCalendar", 4);
      expect(result).toEqual("Calendar 4");
    });

    test("returns fallback if JSON does not include summary", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });
      const result = await fetchCalendarName("testCalendar", 5);
      expect(result).toEqual("Calendar 5");
    });

    test("returns the calendar summary from JSON", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ summary: "Test Calendar" }),
      });
      const result = await fetchCalendarName("testCalendar", 6);
      expect(result).toEqual("Test Calendar");
    });

    test("returns fallback when an error is thrown", async () => {
      global.fetch.mockRejectedValue(new Error("Fetch failed"));
      const result = await fetchCalendarName("testCalendar", 7);
      expect(result).toEqual("Calendar 7");
    });
  });

  describe("getAvailableCalendars", () => {
    test("returns empty array if no calendar IDs are set", async () => {
      const calendars = await getAvailableCalendars();
      expect(calendars).toEqual([]);
    });

    test("fetches and assigns names to calendars", async () => {
      // Set two calendar IDs in env
      process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_ID1 = "cal1";
      process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_ID2 = "cal2";

      // Custom fetch mock for each calendar
      global.fetch.mockImplementation((url) => {
        if (url.includes("cal1")) {
          return Promise.resolve({
            ok: true,
            json: jest.fn().mockResolvedValue({ summary: "Calendar One" }),
          });
        } else if (url.includes("cal2")) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: jest.fn(),
          });
        }
        return Promise.reject(new Error("Unexpected calendar"));
      });

      const calendars = await getAvailableCalendars();
      expect(calendars).toEqual([
        { id: "cal1", name: "Calendar One" },
        { id: "cal2", name: "Calendar 2" },
      ]);
    });
  });
});

describe("fetchPublicCalendarEvents", () => {
  const validApiKey = "VALID_API_KEY";

  beforeEach(() => {
    process.env.EXPO_PUBLIC_GOOGLE_API_KEY2 = validApiKey;
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_GOOGLE_API_KEY2;
  });

  test("returns empty array if API key is missing", async () => {
    process.env.EXPO_PUBLIC_GOOGLE_API_KEY2 = "";
    const events = await fetchPublicCalendarEvents("calendar-id", "2025-03-10", "2025-03-11");
    expect(events).toEqual([]);
  });

  test("returns empty array if response is not ok", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 404,
      text: jest.fn().mockResolvedValue(""),
    });
    const events = await fetchPublicCalendarEvents("calendar-id", "2025-03-10", "2025-03-11");
    expect(events).toEqual([]);
  });

  test("returns empty array if no events are found", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(JSON.stringify({ items: [] })),
    });
    const events = await fetchPublicCalendarEvents("calendar-id", "2025-03-10", "2025-03-11");
    expect(events).toEqual([]);
  });

  test("parses and maps events correctly", async () => {
    const eventData = {
      items: [
        {
          summary: "Event One",
          start: { dateTime: "2025-03-10T10:00:00Z" },
          end: { dateTime: "2025-03-10T11:00:00Z" },
          description: "Description One",
          location: "Location One",
          htmlLink: "http://event.link/1",
        },
        {
          // Missing summary, dateTime provided as date
          start: { date: "2025-03-11" },
          end: { date: "2025-03-11" },
        },
      ],
    };

    global.fetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(JSON.stringify(eventData)),
    });

    const events = await fetchPublicCalendarEvents("calendar-id", "2025-03-10", "2025-03-11");
    expect(events).toEqual([
      {
        id: "calendar-id-1",
        title: "Event One",
        start: { dateTime: "2025-03-10T10:00:00Z" },
        end: { dateTime: "2025-03-10T11:00:00Z" },
        description: "Description One",
        location: "Location One",
        eventLink: "http://event.link/1",
      },
      {
        id: "calendar-id-2",
        title: "No Title",
        start: { dateTime: "2025-03-11" },
        end: { dateTime: "2025-03-11" },
        description: "No description available",
        location: "No location available",
        eventLink: "No link available",
      },
    ]);
  });

  test("returns empty array when fetch throws error", async () => {
    global.fetch.mockRejectedValue(new Error("Network Error"));
    const events = await fetchPublicCalendarEvents("calendar-id", "2025-03-10", "2025-03-11");
    expect(events).toEqual([]);
  });
});

describe("User Data and Session Functions", () => {
  const mockNavigation = { replace: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("storeUserData: stores user data and calendars when calendars exist", async () => {
    const user = {
      fullName: "Test User",
      primaryEmailAddress: { emailAddress: "test@test.com" },
      imageUrl: "https://test.com/image.png",
    };

    // Set an environment variable so that getAvailableCalendars returns a calendar.
    process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_ID1 = "cal1";
    // Mock getAvailableCalendars to return a calendar list with one calendar having a summary.
    const calendarMock = [{ id: "cal1", name: "Calendar One" }];
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ summary: "Calendar One" }),
    });
    // Override getAvailableCalendars to avoid multiple fetch calls if needed
    jest.spyOn(require("../app/screens/login/LoginHelper"), "getAvailableCalendars").mockResolvedValue(calendarMock);

    await storeUserData(user, mockNavigation);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "userData",
      JSON.stringify({
        fullName: "Test User",
        email: "test@test.com",
        imageUrl: "https://test.com/image.png",
      })
    );
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("availableCalendars", JSON.stringify(calendarMock));
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("selectedCalendar", "cal1");
    expect(mockNavigation.replace).toHaveBeenCalledWith("Home");
  });

  test("storeUserData: logs error if AsyncStorage fails", async () => {
    const user = {
      fullName: "Test User",
      primaryEmailAddress: { emailAddress: "test@test.com" },
      imageUrl: "https://test.com/image.png",
    };
    AsyncStorage.setItem.mockRejectedValue(new Error("Storage Error"));
    await storeUserData(user, mockNavigation);
    // Even if storage fails, navigation.replace should not be called
    expect(mockNavigation.replace).not.toHaveBeenCalled();
  });

  test("checkExistingSession: navigates to Home if session exists", async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({ fullName: "Test User" }));
    await checkExistingSession(mockNavigation);
    expect(mockNavigation.replace).toHaveBeenCalledWith("Home");
  });

  test("checkExistingSession: navigates to Home if guest mode is active", async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    AsyncStorage.getItem.mockResolvedValueOnce("true");
    await checkExistingSession(mockNavigation);
    expect(mockNavigation.replace).toHaveBeenCalledWith("Home");
  });

  test("checkExistingSession: does nothing if no session or guest mode", async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    await checkExistingSession(mockNavigation);
    expect(mockNavigation.replace).not.toHaveBeenCalled();
  });

  test("handleGuestLogin: sets guest mode and navigates to Home", async () => {
    await handleGuestLogin(mockNavigation);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("guestMode", "true");
    expect(mockNavigation.replace).toHaveBeenCalledWith("Home");
  });

  test("handleGuestLogin: handles storage errors gracefully", async () => {
    AsyncStorage.setItem.mockRejectedValue(new Error("Storage error"));
    await expect(handleGuestLogin(mockNavigation)).resolves.not.toThrow();
  });
});
