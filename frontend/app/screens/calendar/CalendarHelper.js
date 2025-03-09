// CalendarHelper.js
import * as Location from "expo-location";

/**
 * Parses location information, fetches the current device location,
 * and navigates to the appropriate screen with relevant params.
 *
 * @param {string} locationString - e.g. "SGW, Hall Building, 913"
 * @param {object} navigation - The navigation object from React Navigation.
 */
export async function handleGoToClass(locationString, navigation) {
  try {
    const [campus, buildingName] = locationString
      .split(",")
      .map((str) => str.trim());

    // Get the user's current location
    const currentLocation = await Location.getCurrentPositionAsync({});

    // Navigate to your custom "Navigation" screen (adjust as needed)
    navigation.navigate("Navigation", {
      campus: campus.toLowerCase().replace("<pre>", "").trim(),
      buildingName: buildingName
        .replace("<pre>", "")
        .replace("</pre>", "")
        .trim(),
      currentLocation: {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      },
    });
  } catch (error) {
    console.error("Error fetching location or parsing location string:", error);
  }
}
