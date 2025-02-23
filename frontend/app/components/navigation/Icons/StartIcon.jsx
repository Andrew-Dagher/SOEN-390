/**
 * @file StartIcon.jsx
 * @description A React Native SVG component for a start icon.
 */

import * as React from "react";
import Svg, { Path } from "react-native-svg";

/**
 * StartIcon component renders a start icon.
 *
 * @component
 * @param {Object} props - Component properties.
 * @returns {JSX.Element} The rendered SVG start icon.
 */
const StartIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={14}
    height={18}
    fill="none"
    {...props}
  >
    {/* Start marker path */}
    <Path
      fill="#FFD4D4"
      d="M1.283 17.705c.419 0 .686-.15 1.097-.552l4.503-4.462c.042-.042.075-.075.117-.075.042 0 .075.034.117.075l4.504 4.462c.41.402.678.552 1.096.552.561 0 .912-.435.912-1.004 0-.318-.133-.695-.259-1.038L8.138 1.366C7.871.629 7.478.295 7 .295c-.477 0-.87.334-1.138 1.071L.63 15.663c-.125.343-.26.72-.26 1.038 0 .569.352 1.004.913 1.004Z"
    />
  </Svg>
);

export default StartIcon;
