/**
 * @file googleCalendarApi.js
 * @description Contains functions to retrieve a Google OAuth access token using Clerk
 * and fetch Google Calendar events using that token.
 */

import { useAuth } from "@clerk/clerk-expo";

/**
 * Retrieves the Google OAuth access token using Clerk's authentication hook.
 *
 * @async
 * @function getGoogleAccessToken
 * @returns {Promise<string|null>} The Google OAuth access token if successful; otherwise, null.
 */
export async function getGoogleAccessToken() {
  try {
    // Retrieve the getToken method from Clerk's auth hook.
    const { getToken } = useAuth(); // ✅ Correct way to get the OAuth token

    // Check if getToken is available.
    if (!getToken) {
      console.error("❌ Clerk's getToken() method is undefined.");
      return null;
    }

    console.log("🔄 Attempting to retrieve Google OAuth token...");

    // Retrieve the OAuth token using the Google OAuth template.
    const token = await getToken({ template: "oauth_google" });

    if (token) {
      console.log("✅ Google Access Token Retrieved:", token);
      return token;
    } else {
      console.warn("⚠️ Google OAuth token is null or undefined.");
      return null;
    }
  } catch (error) {
    console.error("❌ Error fetching Google OAuth token:", error);
    return null;
  }
}

/**
 * Fetches events from the user's primary Google Calendar using the retrieved access token.
 *
 * @async
 * @function fetchGoogleCalendarEvents
 * @returns {Promise<Object|null>} The calendar events data if successful; otherwise, null.
 */
export async function fetchGoogleCalendarEvents() {
  const accessToken = await getGoogleAccessToken();

  // Ensure that an access token was successfully retrieved.
  if (!accessToken) {
    console.error("⚠️ No access token available for Google Calendar.");
    return;
  }

  try {
    // Send a GET request to the Google Calendar API to fetch events.
    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    // Check if the response is successful.
    if (!response.ok) {
      throw new Error(`❌ Error fetching calendar events: ${response.statusText}`);
    }

    // Parse and return the JSON data from the response.
    const data = await response.json();
    console.log("✅ Google Calendar Events:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching Google Calendar events:", error);
    return null;
  }
}
