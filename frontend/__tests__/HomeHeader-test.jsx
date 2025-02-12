import { render, within } from "@testing-library/react-native";

import HomeHeader from "../app/components/Homescreen/HomeHeader/HomeHeader";
import { AppSettingsProvider } from "../app/TextSizeContext";
describe("<HomeHeader />", () => {
  test("Text renders correctly on HomeScreen", () => {
    const { getByTestId } = render(
      <AppSettingsProvider>
        <HomeHeader name="John Doe" />
      </AppSettingsProvider>
    );

    const viewComponent = getByTestId("home-header");
    const getByText = within(viewComponent);

    expect(viewComponent).toBeTruthy();
    expect(getByText("Welcome Back")).toBeTruthy();
    expect(getByText("John Doe")).toBeTruthy();
  });
});
