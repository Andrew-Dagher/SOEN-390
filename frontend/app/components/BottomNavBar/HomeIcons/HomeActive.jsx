/**
 * @file HomeActive.jsx
 * @description Renders an active home icon using an SVG. The icon is defined by a single path
 * with specific fill rules and dimensions.
 */

import React from "react";
import Svg, { Path } from "react-native-svg";
import getThemeColors from "../../../ColorBindTheme";

/**
 * HomeActive component renders an SVG icon representing an active home.
 *
 * @component
 * @returns {JSX.Element} The rendered SVG home icon.
 */

const HomeActive = () => {
  const theme = getThemeColors();

  return (
    <Svg
      width={34}
      height={34}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M23.3218 5.7228C21.4273 4.03885 18.5727 4.03885 16.6782 5.7228L3.89273 17.0877C3.20475 17.6992 3.14278 18.7527 3.75432 19.4407C4.36585 20.1285 5.4193 20.1905 6.10727 19.579L6.66667 19.0818V28.443C6.66658 29.9205 6.66652 31.1935 6.80357 32.213C6.95045 33.3055 7.2817 34.3528 8.13113 35.2022C8.98057 36.0517 10.0278 36.3828 11.1204 36.5298C12.1398 36.6668 13.4128 36.6667 14.8903 36.6667H25.1097C26.5872 36.6667 27.8602 36.6668 28.8797 36.5298C29.9722 36.3828 31.0195 36.0517 31.8688 35.2022C32.7183 34.3528 33.0495 33.3055 33.1965 32.213C33.3335 31.1935 33.3335 29.9205 33.3333 28.4432V19.0818L33.8927 19.579C34.5807 20.1905 35.6342 20.1285 36.2457 19.4407C36.8572 18.7527 36.7953 17.6992 36.1073 17.0877L23.3218 5.7228ZM20 26.6667C19.0795 26.6667 18.3333 27.4128 18.3333 28.3333V31.6667C18.3333 32.5872 17.5872 33.3333 16.6667 33.3333C15.7462 33.3333 15 32.5872 15 31.6667V28.3333C15 25.5718 17.2385 23.3333 20 23.3333C22.7615 23.3333 25 25.5718 25 28.3333V31.6667C25 32.5872 24.2538 33.3333 23.3333 33.3333C22.4128 33.3333 21.6667 32.5872 21.6667 31.6667V28.3333C21.6667 27.4128 20.9205 26.6667 20 26.6667Z"
        fill= {theme.backgroundColor}
      />
    </Svg>
  );
};

export default HomeActive;