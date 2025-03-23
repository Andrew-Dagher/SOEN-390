/**
 * @file MapSearch.jsx
 * @description A search bar component for searching campus buildings on the map.
 */

import { View, TextInput, StyleSheet } from "react-native";
import SearchIcon from "./Icons/SearchIcon";
import { polygons } from "../../screens/navigation/navigationConfig";
import PropTypes from "prop-types";

/**
 * MapSearch component allows users to search for buildings on the campus map.
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.searchResult - List of filtered buildings
 * @param {Function} props.setSearchResult - Function to update search results
 * @param {Boolean} props.isSearch - Indicates if the search panel is active
 * @param {Function} props.setIsSearch - Function to toggle the search panel
 * @param {String} props.searchText - Current search text input
 * @param {Function} props.setSearchText - Function that update search text input
 */
const MapSearch = ({
  setSearchResult,
  setIsSearch,
  searchText,
  setSearchText,
}) => {
  /**
   * Handles search submission by filtering buildings based on search input.
   */
  const handleSubmit = () => {
    setIsSearch(true);
    console.log("Searching...");
    const filterData = polygons.filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setSearchResult(filterData);
  };

  return (
    <View className="p-4 absolute w-full justify-center items-center mt-20">
      <View
        style={styles.shadow}
        className="flex flex-row justify-between w-80 p-4 bg-white rounded-3xl"
      >
        <TextInput
          onSubmitEditing={handleSubmit}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search the campus"
          className="color-slate-400 w-5/6"
        />
        <SearchIcon />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    textAlign: "center",
  },
});

// Prop types validation
MapSearch.propTypes = {
  setSearchResult: PropTypes.func.isRequired,
  setIsSearch: PropTypes.func.isRequired,
  searchText: PropTypes.string.isRequired,
  setSearchText: PropTypes.func.isRequired,
};


export default MapSearch;
