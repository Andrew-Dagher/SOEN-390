import { render, fireEvent, waitFor } from "@testing-library/react-native";

import Planner from "../app/screens/Planner/Planner";
jest.mock("@clerk/clerk-expo", () => ({
  ClerkProvider: ({ children }) => <>{children}</>,
  useOAuth: () => ({
    startOAuthFlow: jest.fn().mockResolvedValue({
      createdSessionId: "mockSessionId",
      setActive: jest.fn(),
    }),
  }),
  useUser: () => ({ user: null }),
  useAuth: () => ({ isSignedIn: false }),
}));

jest.mock("expo-font");

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ bottom: 34, left: 0, right: 0, top: 47 }),
}));

describe("<Planner />", () => {
  test("renders correctly", async () => {
    const { getByTestId } = render(<Planner />);
    const button = await waitFor(() => getByTestId("customize-button"));
    fireEvent.press(button);
    expect(getByTestId("planner-screen")).toBeTruthy();
  });
});
