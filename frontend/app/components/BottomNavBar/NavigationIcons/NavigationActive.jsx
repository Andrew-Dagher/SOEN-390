/**
 * @file NavigationActive.jsx
 * @description Renders an active navigation icon using an SVG element. The icon is composed of three distinct paths
 * that form the overall navigation symbol.
 */

import React from "react";
import Svg, { Path } from "react-native-svg";
import getThemeColors from "../../../ColorBindTheme";

/**
 * NavigationActive component renders an SVG icon representing an active navigation state.
 *
 * @component
 * @returns {JSX.Element} The rendered active navigation icon.
 */
const NavigationActive = () => {
  const theme = getThemeColors();
  return (
  <Svg
    width={30}
    height={30}
    viewBox="0 0 34 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Left portion of the icon */}
    <Path 
      d="M0.927068 5.26738C0.199951 6.09503 0.199951 7.51408 0.199951 10.3522V26.0076C0.199951 28.0176 0.199951 29.0226 0.724285 29.7793C1.2486 30.5358 2.1653 30.8536 3.99868 31.4893L6.15567 32.2369C7.32388 32.6421 8.2228 32.9536 8.97717 33.1543C9.46929 33.2853 9.92217 32.8989 9.92217 32.3898V7.13944C9.92217 6.72458 9.61602 6.37446 9.2139 6.27246C8.56518 6.10791 7.7854 5.83756 6.71665 5.46704C4.12788 4.56956 2.83352 4.12083 1.84865 4.57653C1.49897 4.73831 1.18522 4.97351 0.927068 5.26738Z" 
      fill={theme.backgroundColor}
    />
    {/* Center portion of the icon */}
    <Path 
      d="M17.9006 2.49072L15.3406 4.26572C14.4145 4.90785 13.7358 5.37845 13.1562 5.71397C12.8815 5.87298 12.7 6.16063 12.7 6.47802V31.5563C12.7 32.174 13.3399 32.5595 13.8603 32.2266C14.4186 31.8695 15.0581 31.4261 15.8326 30.889L18.3926 29.114C19.3186 28.472 19.9975 28.0013 20.577 27.6658C20.8518 27.5068 21.0333 27.2191 21.0333 26.9018V1.8235C21.0333 1.20585 20.3933 0.820218 19.873 1.15305C19.3146 1.5103 18.6751 1.95368 17.9006 2.49072Z" 
      fill={theme.backgroundColor}
    />
    {/* Right portion of the icon */}
    <Path 
      d="M29.7345 1.89076L27.5775 1.14298C26.4092 0.737929 25.5104 0.426346 24.756 0.225663C24.2639 0.0947625 23.811 0.481046 23.811 0.990279V26.2405C23.811 26.6554 24.1172 27.0055 24.5192 27.1075C25.168 27.272 25.9479 27.5424 27.0165 27.9129C29.6052 28.8104 30.8997 29.2592 31.8845 28.8035C32.2342 28.6417 32.5479 28.4065 32.806 28.1125C33.5332 27.285 33.5332 25.8659 33.5332 23.0279V7.37235C33.5332 5.36238 33.5332 4.3574 33.0089 3.6008C32.4845 2.84418 31.5679 2.52638 29.7345 1.89076Z" 
      fill={theme.backgroundColor}
    />
  </Svg>
)};

export default NavigationActive;
