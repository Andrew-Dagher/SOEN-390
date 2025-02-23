/**
 * @file NavigationInactive.jsx
 * @description Renders an inactive navigation icon using an SVG element.
 * The icon is composed of multiple paths that form the overall navigation symbol,
 * including a complex outline and two vertical lines acting as accents.
 */

import React from "react";
import Svg, { Path } from "react-native-svg";

/**
 * NavigationInactive component renders an SVG icon representing an inactive navigation state.
 *
 * @component
 * @returns {JSX.Element} The rendered inactive navigation icon.
 */
const NavigationInactive = () => (
  <Svg
    width={30}
    height={30}
    viewBox="0 0 34 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Main outline path */}
    <Path 
      d="M2 11.5156C2 9.05973 2 7.83178 2.6544 7.11558C2.88673 6.86129 3.16912 6.65776 3.48382 6.51776C4.37022 6.12343 5.53515 6.51174 7.86502 7.28836C9.64377 7.88128 10.5331 8.17774 11.4318 8.14704C11.7619 8.13578 12.09 8.09184 12.4114 8.01586C13.2865 7.80901 14.0665 7.28899 15.6267 6.24894L17.9305 4.71296C19.929 3.38071 20.9282 2.71459 22.0752 2.56099C23.2222 2.40739 24.3613 2.78714 26.6398 3.54664L28.5812 4.19373C30.2312 4.74374 31.0562 5.01876 31.5282 5.67348C32 6.32819 32 7.19784 32 8.93714V22.4845C32 24.9403 32 26.1683 31.3457 26.8845C31.1133 27.1388 30.8308 27.3423 30.5162 27.4823C29.6298 27.8767 28.4648 27.4883 26.135 26.7117C24.3562 26.1188 23.4668 25.8223 22.5682 25.853C22.2382 25.8643 21.91 25.9082 21.5887 25.9842C20.7135 26.191 19.9335 26.711 18.3733 27.7512L16.0695 29.287C14.071 30.6193 13.0719 31.2855 11.9249 31.439C10.7779 31.5927 9.63865 31.2128 7.36015 30.4533L5.41887 29.8063C3.76882 29.2563 2.94378 28.9813 2.4719 28.3265C2 27.6718 2 26.8022 2 25.0628V11.5156Z" 
      stroke="#862532" 
      strokeWidth="4"
    />
    {/* Left vertical accent */}
    <Path 
      d="M12 8.06445V31.1667" 
      stroke="#862532" 
      strokeWidth="4"
    />
    {/* Right vertical accent */}
    <Path 
      d="M22 2V25.3333" 
      stroke="#862532" 
      strokeWidth="4"
    />
  </Svg>
);

export default NavigationInactive;
