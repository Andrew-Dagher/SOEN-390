export const building = {
    name: "Hall Building",
    floors: [
        {
            "name":"Hall 9",
            "floor_id":"m_ff2c8c646277c61e",
            "rooms": {
                "H917": "s_7e282b843c0f8a66",
                "H963": "s_dc36b55ee3eb5c3a"
            }
        },
        {
            "name":"Hall 8",
            "floor_id":"m_44207d0e6e32eac8",
            "rooms": {
                "H809": "s_f79cb93ae628833c",
                "H815": "s_adee63f7d4d4f772",
                "H849": "s_46120eef38d0b708"
            }
        }
    ]
}

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

export const getFloorIdByRoomId = (roomValue) => {
    for (let floor of building.floors) {
      if (Object.values(floor.rooms).includes(roomValue)) {
        return floor.floor_id;
      }
    }
    return null;
};

export const pickerList = toPickerList(building);