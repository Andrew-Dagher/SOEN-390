import React, { useState, useEffect } from "react";
import { View, Text, TouchableHighlight } from "react-native";
import { fetchNearbyPOIs } from "../../../services/PoiService";
import PoiMarker from "./POIMarker";
import PoiSelector from "./POISelector";
import { trackEvent } from "@aptabase/react-native";

const PoiManager = ({
  campus,
  SGWLocation,
  LoyolaLocation,
  isRoute,
  isSearch,
  textSize,
  theme,
  styles,
  onSelectPoi,
}) => {
  const [pois, setPois] = useState([]);
  const [selectedPoiType, setSelectedPoiType] = useState("restaurant");
  const [showPoiSelector, setShowPoiSelector] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState(null);

  const togglePoiSelector = () => {
    setShowPoiSelector(!showPoiSelector);
  };

  useEffect(() => {
    const locationToUse = campus === "sgw" ? SGWLocation : LoyolaLocation;
    async function loadPois() {
      const results = await fetchNearbyPOIs(
        locationToUse,
        selectedPoiType,
        process.env.EXPO_PUBLIC_GOOGLE_API_KEY
      );
      setPois(results);
      trackEvent("Fetched POIs", { type: selectedPoiType });
    }

    if (showPoiSelector) {
      loadPois();
    }
  }, [selectedPoiType, campus, showPoiSelector]);

  const handlePoiPress = (poi) => {
    setSelectedPoi(poi);
    onSelectPoi(poi); // Pass the selected POI to the parent component
  };

  const closePoiDetails = () => {
    setSelectedPoi(null);
  };

  return (
    <>
      {/* Render POI markers */}
      {showPoiSelector &&
        !isRoute &&
        pois.map((poi) => (
          <PoiMarker
            key={poi.place_id}
            poi={poi}
            selectedPoiType={selectedPoiType}
            onPress={handlePoiPress}
            textSize={textSize}
          />
        ))}

      {/* Only show selector if not in search or route mode */}
      {!isRoute && !isSearch && (
        <PoiSelector
          showPoiSelector={showPoiSelector}
          togglePoiSelector={togglePoiSelector}
          selectedPoiType={selectedPoiType}
          setSelectedPoiType={setSelectedPoiType}
          theme={theme}
          textSize={textSize}
          styles={styles}
        />
      )}

      {/* This component doesn't render its own buttons anymore - it just exports the selectedPoi */}
    </>
  );
};

export default PoiManager;
