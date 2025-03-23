import { toPickerList, areRoomsOnSameFloor, areRoomsOnSameBuilding, getFloorIdByRoomId, getEntranceByRoomId, getUrlFromRoomId, building } from '../app/screens/indoor/inDoorUtil';

describe("Building Utility Functions", () => {

  describe("toPickerList", () => {
    it("should return a picker list with correct labels and values", () => {
      const pickerList = toPickerList();
      expect(pickerList).toEqual([
        { label: "H917", value: "s_7e282b843c0f8a66" },
        { label: "H963", value: "s_dc36b55ee3eb5c3a" },
        { label: "H809", value: "s_f79cb93ae628833c" },
        { label: "H815", value: "s_adee63f7d4d4f772" },
        { label: "H849", value: "s_46120eef38d0b708" },
        { label: "CC124", value: "s_411f8b3269cea1be" },
        { label: "CC122", value: "s_2e19aa43676ec0b1" },
        { label: "CC120", value: "s_9287cf4dd891b79a" },
        { label: "CC118", value: "s_44900512ccdb04b0" },
        { label: "CC116", value: "s_5ebd4db1734e60f6" },
        { label: "CC112", value: "s_929b5d3a8638066b" },
        { label: "CC106", value: "s_fb7e57cfad19eb3d" }
      ]);
    });
  });

  describe("areRoomsOnSameFloor", () => {
    it("should return true if two rooms are on the same floor", () => {
      expect(areRoomsOnSameFloor("s_7e282b843c0f8a66", "s_dc36b55ee3eb5c3a")).toBe(true); // Hall 9
      expect(areRoomsOnSameFloor("s_411f8b3269cea1be", "s_9287cf4dd891b79a")).toBe(true); // SP Building
    });

    it("should return false if two rooms are on different floors", () => {
      expect(areRoomsOnSameFloor("s_7e282b843c0f8a66", "s_9287cf4dd891b79a")).toBe(false); // Hall 9 and SP Building
    });
  });

  describe("areRoomsOnSameBuilding", () => {
    it("should return true if two rooms are in the same building", () => {
      expect(areRoomsOnSameBuilding("s_7e282b843c0f8a66", "s_dc36b55ee3eb5c3a")).toBe(true); // Hall Building (Hall 9)
      expect(areRoomsOnSameBuilding("s_411f8b3269cea1be", "s_9287cf4dd891b79a")).toBe(true); // SP Building
    });

    it("should return false if two rooms are in different buildings", () => {
      expect(areRoomsOnSameBuilding("s_7e282b843c0f8a66", "s_9287cf4dd891b79a")).toBe(false); // Hall Building and SP Building
    });
  });

  describe("getFloorIdByRoomId", () => {
    it("should return the correct floor ID for a given room ID", () => {
      expect(getFloorIdByRoomId("s_7e282b843c0f8a66")).toBe("m_ff2c8c646277c61e"); // Hall 9
      expect(getFloorIdByRoomId("s_411f8b3269cea1be")).toBe(""); // SP Building (no floor_id)
    });

    it("should return null if the room ID does not exist", () => {
      expect(getFloorIdByRoomId("invalid_room")).toBeNull();
    });
  });

  describe("getEntranceByRoomId", () => {
    it("should return the correct entrance coordinates for a given room ID", () => {
      expect(getEntranceByRoomId("s_7e282b843c0f8a66")).toBe("45.497310869658996%2C-73.5787282015637%2Cm_ff2c8c646277c61e");
      expect(getEntranceByRoomId("s_411f8b3269cea1be")).toBe("45.4583718018728%2C-73.64074551435993%2Cm_00a45bb03dc793b9");
    });

    it("should return null if the room ID does not exist", () => {
      expect(getEntranceByRoomId("invalid_room")).toBeNull();
    });
  });

  describe("getUrlFromRoomId", () => {
    it("should return the correct URL for a given room ID", () => {
      expect(getUrlFromRoomId("s_7e282b843c0f8a66")).toBe("https://app.mappedin.com/map/67d7285c3b90e4000beb55d5/directions?kiosk=false&outdoors=false");
      expect(getUrlFromRoomId("s_411f8b3269cea1be")).toBe("https://app.mappedin.com/map/67d88e2581104a000b6df10e/directions?embedded=true&outdoors=false&kiosk=false");
    });

    it("should return null if the room ID does not exist", () => {
      expect(getUrlFromRoomId("invalid_room")).toBeNull();
    });
  });

});
