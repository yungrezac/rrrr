import { View, StyleSheet } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import MapView, { RouteModal, MapControls } from '@/components/MapView';
import * as Location from 'expo-location';

interface MapRoute {
  id: string;
  title: string;
  description: string;
  image_url: string[];
  route_data: {
    type: 'Feature';
    geometry: {
      type: 'LineString';
      coordinates: [number, number][];
    };
  };
  user: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  created_at: string;
}

export default function RoutesScreen() {
  const [routes, setRoutes] = useState<MapRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<{
    type: 'Feature';
    geometry: {
      type: 'LineString';
      coordinates: [number, number][];
    };
  } | null>(null);

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    fetchRoutes();
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  async function fetchRoutes() {
    try {
      const { data, error } = await supabase
        .from('map_routes')
        .select(`
          *,
          user:profiles(
            id,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRoutes(data || []);
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  }

  async function startRecording() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    setRecording(true);
    setCurrentRoute({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [],
      },
    });

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (location) => {
        setCurrentRoute(current => {
          if (!current) return null;
          return {
            ...current,
            geometry: {
              ...current.geometry,
              coordinates: [
                ...current.geometry.coordinates,
                [location.coords.longitude, location.coords.latitude],
              ],
            },
          };
        });
      }
    );
  }

  function stopRecording() {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
    }
    setRecording(false);
    setShowRouteModal(true);
  }

  return (
    <View style={styles.container}>
      <MapView
        routes={[...routes, ...(currentRoute ? [{ id: 'current', route_data: currentRoute }] : [])]}
        onRoutePress={(route) => {
          console.log('Route pressed:', route);
        }}
        recording={recording}
        onRecordingChange={setRecording}
      />

      <MapControls
        mode="routes"
        recording={recording}
        onToggleRecording={() => {
          if (recording) {
            stopRecording();
          } else {
            startRecording();
          }
        }}
      />

      <RouteModal
        visible={showRouteModal}
        onClose={() => {
          setShowRouteModal(false);
          setCurrentRoute(null);
        }}
        routeData={currentRoute}
        onSuccess={fetchRoutes}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});