import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import SettingsScreen from '../app/screens/settings/settingsScreen';
import { AppSettingsProvider, TextSizeProvider } from '../app/AppSettingsContext';

// Mock Clerk's useAuth hook
jest.mock('@clerk/clerk-expo', () => ({
  useAuth: () => ({
    isSignedIn: true,
    signOut: jest.fn(),
  }),
  ClerkProvider: ({ children }) => <>{children}</>,
}));

// Mock BottomNavBar to prevent useRoute errors
jest.mock('../app/components/BottomNavBar/BottomNavBar', () => 'BottomNavBar');

describe('<SettingsScreen />', () => {
  test('Text renders correctly on Settings Screen', () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <AppSettingsProvider>
          <TextSizeProvider>
            <SettingsScreen />
          </TextSizeProvider>
        </AppSettingsProvider>
      </NavigationContainer>
    );

    const viewComponent = getByTestId('settings-screen');
    expect(viewComponent).toBeTruthy();
  });
});
