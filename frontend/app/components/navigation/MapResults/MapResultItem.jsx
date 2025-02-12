import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import WheelChairIcon from "../Icons/WheelChairIcon";
import BikeIcon from "../Icons/BikeIcon";
import InformationIcon from "../Icons/InformationIcon";
import NavigationIcon from "../Icons/NavigationIcon";
import DirectionsIcon from "../Icons/DirectionsIcon";
import SmallNavigationIcon from "../Icons/SmallNavigationIcon";
import ParkingIcon from "../Icons/ParkingIcon";

const MapResultItem = ({
  isRoute,
  location,
  setIsSearch,
  setIsRoute,
  setCloseTraceroute,
  setStartPosition,
  setDestinationPosition,
  building,
  start,
  setStart,
  end,
  setEnd,
}) => {
  const navigation = useNavigation();

  const handleSetStart = () => {
    if (start != null && start != location?.coords) {
      setIsRoute(true);
      setIsSearch(true);
      setDestinationPosition(building.name);
      setEnd(building.point);
      return;
    }
    setStart(building.point);
    setStartPosition(building.name);
  };

  const handleGetDirections = () => {
    setCloseTraceroute(false);
    setEnd(building.point);
    setDestinationPosition(building.name);
    setStartPosition("Your Location");
  };

  const handlePress = () => {
    navigation.navigate("Building Details", building);
  };

  // Create an array of icons that should be displayed
  const icons = [
    building.isHandicap === "true" && <WheelChairIcon />,
    building.isBike === "true" && <BikeIcon />,
    building.isParking === "true" && <ParkingIcon />,
    building.isInfo === "true" && <InformationIcon />,
  ].filter(Boolean); // Remove false values

  return (
    <View
      style={styles.shadow}
      className="w-full mb-4 bg-secondary-bg p-4 rounded-lg flex flex-col justify-center items-center"
    >
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => pressed && { opacity: 0.7 }}
        className="w-full mb-4"
      >
        <View className="flex flex-row items-center mb-4">
          <Text className="font-bold">{building.name}</Text>
          <View className="flex flex-row items-center gap-2 ml-4">{icons}</View>
        </View>

        <View className="mb-4 flex flex-row items-center">
          <SmallNavigationIcon />
          <Text className="color-slate-400 text-xs ml-2">
            {building.address}
          </Text>
        </View>
      </Pressable>

      <View className="flex flex-row justify-around items-center">
        <TouchableHighlight
          onPress={handleSetStart}
          style={styles.shadow}
          className="mr-4 rounded-xl p-4 bg-primary-red"
        >
          <View className="flex flex-row justify-around items-center">
            <Text className="color-white mr-4 font-bold">
              {start != null && start != location?.coords
                ? "Set Destination"
                : "Set Start"}
            </Text>
            <NavigationIcon />
          </View>
        </TouchableHighlight>

        <TouchableHighlight
          onPress={handleGetDirections}
          style={styles.shadow}
          className="rounded-xl p-4 bg-primary-red"
        >
          <View className="flex flex-row justify-around items-center">
            <Text className="color-white mr-4 font-bold">Get Directions</Text>
            <DirectionsIcon />
          </View>
        </TouchableHighlight>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    textAlign: "center",
  },
});

export default MapResultItem;
