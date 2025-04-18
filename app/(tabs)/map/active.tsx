import { View, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import MapView, { SkaterModal } from '@/components/MapView';
import * as Location from 'expo-location';

interface ActiveSkater {
  id: string;
  latitude: number;
  longitude: number;
  last_updated: string;
  user: {
    id: string;
    full_name: string;
    avatar_url: string;
    city: string;
    experience_years: number;
    skating_style: string[];
  };
}

export default function ActiveScreen() {
  const [skaters, setSkaters] = useState<ActiveSkater[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkater, setSelectedSkater] = useState<ActiveSkater | null>(null);
  const [showSkaterModal, setShowSkaterModal] = useState(false);

  useEffect(() => {
    startLocationUpdates();
    fetchSkaters();
    const interval = setInterval(fetchSkaters, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  async function startLocationUpdates() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 30000,
        distanceInterval: 10,
      },
      async (location) => {
        try {
          await supabase
            .from('athlete_locations')
            .upsert({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              last_updated: new Date().toISOString(),
            });
        } catch (error) {
          console.error('Error updating location:', error);
        }
      }
    );
  }

  async function fetchSkaters() {
    try {
      const { data, error } = await supabase
        .from('athlete_locations')
        .select(`
          *,
          user:profiles(
            id,
            full_name,
            avatar_url,
            city,
            experience_years,
            skating_style
          )
        `)
        .gte('last_updated', new Date(Date.now() - 30 * 60000).toISOString()); // Only show active users (last 30 minutes)

      if (error) throw error;
      setSkaters(data || []);
    } catch (error) {
      console.error('Error fetching active skaters:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <MapView
        skaters={skaters}
        onSkaterPress={(skater) => {
          setSelectedSkater(skater);
          setShowSkaterModal(true);
        }}
      />

      <SkaterModal
        visible={showSkaterModal}
        onClose={() => {
          setShowSkaterModal(false);
          setSelectedSkater(null);
        }}
        skater={selectedSkater}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});