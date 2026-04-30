import { create } from 'zustand';
import type { MarkerData } from '../types';

export interface AdminArea {
  id: number;
  name: string;
  adminLevel: number; // 6 = kecamatan, 7 = kelurahan
  parentName?: string;
  centerLat: number;
  centerLng: number;
}

export interface RoadReachability {
  id: number;
  name: string;
  distanceKm: number;
  centerLat: number;
  centerLng: number;
}

export interface ReachabilityResult {
  adminArea: AdminArea;
  distanceKm: number;
  modes: { modeId: string; reachable: boolean }[];
}

interface AnalysisStore {
  /** The single marker being analyzed */
  selectedMarker: MarkerData | null;
  results: ReachabilityResult[];
  roads: RoadReachability[];
  showOverlay: boolean;
  isAnalyzing: boolean;
  error: string | null;
  isPanelMinimized: boolean;

  startAnalysis: (marker: MarkerData) => void;
  setResults: (results: ReachabilityResult[], roads: RoadReachability[]) => void;
  setError: (e: string | null) => void;
  toggleOverlay: () => void;
  clearAnalysis: () => void;
  setPanelMinimized: (v: boolean) => void;
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  selectedMarker: null,
  results: [],
  roads: [],
  showOverlay: true,
  isAnalyzing: false,
  error: null,
  isPanelMinimized: false,

  startAnalysis: (marker) => set({
    selectedMarker: marker,
    results: [],
    roads: [],
    isAnalyzing: true,
    error: null,
    showOverlay: true,
    isPanelMinimized: false,
  }),

  setResults: (results, roads) => set({ results, roads, isAnalyzing: false }),

  setError: (e) => set({ error: e, isAnalyzing: false }),

  toggleOverlay: () => set(s => ({ showOverlay: !s.showOverlay })),

  clearAnalysis: () => set({
    selectedMarker: null,
    results: [],
    roads: [],
    showOverlay: false,
    isAnalyzing: false,
    error: null,
    isPanelMinimized: false,
  }),

  setPanelMinimized: (v) => set({ isPanelMinimized: v }),
}));
