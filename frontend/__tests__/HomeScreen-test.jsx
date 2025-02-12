import { render } from "@testing-library/react-native";

import HomeScreen from "../app/screens/home/HomeScreen";
import { NavigationContainer } from "@react-navigation/native";
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { AppSettingsProvider } from "../app/TextSizeContext";
import { TextSizeProvider } from "../app/TextSizeContext";
describe("<HomeScreen />", () => {
  test("Text renders correctly on HomeScreen", () => {
    const { getByTestId } = render(
      <ClerkProvider
        publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      >
        <ClerkLoaded>
          <AppSettingsProvider>
            <TextSizeProvider>
              <NavigationContainer>
                <HomeScreen />
              </NavigationContainer>
            </TextSizeProvider>
          </AppSettingsProvider>
        </ClerkLoaded>
      </ClerkProvider>
    );

    const viewComponent = getByTestId("home-screen");

    expect(viewComponent).toBeTruthy();
  });
});
