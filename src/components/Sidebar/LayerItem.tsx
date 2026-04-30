import { useState } from 'react';
import { Eye, EyeOff, Trash2, Ruler } from 'lucide-react';
import type { MapLayer } from '../../types';
import { useLayerStore } from '../../stores/layerStore';
import { LAYER_COLORS } from '../../data/osmTagDictionary';
import { formatDistance } from '../../utils/format';

interface Props {
  layer: MapLayer;
}

export default function LayerItem({ layer }: Props) {
  const { removeLayer, toggleVisibility, updateRadius, updateColor } = useLayerStore();
  const [showColorPicker, setShowColorPicker] = useState(false);

  const isMeasurement = layer.layerType === 'measurement';

  return (
    <div className="layer-item">
      <div className="layer-item-header">
        <div style={{ position: 'relative' }}>
          <div
            className="layer-color-dot"
            style={{ background: layer.color }}
            onClick={() => setShowColorPicker(!showColorPicker)}
          />
          {showColorPicker && (
            <div className="color-picker-popup">
              {LAYER_COLORS.map(c => (
                <div
                  key={c}
                  className={`color-option ${c === layer.color ? 'active' : ''}`}
                  style={{ background: c }}
                  onClick={() => { updateColor(layer.id, c); setShowColorPicker(false); }}
                />
              ))}
            </div>
          )}
        </div>
        <span className="layer-item-name">
          {isMeasurement && <Ruler size={12} style={{ marginRight: 4, opacity: 0.6 }} />}
          {layer.name}
        </span>
        <span className="layer-item-count">
          {isMeasurement ? '📏' : layer.markers.length}
        </span>
        <div className="layer-item-actions">
          <button className="layer-action-btn" onClick={() => toggleVisibility(layer.id)} title={layer.visible ? 'Sembunyikan' : 'Tampilkan'}>
            {layer.visible ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
          <button className="layer-action-btn danger" onClick={() => removeLayer(layer.id)} title="Hapus layer">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Measurement layer: show distance summary */}
      {isMeasurement && layer.measurementData && (
        <div className="measurement-summary">
          <div className="ms-row">
            <span className="ms-label">Garis Lurus</span>
            <span className="ms-value">{formatDistance(layer.measurementData.straightDistance)}</span>
          </div>
          {layer.measurementData.routeDistance > 0 && (
            <div className="ms-row">
              <span className="ms-label">Jarak Tempuh</span>
              <span className="ms-value">{formatDistance(layer.measurementData.routeDistance)}</span>
            </div>
          )}
        </div>
      )}

      {/* POI layer: show radius control */}
      {!isMeasurement && (
        <div className="radius-control">
          <div className="radius-label">
            <span>Radius Buffer</span>
            <span className="radius-value">{layer.radiusMeters === 0 ? 'Off' : formatDistance(layer.radiusMeters / 1000)}</span>
          </div>
          <input
            type="range"
            className="radius-slider"
            min={0}
            max={10000}
            step={100}
            value={layer.radiusMeters}
            onChange={(e) => updateRadius(layer.id, Number(e.target.value))}
            style={{
              background: `linear-gradient(to right, ${layer.color} ${(layer.radiusMeters / 10000) * 100}%, var(--bg-elevated) ${(layer.radiusMeters / 10000) * 100}%)`,
            }}
          />
        </div>
      )}
    </div>
  );
}
