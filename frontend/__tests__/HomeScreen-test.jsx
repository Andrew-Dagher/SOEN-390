import { render } from "@testing-library/react-native";

import HomeScreen from "../app/screens/home/HomeScreen";
import { NavigationContainer } from "@react-navigation/native";
import { AppSettingsProvider } from "../app/TextSizeContext";
import { TextSizeProvider } from "../app/TextSizeContext";
describe("<HomeScreen />", () => {
  test("Text renders correctly on HomeScreen", () => {
    const { getByTestId } = render(
      <AppSettingsProvider>
        <TextSizeProvider>
          <NavigationContainer>
            <HomeScreen />
          </NavigationContainer>
        </TextSizeProvider>
      </AppSettingsProvider>
    );

    const viewComponent = getByTestId("home-screen");

    expect(viewComponent).toBeTruthy();
  });
});
