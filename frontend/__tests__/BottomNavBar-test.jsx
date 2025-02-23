/**
 * @file BottomNavBar.test.jsx
 * @description Tests the rendering of the BottomNavBar component using React Native Testing Library.
 */

import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BottomNavBar from "../app/components/BottomNavBar/BottomNavBar";
import { AppSettingsProvider } from "../app/TextSizeContext";

// Create a native stack navigator for test navigation.
const Stack = createNativeStackNavigator();

/**
 * Test suite for the <BottomNavBar /> component.
 */
describe("<BottomNavBar />", () => {
  /**
   * Verifies that the BottomNavBar component renders correctly.
   */
  test("Bottom Nav Bar renders correctly", () => {
    // Render the BottomNavBar within the necessary providers for context and navigation.
    const { getByTestId } = render(
      <AppSettingsProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={BottomNavBar} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppSettingsProvider>
    );

    // Retrieve the BottomNavBar component using its testID.
    const viewComponent = getByTestId("bottom-nav");

    // Assert that the component exists in the rendered output.
    expect(viewComponent).toBeTruthy();
  });
});
