/**
 * @file CreditCardIcon.jsx
 * @description Renders a credit card icon with customizable width, height, and color.
 */

import React from "react";
import Svg, { Path } from "react-native-svg";

/**
 * CreditCardIcon component renders a credit card icon.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {number} [props.width=20] - Width of the icon.
 * @param {number} [props.height=14] - Height of the icon.
 * @param {string} [props.color="#E6863C"] - Fill color of the icon.
 * @returns {JSX.Element} The rendered Credit Card icon.
 */
const CreditCardIcon = ({ width = 20, height = 14, color = "#E6863C" }) => (
  <Svg width={width} height={height} viewBox="0 0 20 14" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.833 0.333h14.334c0.53 0 1.038 0.211 1.413 0.586s0.587 0.883 0.587 1.414v9.333c0 0.53-0.211 1.038-0.587 1.413s-0.883 0.587-1.413 0.587H2.833c-0.53 0-1.038-0.211-1.413-0.587s-0.587-0.883-0.587-1.413V2.333c0-0.53 0.211-1.038 0.587-1.414S2.303 0.333 2.833 0.333ZM18.333 3.667H1.667V6.167H18.333V3.667ZM13.333 8.667c0-0.222 0.088-0.434 0.244-0.59s0.355-0.244 0.589-0.244h2.5c0.223 0 0.435 0.088 0.591 0.244s0.243 0.368 0.243 0.59-0.087 0.434-0.243 0.59-0.368 0.244-0.591 0.244h-2.5c-0.223 0-0.435-0.088-0.589-0.244s-0.244-0.368-0.244-0.59Z"
      fill={color}
    />
  </Svg>
);

export default CreditCardIcon;
