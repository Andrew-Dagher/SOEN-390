/**
 * @file GoogleSignInButton.jsx
 * @description A React Native component for a Google Sign-In button with styling and shadow effects.
 */
import { TouchableOpacity, Image, Text } from "react-native";
import PropTypes from "prop-types"; // Import PropTypes

/**
 * GoogleSignInButton component for Google authentication.
 * @component
 * @param {Object} props - Component props.
 * @param {Function} props.onPress - Function to handle the sign-in button press.
 */
const GoogleSignInButton = ({ onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
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
      <Text className="text-black text-lg font-semibold">Continue with Google</Text>
    </TouchableOpacity>
  );
};

// PropTypes validation
GoogleSignInButton.propTypes = {
  onPress: PropTypes.func.isRequired,
};

export default GoogleSignInButton;
