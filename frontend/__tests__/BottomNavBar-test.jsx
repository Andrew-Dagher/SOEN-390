import { render } from "@testing-library/react-native";

import BottomNavBar from "../app/components/BottomNavBar/BottomNavBar";
import { AppSettingsProvider } from "../app/TextSizeContext";
import { NavigationContainer } from "@react-navigation/native";
describe("<BottomNavBar />", () => {
  test("Bottom Nav Bar renders correctly", () => {
    const { getByTestId } = render(
      <AppSettingsProvider>
        <NavigationContainer>
          <BottomNavBar />
        </NavigationContainer>
      </AppSettingsProvider>
    );

    const viewComponent = getByTestId("bottom-nav");

    expect(viewComponent).toBeTruthy();
  });
});
