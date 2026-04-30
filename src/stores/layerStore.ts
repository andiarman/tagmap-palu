import { create } from 'zustand';
import type { MapLayer, MarkerData } from '../types';
import { LAYER_COLORS } from '../data/osmTagDictionary';
import { generateId } from '../utils/format';

interface LayerStore {
  layers: MapLayer[];
  activeLayerId: string | null;

  addLayer: (name: string, osmTag: string, markers: MarkerData[]) => void;
  addMeasurementLayer: (
    name: string,
    markers: MarkerData[],
    routeGeometry: GeoJSON.LineString | null,
    measurementData: { straightDistance: number; routeDistance: number; routeDuration: number }
  ) => void;
  removeLayer: (id: string) => void;
  toggleVisibility: (id: string) => void;
  updateRadius: (id: string, meters: number) => void;
  toggleRadius: (id: string) => void;
  updateColor: (id: string, color: string) => void;
  setActiveLayer: (id: string | null) => void;
}

export const useLayerStore = create<LayerStore>((set, get) => ({
  layers: [],
  activeLayerId: null,

  addLayer: (name, osmTag, markers) => {
    const { layers } = get();
    const colorIndex = layers.length % LAYER_COLORS.length;
    const newLayer: MapLayer = {
      id: generateId(),
      name,
      color: LAYER_COLORS[colorIndex],
      osmTag,
      markers,
      visible: true,
      radiusMeters: 0,
      showRadius: true,
      locked: false,
      createdAt: Date.now(),
      layerType: 'poi',
    };
    set({ layers: [...layers, newLayer] });
  },

  addMeasurementLayer: (name, markers, routeGeometry, measurementData) => {
    const { layers } = get();
    const colorIndex = layers.length % LAYER_COLORS.length;
    const newLayer: MapLayer = {
      id: generateId(),
      name,
      color: LAYER_COLORS[colorIndex],
      osmTag: '',
      markers,
      visible: true,
      radiusMeters: 0,
      showRadius: false,
      locked: false,
      createdAt: Date.now(),
      layerType: 'measurement',
      routeGeometry,
      measurementData,
    };
    set({ layers: [...layers, newLayer] });
  },

  removeLayer: (id) => {
    set(state => ({
      layers: state.layers.filter(l => l.id !== id),
      activeLayerId: state.activeLayerId === id ? null : state.activeLayerId,
    }));
  },

  toggleVisibility: (id) => {
    set(state => ({
      layers: state.layers.map(l =>
        l.id === id ? { ...l, visible: !l.visible } : l
      ),
    }));
  },

  updateRadius: (id, meters) => {
    set(state => ({
      layers: state.layers.map(l =>
        l.id === id ? { ...l, radiusMeters: meters } : l
      ),
    }));
  },

  toggleRadius: (id) => {
    set(state => ({
      layers: state.layers.map(l =>
        l.id === id ? { ...l, showRadius: !l.showRadius } : l
      ),
    }));
  },

  updateColor: (id, color) => {
    set(state => ({
      layers: state.layers.map(l =>
        l.id === id ? { ...l, color } : l
      ),
    }));
  },

  setActiveLayer: (id) => {
    set({ activeLayerId: id });
  },
}));
