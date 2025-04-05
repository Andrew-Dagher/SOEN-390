import React from "react";
import { TouchableOpacity, Image, Text } from "react-native";
import PropTypes from 'prop-types'; // Import PropTypes
import { trackEvent } from "@aptabase/react-native"; // Import trackEvent

/**

GoToLoginButton component for redirecting users to the Login page.
@component
@param {Object} props - Component props.
@param {Function} props.onPress - Function to handle the button press.
*/
const GoToLoginButton = ({ onPress }) => {
  const handlePress = () => {
    // Track the event when the button is clicked
    trackEvent("Go to Login Clicked", {});

    // Trigger the passed onPress function
    if (onPress) onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="flex-row items-center justify-center bg-white rounded-full py-3 px-6 shadow-lg border border-gray-300"
      style={{
        elevation: 3, // Android shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        borderRadius: 10,
      }}
    >
      {/* Google logo */}
      <Image
        source={{ uri: "https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png" }}
        style={{
          width: 30,
          height: 30,
          marginRight: 10,
        }}
        resizeMode="contain"
      />

      {/* Button text */}
      <Text className="text-black text-lg font-semibold">Go to Login</Text>
    </TouchableOpacity>
  );
};

// Add PropTypes for validation
GoToLoginButton.propTypes = {
  onPress: PropTypes.func.isRequired, // onPress should be a required function
};

export default GoToLoginButton;