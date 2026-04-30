export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(2)} km`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} detik`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `~${mins} menit`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `~${hrs} jam ${remMins} menit`;
}

export function formatCoord(lat: number, lng: number): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
