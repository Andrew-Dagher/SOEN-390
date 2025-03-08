import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  storeUserData,
  fetchPublicCalendarEvents,
  checkExistingSession,
  handleGuestLogin,
  getAvailableCalendars,
  // Note: if fetchCalendarName is not exported, you might need to export it for testing
  fetchCalendarName,
} from "../app/screens/login/LoginHelper";

global.fetch = jest.fn();

describe("Calendar Functions", () => {
  const validApiKey = "VALID_API_KEY";

  beforeEach(() => {
    // Set a valid API key for calendar functions
    process.env.EXPO_PUBLIC_GOOGLE_API_KEY2 = validApiKey;
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.EXPO_PUBLIC_GOOGLE_API_KEY2;
    delete process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_ID1;
    delete process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_ID2;
  });

  test("fetchCalendarName returns fallback if API key is missing", async () => {
    process.env.EXPO_PUBLIC_GOOGLE_API_KEY2 = "";
    const result = await fetchCalendarName("testCalendar", 3);
    expect(result).toEqual("Calendar 3");
  });

  test("fetchCalendarName returns fallback if response is not ok", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: jest.fn(),
    });
    const result = await fetchCalendarName("testCalendar", 4);
    expect(result).toEqual("Calendar 4");
  });

  test("fetchCalendarName returns fallback if JSON does not include summary", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });
    const result = await fetchCalendarName("testCalendar", 5);
    expect(result).toEqual("Calendar 5");
  });

  test("fetchCalendarName returns the calendar summary from JSON", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ summary: "Test Calendar" }),
    });
    const result = await fetchCalendarName("testCalendar", 6);
    expect(result).toEqual("Test Calendar");
  });

  test("fetchCalendarName returns fallback when an error is thrown", async () => {
    global.fetch.mockRejectedValue(new Error("Fetch failed"));
    const result = await fetchCalendarName("testCalendar", 7);
    expect(result).toEqual("Calendar 7");
  });

  test("getAvailableCalendars returns an empty array if no calendar IDs are set", async () => {
    // Ensure no EXPO_PUBLIC_GOOGLE_CALENDAR_ID1 is set
    const calendars = await getAvailableCalendars();
    expect(calendars).toEqual([]);
  });

  test("getAvailableCalendars fetches and assigns names to calendars", async () => {
    // Set two calendar IDs
    process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_ID1 = "cal1";
    process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_ID2 = "cal2";

    // Create a custom fetch implementation for fetchCalendarName calls
    const fetchMock = jest.fn((url) => {
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
    global.fetch = fetchMock;

    const calendars = await getAvailableCalendars();
    // Expect that the first calendar returns its fetched summary,
    // and the second one falls back to "Calendar 2"
    expect(calendars).toEqual([
      { id: "cal1", name: "Calendar One" },
      { id: "cal2", name: "Calendar 2" },
    ]);
  });
});
