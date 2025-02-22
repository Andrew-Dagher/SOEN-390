/**
 * @file InformationIcon.jsx
 * @description A customizable information icon with stroke and fill properties.
 */

import * as React from "react";
import Svg, { Path } from "react-native-svg";

/**
 * InformationIcon component renders an information "i" icon.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {number} [props.width=20] - Width of the icon.
 * @param {number} [props.height=20] - Height of the icon.
 * @param {string} [props.fill="#e8843c"] - Fill color of the icon.
 * @param {string} [props.stroke="white"] - Stroke color of the icon.
 * @param {number} [props.strokeWidth=1.5] - Stroke width of the icon.
 * @returns {JSX.Element} The rendered information icon.
 */
const InformationIcon = ({
  width = 20,
  height = 20,
  fill = "#e8843c",
  stroke = "white",
  strokeWidth = 1.5,
  ...props
}) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill={fill}
    stroke={stroke}
    strokeWidth={strokeWidth}
    viewBox="0 0 24 24"
    {...props}
  >
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
    />
  </Svg>
);

export default InformationIcon;
