/**
 * @file CircleIcon.jsx
 * @description Renders a circular icon with customizable color and stroke width.
 */

import * as React from "react";
import PropTypes from "prop-types"; // Import PropTypes
import Svg, { Path } from "react-native-svg";

/**
 * CircleIcon component renders a circular stroke-based icon.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {string} [props.color="#000"] - Stroke color.
 * @param {number} [props.size=10] - Size of the icon (width & height).
 * @param {number} [props.strokeWidth=1.333] - Stroke width.
 * @returns {JSX.Element} The rendered Circle icon.
 */
const CircleIcon = ({ color = "#000", size = 10, strokeWidth = 1.333 }) => (
  <Svg width={size} height={size} viewBox="0 0 10 10" fill="none">
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      d="M5 9.48A4.48 4.48 0 1 0 5 .52a4.48 4.48 0 0 0 0 8.96Z"
    />
  </Svg>
);

// PropTypes validation
CircleIcon.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
};

export default CircleIcon;
