import * as turf from '@turf/turf';
import type { MarkerData, BBox } from '../types';
import type { AdminArea, ReachabilityResult, RoadReachability } from '../stores/analysisStore';
import type { TransportMode } from '../stores/settingsStore';

export function analyzeMarkerReachability(
  marker: MarkerData,
  adminAreas: AdminArea[],
  transportModes: TransportMode[]
): ReachabilityResult[] {
  if (adminAreas.length === 0) return [];

  const markerPoint = turf.point([marker.lng, marker.lat]);

  return adminAreas.map(area => {
    const areaPoint = turf.point([area.centerLng, area.centerLat]);
    const dist = turf.distance(markerPoint, areaPoint, { units: 'kilometers' });

    const modes = transportModes.map(mode => ({
      modeId: mode.id,
      reachable: dist <= mode.maxDistanceKm,
    }));

    return {
      adminArea: area,
      distanceKm: Math.round(dist * 100) / 100,
      modes,
    };
  });
}

export function getMarkerBBox(marker: MarkerData, radiusKm: number): BBox {
  // Convert km to approximate degrees (1 degree ≈ 111km)
  const pad = radiusKm / 111;
  return {
    south: marker.lat - pad,
    west: marker.lng - pad,
    north: marker.lat + pad,
    east: marker.lng + pad,
  };
}

export async function fetchRoadsInBBox(bbox: BBox): Promise<RoadReachability[]> {
  const { south, west, north, east } = bbox;
  // Overpass QL to fetch ways with highway tag and a name
  const overpassQL = `[out:json][timeout:30][bbox:${south},${west},${north},${east}];
way["highway"]["name"](${south},${west},${north},${east});
out center;`;

  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  ];

  let data = null;
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(overpassQL)}`,
      });
      if (res.ok) {
        data = await res.json();
        break;
      }
    } catch { /* try next */ }
  }

  if (!data || !data.elements) return [];

  // Parse distinct road names to avoid duplicates if same street is broken into many segments
  // We'll keep the one segment (or just merge them, but keeping the closest would happen later).
  // For simplicity, we just parse them all and let analyzeRoadReachability filter/sort.
  const roads: RoadReachability[] = [];
  const nameSet = new Set<string>();

  for (const el of data.elements) {
    if (el.tags?.name && el.center?.lat && el.center?.lon) {
      if (!nameSet.has(el.tags.name)) {
        nameSet.add(el.tags.name);
        roads.push({
          id: el.id,
          name: el.tags.name,
          distanceKm: 0, // will be calculated later
          centerLat: el.center.lat,
          centerLng: el.center.lon,
        });
      }
    }
  }

  return roads;
}

export function analyzeRoadReachability(
  marker: MarkerData,
  roads: RoadReachability[],
  maxDistanceKm: number
): RoadReachability[] {
  if (roads.length === 0) return [];

  const markerPoint = turf.point([marker.lng, marker.lat]);

  const analyzed = roads.map(road => {
    const roadPoint = turf.point([road.centerLng, road.centerLat]);
    const dist = turf.distance(markerPoint, roadPoint, { units: 'kilometers' });
    return {
      ...road,
      distanceKm: Math.round(dist * 100) / 100,
    };
  });

  return analyzed
    .filter(r => r.distanceKm <= maxDistanceKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
