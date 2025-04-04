/**
 * @file MetroIcon.jsx
 * @description A React Native SVG component representing a metro (subway) icon.
 */

import * as React from "react";
import PropTypes from "prop-types";
import Svg, { Path } from "react-native-svg";

/**
 * MetroIcon component renders a metro SVG icon.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {string} [props.fill="#E6863C"] - Fill color of the icon.
 * @param {string} [props.stroke="white"] - Stroke color of the icon.
 * @param {number} [props.width=20] - Width of the icon.
 * @param {number} [props.height=20] - Height of the icon.
 * @returns {JSX.Element} The rendered SVG icon.
 */
const MetroIcon = ({ fill = "#E6863C", stroke = "white", width = 20, height = 20, ...props }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill={fill}
    stroke={stroke}
    {...props}
  >
    {/* Metro Body */}
    <Path
      fill={fill}
      fillRule="evenodd"
      d="M2.833 3.333h14.334a2 2 0 0 1 2 2v9.334a2 2 0 0 1-2 2H2.833a2 2 0 0 1-2-2V5.333a2 2 0 0 1 2-2Zm15.5 3.334H1.667v2.5h16.666v-2.5Zm-5 5a.833.833 0 0 1 .834-.834h2.5a.833.833 0 1 1 0 1.667h-2.5a.833.833 0 0 1-.834-.833Z"
      clipRule="evenodd"
    />
  </Svg>
);


//Prop types validation
MetroIcon.propTypes = {
  fill: PropTypes.string,
  stroke: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
};

export default MetroIcon;
