import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import { useLayerStore } from '../../stores/layerStore';
import { useToolStore } from '../../stores/toolStore';
import SearchBar from '../Search/SearchBar';
import ClusterGroup from './ClusterGroup';
import RadiusCircles from './RadiusCircles';
import MeasurementLayer from './MeasurementLayer';
import TempMarkers from './TempMarkers';
import RouteLine from './RouteLine';
import MapEventHandler from './MapEventHandler';
import ReachabilityOverlay from './ReachabilityOverlay';

// Palu, Sulawesi Tengah, Indonesia
const DEFAULT_CENTER: [number, number] = [-0.9, 119.87];
const DEFAULT_ZOOM = 13;

const PALU_BOUNDS: [[number, number], [number, number]] = [[-1.1, 119.6], [-0.6, 120.1]];

export default function MapCanvas() {
  const { layers } = useLayerStore();
  const { activeTool } = useToolStore();

  return (
    <div className={`map-container ${activeTool === 'measure' ? 'map-measure-mode' : ''}`}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        minZoom={11}
        maxBounds={PALU_BOUNDS}
        maxBoundsViscosity={1.0}
        zoomControl={true}
        attributionControl={true}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <SearchBar />
        <MapEventHandler />
        <TempMarkers />

        {/* Render saved layers */}
        {layers.map(layer =>
          layer.layerType === 'measurement' ? (
            <MeasurementLayer key={layer.id} layer={layer} />
          ) : (
            <div key={layer.id}>
              <ClusterGroup layer={layer} />
              <RadiusCircles layer={layer} />
            </div>
          )
        )}

        {/* Active measurement route lines (not yet saved) */}
        <RouteLine />

        {/* Reachability analysis visualization */}
        <ReachabilityOverlay />
      </MapContainer>
    </div>
  );
}
