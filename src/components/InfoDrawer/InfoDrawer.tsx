import { X, ExternalLink, Save, BarChart3 } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useToolStore } from '../../stores/toolStore';
import { useLayerStore } from '../../stores/layerStore';
import { useAnalysisStore } from '../../stores/analysisStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { fetchAdminAreas } from '../../services/adminBoundaries';
import { analyzeMarkerReachability, getMarkerBBox, fetchRoadsInBBox, analyzeRoadReachability } from '../../services/reachabilityAnalysis';
import { formatDistance, formatDuration, formatCoord } from '../../utils/format';

export default function InfoDrawer() {
  const { drawerOpen, drawerMode, selectedMarker, closeDrawer } = useUIStore();
  const {
    straightDistance, routeDistance, routeDuration, isRoutingLoading,
    markerA, markerB, routeGeometry, measureState, resetMeasure,
  } = useToolStore();
  const { addMeasurementLayer } = useLayerStore();
  const { startAnalysis, setResults, setError } = useAnalysisStore();
  const { transportModes } = useSettingsStore();

  const showRouteDrawer = drawerMode === 'route' && straightDistance !== null;
  const showMarkerDrawer = drawerMode === 'marker' && selectedMarker;

  const handleSaveMeasurement = () => {
    if (!markerA || !markerB || straightDistance === null) return;
    const nameA = markerA.tags?.name || 'Titik A';
    const nameB = markerB.tags?.name || 'Titik B';

    addMeasurementLayer(
      `${nameA} → ${nameB}`,
      [markerA, markerB],
      routeGeometry || null,
      {
        straightDistance: straightDistance,
        routeDistance: routeDistance || 0,
        routeDuration: routeDuration || 0,
      }
    );

    resetMeasure();
    closeDrawer();
  };

  const handleAnalyzeMarker = async () => {
    if (!selectedMarker) return;
    startAnalysis(selectedMarker);
    closeDrawer();

    try {
      // Use the largest transport mode range as the search radius
      const maxRange = Math.max(...transportModes.map(m => m.maxDistanceKm));
      const bbox = getMarkerBBox(selectedMarker, maxRange + 2); // +2km padding
      const [adminAreas, rawRoads] = await Promise.all([
        fetchAdminAreas(bbox),
        fetchRoadsInBBox(bbox)
      ]);

      if (adminAreas.length === 0 && rawRoads.length === 0) {
        setError('Tidak ditemukan data di sekitar titik ini.');
        return;
      }

      const results = analyzeMarkerReachability(selectedMarker, adminAreas, transportModes);
      const filteredResults = results
        .filter(r => r.distanceKm <= maxRange * 1.5) // Show areas up to 1.5x max range
        .sort((a, b) => a.distanceKm - b.distanceKm);

      const roads = analyzeRoadReachability(selectedMarker, rawRoads, maxRange);

      setResults(filteredResults, roads);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (!drawerOpen) return null;

  const nameA = markerA?.tags?.name || 'Titik A';
  const nameB = markerB?.tags?.name || 'Titik B';

  return (
    <div className={`info-drawer ${drawerOpen ? 'open' : ''}`}>
      <div className="drawer-handle" />

      {showMarkerDrawer && (
        <>
          <div className="drawer-header">
            <h3>📍 {selectedMarker.tags.name || 'Titik Lokasi'}</h3>
            <button className="drawer-close" onClick={closeDrawer}><X size={18} /></button>
          </div>
          <div className="drawer-body">
            <div className="marker-info-grid">
              {selectedMarker.tags.name && (
                <>
                  <span className="info-label">Nama</span>
                  <span className="info-value">{selectedMarker.tags.name}</span>
                </>
              )}
              {(selectedMarker.tags['addr:street'] || selectedMarker.tags['addr:city']) && (
                <>
                  <span className="info-label">Alamat</span>
                  <span className="info-value">
                    {[selectedMarker.tags['addr:street'], selectedMarker.tags['addr:housenumber'], selectedMarker.tags['addr:city']].filter(Boolean).join(', ')}
                  </span>
                </>
              )}
              {selectedMarker.tags.opening_hours && (
                <>
                  <span className="info-label">Jam Buka</span>
                  <span className="info-value">{selectedMarker.tags.opening_hours}</span>
                </>
              )}
              {selectedMarker.tags.phone && (
                <>
                  <span className="info-label">Telepon</span>
                  <span className="info-value">{selectedMarker.tags.phone}</span>
                </>
              )}
              {selectedMarker.tags.website && (
                <>
                  <span className="info-label">Website</span>
                  <span className="info-value">
                    <a href={selectedMarker.tags.website} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)' }}>
                      {selectedMarker.tags.website}
                    </a>
                  </span>
                </>
              )}
              <span className="info-label">Koordinat</span>
              <span className="info-value">{formatCoord(selectedMarker.lat, selectedMarker.lng)}</span>
            </div>

            <div className="drawer-actions">
              <a
                className="osm-link"
                href={`https://www.openstreetmap.org/node/${selectedMarker.id}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={12} /> Buka di OSM
              </a>
              <button className="analyze-marker-btn" onClick={handleAnalyzeMarker}>
                <BarChart3 size={14} />
                Analisis Pencapaian
              </button>
            </div>
          </div>
        </>
      )}

      {showRouteDrawer && (
        <>
          <div className="drawer-header">
            <h3>📏 Perbandingan Jarak</h3>
            <button className="drawer-close" onClick={closeDrawer}><X size={18} /></button>
          </div>
          <div className="drawer-body">
            {/* Show marker names */}
            <div className="route-endpoints">
              <div className="route-endpoint">
                <span className="endpoint-badge a">A</span>
                <span className="endpoint-name">{nameA}</span>
              </div>
              <div className="route-arrow">→</div>
              <div className="route-endpoint">
                <span className="endpoint-badge b">B</span>
                <span className="endpoint-name">{nameB}</span>
              </div>
            </div>

            <div className="route-comparison">
              <div className="route-card straight">
                <div className="rc-label">- - - Garis Lurus</div>
                <div className="rc-value">{formatDistance(straightDistance!)}</div>
                <div className="rc-sub">Haversine</div>
              </div>
              <div className="route-card road">
                <div className="rc-label">━━━ Jarak Tempuh</div>
                {isRoutingLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="spinner" />
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Menghitung rute...</span>
                  </div>
                ) : routeDistance ? (
                  <>
                    <div className="rc-value">{formatDistance(routeDistance)}</div>
                    <div className="rc-sub">{formatDuration(routeDuration || 0)}</div>
                  </>
                ) : (
                  <div className="rc-value" style={{ fontSize: 14, color: 'var(--text-muted)' }}>Rute tidak tersedia</div>
                )}
              </div>
            </div>

            {routeDistance && straightDistance && (
              <div className="route-summary">
                <span className="label">Selisih</span>
                <span className="value">
                  +{formatDistance(routeDistance - straightDistance)} ({Math.round(((routeDistance - straightDistance) / straightDistance) * 100)}%)
                </span>
              </div>
            )}

            {/* Save as Layer button */}
            {measureState === 'complete' && !isRoutingLoading && (
              <button className="save-measurement-btn" onClick={handleSaveMeasurement}>
                <Save size={15} />
                Simpan Pengukuran ke Layer
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
