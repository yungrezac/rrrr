import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

interface NativeMapProps {
  markers?: any[];
  routes?: any[];
  skaters?: any[];
  onMarkerPress?: (marker: any) => void;
  onRoutePress?: (route: any) => void;
  onSkaterPress?: (skater: any) => void;
  onMapPress?: (event: any) => void;
  recording?: boolean;
  onRecordingChange?: (recording: boolean) => void;
}

export default function NativeMap({
  markers = [],
  routes = [],
  skaters = [],
  onMarkerPress,
  onRoutePress,
  onSkaterPress,
  onMapPress,
  recording,
  onRecordingChange,
}: NativeMapProps) {
  const mapRef = useRef(null);
  const [region, setRegion] = useState({
    latitude: 55.7558,
    longitude: 37.6173,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      region={region}
      onRegionChangeComplete={setRegion}
      onPress={onMapPress}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          onPress={() => onMarkerPress?.(marker)}
        />
      ))}

      {routes.map((route) => (
        <Polyline
          key={route.id}
          coordinates={route.route_data.geometry.coordinates.map(([longitude, latitude]) => ({
            latitude,
            longitude,
          }))}
          strokeColor="#007AFF"
          strokeWidth={3}
          onPress={() => onRoutePress?.(route)}
        />
      ))}

      {skaters.map((skater) => (
        <Marker
          key={skater.id}
          coordinate={{
            latitude: skater.latitude,
            longitude: skater.longitude,
          }}
          onPress={() => onSkaterPress?.(skater)}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});