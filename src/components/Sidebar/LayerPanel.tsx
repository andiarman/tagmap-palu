import { Layers, X, Plus } from 'lucide-react';
import { useLayerStore } from '../../stores/layerStore';
import { useSearchStore } from '../../stores/searchStore';
import { useUIStore } from '../../stores/uiStore';
import LayerItem from './LayerItem';

export default function LayerPanel() {
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
  const { layers, addLayer } = useLayerStore();
  const { tempMarkers, selectedTag, clearResults } = useSearchStore();

  const handleSaveLayer = () => {
    if (!selectedTag || tempMarkers.length === 0) return;
    addLayer(selectedTag.label, `${selectedTag.key}=${selectedTag.value}`, tempMarkers);
    clearResults();
  };

  const canSave = tempMarkers.length > 0 && selectedTag;

  return (
    <>
      <button className="sidebar-toggle" onClick={toggleSidebar} title="Layer Manager">
        <Layers size={20} />
      </button>

      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2><Layers size={16} /> Layer Manager</h2>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-content">
          {layers.length === 0 && !canSave && (
            <div className="empty-state">
              <div className="empty-icon">📍</div>
              <p>Belum ada layer.<br/>Cari lokasi dan simpan ke layer.</p>
            </div>
          )}

          {layers.map(layer => (
            <LayerItem key={layer.id} layer={layer} />
          ))}
        </div>

        <div className="sidebar-footer">
          <button
            className="save-layer-btn"
            disabled={!canSave}
            onClick={handleSaveLayer}
          >
            <Plus size={16} />
            {canSave
              ? `Simpan "${selectedTag?.label}" (${tempMarkers.length} titik)`
              : 'Cari lokasi untuk menyimpan layer'}
          </button>
        </div>
      </div>
    </>
  );
}
