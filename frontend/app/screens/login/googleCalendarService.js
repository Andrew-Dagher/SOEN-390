/**
 * Fetches Google Calendar events using the correct Google OAuth token.
 */
export async function fetchGoogleCalendarEvents(accessToken) {
  if (!accessToken) {
    console.error("⚠️ No access token provided.");
    return [];
  }

  try {
    console.log("🔄 Fetching Google Calendar events with access token...");

    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`, // ✅ Correctly using OAuth 2.0 token
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("❌ Google API response status:", response.status);
      let errorBody;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text();
      }
      console.error("❌ Google API error body:", errorBody);
      return [];
    }

    const data = await response.json();
    console.log("✅ Google Calendar Events Fetched:", data.items);
    return data.items || [];
  } catch (error) {
    console.error("❌ Error fetching Google Calendar events:", error);
    return [];
  }
}
