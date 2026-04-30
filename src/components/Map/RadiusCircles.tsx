import { useMemo } from 'react';
import { GeoJSON } from 'react-leaflet';
import type { MapLayer } from '../../types';
import { createCircleGeoJSON } from '../../services/spatialCalc';

interface Props {
  layer: MapLayer;
}

export default function RadiusCircles({ layer }: Props) {
  const circles = useMemo(() => {
    if (layer.radiusMeters <= 0 || !layer.visible || !layer.showRadius) return null;
    
    const features = layer.markers.map(m => 
      createCircleGeoJSON({ lat: m.lat, lng: m.lng }, layer.radiusMeters)
    );

    return {
      type: 'FeatureCollection' as const,
      features,
    };
  }, [layer.markers, layer.radiusMeters, layer.visible, layer.showRadius, layer.color]);

  if (!circles) return null;

  return (
    <GeoJSON
      key={`radius-${layer.id}-${layer.radiusMeters}-${layer.color}`}
      data={circles as any}
      style={{
        color: layer.color,
        weight: 1.5,
        opacity: 0.4,
        fillColor: layer.color,
        fillOpacity: 0.1,
      }}
    />
  );
}
