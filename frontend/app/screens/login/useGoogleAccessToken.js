import { useAuth, useUser } from "@clerk/clerk-expo";
import { useState, useEffect } from "react";

/**
 * Custom hook to retrieve the correct Google OAuth access token from Clerk
 */
export function useGoogleAccessToken() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [googleToken, setGoogleToken] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      if (!getToken || !user) {
        setError("❌ Clerk getToken() method or user object is undefined.");
        return;
      }

      console.log("🔄 Requesting Google OAuth token from Clerk...");

      try {
        // Attempt to retrieve the OAuth token directly
        const token = await getToken({ template: "oauth_google" });

        if (!token || token.includes("{{identity.googleOAuthAccessToken}}")) {
          setError("⚠️ Google OAuth token is missing or invalid.");
        } else {
          console.log("✅ Google OAuth Token Retrieved:", token);
          // Decode the Clerk JWT to extract the google_access_token
          const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode base64 payload
          const googleAccessToken = decodedToken.google_access_token;

          if (!googleAccessToken) {
            setError("⚠️ Google OAuth access token is missing in the Clerk token.");
          } else {
            console.log("✅ Google Access Token:", googleAccessToken);
            setGoogleToken(googleAccessToken);
          }
        }
      } catch (err) {
        console.error("❌ Error fetching Google OAuth token:", err);
        setError(err.message);
      }
    };

    fetchToken();
  }, [getToken, user]);

  return { googleToken, error };
}
