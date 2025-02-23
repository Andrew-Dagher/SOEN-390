/**
 * @file SwapIcon.jsx
 * @description A React Native SVG component for a swap icon.
 */

import * as React from "react";
import Svg, { Path } from "react-native-svg";

/**
 * SwapIcon component renders a swap icon with up and down arrows.
 *
 * @component
 * @param {Object} props - Component properties.
 * @returns {JSX.Element} The rendered SVG swap icon.
 */
const SwapIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={17}
    height={25}
    fill="none"
    {...props}
  >
    {/* Upward arrow */}
    <Path
      stroke="#000"
      strokeLinejoin="bevel"
      strokeMiterlimit={10}
      strokeWidth={2}
      d="M15.954 3.906 12.44.391 8.923 3.906"
    />
    <Path
      stroke="#000"
      strokeMiterlimit={10}
      strokeWidth={2}
      d="m12.439.39-.033 21.094"
    />
    
    {/* Downward arrow */}
    <Path
      stroke="#000"
      strokeLinejoin="bevel"
      strokeMiterlimit={10}
      strokeWidth={2}
      d="m1.11 21.094 3.516 3.515 3.516-3.515"
    />
    <Path
      stroke="#000"
      strokeMiterlimit={10}
      strokeWidth={2}
      d="M4.626 24.61 4.594 3.515"
    />
  </Svg>
);

export default SwapIcon;
