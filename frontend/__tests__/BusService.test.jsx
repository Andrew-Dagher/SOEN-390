import axios from "axios";
import MockAdapter from "axios-mock-adapter";
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
    it("should fetch and return the cookie", async () => {
      const mockCookie = ["ASP.NET_SessionId=mockSessionId; path=/; HttpOnly"];
      axios.get.mockResolvedValue({
        headers: { "set-cookie": mockCookie },
      });

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
      expect(cookie).toEqual(mockCookie);
    });

    it("should handle errors during cookie retrieval", async () => {
      const mockError = new Error("Failed to get cookie");
      axios.get.mockRejectedValue(mockError);

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const cookie = await BusService.getCookie();

      expect(axios.get).toHaveBeenCalled();
      expect(cookie).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error getting cookie: ",
        mockError
      );

      consoleSpy.mockRestore();
    });
  });

  describe("getBusLocations", () => {
    it("should fetch and return bus locations", async () => {
      const mockCookie = ["ASP.NET_SessionId=mockSessionId; path=/; HttpOnly"];
      const mockLocations = {
        d: {
          __type: "GoogleObject",
          Directions: {
            Addresses: [],
            Locale: "en_US",
            ShowDirectionInstructions: false,
            HideMarkers: false,
            PolylineOpacity: 0.6,
            PolylineWeight: 3,
            PolylineColor: "#0000FF",
          },
          Points: [
            {
              PointStatus: "",
              Address: "",
              ID: "GPLoyola",
              IconImage: "icons/T12-13661-icon-LOY.png",
              IconShadowImage: "",
              IconImageWidth: 57,
              IconShadowWidth: 0,
              IconShadowHeight: 0,
              IconAnchor_posX: 28,
              IconAnchor_posY: 47,
              InfoWindowAnchor_posX: 28,
              InfoWindowAnchor_posY: 15,
              Draggable: false,
              IconImageHeight: 47,
              Latitude: 45.458022,
              Longitude: -73.639835,
              InfoHTML: "",
              ToolTip: "",
            },
            {
              PointStatus: "",
              Address: "",
              ID: "GPSirGeorge",
              IconImage: "icons/T12-13661-icon-SGW.png",
              IconShadowImage: "",
              IconImageWidth: 57,
              IconShadowWidth: 0,
              IconShadowHeight: 0,
              IconAnchor_posX: 28,
              IconAnchor_posY: 47,
              InfoWindowAnchor_posX: 28,
              InfoWindowAnchor_posY: 15,
              Draggable: false,
              IconImageHeight: 47,
              Latitude: 45.497109,
              Longitude: -73.578734,
              InfoHTML: "",
              ToolTip: "",
            },
            {
              PointStatus: "",
              Address: "",
              ID: "BUS0",
              IconImage: "icons/T12-13661-icon-bus.png",
              IconShadowImage: "",
              IconImageWidth: 53,
              IconShadowWidth: 0,
              IconShadowHeight: 0,
              IconAnchor_posX: 26,
              IconAnchor_posY: 80,
              InfoWindowAnchor_posX: 26,
              InfoWindowAnchor_posY: 26,
              Draggable: false,
              IconImageHeight: 80,
              Latitude: 45.4499321,
              Longitude: -73.6319199,
              InfoHTML: "",
              ToolTip: "",
            },
            {
              PointStatus: "",
              Address: "",
              ID: "BUS1",
              IconImage: "icons/T12-13661-icon-bus.png",
              IconShadowImage: "",
              IconImageWidth: 53,
              IconShadowWidth: 0,
              IconShadowHeight: 0,
              IconAnchor_posX: 26,
              IconAnchor_posY: 80,
              InfoWindowAnchor_posX: 26,
              InfoWindowAnchor_posY: 26,
              Draggable: false,
              IconImageHeight: 80,
              Latitude: 45.7183762,
              Longitude: -73.7131042,
              InfoHTML: "",
              ToolTip: "",
            },
            {
              PointStatus: "",
              Address: "",
              ID: "BUS2",
              IconImage: "icons/T12-13661-icon-bus.png",
              IconShadowImage: "",
              IconImageWidth: 53,
              IconShadowWidth: 0,
              IconShadowHeight: 0,
              IconAnchor_posX: 26,
              IconAnchor_posY: 80,
              InfoWindowAnchor_posX: 26,
              InfoWindowAnchor_posY: 26,
              Draggable: false,
              IconImageHeight: 80,
              Latitude: 45.4971886,
              Longitude: -73.578392,
              InfoHTML: "",
              ToolTip: "",
            },
            {
              PointStatus: "",
              Address: "",
              ID: "BUS3",
              IconImage: "icons/T12-13661-icon-bus.png",
              IconShadowImage: "",
              IconImageWidth: 53,
              IconShadowWidth: 0,
              IconShadowHeight: 0,
              IconAnchor_posX: 26,
              IconAnchor_posY: 80,
              InfoWindowAnchor_posX: 26,
              InfoWindowAnchor_posY: 26,
              Draggable: false,
              IconImageHeight: 80,
              Latitude: 45.4531593,
              Longitude: -73.7331085,
              InfoHTML: "",
              ToolTip: "",
            },
            {
              PointStatus: "",
              Address: "",
              ID: "BUS4",
              IconImage: "icons/T12-13661-icon-bus.png",
              IconShadowImage: "",
              IconImageWidth: 53,
              IconShadowWidth: 0,
              IconShadowHeight: 0,
              IconAnchor_posX: 26,
              IconAnchor_posY: 80,
              InfoWindowAnchor_posX: 26,
              InfoWindowAnchor_posY: 26,
              Draggable: false,
              IconImageHeight: 80,
              Latitude: 45.4584045,
              Longitude: -73.6382217,
              InfoHTML: "",
              ToolTip: "",
            },
          ],
          Polylines: [],
          Polygons: [],
          CenterPoint: {
            PointStatus: "",
            Address: "",
            ID: "1",
            IconImage: "",
            IconShadowImage: "",
            IconImageWidth: 32,
            IconShadowWidth: 0,
            IconShadowHeight: 0,
            IconAnchor_posX: 16,
            IconAnchor_posY: 32,
            InfoWindowAnchor_posX: 16,
            InfoWindowAnchor_posY: 5,
            Draggable: false,
            IconImageHeight: 32,
            Latitude: 45.48469766613475,
            Longitude: -73.6083984375,
            InfoHTML: "",
            ToolTip: "",
          },
          ZoomLevel: 14,
          ShowZoomControl: false,
          RecenterMap: false,
          AutomaticBoundaryAndZoom: false,
          ShowTraffic: false,
          ShowMapTypesControl: false,
          Width: "1920px",
          Height: "1080px",
          MapType: "",
          APIKey: "AIzaSyBHv4-d_68ISROn8_sW3DHG3AfIpq7QGzM",
          APIVersion: "2",
        },
      };

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

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

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

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

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
