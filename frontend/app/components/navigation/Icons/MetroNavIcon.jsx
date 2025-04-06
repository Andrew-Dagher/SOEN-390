/**
 * @file MetroNavIcon.jsx
 * @description A React Native SVG component representing a metro navigation icon.
 */

import * as React from "react";
import PropTypes from "prop-types"; // Import PropTypes
import Svg, { Path } from "react-native-svg";

/**
 * MetroNavIcon component renders a metro navigation SVG icon with dynamic color selection.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {boolean} props.isSelected - Determines if the icon is selected, changing its color.
 * @returns {JSX.Element} The rendered SVG icon.
 */
const MetroNavIcon = ({ isSelected }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={30}
    height={30}
    fill={isSelected ? "#FFD4D4" : "#000"}
  >
    {/* Metro Icon Body */}
    <Path
      fill={isSelected ? "#FFD4D4" : "#000"}
      d="M20.37 23.392h.53a2.5 2.5 0 0 0 2.5-2.5v-15a2.5 2.5 0 0 0-2.5-2.5H9.1a2.5 2.5 0 0 0-2.5 2.5v15a2.5 2.5 0 0 0 2.5 2.5h.53l-3.568 3.191h2.271l1.142-1.02h11.07l1.142 1.02h2.25l-3.566-3.191ZM20 21.854a1.25 1.25 0 1 1 1.25-1.25 1.23 1.23 0 0 1-1.25 1.25Zm-7.8-17.5h5.596a.688.688 0 0 1 0 1.375h-5.592a.688.688 0 1 1 0-1.375H12.2Zm-4.35 9.917V7.979A1.25 1.25 0 0 1 9.1 6.73h11.8a1.25 1.25 0 0 1 1.25 1.25v6.292a1.25 1.25 0 0 1-1.25 1.25H9.1a1.25 1.25 0 0 1-1.25-1.25Zm.9 6.354a1.25 1.25 0 1 1 1.23 1.25 1.23 1.23 0 0 1-1.23-1.25Zm2.363 3.438.741-.671h6.304l.713.67h-7.758Z"
    />
  </Svg>
);

// PropTypes validation
MetroNavIcon.propTypes = {
  isSelected: PropTypes.bool.isRequired,
};

export default MetroNavIcon;
