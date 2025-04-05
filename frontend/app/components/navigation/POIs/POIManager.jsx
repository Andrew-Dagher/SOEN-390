import React, { useState, useEffect } from "react";
import PropTypes from "prop-types"; // Added PropTypes import
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
  // Removed unused selectedPoi state variable
  const [searchRadius, setSearchRadius] = useState(1500);
  const [isLoading, setIsLoading] = useState(false); // Keeping for future use, might be needed

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
  }, [campus, searchRadius]); // Added searchRadius to dependencies

  const handlePoiPress = (poi) => {
    // Directly pass the selected POI to the parent component without setting state
    onSelectPoi(poi);
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

// Add PropTypes validation for all props
PoiManager.propTypes = {
  campus: PropTypes.string.isRequired,
  SGWLocation: PropTypes.object.isRequired,
  LoyolaLocation: PropTypes.object.isRequired,
  isRoute: PropTypes.bool,
  isSearch: PropTypes.bool,
  textSize: PropTypes.number,
  theme: PropTypes.object.isRequired,
  styles: PropTypes.object.isRequired,
  onSelectPoi: PropTypes.func.isRequired,
};

// Add default props
PoiManager.defaultProps = {
  isRoute: false,
  isSearch: false,
  textSize: 14,
};

export default PoiManager;
