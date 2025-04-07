// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Important: Mock the entire 'react-native' module
// This ensures all internal RN modules are properly mocked
jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native");

  // Mock BackHandler
  RN.BackHandler = {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
  };

  // Mock Dimensions
  RN.Dimensions = {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  };

  // Mock Animated
  RN.Animated = {
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      interpolate: jest.fn(() => ({ __getValue: jest.fn() })),
    })),
    timing: jest.fn(() => ({
      start: jest.fn((cb) => cb?.({ finished: true })),
    })),
    spring: jest.fn(() => ({
      start: jest.fn((cb) => cb?.({ finished: true })),
    })),
    parallel: jest.fn(() => ({
      start: jest.fn((cb) => cb?.({ finished: true })),
    })),
    View: "Animated.View",
    createAnimatedComponent: jest.fn((component) => component),
  };

  return RN;
});

// Mock third-party dependencies
jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

jest.mock("@react-native-community/slider", () => "Slider");

// Use fake timers
jest.useFakeTimers();
