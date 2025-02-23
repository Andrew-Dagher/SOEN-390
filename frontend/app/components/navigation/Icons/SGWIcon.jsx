/**
 * @file SGWIcon.jsx
 * @description A React Native SVG component for displaying SGW and Loyola campus icons.
 */

import * as React from "react";
import { View } from "react-native";
import Svg, { G, Path, Defs, ClipPath, Text } from "react-native-svg";

/**
 * SGWIcon component renders an SVG icon based on the selected campus.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {string} props.campus - The campus type ("sgw" or "loyola").
 * @returns {JSX.Element} The rendered SVG campus icon.
 */
const SGWIcon = ({ campus }) => (
  <View>
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={40}
      height={48}
      viewBox="0 0 40 48"
      fill="none"
    >
      {/* Render SGW campus icon */}
      {campus === "sgw" && (
        <G clipPath="url(#a)">
          <Path
            fill="#862532"
            fillRule="evenodd"
            d="M17.921 3.661a3.334 3.334 0 0 0-2.769.305l-6.867 4.12a3.334 3.334 0 0 0-1.619 2.858v22.39H5a1.667 1.667 0 0 0 0 3.333h30a1.667 1.667 0 1 0 0-3.333h-1.667V11.201a3.333 3.333 0 0 0-2.279-3.163l-13.133-4.377ZM15 7.944l-5 3v22.39h5V7.944Z"
            clipRule="evenodd"
          />
        </G>
      )}

      {/* Render Loyola campus icon */}
      {campus === "loyola" && (
        <G clipPath="url(#a)">
          <Path
            fill="#862532"
            fillRule="evenodd"
            d="M17.921 3.661a3.334 3.334 0 0 0-2.769.305l-6.867 4.12a3.334 3.334 0 0 0-1.619 2.858v22.39H5a1.667 1.667 0 0 0 0 3.333h30a1.667 1.667 0 1 0 0-3.333h-1.667V11.201a3.333 3.333 0 0 0-2.279-3.163l-13.133-4.377ZM30 33.334V11.201L18.333 7.313v26.021H30ZM15 7.944l-5 3v22.39h5V7.944Z"
            clipRule="evenodd"
          />
        </G>
      )}

      {/* Campus label */}
      <Text
        x="20"
        y="46.5"
        fill="#862532"
        fontSize="10"
        textAnchor="middle"
        fontFamily="system-ui"
      >
        SGW
      </Text>

      {/* ClipPath definition */}
      <Defs>
        <ClipPath id="a">
          <Path fill="#862532" d="M0 0h40v40H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  </View>
);

export default SGWIcon;
