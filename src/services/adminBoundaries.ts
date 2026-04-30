import type { BBox } from '../types';
import type { AdminArea } from '../stores/analysisStore';

export async function fetchAdminAreas(bbox: BBox): Promise<AdminArea[]> {
  // Fetch kecamatan (level 6) and kelurahan (level 7) from Overpass
  const { south, west, north, east } = bbox;

  const overpassQL = `[out:json][timeout:30][bbox:${south},${west},${north},${east}];
(
  relation["boundary"="administrative"]["admin_level"="6"](${south},${west},${north},${east});
  relation["boundary"="administrative"]["admin_level"="7"](${south},${west},${north},${east});
);
out center tags;`;

  try {
    const response = await queryOverpassRaw(overpassQL);
    return parseAdminAreas(response);
  } catch (err) {
    console.warn('Failed to fetch admin areas:', err);
    return [];
  }
}

async function queryOverpassRaw(overpassQL: string): Promise<any> {
  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(overpassQL)}`,
      });
      if (res.ok) return await res.json();
    } catch { /* try next */ }
  }
  throw new Error('Gagal mengambil data admin boundaries');
}

function parseAdminAreas(data: any): AdminArea[] {
  if (!data.elements) return [];

  // First pass: collect kecamatan names by ID for parent linking
  const kecamatanMap = new Map<number, string>();
  data.elements.forEach((el: any) => {
    if (el.tags?.admin_level === '6' && el.tags?.name) {
      kecamatanMap.set(el.id, el.tags.name);
    }
  });

  return data.elements
    .filter((el: any) => {
      const lat = el.center?.lat;
      const lon = el.center?.lon;
      return lat != null && lon != null && el.tags?.name;
    })
    .map((el: any) => {
      const adminLevel = parseInt(el.tags.admin_level, 10);
      const area: AdminArea = {
        id: el.id,
        name: el.tags.name,
        adminLevel,
        centerLat: el.center.lat,
        centerLng: el.center.lon,
      };

      // For kelurahan, try to find parent kecamatan
      // We can't reliably do this without sub-area queries, so leave parentName optional
      // It will be populated from the grouped display

      return area;
    });
}
