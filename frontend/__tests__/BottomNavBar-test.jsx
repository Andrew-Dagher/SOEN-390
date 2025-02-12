import { render } from "@testing-library/react-native";

import BottomNavBar from "../app/components/BottomNavBar/BottomNavBar";
import { AppSettingsProvider } from "../app/TextSizeContext";
describe("<BottomNavBar />", () => {
  test("Bottom Nav Bar renders correctly", () => {
    const { getByTestId } = render(
      <AppSettingsProvider>
        <BottomNavBar />
      </AppSettingsProvider>
    );

    const viewComponent = getByTestId("bottom-nav");

    expect(viewComponent).toBeTruthy();
  });
});
