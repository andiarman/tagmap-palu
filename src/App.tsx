import MapCanvas from './components/Map/MapCanvas';
import LayerPanel from './components/Sidebar/LayerPanel';
import ToolboxPanel from './components/Toolbox/ToolboxPanel';
import InfoDrawer from './components/InfoDrawer/InfoDrawer';
import SettingsPanel from './components/Settings/SettingsPanel';
import AnalysisPanel from './components/Analysis/AnalysisPanel';
import { useToolStore } from './stores/toolStore';

function MeasureHint() {
  const { activeTool, measureState } = useToolStore();
  if (activeTool !== 'measure') return null;

  const hints: Record<string, string> = {
    waiting_a: '📍 Klik marker pertama (A) di peta',
    point_a: '📍 Klik marker kedua (B) untuk mengukur jarak',
  };

  const hint = hints[measureState];
  if (!hint) return null;

  return <div className="measure-hint">{hint}</div>;
}

export default function App() {
  return (
    <div className="app-container">
      <MapCanvas />
      <LayerPanel />
      <ToolboxPanel />
      <InfoDrawer />
      <SettingsPanel />
      <AnalysisPanel />
      <MeasureHint />
    </div>
  );
}
