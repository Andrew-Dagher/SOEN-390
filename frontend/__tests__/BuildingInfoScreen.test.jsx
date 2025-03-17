/**
 * @file BuildingInfoScreen.test.jsx
 * @description Tests the rendering of the BuildingInfoScreen
 */
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Linking, Modal, Pressable, Image } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import BuildingInfoScreen from "../app/screens/Info/BuildingInfoScreen";

// Rename the variable to start with 'mock'
const mockGoBack = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    goBack: mockGoBack,
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

const route = { params: building };
const renderComponent = () =>
  render(
    <NavigationContainer>
      <BuildingInfoScreen route={route} />
    </NavigationContainer>
  );

describe("BuildingInfoScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the building header correctly", () => {
    const { getByText } = renderComponent();
    expect(getByText("Test Building")).toBeTruthy();
    expect(getByText("123 Test St")).toBeTruthy();
  });

  it("renders the Departments tab by default", () => {
    const { getByText, queryByText } = renderComponent();
    expect(getByText("Dept A")).toBeTruthy();
    expect(getByText("Dept B")).toBeTruthy();
    expect(queryByText("Service A")).toBeNull();
  });

  it("switches to Services tab and renders service items", () => {
    const { getByText, queryByText } = renderComponent();
    fireEvent.press(getByText("Services"));
    expect(getByText("Service A")).toBeTruthy();
    expect(queryByText("Dept A")).toBeNull();
  });

  it("switches to Floorplans tab and renders floorplan items", () => {
    const { getByText, queryByText } = renderComponent();
    fireEvent.press(getByText("Floorplans"));
    expect(getByText("Hall 1")).toBeTruthy();
    expect(getByText("Hall 2")).toBeTruthy();
    expect(queryByText("Dept A")).toBeNull();
  });

  it("calls Linking.openURL when a department item is pressed", () => {
    const openURLSpy = jest.spyOn(Linking, "openURL").mockResolvedValue();
    const { getByText } = renderComponent();
    fireEvent.press(getByText("Dept A"));
    expect(openURLSpy).toHaveBeenCalledWith("http://deptA.com");
  });

  it("calls navigation.goBack when the back button is pressed", () => {
    const { getByText } = renderComponent();
    fireEvent.press(getByText("←"));
    expect(mockGoBack).toHaveBeenCalled(); // Use the renamed variable here
  });

  it("opens/closes modal with mocked event", async () => {
    const { getByText, queryByTestId, getByTestId } = renderComponent();

    // Switch to Floorplans tab
    fireEvent.press(getByText("Floorplans"));

    // Open modal
    fireEvent.press(getByText("Hall 1"));
    
    // Verify modal opens
    await waitFor(() => {
      expect(getByTestId("floorplanModal")).toBeTruthy();
    });

    // Mock the press event with nativeEvent data
    fireEvent.press(
      getByTestId("modal-background"),
      {
        nativeEvent: { // Mocked event payload
          locationX: 100,
          locationY: 200,
          timestamp: Date.now()
        }
      }
    );

    // Verify modal closes
    await waitFor(() => {
      expect(queryByTestId("floorplanModal")).toBeNull();
    });
  });

  it("does not render the Floorplans tab if there are no floor plans", () => {
    const buildingNoFloorplans = { ...building, floorPlans: [] };
    const routeNoFloorplans = { params: buildingNoFloorplans };
    const { queryByText } = render(
      <NavigationContainer>
        <BuildingInfoScreen route={routeNoFloorplans} />
      </NavigationContainer>
    );
    expect(queryByText("Floorplans")).toBeNull();
  });
});