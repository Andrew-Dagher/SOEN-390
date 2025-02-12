import { render } from "@testing-library/react-native";
import SettingsScreen from "../app/screens/settings/settingsScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppSettingsProvider } from "../app/TextSizeContext";
import { TextSizeProvider } from "../app/TextSizeContext";
const Stack = createNativeStackNavigator();
describe("<Setting />", () => {
  test("Text renders correctly on Settings Screen", () => {
    const { getByTestId } = render(
      <AppSettingsProvider>
        <TextSizeProvider>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen name="Settings" component={SettingsScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </TextSizeProvider>
      </AppSettingsProvider>
    );

    const viewComponent = getByTestId("settings-screen");

    expect(viewComponent).toBeTruthy();
  });
});
