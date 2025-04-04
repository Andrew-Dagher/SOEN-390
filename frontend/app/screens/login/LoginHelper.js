import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Fetches the calendar metadata (including the name) using the Google Calendar API.
 *
 * @param {string} calendarId - The public Google Calendar ID.
 * @returns {Promise<string>} The calendar name (summary) or a fallback name if fetch fails.
 */
export async function fetchCalendarName(calendarId, index) {
  try {
    const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY2;
    if (!GOOGLE_API_KEY) {
      console.error("Google API key is missing.");
      return `Calendar ${index}`;
    }

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      calendarId
    )}?key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
      console.warn(
        `Warning: Unable to fetch calendar name for ${calendarId} (Status: ${response.status})`
      );
      return `Calendar ${index}`;
    }

    const data = await response.json();
    return data.summary || `Calendar ${index}`;
  } catch (error) {
    console.error(`Error fetching calendar name for ${calendarId}:`, error);
    return `Calendar ${index}`;
  }
}

/**
 * Fetches all available calendar IDs from environment variables and retrieves their names.
 *
 * @returns {Promise<Array<{id: string, name: string}>>} Array of calendar objects with ID and name.
 */
export async function getAvailableCalendars() {
  const calendars = [];
  let index = 1;

  // Gather all EXPO_PUBLIC_GOOGLE_CALENDAR_ID* from env
  while (true) {
    const calendarIdKey = `EXPO_PUBLIC_GOOGLE_CALENDAR_ID${index}`;
    const calendarId = process.env[calendarIdKey];
    if (!calendarId) break;

    calendars.push({
      id: calendarId,
      name: "",
    });
    index++;
  }

  // Fetch each calendar's name
  await Promise.all(
    calendars.map(async (calendar, idx) => {
      calendar.name = await fetchCalendarName(calendar.id, idx + 1);
    })
  );

  console.log("Available calendars:", calendars);
  return calendars;
}

/**
 * Fetches public Google Calendar events within a given date range.
 *
 * @param {string} calendarId - The public Google Calendar ID.
 * @param {string} startDate - Start of the range (ISO format).
 * @param {string} endDate - End of the range (ISO format).
 * @returns {Promise<Array>} Array of event objects.
 */
export async function fetchPublicCalendarEvents(calendarId, startDate, endDate) {
  try {
    const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY2;
    if (!GOOGLE_API_KEY) {
      console.error("Google API key is missing.");
      return [];
    }

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      calendarId
    )}/events?key=${GOOGLE_API_KEY}&timeMin=${startDate}&timeMax=${endDate}&singleEvents=true&orderBy=startTime`;

    console.log(`Fetching events from ${startDate} to ${endDate} for:`, calendarId);

    const response = await fetch(url);
    const textResponse = await response.text();

    if (!response.ok) {
      console.warn(
        `Warning: Unable to fetch events for ${calendarId} (Status: ${response.status})`
      );
      return [];
    }

    const data = JSON.parse(textResponse);

    if (!data.items || data.items.length === 0) {
      console.log(`No events found for ${calendarId} in the given range.`);
      return [];
    }

    return data.items.map((event, index) => ({
      id: `${calendarId}-${index + 1}`,
      title: event.summary || "No Title",
      start: {
        dateTime: event.start?.dateTime || event.start?.date || "Unknown Start",
      },
      end: {
        dateTime: event.end?.dateTime || event.end?.date || "Unknown End",
      },
      description: event.description || "No description available",
      location: event.location || "No location available",
      eventLink: event.htmlLink || "No link available",
    }));
  } catch (error) {
    console.error(`Error fetching public calendar (${calendarId}):`, error);
    return [];
  }
}

/**
 * Checks if there is an existing user session or guest mode.
 * If a session or guest mode is found, navigates to the Home screen.
 *
 * @param {Function} navigation - React Navigation function for navigation control.
 */
export async function checkExistingSession(navigation) {
  try {
    const sessionId = await AsyncStorage.getItem("sessionId");
    const guestMode = await AsyncStorage.getItem("guestMode");

    if (sessionId) {
      console.log("Existing session found, navigating to Home");
      navigation.replace("Home");
      return;
    }

    if (guestMode === "true") {
      console.log("Guest mode detected, navigating to Home");
      navigation.replace("Home");
      return;
    }
  } catch (error) {
    console.error("Error checking session:", error);
  }
}

/**
 * Stores user data (name, email, image) in AsyncStorage once the user is signed in.
 * Fetches available calendars and sets the default calendar.
 *
 * @param {Object} user - The signed-in user object.
 * @param {Function} navigation - React Navigation function for navigation control.
 */
export async function storeUserData(user, navigation) {
  if (!user) return;

  try {
    const userData = {
      fullName: user.fullName,
      email: user.primaryEmailAddress?.emailAddress,
      imageUrl: user.imageUrl,
    };

    await AsyncStorage.setItem("userData", JSON.stringify(userData));
    console.log("Stored User Data:\n", JSON.stringify(userData, null, 2));

    const calendars = await getAvailableCalendars();
    if (calendars.length > 0) {
      await AsyncStorage.setItem("availableCalendars", JSON.stringify(calendars));
      console.log("Stored available calendars:", calendars);
      await AsyncStorage.setItem("selectedCalendar", calendars[0]?.id || "");
    } else {
      console.log("No calendars found.");
    }

    navigation.replace("Home");
  } catch (error) {
    console.error("Error storing user data:", error);
  }
}

/**
 * Handles guest login by storing guest user data in AsyncStorage.
 * Navigates the user to the Home screen.
 *
 * @param {Function} navigation - React Navigation function for navigation control.
 */
export async function handleGuestLogin(navigation) {
  console.log("Guest Login Selected");
  try {
    const guestData = {
      guest: true,
      fullName: "Guest User",
      email: "guest@demo.com",
      imageUrl: null,
    };

    await AsyncStorage.setItem("guestMode", "true");
    await AsyncStorage.setItem("userData", JSON.stringify(guestData));

    navigation.replace("Home");
  } catch (error) {
    console.error("Error setting guest mode:", error);
  }
}