import type { LatLng, RouteResult } from '../types';

export async function getRoute(a: LatLng, b: LatLng): Promise<RouteResult> {
  const url = `https://router.project-osrm.org/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson&steps=false`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OSRM error: ${res.status}`);
    const data = await res.json();

    if (data.code !== 'Ok' || !data.routes?.length) {
      throw new Error('Rute tidak ditemukan');
    }

    const route = data.routes[0];
    return {
      distance: route.distance / 1000,
      duration: route.duration,
      geometry: route.geometry,
    };
  } catch (err) {
    console.warn('OSRM routing failed:', err);
    return {
      distance: 0,
      duration: 0,
      geometry: null,
    };
  }
}
