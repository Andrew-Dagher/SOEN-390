/**
 * @file BuildingInactive.jsx
 * @description Renders an inactive building icon with a burgundy outline.
 */

import React from "react";
import Svg, { Path } from "react-native-svg";
import getThemeColors from "../../../ColorBindTheme";

/**
 * BuildingInactive component renders an SVG icon representing an inactive building.
 *
 * @component
 * @returns {JSX.Element} The rendered inactive building icon.
 */
const BuildingInactive = () => {
  const theme = getThemeColors();
  return(<Svg
    width="32"
    height="34"
    viewBox="0 0 32 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4 32V6C4 4.89543 4.89543 4 6 4H26C27.1046 4 28 4.89543 28 6V32H24V22H8V32H4ZM10 22H22V10H10V22ZM12 12H14V14H12V12ZM18 12H20V14H18V12ZM12 16H14V18H12V16ZM18 16H20V18H18V16Z"
      stroke={theme.backgroundColor}
      strokeWidth="2"
    />
  </Svg>)
};

export default BuildingInactive;
