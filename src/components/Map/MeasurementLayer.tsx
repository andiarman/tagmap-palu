import { GeoJSON, CircleMarker, Polyline, Tooltip } from 'react-leaflet';
import type { MapLayer } from '../../types';


interface Props {
  layer: MapLayer;
}

export default function MeasurementLayer({ layer }: Props) {
  if (!layer.visible || layer.layerType !== 'measurement' || layer.markers.length < 2) return null;

  const [a, b] = layer.markers;
  const straightDist = layer.measurementData?.straightDistance;

  return (
    <>
      {/* Point A */}
      <CircleMarker
        center={[a.lat, a.lng]}
        radius={7}
        pathOptions={{ color: layer.color, fillColor: layer.color, fillOpacity: 1, weight: 2.5 }}
      >
        <Tooltip permanent direction="top" offset={[0, -10]}>
          <span style={{ fontWeight: 600, fontSize: 10 }}>A: {a.tags?.name || 'Titik A'}</span>
        </Tooltip>
      </CircleMarker>

      {/* Point B */}
      <CircleMarker
        center={[b.lat, b.lng]}
        radius={7}
        pathOptions={{ color: layer.color, fillColor: layer.color, fillOpacity: 1, weight: 2.5 }}
      >
        <Tooltip permanent direction="top" offset={[0, -10]}>
          <span style={{ fontWeight: 600, fontSize: 10 }}>B: {b.tags?.name || 'Titik B'}</span>
        </Tooltip>
      </CircleMarker>

      {/* Straight line (dashed) */}
      {straightDist && (
        <Polyline
          positions={[[a.lat, a.lng], [b.lat, b.lng]]}
          pathOptions={{
            color: layer.color,
            weight: 2,
            dashArray: '8, 6',
            opacity: 0.5,
          }}
        />
      )}

      {/* Road route (solid) */}
      {layer.routeGeometry && (
        <GeoJSON
          key={`ml-${layer.id}`}
          data={{
            type: 'Feature',
            properties: {},
            geometry: layer.routeGeometry,
          } as any}
          style={{
            color: layer.color,
            weight: 4,
            opacity: 0.7,
          }}
        />
      )}
    </>
  );
}
