import { X, BarChart3, MapPin, Eye, EyeOff, Map, Trash2 } from 'lucide-react';
import { useAnalysisStore } from '../../stores/analysisStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { formatDistance } from '../../utils/format';
import type { ReachabilityResult } from '../../stores/analysisStore';

export default function AnalysisPanel() {
  const {
    selectedMarker, results, roads, isAnalyzing, error, showOverlay,
    isPanelMinimized,
    clearAnalysis, toggleOverlay, setPanelMinimized,
  } = useAnalysisStore();
  const { transportModes } = useSettingsStore();

  // Don't show if no marker selected for analysis
  if (!selectedMarker && !isAnalyzing) return null;

  const markerName = selectedMarker?.tags?.name || 'Titik Lokasi';

  // Count stats
  const countReachable = (modeId: string) =>
    results.filter(r => r.modes.find(m => m.modeId === modeId)?.reachable).length;

  // Group results
  const kecamatanResults = results.filter(r => r.adminArea.adminLevel === 6);
  const kelurahanResults = results.filter(r => r.adminArea.adminLevel === 7);

  if (isPanelMinimized) {
    return (
      <div className="analysis-minimized">
        <button className="am-open" onClick={() => setPanelMinimized(false)}>
          <BarChart3 size={15} />
          <span>Analisis Aktif: {markerName}</span>
        </button>
        <button className="am-close" onClick={clearAnalysis} title="Hapus Analisis">
          <Trash2 size={15} />
        </button>
      </div>
    );
  }

  return (
    <div className="analysis-overlay">
      <div className="analysis-panel">
        <div className="analysis-header">
          <h2>
            <BarChart3 size={18} />
            Analisis Pencapaian
          </h2>
          <button className="drawer-close" onClick={() => setPanelMinimized(true)} title="Sembunyikan Panel">
            <X size={18} />
          </button>
        </div>

        {/* Selected marker info */}
        <div className="analysis-marker-info">
          <MapPin size={16} />
          <div>
            <div className="ami-name">{markerName}</div>
            {selectedMarker && (
              <div className="ami-coord">
                {selectedMarker.lat.toFixed(5)}, {selectedMarker.lng.toFixed(5)}
              </div>
            )}
          </div>
        </div>

        {/* Map toggle */}
        {results.length > 0 && (
          <div className="analysis-actions">
            <button
              className={`map-overlay-toggle ${showOverlay ? 'active' : ''}`}
              onClick={toggleOverlay}
            >
              {showOverlay ? <EyeOff size={15} /> : <Eye size={15} />}
              <Map size={15} />
              {showOverlay ? 'Sembunyikan dari Peta' : 'Tampilkan di Peta'}
            </button>
          </div>
        )}

        {isAnalyzing && (
          <div className="analysis-loading">
            <div className="spinner" />
            <span>Mengambil data kecamatan/kelurahan sekitar...</span>
          </div>
        )}

        {error && (
          <div className="analysis-error">⚠️ {error}</div>
        )}

        {/* Results */}
        {results.length > 0 && !isAnalyzing && (
          <div className="analysis-body">
            {/* Legend */}
            <div className="analysis-legend">
              <span className="legend-title">Legenda:</span>
              {transportModes.map(m => (
                <span key={m.id} className="legend-item">
                  <span className="legend-dot" style={{ background: m.color }} />
                  {m.icon} ≤{formatDistance(m.maxDistanceKm)}
                </span>
              ))}
              <span className="legend-item">
                <span className="legend-dot" style={{ background: '#EF4444' }} />
                ✗ Tidak Terjangkau
              </span>
            </div>

            {/* Summary stats */}
            <div className="analysis-summary">
              {transportModes.map(mode => {
                const total = results.length;
                const reachable = countReachable(mode.id);
                const pct = total > 0 ? Math.round((reachable / total) * 100) : 0;
                return (
                  <div key={mode.id} className="summary-card">
                    <div className="sc-icon">{mode.icon}</div>
                    <div className="sc-label">{mode.label}</div>
                    <div className="sc-bar">
                      <div
                        className="sc-bar-fill"
                        style={{ width: `${pct}%`, background: mode.color }}
                      />
                    </div>
                    <div className="sc-stat">
                      <span style={{ color: mode.color, fontWeight: 700 }}>{reachable}</span>
                      <span className="sc-stat-sep">/</span>
                      <span>{total}</span>
                      <span className="sc-pct">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Kecamatan list */}
            {kecamatanResults.length > 0 && (
              <div className="analysis-section">
                <h3 className="analysis-section-title">🏛️ Kecamatan ({kecamatanResults.length})</h3>
                {kecamatanResults.map(r => (
                  <AreaRow key={r.adminArea.id} result={r} transportModes={transportModes} />
                ))}
              </div>
            )}

            {/* Kelurahan list */}
            {kelurahanResults.length > 0 && (
              <div className="analysis-section">
                <h3 className="analysis-section-title">📍 Kelurahan ({kelurahanResults.length})</h3>
                {kelurahanResults.map(r => (
                  <AreaRow key={r.adminArea.id} result={r} transportModes={transportModes} />
                ))}
              </div>
            )}

            {/* Roads list per mode */}
            {roads && roads.length > 0 && transportModes.map(mode => {
              const roadsInMode = roads.filter(r => r.distanceKm <= mode.maxDistanceKm);
              if (roadsInMode.length === 0) return null;

              return (
                <div key={`roads-${mode.id}`} className="analysis-section">
                  <h3 className="analysis-section-title" style={{ color: mode.color }}>
                    {mode.icon} Jalan Terjangkau - {mode.label} ({roadsInMode.length})
                  </h3>
                  <div className="scrollable-road-list">
                    {roadsInMode.map(road => (
                      <div key={road.id} className="road-item">
                        <span className="road-name">{road.name}</span>
                        <span className="road-dist">{formatDistance(road.distanceKm)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function AreaRow({ result, transportModes }: { result: ReachabilityResult; transportModes: import('../../stores/settingsStore').TransportMode[] }) {
  return (
    <div className="area-row">
      <div className="area-row-main">
        <span className="area-name">{result.adminArea.name}</span>
        <span className="area-dist">{formatDistance(result.distanceKm)}</span>
      </div>
      <div className="area-row-modes">
        {transportModes.map(mode => {
          const modeResult = result.modes.find(m => m.modeId === mode.id);
          const reachable = modeResult?.reachable ?? false;
          return (
            <span
              key={mode.id}
              className={`mode-badge ${reachable ? 'reachable' : 'unreachable'}`}
              style={reachable ? { borderColor: mode.color, color: mode.color } : {}}
              title={`${mode.label}: ${reachable ? '✅ Terjangkau' : '❌ Tidak'} (≤${formatDistance(mode.maxDistanceKm)})`}
            >
              {mode.icon} {reachable ? '✓' : '✗'}
            </span>
          );
        })}
      </div>
    </div>
  );
}
