/**
 * @file ArrowIcon.jsx
 * @description Renders an arrow icon as an SVG element.
 * The icon is drawn using a single Path element with rounded stroke caps and joins.
 */

import * as React from "react";
import Svg, { Path } from "react-native-svg";

/**
 * ArrowIcon component renders an arrow icon.
 *
 * @param {object} props - Additional props passed to the SVG element.
 * @returns {JSX.Element} The rendered arrow icon.
 */
const ArrowIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg" // XML namespace for SVG
    width={13}                        // Icon width
    height={21}                       // Icon height
    fill="none"                       // No fill color
    {...props}                        // Spread any additional props
  >
    <Path
      stroke="#000"                   // Black stroke color
      strokeLinecap="round"           // Rounded line caps for smooth edges
      strokeLinejoin="round"          // Rounded line joins for smooth corners
      strokeWidth={4}                 // Stroke width of 4 units
      d="M10.333 2 2 10.333l8.333 8.334" // Path definition for the arrow shape
    />
  </Svg>
);

export default ArrowIcon;
