import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BottomNavBar from "../app/components/BottomNavBar/BottomNavBar";
import { AppSettingsProvider } from "../app/TextSizeContext";

const Stack = createNativeStackNavigator();

describe("<BottomNavBar />", () => {
  test("Bottom Nav Bar renders correctly", () => {
    const { getByTestId } = render(
      <AppSettingsProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={BottomNavBar} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppSettingsProvider>
    );

    const viewComponent = getByTestId("bottom-nav");

    expect(viewComponent).toBeTruthy();
  });
});
