/**
 * @file DirectionsIcon.jsx
 * @description A reusable directions icon component with customizable props.
 */

import React from "react";
import PropTypes from "prop-types"; // Import PropTypes
import Svg, { Path } from "react-native-svg";

/**
 * DirectionsIcon component renders a direction icon.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {number} [props.width=18] - Width of the icon.
 * @param {number} [props.height=18] - Height of the icon.
 * @param {string} [props.color="#fff"] - Fill color of the icon.
 * @returns {JSX.Element} The rendered Directions icon.
 */
const DirectionsIcon = ({ width = 18, height = 18, color = "#fff" }) => (
  <Svg width={width} height={height} viewBox="0 0 18 18" fill="none">
    <Path
      fill={color}
      d="m10.915 1.487 5.598 5.598a2.708 2.708 0 0 1 0 3.83l-5.598 5.598a2.708 2.708 0 0 1-3.83 0l-5.598-5.598a2.708 2.708 0 0 1 0-3.83l5.598-5.598a2.708 2.708 0 0 1 3.83 0Zm-.59 3.53-.07-.06a.625.625 0 0 0-.735-.007l-.078.067-.06.07a.625.625 0 0 0-.006.736l.066.078.599.599H8.79l-.139.004a2.292 2.292 0 0 0-2.147 2.143l-.005.145V11.5l.006.085a.625.625 0 0 0 1.238 0l.006-.085V8.792l.005-.107c.05-.49.44-.88.93-.93l.107-.005h1.25l-.6.6-.06.07a.625.625 0 0 0 .874.875l.07-.06 1.667-1.668.06-.07a.625.625 0 0 0 .006-.735l-.066-.078-1.667-1.667Z"
    />
  </Svg>
);

// PropTypes validation
DirectionsIcon.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  color: PropTypes.string,
};

export default DirectionsIcon;
