import { View, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import MapView, { MarkerModal, MapControls } from '@/components/MapView';

interface MapMarker {
  id: string;
  title: string;
  description: string;
  image_url: string[];
  latitude: number;
  longitude: number;
  user: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  created_at: string;
}

export default function MarkersScreen() {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMarkerModal, setShowMarkerModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    fetchMarkers();
  }, []);

  async function fetchMarkers() {
    try {
      const { data, error } = await supabase
        .from('map_locations')
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
      setMarkers(data || []);
    } catch (error) {
      console.error('Error fetching markers:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <MapView
        markers={markers}
        onMarkerPress={(marker) => {
          console.log('Marker pressed:', marker);
        }}
        onMapPress={(event) => {
          setSelectedLocation(event.coordinate);
          setShowMarkerModal(true);
        }}
      />

      <MapControls
        mode="markers"
        onAddMarker={() => setShowMarkerModal(true)}
      />

      <MarkerModal
        visible={showMarkerModal}
        onClose={() => {
          setShowMarkerModal(false);
          setSelectedLocation(null);
        }}
        location={selectedLocation}
        onSuccess={fetchMarkers}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});