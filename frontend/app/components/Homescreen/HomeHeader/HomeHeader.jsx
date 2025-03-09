/**
 * @file HomeHeader.jsx
 * @description Renders the header component for the home screen with welcome message,
 * user's name, and Concordia logo. Background color adapts to current theme.
 */

import React from "react";
import { View, Text, Dimensions } from "react-native";
import Concordia50 from "./Icons/Concordia50/Concordia50";
import getThemeColors from "../../../ColorBindTheme";
import { useAppSettings } from "../../../AppSettingsContext";
import PropTypes from "prop-types";
const { width, height } = Dimensions.get("window");

/**
 * HomeHeader component for the application's home screen
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.name - User's name to display in the welcome message
 * @returns {React.ReactElement} Rendered HomeHeader component
 *
 * @example
 * // Basic usage
 * <HomeHeader name="John Doe" />
 */
const HomeHeader = ({ name }) => {
  /**
   * Get current theme colors from the theme provider
   * @type {Object}
   */
  const theme = getThemeColors();

  /**
   * Get text size from app settings context
   * @type {Object}
   */
  const { textSize } = useAppSettings();

  return (
    <View
      className="h-[194px] items-center flex-row rounded-bl-[60px] rounded-br-[60px]"
      style={{
        backgroundColor: theme.backgroundColor,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 200,
        elevation: 10,
        gap: 120,
      }}
    >
      {/* Welcome message container */}
      <View testID="home-header" className="pl-6 pt-5">
        <Text className="text-white font-bold text-3xl">Welcome Back</Text>
        <Text
          className="text-white font-bold text-2xl"
          style={{ fontSize: textSize }}
        >
          {name}
        </Text>
      </View>

      {/* Logo container */}
      <View
        className="flex-1 items-end"
        style={{
          paddingRight: width * 0.05,
          paddingTop: height * 0.03,
        }}
      >
        <Concordia50 />
      </View>
    </View>
  );
};

HomeHeader.propTypes = {
  name: PropTypes.string.isRequired, //Proptype validation for name to be string
};

export default HomeHeader;
