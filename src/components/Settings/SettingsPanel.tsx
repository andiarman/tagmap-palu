import { X, SlidersHorizontal } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { formatDistance } from '../../utils/format';

export default function SettingsPanel() {
  const { settingsOpen, setSettingsOpen, transportModes, updateTransportDistance } = useSettingsStore();

  if (!settingsOpen) return null;

  return (
    <div className="settings-overlay" onClick={() => setSettingsOpen(false)}>
      <div className="settings-panel" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h2><SlidersHorizontal size={18} /> Pengaturan Jarak Tempuh</h2>
          <button className="drawer-close" onClick={() => setSettingsOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <p className="settings-desc">
          Atur jarak maksimum untuk setiap moda transportasi. 
          Nilai ini digunakan untuk analisis pencapaian per kecamatan/kelurahan.
        </p>

        <div className="settings-body">
          {transportModes.map(mode => (
            <div key={mode.id} className="setting-item">
              <div className="setting-label">
                <span className="setting-icon">{mode.icon}</span>
                <span className="setting-name">{mode.label}</span>
                <span className="setting-value" style={{ color: mode.color }}>
                  {formatDistance(mode.maxDistanceKm)}
                </span>
              </div>
              <input
                type="range"
                className="setting-slider"
                min={0.5}
                max={mode.id === 'walking' ? 5 : mode.id === 'motorcycle' ? 20 : 30}
                step={0.5}
                value={mode.maxDistanceKm}
                onChange={e => updateTransportDistance(mode.id, Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, ${mode.color} ${
                    ((mode.maxDistanceKm - 0.5) / ((mode.id === 'walking' ? 5 : mode.id === 'motorcycle' ? 20 : 30) - 0.5)) * 100
                  }%, var(--bg-elevated) ${
                    ((mode.maxDistanceKm - 0.5) / ((mode.id === 'walking' ? 5 : mode.id === 'motorcycle' ? 20 : 30) - 0.5)) * 100
                  }%)`,
                }}
              />
              <div className="setting-range-labels">
                <span>0.5 km</span>
                <span>{mode.id === 'walking' ? '5' : mode.id === 'motorcycle' ? '20' : '30'} km</span>
              </div>
            </div>
          ))}
        </div>

        <div className="settings-footer">
          <p className="settings-note">
            💡 Nilai default dihitung berdasarkan rata-rata kondisi jalan perkotaan Indonesia. 
            Sesuaikan dengan kondisi topografi dan infrastruktur lokal.
          </p>
        </div>
      </div>
    </div>
  );
}
