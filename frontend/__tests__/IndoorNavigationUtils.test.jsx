import { 
  toPickerList, 
  areRoomsOnSameFloor, 
  areRoomsOnSameBuilding, 
  getFloorIdByRoomId, 
  getEntranceByRoomId, 
  getUrlByRoomId, 
  getUrlByFloorId 
} from '../app/screens/indoor/inDoorUtil.js'; // Assuming the filename is inDoorConfig.js

describe('Indoor Navigation Functions', () => {
  
  test('toPickerList generates the correct picker list', () => {
    const pickerList = toPickerList();

    const expectedList = [
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
      { label: "CC106", value: "s_fb7e57cfad19eb3d" },
      { label: "MB1.101", value: "s_1272ecb3d499fea1" },
      { label: "MB1.210", value: "s_5348bdea866d2279" },
      { label: "MB1.132", value: "s_91a21603ca8d9e5c" },
      { label: "MB1.103", value: "s_674c1b5f966bf464" },
      { label: "MB1.110", value: "s_a888db2ac44c0dce" },
      { label: "MB1.106", value: "s_34cc77e913f1a934" },
      { label: "MB1.125", value: "s_8d14d98fa64d8d88" },
      { label: "MBS2.210", value: "s_c0d60f94f2a5c69e" },
      { label: "MBS2.225", value: "s_636eadb4ea0be9cf" },
      { label: "MBS2.235", value: "s_dd980e94bf3b836c" },
      { label: "MBS2.230", value: "s_911ae8f281dc315d" },
      { label: "MBS2.170", value: "s_dc5193bc7e83b6bd" },
      { label: "MBS2.140", value: "s_e3f4fd3a15de757a" },
      { label: "MBS2.130", value: "s_4b9db910a637656b" }
    ];

    expect(pickerList).toEqual(expectedList);
  });

  test('areRoomsOnSameFloor should return true if rooms are on the same floor', () => {
    expect(areRoomsOnSameFloor('s_7e282b843c0f8a66', 's_dc36b55ee3eb5c3a')).toBe(true); // Hall 9
    expect(areRoomsOnSameFloor('s_411f8b3269cea1be', 's_2e19aa43676ec0b1')).toBe(true); // SP 1
    expect(areRoomsOnSameFloor('s_7e282b843c0f8a66', 's_f79cb93ae628833c')).toBe(false); // Different floors
  });

  test('areRoomsOnSameBuilding should return true if rooms are in the same building', () => {
    expect(areRoomsOnSameBuilding('s_7e282b843c0f8a66', 's_f79cb93ae628833c')).toBe(true); // Hall Building
    expect(areRoomsOnSameBuilding('s_7e282b843c0f8a66', 's_411f8b3269cea1be')).toBe(false); // Different buildings
  });

  test('getFloorIdByRoomId should return correct floor ID', () => {
    expect(getFloorIdByRoomId('s_7e282b843c0f8a66')).toBe('m_ff2c8c646277c61e'); // Hall 9
    expect(getFloorIdByRoomId('s_411f8b3269cea1be')).toBe('m_00a45bb03dc793b9'); // SP 1
    expect(getFloorIdByRoomId('s_1272ecb3d499fea1')).toBe('m_de096849e2569e48'); // MB 1
  });

  test('getEntranceByRoomId should return correct entrance', () => {
    expect(getEntranceByRoomId('s_7e282b843c0f8a66')).toBe('45.497310869658996%2C-73.5787282015637%2Cm_ff2c8c646277c61e'); // Hall 9
    expect(getEntranceByRoomId('s_411f8b3269cea1be')).toBe('45.4583718018728%2C-73.64074551435993%2Cm_00a45bb03dc793b9'); // SP 1
  });

  test('getUrlByRoomId should return correct URL', () => {
    expect(getUrlByRoomId('s_7e282b843c0f8a66')).toBe('https://app.mappedin.com/map/67d7285c3b90e4000beb55d5/directions?kiosk=false&outdoors=false');
    expect(getUrlByRoomId('s_411f8b3269cea1be')).toBe('https://app.mappedin.com/map/67d88e2581104a000b6df10e/directions?embedded=true&outdoors=false&kiosk=false');
  });

  test('getUrlByFloorId should return correct URL for floor', () => {
    expect(getUrlByFloorId('m_ff2c8c646277c61e')).toBe('https://app.mappedin.com/map/67d7285c3b90e4000beb55d5/directions?kiosk=false&outdoors=false');
    expect(getUrlByFloorId('m_00a45bb03dc793b9')).toBe('https://app.mappedin.com/map/67d88e2581104a000b6df10e/directions?embedded=true&outdoors=false&kiosk=false');
  });
});
