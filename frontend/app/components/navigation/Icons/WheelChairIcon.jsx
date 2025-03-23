/**
 * @file WheelChairIcon.jsx
 * @description A React Native SVG component for a wheelchair accessibility icon.
 */

import * as React from "react";
import PropTypes from "prop-types"; // Import PropTypes
import Svg, { Path } from "react-native-svg";

/**
 * WheelChairIcon component renders a wheelchair icon.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {number} [props.width=20] - Width of the icon.
 * @param {number} [props.height=20] - Height of the icon.
 * @param {string} [props.color="#E6863C"] - Fill color of the icon.
 * @returns {JSX.Element} The rendered SVG wheelchair icon.
 */
const WheelChairIcon = ({ width = 20, height = 20, color = "#E6863C" }) => (
  <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
    {/* Head */}
    <Path
      fill={color}
      d="M10 5.417a1.667 1.667 0 1 0 0-3.334 1.667 1.667 0 0 0 0 3.334Z"
    />
    
    {/* Body and Wheelchair */}
    <Path
      fill={color}
      d="M16.25 17.083h-.833v-4.166a.834.834 0 0 0-.834-.834h-4.166v-1.666h4.166a.833.833 0 0 0 0-1.667h-4.166V7.083a.834.834 0 0 0-1.667 0v5.834a.833.833 0 0 0 .833.833h4.167v4.167a.833.833 0 0 0 .833.833h1.667a.833.833 0 0 0 0-1.667Z"
    />
    
    {/* Wheel */}
    <Path
      fill={color}
      d="M10.583 15.75a3.333 3.333 0 0 1-6-2 3.333 3.333 0 0 1 2-3.05.836.836 0 0 0-.666-1.533 5 5 0 1 0 6 7.583.833.833 0 1 0-1.334-1Z"
    />
  </Svg>
);

// Define PropTypes for WheelChairIcon component
WheelChairIcon.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  color: PropTypes.string,
};

export default WheelChairIcon;
