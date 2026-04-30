import { create } from 'zustand';

export interface TransportMode {
  id: string;
  label: string;
  icon: string;
  maxDistanceKm: number;
  color: string;
}

interface SettingsStore {
  transportModes: TransportMode[];
  settingsOpen: boolean;

  updateTransportDistance: (id: string, km: number) => void;
  toggleSettings: () => void;
  setSettingsOpen: (v: boolean) => void;
}

const DEFAULT_MODES: TransportMode[] = [
  { id: 'walking', label: 'Jalan Kaki', icon: '🚶', maxDistanceKm: 1.5, color: '#10B981' },
  { id: 'motorcycle', label: 'Motor', icon: '🏍️', maxDistanceKm: 5.0, color: '#F59E0B' },
  { id: 'public_transport', label: 'Angkutan Umum', icon: '🚌', maxDistanceKm: 10.0, color: '#3B82F6' },
  { id: 'car', label: 'Mobil', icon: '🚗', maxDistanceKm: 15.0, color: '#EF4444' },
];

export const useSettingsStore = create<SettingsStore>((set) => ({
  transportModes: DEFAULT_MODES,
  settingsOpen: false,

  updateTransportDistance: (id, km) => {
    set(state => ({
      transportModes: state.transportModes.map(m =>
        m.id === id ? { ...m, maxDistanceKm: km } : m
      ),
    }));
  },

  toggleSettings: () => set(s => ({ settingsOpen: !s.settingsOpen })),
  setSettingsOpen: (v) => set({ settingsOpen: v }),
}));
