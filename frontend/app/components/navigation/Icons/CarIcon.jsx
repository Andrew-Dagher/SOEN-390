/**
 * @file CarIcon.jsx
 * @description Renders a car icon with color selection based on `isSelected` prop.
 */

import * as React from "react";
import Svg, { Path } from "react-native-svg";
import PropTypes from "prop-types"; // Import PropTypes

/**
 * CarIcon component renders an SVG car icon.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {boolean} props.isSelected - Determines the fill color of the icon.
 *        If true, the icon is filled with a light color (#FFD4D4); otherwise, it uses black (#000).
 * @returns {JSX.Element} The rendered car icon.
 */
const CarIcon = ({ isSelected }) => {
  const fillColor = isSelected ? "#FFD4D4" : "#000";

  return (
    <Svg xmlns="http://www.w3.org/2000/svg" width={30} height={21} fill={fillColor}>
      <Path
        fill={fillColor}
        d="M3.525.544C1.585.616 0 2.208 0 4.088v12.224C0 17.238.762 18 1.688 18h1.368c.289 1.7 1.763 3 3.544 3 1.781 0 3.255-1.3 3.544-3h9.712c.288 1.7 1.763 3 3.544 3a3.6 3.6 0 0 0 3.544-3h.244C28.547 18 30 17.184 30 15.412v-4.725c0-.564-.12-1.237-.337-1.893-.012-.028-1.039-2.864-1.932-5.007-.96-2.371-2.35-3.243-5.119-3.243H3.526ZM4.388 3.6h3.825c.78 0 1.387.607 1.387 1.387v2.625A1.37 1.37 0 0 1 8.213 9H4.388A1.37 1.37 0 0 1 3 7.612V4.987c0-.78.607-1.387 1.388-1.387Zm9 0h4.425c.78 0 1.387.607 1.387 1.387v2.625A1.37 1.37 0 0 1 17.813 9h-4.425A1.37 1.37 0 0 1 12 7.612V4.987c0-.78.607-1.387 1.387-1.387Zm9.6 0h3.337c.105.197.204.42.3.656.752 1.803 1.596 4.088 1.837 4.744h-5.474A1.37 1.37 0 0 1 21.6 7.612V4.987c0-.78.607-1.387 1.387-1.387ZM6.6 15C7.924 15 9 16.076 9 17.4c0 .209-.045.408-.094.6A2.385 2.385 0 0 1 6.6 19.8 2.385 2.385 0 0 1 4.294 18a2.412 2.412 0 0 1-.094-.6c0-1.324 1.076-2.4 2.4-2.4Zm16.8 0c1.324 0 2.4 1.076 2.4 2.4 0 .209-.044.408-.094.6a2.385 2.385 0 0 1-2.306 1.8 2.385 2.385 0 0 1-2.306-1.8 2.408 2.408 0 0 1-.094-.6c0-1.324 1.076-2.4 2.4-2.4Z"
      />
    </Svg>
  );
};

// PropTypes validation
CarIcon.propTypes = {
  isSelected: PropTypes.bool.isRequired,
};

export default CarIcon;
