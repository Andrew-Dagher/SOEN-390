/**
 * @file BuildingInfoScreen.test.jsx
 * @description Tests the rendering of the BuildingInfoScreen
 */
import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Linking, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import BuildingInfoScreen from "../app/screens/Info/BuildingInfoScreen";

// Mock navigation
const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: mockNavigate,
  }),
}));

// Define the mock Coachmark component
const MockCoachmark = ({ message, children }) => (
  <>
    <Text testID="coachmark-message">{message}</Text>
    {children}
  </>
);

// Mock react-native-coachmark
jest.mock("react-native-coachmark", () => ({
  Coachmark: jest.fn((props) => <MockCoachmark {...props} />),
}));

jest.useFakeTimers(); // Enable fake timers

// Sample building data
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

  it("switches to Services tab and renders service items", async () => {
    const { getByText, queryByText } = renderComponent();
    act(() => {
      jest.runAllTimers();
    });
    await waitFor(() => {
      expect(getByText("Services")).toBeTruthy();
    });
    fireEvent.press(getByText("Services"));
    expect(getByText("Service A")).toBeTruthy();
    expect(queryByText("Dept A")).toBeNull();
  });

  it("switches to Floorplans tab and renders floorplan items", async () => {
    const { getByText, queryByText } = renderComponent();
    act(() => {
      jest.runAllTimers();
    });
    await waitFor(() => {
      expect(getByText("Floorplans")).toBeTruthy();
    });
    fireEvent.press(getByText("Floorplans"));
    act(() => {
      jest.runAllTimers();
    });
    await waitFor(() => {
      expect(getByText("Indoor Map")).toBeTruthy();
      expect(queryByText("Dept A")).toBeNull();
    });
  });

  it("calls Linking.openURL when a department item is pressed", async () => {
    const openURLSpy = jest.spyOn(Linking, "openURL").mockResolvedValue();
    const { getByText } = renderComponent();
    fireEvent.press(getByText("Dept A"));
    expect(openURLSpy).toHaveBeenCalledWith("http://deptA.com");
  });

  it("calls navigation.goBack when the back button is pressed", () => {
    const { getByText } = renderComponent();
    fireEvent.press(getByText("←"));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it("navigates to InDoorScreen when Indoor Map is pressed", async () => {
    const { getByText } = renderComponent();
    act(() => {
      jest.runAllTimers();
    });
    await waitFor(() => {
      expect(getByText("Floorplans")).toBeTruthy();
    });
    fireEvent.press(getByText("Floorplans"));
    act(() => {
      jest.runAllTimers();
    });
    await waitFor(() => {
      expect(getByText("Indoor Map")).toBeTruthy();
    });
    fireEvent.press(getByText("Indoor Map"));
    expect(mockNavigate).toHaveBeenCalledWith("InDoorScreen", {
      building,
      selectedFloorplan: building.floorPlans, // Matches the component's handleFloorplanPress(links)
    });
  });

  it("does not render the Floorplans tab if there are no floor plans", async () => {
    const buildingNoFloorplans = { ...building, floorPlans: [] };
    const routeNoFloorplans = { params: buildingNoFloorplans };
    const { queryByText } = render(
      <NavigationContainer>
        <BuildingInfoScreen route={routeNoFloorplans} />
      </NavigationContainer>
    );
    act(() => {
      jest.runAllTimers();
    });
    await waitFor(() => {
      expect(queryByText("Floorplans")).toBeNull();
    });
  });

  it("shows detailed building information coachmark after delay", async () => {
    const { getByText } = renderComponent();
    act(() => {
      jest.runAllTimers();
    });
    await waitFor(() => {
      expect(getByText("Detailed building information")).toBeTruthy();
    });
  });

  it("shows indoor map coachmark when Floorplans tab is active", async () => {
    const { getByText } = renderComponent();
    act(() => {
      jest.runAllTimers();
    });
    await waitFor(() => {
      expect(getByText("Floorplans")).toBeTruthy();
    });
    fireEvent.press(getByText("Floorplans"));
    act(() => {
      jest.runAllTimers();
    });
    await waitFor(() => {
      expect(getByText("Tap here for the indoor map!")).toBeTruthy();
    });
  });
});