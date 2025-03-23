/**
 * @file BikeNavIcon.jsx
 * @description Renders a bike navigation icon as an SVG element.
 * The icon's color changes based on the `isSelected` prop.
 */
import * as React from "react";
import PropTypes from "prop-types"; // Import PropTypes
import Svg, { Path } from "react-native-svg";

/**
 * BikeNavIcon component renders an SVG bike icon for navigation.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {boolean} props.isSelected - Determines the fill color of the icon.
 *        If true, the icon is filled with a light color (#FFD4D4); otherwise, it uses black (#000).
 * @returns {JSX.Element} The rendered bike navigation icon.
 */
const BikeNavIcon = ({ isSelected }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={30}
    height={30}
    fill={isSelected ? "#FFD4D4" : "#000"}
  >
    <Path
      fill={isSelected ? "#FFD4D4" : "#000"}
      d="M24.656 13.425c-.6 0-1.162.112-1.725.3l-1.425-2.813 2.438-3.637c.262-.375.112-1.237-.675-1.237h-3.113a.769.769 0 0 0-.787.787c0 .45.337.788.525.788h1.1l-1.1 1.557h-6.05c-.25 0-.424.212-.424.212l-1.6 2.217a5.13 5.13 0 0 0-2.288-.525A5.281 5.281 0 0 0 .47 18.712C.469 21.637 2.83 24 5.794 24a5.286 5.286 0 0 0 5.212-4.5h4.313c.45 0 .637-.375.637-.375l4.5-6.75 1.088 2.063c-1.313.974-2.175 2.512-2.175 4.274A5.281 5.281 0 0 0 24.656 24a5.281 5.281 0 0 0 5.288-5.288c0-2.925-2.4-5.287-5.288-5.287Zm-9.262 3.75-3-5.55h6.675l-3.675 5.55Zm-4.388-4.8 2.963 5.55h-3a5.287 5.287 0 0 0-1.65-3.075l1.687-2.475Zm-2.55 3.788a3.83 3.83 0 0 1 .938 1.762H7.256l1.2-1.762Zm-2.662 6.224a3.721 3.721 0 0 1-3.713-3.712c0-2.063 1.65-3.675 3.713-3.675.487 0 .937.113 1.387.262l-2.025 3c-.337.413-.037 1.2.638 1.2h3.6c-.375 1.688-1.875 2.925-3.6 2.925Zm18.862 0a3.721 3.721 0 0 1-3.712-3.712c0-1.125.525-2.175 1.35-2.85l1.687 3.225c.188.3.638.525 1.088.337.375-.15.525-.675.337-1.05L23.72 15.15c.3-.075.637-.15.975-.15a3.721 3.721 0 0 1 3.712 3.712c0 2.063-1.687 3.675-3.75 3.675Zm-15-13.574h2.888c.45 0 .787-.338.787-.788a.769.769 0 0 0-.787-.787H9.656a.769.769 0 0 0-.787.787c-.038.413.337.788.787.788Z"
    />
  </Svg>
);

// PropTypes validation
BikeNavIcon.propTypes = {
  isSelected: PropTypes.bool.isRequired,
};

export default BikeNavIcon;
