/**
 * @file HomeHeader.test.jsx
 * @description Tests the HomeHeader component to ensure that it renders correctly with the provided props.
 */

import { render } from "@testing-library/react-native";
import HomeHeader from "../app/components/Homescreen/HomeHeader/HomeHeader";
import { AppSettingsProvider } from "../app/AppSettingsContext";
describe("<HomeHeader />", () => {
  /**
   * Verifies that the HomeHeader component renders the expected welcome text and user name.
   */
  test("Text renders correctly on HomeScreen", () => {
    const { getByText, getByTestId } = render(
      <AppSettingsProvider>
        <HomeHeader name="John Doe" />
      </AppSettingsProvider>
    );

    // Retrieve the HomeHeader component using its testID.
    const viewComponent = getByTestId("home-header");

    // Assert that the HomeHeader component is rendered.
    expect(viewComponent).toBeTruthy();

    // Assert that the welcome text "Welcome Back" is rendered.
    expect(getByText("Welcome Back")).toBeTruthy();

    // Assert that the provided user name "John Doe" is rendered.
    expect(getByText("John Doe")).toBeTruthy();
  });
});
