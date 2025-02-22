import { render } from "@testing-library/react-native";

import HomeHeader from "../app/components/Homescreen/HomeHeader/HomeHeader";
import { AppSettingsProvider } from "../app/AppSettingsContext";
describe("<HomeHeader />", () => {
  test("Text renders correctly on HomeScreen", () => {
    const { getByText, getByTestId } = render(
      <AppSettingsProvider>
        <HomeHeader name="John Doe" />
      </AppSettingsProvider>
    );

    const viewComponent = getByTestId("home-header");

    expect(viewComponent).toBeTruthy();
    expect(getByText("Welcome Back")).toBeTruthy();
    expect(getByText("John Doe")).toBeTruthy();
  });
});
