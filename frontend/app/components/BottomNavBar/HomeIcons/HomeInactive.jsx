/**
 * @file HomeInactive.jsx
 * @description Renders an inactive home icon using an SVG element. The icon consists of three main parts:
 * the house outline, the roof, and an accent detail representing a chimney or additional structure.
 */

import React from "react";
import Svg, { Path } from "react-native-svg";
import getThemeColors from "../../../ColorBindTheme";

/**
 * HomeInactive component renders an SVG icon representing an inactive home.
 *
 * @component
 * @returns {JSX.Element} The rendered inactive home icon.
 */
const HomeInactive = () => {
  const theme = getThemeColors();
  return(
  <Svg
    width={30}
    height={30}
    viewBox="0 0 35 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* House outline: defines the main structure of the house */}
    <Path 
      d="M29.4668 11.4736V24.807C29.4668 27.9496 29.4668 29.521 28.4904 30.4973C27.5141 31.4736 25.9428 31.4736 22.8001 31.4736H21.1334H14.4668H12.8001C9.65739 31.4736 8.08604 31.4736 7.10974 30.4973C6.13342 29.521 6.13342 27.9496 6.13342 24.807V11.4736" 
      stroke={theme.backgroundColor} 
      strokeWidth="4" 
      strokeLinejoin="round"
    />
    {/* Roof: creates the triangular roof shape above the house */}
    <Path 
      d="M2.80005 14.8069L10.3 8.14024L15.5855 3.44206C16.8484 2.31944 18.7517 2.31944 20.0145 3.44206L25.3 8.14024L32.8 14.8069" 
      stroke={theme.backgroundColor} 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    {/* Accent detail: represents a chimney or a similar design element on the house */}
    <Path 
      d="M14.4667 31.4736V24.807C14.4667 22.966 15.959 21.4736 17.8 21.4736C19.641 21.4736 21.1333 22.966 21.1333 24.807V31.4736" 
      stroke={theme.backgroundColor} 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
)
};
export default HomeInactive;
