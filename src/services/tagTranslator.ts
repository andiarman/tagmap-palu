import { osmTagDictionary } from '../data/osmTagDictionary';
import type { TagMapping } from '../types';

function normalize(str: string): string {
  return str.toLowerCase().trim().replace(/[^a-z0-9\s]/gi, '');
}

export function searchTags(query: string): TagMapping[] {
  const q = normalize(query);
  if (!q) return [];

  return osmTagDictionary
    .filter(tag => {
      const label = normalize(tag.label);
      const labelEn = normalize(tag.labelEn);
      return label.includes(q) || labelEn.includes(q) || q.includes(label) || q.includes(labelEn);
    })
    .slice(0, 8);
}

export function findBestTag(query: string): TagMapping | null {
  const q = normalize(query);
  if (!q) return null;

  // Exact match first
  const exact = osmTagDictionary.find(tag =>
    normalize(tag.label) === q || normalize(tag.labelEn) === q
  );
  if (exact) return exact;

  // Partial match
  const partial = osmTagDictionary.find(tag =>
    normalize(tag.label).includes(q) || normalize(tag.labelEn).includes(q)
  );
  return partial || null;
}

export function buildOverpassQuery(key: string, value: string, bbox: { south: number; west: number; north: number; east: number }): string {
  const { south, west, north, east } = bbox;
  
  // Special case for place_of_worship with religion filter
  let filter = `"${key}"="${value}"`;
  
  return `[out:json][timeout:25][bbox:${south},${west},${north},${east}];
(
  node[${filter}](${south},${west},${north},${east});
  way[${filter}](${south},${west},${north},${east});
);
out center body;`;
}
