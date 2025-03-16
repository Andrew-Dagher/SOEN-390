// BuildingDetails.test.js
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Linking, Modal, Pressable, Image } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import BuildingDetails from "../path/to/BuildingDetails";

// Create a mock for the navigation.goBack() function
const goBackMock = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    goBack: goBackMock,
  }),
}));

// Sample building data for testing
const building = {
  longName: "Test Building",
  address: "123 Test St",
  isHandicap: true,
  isBike: true,
  isParking: false,
  isCredit: true,
  isInfo: true,
  Departments: ["Dept A", "Dept B"],
  DepartmentLink: ["http://deptA.com", "http://deptB.com"],
  Services: ["Service A"],
  ServiceLink: ["http://serviceA.com"],
  floorPlans: ["Hall 1", "Hall 2"],
};

// Wrap the component in a NavigationContainer to support the useNavigation hook
const route = { params: building };
const renderComponent = () =>
  render(
    <NavigationContainer>
      <BuildingDetails route={route} />
    </NavigationContainer>
  );

describe("BuildingDetails", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the building header correctly", () => {
    const { getByText } = renderComponent();

    // Verify header texts (longName and address) are rendered
    expect(getByText("Test Building")).toBeTruthy();
    expect(getByText("123 Test St")).toBeTruthy();
  });

  it("renders the Departments tab by default", () => {
    const { getByText, queryByText } = renderComponent();

    // Since the default active tab is 'Departments', its items should be rendered.
    expect(getByText("Dept A")).toBeTruthy();
    expect(getByText("Dept B")).toBeTruthy();

    // Items from other tabs should not be visible.
    expect(queryByText("Service A")).toBeNull();
  });

  it("switches to Services tab and renders service items", () => {
    const { getByText, queryByText } = renderComponent();

    // Tap the 'Services' tab
    fireEvent.press(getByText("Services"));

    // Check that service items appear and department items are not visible.
    expect(getByText("Service A")).toBeTruthy();
    expect(queryByText("Dept A")).toBeNull();
  });

  it("switches to Floorplans tab and renders floorplan items", () => {
    const { getByText, queryByText } = renderComponent();

    // Tap the 'Floorplans' tab
    fireEvent.press(getByText("Floorplans"));

    // Check that the floorplan items are rendered
    expect(getByText("Hall 1")).toBeTruthy();
    expect(getByText("Hall 2")).toBeTruthy();
    expect(queryByText("Dept A")).toBeNull();
  });

  it("calls Linking.openURL when a department item is pressed", () => {
    // Mock Linking.openURL to verify it is called correctly.
    const openURLSpy = jest.spyOn(Linking, "openURL").mockResolvedValue();

    const { getByText } = renderComponent();

    // Tap the first department item
    fireEvent.press(getByText("Dept A"));

    expect(openURLSpy).toHaveBeenCalledWith("http://deptA.com");
  });

  it("calls navigation.goBack when the back button is pressed", () => {
    const { getByText } = renderComponent();

    // The back button is represented by the arrow ("←")
    fireEvent.press(getByText("←"));

    expect(goBackMock).toHaveBeenCalled();
  });

  it("opens the modal when a floorplan item is pressed and closes it when tapped", async () => {
    const { getByText, getAllByType, queryAllByType } = renderComponent();

    // Switch to the Floorplans tab
    fireEvent.press(getByText("Floorplans"));

    // Initially, the modal is not visible.
    let modalInstances = queryAllByType(Modal);
    // (Assuming only one Modal is used, its visible prop should be false initially)
    expect(modalInstances[0].props.visible).toBeFalsy();

    // Press a floorplan item ("Hall 1")
    fireEvent.press(getByText("Hall 1"));

    // After pressing, wait for the modal to update (state change)
    await waitFor(() => {
      modalInstances = getAllByType(Modal);
      expect(modalInstances[0].props.visible).toBeTruthy();
    });

    // The modal renders an Image (for the floorplan) with a style that includes resizeMode "contain"
    const images = getAllByType(Image);
    const modalImage = images.find(
      (img) =>
        img.props.style &&
        (Array.isArray(img.props.style)
          ? img.props.style.some((s) => s.resizeMode === "contain")
          : img.props.style.resizeMode === "contain")
    );
    expect(modalImage).toBeTruthy();

    // Find the Pressable that wraps the modal content.
    // We assume that the modal container has a background color "rgba(0,0,0,0.8)".
    const pressables = getAllByType(Pressable);
    const modalContainer = pressables.find(
      (p) =>
        p.props.style &&
        (Array.isArray(p.props.style)
          ? p.props.style.some((s) => s.backgroundColor === "rgba(0,0,0,0.8)")
          : p.props.style.backgroundColor === "rgba(0,0,0,0.8)")
    );
    expect(modalContainer).toBeTruthy();

    // Simulate pressing the modal container to close the modal.
    fireEvent.press(modalContainer);

    // Wait for the modal to update and verify it is closed.
    await waitFor(() => {
      modalInstances = getAllByType(Modal);
      expect(modalInstances[0].props.visible).toBeFalsy();
    });
  });

  it("does not render the Floorplans tab if there are no floor plans", () => {
    // Create a building object without any floorPlans.
    const buildingNoFloorplans = { ...building, floorPlans: [] };
    const routeNoFloorplans = { params: buildingNoFloorplans };

    const { queryByText } = render(
      <NavigationContainer>
        <BuildingDetails route={routeNoFloorplans} />
      </NavigationContainer>
    );

    // The 'Floorplans' tab should not be present if no floorPlans exist.
    expect(queryByText("Floorplans")).toBeNull();
  });
});
