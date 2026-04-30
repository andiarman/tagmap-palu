import { useMapEvents } from 'react-leaflet';
import { useToolStore } from '../../stores/toolStore';

export default function MapEventHandler() {
  const { activeTool } = useToolStore();

  useMapEvents({
    click: () => {
      // In measure mode, do nothing on empty map click
      // Measurement is only done via marker clicks in ClusterGroup/TempMarkers
      if (activeTool === 'measure') {
        // Intentionally empty — prevent map interactions
        return;
      }
    },
  });

  return null;
}
