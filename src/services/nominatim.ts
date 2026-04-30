import type { LatLng, BBox } from '../types';

interface NominatimResult {
  center: LatLng;
  bbox: BBox;
  displayName: string;
}

export async function geocodeLocation(query: string): Promise<NominatimResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=0`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'TagMapSpatial/1.0' },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.length) return null;

    const item = data[0];
    // Nominatim boundingbox = [south, north, west, east]
    const bb = item.boundingbox.map(Number);

    return {
      center: { lat: Number(item.lat), lng: Number(item.lon) },
      bbox: { south: bb[0], north: bb[1], west: bb[2], east: bb[3] },
      displayName: item.display_name,
    };
  } catch (err) {
    console.warn('Nominatim geocode failed:', err);
    return null;
  }
}
