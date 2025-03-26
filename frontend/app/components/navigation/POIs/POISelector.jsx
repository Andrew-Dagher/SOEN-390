import React from "react";
import { View, Text, TouchableHighlight, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { poiTypes } from "../../../services/PoiService";

const PoiSelector = ({
  showPoiSelector,
  togglePoiSelector,
  selectedPoiType,
  setSelectedPoiType,
  theme,
  textSize,
  styles,
}) => {
  return (
    <>
      <View style={{ position: "absolute", right: 20, top: 100 }}>
        <TouchableHighlight
          style={[
            styles.shadow,
            {
              backgroundColor: theme.backgroundColor,
              borderRadius: 12,
              padding: 12,
              zIndex: 1,
            },
          ]}
          onPress={togglePoiSelector}
        >
          <MaterialIcons name="place" size={24} color="white" />
        </TouchableHighlight>
      </View>

      {showPoiSelector ? (
        <ScrollView
          style={{
            maxHeight: 250,
            backgroundColor: "white",
            padding: 10,
            borderRadius: 12,
            position: "absolute",
            right: 20,
            top: 150,
            zIndex: 1,
          }}
        >
          {poiTypes.map((type) => (
            <TouchableHighlight
              key={type.value}
              style={{
                backgroundColor:
                  selectedPoiType === type.value
                    ? theme.backgroundColor
                    : "#f0f0f0",
                padding: 8,
                borderRadius: 8,
                marginBottom: 6,
              }}
              onPress={() => setSelectedPoiType(type.value)}
            >
              <Text
                style={{
                  fontSize: textSize - 2,
                  color: selectedPoiType === type.value ? "white" : "black",
                  textAlign: "center",
                }}
              >
                {type.label}
              </Text>
            </TouchableHighlight>
          ))}
        </ScrollView>
      ) : null}
    </>
  );
};

export default PoiSelector;
