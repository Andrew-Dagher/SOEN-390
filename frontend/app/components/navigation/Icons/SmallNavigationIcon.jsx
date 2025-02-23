/**
 * @file SmallNavigationIcon.jsx
 * @description A React Native SVG component for a small navigation icon.
 */

import * as React from "react";
import Svg, { Path } from "react-native-svg";

/**
 * SmallNavigationIcon component renders a small navigation icon.
 *
 * @component
 * @param {Object} props - Component properties.
 * @returns {JSX.Element} The rendered SVG navigation icon.
 */
const SmallNavigationIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={11}
    height={14}
    fill="none"
    {...props}
  >
    {/* Navigation arrow path */}
    <Path
      fill="#E6863C"
      stroke="#E6863C"
      strokeWidth={1.347}
      d="M5.208 7.742c.726.079 1.406-.13 1.926-.591.528-.469.766-.983.766-1.658 0-.684-.24-1.196-.784-1.674a2.554 2.554 0 0 0-.9-.493c-.282-.09-.906-.113-1.24-.045a2.602 2.602 0 0 0-1.098.54c-.525.46-.776 1.002-.776 1.672 0 .4.062.652.252 1.018.138.267.19.333.448.576.225.21.348.3.536.392.31.15.58.231.87.263Zm.137 5.489c-.051-.03-.28-.24-.509-.466-1.752-1.741-2.975-3.434-3.639-5.038-.2-.483-.273-.726-.352-1.158a4.838 4.838 0 0 1 .826-3.72c.296-.419.897-.987 1.325-1.253 1.565-.973 3.45-.969 5.022.01.408.255 1.015.832 1.304 1.242.528.75.81 1.52.896 2.447.07.758-.05 1.498-.377 2.321-.635 1.602-1.79 3.2-3.777 5.232-.444.454-.522.496-.72.383Z"
    />
  </Svg>
);

export default SmallNavigationIcon;
