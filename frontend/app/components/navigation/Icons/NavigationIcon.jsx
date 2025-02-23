/**
 * @file NavigationIcon.jsx
 * @description A React Native SVG component representing a navigation icon.
 */

import * as React from "react";
import Svg, { Path } from "react-native-svg";

/**
 * NavigationIcon component renders a directional navigation marker icon.
 *
 * @component
 * @param {Object} props - Component properties.
 * @returns {JSX.Element} The rendered SVG icon.
 */
const NavigationIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    {/* Navigation arrow and path */}
    <Path
      fill="#fff"
      d="m14.077 14-.77 1.45 3.774-.618c-.762-.382-1.793-.655-3.004-.832Zm-9.722.316c-1.748.461-2.855 1.216-2.855 2.338 0 .242.054.48.155.7l6.057-.99-3.357-2.048ZM18.358 16l-8.43 1.374 2.223 2.53c3.651-.328 6.349-1.494 6.349-3.25 0-.234-.05-.451-.142-.654Zm-9.854 1.611-5.696.931C4.313 19.475 6.97 20 10 20c.184 0 .363-.005.544-.009l-2.04-2.38ZM10 0C6.74 0 4.066 2.667 4.066 5.92c0 1.25.397 2.414 1.068 3.372l3.847 6.65.016.022c.152.198.3.354.474.47.174.114.39.183.602.162.424-.042.683-.342.93-.675l.013-.017 4.246-7.229.003-.004c.1-.18.173-.363.235-.542a5.852 5.852 0 0 0 .434-2.21C15.934 2.667 13.26 0 10 0Zm0 3.409a2.485 2.485 0 0 1 2.518 2.51A2.485 2.485 0 0 1 10 8.429a2.486 2.486 0 0 1-2.518-2.51A2.486 2.486 0 0 1 10 3.409Z"
    />
  </Svg>
);

export default NavigationIcon;
