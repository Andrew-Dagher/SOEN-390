/**
 * Fetches the calendar metadata (including the name) using the Google Calendar API.
 *
 * @param {string} calendarId - The public Google Calendar ID.
 * @returns {Promise<string>} The calendar name (summary) or a fallback name if fetch fails.
 */
async function fetchCalendarName(calendarId, index) {
  try {
    const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY2;
    if (!GOOGLE_API_KEY) {
      console.error("Google API key is missing.");
      return `Calendar ${index}`;
    }

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}?key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Warning: Unable to fetch calendar name for ${calendarId} (Status: ${response.status})`);
      return `Calendar ${index}`;
    }

    const data = await response.json();
    return data.summary || `Calendar ${index}`; // Use the summary as the name, fallback to "Calendar {index}"
  } catch (error) {
    console.error(`Error fetching calendar name for ${calendarId}:`, error);
    return `Calendar ${index}`; // Fallback name in case of error
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

  // Collect all calendar IDs from environment variables dynamically
  while (true) {
    const calendarIdKey = `EXPO_PUBLIC_GOOGLE_CALENDAR_ID${index}`;
    const calendarId = process.env[calendarIdKey];

    if (!calendarId) break; // Stop when no more IDs are found

    calendars.push({
      id: calendarId,
      name: "", // Placeholder, will be updated after fetching
    });
    index++;
  }

  // Fetch names for all calendars with error handling
  await Promise.all(
    calendars.map(async (calendar, idx) => {
      calendar.name = await fetchCalendarName(calendar.id, idx + 1);
    })
  );

  console.log("Available calendars:", calendars);
  return calendars;
}

/**
 * Fetches public Google Calendar events using the given Calendar ID.
 *
 * @param {string} calendarId - The public Google Calendar ID.
 * @returns {Promise<Array>} Array of event objects.
 */
export async function fetchPublicCalendarEvents(calendarId) {
  try {
    const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY2;
    if (!GOOGLE_API_KEY) {
      console.error("Google API key is missing.");
      return [];
    }

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      calendarId
    )}/events?key=${GOOGLE_API_KEY}&timeMin=2000-01-01T00:00:00Z&singleEvents=true&orderBy=startTime`;

    console.log("Fetching events for:", calendarId);

    const response = await fetch(url);
    const textResponse = await response.text();

    if (!response.ok) {
      console.warn(`Warning: Unable to fetch events for ${calendarId} (Status: ${response.status})`);
      return [];
    }

    const data = JSON.parse(textResponse);

    if (!data.items || data.items.length === 0) {
      console.log(`No events found for ${calendarId}.`);
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
    return []; // Return empty array on error to prevent UI crashes
  }
}

//Json sending campus, building and room that will ne provided to next page
const handleGoToClass = (location) => {
  const [campus, building, room] = location.split(" ");
  const jsonData = {
    Campus: campus,
    Building: building.split("-")[0],
    Room: building.includes("-") ? building.split("-")[1] : room,
  };
  alert(JSON.stringify(jsonData, null, 2));
};

