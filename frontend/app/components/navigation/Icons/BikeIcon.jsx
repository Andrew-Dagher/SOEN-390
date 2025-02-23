/**
 * @file BikeIcon.jsx
 * @description Renders a bike icon using an SVG element.
 * The icon is defined using a single Path element with a specified fill color.
 */

import * as React from "react";
import Svg, { Path } from "react-native-svg";

/**
 * BikeIcon component renders an SVG icon representing a bike.
 *
 * @param {object} props - Additional props to customize the SVG.
 * @returns {JSX.Element} The rendered bike icon.
 */
const BikeIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"  // XML namespace for SVG
    width={20}                         // Icon width
    height={12}                        // Icon height
    fill="none"                        // No default fill for the SVG container
    {...props}                         // Spread any additional props
  >
    <Path
      fill="#E6863C"                 // Icon fill color
      // The d attribute defines the complex shape of the bike icon
      d="M16.438 5.202c-.4 0-.775.07-1.15.189l-.95-1.77 1.625-2.288c.175-.235.075-.778-.45-.778h-2.075c-.3 0-.526.212-.526.495 0 .283.225.496.525.496h1.1l-1.1 1.557h-6.05c-.25 0-.424.212-.424.212l-1.6 2.217a3.59 3.59 0 0 0-1.526-.33c-1.95 0-3.525 1.486-3.525 3.326s1.575 3.326 3.55 3.326c1.75 0 3.226-1.227 3.476-2.83h2.875c.3 0 .425-.237.425-.237l3-4.246.725 1.298c-.875.613-1.45 1.58-1.45 2.689 0 1.84 1.575 3.326 3.524 3.326 1.95 0 3.525-1.486 3.525-3.326s-1.6-3.326-3.524-3.326ZM10.262 7.56l-2-3.491h4.45l-2.45 3.49ZM7.337 4.54l1.974 3.491h-2a3.275 3.275 0 0 0-1.1-1.934l1.126-1.557Zm-1.7 2.383c.3.306.524.684.625 1.108H4.838l.8-1.108Zm-1.776 3.915c-1.35 0-2.474-1.037-2.474-2.335 0-1.297 1.1-2.311 2.474-2.311.325 0 .625.07.925.165l-1.35 1.887c-.224.26-.024.755.425.755h2.4c-.25 1.061-1.25 1.84-2.4 1.84Zm12.575 0c-1.35 0-2.475-1.037-2.475-2.335 0-.707.35-1.368.9-1.792l1.126 2.028c.125.189.425.33.724.212.25-.094.35-.424.226-.66l-1.125-2.005c.2-.047.425-.094.65-.094 1.35 0 2.474 1.037 2.474 2.335 0 1.297-1.125 2.311-2.5 2.311Zm-10-8.538h1.926c.3 0 .524-.213.524-.496 0-.283-.225-.495-.524-.495H6.438c-.3 0-.526.212-.526.495-.024.26.226.496.526.496Z"
    />
  </Svg>
);

export default BikeIcon;
