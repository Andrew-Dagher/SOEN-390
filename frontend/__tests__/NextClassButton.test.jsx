import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import NextClassButton from "../app/components/calendar/NextClassButton";
import { Animated } from "react-native";

// Mock dependencies
jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));
jest.mock("expo-location", () => ({
  getCurrentPositionAsync: jest.fn(),
}));
jest.mock("../app/components/Calendar/CalendarIcons/CalendarDirectionsIcon", () => "CalendarDirectionsIcon");

// Mock Animated.timing
jest.spyOn(Animated, "timing").mockImplementation(() => ({
  start: jest.fn(),
}));

// Mock event observer
const createMockObserver = () => ({
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
});

describe("NextClassButton", () => {
  let mockNavigation;

  beforeEach(() => {
    mockNavigation = { navigate: jest.fn() };
    useNavigation.mockReturnValue(mockNavigation);
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 40.7128, longitude: -74.0060 },
    });
    jest.clearAllMocks();
  });

  it("returns null when there are no upcoming events", () => {
    const mockObserver = createMockObserver();
    const { queryByText } = render(<NextClassButton eventObserver={mockObserver} />);
    expect(queryByText("Go to My Next Class")).toBeNull();
    expect(mockObserver.subscribe).toHaveBeenCalled();
  });

  it("renders button when there is an upcoming event", async () => {
    const mockObserver = createMockObserver();
    const { findByText } = render(<NextClassButton eventObserver={mockObserver} />);

    const callback = mockObserver.subscribe.mock.calls[0][0];
    await act(async () => {
      callback([
        {
          start: { dateTime: new Date(Date.now() + 10000).toISOString() },
          description: "Campus A, Building 1",
        },
      ]);
    });

    const buttonText = await findByText("Go to My Next Class");
    expect(buttonText).toBeTruthy();
    expect(Animated.timing).toHaveBeenCalledWith(
      expect.any(Animated.Value),
      expect.objectContaining({
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    );
  });

  it("navigates to next class location when button is pressed", async () => {
    const mockObserver = createMockObserver();
    const { findByText } = render(<NextClassButton eventObserver={mockObserver} />);

    const callback = mockObserver.subscribe.mock.calls[0][0];
    await act(async () => {
      callback([
        {
          start: { dateTime: new Date(Date.now() + 10000).toISOString() },
          description: "Campus A, Building 1",
        },
      ]);
    });

    const button = await findByText("Go to My Next Class");
    fireEvent.press(button);

    await waitFor(() => {
      expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
      expect(mockNavigation.navigate).toHaveBeenCalledWith("Navigation", {
        campus: "campus a",
        buildingName: "Building 1",
        currentLocation: {
          latitude: 40.7128,
          longitude: -74.0060,
        },
      });
    });
  });

  it("clears location when events array is empty", () => {
    const mockObserver = createMockObserver();
    const { queryByText, rerender } = render(<NextClassButton eventObserver={mockObserver} />);

    const callback = mockObserver.subscribe.mock.calls[0][0];
    callback([]); // Empty event array

    rerender(<NextClassButton eventObserver={mockObserver} />);
    expect(queryByText("Go to My Next Class")).toBeNull();
  });

  it("handles location fetching error gracefully", async () => {
    const mockObserver = createMockObserver();
    Location.getCurrentPositionAsync.mockRejectedValue(new Error("Location error"));
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const { findByText } = render(<NextClassButton eventObserver={mockObserver} />);

    const callback = mockObserver.subscribe.mock.calls[0][0];
    await act(async () => {
      callback([
        {
          start: { dateTime: new Date(Date.now() + 10000).toISOString() },
          description: "Campus A, Building 1",
        },
      ]);
    });

    const button = await findByText("Go to My Next Class");
    fireEvent.press(button);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error navigating to next class:",
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it("unsubscribes from observer on unmount", () => {
    const mockObserver = createMockObserver();
    const { unmount } = render(<NextClassButton eventObserver={mockObserver} />);

    const callback = mockObserver.subscribe.mock.calls[0][0];
    unmount();

    expect(mockObserver.unsubscribe).toHaveBeenCalledWith(callback);
  });

  it("correctly sorts and selects the earliest upcoming event", async () => {
    const mockObserver = createMockObserver();
    const { findByText } = render(<NextClassButton eventObserver={mockObserver} />);

    const now = new Date();
    const callback = mockObserver.subscribe.mock.calls[0][0];
    await act(async () => {
      callback([
        {
          start: { dateTime: new Date(now.getTime() + 20000).toISOString() },
          description: "Campus B, Building 2",
        },
        {
          start: { dateTime: new Date(now.getTime() + 10000).toISOString() },
          description: "Campus A, Building 1",
        },
        {
          start: { dateTime: new Date(now.getTime() - 10000).toISOString() },
          description: "Campus C, Building 3",
        },
      ]);
    });

    const buttonText = await findByText("Go to My Next Class");
    expect(buttonText).toBeTruthy();

    fireEvent.press(buttonText);
    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith(
        "Navigation",
        expect.objectContaining({
          campus: "campus a",
          buildingName: "Building 1",
        })
      );
    });
  });

  it("sets location to null when all events are in the past", () => {
    const mockObserver = createMockObserver();
    const { queryByText, rerender } = render(<NextClassButton eventObserver={mockObserver} />);

    const now = new Date();
    const callback = mockObserver.subscribe.mock.calls[0][0];
    callback([
      {
        start: { dateTime: new Date(now.getTime() - 20000).toISOString() },
        description: "Campus A, Building 1",
      },
      {
        start: { dateTime: new Date(now.getTime() - 10000).toISOString() },
        description: "Campus B, Building 2",
      },
    ]);

    rerender(<NextClassButton eventObserver={mockObserver} />);
    expect(queryByText("Go to My Next Class")).toBeNull();
  });

  it("does not render the button if the only upcoming events are for a different day", () => {
    const mockObserver = createMockObserver();
    const { queryByText } = render(<NextClassButton eventObserver={mockObserver} />);

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const callback = mockObserver.subscribe.mock.calls[0][0];
    callback([
      {
        start: { dateTime: tomorrow.toISOString() },
        description: "Campus X, Building X",
      },
    ]);

    expect(queryByText("Go to My Next Class")).toBeNull();
  });

  it("filters out past events on the current day and selects the next event today", async () => {
    const mockObserver = createMockObserver();
    const { findByText } = render(<NextClassButton eventObserver={mockObserver} />);

    const now = new Date();
    const todayEarlier = new Date(now.getTime() - 10000); // 10 seconds ago
    const todayLater = new Date(now.getTime() + 10000); // 10 seconds from now

    const callback = mockObserver.subscribe.mock.calls[0][0];
    await act(async () => {
      callback([
        {
          start: { dateTime: todayEarlier.toISOString() }, // Past event today
          description: "Campus A, Building 1",
        },
        {
          start: { dateTime: todayLater.toISOString() }, // Future event today
          description: "Campus B, Building 2",
        },
      ]);
    });

    const buttonText = await findByText("Go to My Next Class");
    expect(buttonText).toBeTruthy();

    expect(Animated.timing).toHaveBeenCalledWith(
      expect.any(Animated.Value),
      expect.objectContaining({
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    );

    fireEvent.press(buttonText);
    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith(
        "Navigation",
        expect.objectContaining({
          campus: "campus b",
          buildingName: "Building 2",
        })
      );
    });
  });

  // ------------------- NEW TESTS TO IMPROVE COVERAGE -------------------

  it("handles description with no comma (only campus name)", async () => {
    // This covers the code path where nextEventLocation.split(",")
    // yields only one part, so buildingName is empty.
    const mockObserver = createMockObserver();
    const { findByText } = render(<NextClassButton eventObserver={mockObserver} />);

    const callback = mockObserver.subscribe.mock.calls[0][0];
    await act(async () => {
      callback([
        {
          start: { dateTime: new Date(Date.now() + 60000).toISOString() },
          description: "JustCampusNoComma",
        },
      ]);
    });

    const button = await findByText("Go to My Next Class");
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith(
        "Navigation",
        expect.objectContaining({
          campus: "justcampusnocomma",
          buildingName: "", // Because there's no second comma part
        })
      );
    });
  });

  it("strips <pre> tags from campus and building name", async () => {
    const mockObserver = createMockObserver();
    const { findByText } = render(<NextClassButton eventObserver={mockObserver} />);

    const callback = mockObserver.subscribe.mock.calls[0][0];
    await act(async () => {
      callback([
        {
          start: { dateTime: new Date(Date.now() + 5000).toISOString() },
          description: "<pre>Campus A</pre>, <pre>Building 1</pre>",
        },
      ]);
    });

    const button = await findByText("Go to My Next Class");
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith(
        "Navigation",
        expect.objectContaining({
          campus: "campus a", // <pre> tags removed + lowercased
          buildingName: "Building 1", // <pre> tags removed
        })
      );
    });
  });
});
