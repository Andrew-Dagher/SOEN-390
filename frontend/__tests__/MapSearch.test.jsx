import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import MapSearch from "../app/components/navigation/MapSearch";
import { polygons } from "../app/screens/navigation/navigationConfig";

jest.mock("../app/screens/navigation/navigationConfig", () => ({
  polygons: [
    { id: 1, name: "Library" },
    { id: 2, name: "Gym" },
    { id: 3, name: "Cafeteria" },
  ],
}));

describe("MapSearch Component", () => {
  let setSearchResult, setIsSearch, setSearchText;

  beforeEach(() => {
    setSearchResult = jest.fn();
    setIsSearch = jest.fn();
    setSearchText = jest.fn();
  });

  it("renders correctly", () => {
    const { getByPlaceholderText } = render(
      <MapSearch
        searchResult={[]}
        setSearchResult={setSearchResult}
        isSearch={false}
        setIsSearch={setIsSearch}
        searchText=""
        setSearchText={setSearchText}
      />
    );
    expect(getByPlaceholderText("Search the campus")).toBeTruthy();
  });

  it("updates search text on input change", () => {
    const { getByPlaceholderText } = render(
      <MapSearch
        searchResult={[]}
        setSearchResult={setSearchResult}
        isSearch={false}
        setIsSearch={setIsSearch}
        searchText=""
        setSearchText={setSearchText}
      />
    );

    const input = getByPlaceholderText("Search the campus");
    fireEvent.changeText(input, "Library");
    expect(setSearchText).toHaveBeenCalledWith("Library");
  });

  it("filters and sets search results on submit", () => {
    const { getByPlaceholderText } = render(
      <MapSearch
        searchResult={[]}
        setSearchResult={setSearchResult}
        isSearch={false}
        setIsSearch={setIsSearch}
        searchText="Library"
        setSearchText={setSearchText}
      />
    );

    const input = getByPlaceholderText("Search the campus");
    fireEvent(input, "submitEditing");
    expect(setIsSearch).toHaveBeenCalledWith(true);
    expect(setSearchResult).toHaveBeenCalledWith([{ id: 1, name: "Library" }]);
  });

  it("handles case-insensitive search correctly", () => {
    const { getByPlaceholderText } = render(
      <MapSearch
        searchResult={[]}
        setSearchResult={setSearchResult}
        isSearch={false}
        setIsSearch={setIsSearch}
        searchText="gym"
        setSearchText={setSearchText}
      />
    );

    const input = getByPlaceholderText("Search the campus");
    fireEvent(input, "submitEditing");
    expect(setSearchResult).toHaveBeenCalledWith([{ id: 2, name: "Gym" }]);
  });
});
