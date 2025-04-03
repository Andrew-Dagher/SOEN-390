/**
 * @file ThemeColors.test.js
 */

import getThemeColors from "./getThemeColors";
import { useAppSettings } from "./AppSettingsContext";

// Mock the color-blind library so we can verify which method was called
jest.mock("color-blind", () => ({
  deuteranomaly: jest.fn(() => "#mockedDeuterColor"),
  tritanomaly: jest.fn(() => "#mockedTritanColor"),
}));

// Mock the AppSettingsContext to control the colorBlindMode value
jest.mock("./AppSettingsContext", () => ({
  useAppSettings: jest.fn(),
}));

describe("getThemeColors - specifically testing deuteranomaly & tritanomaly", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns deuteranomaly-themed colors when colorBlindMode is 'deuteranomaly'", () => {
    // Mock our context so colorBlindMode is "deuteranomaly"
    useAppSettings.mockReturnValue({ colorBlindMode: "deuteranomaly" });

    const result = getThemeColors();
    // Since we mocked color-blind.deuteranomaly(...) => "#mockedDeuterColor"
    expect(result).toEqual({
      backgroundColor: "#mockedDeuterColor",
      textColor: "#FFF",
      polygonFillColor: "#a68a8a",
    });
  });

  it("returns tritanomaly-themed colors when colorBlindMode is 'tritanomaly'", () => {
    useAppSettings.mockReturnValue({ colorBlindMode: "tritanomaly" });

    const result = getThemeColors();
    // Our mock for color-blind.tritanomaly(...) => "#mockedTritanColor"
    expect(result).toEqual({
      backgroundColor: "#mockedTritanColor",
      textColor: "#FFF",
      polygonFillColor: "rgba(145, 69, 79, 0.5)",
    });
  });
});
