/**
 * @file DotsIcon.jsx
 * @description A reusable dots icon with customizable size and color.
 */

import React from "react";
import PropTypes from "prop-types"; // Import PropTypes
import Svg, { Path } from "react-native-svg";

/**
 * DotsIcon component renders a vertical three-dot icon.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {number} [props.width=30] - Width of the icon.
 * @param {number} [props.height=30] - Height of the icon.
 * @param {string} [props.color="#000"] - Stroke color of the icon.
 * @param {number} [props.strokeWidth=5.333] - Stroke width of the dots.
 * @returns {JSX.Element} The rendered dots icon.
 */
const DotsIcon = ({
  width = 30,
  height = 30,
  color = "#000",
  strokeWidth = 5.333,
}) => (
  <Svg width={width} height={height} viewBox="0 0 30 30" fill="none">
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeWidth={strokeWidth}
      d="M14.988 7.5H15M14.988 15H15M14.988 22.5H15"
    />
  </Svg>
);

// PropTypes validation
DotsIcon.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  color: PropTypes.string,
  strokeWidth: PropTypes.number,
};

export default DotsIcon;
