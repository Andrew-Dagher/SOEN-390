import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import CalendarScreen from "../app/screens/calendar/CalendarScreen";
import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as CalendarHelper from "../app/screens/calendar/CalendarHelper";
import { fetchPublicCalendarEvents } from "../app/screens/login/LoginHelper";
import moment from "moment";

// ---- Mock all dependencies so no real network calls/storage happen ----
jest.mock("@clerk/clerk-expo", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("../app/screens/login/LoginHelper", () => ({
  fetchPublicCalendarEvents: jest.fn(),
}));

jest.mock("../app/screens/calendar/CalendarHelper", () => ({
  handleGoToClass: jest.fn(),
}));

// Mock moment to have consistent dates in tests
jest.mock("moment", () => {
  const mockMoment = jest.requireActual("moment");
  // Mock current date to be consistent in tests
  const fixedDate = mockMoment("2025-01-01T10:00:00Z");
  return Object.assign(
    jest.fn(() => fixedDate),
    {
      ...mockMoment,
    }
  );
});

// Mock trackEvent
jest.mock("@aptabase/react-native", () => ({
  trackEvent: jest.fn(),
}));

// Mock AppSettingsContext
jest.mock("../../AppSettingsContext", () => ({
  useAppSettings: jest.fn(() => ({ textSize: 16 })),
}));

describe("CalendarScreen Tests", () => {
  const mockNavigation = {
    reset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset AsyncStorage mocks
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === "availableCalendars") {
        return Promise.resolve(
          JSON.stringify([
            { id: "calendar1", name: "Main Calendar" },
            { id: "calendar2", name: "Secondary Calendar" },
          ])
        );
      }
      if (key === "selectedCalendar") {
        return Promise.resolve("calendar1");
      }
      return Promise.resolve(null);
    });
  });

  it("shows the guest screen (GoToLoginButton) if user is not signed in", async () => {
    // Mock that user is NOT signed in
    useAuth.mockReturnValue({ isSignedIn: false });

    const { getByText } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );

    // Since user is not signed in, we expect to see the 'Login' button
    expect(getByText("Login")).toBeTruthy();
  });

  it("renders events when user is signed in and fetches from mock", async () => {
    // Mock that user IS signed in
    useAuth.mockReturnValue({ isSignedIn: true });

    // Provide mock calendar events
    fetchPublicCalendarEvents.mockResolvedValueOnce([
      {
        id: "1",
        title: "Sample Event",
        description: "Campus, Building, Room",
        start: { dateTime: "2025-01-01T10:00:00Z" },
        end: { dateTime: "2025-01-01T11:00:00Z" },
      },
    ]);

    const { getByText, findByText } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );

    // Wait for the event title to appear
    const eventTitle = await findByText("Sample Event");
    expect(eventTitle).toBeTruthy();

    // Expand the event to reveal the description and the "Go to Class" button
    fireEvent.press(eventTitle);

    // Now we can see the description
    expect(getByText("📍 Campus, Building, Room")).toBeTruthy();

    // Check if "Go to Class" button is there
    const goToClassBtn = getByText("Go to Class");
    expect(goToClassBtn).toBeTruthy();
  });

  it('calls handleGoToClass when "Go to Class" button is pressed', async () => {
    useAuth.mockReturnValue({ isSignedIn: true });

    // Mock event with a specific description
    fetchPublicCalendarEvents.mockResolvedValueOnce([
      {
        id: "2",
        title: "Another Event",
        description: "Campus, Building, Room",
        start: { dateTime: "2025-01-01T10:00:00Z" },
        end: { dateTime: "2025-01-01T11:00:00Z" },
      },
    ]);

    const { findByText, getByText } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );

    // Wait for event title
    const eventTitle = await findByText("Another Event");

    // Expand the event
    fireEvent.press(eventTitle);

    // Press "Go to Class"
    fireEvent.press(getByText("Go to Class"));

    // Verify it calls handleGoToClass with the description and navigation object
    expect(CalendarHelper.handleGoToClass).toHaveBeenCalledTimes(1);
    expect(CalendarHelper.handleGoToClass).toHaveBeenCalledWith(
      "Campus, Building, Room",
      expect.any(Object) // Because navigation is passed in
    );
  });

  it("redirects to login screen when GoToLoginButton is pressed", async () => {
    // Mock that user is NOT signed in
    useAuth.mockReturnValue({ isSignedIn: false });

    // Mock navigation
    jest
      .spyOn(require("@react-navigation/native"), "useNavigation")
      .mockReturnValue(mockNavigation);

    const { getByText } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );

    // Find and press login button
    fireEvent.press(getByText("Login"));

    // Wait for AsyncStorage operations
    await waitFor(() => {
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("sessionId");
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("userData");
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("guestMode");
      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: "Login" }],
      });
    });
  });

  it("shows loading indicator when fetching events", async () => {
    // Mock that user IS signed in
    useAuth.mockReturnValue({ isSignedIn: true });

    // Create a promise that won't resolve immediately to keep loading state active
    const eventPromise = new Promise((resolve) => {
      // This promise won't resolve during the test
      setTimeout(() => {
        resolve([]);
      }, 5000);
    });

    // Make the mock return our non-resolving promise
    fetchPublicCalendarEvents.mockReturnValueOnce(eventPromise);

    const { getByTestId } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );

    // Add testID to the ActivityIndicator in your component first, for example:
    // <ActivityIndicator testID="loading-indicator" size="large" color="#862532" />
    expect(getByTestId("loading-indicator")).toBeTruthy();
  });

  it("navigates to previous week when left arrow is pressed", async () => {
    // Mock that user IS signed in
    useAuth.mockReturnValue({ isSignedIn: true });

    fetchPublicCalendarEvents.mockResolvedValue([]);

    const { getByText } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(fetchPublicCalendarEvents).toHaveBeenCalled();
    });

    // First call is for the initial week
    const initialCall = fetchPublicCalendarEvents.mock.calls[0];

    // Press the left arrow to go to previous week
    fireEvent.press(getByText("←"));

    // Wait for the second API call
    await waitFor(() => {
      expect(fetchPublicCalendarEvents).toHaveBeenCalledTimes(2);
    });

    const secondCall = fetchPublicCalendarEvents.mock.calls[1];

    // Verify that the start date in the second call is 7 days before the first call
    const firstStartDate = new Date(initialCall[1]);
    const secondStartDate = new Date(secondCall[1]);
    const daysDifference = Math.round(
      (firstStartDate - secondStartDate) / (1000 * 60 * 60 * 24)
    );
    expect(daysDifference).toBe(7);
  });

  it("navigates to next week when right arrow is pressed", async () => {
    // Mock that user IS signed in
    useAuth.mockReturnValue({ isSignedIn: true });

    fetchPublicCalendarEvents.mockResolvedValue([]);

    const { getByText } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(fetchPublicCalendarEvents).toHaveBeenCalled();
    });

    // First call is for the initial week
    const initialCall = fetchPublicCalendarEvents.mock.calls[0];

    // Press the right arrow to go to next week
    fireEvent.press(getByText("→"));

    // Wait for the second API call
    await waitFor(() => {
      expect(fetchPublicCalendarEvents).toHaveBeenCalledTimes(2);
    });

    const secondCall = fetchPublicCalendarEvents.mock.calls[1];

    // Verify that the start date in the second call is 7 days after the first call
    const firstStartDate = new Date(initialCall[1]);
    const secondStartDate = new Date(secondCall[1]);
    const daysDifference = Math.round(
      (secondStartDate - firstStartDate) / (1000 * 60 * 60 * 24)
    );
    expect(daysDifference).toBe(7);
  });

  it("opens and selects calendar from the calendar selection modal", async () => {
    // Mock that user IS signed in
    useAuth.mockReturnValue({ isSignedIn: true });

    fetchPublicCalendarEvents.mockResolvedValue([]);

    const { getByText, findByText } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(fetchPublicCalendarEvents).toHaveBeenCalled();
    });

    // Find and click the calendar menu button (the three dots)
    // We may need to add a testID to the button in the component
    const calendarMenuButton = await findByText("My Calendar");
    // Click near the button to approximate the position of the three-dots menu
    // This is a bit hacky - ideally add a testID to the button in your component
    fireEvent.press(calendarMenuButton);

    // Now find and select "Secondary Calendar"
    const secondaryCalendarOption = await findByText("Secondary Calendar");
    fireEvent.press(secondaryCalendarOption);

    // Check if selectedCalendar was updated in AsyncStorage
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "selectedCalendar",
      "calendar2"
    );

    // Check if a new fetch was made with the new calendar ID
    await waitFor(() => {
      const lastCall = fetchPublicCalendarEvents.mock.calls.pop();
      expect(lastCall[0]).toBe("calendar2");
    });
  });

  it("displays 'No events' message when there are no events for selected day", async () => {
    // Mock that user IS signed in
    useAuth.mockReturnValue({ isSignedIn: true });

    // Return an empty array of events
    fetchPublicCalendarEvents.mockResolvedValueOnce([]);

    const { findByText } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );

    // Check for the "No events" message
    const noEventsMsg = await findByText(/No events for/);
    expect(noEventsMsg).toBeTruthy();
  });

  it("selects a different day when clicking on a day in the week view", async () => {
    // Mock that user IS signed in
    useAuth.mockReturnValue({ isSignedIn: true });

    // Create events for different days of the week
    const mockEvents = [
      {
        id: "1",
        title: "Monday Event",
        description: "Campus, Building, Room",
        start: { dateTime: "2025-01-01T10:00:00Z" }, // Wednesday (our fixed date)
        end: { dateTime: "2025-01-01T11:00:00Z" },
      },
      {
        id: "2",
        title: "Thursday Event",
        description: "Campus, Building, Room",
        start: { dateTime: "2025-01-02T14:00:00Z" }, // Thursday
        end: { dateTime: "2025-01-02T15:00:00Z" },
      },
    ];

    fetchPublicCalendarEvents.mockResolvedValueOnce(mockEvents);

    const { findByText, queryByText } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );

    // Wait for loading to finish
    await findByText("Monday Event");

    // Find and click Thursday in the week view
    const thursday = await findByText("Thu");
    fireEvent.press(thursday);

    // Now we should see the Thursday event and not the Monday event
    await findByText("Thursday Event");
    expect(queryByText("Monday Event")).toBeNull();
  });

  it("expands and collapses an event when clicked", async () => {
    // Mock that user IS signed in
    useAuth.mockReturnValue({ isSignedIn: true });

    // Provide mock calendar events
    fetchPublicCalendarEvents.mockResolvedValueOnce([
      {
        id: "1",
        title: "Sample Event",
        description: "Campus, Building, Room",
        start: { dateTime: "2025-01-01T10:00:00Z" },
        end: { dateTime: "2025-01-01T11:00:00Z" },
      },
    ]);

    const { findByText, queryByText } = render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );

    // Wait for the event title to appear
    const eventTitle = await findByText("Sample Event");

    // Initially, the description should not be visible
    expect(queryByText("📍 Campus, Building, Room")).toBeNull();

    // Expand the event by clicking on it
    fireEvent.press(eventTitle);

    // Now the description should be visible
    expect(await findByText("📍 Campus, Building, Room")).toBeTruthy();

    // Collapse the event by clicking again
    fireEvent.press(eventTitle);

    // Description should be hidden again
    await waitFor(() => {
      expect(queryByText("📍 Campus, Building, Room")).toBeNull();
    });
  });
});
