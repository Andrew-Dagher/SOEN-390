import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import GoToLoginButton from "../app/components/Calendar/GoToLoginButton"; // Adjust the path as needed
import { trackEvent } from "@aptabase/react-native";

// Mock the trackEvent function
jest.mock("@aptabase/react-native", () => ({
  trackEvent: jest.fn(),
}));

describe("GoToLoginButton", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset mocks before each test
  });

  it("calls trackEvent and onPress when the button is pressed", () => {
    // Create a mock onPress function
    const mockOnPress = jest.fn();

    // Render the GoToLoginButton component with the mock onPress
    const { getByText } = render(<GoToLoginButton onPress={mockOnPress} />);

    // Simulate pressing the button
    fireEvent.press(getByText("Go to Login"));

    // Verify trackEvent was called with the correct arguments
    expect(trackEvent).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledWith("Go to Login Clicked", {});

    // Verify the onPress callback was triggered
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});