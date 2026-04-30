export interface MarkerData {
  id: number;
  lat: number;
  lng: number;
  tags: Record<string, string>;
}

export interface MapLayer {
  id: string;
  name: string;
  color: string;
  osmTag: string;
  markers: MarkerData[];
  visible: boolean;
  radiusMeters: number;
  showRadius: boolean;
  locked: boolean;
  createdAt: number;
  /** 'poi' for search results, 'measurement' for saved measurements */
  layerType: 'poi' | 'measurement';
  /** Stored route geometry for measurement layers */
  routeGeometry?: GeoJSON.LineString | null;
  /** Measurement metadata */
  measurementData?: {
    straightDistance: number;
    routeDistance: number;
    routeDuration: number;
  };
}

export interface TagMapping {
  label: string;
  labelEn: string;
  key: string;
  value: string;
  icon: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface BBox {
  south: number;
  west: number;
  north: number;
  east: number;
}

export interface RouteResult {
  distance: number;
  duration: number;
  geometry: GeoJSON.LineString | null;
}

export type ActiveTool = 'pan' | 'measure';
export type MeasureState = 'idle' | 'waiting_a' | 'point_a' | 'complete';
export type DrawerMode = 'marker' | 'route' | null;
export type SearchStep = 'tag' | 'location';
