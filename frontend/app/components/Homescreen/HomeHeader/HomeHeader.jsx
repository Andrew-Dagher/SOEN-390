import React from "react";
import { View, Text, Button, Pressable } from "react-native";
import Concordia50 from "./Icons/Concordia50/Concordia50";
import getThemeColors from "../../../ColorBindTheme";
export default function HomeHeader(props) {
  const theme = getThemeColors();
  return (
    <View
      style={{
        height: 194,
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: theme.backgroundColor,
        borderBottomLeftRadius: 60,
        borderBottomRightRadius: 60,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 200,
        elevation: 10,
        gap: 120,
      }}
    >
      <View testID="home-header" className="flex pl-6 pt-5">
        <Text className="text-white font-bold text-3xl">Welcome Back</Text>
        <Text className="text-white font-bold text-2xl">{props.name}</Text>
      </View>
      <View className="pt-10">
        <Concordia50 />
      </View>
    </View>
  );
}
