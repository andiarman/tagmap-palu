import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import { useSearchStore } from '../../stores/searchStore';
import { useUIStore } from '../../stores/uiStore';
import { useToolStore } from '../../stores/toolStore';
import { calculateStraightDistance } from '../../services/spatialCalc';
import { getRoute } from '../../services/osrm';

async function handleMeasureMarkerClick(markerData: import('../../types').MarkerData) {
  const store = useToolStore.getState();
  const uiStore = useUIStore.getState();
  const latlng = { lat: markerData.lat, lng: markerData.lng };

  if (store.measureState === 'waiting_a') {
    store.setPointA(latlng, markerData);
  } else if (store.measureState === 'point_a') {
    store.setPointB(latlng, markerData);

    const pointA = useToolStore.getState().pointA!;
    const straight = calculateStraightDistance(pointA, latlng);
    store.setStraightDistance(straight);
    uiStore.openRouteDrawer();

    store.setRoutingLoading(true);
    try {
      const result = await getRoute(pointA, latlng);
      store.setRouteResult(result.distance, result.duration, result.geometry);
    } catch {
      store.setRouteResult(0, 0, null);
    }
  }
}

export default function TempMarkers() {
  const map = useMap();
  const clusterRef = useRef<any>(null);
  const { tempMarkers } = useSearchStore();
  const { openMarkerDrawer } = useUIStore();

  useEffect(() => {
    if (clusterRef.current) {
      map.removeLayer(clusterRef.current);
      clusterRef.current = null;
    }

    if (tempMarkers.length === 0) return;

    const cluster = L.markerClusterGroup({
      maxClusterRadius: 50,
      iconCreateFunction: (c: any) => {
        const count = c.getChildCount();
        return L.divIcon({
          html: `<div style="
            background: #64748B;
            color: white;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 700;
            font-family: Inter, sans-serif;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            border: 2px dashed rgba(255,255,255,0.5);
          ">${count}</div>`,
          className: 'temp-cluster',
          iconSize: L.point(34, 34),
        });
      },
      showCoverageOnHover: false,
    });

    const icon = L.divIcon({
      className: 'temp-marker',
      html: `<div style="
        width: 10px;
        height: 10px;
        background: #94A3B8;
        border: 2px dashed white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [10, 10],
      iconAnchor: [5, 5],
    });

    tempMarkers.forEach(m => {
      const marker = L.marker([m.lat, m.lng], { icon });
      if (m.tags.name) {
        marker.bindTooltip(m.tags.name, { direction: 'top', offset: [0, -6] });
      }
      marker.on('click', () => {
        const { activeTool } = useToolStore.getState();
        if (activeTool === 'measure') {
          handleMeasureMarkerClick(m);
        } else {
          openMarkerDrawer(m);
        }
      });
      cluster.addLayer(marker);
    });

    map.addLayer(cluster);
    clusterRef.current = cluster;

    // Fit bounds to show all results
    if (tempMarkers.length > 0) {
      const bounds = L.latLngBounds(tempMarkers.map(m => [m.lat, m.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [60, 60] });
    }

    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current);
        clusterRef.current = null;
      }
    };
  }, [map, tempMarkers]);

  return null;
}
