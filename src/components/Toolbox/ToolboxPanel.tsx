import { MousePointer2, Ruler, Eraser, Settings } from 'lucide-react';
import { useToolStore } from '../../stores/toolStore';
import { useSettingsStore } from '../../stores/settingsStore';

export default function ToolboxPanel() {
  const { activeTool, setTool, resetMeasure, measureState } = useToolStore();
  const { toggleSettings } = useSettingsStore();

  return (
    <div className="toolbox">
      <button
        className={`tool-btn ${activeTool === 'pan' ? 'active' : ''}`}
        onClick={() => setTool('pan')}
        title="Mode Geser Peta"
      >
        <MousePointer2 size={20} />
      </button>
      <button
        className={`tool-btn ${activeTool === 'measure' ? 'active' : ''}`}
        onClick={() => setTool('measure')}
        title="Mode Ukur Jarak"
      >
        <Ruler size={20} />
      </button>
      {activeTool === 'measure' && measureState !== 'idle' && (
        <button
          className="tool-btn"
          onClick={resetMeasure}
          title="Reset Pengukuran"
        >
          <Eraser size={20} />
        </button>
      )}
      <div className="toolbox-divider" />
      <button
        className="tool-btn"
        onClick={toggleSettings}
        title="Pengaturan Jarak Tempuh"
      >
        <Settings size={20} />
      </button>
    </div>
  );
}
