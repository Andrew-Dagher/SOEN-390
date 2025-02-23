import { useAppSettings } from "./AppSettingsContext";

const getThemeColors = () => {
  const colorBlindMode = useAppSettings();
  const blinder = require("color-blind");
  switch (colorBlindMode) {
    case "deuteranomaly":
      return {
        backgroundColor: blinder.deuteranomaly("#7c2933"),
        textColor: "#FFF",
        polygonFillColor: "#a68a8a"
      };
    case "protanomaly":
      return {
        backgroundColor: blinder.protanomaly("#7c2933"),
        textColor: "#FFF",
        polygonFillColor: "#877777"
      };
    case "tritanomaly":
      return {
        backgroundColor: blinder.tritanomaly("#7c2933"),
        textColor: "#FFF",
        polygonFillColor: "rgba(145, 69, 79, 0.5)"
      };
    default:
      return {
        backgroundColor: "#7c2933", 
        textColor: "#FFF",
        polygonFillColor: "rgba(134, 37, 50, 0.5)" };
  }
};

export default getThemeColors;
