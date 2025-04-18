import { useEffect, useRef, useState } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import type { MapRef } from 'react-map-gl';

interface WebMapProps {
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

export default function WebMap({
  markers = [],
  routes = [],
  skaters = [],
  onMarkerPress,
  onRoutePress,
  onSkaterPress,
  onMapPress,
  recording,
  onRecordingChange,
}: WebMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    longitude: 37.6173,
    latitude: 55.7558,
    zoom: 10
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setViewState({
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
            zoom: 13
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      onClick={onMapPress}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          longitude={marker.longitude}
          latitude={marker.latitude}
          onClick={() => onMarkerPress?.(marker)}
        />
      ))}

      {routes.map((route) => (
        <Source key={route.id} type="geojson" data={route.route_data}>
          <Layer
            id={`route-${route.id}`}
            type="line"
            paint={{
              'line-color': '#007AFF',
              'line-width': 3
            }}
            onClick={() => onRoutePress?.(route)}
          />
        </Source>
      ))}

      {skaters.map((skater) => (
        <Marker
          key={skater.id}
          longitude={skater.longitude}
          latitude={skater.latitude}
          onClick={() => onSkaterPress?.(skater)}
        />
      ))}
    </Map>
  );
}