/**
 * @file SearchIcon.jsx
 * @description A React Native SVG component representing a search (magnifying glass) icon.
 */

import * as React from "react";
import Svg, { Path } from "react-native-svg";

/**
 * SearchIcon component renders a magnifying glass icon.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {number} [props.width=20] - Width of the icon.
 * @param {number} [props.height=20] - Height of the icon.
 * @param {string} [props.stroke="gray"] - Stroke color of the icon.
 * @returns {JSX.Element} The rendered SVG icon.
 */
const SearchIcon = ({ width = 20, height = 20, stroke = "gray", ...props }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    stroke={stroke}
    strokeWidth={1.5}
    aria-hidden="true"
    data-slot="icon"
    viewBox="0 0 24 24"
    {...props}
  >
    {/* Magnifying glass handle and circular lens */}
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </Svg>
);

export default SearchIcon;
