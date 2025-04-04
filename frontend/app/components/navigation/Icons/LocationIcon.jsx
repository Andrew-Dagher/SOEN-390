/**
 * @file LocationIcon.jsx
 * @description A location pin icon component with customizable properties.
 */

import * as React from "react";
import PropTypes from "prop-types"; // Import PropTypes
import Svg, { Path } from "react-native-svg";

/**
 * LocationIcon component renders a location pin icon.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {number} [props.width=20] - Width of the icon.
 * @param {number} [props.height=20] - Height of the icon.
 * @param {string} [props.fill="#862532"] - Fill color of the icon.
 * @returns {JSX.Element} The rendered location pin icon.
 */
const LocationIcon = ({ width = 20, height = 20, fill = "#862532", ...props }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    {...props}
  >
    <Path
      fill={fill}
      fillRule="evenodd"
      d="M15.604.487c1.34-.502 2.648.806 2.146 2.146l-5.357 14.284c-.595 1.588-2.907 1.375-3.201-.296l-1.137-6.44-6.44-1.136C-.054 8.75-.267 6.44 1.32 5.843L15.604.487Zm.585 1.56L1.906 7.405 8.345 8.54c.69.122 1.23.662 1.352 1.352l1.136 6.44 5.356-14.284Z"
      clipRule="evenodd"
    />
  </Svg>
);

// PropTypes validation
LocationIcon.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  fill: PropTypes.string,
};

export default LocationIcon;
