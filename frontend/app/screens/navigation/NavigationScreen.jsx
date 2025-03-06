/**
 * @file NavigationScreen.jsx
 * @description A screen component that displays a map for navigation purposes.
 */

import React from 'react';
import { View, Text, Button } from 'react-native';
import Map from '../../components/navigation/Map';
import { trackEvent } from "@aptabase/react-native";
/**
 * NavigationScreen component renders a full-screen view centered on the Map component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.navigation - The navigation object provided by React Navigation.
 * @returns {JSX.Element} The rendered NavigationScreen component.
 */
export default function NavigationScreen({ navigation }) {
  trackEvent("Navigation Screen", {});
  return (
    <View
      className="h-full opacity-100"
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      {/* Render the Map component to display navigation details */}
      <Map />
    </View>
  );
}
