import { Platform } from 'react-native';
import WebMap from './WebMap';
import NativeMap from './NativeMap';
import MarkerModal from './MarkerModal';
import RouteModal from './RouteModal';
import SkaterModal from './SkaterModal';
import MapControls from './MapControls';

export {
  MarkerModal,
  RouteModal,
  SkaterModal,
  MapControls,
};

// Platform-specific map implementation with error handling
const Map = Platform.select({
  web: () => {
    try {
      return WebMap;
    } catch (error) {
      console.error('Error loading WebMap:', error);
      return () => null;
    }
  },
  default: () => {
    try {
      return NativeMap;
    } catch (error) {
      console.error('Error loading NativeMap:', error);
      return () => null;
    }
  },
})();

export default Map;