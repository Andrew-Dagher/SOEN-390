import axios from "axios";
import BusService from "../app/services/BusService";

jest.mock("axios");

describe("BusService", () => {
  beforeAll(() => {});

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers(); // Restore real timers after each test
  });

  afterAll(() => {});

  describe("getCookie", () => {
    it("should fetch and return the cookie, and log the headers", async () => {
      const mockCookie = ["ASP.NET_SessionId=mockSessionId; path=/; HttpOnly"];
      const mockHeaders = {
        "set-cookie": mockCookie,
        someOtherHeader: "someHeaderValue",
      };

      // Mock axios.get response
      axios.get.mockResolvedValue({
        headers: mockHeaders,
      });

      // Spy on console.log to confirm it logs the headers
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

      const cookie = await BusService.getCookie();

      expect(axios.get).toHaveBeenCalledWith(
        "https://shuttle.concordia.ca/concordiabusmap/Map.aspx",
        {
          headers: {
            Host: "shuttle.concordia.ca",
            "User-Agent": "Mozilla/5.0",
          },
        }
      );

      // Confirm we log the headers
      expect(consoleLogSpy).toHaveBeenCalledWith("Headers: ", mockHeaders);

      // Confirm we returned the set-cookie array
      expect(cookie).toEqual(mockCookie);

      consoleLogSpy.mockRestore();
    });

    it("should handle errors during cookie retrieval", async () => {
      const mockError = new Error("Failed to get cookie");
      axios.get.mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      const cookie = await BusService.getCookie();

      expect(axios.get).toHaveBeenCalled();
      expect(cookie).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith("Error getting cookie: ", mockError);

      consoleSpy.mockRestore();
    });
  });

  describe("getBusLocations", () => {
    it("should fetch and return bus locations", async () => {
      const mockCookie = ["ASP.NET_SessionId=mockSessionId; path=/; HttpOnly"];
      const mockLocations = { d: { __type: "GoogleObject", Points: [] } };

      axios.get.mockResolvedValue({
        headers: { "set-cookie": mockCookie },
      });
      axios.post.mockResolvedValue({ data: mockLocations });

      const locations = await BusService.getBusLocations();

      expect(axios.get).toHaveBeenCalledWith(
        "https://shuttle.concordia.ca/concordiabusmap/Map.aspx",
        {
          headers: {
            Host: "shuttle.concordia.ca",
            "User-Agent": "Mozilla/5.0",
          },
        }
      );
      expect(axios.post).toHaveBeenCalledWith(
        "https://shuttle.concordia.ca/concordiabusmap/WebService/GService.asmx/GetGoogleObject",
        {},
        {
          headers: {
            Host: "shuttle.concordia.ca",
            "Content-Length": 0,
            "Content-Type": "application/json; charset=utf-8",
            Cookie: mockCookie,
          },
          withCredentials: true,
        }
      );
      expect(locations).toEqual(mockLocations);
    });

    it("should handle errors during bus location retrieval", async () => {
      const mockError = new Error("Failed to get bus locations");
      axios.get.mockResolvedValue({
        headers: { "set-cookie": ["mockCookie"] },
      });
      axios.post.mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      const locations = await BusService.getBusLocations();

      expect(axios.get).toHaveBeenCalled();
      expect(axios.post).toHaveBeenCalled();
      expect(locations).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        "1 Error getting bus locations: ",
        mockError
      );

      consoleSpy.mockRestore();
    });

    it("should handle errors during cookie retrieval when getting locations", async () => {
      const mockError = new Error("Failed to get cookie");
      axios.get.mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      const locations = await BusService.getBusLocations();

      expect(axios.get).toHaveBeenCalled();
      expect(locations).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error getting cookie: ",
        mockError
      );

      consoleSpy.mockRestore();
    });
  });

  describe("update method (notifyObservers)", () => {
    afterEach(() => {
      BusService.clearObservers();
    });

    it("should fetch bus data and notify all observers", async () => {
      // Spy on getBusLocations to return a known value
      const getBusLocationsSpy = jest
        .spyOn(BusService, "getBusLocations")
        .mockResolvedValue("mockBusData");

      // Mock observer
      const observer = { update: jest.fn() };
      BusService.addObserver(observer);

      // Call update
      await BusService.update();

      expect(getBusLocationsSpy).toHaveBeenCalled();
      // The observer should have received the "mockBusData"
      expect(observer.update).toHaveBeenCalledWith("mockBusData");
    });

    it("should handle errors and log them during update", async () => {
      const mockError = new Error("Update error");
      jest.spyOn(BusService, "getBusLocations").mockRejectedValue(mockError);

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await BusService.update();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "2 Error updating bus locations: ",
        mockError
      );

      consoleErrorSpy.mockRestore();
    });
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
      // Should remain 1
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
      jest.useRealTimers(); // Restore real timers
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
