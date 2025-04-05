/**
 * @file StartIcon.test.jsx
 */

import React from "react";
import { render } from "@testing-library/react-native";
import StartIcon from "../app/components/navigation/Icons/StartIcon";

describe("StartIcon component", () => {
  it("renders without crashing", () => {
    // Render the component
    const { getByTestId } = render(<StartIcon testID="start-icon-svg" />);
    // Confirm the SVG is in the tree with the expected testID
    const svgElement = getByTestId("start-icon-svg");

    // Validate key props
    expect(svgElement.props.width).toBe(14);
    expect(svgElement.props.height).toBe(18);
    expect(svgElement.props.fill).toBe("none");
  });

  it("matches the snapshot", () => {
    const { toJSON } = render(<StartIcon />);
    expect(toJSON()).toMatchSnapshot();
  });
});
