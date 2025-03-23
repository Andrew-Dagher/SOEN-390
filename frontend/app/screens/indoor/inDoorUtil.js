import { building } from "./inDoorConfig";

export const toPickerList = () => {
    let pickerList = [];
  
    building.floors.forEach(floor => {
      Object.keys(floor.rooms).forEach(room => {
        pickerList.push({
          label: room,
          value: floor.rooms[room] // use the room identifier as the value
        });
      });
    });
  
    return pickerList;
};

export const areRoomsOnSameFloor = (roomId1, roomId2) => {
    return building.floors.some(floor => 
        Object.values(floor.rooms).includes(roomId1) && Object.values(floor.rooms).includes(roomId2)    );
};

export const areRoomsOnSameBuilding = (roomId1, roomId2) => {
    return building.floors.some(floor => {
      const rooms = Object.values(floor.rooms);
      return rooms.includes(roomId1) && rooms.includes(roomId2);
    });
};

export const getFloorIdByRoomId = (roomValue) => {
    for (let floor of building.floors) {
      if (Object.values(floor.rooms).includes(roomValue)) {
        return floor.floor_id;
      }
    }
    return null;
};

export const getEntranceByRoomId = (roomId) => {
    for (let floor of building.floors) {
      if (Object.values(floor.rooms).includes(roomId)) {
        return floor.entrance;
      }
    }
    return null; // Return null if the room ID is not found
};

export const getUrlFromRoomId = (roomId) => {
    // Iterate through each floor in the building
    for (const floor of building.floors) {
      // Check if the roomId exists in the current floor's rooms
      if (Object.values(floor.rooms).includes(roomId)) {
        // Return the URL for the floor if the room is found
        return floor.url;
      }
    }
    // Return null if the roomId is not found in any floor
    return null;
};
  

export const pickerList = toPickerList(building);