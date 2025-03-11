import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { ClerkProvider } from "@clerk/clerk-expo";
import LoginScreen from "../app/screens/login/LoginScreen";

jest.mock("@clerk/clerk-expo", () => ({
  ClerkProvider: ({ children }) => <>{children}</>,
  useOAuth: () => ({
    startOAuthFlow: jest.fn().mockResolvedValue({ createdSessionId: "mockSessionId", setActive: jest.fn() }),
  }),
  useUser: () => ({ user: null }),
  useAuth: () => ({ isSignedIn: false }),
}));

describe("<LoginScreen />", () => {
  test("renders correctly", async () => {
    const { getByTestId } = render(
      <ClerkProvider>
        <NavigationContainer>
          <LoginScreen />
        </NavigationContainer>
      </ClerkProvider>
    );

    await waitFor(() => getByTestId("login-screen"));
    expect(getByTestId("login-screen")).toBeTruthy();
  });

  test("handles Google sign-in button press", async () => {
    const { getByText } = render(
      <ClerkProvider>
        <NavigationContainer>
          <LoginScreen />
        </NavigationContainer>
      </ClerkProvider>
    );

    const googleButton = await waitFor(() => getByText("Continue with Google"));
    fireEvent.press(googleButton);
  });

  test("handles guest login", async () => {
    const { getByText } = render(
      <ClerkProvider>
        <NavigationContainer>
          <LoginScreen />
        </NavigationContainer>
      </ClerkProvider>
    );

    const guestButton = await waitFor(() => getByText("Continue as Guest"));
    fireEvent.press(guestButton);
  });
});
