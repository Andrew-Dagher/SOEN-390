/**
 * @file MapPinIcon.jsx
 * @description A React Native SVG component representing a location pin icon.
 */

import React from "react";
import PropTypes from "prop-types"; // Import PropTypes
import Svg, { Path } from "react-native-svg";

/**
 * MapPinIcon component renders a location pin SVG icon.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {number} [props.width=11] - Width of the icon.
 * @param {number} [props.height=15] - Height of the icon.
 * @param {string} [props.fill="#E6863C"] - Fill color of the icon.
 * @param {string} [props.stroke="#E6863C"] - Stroke color of the icon.
 * @returns {JSX.Element} The rendered SVG icon.
 */
const MapPinIcon = ({
  width = 11,
  height = 15,
  fill = "#E6863C",
  stroke = "#E6863C",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 11 15" fill="none">
      {/* Location Pin Shape */}
      <Path
        d="M5.20813 8.20524C5.93352 8.28879 6.61431 8.06722 7.13418 7.57853C7.66207 7.08235 7.89957 6.53722 7.89957 5.82143C7.89957 5.09669 7.65971 4.55393 7.11602 4.04801C6.87576 3.82432 6.55984 3.64077 6.21549 3.52458C5.93392 3.42945 5.30984 3.40577 4.9751 3.47748C4.60234 3.55722 4.15892 3.78866 3.87826 4.04972C3.35326 4.53814 3.10181 5.11222 3.10181 5.82143C3.10181 6.24656 3.16392 6.51287 3.35378 6.90116C3.49194 7.18366 3.54378 7.25406 3.80194 7.51077C4.02668 7.73432 4.14997 7.82985 4.33799 7.92643C4.64786 8.08537 4.91773 8.17169 5.20813 8.20524ZM5.34444 14.0229C5.29339 13.9918 5.06457 13.7695 4.83589 13.5287C3.08418 11.6839 1.86115 9.88958 1.19734 8.18958C0.9976 7.67814 0.923653 7.41985 0.845363 6.96195C0.605495 5.55801 0.892732 4.18643 1.67063 3.01985C1.96668 2.57577 2.56747 1.9738 2.99628 1.69116C4.56089 0.660242 6.44628 0.664584 8.01813 1.70261C8.42602 1.97208 9.03273 2.58445 9.32155 3.0184C9.85023 3.81301 10.1321 4.62853 10.2176 5.61248C10.2875 6.41537 10.1672 7.19932 9.84102 8.07222C9.20602 9.76985 8.05181 11.4643 6.06392 13.6175C5.6201 14.0981 5.54142 14.1426 5.34444 14.0229Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.34737"
      />
    </Svg>
  );
};

// PropTypes validation
MapPinIcon.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  fill: PropTypes.string,
  stroke: PropTypes.string,
};

export default MapPinIcon;
