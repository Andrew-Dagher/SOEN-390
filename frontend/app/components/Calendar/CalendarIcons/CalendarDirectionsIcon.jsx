/**
 * @file CalendarDirectionsIcon.jsx
 * @description Renders a calendar directions icon as an SVG element.
 * This icon is typically used to indicate navigation directions within a calendar view.
 */

import React from "react";
import Svg, { Path } from "react-native-svg";

/**
 * CalendarDirectionsIcon component renders an SVG icon for calendar directions.
 *
 * @component
 * @returns {JSX.Element} The rendered SVG calendar directions icon.
 */
const CalendarDirectionsIcon = () => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.9152 2.48698L17.5131 8.08491C18.5708 9.14258 18.5708 10.8574 17.5131 11.9151L11.9152 17.513C10.8575 18.5707 9.1427 18.5707 8.08503 17.513L2.4871 11.9151C1.42943 10.8574 1.42943 9.14258 2.4871 8.08491L8.08503 2.48698C9.1427 1.42931 10.8575 1.42931 11.9152 2.48698ZM11.3259 6.01693L11.2558 5.95641C11.0383 5.79504 10.7398 5.79305 10.5203 5.95044L10.4421 6.01693L10.3815 6.08703C10.2202 6.30452 10.2182 6.60303 10.3756 6.82252L10.4421 6.90081L11.0409 7.4997L9.79178 7.49999L9.65217 7.50417C8.49956 7.57343 7.57662 8.49463 7.50463 9.64651L7.50011 9.79165V12.5L7.50582 12.5848C7.5472 12.8899 7.8087 13.125 8.12511 13.125C8.44152 13.125 8.70302 12.8899 8.7444 12.5848L8.75011 12.5V9.79165L8.75549 9.68515C8.80527 9.1949 9.19502 8.80515 9.68527 8.75537L9.79178 8.74999L11.0418 8.7497L10.4421 9.35026L10.3815 9.42036C10.2 9.66504 10.2202 10.0123 10.4421 10.2341C10.6639 10.456 11.0112 10.4762 11.2558 10.2947L11.3259 10.2341L12.9926 8.56748L13.0531 8.49738C13.2145 8.27989 13.2165 7.98138 13.0591 7.76189L12.9926 7.6836L11.3259 6.01693Z"
      fill="white"
    />
  </Svg>
);

export default CalendarDirectionsIcon;
