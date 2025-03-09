import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableHighlight,
} from "react-native";
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  Polygon,
  Callout,
} from "react-native-maps";
import { useNavigation, useRoute } from "@react-navigation/native";
import MapViewDirections from "react-native-maps-directions";
import NavigationIcon from "./Icons/NavigationIcon";
import DirectionsIcon from "./Icons/DirectionsIcon";
import {
  polygons,
  SGWLocation,
  LoyolaLocation,
  SGWShuttlePickup,
  LoyolaShuttlePickup,
} from "../../screens/navigation/navigationConfig";
import MapCard from "./MapCard";
import MapSearch from "./MapSearch";
import SGWIcon from "./Icons/SGWIcon";
import LoyolaIcon from "./Icons/LoyolaIcon";
import MapResults from "./MapResults";
import MapLocation from "./MapLocation";
import MapTraceroute from "./MapTraceroute";
import * as Location from "expo-location";
import MapTracerouteBottom from "./MapTracerouteBottom";
import BottomNavBar from "../BottomNavBar/BottomNavBar";
import { trackEvent } from "@aptabase/react-native";
import { useAppSettings } from "../../AppSettingsContext";
import getThemeColors from "../../ColorBindTheme";
import busService from "../../services/BusService";
export default function Map() {

  const {textSize} = useAppSettings();
  const theme = getThemeColors();
  const navigation = useNavigation();

  const [searchResult, setSearchResult] = useState([]);
  const [isSelected, setIsSelected] = useState(false);
  const [locationData, setLocationData] = useState(SGWLocation);
  const [isSearch, setIsSearch] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [start, setStart] = useState(); // start lat lng of traceroute
  const [end, setEnd] = useState(); // destination lt lng of traceroute
  const [location, setLocation] = useState(null); // current user location
  const [errorMsg, setErrorMsg] = useState(null); // error message when getting location
  const [searchText, setSearchText] = useState(""); // textinput value
  const [closeTraceroute, setCloseTraceroute] = useState(false); // bool to hide traceroute
  const [startPosition, setStartPosition] = useState(""); // name of start position for traceroute
  const [destinationPosition, setDestinationPosition] = useState(""); // name of destination position for traceroute
  const [waypoints, setWaypoints] = useState([]); // array of waypoints traceroutes that should be rendered by the GoogleAPI
  const [campus, setCampus] = useState("sgw");
  const [mode, setMode] = useState("WALKING"); // Mode of transportation
  const [isRoute, setIsRoute] = useState(false);
  const [carTravelTime, setCarTravelTime] = useState(null); //Estimated travel time by car
  const [bikeTravelTime, setBikeTravelTime] = useState(null); //Estimated travel time by bicycle
  const [metroTravelTime, setMetroTravelTime] = useState(null); //Estimated travel time by public transit
  const [walkTravelTime, setWalkTravelTime] = useState(null); //Estimated travel time on foot
  const [walkToBus, setWalkToBus] = useState({
    start:null,
    end:null
  });
  const [walkFromBus, setWalkFromBus] = useState({
    start:null,
    end:null
  });
  const [isShuttle,setIsShuttle] = useState(false);
  const ref = useRef(null);
  const polygonRef = useRef(null);
  //Aptabase.init("A-US-0837971026")

  // Add to busService observer list
  const [busMarkers, setBusMarkers] = useState([]);

  const route = useRoute();
  const observerRef = useRef(null);

  useEffect(() => {
    // Create observer
    observerRef.current = {
      update: (data) => {
        let points = data["d"]["Points"]
          .map((bus) => {
            if (bus["ID"].includes("BUS")) {
              return {
                id: bus["ID"],
                latitude: bus["Latitude"],
                longitude: bus["Longitude"],
              };
            }
          })
          .filter(Boolean);

        console.log("Points:", points);
        setBusMarkers(points);
      },
    };

    // Add observer when the screen is focused
    busService.addObserver(observerRef.current);
    busService.update();
    // Listen for when the screen loses focus (e.g., navigating away)
    const unsubscribeBlur = navigation.addListener("blur", () => {
      if (observerRef.current) {
        busService.removeObserver(observerRef.current);
      }
    });

    return () => {
      unsubscribeBlur();
      if (observerRef.current) {
        busService.removeObserver(observerRef.current);
      }
    };
  }, [navigation, route]);
  const fetchTravelTime = async (start, end, mode) => {
    if (!start || !end) return;

    const setTravelTime = {
      DRIVING: setCarTravelTime,
      BICYCLING: setBikeTravelTime,
      TRANSIT: setMetroTravelTime,
      WALKING: setWalkTravelTime,
    };

    // Check if start and end locations are the same
    if (start.latitude === end.latitude && start.longitude === end.longitude) {
      console.log(`Start and end locations are the same. Setting travel time to 0 min.`);
      setTravelTime[mode]?.("0 min");
      return;
  }
  
    // Base URL defined as a global constant
    const GOOGLE_DIRECTIONS_API_BASE_URL = "https://maps.googleapis.com/maps/api/directions/json";
    
    const travelMode = mode.toLowerCase();
    
    let url = `${GOOGLE_DIRECTIONS_API_BASE_URL}?origin=${start.latitude},${start.longitude}` +
          `&destination=${end.latitude},${end.longitude}` +
          `&mode=${travelMode}` +
          `&key=${process.env.EXPO_PUBLIC_GOOGLE_API_KEY}`;
    
    // specific parameters for transit mode
    if (travelMode === 'transit') {
      url += '&transit_mode=bus|subway|train';
    }
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.status !== "OK") {
        console.error(`Error fetching ${mode} directions:`, data.status, data.error_message);
        // Set appropriate state to indicate no route found
        setTravelTime[mode]?.("No route");
        return;
      }
  
      const route = data.routes[0];
      if (!route || !route.legs || !route.legs[0]) {
        console.error('No valid route found');
        return;
      }
  
      const duration = route.legs[0].duration.text;
      // Update the appropriate state based on the mode
      setTravelTime[mode]?.(duration);
    } catch (error) {
      console.error(`Error fetching ${mode} directions:`, error);
      // Set error state for the specific mode
      setTravelTime[mode]?.("Error");
    }
  };

 const handleSetStart = () => {
  if (start != null && start !== location?.coords) {
    setIsRoute(true);
    setIsSearch(true);
    setDestinationPosition(selectedBuilding.name);
    setEnd(selectedBuilding.point);

    // Reset travel times
    setCarTravelTime(null);
    setBikeTravelTime(null);
    setMetroTravelTime(null);
    setWalkTravelTime(null);

    // Fetch times from start point to selected building
    const fetchAllTravelTimes = async () => {
      await Promise.all([
        fetchTravelTime(start, selectedBuilding.point, 'DRIVING'),
        fetchTravelTime(start, selectedBuilding.point, 'BICYCLING'),
        fetchTravelTime(start, selectedBuilding.point, 'TRANSIT'),
        fetchTravelTime(start, selectedBuilding.point, 'WALKING'),
      ]);
    };
    fetchAllTravelTimes();
    return;
  }
  setStart(selectedBuilding.point);
  setStartPosition(selectedBuilding.name);
};

  const handleGetDirections = () => {
    try {
      trackEvent("Get Directions", { selectedBuilding });
      console.log("Event tracked");
    setIsRoute(true);
    setIsSearch(true);
    setEnd(selectedBuilding.point);
    setDestinationPosition(selectedBuilding.name);
    if (location != null) {
      setStart(location.coords);
    }
    setStartPosition("Your Location");

    // Reset all travel times before fetching new ones
    setCarTravelTime(null);
    setBikeTravelTime(null);
    setMetroTravelTime(null);
    setWalkTravelTime(null);

    // Fetch travel times for all modes
    const fetchAllTravelTimes = async () => {
      await Promise.all([
        fetchTravelTime(location?.coords, selectedBuilding.point, 'DRIVING'),
        fetchTravelTime(location?.coords, selectedBuilding.point, 'BICYCLING'),
        fetchTravelTime(location?.coords, selectedBuilding.point, 'TRANSIT'),
        fetchTravelTime(location?.coords, selectedBuilding.point, 'WALKING'),
      ]);
    };

    fetchAllTravelTimes();
  } catch (e) {
    console.error(e);
    }
  };

  const handleLoyola = () => {
    setCampus("loyola");
    ref.current?.animateToRegion(LoyolaLocation);
  };

  const handleSGW = () => {
    setCampus("sgw");
    ref.current?.animateToRegion(SGWLocation);
  };

  // Called when user presses on a building marker
  const handleMarkerPress = (building) => {
    setIsSearch(false);
    setSelectedBuilding(building);
    setIsSelected(true);
  };

  const panToMyLocation = () => {
    ref.current?.animateToRegion(location.coords);
  };

  const renderPolygons = polygons.map((building, idx) => {
    return (
      <View key={idx}>
        {end == null ? (
          <Marker
            testID={"building-"+idx}
            coordinate={building.point}
            onPress={() => handleMarkerPress(building)}
            image={require("../../../assets/concordia-logo.png")}
          >
            <Callout
              tooltip={true}
              onPress={() => navigation.navigate("Building Details", building)}
            >
              <MapCard building={building} isCallout={true} />
            </Callout>
          </Marker>
        ) : null}
        <Polygon
          coordinates={building.boundaries}
          strokeWidth={2}
          strokeColor= {theme.backgroundColor}
          fillColor= {theme.polygonFillColor}
        />
      </View>
    );
  });

  const traceRouteOnReady = (args) => {
    console.log("Directions are ready!");
  };

  const reset = () => {
    setIsRoute(false);
    setIsSearch(false);
    setEnd(null);
    setStart(null);
    setSelectedBuilding(null);
    setCloseTraceroute(false);
    setIsSelected(false);
  };

  const handleMapPress = () => {};

  const panToStart = () => {
    if (start == null) return;
    ref.current?.animateToRegion(start);
  };

  useEffect(() => {
    console.log("is route: " + isRoute);
  }, [isRoute, waypoints, mode, isShuttle, end]);

  useEffect(() => {
    if (location != null && start != location.coords) return;
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }
    getCurrentLocation();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={ref}
        style={styles.map}
        initialRegion={{
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          latitudeDelta: 0.009,
          longitudeDelta: 0.009,
        }}
        mapType="terrain"
        provider={PROVIDER_DEFAULT}
        onPress={handleMapPress}
        end={end}
        start={start}
      >
        {location != null && (
          <Marker
            coordinate={location.coords}
            image={require("../../../assets/my_location.png")}
          />
        )}
        <Marker
          coordinate={SGWShuttlePickup}
          image={require("../../../assets/shuttle.png")}
        />
        <Marker
          coordinate={LoyolaShuttlePickup}
          image={require("../../../assets/shuttle.png")}
        />
        {start != null && end != null ? <Marker coordinate={end} /> : null}
        {start != null && end != null ? <Marker coordinate={start} /> : null}
        {start != null && end != null && isShuttle ? (<MapViewDirections
          origin={walkToBus.start}
          destination={walkToBus.end}
          apikey={process.env.EXPO_PUBLIC_GOOGLE_API_KEY}
          strokeColor="red"
          strokeWidth={6}
          mode={"WALKING"}
        />) : null}
        {start != null && end != null && isShuttle ? (<MapViewDirections
          testID='walkfrombus'
          origin={walkFromBus.start}
          destination={walkFromBus.end}
          apikey={process.env.EXPO_PUBLIC_GOOGLE_API_KEY}
          strokeColor="red"
          strokeWidth={6}
          mode={"WALKING"}
        />) : null}
        {start != null && end != null && isShuttle ? (<MapViewDirections
          testID='walktobus'
          origin={SGWShuttlePickup}
          destination={LoyolaShuttlePickup}
          apikey={process.env.EXPO_PUBLIC_GOOGLE_API_KEY}
          strokeColor="#862532"
          strokeWidth={6}
          mode={"DRIVING"}
        />) : null}
        {start != null && end != null && !isShuttle ? (
          <MapViewDirections
            origin={start}
            destination={end}
            apikey={process.env.EXPO_PUBLIC_GOOGLE_API_KEY}
            strokeColor="#862532"
            strokeWidth={6}
            waypoints={waypoints}
            mode={mode}
            onReady={traceRouteOnReady}
          />
        ) : null}
        {/* Render bus markers directly within the MapView */}
        {busMarkers.map((bus, idx) => {
          console.log("rendering bus marker", bus);
          return (
            <Marker
              testID="bus-marker"
              key={bus.id} // Add a key prop
              coordinate={{
                latitude: bus.latitude,
                longitude: bus.longitude,
              }}
              image={require("../../../assets/shuttle-bus-map.png")}
            />
          );
        })}
        <View ref={polygonRef}>{renderPolygons}</View>
      </MapView>

      {isRoute ? (
        <MapTraceroute
          isShuttle={isShuttle}
          setWalkToBus={setWalkToBus}
          setWalkFromBus={setWalkFromBus}
          setIsShuttle={setIsShuttle}
          carTravelTime={carTravelTime}
          bikeTravelTime={bikeTravelTime}
          metroTravelTime={metroTravelTime}
          walkTravelTime={walkTravelTime}
          fetchTravelTime={fetchTravelTime}
          setMode={setMode}
          location={location}
          reset={reset}
          isRoute={isRoute}
          handleSGW={handleSGW}
          panToMyLocation={panToMyLocation}
          end={end}
          setStart={setStart}
          setEnd={setEnd}
          destinationPosition={destinationPosition}
          setDestinationPosition={setDestinationPosition}
          setStartPosition={setStartPosition}
          closeTraceroute={closeTraceroute}
          setCloseTraceroute={setCloseTraceroute}
        />
      ) : null}

      {isRoute ? (
        <MapTracerouteBottom
          setIsRoute={setIsRoute}
          isRoute={isRoute}
          panToStart={panToStart}
          end={end}
          start={start}
          closeTraceroute={closeTraceroute}
          setCloseTraceroute={setCloseTraceroute}
        />
      ) : null}

      {isSearch && end == null && (
        <MapResults
          fetchTravelTime={fetchTravelTime}
          setCarTravelTime={setCarTravelTime}
          setBikeTravelTime={setBikeTravelTime}
          setMetroTravelTime={setMetroTravelTime}
          setWalkTravelTime={setWalkTravelTime}
          location={location}
          setIsRoute={setIsRoute}
          isRoute={isRoute}
          setCloseTraceroute={setCloseTraceroute}
          setStartPosition={setStartPosition}
          setDestinationPosition={setDestinationPosition}
          start={start}
          end={end}
          setStart={setStart}
          setEnd={setEnd}
          setSearchText={setSearchText}
          searchResult={searchResult}
          setSearchResult={setSearchResult}
          isSearch={isSearch}
          setIsSearch={setIsSearch}
          searchText={searchText}
        />
      )}

      {!isSearch && (
        <MapSearch
          searchResult={searchResult}
          setSearchResult={setSearchResult}
          isSearch={isSearch}
          setIsSearch={setIsSearch}
          searchText={searchText}
          setSearchText={setSearchText}
        />
      )}

      {!isSearch && (
        <View className="absolute h-full justify-end items-center">
          <View
            style={styles.shadow}
            className="mb-40 rounded-xl bg-white p-4 ml-8"
          >
            <TouchableHighlight
              underlayColor={"white"}
              onPress={handleLoyola}
              className="mb-4"
            >
              <LoyolaIcon campus={campus} />
            </TouchableHighlight>
            <TouchableHighlight underlayColor={"white"} onPress={handleSGW}>
              <SGWIcon campus={campus} />
            </TouchableHighlight>
          </View>
        </View>
      )}

      {!isSearch && (
        <MapLocation panToMyLocation={panToMyLocation} setLocation={setLocation} />
      )}

      {selectedBuilding && !isSearch && (
        <View className="absolute w-full bottom-20">
          <View className="flex flex-row justify-center items-center">
            <TouchableHighlight
              testID="set-start-end"
              style={[styles.shadow, { backgroundColor: theme.backgroundColor }]}
              className='mr-4 rounded-xl p-4 bg-primary-red'
              onPress={handleSetStart}
            >
              <View className='flex flex-row justify-around items-center'>
                {start != null && start != location?.coords ? <Text style={[{ fontSize: textSize }]} className='color-white mr-4 font-bold'>Set Destination</Text> : <Text style={[{ fontSize: textSize }]} className='color-white mr-4 font-bold'>Set Start</Text>}

                <NavigationIcon />
              </View>
            </TouchableHighlight>
            <TouchableHighlight
              testID="get-directions"
              style={[styles.shadow, { backgroundColor: theme.backgroundColor }]}
              className='rounded-xl p-4 bg-primary-red'
              onPress={handleGetDirections}
            >
              <View className='flex flex-row justify-around items-center'>
                <Text style={[{ fontSize: textSize }]} className='color-white mr-4 font-bold'>Get Directions</Text>

                <DirectionsIcon />
              </View>
            </TouchableHighlight>
          </View>
        </View>
      )}

      <View className="w-full absolute bottom-0">
        <BottomNavBar />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  shadow: {
    boxShadow:
      "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
    textAlign: "center",
  },
});
