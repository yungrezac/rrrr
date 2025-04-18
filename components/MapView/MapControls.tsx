import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MapPin, Route, Users } from 'lucide-react-native';

interface MapControlsProps {
  onToggleMarkers: () => void;
  onToggleRoutes: () => void;
  onToggleSkaters: () => void;
  showMarkers: boolean;
  showRoutes: boolean;
  showSkaters: boolean;
}

export default function MapControls({
  onToggleMarkers,
  onToggleRoutes,
  onToggleSkaters,
  showMarkers,
  showRoutes,
  showSkaters,
}: MapControlsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, showMarkers && styles.buttonActive]}
        onPress={onToggleMarkers}
      >
        <MapPin
          size={24}
          color={showMarkers ? '#FFFFFF' : '#007AFF'}
        />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, showRoutes && styles.buttonActive]}
        onPress={onToggleRoutes}
      >
        <Route
          size={24}
          color={showRoutes ? '#FFFFFF' : '#007AFF'}
        />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, showSkaters && styles.buttonActive]}
        onPress={onToggleSkaters}
      >
        <Users
          size={24}
          color={showSkaters ? '#FFFFFF' : '#007AFF'}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonActive: {
    backgroundColor: '#007AFF',
  },
});