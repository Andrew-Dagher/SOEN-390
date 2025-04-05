/**
 * @file NavigationUtils.test.js
 * Jest tests for NavigationUtils.js
 */

import * as navigationUtils from '../app/screens/navigation/NavigationUtils.js';

describe('NavigationUtils', () => {
  describe('findClosestPoint', () => {
    test('returns null if points array is empty', () => {
      const reference = { latitude: 45, longitude: -73 };
      const points = [];
      const result = navigationUtils.findClosestPoint(reference, points);
      expect(result).toBeNull();
    });

    test('returns the single point if array has only one element', () => {
      const reference = { latitude: 0, longitude: 0 };
      const points = [{ lat: 10, lng: 20 }];
      const result = navigationUtils.findClosestPoint(reference, points);
      expect(result).toEqual({ lat: 10, lng: 20 });
    });

    test('returns correct closest point when there are multiple', () => {
      /**
       * We indirectly test the Haversine formula here:
       * - (0, 1) is ~111.32 km from (0,0)
       * - (0, 2) is ~222.64 km from (0,0)
       * - (1, 1) is a bit more complicated, but it's definitely > 111.32 km
       */
      const reference = { latitude: 0, longitude: 0 };
      const points = [
        { lat: 0, lng: 1 },
        { lat: 0, lng: 2 },
        { lat: 1, lng: 1 },
      ];
      const result = navigationUtils.findClosestPoint(reference, points);
      // We expect (0,1) to be chosen as the closest
      expect(result).toEqual({ lat: 0, lng: 1 });
    });

    test('handles negative lat/lng values correctly', () => {
      /**
       * Indirectly checks correctness of toRadians and Haversine:
       * reference = (0, 0)
       * points = (0, -1), (-1, -1)
       * (0, -1) should be ~111.32 km away
       * (-1, -1) is more than that
       */
      const reference = { latitude: 0, longitude: 0 };
      const points = [
        { lat: 0, lng: -1 },
        { lat: -1, lng: -1 },
      ];
      const result = navigationUtils.findClosestPoint(reference, points);
      expect(result).toEqual({ lat: 0, lng: -1 });
    });
  });

  describe('IsAtSGW', () => {
    test('returns false if currentLocation is null', () => {
      expect(navigationUtils.IsAtSGW(null)).toBe(false);
      expect(navigationUtils.IsAtSGW(undefined)).toBe(false);
    });

    test('returns true if currentLocation is exactly SGWLocation', () => {
      // Hardcode your SGWLocation from navigationConfig if you want an exact test, e.g.:
      // SGWLocation = { latitude: 45.4973, longitude: -73.5792 };
      const sgwLocation = { latitude: 45.4973, longitude: -73.5792 };
      expect(navigationUtils.IsAtSGW(sgwLocation)).toBe(true);
    });

    test('returns false if currentLocation is exactly LoyolaLocation', () => {
      // Hardcode your LoyolaLocation from navigationConfig if you want an exact test, e.g.:
      // LoyolaLocation = { latitude: 45.4582, longitude: -73.6405 };
      const loyolaLocation = { latitude: 45.4582, longitude: -73.6405 };
      expect(navigationUtils.IsAtSGW(loyolaLocation)).toBe(false);
    });

    test('returns true if currentLocation is closer to SGW than Loyola', () => {
      /**
       * This location is artificially chosen to be much closer to SGW than to Loyola.
       * As soon as the Euclidean distance to SGW < distance to Loyola, it should return true.
       */
      const closerToSGW = { latitude: 45.497, longitude: -73.579 };
      expect(navigationUtils.IsAtSGW(closerToSGW)).toBe(true);
    });

    test('returns false if currentLocation is closer to Loyola than SGW', () => {
      const closerToLoyola = { latitude: 45.46, longitude: -73.64 };
      expect(navigationUtils.IsAtSGW(closerToLoyola)).toBe(false);
    });
  });
});
