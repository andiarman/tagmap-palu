import { Polyline, GeoJSON, CircleMarker, Tooltip } from 'react-leaflet';
import { useToolStore } from '../../stores/toolStore';
import { formatDistance } from '../../utils/format';

export default function RouteLine() {
  const { pointA, pointB, markerA, markerB, straightDistance, routeGeometry } = useToolStore();

  if (!pointA) return null;

  const nameA = markerA?.tags?.name || 'Titik A';
  const nameB = markerB?.tags?.name || 'Titik B';

  return (
    <>
      {/* Point A marker */}
      <CircleMarker
        center={[pointA.lat, pointA.lng]}
        radius={8}
        pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 1, weight: 3 }}
      >
        <Tooltip permanent direction="top" offset={[0, -12]}>
          <span style={{ fontWeight: 600, fontSize: 11 }}>A: {nameA}</span>
        </Tooltip>
      </CircleMarker>

      {/* Point B marker */}
      {pointB && (
        <CircleMarker
          center={[pointB.lat, pointB.lng]}
          radius={8}
          pathOptions={{ color: '#EF4444', fillColor: '#EF4444', fillOpacity: 1, weight: 3 }}
        >
          <Tooltip permanent direction="top" offset={[0, -12]}>
            <span style={{ fontWeight: 600, fontSize: 11 }}>B: {nameB}</span>
          </Tooltip>
        </CircleMarker>
      )}

      {/* Straight line (dashed) */}
      {pointB && straightDistance !== null && (
        <Polyline
          positions={[[pointA.lat, pointA.lng], [pointB.lat, pointB.lng]]}
          pathOptions={{
            color: '#94A3B8',
            weight: 2.5,
            dashArray: '10, 8',
            opacity: 0.8,
          }}
        >
          <Tooltip permanent direction="center">
            <span style={{ fontSize: 11, fontWeight: 600 }}>
              ✦ {formatDistance(straightDistance)}
            </span>
          </Tooltip>
        </Polyline>
      )}

      {/* Road route (solid) */}
      {routeGeometry && (
        <GeoJSON
          key={`route-${pointA.lat}-${pointB?.lat}`}
          data={{
            type: 'Feature',
            properties: {},
            geometry: routeGeometry,
          } as any}
          style={{
            color: '#3B82F6',
            weight: 5,
            opacity: 0.8,
          }}
        />
      )}
    </>
  );
}
