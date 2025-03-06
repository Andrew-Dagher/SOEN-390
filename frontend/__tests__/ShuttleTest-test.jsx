/**
 * @file ShuttleTest-test.jsx
 * @description Tests for the Shuttle integration component 
 * 
 *  
*/

import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import NavigationScreen from '../app/screens/navigation/NavigationScreen'
import { AppSettingsProvider} from '../app/AppSettingsContext';

// Mock useRoute from React Navigation to simulate route information.
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useRoute: () => ({
    name: 'NavigationScreen',
  }),
}));

/**
 * Test suite for the <CalendarScreen /> component.
 */
describe('<NavigationScreen />', () => {
  /**
   * Helper function to render CalendarScreen within a NavigationContainer.
   *
   * @returns {RenderAPI} The render result from @testing-library/react-native.
   */
  const renderWithNavigation = () =>
    render(
      <NavigationContainer>
        <AppSettingsProvider>
        <NavigationScreen />
        </AppSettingsProvider>
      </NavigationContainer>
    );

  /**
   * Tests that the CalendarScreen renders the Calendar component.
   */
  test('it renders the Map component', () => {
    const { getByTestId } = renderWithNavigation();
    const navComponent = getByTestId('navigation-view');
    expect(navComponent).toBeTruthy();
  });
 
});
