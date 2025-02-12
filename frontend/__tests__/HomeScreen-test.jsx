import { render } from "@testing-library/react-native";

import HomeScreen from "../app/screens/home/HomeScreen";
describe("<HomeScreen />", () => {
  test("Text renders correctly on HomeScreen", () => {
    const { getByTestId } = render(<HomeScreen />);

    const viewComponent = getByTestId("home-screen");

    expect(viewComponent).toBeTruthy();
  });
});
