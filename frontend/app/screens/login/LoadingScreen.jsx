/**
 * @file LoadingScreen.jsx
 * @description A loading screen component that displays the Concordia logo and navigates
 * to the Login screen after a short delay.
 */

import React, { useEffect } from 'react';
import { View } from 'react-native';
import ConcordiaLogo from '../../components/ConcordiaLogo';

/**
 * LoadingScreen component displays a splash screen and navigates to the Login screen after 2 seconds.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.navigation - The navigation object provided by React Navigation.
 * @returns {JSX.Element} The rendered LoadingScreen component.
 */
export default function LoadingScreen({ navigation }) {
  useEffect(() => {
    // Set a timer to replace the current screen with the Login screen after 2 seconds.
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2000);

    // Clean up the timer when the component unmounts.
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#862532',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Display the Concordia logo with specified width and height */}
      <ConcordiaLogo width={288} height={96} />
    </View>
  );
}
