import { render } from "@testing-library/react-native";

import HomeScreen from "../app/screens/home/HomeScreen";
import { NavigationContainer } from "@react-navigation/native";
describe("<HomeScreen />", () => {
  test("Text renders correctly on HomeScreen", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );

    const viewComponent = getByTestId("home-screen");

    expect(viewComponent).toBeTruthy();
  });
});
