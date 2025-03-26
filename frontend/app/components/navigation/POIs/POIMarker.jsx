import React from "react";
import { View, Text } from "react-native";
import { Marker, Callout } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";
import { poiTypes } from "../../../services/PoiService";

const PoiMarker = ({ poi, selectedPoiType, onPress, textSize }) => {
  // Get the icon for the POI type
  const getIconName = (type) => {
    const foundType = poiTypes.find((poiType) => poiType.value === type);
    return foundType?.icon || "place";
  };

  // For "all" display, use the POI's own type if available
  const iconName = getIconName(poi.poiType || selectedPoiType);

  // Get POI type label for display
  const getPoiTypeLabel = (type) => {
    const foundType = poiTypes.find((poiType) => poiType.value === type);
    return foundType?.label || "Place";
  };

  return (
    <Marker
      key={poi.place_id}
      coordinate={{
        latitude: poi.geometry.location.lat,
        longitude: poi.geometry.location.lng,
      }}
      onPress={() => onPress(poi)}
    >
      <View
        style={{
          backgroundColor: "white",
          padding: 5,
          borderRadius: 15,
          borderWidth: 1,
          borderColor: "#ccc",
        }}
      >
        <MaterialIcons name={iconName} size={20} color="#862532" />
      </View>
      <Callout tooltip={true}>
        <View
          style={{
            width: 200,
            padding: 10,
            backgroundColor: "white",
            borderRadius: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: textSize }}>
            {poi.name}
          </Text>
          {/* Show POI type when in "all" mode */}
          {selectedPoiType === "all" && poi.poiType && (
            <Text
              style={{ fontSize: textSize - 2, color: "#666", marginTop: 2 }}
            >
              {getPoiTypeLabel(poi.poiType)}
            </Text>
          )}
          {poi.vicinity && (
            <Text style={{ fontSize: textSize - 2, marginTop: 3 }}>
              {poi.vicinity}
            </Text>
          )}
          {poi.rating && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 5,
              }}
            >
              <Text style={{ marginRight: 5 }}>{poi.rating}</Text>
              <MaterialIcons name="star" size={16} color="#FFD700" />
              <Text style={{ marginLeft: 5 }}>
                ({poi.user_ratings_total || 0})
              </Text>
            </View>
          )}
          {poi.opening_hours && (
            <Text
              style={{
                marginTop: 5,
                color: poi.opening_hours.open_now ? "green" : "red",
              }}
            >
              {poi.opening_hours.open_now ? "Open Now" : "Closed"}
            </Text>
          )}
        </View>
      </Callout>
    </Marker>
  );
};

export default PoiMarker;
