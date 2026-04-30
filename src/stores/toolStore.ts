import { create } from 'zustand';
import type { ActiveTool, MeasureState, LatLng, MarkerData } from '../types';

interface ToolStore {
  activeTool: ActiveTool;
  measureState: MeasureState;
  pointA: LatLng | null;
  pointB: LatLng | null;
  markerA: MarkerData | null;
  markerB: MarkerData | null;
  straightDistance: number | null;
  routeDistance: number | null;
  routeDuration: number | null;
  routeGeometry: GeoJSON.LineString | null;
  isRoutingLoading: boolean;

  setTool: (tool: ActiveTool) => void;
  setPointA: (latlng: LatLng, marker: MarkerData) => void;
  setPointB: (latlng: LatLng, marker: MarkerData) => void;
  setRouteResult: (distance: number, duration: number, geometry: GeoJSON.LineString | null) => void;
  setStraightDistance: (d: number) => void;
  setRoutingLoading: (v: boolean) => void;
  resetMeasure: () => void;
}

export const useToolStore = create<ToolStore>((set) => ({
  activeTool: 'pan',
  measureState: 'idle',
  pointA: null,
  pointB: null,
  markerA: null,
  markerB: null,
  straightDistance: null,
  routeDistance: null,
  routeDuration: null,
  routeGeometry: null,
  isRoutingLoading: false,

  setTool: (tool) => {
    set({
      activeTool: tool,
      measureState: tool === 'measure' ? 'waiting_a' : 'idle',
      pointA: null,
      pointB: null,
      markerA: null,
      markerB: null,
      straightDistance: null,
      routeDistance: null,
      routeDuration: null,
      routeGeometry: null,
    });
  },

  setPointA: (latlng, marker) => {
    set({ pointA: latlng, markerA: marker, measureState: 'point_a' });
  },

  setPointB: (latlng, marker) => {
    set({ pointB: latlng, markerB: marker, measureState: 'complete' });
  },

  setStraightDistance: (d) => set({ straightDistance: d }),

  setRouteResult: (distance, duration, geometry) => {
    set({ routeDistance: distance, routeDuration: duration, routeGeometry: geometry, isRoutingLoading: false });
  },

  setRoutingLoading: (v) => set({ isRoutingLoading: v }),

  resetMeasure: () => {
    set({
      measureState: 'waiting_a',
      pointA: null,
      pointB: null,
      markerA: null,
      markerB: null,
      straightDistance: null,
      routeDistance: null,
      routeDuration: null,
      routeGeometry: null,
    });
  },
}));
