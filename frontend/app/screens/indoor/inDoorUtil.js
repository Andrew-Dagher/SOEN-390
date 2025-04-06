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

export const isEntranceFloor = (floorId) => {
  for (const building of buildings) {
    let start_name = building.start_floor
    for (const floor of building.floors) {
      if (floor.floor_id === floorId && floor.name == start_name) return true; // true, the floor id is the same floor as the first floor of the building
    }
  }
  return false;
}

export const getEntranceFloor = (floorId) => {
  let start_name = "";
  for (const building of buildings) {
    for (const floor of building.floors) {
      if (floor.floor_id === floorId) {
        start_name = building.start_floor; // extraxct the building start floor from the floor id
      }
    }    
  }
  for (const building of buildings) {
    for (const floor of building.floors) {
      if (floor.name === start_name) {
        return floor; // return the start floor with all its information
      }
    }
  }
  return null; // return null if the entrance is not in the floors
}

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


export const handleToCampus = (value, value1, wheelchairAccess, setDirectionsFlow, setIndex) => {
  if (value == null || value1 == null) return;

  let floorId = getFloorIdByRoomId(value);
  let startUrl = getUrlByFloorId(floorId);
  let nextFloorId = getFloorIdByRoomId(value1);
  let entranceLoc = getEntranceByRoomId(value);
  let nextEntranceLoc = getEntranceByRoomId(value1);

  if (wheelchairAccess){
    entranceLoc=getEntranceByRoomId(value, true)
    nextEntranceLoc= getEntranceByRoomId(value1, true)
  }


  if (areRoomsOnSameFloor(value, value1)) {
    // If rooms are on the same floor, directly show the indoor map
    let url = startUrl + "&floor=" + floorId + "&location=" + value1 + "&departure=" + value
    let flow = [
      {url: url, is_indoor: true}
    ]
    setDirectionsFlow(flow);
    setIndex(0);
    return;
  } 
  if (areRoomsOnSameBuilding(value, value1)) {
    // rooms are on different floors but same building
    let url1 = startUrl+ "&floor=" + floorId + "&departure=" + value + "&location=" + entranceLoc;
    let url2 = startUrl + "&floor=" + nextFloorId + "&location=" + value1 + "&departure=" + nextEntranceLoc;
    let flow = [
      {url: url1, is_indoor: true},
      {url: url2, is_indoor: true}
    ]
    console.log("hhi");
    console.log(flow);
    setDirectionsFlow(flow);
    setIndex(0);
    return;
  }
  // If rooms are on different buildings, get outdoor navigations
  // Multi-floor or multi-building navigation
  let buildingURL = getUrlByRoomId(value1);
  let entranceFloor = getEntranceFloor(floorId); // get the information for the first floor of the building
  let entranceFloor2 = getEntranceFloor(nextFloorId); // get the information for the first floor of the building destination
  if (wheelchairAccess){
    nextEntranceLoc=getEntranceByRoomId(value1, true,true)
  }
  else{
    nextEntranceLoc=getEntranceByRoomId(value1, false, true)
  }

  let url1 = startUrl + "&floor=" + floorId + "&departure=" + value + "&location=" + entranceLoc;
  let url2 = startUrl+"&floor="+ entranceFloor.floor_id + "&departure="+entranceFloor.exit+"&location="+entranceFloor.entrance;
  let url3 = buildingURL + "&floor=" + entranceFloor2.floor_id + "&departure=" + entranceFloor2.exit+"&location="+entranceFloor2.entrance; // build the building destination first floor
  let url4 = buildingURL + "&floor=" + nextFloorId + "&location=" + value1 + "&departure=" + nextEntranceLoc;
  if (isEntranceFloor(floorId)) {
    url2 = null;
  }
  if (isEntranceFloor(nextFloorId)) {
    url3 = null;
  }
  let flow = [
    {url: url1, is_indoor: true},
    ...(url2 ? [{url: url2, is_indoor: true}] : []),
    {is_indoor: false},
    ...(url3 ? [{url: url3, is_indoor: true}] : []),
    {url: url4, is_indoor: true}
  ]
  setDirectionsFlow(flow);
  setIndex(0);
};
