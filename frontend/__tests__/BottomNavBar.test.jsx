/**
 * @file BottomNavBar.test.jsx
 * @description Tests the rendering of the BottomNavBar component and its navigation functionality.
 */

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import BottomNavBar from "../app/components/BottomNavBar/BottomNavBar";
import NavigationActive from "../app/components/BottomNavBar/NavigationIcons/NavigationActive";

describe("NavigationActive", () => {
  it("renders correctly", () => {
    const { toJSON } = render(<NavigationActive />);
    expect(toJSON()).toMatchSnapshot();
  });
});

const mockNavigate = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("BottomNavBar", () => {
  it("navigates to a different screen when a button is pressed", () => {
    const props = {
      navigation: { navigate: mockNavigate },
      route: { name: "Home" }, // currently on "Home"
    };

    const { UNSAFE_getAllByType } = render(<BottomNavBar {...props} />);

    const pressables = UNSAFE_getAllByType(require("react-native").Pressable);

    // Indexes: 0 - Home, 1 - Navigation, 2 - Calendar, 3 - Settings
    fireEvent.press(pressables[1]); // Navigation
    expect(mockNavigate).toHaveBeenCalledWith("Navigation");
  });

  it("does not navigate if the current screen is pressed again", () => {
    const props = {
      navigation: { navigate: mockNavigate },
      route: { name: "Calendar" },
    };

    const { UNSAFE_getAllByType } = render(<BottomNavBar {...props} />);
    const pressables = UNSAFE_getAllByType(require("react-native").Pressable);

    fireEvent.press(pressables[2]); // Already on Calendar
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("shows warning when navigation is not available", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();

    const { UNSAFE_getAllByType } = render(<BottomNavBar route={{ name: "Settings" }} />);
    const pressables = UNSAFE_getAllByType(require("react-native").Pressable);

    fireEvent.press(pressables[0]); // Try to navigate to Home with no navigation prop
    expect(warnSpy).toHaveBeenCalledWith("Navigation is not available in this context");

    warnSpy.mockRestore();
  });
});