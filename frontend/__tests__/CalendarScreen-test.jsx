/**
 * @file CalendarScreen-test.jsx
 * @description Tests for the Calendar component and CalendarScreen.
 * Verifies rendering, initial month display, and month change updates.
 */

import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { Calendar } from "react-native-calendars";
import { NavigationContainer } from "@react-navigation/native";
import CalendarScreen from "../app/screens/calendar/CalendarScreen";
import { AppSettingsProvider } from "../app/AppSettingsContext";
import { ClerkProvider } from "@clerk/clerk-react";

// Mock useRoute from React Navigation to simulate route information.
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useRoute: () => ({
    name: "CalendarScreen",
  }),
}));

/**
 * Test suite for the <Calendar /> component.
 */
describe("<Calendar />", () => {
  /**
   * Tests that the Calendar component renders correctly with the provided props.
   */
  test("it renders the calendar component", async () => {
    // Render the Calendar component directly with necessary props.
    const { getByTestId } = render(
      <Calendar
        current={"2025-01-01"}
        minDate={"2025-01-01"}
        maxDate={"2025-12-31"}
        monthFormat={"yyyy MM"}
        onDayPress={(day) => console.log("selected day", day)}
        theme={{
          selectedDayBackgroundColor: "#E6863C",
          selectedDayTextColor: "#FFFFFF",
          todayTextColor: "#862532",
          arrowColor: "#862532",
        }}
        testID="calendar-view"
      />
    );

    // Retrieve the Calendar component using its testID.
    const calendarComponent = getByTestId("calendar-view");

    // Verify that the Calendar component is rendered.
    expect(calendarComponent).toBeTruthy();
  });
});

/**
 * Test suite for the <CalendarScreen /> component.
 */
describe("<CalendarScreen />", () => {
  /**
   * Helper function to render CalendarScreen within a NavigationContainer & ClerkProvider.
   *
   * @returns {RenderAPI} The render result from @testing-library/react-native.
   */
  const renderWithNavigation = () =>
    render(
      <ClerkProvider>
        <NavigationContainer>
          <AppSettingsProvider>
            <CalendarScreen />
          </AppSettingsProvider>
        </NavigationContainer>
      </ClerkProvider>
    );

  /**
   * Tests that the CalendarScreen renders the Calendar component.
   */
  test("it renders the calendar component", async () => {
    await act(async () => {
      const { getByTestId } = renderWithNavigation();
      const calendarComponent = getByTestId("calendar-view");
      expect(calendarComponent).toBeTruthy();
    });
  });

  /**
   * Tests that the CalendarScreen updates the displayed month when the onMonthChange event is triggered.
   */
  test("it updates the displayed month when navigating with arrows", async () => {
    await act(async () => {
      const { getByText, getByTestId } = renderWithNavigation();

      // Check that the initial displayed month is "January".
      expect(getByText("January")).toBeTruthy();

      // Simulate a month change event to February (month value 2, year 2025).
      fireEvent(getByTestId("calendar-view"), "onMonthChange", { month: 2, year: 2025 });

      // Verify that the displayed month updates to "February".
      expect(getByText("February")).toBeTruthy();
    });
  });
});
