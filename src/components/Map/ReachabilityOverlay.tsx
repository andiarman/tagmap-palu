import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAnalysisStore } from '../../stores/analysisStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { formatDistance } from '../../utils/format';
import type { ReachabilityResult } from '../../stores/analysisStore';
import type { TransportMode } from '../../stores/settingsStore';

function getReachColor(result: ReachabilityResult): string {
  const walk = result.modes.find(m => m.modeId === 'walking')?.reachable;
  const motor = result.modes.find(m => m.modeId === 'motorcycle')?.reachable;
  const transit = result.modes.find(m => m.modeId === 'public_transport')?.reachable;
  if (walk) return '#10B981';
  if (motor) return '#F59E0B';
  if (transit) return '#3B82F6';
  return '#EF4444';
}

function buildModes(result: ReachabilityResult, modes: TransportMode[]): string {
  return modes.map(mode => {
    const r = result.modes.find(m => m.modeId === mode.id)?.reachable;
    return `<span class="ri ${r ? 'ri-yes' : 'ri-no'}" style="${r ? `color:${mode.color}` : ''}">${mode.icon}${r ? '✓' : '✗'}</span>`;
  }).join('');
}

export default function ReachabilityOverlay() {
  const map = useMap();
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const { selectedMarker, results, showOverlay } = useAnalysisStore();
  const { transportModes } = useSettingsStore();

  useEffect(() => {
    // Clear previous
    if (layerGroupRef.current) {
      map.removeLayer(layerGroupRef.current);
      layerGroupRef.current = null;
    }

    if (!selectedMarker || !showOverlay || results.length === 0) return;

    const group = L.layerGroup();
    const center: L.LatLngExpression = [selectedMarker.lat, selectedMarker.lng];

    // ── 1. Concentric range circles (largest first for correct z-order) ──
    const sortedModes = [...transportModes].sort((a, b) => b.maxDistanceKm - a.maxDistanceKm);
    sortedModes.forEach(mode => {
      const radiusMeters = mode.maxDistanceKm * 1000;
      const circle = L.circle(center, {
        radius: radiusMeters,
        color: mode.color,
        weight: 1.5,
        opacity: 0.6,
        fillColor: mode.color,
        fillOpacity: 0.04,
        dashArray: '8, 6',
        interactive: false,
      });
      group.addLayer(circle);

      // Range label at the edge of each circle
      const labelAngle = mode.id === 'walking' ? 45 : mode.id === 'motorcycle' ? 90 : 135;
      const radians = (labelAngle * Math.PI) / 180;
      const degreesPerMeter = 1 / 111320;
      const labelLat = selectedMarker.lat + (radiusMeters * degreesPerMeter * Math.cos(radians));
      const labelLng = selectedMarker.lng + (radiusMeters * degreesPerMeter * Math.sin(radians)) / Math.cos(selectedMarker.lat * Math.PI / 180);

      const labelIcon = L.divIcon({
        className: 'range-label',
        html: `<span class="rl-badge" style="background:${mode.color}">${mode.icon} ${formatDistance(mode.maxDistanceKm)}</span>`,
        iconSize: [80, 20],
        iconAnchor: [40, 10],
      });
      const labelMarker = L.marker([labelLat, labelLng], { icon: labelIcon, interactive: false });
      group.addLayer(labelMarker);
    });

    // ── 2. Center marker highlight (pulsing) ──
    const centerIcon = L.divIcon({
      className: 'reach-center-marker',
      html: `<div class="rcm-dot"><div class="rcm-pulse"></div></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
    group.addLayer(L.marker(center, { icon: centerIcon, interactive: false }));

    // ── 3. Admin area markers with connector lines ──
    results.forEach(result => {
      const color = getReachColor(result);
      const adminPos: L.LatLngExpression = [result.adminArea.centerLat, result.adminArea.centerLng];
      const isKec = result.adminArea.adminLevel === 6;

      // Connector line
      const line = L.polyline([center, adminPos], {
        color,
        weight: 1.5,
        dashArray: '5, 4',
        opacity: 0.4,
      });
      group.addLayer(line);

      // Admin label card
      const modeHtml = buildModes(result, transportModes);
      const icon = L.divIcon({
        className: 'reach-overlay-marker',
        html: `
          <div class="rom-card" style="border-color: ${color}">
            <div class="rom-header">
              <span class="rom-level">${isKec ? 'Kec.' : 'Kel.'}</span>
              <span class="rom-name">${result.adminArea.name}</span>
            </div>
            <div class="rom-modes">${modeHtml}</div>
            <div class="rom-dist" style="color: ${color}">${formatDistance(result.distanceKm)}</div>
          </div>
        `,
        iconSize: [150, 0],
        iconAnchor: [75, 24],
      });

      const marker = L.marker(adminPos, { icon, interactive: true });
      marker.bindTooltip(
        `<b>${result.adminArea.name}</b> (${isKec ? 'Kecamatan' : 'Kelurahan'})<br>` +
        `Jarak: <b>${formatDistance(result.distanceKm)}</b><br>` +
        transportModes.map(mode => {
          const r = result.modes.find(m => m.modeId === mode.id)?.reachable;
          return `${mode.icon} ${mode.label}: ${r ? '✅' : '❌'} (≤${formatDistance(mode.maxDistanceKm)})`;
        }).join('<br>'),
        { direction: 'top', offset: [0, -30], className: 'reach-tooltip' }
      );
      group.addLayer(marker);
    });

    map.addLayer(group);
    layerGroupRef.current = group;

    return () => {
      if (layerGroupRef.current) {
        map.removeLayer(layerGroupRef.current);
        layerGroupRef.current = null;
      }
    };
  }, [map, selectedMarker, results, showOverlay, transportModes]);

  return null;
}
