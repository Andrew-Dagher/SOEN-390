import { buildings } from "./inDoorConfig";

export const toPickerList = () => {
  let pickerList = [];
  buildings.forEach(building => {
    building.floors.forEach(floor => {
      Object.keys(floor.rooms).forEach(room => {
        pickerList.push({
          label: room,
          value: floor.rooms[room] // use the room identifier as the value
        });
      });
    });
  });
  return pickerList;
};

export const areRoomsOnSameFloor = (roomId1, roomId2) => {
  for (const building of buildings) {
    for (const floor of building.floors) {
      const roomIds = Object.values(floor.rooms);
      if (roomIds.includes(roomId1) && roomIds.includes(roomId2)) {
        return true; // Both rooms are on the same floor
      }
    }
  }
  return false; // Rooms are not on the same floor
};

export const areRoomsOnSameBuilding = (roomId1, roomId2) => {
  for (const building of buildings) {
    const roomIdsInBuilding = building.floors.flatMap(floor => Object.values(floor.rooms));
    if (roomIdsInBuilding.includes(roomId1) && roomIdsInBuilding.includes(roomId2)) {
      return true; // Both rooms are in the same building
    }
  }
  return false; // Rooms are not in the same building
};

export const getFloorIdByRoomId = (roomValue) => {
  for (const building of buildings) {
    for (const floor of building.floors) {
      if (Object.values(floor.rooms).includes(roomValue)) {
        return floor.floor_id; // Return the floor ID if room is found
      }
    }
  }
  return null; // Return null if the room ID is not found
};

// Helper function to determine the correct entrance based on accessibility and outdoor flags
function determineEntrance(floor, accessible, outdoor) {
  let entrance = floor.entrance;
  if (accessible && floor.disabled_entrance) {
    entrance = floor.disabled_entrance;
  }
  if (outdoor && floor.disabled_entrance) {
    entrance = floor.outdoor_entrance;
  }
  return entrance;
}

export const getEntranceByRoomId = (roomId, accessible = false, outdoor = false) => {
  for (const building of buildings) {
    // Find the floor that contains the roomId
    const floor = building.floors.find(f => Object.values(f.rooms).includes(roomId));
    if (floor) {
      // Return the entrance based on the provided flags
      return determineEntrance(floor, accessible, outdoor);
    }
  }
  return null; // Return null if the room ID is not found
};

export const getUrlByRoomId = (roomId) => {
  for (const building of buildings) {
    for (const floor of building.floors) {
      if (Object.values(floor.rooms).includes(roomId)) {
        let url = floor.url;
        return url;
      }
    }
  }
  return null; // Return null if the room ID is not found
};

export const getUrlByFloorId = (floorId) => {
  for (const building of buildings) {
    for (const floor of building.floors) {
      console.log(floor.floor_id, floorId);
      console.log(floor.floor_id === floorId);
      if (floor.floor_id === floorId) {
        return floor.url; // Return URL for the floor if room is found
      }
    }
  }
  return null; // Return null if the floor ID is not found
};

// Pre-generate picker list
export const pickerList = toPickerList();
