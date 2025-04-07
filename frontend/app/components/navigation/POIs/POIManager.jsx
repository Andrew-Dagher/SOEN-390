import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { fetchNearbyPOIs, poiTypes } from "../../../services/PoiService";
import PoiMarker from "./POIMarker";
import PoiSelector from "./POISelector";
import { trackEvent } from "@aptabase/react-native";

/**
 * @typedef {Object} Location
 * @property {number} latitude - The latitude coordinate
 * @property {number} longitude - The longitude coordinate
 */

/**
 * @typedef {Object} POI
 * @property {string} place_id - Unique identifier for the POI
 * @property {string} name - Name of the POI
 * @property {string} vicinity - Address or vicinity information
 * @property {Object} geometry - Location geometry information
 * @property {Object} geometry.location - Coordinates
 * @property {number} geometry.location.lat - Latitude
 * @property {number} geometry.location.lng - Longitude
 * @property {number} [rating] - Rating value if available
 * @property {number} [user_ratings_total] - Number of ratings if available
 * @property {Object} [opening_hours] - Opening hours information if available
 * @property {boolean} [opening_hours.open_now] - Whether the place is currently open
 * @property {string} poiType - The type of POI (e.g., restaurant, cafe)
 * @property {string} uniqueId - A unique identifier combining place_id and poiType
 */

/**
 * PoiManager component handles the management of Points of Interest (POIs)
 * around specified campus locations. It allows filtering POIs by type and radius,
 * and renders POI markers on a map.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.campus=""] - The campus to show POIs for ("sgw" or "loyola")
 * @param {Location} [props.SGWLocation] - Location coordinates for the SGW campus
 * @param {Location} [props.LoyolaLocation] - Location coordinates for the Loyola campus
 * @param {boolean} [props.isRoute=false] - Whether the component is used in a route view
 * @param {boolean} [props.isSearch=false] - Whether the component is used in a search view
 * @param {number} [props.textSize=14] - Base text size for UI elements
 * @param {string} [props.theme="light"] - UI theme ("light" or "dark")
 * @param {Object} [props.styles={}] - Custom styles object
 * @param {Function} [props.onSelectPoi=()=>{}] - Callback when a POI is selected
 * @returns {React.ReactElement} The rendered component
 */
const PoiManager = ({
  campus = "",
  SGWLocation = null,
  LoyolaLocation = null,
  isRoute = false,
  textSize = 14,
  theme = "light",
  styles = {},
  onSelectPoi = () => {},
}) => {
  /**
   * State to store all fetched POIs
   * @type {[Array<POI>, Function]} Array of POI objects and setter function
   */
  const [pois, setPois] = useState([]);

  /**
   * State to track selected POI types for filtering
   * Starts with "none" (no filters) as default
   * @type {[Array<string>, Function]} Array of POI type values and setter function
   */
  const [selectedPoiTypes, setSelectedPoiTypes] = useState(["none"]);

  /**
   * State to control the visibility of the POI selector panel
   * @type {[boolean, Function]} Boolean flag and setter function
   */
  const [showPoiSelector, setShowPoiSelector] = useState(false);

  /**
   * State to track the current search radius in meters
   * @type {[number, Function]} Radius value and setter function
   */
  const [searchRadius, setSearchRadius] = useState(1500);

  /**
   * State to track loading status during API requests
   * @type {[boolean, Function]} Loading flag and setter function
   */
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Toggles the visibility of the POI selector panel
   */
  const togglePoiSelector = () => {
    setShowPoiSelector(!showPoiSelector);
  };

  /**
   * Fetches POIs based on selected types and radius from the Google Places API
   *
   * @async
   * @param {string[]} typesToFetch - Array of POI types to fetch
   * @param {number} radius - Search radius in meters
   */
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

  /**
   * Apply filters function to be passed to POISelector
   *
   * @param {string[]} selectedTypes - Array of selected POI types
   * @param {number} radius - Search radius in meters
   */
  const applyFilters = (selectedTypes, radius) => {
    // Default to 'none' if no types are selected
    const typesToFetch = selectedTypes.length === 0 ? ["none"] : selectedTypes;
    fetchPois(typesToFetch, radius);
  };

  // Effect to fetch POIs when the component mounts or when campus changes
  useEffect(() => {
    // Initial fetch with default values (no filters, default radius)
    fetchPois(["none"], searchRadius);
  }, [campus, searchRadius]);

  /**
   * Handles when a POI marker is pressed
   *
   * @param {POI} poi - The selected POI object
   */
  const handlePoiPress = (poi) => {
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

PoiManager.propTypes = {
  campus: PropTypes.string,
  SGWLocation: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number,
  }),
  LoyolaLocation: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number,
  }),
  isRoute: PropTypes.bool,
  isSearch: PropTypes.bool,
  textSize: PropTypes.number,
  theme: PropTypes.string,
  styles: PropTypes.object,
  onSelectPoi: PropTypes.func,
};

export default PoiManager;
