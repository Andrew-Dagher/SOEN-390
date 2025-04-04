import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { fetchNearbyPOIs, poiTypes } from "../../../services/PoiService";
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
  const [selectedPoiTypes, setSelectedPoiTypes] = useState(["none"]); // Start with "none" (no filters) as default
  const [showPoiSelector, setShowPoiSelector] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [searchRadius, setSearchRadius] = useState(1500);
  const [isLoading, setIsLoading] = useState(false);

  const togglePoiSelector = () => {
    setShowPoiSelector(!showPoiSelector);
  };

  // Function to fetch POIs based on selected types and radius
  const fetchPois = async (typesToFetch, radius) => {
    setIsLoading(true);
    const locationToUse = campus === "sgw" ? SGWLocation : LoyolaLocation;
    let allResults = [];

    try {
      // If "none" is selected, don't fetch any POIs
      if (typesToFetch.includes("none")) {
        // Set empty results for "No Filters" option
        allResults = [];
        trackEvent("No POI Filters Applied", { campus });
      }
      // If "all" is selected, fetch all POI types
      else if (typesToFetch.includes("all")) {
        // Use all POI types from the service
        const poiTypeValues = poiTypes.map((type) => type.value);

        for (const poiType of poiTypeValues) {
          const typeResults = await fetchNearbyPOIs(
            locationToUse,
            poiType,
            process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
            radius
          );

          // Add poiType and a uniqueId to each result
          const resultsWithType = typeResults.map((poi) => ({
            ...poi,
            poiType,
            // Generate a unique key by combining place_id and poiType
            uniqueId: `${poi.place_id}_${poiType}`,
          }));

          allResults.push(...resultsWithType);
        }

        trackEvent("Fetched All POI Types", { count: allResults.length });
      } else {
        // Fetch multiple selected POI types
        for (const poiType of typesToFetch) {
          const typeResults = await fetchNearbyPOIs(
            locationToUse,
            poiType,
            process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
            radius
          );

          // Add poiType and a uniqueId to each result
          const resultsWithType = typeResults.map((poi) => ({
            ...poi,
            poiType,
            // Generate a unique key by combining place_id and poiType
            uniqueId: `${poi.place_id}_${poiType}`,
          }));

          allResults.push(...resultsWithType);
        }

        trackEvent("Fetched Selected POI Types", {
          types: typesToFetch.join(","),
          count: allResults.length,
        });
      }

      setPois(allResults);
    } catch (error) {
      console.error("Error fetching POIs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters function to be passed to POISelector
  const applyFilters = (selectedTypes, radius) => {
    // Default to 'none' if no types are selected
    const typesToFetch = selectedTypes.length === 0 ? ["none"] : selectedTypes;
    fetchPois(typesToFetch, radius);
  };

  // Effect to fetch POIs when the component mounts or when campus changes
  useEffect(() => {
    // Initial fetch with default values (no filters, default radius)
    fetchPois(["none"], searchRadius);
  }, [campus]);

  const handlePoiPress = (poi) => {
    setSelectedPoi(poi);
    onSelectPoi(poi); // Pass the selected POI to the parent component
  };

  return (
    <>
      {/* Render POI markers */}
      {!isRoute &&
        pois.map((poi) => (
          <PoiMarker
            key={poi.uniqueId}
            poi={poi}
            selectedPoiType={poi.poiType} // Use the POI's own type
            onPress={handlePoiPress}
            textSize={textSize}
          />
        ))}

      {/* Always show selector (not conditional on search or route mode anymore) */}
      <PoiSelector
        showPoiSelector={showPoiSelector}
        togglePoiSelector={togglePoiSelector}
        selectedPoiTypes={selectedPoiTypes}
        setSelectedPoiTypes={setSelectedPoiTypes}
        searchRadius={searchRadius}
        setSearchRadius={setSearchRadius}
        theme={theme}
        textSize={textSize}
        styles={styles}
        applyFilters={applyFilters}
      />
    </>
  );
};

export default PoiManager;
