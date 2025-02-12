import { render } from "@testing-library/react-native";
import LoginScreen from "../app/screens/login/LoginScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppSettingsProvider } from "../app/TextSizeContext";
const Stack = createNativeStackNavigator();
describe("<Login />", () => {
  test("Text renders correctly on Login Screen", () => {
    const { getByTestId } = render(
      <AppSettingsProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Settings" component={BottomNavBar} />
            <LoginScreen />
          </Stack.Navigator>
        </NavigationContainer>
      </AppSettingsProvider>
    );

    const viewComponent = getByTestId("login-screen");

    expect(viewComponent).toBeTruthy();
  });
});
