/**
 * @file LoginScreen.test.jsx
 * @description Tests the LoginScreen component using React Native Testing Library.
 * Mocks Clerk authentication hooks to simulate user data and OAuth behavior.
 */

import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ClerkProvider } from '@clerk/clerk-expo';
import LoginScreen from '../app/screens/login/LoginScreen';

// Mock the Clerk package to simulate authentication hooks and providers.
jest.mock('@clerk/clerk-expo', () => ({
  // Replace ClerkProvider with a simple wrapper that renders children.
  ClerkProvider: ({ children }) => <>{children}</>,
  // Mock useOAuth to return a function that simulates starting an OAuth flow.
  useOAuth: () => ({
    startOAuthFlow: jest.fn().mockResolvedValue({
      createdSessionId: 'mockSessionId',
      setActive: jest.fn(),
    }),
  }),
  // Mock useUser to return simulated user data.
  useUser: () => ({
    user: {
      fullName: 'Test User',
      primaryEmailAddress: { emailAddress: 'test@test.com' },
      imageUrl: null,
    },
  }),
  // Mock useAuth to indicate that the user is not signed in.
  useAuth: () => ({
    isSignedIn: false,
  }),
}));

/**
 * Test suite for the <LoginScreen /> component.
 */
describe('<Login />', () => {
  /**
   * Tests that the LoginScreen component renders correctly.
   */
  test('Text renders correctly on Login Screen', async () => {
    // Render the LoginScreen component wrapped with ClerkProvider and NavigationContainer.
    const { getByTestId } = render(
      <ClerkProvider>
        <NavigationContainer>
          <LoginScreen />
        </NavigationContainer>
      </ClerkProvider>
    );

    // Wait for the component with testID "login-screen" to appear in the DOM.
    await waitFor(() => getByTestId("login-screen"));

    // Assert that the login screen component is rendered.
    expect(getByTestId("login-screen")).toBeTruthy();
  });
});
