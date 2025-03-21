/**
 * @file MapResults.jsx
 * @description Displays a searchable and interactive list of campus buildings with filter options.
 * Features fixed height sections, keyboard-aware behavior, and maintains search bar visibility.
 * Includes sliding panel animations and filter functionality.
 */
import PropTypes from "prop-types"; // Import PropTypes
import { useEffect, useState, useRef } from "react";
import {
  View,
  Animated,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import SearchIcon from "./Icons/SearchIcon";
import MapResultItem from "./MapResults/MapResultItem";
import { polygons } from "../../screens/navigation/navigationConfig";

/**
 * MapResults component allows users to search, filter, and select campus buildings.
 * Enhanced with keyboard handling, fixed heights, and dynamic content sizing.
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.location - Current user location
 * @param {Function} props.setIsRoute - Sets whether a route is active
 * @param {Boolean} props.isRoute - Indicates if a route is currently active
 * @param {Function} props.setCloseTraceroute - Controls visibility of traceroute
 * @param {Function} props.setStartPosition - Sets the name of the starting location
 * @param {Function} props.setDestinationPosition - Sets the name of the destination
 * @param {Object} props.start - Coordinates of the starting point
 * @param {Function} props.setStart - Sets the starting point coordinates
 * @param {Object} props.end - Coordinates of the destination
 * @param {Function} props.setEnd - Sets the destination coordinates
 * @param {Array} props.searchResult - List of buildings matching the search query
 * @param {Function} props.setSearchResult - Sets the search results
 * @param {String} props.searchText - Text input for searching buildings
 * @param {Function} props.setSearchText - Sets the search query text
 * @param {Boolean} props.isSearch - Indicates whether the search view is active
 * @param {Function} props.setIsSearch - Controls the search view visibility
 */
const MapResults = ({
  fetchTravelTime,
  setCarTravelTime,
  setBikeTravelTime,
  setMetroTravelTime,
  setWalkTravelTime,
  location,
  setIsRoute,
  isRoute,
  setCloseTraceroute,
  setStartPosition,
  setDestinationPosition,
  start,
  setStart,
  end,
  setEnd,
  searchResult,
  setSearchResult,
  searchText,
  setSearchText,
  isSearch,
  setIsSearch,
}) => {
  // Component state
  const [selected, setSelected] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Screen dimensions and animation values
  const screenHeight = Dimensions.get("window").height;
  const threshold = screenHeight * 0.1;
  const pan = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight * 0.75)).current;

  // Fixed height constants for component sections
  const HEADER_HEIGHT = 60; // Height of the "Buildings" title section
  const SEARCH_HEIGHT = 80; // Height of the search box container
  const FILTERS_HEIGHT = 60; // Height of the filter buttons section
  const BOTTOM_PADDING = Platform.OS === "ios" ? 34 : 20; // Platform-specific bottom padding

  /**
   * Sets up keyboard event listeners to handle keyboard appearance and dismissal.
   * Uses platform-specific events for better reliability and user experience.
   */
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    // Cleanup listeners on component unmount
    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  /**
   * Handles search submission and filters buildings based on input text.
   * Performs case-insensitive search through building names.
   */
  const handleSubmit = () => {
    const filterData = polygons.filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setSearchResult(filterData);
  };

  /**
   * Renders individual building items from search results.
   * Maps through results array and creates MapResultItem components.
   */
  const renderResults = searchResult.map((building, idx) => (
    <MapResultItem
      fetchTravelTime={fetchTravelTime}
      setCarTravelTime={setCarTravelTime}
      setBikeTravelTime={setBikeTravelTime}
      setMetroTravelTime={setMetroTravelTime}
      setWalkTravelTime={setWalkTravelTime}
      key={building.name}
      setIsSearch={setIsSearch}
      location={location}
      isRoute={isRoute}
      setIsRoute={setIsRoute}
      setCloseTraceroute={setCloseTraceroute}
      setStartPosition={setStartPosition}
      setDestinationPosition={setDestinationPosition}
      building={building}
      start={start}
      setStart={setStart}
      end={end}
      setEnd={setEnd}
    />
  ));

  /**
   * Calculates the available height for the results container based on
   * keyboard presence and fixed section heights.
   * @returns {number} The calculated height for the results container
   */
  const getResultsHeight = () => {
    const baseHeight = screenHeight * 0.75; // Default height of the panel
    const nonScrollingContent =
      HEADER_HEIGHT + SEARCH_HEIGHT + FILTERS_HEIGHT + BOTTOM_PADDING;

    // Adjust height based on keyboard presence
    const availableHeight =
      keyboardHeight > 0
        ? screenHeight - keyboardHeight - nonScrollingContent
        : baseHeight - nonScrollingContent;

    return availableHeight;
  };

  /**
   * Configures pan responder for handling slide gestures.
   * Allows users to dismiss the search panel by sliding down.
   */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          pan.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > threshold) {
          // Slide down to dismiss
          Animated.timing(slideAnim, {
            toValue: screenHeight,
            duration: 300,
            useNativeDriver: false,
          }).start(() => setIsSearch(false));
        } else {
          // Spring back to original position
          Animated.spring(slideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  /**
   * Handles initial animation when search view becomes active.
   * Slides the panel up into view.
   */
  useEffect(() => {
    if (!isSearch) return;
    Animated.timing(slideAnim, {
      toValue: -30,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [isSearch]);

  if (!isSearch) return null;

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0} // Simplified as the condition always returned 0
        style={styles.keyboardView}
      >
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.slideView,
            {
              transform: [{ translateY: Animated.add(slideAnim, pan) }],
              height: screenHeight * 0.75,
            },
          ]}
        >
          <View style={styles.slideHandleContainer}>
            <View style={styles.slideHandle} />
          </View>
          {/* Fixed-height header section */}
          <View style={[styles.header, { height: HEADER_HEIGHT }]}>
            <Text style={styles.title}>Buildings</Text>
          </View>

          {/* Fixed-height search box section */}
          <View style={[styles.searchContainer, { height: SEARCH_HEIGHT }]}>
            <View style={[styles.searchBox, styles.shadow]}>
              <TextInput
                onSubmitEditing={handleSubmit}
                value={searchText}
                onChangeText={(text) => setSearchText(text)}
                placeholder="Search the campus"
                style={styles.input}
              />
              <SearchIcon />
            </View>
          </View>

          {/* Fixed-height, horizontally scrollable filters section */}
          <View style={[styles.filterContainer, { height: FILTERS_HEIGHT }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContent}
            >
              <TouchableOpacity
                onPress={() => setSelected("loyola")}
                style={styles.filterButton}
              >
                <Text
                  style={[
                    styles.filterText,
                    selected === "loyola" && styles.selectedFilter,
                  ]}
                >
                  Loyola
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelected("sgw")}
                style={styles.filterButton}
              >
                <Text
                  style={[
                    styles.filterText,
                    selected === "sgw" && styles.selectedFilter,
                  ]}
                >
                  SGW
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelected("my_rooms")}
                style={styles.filterButton}
              >
                <Text
                  style={[
                    styles.filterText,
                    selected === "my_rooms" && styles.selectedFilter,
                  ]}
                >
                  My Rooms
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelected("library")}
                style={styles.filterButton}
              >
                <Text
                  style={[
                    styles.filterText,
                    selected === "library" && styles.selectedFilter,
                  ]}
                >
                  Library
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelected("dining")}
                style={styles.filterButton}
              >
                <Text
                  style={[
                    styles.filterText,
                    selected === "dining" && styles.selectedFilter,
                  ]}
                >
                  Dining
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Dynamically sized results section */}
          <View
            style={[styles.resultsContainer, { height: getResultsHeight() }]}
          >
            <ScrollView
              contentContainerStyle={styles.resultScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {searchResult.length !== 0 ? (
                renderResults
              ) : (
                <Text style={styles.noResults}>No results found.</Text>
              )}
            </ScrollView>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

/**
 * Component styles organized by section for better maintainability
 */
const styles = StyleSheet.create({
  // Main container styles
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  keyboardView: {
    flex: 1,
  },
  slideView: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#F0F0F0",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },

  // Header section styles
  header: {
    marginTop: 20,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },

  slideHandleContainer: {
    width: "100%",
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  slideHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#CBD5E1",
    borderRadius: 2,
  },

  // Search section styles
  searchContainer: {
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  searchBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    height: 50,
  },
  input: {
    flex: 1,
    color: "#64748b",
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  // Filter section styles
  filterContainer: {
    paddingHorizontal: 20,
  },
  filterScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  filterButton: {
    marginHorizontal: 8,
    justifyContent: "center",
    height: "100%",
  },
  filterText: {
    color: "#64748b",
  },
  selectedFilter: {
    textDecorationLine: "underline",
  },

  // Results section styles
  resultsContainer: {
    backgroundColor: "#F0F0F0",
    alignItems: "center",
  },
  resultScrollContent: {
    alignItems: "center",
  },
  noResults: {
    textAlign: "center",
    marginTop: 20,
    color: "#64748b",
  },
});

MapResults.propTypes = {
  fetchTravelTime: PropTypes.func.isRequired,
  setCarTravelTime: PropTypes.func.isRequired,
  setBikeTravelTime: PropTypes.func.isRequired,
  setMetroTravelTime: PropTypes.func.isRequired,
  setWalkTravelTime: PropTypes.func.isRequired,
  location: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number,
  }),
  setIsRoute: PropTypes.func.isRequired,
  isRoute: PropTypes.bool.isRequired,
  setCloseTraceroute: PropTypes.func.isRequired,
  setStartPosition: PropTypes.func.isRequired,
  setDestinationPosition: PropTypes.func.isRequired,
  start: PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
  }),
  setStart: PropTypes.func.isRequired,
  end: PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
  }),
  setEnd: PropTypes.func.isRequired,
  searchResult: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      point: PropTypes.shape({
        latitude: PropTypes.number.isRequired,
        longitude: PropTypes.number.isRequired,
      }).isRequired,
    })
  ).isRequired,
  setSearchResult: PropTypes.func.isRequired,
  searchText: PropTypes.string.isRequired,
  setSearchText: PropTypes.func.isRequired,
  isSearch: PropTypes.bool.isRequired,
  setIsSearch: PropTypes.func.isRequired,
};

export default MapResults;
