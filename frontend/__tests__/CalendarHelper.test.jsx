import { handleGoToClass } from "../app/screens/calendar/CalendarHelper";
import * as Location from "expo-location";

jest.mock("expo-location", () => ({
  getCurrentPositionAsync: jest.fn(),
}));

const mockNavigate = jest.fn();
const mockNavigation = { navigate: mockNavigate };

describe("handleGoToClass function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should parse location string correctly and navigate", async () => {
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 45.4971, longitude: -73.5792 },
    });

    await handleGoToClass("SGW, Hall Building, 913", mockNavigation);

    expect(mockNavigate).toHaveBeenCalledWith("Navigation", {
      campus: "sgw",
      buildingName: "Hall Building",
      currentLocation: {
        latitude: 45.4971,
        longitude: -73.5792,
      },
    });
  });

  it("should handle errors gracefully", async () => {
    console.error = jest.fn();
    Location.getCurrentPositionAsync.mockRejectedValue(new Error("Location error"));

    await handleGoToClass("SGW, Hall Building, 913", mockNavigation);

    expect(console.error).toHaveBeenCalledWith(
      "Error fetching location or parsing location string:",
      expect.any(Error)
    );
  });
});
