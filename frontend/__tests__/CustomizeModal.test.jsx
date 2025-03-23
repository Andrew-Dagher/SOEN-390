import { render, fireEvent, waitFor } from "@testing-library/react-native";

import CustomizeModal from "../app/screens/Planner/CustomizeModal";
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

describe("<CustomizeModal />", () => {
  test("renders correctly after pressing buttons", async () => {
    const { getByTestId, getByText } = render(
      <CustomizeModal
        visible={true}
        classes={[{ id: 1, title: "Test Class" }]}
        onClose={() => {}}
        selectedDate={"2023-05-01"}
        onSavePreferences={() => {}}
      />
    );
    const saveButton = await waitFor(() => getByText("Save Preferences"));
    const classButton = await waitFor(() => getByText("Test Class"));
    fireEvent.press(saveButton);
    fireEvent.press(classButton);
    expect(getByTestId("customize-modal")).toBeTruthy();
  });
});
