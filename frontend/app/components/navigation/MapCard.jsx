import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import InformationIcon from './Icons/InformationIcon';
import MapPinIcon from './Icons/MapPinIcon';
import WheelChairIcon from './Icons/WheelChairIcon';
import MetroIcon from './Icons/MetroIcon';


const MapCard = ({ name, address, isHandicap, isMetro, isInfo}) => {
  return (
    <View testID='mapcard-view' style={styles.shadow} className='flex bg-white p-6 rounded-lg'>
      <View className='flex flex-row justify-between'> 
        <Text className='font-bold mr-4'>{name}</Text>
        <View className='flex flex-row justify-around'>
          {isHandicap && <WheelChairIcon/>}
          {isMetro && <MetroIcon/>}
          {isInfo && <InformationIcon/>}
        </View>
      </View>
      <View className='mt-2 flex flex-row'>
        <MapPinIcon/>
        <Text className='color-slate-400'>{address}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    width: '250px',
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
    textAlign: 'center'
  }
});

export default MapCard;
