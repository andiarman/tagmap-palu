import type { MarkerData } from '../types';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

let currentEndpointIndex = 0;

function rotateEndpoint() {
  currentEndpointIndex = (currentEndpointIndex + 1) % OVERPASS_ENDPOINTS.length;
}

export async function queryOverpass(overpassQL: string): Promise<MarkerData[]> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < OVERPASS_ENDPOINTS.length; attempt++) {
    const endpoint = OVERPASS_ENDPOINTS[currentEndpointIndex];
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(overpassQL)}`,
      });

      if (!response.ok) {
        rotateEndpoint();
        lastError = new Error(`HTTP ${response.status} from ${endpoint}`);
        continue;
      }

      const data = await response.json();
      return parseOverpassResponse(data);
    } catch (err) {
      lastError = err as Error;
      rotateEndpoint();
    }
  }

  throw lastError || new Error('Semua endpoint Overpass gagal');
}

function parseOverpassResponse(data: any): MarkerData[] {
  if (!data.elements) return [];

  return data.elements
    .map((el: any) => {
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;
      if (lat == null || lng == null) return null;
      return {
        id: el.id,
        lat,
        lng,
        tags: el.tags || {},
      } as MarkerData;
    })
    .filter(Boolean) as MarkerData[];
}
