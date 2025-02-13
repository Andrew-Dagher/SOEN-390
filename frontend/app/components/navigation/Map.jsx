import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, TouchableHighlight } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Polygon, Callout } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import NavigationIcon from './Icons/NavigationIcon';
import DirectionsIcon from './Icons/DirectionsIcon';
import { polygons, SGWLocation, LoyolaLocation, SGWShuttlePickup, LoyolaShuttlePickup } from '../../screens/navigation/navigationConfig';
import MapCard from './MapCard';
import MapSearch from './MapSearch';
import SGWIcon from './Icons/SGWIcon';
import LoyolaIcon from './Icons/LoyolaIcon';
import MapResults from './MapResults';
import MapLocation from './MapLocation';
import MapTraceroute from './MapTraceroute';
import * as Location from 'expo-location';
import MapTracerouteBottom from './MapTracerouteBottom';
import BottomNavBar from '../BottomNavBar/BottomNavBar';
import { trackEvent } from "@aptabase/react-native";

export default function Map() {
  const [searchResult, setSearchResult] = useState([]);
  const [isSelected, setIsSelected] = useState(false);
  const [locationData, setLocationData] = useState(SGWLocation);
  const [isSearch, setIsSearch] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [start, setStart] = useState(); // start lat lng of traceroute
  const [end, setEnd] = useState(); // destination lt lng of traceroute
  const [location, setLocation] = useState(null); // current user location
  const [errorMsg, setErrorMsg] = useState(null); // error message when getting location
  const [searchText, setSearchText] = useState(''); // textinput value
  const [closeTraceroute, setCloseTraceroute] = useState(false); // bool to hide traceroute
  const [startPosition, setStartPosition] = useState(''); // name of start position for traceroute
  const [destinationPosition, setDestinationPosition] = useState(''); // name of destination position for traceroute
  const [waypoints, setWaypoints] = useState([]); // array of waypoints traceroutes that should be rendered by the GoogleAPI. This is used to show the directions from start to the shuttle
  const [campus, setCampus] = useState('sgw');
  const [mode, setMode] = useState('WALKING'); // Mode of transportation 
  const [isRoute, setIsRoute] = useState(false);
  const ref = useRef(null);
  const polygonRef = useRef(null);
  //Aptabase.init("A-US-0837971026")
  const handleSetStart = () => {
    if (start != null && start != location?.coords) {
      console.log("trying to ")
      setIsRoute(true);
      setIsSearch(true);
      setDestinationPosition(selectedBuilding.name);
      setEnd(selectedBuilding.point);
      return;
    }
    setStart(selectedBuilding.point)
    setStartPosition(selectedBuilding.name)
  };

  const handleGetDirections = () => {
    try{
    trackEvent("Get Directions", {selectedBuilding});
    console.log("Event tracked")}catch(e){
      console.error(e)
    }
    setIsRoute(true);
    setIsSearch(true);
    setEnd(selectedBuilding.point);
    setDestinationPosition(selectedBuilding.name);
    setStart(location.coords);
    setStartPosition('Your Location');
  };

  const handleLoyola = () => {
    setCampus('loyola');
    ref.current?.animateToRegion(LoyolaLocation);
  };

  const handleSGW = () => {
    setCampus('sgw');
    ref.current?.animateToRegion(SGWLocation);
  };

  // Called when user presses on a building marker
  const handleMarkerPress = (building) => {
    // Hide search-related UI
    setIsSearch(false);
    // Set the building that was selected
    setSelectedBuilding(building);
    setIsSelected(true);
  };

  const panToMyLocation = () => {
    ref.current?.animateToRegion(location.coords)
  }

  const renderPolygons = polygons.map((building, idx) => {
    return (
      <View key={idx}>
        {
          end == null ?
          <Marker
          coordinate={building.point}
          onPress={() => handleMarkerPress(building)}
          image={require("../../../assets/concordia-logo.png")}
          >
          <Callout tooltip={true}>
            <MapCard
              name={building.name}
              address={building.address}
              isHandicap={true}
              isMetro={true}
              isInfo={true}
            />
          </Callout>
        </Marker> : null}
        <Polygon
          coordinates={building.boundaries}
          strokeWidth={2}
          strokeColor="#862532"
          fillColor="rgba(134, 37, 50, 0.5)"
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
  }

  const handleMapPress = () => {
  }

  const panToStart = () => {
    if (start == null) return;
    ref.current?.animateToRegion(start);
  }

  useEffect(()=>{
    console.log("is route: " + isRoute)
  },[isRoute, waypoints, mode])


  useEffect(() => {
    if (location != null && start != location.coords) return;
    async function getCurrentLocation() {
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }
    getCurrentLocation();
  }, []);

  console.log(process.env.EXPO_PUBLIC_GOOGLE_API_KEY)

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
        mapType='terrain'
        provider={PROVIDER_DEFAULT}
        onPress={handleMapPress}
        end={end}
        start={start}
        
      > 
        {location != null && <Marker coordinate={location.coords} image={require("../../../assets/my_location.png")}/>}
        {start != null && end != null ? (<Marker coordinate={end}/>) : null}
        {start != null && end != null ? (<Marker coordinate={start}/>) : null}
        {start != null && end != null ? (<MapViewDirections
          origin={start}
          destination={end}
          apikey={process.env.EXPO_PUBLIC_GOOGLE_API_KEY}
          strokeColor="#862532"
          strokeWidth={6}
          waypoints={waypoints}
          mode={mode}
          onReady={traceRouteOnReady}
        />): null}
        <View ref={polygonRef}>
          {console.log("rerendered")}
          {console.log(end)}
          {console.log(start)}
          {renderPolygons}
        </View>
      </MapView>
      {isRoute ? (<MapTraceroute setMode={setMode} waypoints={waypoints} setWaypoints={setWaypoints} location={location} setIsRoute={setIsRoute} reset={reset} isRoute={isRoute} setSelectedBuilding={setSelectedBuilding} handleSGW={handleSGW} panToMyLocation={panToMyLocation} end={end} start={start} setStart={setStart} setEnd={setEnd} startPosition={startPosition} destinationPosition={destinationPosition} setStartPosition={setStartPosition} setDestinationPosition={setDestinationPosition} setIsSearch={setIsSearch} closeTraceroute={closeTraceroute} setCloseTraceroute={setCloseTraceroute}/>) : null}
      {isRoute ? (<MapTracerouteBottom setIsRoute={setIsRoute} isRoute={isRoute} panToStart={panToStart} end={end} start={start} closeTraceroute={closeTraceroute} setCloseTraceroute={setCloseTraceroute} />) : null}
      {isSearch && end == null && <MapResults
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
        searchResult={searchResult} setSearchResult={setSearchResult}
        isSearch={isSearch} setIsSearch={setIsSearch} searchText={searchText} />}
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
          <View style={styles.shadow} className='mb-40 rounded-xl bg-white p-4 ml-8'>
            <TouchableHighlight underlayColor={'white'} onPress={handleLoyola} className='mb-4'>
              <LoyolaIcon campus={campus}/>
            </TouchableHighlight>
            <TouchableHighlight underlayColor={'white'} onPress={handleSGW}>
              <SGWIcon campus={campus}/>
            </TouchableHighlight>
          </View>
        </View>
      )}

      {!isSearch && <MapLocation panToMyLocation={panToMyLocation} setLocation={() => {}} />}

      {selectedBuilding && !isSearch && (
        <View className='absolute w-full bottom-20'>
          <View className='flex flex-row justify-center items-center'>
            <TouchableHighlight
              style={styles.shadow}
              className='mr-4 rounded-xl p-4 bg-primary-red'
              onPress={handleSetStart}
            >
              <View className='flex flex-row justify-around items-center'>
                {start != null && start != location?.coords ? <Text className='color-white mr-4 font-bold'>Set Destination</Text> : <Text className='color-white mr-4 font-bold'>Set Start</Text>}
                <NavigationIcon />
              </View>
            </TouchableHighlight>
            <TouchableHighlight
              style={styles.shadow}
              className='rounded-xl p-4 bg-primary-red'
              onPress={handleGetDirections}
            >
              <View className='flex flex-row justify-around items-center'>
                <Text className='color-white mr-4 font-bold'>Get Directions</Text>
                <DirectionsIcon />
              </View>
            </TouchableHighlight>
          </View>
        </View>
      )}
      <View className='w-full absolute bottom-0'>
        <BottomNavBar/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  shadow: {
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
    textAlign: 'center'
  },
});
