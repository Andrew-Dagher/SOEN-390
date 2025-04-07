import * as indoor from './inDoorConfig';

const mockBuildings = [
  {
    start_floor: "Ground",
    floors: [
      {
        floor_id: 1,
        name: "Ground",
        rooms: {
          "room1": "A101",
          "room2": "A102",
        },
        entrance: "Main Entrance",
        disabled_entrance: "Wheelchair Entrance",
        outdoor_entrance: "Outdoor Entrance",
        url: "https://building1.floor1.url",
      },
      {
        floor_id: 2,
        name: "First",
        rooms: {
          "room1": "B201",
          "room2": "B202",
        },
        entrance: "First Floor Entrance",
        disabled_entrance: "Wheelchair First Entrance",
        outdoor_entrance: "Outdoor First Entrance",
        url: "https://building1.floor2.url",
      }
    ]
  },
  {
    start_floor: "Main",
    floors: [
      {
        floor_id: 3,
        name: "Main",
        rooms: {
          "room1": "C301",
          "room2": "C302",
        },
        entrance: "Main Building Entrance",
        disabled_entrance: "Wheelchair Main Entrance",
        outdoor_entrance: "Outdoor Main Entrance",
        url: "https://building2.floor1.url",
      }
    ]
  }
];

jest.mock('./inDoorConfig', () => ({
  ...jest.requireActual('./inDoorConfig'),
  buildings: mockBuildings
}));

describe('indoor config functions', () => {
  it('should generate a correct picker list', () => {
    const pickerList = indoor.toPickerList();
    expect(pickerList).toEqual([
      { label: 'room1', value: 'A101' },
      { label: 'room2', value: 'A102' },
      { label: 'room1', value: 'B201' },
      { label: 'room2', value: 'B202' },
      { label: 'room1', value: 'C301' },
      { label: 'room2', value: 'C302' },
    ]);
  });

  it('should return true for rooms on the same floor', () => {
    expect(indoor.areRoomsOnSameFloor('A101', 'A102')).toBe(true);
    expect(indoor.areRoomsOnSameFloor('A101', 'B201')).toBe(false);
  });

  it('should return true for rooms in the same building', () => {
    expect(indoor.areRoomsOnSameBuilding('A101', 'A102')).toBe(true);
    expect(indoor.areRoomsOnSameBuilding('A101', 'B201')).toBe(false);
  });

  it('should return true if floor is the entrance floor', () => {
    expect(indoor.isEntranceFloor(1)).toBe(true);
    expect(indoor.isEntranceFloor(2)).toBe(false);
  });

  it('should return the entrance floor object correctly', () => {
    expect(indoor.getEntranceFloor(1)).toEqual(mockBuildings[0].floors[0]);
    expect(indoor.getEntranceFloor(3)).toBeNull();
  });

  it('should return floor ID by room ID', () => {
    expect(indoor.getFloorIdByRoomId('A101')).toBe(1);
    expect(indoor.getFloorIdByRoomId('B201')).toBe(2);
    expect(indoor.getFloorIdByRoomId('C301')).toBe(3);
    expect(indoor.getFloorIdByRoomId('nonexistent')).toBeNull();
  });

  it('should return the correct URL by room ID', () => {
    expect(indoor.getUrlByRoomId('A101')).toBe("https://building1.floor1.url");
    expect(indoor.getUrlByRoomId('C301')).toBe("https://building2.floor1.url");
    expect(indoor.getUrlByRoomId('nonexistent')).toBeNull();
  });

  it('should return correct entrance based on room ID', () => {
    expect(indoor.getEntranceByRoomId('A101')).toBe("Main Entrance");
    expect(indoor.getEntranceByRoomId('A101', true)).toBe("Wheelchair Entrance");
    expect(indoor.getEntranceByRoomId('C301', true, true)).toBe("Outdoor Main Entrance");
    expect(indoor.getEntranceByRoomId('nonexistent')).toBeNull();
  });

  it('should return URL by floor ID', () => {
    expect(indoor.getUrlByFloorId(1)).toBe("https://building1.floor1.url");
    expect(indoor.getUrlByFloorId(2)).toBe("https://building1.floor2.url");
    expect(indoor.getUrlByFloorId(3)).toBe("https://building2.floor1.url");
    expect(indoor.getUrlByFloorId(999)).toBeNull();
  });

  it('should handle campus navigation logic correctly for same floor rooms', () => {
    const setDirectionsFlow = jest.fn();
    const setIndex = jest.fn();

    indoor.handleToCampus('A101', 'A102', false, setDirectionsFlow, setIndex);

    expect(setDirectionsFlow).toHaveBeenCalledWith([
      { url: 'https://building1.floor1.url&floor=1&location=A102&departure=A101', is_indoor: true }
    ]);
    expect(setIndex).toHaveBeenCalledWith(0);
  });

  it('should handle campus navigation logic correctly for different floors in the same building', () => {
    const setDirectionsFlow = jest.fn();
    const setIndex = jest.fn();

    indoor.handleToCampus('A101', 'B201', false, setDirectionsFlow, setIndex);

    expect(setDirectionsFlow).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ url: expect.stringContaining("departure=A101&location=Main Entrance") }),
      expect.objectContaining({ url: expect.stringContaining("departure=B201&location=First Floor Entrance") }),
    ]));
    expect(setIndex).toHaveBeenCalledWith(0);
  });

  it('should handle campus navigation logic correctly for different buildings', () => {
    const setDirectionsFlow = jest.fn();
    const setIndex = jest.fn();

    indoor.handleToCampus('A101', 'C301', false, setDirectionsFlow, setIndex);

    expect(setDirectionsFlow).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ url: expect.stringContaining("departure=A101&location=Main Entrance") }),
      expect.objectContaining({ url: expect.stringContaining("location=C301&departure=Wheelchair Main Entrance") }),
    ]));
    expect(setIndex).toHaveBeenCalledWith(0);
  });
});
