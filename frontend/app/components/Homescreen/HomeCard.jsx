import React from "react";
import { View, Text, Image } from "react-native";
import { useAppSettings } from "../../AppSettingsContext";

export default function HomeCard(props) {

  const {
      textSize
    } = useAppSettings();

  return (
    <View
      style={{
        borderRadius: 20,
        height: 190,
        width: 360,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <View style={{ height: 190, width: 360 }}>
        <Image
          source={props.image}
          resizeMode="stretch"
          style={{ flex: 1, width: null }}
        />
      </View>
      <View
        style={{
          position: "absolute",
          bottom: 0,
          backgroundColor: "rgba(255,255,255,0.85)",
          height: 50,
          width: 360,
          justifyContent: "center",
          paddingLeft: 20,
        }}
      >
        <Text style={[{ fontSize: textSize }]} className="font-bold text-xl">{props.text}</Text>
      </View>
    </View>
  );
}
