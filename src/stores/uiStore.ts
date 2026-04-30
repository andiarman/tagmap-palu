import { create } from 'zustand';
import type { MarkerData, DrawerMode } from '../types';

interface UIStore {
  sidebarOpen: boolean;
  drawerOpen: boolean;
  drawerMode: DrawerMode;
  selectedMarker: MarkerData | null;

  toggleSidebar: () => void;
  setSidebarOpen: (v: boolean) => void;
  openMarkerDrawer: (marker: MarkerData) => void;
  openRouteDrawer: () => void;
  closeDrawer: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  drawerOpen: false,
  drawerMode: null,
  selectedMarker: null,

  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),

  openMarkerDrawer: (marker) => set({ drawerOpen: true, drawerMode: 'marker', selectedMarker: marker }),
  openRouteDrawer: () => set({ drawerOpen: true, drawerMode: 'route' }),
  closeDrawer: () => set({ drawerOpen: false, selectedMarker: null }),
}));
