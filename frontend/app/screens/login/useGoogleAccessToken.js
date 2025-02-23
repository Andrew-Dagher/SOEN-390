import { useState } from "react";
import { auth, googleProvider } from "../../../firebaseConfig";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

// Ensure WebBrowser is warmed up for authentication
WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [user, setUser] = useState(null);
  const [googleToken, setGoogleToken] = useState(null);
  const [error, setError] = useState(null);

  // Setup Google OAuth flow
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "YOUR_FIREBASE_WEB_CLIENT_ID",
    androidClientId: "YOUR_FIREBASE_ANDROID_CLIENT_ID",
    iosClientId: "YOUR_FIREBASE_IOS_CLIENT_ID",
    scopes: ["profile", "email", "https://www.googleapis.com/auth/calendar.readonly"],
  });

  // Handle Google login
  const loginWithGoogle = async () => {
    try {
      console.log("🔄 Initiating Google Sign-In...");
      const result = await promptAsync();

      if (result.type !== "success") {
        throw new Error("Google Sign-In was cancelled.");
      }

      console.log("✅ Google OAuth Token Retrieved:", result.authentication.accessToken);
      setGoogleToken(result.authentication.accessToken);

      // Create Firebase credential with the Google token
      const credential = GoogleAuthProvider.credential(result.authentication.idToken);
      const firebaseUser = await signInWithCredential(auth, credential);

      console.log("✅ Firebase User:", firebaseUser.user);
      setUser(firebaseUser.user);
    } catch (err) {
      console.error("❌ Error signing in with Google:", err);
      setError(err.message);
    }
  };

  // Sign out function
  const logout = async () => {
    try {
      setUser(null);
      setGoogleToken(null);
      console.log("✅ User signed out");
    } catch (err) {
      console.error("❌ Error signing out:", err);
      setError(err.message);
    }
  };

  return { user, googleToken, error, loginWithGoogle, logout };
}