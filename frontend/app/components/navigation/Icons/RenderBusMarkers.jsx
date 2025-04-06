import { Marker } from "react-native-maps";
const RenderBusMarkers = (busMarkers) =>
  busMarkers.map((bus) => {
    console.log("rendering bus marker", bus);
    return (
      <Marker
        testID="bus-marker"
        key={bus.id}
        coordinate={{
          latitude: bus.latitude,
          longitude: bus.longitude,
        }}
        image={require("../../../../assets/shuttle-bus-map.png")}
      />
    );
  });

export default RenderBusMarkers;
