import React, { useEffect, useState, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { Polygon } from 'react-native-maps';
import getThemeColors from "../../ColorBindTheme";

// Function to check if a point is inside a polygon
export const isPointInPolygon = (point, polygon) => {
  let x = point.latitude, y = point.longitude;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i].latitude, yi = polygon[i].longitude;
    let xj = polygon[j].latitude, yj = polygon[j].longitude;

    let intersect = ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};


// Component to handle polygon highlighting
const MapPolygonHighlight = ({ building, location}) => {
  const theme = getThemeColors();
  const [highlightedPolygonColor, setHighlightedPolygonColor] = useState(theme.polygonFillColor);
  const animation = useRef(new Animated.Value(0)).current;

  // Check if the user is inside the polygon
  const isInside = location && isPointInPolygon(location.coords, building.boundaries);

  useEffect(() => {
    if (!isInside) {
      setHighlightedPolygonColor(theme.polygonFillColor);
      return;
    }

    // Start the gradient animation
    Animated.loop(
      Animated.timing(animation, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();

    const animationListener = animation.addListener(({ value }) => {
      const interpolatedColor = `rgba(39, 103, 207, ${0.3 + (0.9 * value)})`;
      setHighlightedPolygonColor(interpolatedColor);
    });

    return () => {
      animation.removeListener(animationListener);
      animation.setValue(0);
    };
  }, [isInside]);

  return (
    <Polygon
      coordinates={building.boundaries}
      strokeWidth={2}
      strokeColor={isInside ? "blue" : theme.backgroundColor}
      fillColor={highlightedPolygonColor}
    />
  );
};

export default MapPolygonHighlight;
