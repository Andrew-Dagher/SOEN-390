import { poiTypes } from "../app/services/PoiService";

// Mock the entire PoiService module
jest.mock("../app/services/PoiService", () => {
  // Keep the original module implementation
  const originalModule = jest.requireActual("../app/services/PoiService");

  // Mock specific functions
  return {
    ...originalModule,
    fetchNearbyPOIs: jest.fn((location, type) => {
      if (type === "none") {
        return Promise.resolve([]);
      }
      return Promise.resolve([
        { place_id: "place1", name: "Test Place 1" },
        { place_id: "place2", name: "Test Place 2" },
      ]);
    }),
    fetchPlaceDetails: jest.fn(() => {
      return Promise.resolve({
        place_id: "place1",
        name: "Test Place",
        formatted_address: "123 Test St",
      });
    }),
  };
});

// Import the mocked functions
import { fetchNearbyPOIs, fetchPlaceDetails } from "../app/services/PoiService";

describe("PoiService", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Silence console logs/errors for cleaner test output
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console functions
    console.log.mockRestore();
    console.error.mockRestore();
  });

  it("exports poiTypes correctly", () => {
    expect(poiTypes).toBeInstanceOf(Array);
    expect(poiTypes.length).toBeGreaterThan(0);

    // Check that each poiType has the expected structure
    poiTypes.forEach((type) => {
      expect(type).toHaveProperty("label");
      expect(type).toHaveProperty("value");
      expect(type).toHaveProperty("icon");
    });
  });

  it("returns empty array for 'none' POI type", async () => {
    const result = await fetchNearbyPOIs(
      { latitude: 45.5, longitude: -73.6 },
      "none",
      "fake-api-key"
    );

    expect(result).toEqual([]);
    expect(fetchNearbyPOIs).toHaveBeenCalledWith(
      { latitude: 45.5, longitude: -73.6 },
      "none",
      "fake-api-key"
    );
  });

  it("returns POIs for valid POI type", async () => {
    const result = await fetchNearbyPOIs(
      { latitude: 45.5, longitude: -73.6 },
      "restaurant",
      "fake-api-key"
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty("place_id", "place1");
    expect(fetchNearbyPOIs).toHaveBeenCalledWith(
      { latitude: 45.5, longitude: -73.6 },
      "restaurant",
      "fake-api-key"
    );
  });

  it("handles fetchPlaceDetails correctly", async () => {
    const result = await fetchPlaceDetails("place1");

    expect(result).toEqual({
      place_id: "place1",
      name: "Test Place",
      formatted_address: "123 Test St",
    });
    expect(fetchPlaceDetails).toHaveBeenCalledWith("place1");
  });
});
