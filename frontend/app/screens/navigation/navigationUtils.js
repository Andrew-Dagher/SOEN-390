import { SGWLocation, LoyolaLocation } from "./navigationConfig";

/**
 * Calculates the closest point from a reference location using the Haversine formula.
 *
 * @param {Object} reference - The reference point.
 * @param {number} reference.latitude - The latitude of the reference point.
 * @param {number} reference.longitude - The longitude of the reference point.
 * @param {Array<Object>} points - Array of points to compare, each with properties:
 * @param {number} points[].lat - The latitude of the point.
 * @param {number} points[].lng - The longitude of the point.
 * @returns {Object|null} The closest point from the array, or null if no points are provided.
 */
export const findClosestPoint = (reference, points) => {
    /**
     * Converts degrees to radians.
     *
     * @param {number} degrees - Angle in degrees.
     * @returns {number} Angle in radians.
     */
    const toRadians = (degrees) => degrees * (Math.PI / 180);
  
    /**
     * Calculates the Haversine distance between two geographic coordinates.
     *
     * @param {number} lat1 - Latitude of the first point.
     * @param {number} lon1 - Longitude of the first point.
     * @param {number} lat2 - Latitude of the second point.
     * @param {number} lon2 - Longitude of the second point.
     * @returns {number} Distance in kilometers.
     */
    const haversineDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Radius of the Earth in kilometers
      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in kilometers
    };
  
    let closestPoint = null;
    let minDistance = Infinity;
  
    // Iterate over each point and calculate the distance to the reference point.
    points.forEach((point) => {
      const distance = haversineDistance(
        reference.latitude,
        reference.longitude,
        point.lat,
        point.lng
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    });
  
    return closestPoint;
  };

/**
 * Determines if the current location is closer to SGW or Loyola based on the Euclidean distance.
 *
 * @param {Object} currentLocation - The current location.
 * @param {number} currentLocation.latitude - The latitude of the current location.
 * @param {number} currentLocation.longitude - The longitude of the current location.
 * @returns {boolean} True if the current location is closer to SGW, false if it's closer to Loyola.
 */
export const IsAtSGW = (currentLocation) => {
  if (currentLocation === undefined || currentLocation === null) return false;

    /**
   * Calculates the Euclidean distance between two geographic points.
   *
   * @param {Object} loc1 - The first location.
   * @param {number} loc1.latitude - The latitude of the first location.
   * @param {number} loc1.longitude - The longitude of the first location.
   * @param {Object} loc2 - The second location.
   * @param {number} loc2.latitude - The latitude of the second location.
   * @param {number} loc2.longitude - The longitude of the second location.
   * @returns {number} The Euclidean distance between the two locations.
   */
  const calculateDistance = (loc1, loc2) => {
    return Math.sqrt(
        Math.pow(loc1.latitude - loc2.latitude, 2) +
        Math.pow(loc1.longitude - loc2.longitude, 2)
    );
  };

  const distanceToSGW = calculateDistance(currentLocation, SGWLocation);
  const distanceToLoyola = calculateDistance(currentLocation, LoyolaLocation);

  return distanceToSGW < distanceToLoyola;

}