import * as turf from '@turf/turf';
import type { LatLng } from '../types';

export function calculateStraightDistance(a: LatLng, b: LatLng): number {
  const from = turf.point([a.lng, a.lat]);
  const to = turf.point([b.lng, b.lat]);
  return turf.distance(from, to, { units: 'kilometers' });
}

export function createCircleGeoJSON(center: LatLng, radiusMeters: number): GeoJSON.Feature {
  const point = turf.point([center.lng, center.lat]);
  return turf.circle(point, radiusMeters / 1000, { units: 'kilometers', steps: 64 });
}
