import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import BusService from "../app/services/BusService";

jest.mock("axios");

describe("BusService", () => {
  let mock;

  beforeAll(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
    jest.clearAllMocks();
    jest.useRealTimers(); // Restore real timers after each test
  });

  afterAll(() => {
    mock.restore();
  });

  describe("Observer pattern", () => {
    afterEach(() => {
      BusService.clearObservers();
    });
    it("should add an observer", () => {
      const observer = { update: jest.fn() };
      BusService.addObserver(observer);
      expect(BusService.observers).toContain(observer);
    });

    it("should not add the same observer twice", () => {
      const observer = { update: jest.fn() };
      BusService.addObserver(observer);
      BusService.addObserver(observer);
      expect(BusService.observers.length).toBe(1);
    });

    it("should remove an observer", () => {
      const observer = { update: jest.fn() };
      BusService.addObserver(observer);
      BusService.removeObserver(observer);
      expect(BusService.observers).not.toContain(observer);
    });
  });

  describe("start and stop", () => {
    beforeEach(() => {
      jest.useFakeTimers(); // Use fake timers for these tests
      jest.spyOn(global, "setInterval");
      jest.spyOn(global, "clearInterval");
    });

    afterEach(() => {
      BusService.stop();
      jest.useRealTimers(); // Restore real timers after each test
    });

    it("should start the bus service", () => {
      BusService.start();
      expect(setInterval).toHaveBeenCalled();
    });

    it("should not start the bus service if already started", () => {
      BusService.start();
      BusService.start();
      expect(setInterval).toHaveBeenCalledTimes(1);
    });

    it("should stop the bus service", () => {
      BusService.start();
      BusService.stop();
      expect(clearInterval).toHaveBeenCalled();
    });
  });
});
