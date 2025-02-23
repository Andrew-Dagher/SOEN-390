/**
 * @file LoyolaIcon.jsx
 * @description A React Native SVG icon representing different campus locations (SGW and Loyola).
 */

import * as React from "react";
import { View } from "react-native";
import Svg, { Path, Text } from "react-native-svg";

/**
 * LoyolaIcon component renders an SVG icon based on the selected campus.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {string} props.campus - Specifies which campus icon to render ("sgw" or "loyola").
 * @returns {JSX.Element} The rendered campus icon.
 */
const LoyolaIcon = ({ campus }) => (
  <View>
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={40}
      height={48}
      viewBox="0 0 40 48"
      fill="none"
    >
      {/* SGW Campus Icon */}
      {campus === "sgw" && (
        <Path
          stroke="#862532"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit={10}
          strokeWidth={2.56}
          d="M1.667 36.667h36.666M32.967 36.684v-7.433M33 18.15a3.656 3.656 0 0 0-3.666 3.667v3.783a3.656 3.656 0 0 0 3.666 3.667 3.656 3.656 0 0 0 3.667-3.667v-3.783A3.656 3.656 0 0 0 33 18.15ZM3.5 36.667V10.05c0-3.35 1.667-5.033 4.984-5.033h10.383c3.317 0 4.967 1.683 4.967 5.033v26.617M9.667 13.75h8.25M9.667 20h8.25M13.75 36.667v-6.25"
        />
      )}

      {/* Loyola Campus Icon */}
      {campus === "loyola" && (
        <>
          <Path
            fill="#862532"
            stroke="#862532"
            strokeWidth={0.001}
            d="M18.866 5H8.482C5.166 5 3.5 6.683 3.5 10.033v26.634h9v-6.25c0-.684.567-1.25 1.25-1.25s1.25.55 1.25 1.25v6.25h8.833V10.033c0-3.35-1.65-5.033-4.966-5.033Zm-.95 16.25h-8.25c-.684 0-1.25-.567-1.25-1.25s.566-1.25 1.25-1.25h8.25c.683 0 1.25.567 1.25 1.25s-.567 1.25-1.25 1.25Zm0-6.25h-8.25c-.684 0-1.25-.567-1.25-1.25s.566-1.25 1.25-1.25h8.25c.683 0 1.25.567 1.25 1.25s-.567 1.25-1.25 1.25Z"
          />
          <Path
            fill="#862532"
            stroke="#862532"
            strokeWidth={0.001}
            d="M38.333 35.419h-3.784v-5c1.583-.517 2.733-2 2.733-3.75v-3.334c0-2.183-1.783-3.966-3.966-3.966-2.184 0-3.967 1.783-3.967 3.966v3.334c0 1.733 1.133 3.2 2.683 3.733v5.017H1.667c-.684 0-1.25.566-1.25 1.25 0 .683.566 1.25 1.25 1.25h31.55c.033 0 .05.016.083.016.033 0 .05-.016.083-.016h4.95c.684 0 1.25-.567 1.25-1.25 0-.684-.566-1.25-1.25-1.25Z"
          />
        </>
      )}

      {/* Text label for Loyola campus */}
      <Text
        x="20"
        y="46.5"
        fill="#862532"
        fontSize="10"
        textAnchor="middle"
        fontFamily="system-ui"
      >
        LOY
      </Text>
    </Svg>
  </View>
);

export default LoyolaIcon;
