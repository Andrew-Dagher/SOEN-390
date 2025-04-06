import { StyleSheet, TouchableHighlight, View, Text} from "react-native";
import getThemeColors from "../../ColorBindTheme";
import { useAppSettings } from "../../AppSettingsContext";

export default InDoorDirections = ({directionsFlow, index, setIndex}) => {
  const theme = getThemeColors();
  const { textSize } = useAppSettings();

  const handleNextStep = () => {
    if (index+1 >= directionsFlow.length) {
        setIndex(index-1);
    } else {
        setIndex(index+1);
    }
  }

  const handlePrevStep = () => {
    if (index <= 0) return;
    setIndex(index-1);    
  }

  return (
    <View>
      {index != -1 && index+1 < directionsFlow.length &&  directionsFlow.length > 1 &&
      <TouchableHighlight
          className="mb-4"
          style={[styles.shadow, { backgroundColor: theme.backgroundColor, padding: 12, borderRadius: 8 }]}
          onPress={handleNextStep}
      >
          {/* We are not at the lest step so show next directions */}
          <Text style={{ fontSize: textSize, color: "white", fontWeight: "bold" }}>Next Directions</Text>
      </TouchableHighlight>
      }
      {/*{index != -1 && index+1 >= directionsFlow.length && directionsFlow.length > 1 &&*/}
      {index != -1 && index != 0 &&
      <TouchableHighlight
          style={[styles.shadow, { backgroundColor: theme.backgroundColor, padding: 12, borderRadius: 8 }]}
          onPress={handlePrevStep}
      >
          {/* We are at the last step so show the previous direction */}
         <Text style={{ fontSize: textSize, color: "white", fontWeight: "bold" }}>Prev Directions</Text>
      </TouchableHighlight>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
  },
  shadow: {
    boxShadow:
      "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
    textAlign: "center",
  },
});