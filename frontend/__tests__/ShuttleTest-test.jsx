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

  test('it renders all the buildings from first to last', () => {
    const {getByTestId} = renderWithNavigation();
    const building1 = getByTestId('building-0');
    const building55 = getByTestId('building-55');
    expect(building1).toBeTruthy();
    expect(building55).toBeTruthy();
  })

  test('get directions from one building with shuttle',() => {
    const {getByText,getByTestId} = renderWithNavigation();
    const building1 = getByTestId('building-0');

    fireEvent(building1, 'onPress');
    fireEvent(building1, 'onPress');
    expect(getByText('Get Directions')).toBeTruthy();

    const getDirections = getByTestId("get-directions");
    fireEvent(getDirections, 'onPress');

    const shuttleButton = getByTestId('car-button');

    expect(shuttleButton).toBeTruthy();

    fireEvent(shuttleButton, 'onPress');

  })
 
});
