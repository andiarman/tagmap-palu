import { create } from 'zustand';
import type { MarkerData, TagMapping, BBox } from '../types';
import { findBestTag, buildOverpassQuery } from '../services/tagTranslator';
import { queryOverpass } from '../services/overpass';
import { geocodeLocation } from '../services/nominatim';

type SearchStep = 'tag' | 'location';

const PALU_BBOX: BBox = { south: -1.0, west: 119.7, north: -0.75, east: 120.0 };

function intersectBbox(a: BBox, b: BBox): BBox | null {
  const south = Math.max(a.south, b.south);
  const north = Math.min(a.north, b.north);
  const west = Math.max(a.west, b.west);
  const east = Math.min(a.east, b.east);

  if (south > north || west > east) return null;
  return { south, west, north, east };
}

interface SearchStore {
  step: SearchStep;
  tagQuery: string;
  selectedTag: TagMapping | null;
  locationQuery: string;
  locationName: string | null;
  tempMarkers: MarkerData[];
  isLoading: boolean;
  error: string | null;

  setTagQuery: (q: string) => void;
  selectTag: (tag: TagMapping) => void;
  clearTag: () => void;
  setLocationQuery: (q: string) => void;
  executeSearch: (fallbackBbox: BBox, flyTo?: (bbox: BBox) => void) => Promise<void>;
  clearResults: () => void;
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  step: 'tag',
  tagQuery: '',
  selectedTag: null,
  locationQuery: '',
  locationName: null,
  tempMarkers: [],
  isLoading: false,
  error: null,

  setTagQuery: (q) => {
    set({ tagQuery: q, error: null });
  },

  selectTag: (tag) => {
    set({ selectedTag: tag, step: 'location', tagQuery: '', error: null });
  },

  clearTag: () => {
    set({ selectedTag: null, step: 'tag', tagQuery: '', locationQuery: '', locationName: null, tempMarkers: [], error: null });
  },

  setLocationQuery: (q) => {
    set({ locationQuery: q, error: null });
  },

  executeSearch: async (fallbackBbox, flyTo) => {
    const { selectedTag, locationQuery } = get();

    // If no tag selected, try to match from tagQuery
    let tag = selectedTag;
    if (!tag) {
      const { tagQuery } = get();
      tag = findBestTag(tagQuery);
      if (!tag) {
        set({ error: 'Pilih jenis lokasi terlebih dahulu.', tempMarkers: [] });
        return;
      }
      set({ selectedTag: tag, step: 'location' });
    }

    set({ isLoading: true, error: null });

    try {
      let bbox = fallbackBbox;

      // If location query provided, geocode it first
      if (locationQuery.trim()) {
        const geo = await geocodeLocation(locationQuery.trim());
        if (!geo) {
          set({ error: `Lokasi "${locationQuery}" tidak ditemukan.`, isLoading: false });
          return;
        }
        
        // Ensure the geocoded location intersects with Palu
        const intersection = intersectBbox(geo.bbox, PALU_BBOX);
        if (!intersection) {
          set({ error: `Lokasi "${locationQuery}" berada di luar batas layanan (Kota Palu).`, isLoading: false });
          return;
        }
        bbox = intersection;
        set({ locationName: geo.displayName });

        // Fly map to the geocoded area
        if (flyTo) flyTo(bbox);
      } else {
        // Tag search based on current map view (fallbackBbox)
        // If current map view is outside Palu, redirect to Palu
        const intersection = intersectBbox(bbox, PALU_BBOX);
        if (!intersection) {
          bbox = PALU_BBOX;
          if (flyTo) flyTo(bbox);
        } else {
          bbox = intersection; // limit search within Palu only
        }
      }

      const overpassQL = buildOverpassQuery(tag.key, tag.value, bbox);
      const markers = await queryOverpass(overpassQL);
      if (markers.length === 0) {
        set({ error: 'Tidak ada hasil di area ini.', tempMarkers: [], isLoading: false });
        return;
      }
      set({ tempMarkers: markers, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, tempMarkers: [], isLoading: false });
    }
  },

  clearResults: () => {
    set({
      step: 'tag',
      tagQuery: '',
      selectedTag: null,
      locationQuery: '',
      locationName: null,
      tempMarkers: [],
      error: null,
    });
  },
}));
