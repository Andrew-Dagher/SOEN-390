/**
 * @file MyLocationIcon.jsx
 * @description A React Native SVG component representing a location icon.
 */

import * as React from "react";
import Svg, { Path } from "react-native-svg";

/**
 * MyLocationIcon component renders a circular location marker icon.
 *
 * @component
 * @param {Object} props - Component properties.
 * @returns {JSX.Element} The rendered SVG icon.
 */
const MyLocationIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    {...props}
  >
    {/* Location Marker */}
    <Path
      fill="#4F7FCC"
      stroke="#4F7FCC"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.333}
      d="M7.719 14.438A6.719 6.719 0 1 0 7.719 1a6.719 6.719 0 0 0 0 13.438Z"
    />
  </Svg>
);

export default MyLocationIcon;
