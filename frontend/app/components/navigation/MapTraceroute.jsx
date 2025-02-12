import React, { useEffect, useRef, useState } from 'react';
import 'react-native-get-random-values';
import { Animated, StyleSheet, View, Button, Dimensions, Text, TouchableOpacity, TextInput } from 'react-native';
import CarIcon from './Icons/CarIcon';
import BikeNavIcon from './Icons/BikeNavIcon';
import MetroNavIcon from './Icons/MetroNavIcon';
import WalkIcon from './Icons/WalkIcon';
import CircleIcon from './Icons/CircleIcon';
import DotsIcon from './Icons/DotsIcon';
import SmallNavigationIcon from './Icons/SmallNavigationIcon';
import SwapIcon from './Icons/SwapIcon';
import ArrowIcon from './Icons/ArrowIcon';
import {
  GooglePlaceDetail,
  GooglePlacesAutocomplete,
} from "react-native-google-places-autocomplete";
import { SGWShuttlePickup, LoyolaShuttlePickup } from '../../screens/navigation/navigationConfig';

const MapTraceroute = ({setMode,waypoints, setWaypoints, location, reset, isRoute, setIsRoute, setSelectedBuilding, panToMyLocation,end, start, setEnd, setStart, startPosition,destinationPosition,setStartPosition, setDestinationPosition,closeTraceroute, setCloseTraceroute, setIsSearch}) => {

  const [selected, setSelected] = useState('');

  const slideAnim = useRef(new Animated.Value(-Dimensions.get('window').height * 0.3)).current; // Initially set the top position off the screen

  const slideIn = () => {
    Animated.timing(slideAnim, {
      toValue: 0, // Slide down to 0 (the top of the screen)
      duration: 1000, // Duration of the animation
      useNativeDriver: false,
    }).start();
  };

  const slideOut = () => {
    Animated.timing(slideAnim, {
      toValue: -Dimensions.get('window').height * 0.3, // Slide back up off the screen
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const handleCloseTraceroute = () => {
    slideOut();
    setCloseTraceroute(true);
    reset();
  }

  useEffect(() => {
    if (!closeTraceroute) {
      slideIn();
    }
  },[closeTraceroute])

  const onPlaceSelected = (
    details,
    flag
  ) => {
    const set = flag === "origin" ? setStart : setEnd;
    const position = {
      latitude: details?.geometry.location.lat || 0,
      longitude: details?.geometry.location.lng || 0,
    };
    set(position);
    panToMyLocation(position);
  };

  useEffect(() => {

  },[end,start,isRoute])


  const InputAutocomplete = ({
    label,
    placeholder,
    onPlaceSelected,
  }) => {
    return (
      <>
        <GooglePlacesAutocomplete
          enableHighAccuracyLocation={true}
          styles={{ textInput: styles.input }}
          placeholder={placeholder || ""}
          fetchDetails
          
          onPress={(data, details = null) => {
            onPlaceSelected(details);
          }}
          query={{
            key: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
            language: "en-us",
          }}
        />
      </>
    );
  }

  const updateDirections = () => {
    // TODO
    console.log("tring to update waypoints")
    if (selected?.isSGW == true && isAtSGW == true) {
      return;
    }
    if (selected?.isSGW == false && isAtSGW == true) {
      // user is closer to sgw and wants to go to loyola using shuttle
      setWaypoints([SGWShuttlePickup, LoyolaShuttlePickup])
    } 
    if (selected?.isSGW == true && isAtSGW == false)  {
      // user is closer to loyla and wants to go to sgw using shuttle
      setWaypoints([LoyolaShuttlePickup, SGWShuttlePickup])
    }
    setWaypoints([SGWShuttlePickup]);
  }

  return (
      <Animated.View className='rounded-xl p-3' style={[styles.slidingView, styles.shadow,{ top: slideAnim }]}>
        <View className='flex h-full w-full flex-col p-2'>
          <View className='mt-2 h-5/6 flex flex-row justify-center items-center'>
            <TouchableOpacity className='mr-4 mb-8' onPress={handleCloseTraceroute}>
              <ArrowIcon/>
            </TouchableOpacity>
            <View className='flex flex-col justify-center items-center mr-4'>
              <CircleIcon/>
              <DotsIcon/>
              <SmallNavigationIcon/>
            </View>
            <View className='w-2/3 mt-8'>
            <InputAutocomplete
              label="Origin"
              placeholder={startPosition}
              onPlaceSelected={(details) => {
                onPlaceSelected(details, "origin");
              }}
            />
            <InputAutocomplete
              label="Destination"
              placeholder={destinationPosition}
              onPlaceSelected={(details) => {
                onPlaceSelected(details, "destination");
              }}
            />
            </View>
            <View className='ml-4'>
              <SwapIcon/>
            </View>
          </View>
          <View className='flex flex-row items-center justify-around h-1/6'>
            <TouchableOpacity onPress={() => {setSelected('car'); updateDirections();}} className={`flex mr-1 p-2 rounded-3xl flex-row justify-around items-center ${selected === 'car' ? 'bg-primary-red' : ''}`}>
              <CarIcon isSelected={selected === 'car'? true : false}/>
              <Text className={`ml-2 font-semibold ${selected === 'car' ? 'color-selected' : ''}`}>30 min</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {setSelected('bike'); setMode("BICYCLING")}} className={`flex mr-1 p-2 rounded-3xl flex-row justify-around items-center ${selected === 'bike' ? 'bg-primary-red' : ''}`}>
              <BikeNavIcon isSelected={selected === 'bike'? true : false} />
              <Text className={`ml-2 font-semibold ${selected === 'bike' ? 'color-selected' : ''}`}>30 min</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {setSelected('metro'); setMode("TRANSIT")}} className={`flex p-2 rounded-3xl flex-row justify-around items-center ${selected === 'metro' ? 'bg-primary-red' : ''}`}>
              <MetroNavIcon isSelected={selected === 'metro'? true : false} />
              <Text className={`ml-2 font-semibold ${selected === 'metro' ? 'color-selected' : ''}`}>30 min</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {setSelected('walk'); setMode("WALKING")}} className={`flex p-2 rounded-3xl flex-row justify-around items-center ${selected === 'walk' ? 'bg-primary-red' : ''}`}>
              <WalkIcon isSelected={selected === 'walk'? true : false}/>
              <Text className={`ml-2 font-semibold ${selected === 'walk' ? 'color-selected' : ''}`}>30 min</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
    textAlign: 'center'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slidingView: {
    position: 'absolute',
    top: 0, // Start from the top of the screen
    height: Dimensions.get('window').height * 0.3, // 30% of screen height
    width: '100%', // Full width
    backgroundColor: 'white', // Background color (customizable)
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderColor: "#888",
    borderWidth: 2,
  },
});

export default MapTraceroute;