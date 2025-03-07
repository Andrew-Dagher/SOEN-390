import axios from "axios";

// Consts
const REFRESH_INTERVAL = 5000; // How often to refresh the bus locations in ms
const COOKIE_URL = "https://shuttle.concordia.ca/concordiabusmap/Map.aspx";
const LOCATION_URL =
  "https://shuttle.concordia.ca/concordiabusmap/WebService/GService.asmx/GetGoogleObject"; // URL to get the bus locations
const HOST = "shuttle.concordia.ca"; // Host
const AXIOSINSTANCE = axios.create({
  withCredentials: true,
});
class BusService {
  static instance; // Singleton
  static intervalId;
  constructor() {
    this.observers = [];
  }

  static getInstance() {
    // Singleton
    if (!BusService.instance) {
      BusService.instance = new BusService();
    }
    return BusService.instance;
  }

  async getCookie() {
    try {
      const response = await AXIOSINSTANCE.get(COOKIE_URL, {
        headers: {
          Host: HOST,
          "User-Agent": "Mozilla/5.0", // Mimic a browser
        },
      });
      console.log("Headers: ", response.headers);
      return response.headers["set-cookie"];
    } catch (error) {
      console.error("Error getting cookie: ", error);
    }
  }

  async getBusLocations() {
    try {
      const cookie = await this.getCookie();
      const response = await AXIOSINSTANCE.post(
        LOCATION_URL,
        {}, // Empty body
        {
          headers: {
            Host: HOST,
            "Content-Length": 0,
            "Content-Type": "application/json; charset=utf-8",
            Cookie: cookie,
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("1 Error getting bus locations: ", error);
    }
  }

  // Observer pattern
  async update() {
    try {
      const busData = await this.getBusLocations();
      this.notifyObservers(busData);
    } catch (error) {
      console.error("2 Error updating bus locations: ", error);
    }
  }

  addObserver(observer) {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    } else {
      console.log("Observer already added.");
    }
  }

  removeObserver(observer) {
    this.observers = this.observers.filter((o) => o !== observer);
  }

  notifyObservers(data) {
    this.observers.forEach((observer) => observer.update(data));
  }

  clearObservers() {
    this.observers = [];
  }

  start() {
    if (BusService.intervalId) {
      console.log("Already started");
      return;
    }
    console.log("Started bus service");
    BusService.intervalId = setInterval(() => this.update(), REFRESH_INTERVAL);
  }

  stop() {
    clearInterval(BusService.intervalId);
    BusService.intervalId = null;
  }
}

export default BusService.getInstance();
