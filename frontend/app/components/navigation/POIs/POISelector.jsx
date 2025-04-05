import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableHighlight,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  BackHandler,
} from "react-native";
import Slider from "@react-native-community/slider";
import { MaterialIcons } from "@expo/vector-icons";
import { poiTypes } from "../../../services/PoiService";
import PropTypes from "prop-types"; // Added PropTypes import

const PoiSelector = ({
  showPoiSelector = false,
  togglePoiSelector = () => {},
  selectedPoiTypes = ["none"],
  setSelectedPoiTypes = () => {},
  searchRadius = 1500,
  setSearchRadius = () => {},
  theme = { backgroundColor: "#007AFF" },
  textSize = 14,
  styles = { shadow: {} },
  applyFilters = () => {},
}) => {
  const [localRadius, setLocalRadius] = useState(searchRadius);
  const [localSelectedTypes, setLocalSelectedTypes] =
    useState(selectedPoiTypes);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;

  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (showPoiSelector) {
          togglePoiSelector();
          return true;
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [showPoiSelector, togglePoiSelector]);

  // Reset local state when the selector is opened
  useEffect(() => {
    if (showPoiSelector) {
      setLocalSelectedTypes(selectedPoiTypes);
      setLocalRadius(searchRadius);
    }
  }, [showPoiSelector, selectedPoiTypes, searchRadius]);

  // Handle animations
  useEffect(() => {
    if (showPoiSelector) {
      // Show animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: Dimensions.get("window").height,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showPoiSelector, fadeAnim, slideAnim]);

  // Toggle a POI type in the local selection
  const togglePoiType = (typeValue) => {
    if (typeValue === "none") {
      // If "No Filters" is selected, clear all other selections
      setLocalSelectedTypes(["none"]);
    } else if (typeValue === "all") {
      // If "All Types" is selected, clear "none" and set just "all"
      setLocalSelectedTypes(["all"]);
    } else {
      // Create a new array without "none" or "all"
      const newTypes = localSelectedTypes.filter(
        (type) => type !== "none" && type !== "all"
      );

      if (newTypes.includes(typeValue)) {
        // If already selected, remove it
        setLocalSelectedTypes(newTypes.filter((type) => type !== typeValue));
      } else {
        // If not selected, add it
        setLocalSelectedTypes([...newTypes, typeValue]);
      }

      // If no types are selected, default back to "none"
      if (newTypes.length === 0 && !typeValue) {
        setLocalSelectedTypes(["none"]);
      }
    }
  };

  // Reset filters to default
  const handleResetFilters = () => {
    setLocalSelectedTypes(["none"]);
    setLocalRadius(1500);
  };

  // Handle applying filters
  const handleApplyFilters = () => {
    // If no specific types are selected, default to "none"
    const typesToApply =
      localSelectedTypes.length === 0 ? ["none"] : localSelectedTypes;
    setSelectedPoiTypes(typesToApply);
    setSearchRadius(localRadius);
    applyFilters(typesToApply, localRadius);
    togglePoiSelector();
  };

  return (
    <>
      {/* POI Filter Button */}
      <View
        testID="poi-selector-container"
        style={{ position: "absolute", right: 21, bottom: 190, zIndex: 10 }}
      >
        <TouchableHighlight
          testID="poi-filter-button"
          style={[
            styles?.shadow, // Added optional chaining
            {
              backgroundColor: theme?.backgroundColor, // Added optional chaining
              borderRadius: 50,
              padding: 10,
            },
          ]}
          onPress={togglePoiSelector}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialIcons name="place" size={20} color="white" />
          </View>
        </TouchableHighlight>
      </View>

      {/* Custom Animated Overlay */}
      <Animated.View
        pointerEvents={showPoiSelector ? "auto" : "none"}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          opacity: fadeAnim,
          zIndex: showPoiSelector ? 100 : -1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          activeOpacity={1}
          onPress={togglePoiSelector}
        />

        <Animated.View
          style={{
            width: "80%",
            maxHeight: 500,
            backgroundColor: "white",
            borderRadius: 16,
            padding: 16,
            elevation: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: textSize + 2,
                fontWeight: "bold",
                color: theme?.backgroundColor, // Added optional chaining
              }}
            >
              Filter Points of Interest
            </Text>
            <TouchableOpacity testID="close-button" onPress={togglePoiSelector}>
              <MaterialIcons
                name="close"
                size={24}
                color={theme?.backgroundColor} // Added optional chaining
              />
            </TouchableOpacity>
          </View>

          {/* Range Selector */}
          <View style={{ marginBottom: 16 }}>
            <Text
              testID="radius-display"
              style={{ fontSize: textSize - 2, marginBottom: 8 }}
            >
              Search Radius: {localRadius}m
            </Text>
            <Slider
              testID="slider"
              style={{ width: "100%", height: 40 }}
              minimumValue={100}
              maximumValue={2500}
              step={100}
              value={localRadius}
              onValueChange={setLocalRadius}
              minimumTrackTintColor={theme?.backgroundColor} // Added optional chaining
              maximumTrackTintColor="#d3d3d3"
              thumbTintColor={theme?.backgroundColor} // Added optional chaining
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: textSize - 4, color: "#888" }}>
                100m
              </Text>
              <Text style={{ fontSize: textSize - 4, color: "#888" }}>
                2500m
              </Text>
            </View>
          </View>

          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: "#e0e0e0",
              marginBottom: 12,
            }}
          />
          <Text
            style={{
              fontSize: textSize - 2,
              fontWeight: "bold",
              marginBottom: 8,
            }}
          >
            Filter by type:
          </Text>

          <ScrollView style={{ maxHeight: 300 }}>
            {/* No Filters option */}
            <TouchableHighlight
              key="none"
              style={{
                backgroundColor: localSelectedTypes.includes("none")
                  ? theme?.backgroundColor // Added optional chaining
                  : "#f0f0f0",
                padding: 12,
                borderRadius: 8,
                marginBottom: 8,
              }}
              onPress={() => togglePoiType("none")}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialIcons
                  name="layers-clear"
                  size={20}
                  color={
                    localSelectedTypes.includes("none") ? "white" : "black"
                  }
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    fontSize: textSize,
                    color: localSelectedTypes.includes("none")
                      ? "white"
                      : "black",
                  }}
                >
                  No Filters
                </Text>
              </View>
            </TouchableHighlight>

            {/* All Types option */}
            <TouchableHighlight
              key="all"
              style={{
                backgroundColor: localSelectedTypes.includes("all")
                  ? theme?.backgroundColor // Added optional chaining
                  : "#f0f0f0",
                padding: 12,
                borderRadius: 8,
                marginBottom: 8,
              }}
              onPress={() => togglePoiType("all")}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialIcons
                  name="layers"
                  size={20}
                  color={localSelectedTypes.includes("all") ? "white" : "black"}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    fontSize: textSize,
                    color: localSelectedTypes.includes("all")
                      ? "white"
                      : "black",
                  }}
                >
                  All Types
                </Text>
              </View>
            </TouchableHighlight>

            {/* Individual POI types */}
            {poiTypes
              .filter((type) => type.value !== "none" && type.value !== "all")
              .map((type) => (
                <TouchableHighlight
                  key={type.value}
                  style={{
                    backgroundColor: localSelectedTypes.includes(type.value)
                      ? theme?.backgroundColor // Added optional chaining
                      : "#f0f0f0",
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                  onPress={() => togglePoiType(type.value)}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MaterialIcons
                      name={type.icon}
                      size={20}
                      color={
                        localSelectedTypes.includes(type.value)
                          ? "white"
                          : "black"
                      }
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        fontSize: textSize,
                        color: localSelectedTypes.includes(type.value)
                          ? "white"
                          : "black",
                      }}
                    >
                      {type.label}
                    </Text>
                  </View>
                </TouchableHighlight>
              ))}
          </ScrollView>

          {/* Action Buttons */}
          <View
            style={{
              marginTop: 16,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            {/* Reset button */}
            <TouchableHighlight
              style={{
                backgroundColor: "#f0f0f0",
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                width: "48%",
              }}
              onPress={handleResetFilters}
            >
              <Text
                style={{
                  color: "#555",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: textSize,
                }}
              >
                Reset Filters
              </Text>
            </TouchableHighlight>

            {/* Apply button */}
            <TouchableHighlight
              style={{
                backgroundColor: theme?.backgroundColor, // Added optional chaining
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                width: "48%",
              }}
              onPress={handleApplyFilters}
            >
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: textSize,
                }}
              >
                Apply Filters
              </Text>
            </TouchableHighlight>
          </View>
        </Animated.View>
      </Animated.View>
    </>
  );
};

// Add PropTypes validation
PoiSelector.propTypes = {
  showPoiSelector: PropTypes.bool.isRequired,
  togglePoiSelector: PropTypes.func.isRequired,
  selectedPoiTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedPoiTypes: PropTypes.func.isRequired,
  searchRadius: PropTypes.number.isRequired,
  setSearchRadius: PropTypes.func.isRequired,
  theme: PropTypes.shape({
    backgroundColor: PropTypes.string.isRequired,
  }).isRequired,
  textSize: PropTypes.number,
  styles: PropTypes.shape({
    shadow: PropTypes.object,
  }),
  applyFilters: PropTypes.func.isRequired,
};

export default PoiSelector;
