import { useAppSettings } from "./TextSizeContext";

const getThemeColors = () => {
  const { colorBlindMode } = useAppSettings();
  const blinder = require("color-blind");
  switch (colorBlindMode) {
    case "deuteranomaly":
      return {
        backgroundColor: blinder.deuteranomaly("#7c2933"),
        textColor: "#FFF",
      };
    case "protanomaly":
      return {
        backgroundColor: blinder.protanomaly("#7c2933"),
        textColor: "#FFF",
      };
    case "tritanomaly":
      return {
        backgroundColor: blinder.tritanomaly("#7c2933"),
        textColor: "#FFF",
      };
    default:
      return { backgroundColor: "#7c2933", textColor: "#FFF" };
  }
};

export default getThemeColors;
