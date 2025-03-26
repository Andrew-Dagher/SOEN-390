// File: components/Map/POI/PoiService.js
// Updated to properly handle .env API keys

export const poiTypes = [
  { label: "Restaurants", value: "restaurant", icon: "restaurant" },
  { label: "Cafes", value: "cafe", icon: "local-cafe" },
  { label: "Libraries", value: "library", icon: "local-library" },
  { label: "Parking", value: "parking", icon: "local-parking" },
  { label: "ATMs", value: "atm", icon: "local-atm" },
  { label: "Pharmacies", value: "pharmacy", icon: "local-pharmacy" },
  { label: "Bus Stations", value: "bus_station", icon: "directions-bus" },
  { label: "Subway Stations", value: "subway_station", icon: "subway" },
  {
    label: "Grocery Stores",
    value: "grocery_or_supermarket",
    icon: "shopping-cart",
  },
  { label: "Hotels", value: "lodging", icon: "hotel" },
];

/**
 * Fetches nearby Points of Interest from Google Places API
 * @param {Object} location - Location object with latitude and longitude
 * @param {string} type - Type of POI to fetch
 * @returns {Promise<Array>} - Array of POI objects
 */
export async function fetchNearbyPOIs(location, type) {
  if (!location) {
    console.error("No location provided to fetchNearbyPOIs");
    return [];
  }

  try {
    // Extract latitude and longitude, handling different location object formats
    const latitude = location.latitude || location.coords?.latitude;
    const longitude = location.longitude || location.coords?.longitude;

    if (!latitude || !longitude) {
      console.error("Invalid location format:", location);
      return [];
    }

    // Get API key from environment variables
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

    if (!apiKey) {
      console.error("Google API key is missing. Check your .env file.");
      return [];
    }

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1000&type=${type}&key=${apiKey}`;

    console.log(`Fetching POIs for type: ${type}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "OK") {
      console.log(`Found ${data.results.length} POIs of type: ${type}`);
      return data.results;
    } else if (data.status === "ZERO_RESULTS") {
      console.log(`No POIs found of type: ${type}`);
      return [];
    } else {
      console.error("Error fetching POIs:", data.status, data.error_message);
      return [];
    }
  } catch (error) {
    console.error("Error in fetchNearbyPOIs:", error);
    return [];
  }
}

/**
 * Fetches additional details for a specific place
 * @param {string} placeId - Google Place ID
 * @returns {Promise<Object>} - Detailed place information
 */
export async function fetchPlaceDetails(placeId) {
  if (!placeId) return null;

  try {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

    if (!apiKey) {
      console.error("Google API key is missing. Check your .env file.");
      return null;
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,photos,price_level,rating,reviews,url&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK") {
      return data.result;
    } else {
      console.error("Error fetching place details:", data.status);
      return null;
    }
  } catch (error) {
    console.error("Error in fetchPlaceDetails:", error);
    return null;
  }
}
