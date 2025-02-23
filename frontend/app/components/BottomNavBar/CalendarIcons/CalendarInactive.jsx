/**
 * @file CalendarInactive.jsx
 * @description A React Native SVG component that renders an inactive calendar icon.
 * The icon is outlined with strokes and displays a grid of small rectangles representing dates.
 */

import React from "react";
import Svg, { Path } from "react-native-svg";

/**
 * CalendarInactive component renders an SVG icon for an inactive calendar.
 *
 * @component
 * @returns {JSX.Element} The rendered SVG calendar icon.
 */
const CalendarInactive = () => (
  <Svg
    width={30}
    height={30}
    viewBox="0 0 38 38"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Calendar outline */}
    <Path 
      d="M2.33325 12.3332C2.33325 8.65127 5.31802 5.6665 8.99992 5.6665H28.9999C32.6818 5.6665 35.6666 8.65127 35.6666 12.3332V28.9998C35.6666 32.6817 32.6818 35.6665 28.9999 35.6665H8.99992C5.31802 35.6665 2.33325 32.6817 2.33325 28.9998V12.3332Z" 
      stroke="#862532" 
      strokeWidth="4"
    />
    {/* Date squares */}
    <Path d="M11.5 15.6665H13.1667V17.3332H11.5V15.6665Z" stroke="#862532" strokeWidth="2.66667" strokeLinecap="round"/>
    <Path d="M11.5 20.6665H13.1667V22.3332H11.5V20.6665Z" stroke="#862532" strokeWidth="2.66667" strokeLinecap="round"/>
    <Path d="M11.5 25.6665H13.1667V27.3332H11.5V25.6665Z" stroke="#862532" strokeWidth="2.66667" strokeLinecap="round"/>
    <Path d="M18.1665 15.6665H19.8332V17.3332H18.1665V15.6665Z" stroke="#862532" strokeWidth="2.66667" strokeLinecap="round"/>
    <Path d="M18.1665 20.6665H19.8332V22.3332H18.1665V20.6665Z" stroke="#862532" strokeWidth="2.66667" strokeLinecap="round"/>
    <Path d="M18.1665 25.6665H19.8332V27.3332H18.1665V25.6665Z" stroke="#862532" strokeWidth="2.66667" strokeLinecap="round"/>
    <Path d="M24.8333 15.6665H26.4999V17.3332H24.8333V15.6665Z" stroke="#862532" strokeWidth="2.66667" strokeLinecap="round"/>
    <Path d="M24.8333 20.6665H26.4999V22.3332H24.8333V20.6665Z" stroke="#862532" strokeWidth="2.66667" strokeLinecap="round"/>
    <Path d="M24.8333 25.6665H26.4999V27.3332H24.8333V25.6665Z" stroke="#862532" strokeWidth="2.66667" strokeLinecap="round"/>
    {/* Calendar header brackets */}
    <Path d="M12.3333 2.33325V8.16659" stroke="#862532" strokeWidth="4" strokeLinecap="round"/>
    <Path d="M25.6665 2.33325V8.16659" stroke="#862532" strokeWidth="4" strokeLinecap="round"/>
  </Svg>
);

export default CalendarInactive;
