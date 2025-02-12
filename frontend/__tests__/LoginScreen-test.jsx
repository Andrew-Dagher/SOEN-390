import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ClerkProvider } from '@clerk/clerk-expo';
import LoginScreen from '../app/screens/login/LoginScreen';

jest.mock('@clerk/clerk-expo', () => ({
  ClerkProvider: ({ children }) => <>{children}</>,
  useOAuth: () => ({
    startOAuthFlow: jest.fn().mockResolvedValue({ createdSessionId: 'mockSessionId', setActive: jest.fn() }),
  }),
  useUser: () => ({
    user: { fullName: 'Test User', primaryEmailAddress: { emailAddress: 'test@test.com' }, imageUrl: null },
  }),
  useAuth: () => ({
    isSignedIn: false,
  }),
}));

describe('<Login />', () => {
  test('Text renders correctly on Login Screen', async () => {
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
});
