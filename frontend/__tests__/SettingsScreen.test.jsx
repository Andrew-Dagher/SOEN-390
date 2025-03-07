/**
 * @file SettingsScreen.test.jsx
 * @description Tests the SettingsScreen component to ensure that it renders correctly
 * with the provided context and navigation. Mocks Clerk authentication and BottomNavBar to
 * prevent route errors during testing.
 */

import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import SettingsScreen from '../app/screens/settings/settingsScreen';
import { AppSettingsProvider} from '../app/AppSettingsContext';

// Mock Clerk's useAuth hook to simulate an authenticated user.
jest.mock('@clerk/clerk-expo', () => ({
  useAuth: () => ({
    isSignedIn: true,
    signOut: jest.fn(),
  }),
  ClerkProvider: ({ children }) => <>{children}</>,
}));

// Mock BottomNavBar to prevent useRoute errors during tests.
jest.mock('../app/components/BottomNavBar/BottomNavBar', () => 'BottomNavBar');

/**
 * Test suite for the <SettingsScreen /> component.
 */
describe('<SettingsScreen />', () => {
  /**
   * Verifies that the SettingsScreen component renders without errors.
   */
  test('Text renders correctly on Settings Screen', () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <AppSettingsProvider>
            <SettingsScreen />
        </AppSettingsProvider>
      </NavigationContainer>
    );

    // Retrieve the SettingsScreen component using its testID.
    const viewComponent = getByTestId('settings-screen');

    // Assert that the SettingsScreen component is rendered.
    expect(viewComponent).toBeTruthy();
  });
});
