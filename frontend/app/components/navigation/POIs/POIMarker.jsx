import React from "react";
import { View, Text } from "react-native";
import { Marker, Callout } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";
import { poiTypes } from "../../../services/PoiService";
import PropTypes from "prop-types"; // Added PropTypes import

const PoiMarker = ({ poi, selectedPoiType, onPress, textSize }) => {
  // Get the icon for the POI type
  const getIconName = (type) => {
    const foundType = poiTypes.find((poiType) => poiType.value === type);
    return foundType?.icon || "place";
  };

  // Get marker color based on POI type
  const getMarkerColor = (type) => {
    switch (type) {
      case "restaurant":
        return "#FF5252"; // Red
      case "cafe":
        return "#9C27B0"; // Purple
      case "library":
        return "#3F51B5"; // Indigo
      case "parking":
        return "#2196F3"; // Blue
      case "atm":
        return "#009688"; // Teal
      case "pharmacy":
        return "#4CAF50"; // Green
      case "bus_station":
        return "#FFC107"; // Amber
      case "subway_station":
        return "#FF9800"; // Orange
      case "grocery_or_supermarket":
        return "#795548"; // Brown
      case "lodging":
        return "#607D8B"; // Blue Grey
      default:
        return "#862532"; // Concordia red (default)
    }
  };

  // Always use the POI's own type if available
  const poiType = poi.poiType || selectedPoiType;
  const iconName = getIconName(poiType);
  const markerColor = getMarkerColor(poiType);

  // Get POI type label for display
  const getPoiTypeLabel = (type) => {
    const foundType = poiTypes.find((poiType) => poiType.value === type);
    return foundType?.label || "Place";
  };

  return (
    <Marker
      testID="poi-marker"
      coordinate={{
        latitude: poi.geometry.location.lat,
        longitude: poi.geometry.location.lng,
      }}
      onPress={() => onPress(poi)}
    >
      <View
        testID="marker-icon-container"
        style={{
          backgroundColor: "white",
          padding: 5,
          borderRadius: 15,
          borderWidth: 2,
          borderColor: markerColor,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.22,
          shadowRadius: 2.22,
          elevation: 3,
        }}
      >
        <MaterialIcons name={iconName} size={20} color={markerColor} />
      </View>
      <Callout testID="poi-callout" tooltip={true}>
        <View
          testID="callout-container"
          style={{
            width: 200,
            padding: 10,
            backgroundColor: "white",
            borderRadius: 10,
            borderLeftWidth: 4,
            borderLeftColor: markerColor,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Text
            testID="poi-name"
            style={{ fontWeight: "bold", fontSize: textSize }}
          >
            {poi.name}
          </Text>
          {/* Always show POI type with color indicator */}
          <View
            testID="poi-type-container"
            style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: markerColor,
                marginRight: 5,
              }}
            />
            <Text
              testID="poi-type-label"
              style={{ fontSize: textSize - 2, color: "#666" }}
            >
              {getPoiTypeLabel(poiType)}
            </Text>
          </View>

          {poi.vicinity && (
            <Text
              testID="poi-vicinity"
              style={{ fontSize: textSize - 2, marginTop: 3 }}
            >
              {poi.vicinity}
            </Text>
          )}
          {poi.rating && (
            <View
              testID="poi-rating-container"
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 5,
              }}
            >
              <Text testID="poi-rating" style={{ marginRight: 5 }}>
                {poi.rating}
              </Text>
              <MaterialIcons name="star" size={16} color="#FFD700" />
              <Text testID="poi-rating-count" style={{ marginLeft: 5 }}>
                ({poi.user_ratings_total || 0})
              </Text>
            </View>
          )}
          {poi.opening_hours && (
            <Text
              testID="poi-open-status"
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

// Define prop types
PoiMarker.propTypes = {
  // Main props
  poi: PropTypes.shape({
    // Basic POI properties
    name: PropTypes.string.isRequired,
    vicinity: PropTypes.string,
    poiType: PropTypes.string,
    place_id: PropTypes.string.isRequired,

    // Nested geometry properties
    geometry: PropTypes.shape({
      location: PropTypes.shape({
        lat: PropTypes.number.isRequired,
        lng: PropTypes.number.isRequired,
      }).isRequired,
    }).isRequired,

    // Optional rating properties
    rating: PropTypes.number,
    user_ratings_total: PropTypes.number,

    // Optional opening hours
    opening_hours: PropTypes.shape({
      open_now: PropTypes.bool,
    }),
  }).isRequired,

  // Other component props
  selectedPoiType: PropTypes.string,
  onPress: PropTypes.func.isRequired,
  textSize: PropTypes.number,
};

// Default props
PoiMarker.defaultProps = {
  selectedPoiType: "",
  textSize: 14,
};

export default PoiMarker;
