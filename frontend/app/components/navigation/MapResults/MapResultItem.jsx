import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, TouchableHighlight, PanResponder} from 'react-native';
import WheelChairIcon from '../Icons/WheelChairIcon';
import BikeIcon from '../Icons/BikeIcon';
import MetroIcon from '../Icons/MetroIcon';
import InformationIcon from '../Icons/InformationIcon';
import NavigationIcon from '../Icons/NavigationIcon';
import DirectionsIcon from '../Icons/DirectionsIcon';
import { useEffect, useRef } from 'react';
import SmallNavigationIcon from '../Icons/SmallNavigationIcon';
import { useAppSettings } from "../../../AppSettingsContext";
import getThemeColors from "../../../ColorBindTheme";


const MapResultItem = ({isRoute, location, setIsSearch,setIsRoute, setCloseTraceroute, setStartPosition,setDestinationPosition,building, start, setStart, end, setEnd,  name, address,isHandicap, isBike, isMetro, isInfo}) => {
    const {textSize} = useAppSettings();
    const theme = getThemeColors();
    const handleSetStart = () => {
        if (start != null && start != location?.coords) {
          console.log("trying to ")
          setIsRoute(true);
          setIsSearch(true);
          setDestinationPosition(building.name);
          setEnd(building.point);
          return;
        }
        setStart(building.point)
        setStartPosition(building.name)
    };

    const handleGetDirections = () => {
        setCloseTraceroute(false);
        setEnd(building.point);
        setDestinationPosition(building.name);
        setStartPosition('Your Location');
    }

    useEffect(() => {

    },[start, end, isRoute])

    return (
        <View style={styles.shadow} className='w-full  mb-4 bg-secondary-bg p-4 rounded-lg flex flex-col justify-center items-center'>
            <View className='flex justify-start left-0 flex-row mb-4'>
                <View className='mr-4'>
                    <Text className='font-bold'>{name}</Text>
                </View>
                <View className='flex flex-row items-center justify-around'>
                    <WheelChairIcon/>
                    <BikeIcon/>
                    <MetroIcon/>
                    <InformationIcon/>
                </View>

            </View>
            <View className='mb-4 flex flex-row'>
                <SmallNavigationIcon/>
                <Text className='color-slate-400 text-xs'>{address}</Text>
            </View>
            <View className='flex flex-row justify-around items-center'>
                <TouchableHighlight onPress={handleSetStart} style={[styles.shadow, { backgroundColor: theme.backgroundColor }, {fontSize: textSize}]} className='mr-4 rounded-xl p-4 bg-primary-red'>
                    <View className='flex flex-row justify-around items-center'>
                        {start != null && start != location?.coords ? <Text style={[{ fontSize: textSize }]} className='color-white mr-4 font-bold'>Set Destination</Text> : <Text style={[{ fontSize: textSize }]} className='color-white mr-4 font-bold'>Set Start</Text>}
                    <NavigationIcon/>
                    </View>
                </TouchableHighlight>
                <TouchableHighlight onPress={handleGetDirections} style={[styles.shadow, { backgroundColor: theme.backgroundColor }]} className='rounded-xl p-4 bg-primary-red'>
                    <View className='flex flex-row justify-around items-center'>
                    <Text style={[{ fontSize: textSize }]} className='color-white mr-4 font-bold'>Get Directions</Text>
                    <DirectionsIcon/>
                    </View>
                </TouchableHighlight>
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    shadow: {
      boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
      textAlign: 'center'
    }
});

export default MapResultItem;
