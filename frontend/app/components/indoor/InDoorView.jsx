import { useEffect } from "react";
import { View, Text } from "react-native";
import Map from '../navigation/Map.jsx';
import WebView from "react-native-webview";

export default InDoorView = ({directionsFlow, index, selectedStart, selectedEnd}) => {
    let direction = directionsFlow[index];

    useEffect(() => {},[directionsFlow, index]);

    return (
        <View className='h-5/6 mb-20'>
            {direction?.is_indoor &&
            <View style={{ flex: 1 }}>
                <WebView
                    style={{
                    flex: 1,
                    marginHorizontal: 16,
                    marginBottom: 50,
                    backgroundColor: "#D1D5DB",
                    borderRadius: 8,
                    }}
                    source={{ uri: direction.url }}
                />
            </View>
            }
            {!direction?.is_indoor &&

                <Map navigationParams={{ start: selectedStart, end: selectedEnd, indoor: true }} />
            }
        </View>
        
    )
}