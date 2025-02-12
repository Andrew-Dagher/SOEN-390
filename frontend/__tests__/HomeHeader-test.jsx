import { render, within } from "@testing-library/react-native";

import HomeHeader from "../app/components/Homescreen/HomeHeader/HomeHeader";

describe("<HomeHeader />", () => {
  test("Text renders correctly on HomeScreen", () => {
    const { getByTestId } = render(<HomeHeader name="John Doe" />);

    const viewComponent = getByTestId("home-header");
    const getByText = within(viewComponent);

    expect(viewComponent).toBeTruthy();
    expect(getByText("Welcome Back")).toBeTruthy();
    expect(getByText("John Doe")).toBeTruthy();
  });
});
