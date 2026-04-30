import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import type { MapLayer } from '../../types';
import { useUIStore } from '../../stores/uiStore';
import { useToolStore } from '../../stores/toolStore';
import { calculateStraightDistance } from '../../services/spatialCalc';
import { getRoute } from '../../services/osrm';

declare module 'leaflet' {
  function markerClusterGroup(options?: any): any;
}

interface Props {
  layer: MapLayer;
}

function createColorIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 12px;
      height: 12px;
      background: ${color};
      border: 2.5px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

function createClusterIcon(color: string) {
  return (cluster: any) => {
    const count = cluster.getChildCount();
    return L.divIcon({
      html: `<div style="
        background: ${color};
        color: white;
        width: ${count > 99 ? 42 : 34}px;
        height: ${count > 99 ? 42 : 34}px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 700;
        font-family: Inter, sans-serif;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2.5px solid rgba(255,255,255,0.7);
      ">${count}</div>`,
      className: 'custom-cluster',
      iconSize: L.point(count > 99 ? 42 : 34, count > 99 ? 42 : 34),
    });
  };
}

async function handleMeasureMarkerClick(markerData: import('../../types').MarkerData) {
  const store = useToolStore.getState();
  const uiStore = useUIStore.getState();
  const latlng = { lat: markerData.lat, lng: markerData.lng };

  if (store.measureState === 'waiting_a') {
    store.setPointA(latlng, markerData);
  } else if (store.measureState === 'point_a') {
    store.setPointB(latlng, markerData);

    // Calculate straight distance
    const pointA = useToolStore.getState().pointA!;
    const straight = calculateStraightDistance(pointA, latlng);
    store.setStraightDistance(straight);
    uiStore.openRouteDrawer();

    // Fetch road route
    store.setRoutingLoading(true);
    try {
      const result = await getRoute(pointA, latlng);
      store.setRouteResult(result.distance, result.duration, result.geometry);
    } catch {
      store.setRouteResult(0, 0, null);
    }
  }
}

export default function ClusterGroup({ layer }: Props) {
  const map = useMap();
  const clusterRef = useRef<any>(null);
  const { openMarkerDrawer } = useUIStore();

  useEffect(() => {
    if (!layer.visible) {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current);
        clusterRef.current = null;
      }
      return;
    }

    // Remove old cluster
    if (clusterRef.current) {
      map.removeLayer(clusterRef.current);
    }

    const cluster = L.markerClusterGroup({
      maxClusterRadius: 50,
      iconCreateFunction: createClusterIcon(layer.color),
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      animate: true,
    });

    const icon = createColorIcon(layer.color);

    layer.markers.forEach(m => {
      const marker = L.marker([m.lat, m.lng], { icon });
      
      if (m.tags.name) {
        marker.bindTooltip(m.tags.name, {
          direction: 'top',
          offset: [0, -8],
          className: 'marker-tooltip',
        });
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

    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current);
        clusterRef.current = null;
      }
    };
  }, [map, layer.markers, layer.color, layer.visible, layer.id]);

  return null;
}
