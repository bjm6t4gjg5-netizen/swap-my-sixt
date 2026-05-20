import type { LatLng } from "./types";

const toRad = (d: number) => (d * Math.PI) / 180;

/** Great-circle distance in km. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Distance (km) from point p to the segment a–b, plus the fractional
 * position t (0–1) of the closest point along the segment, and segment length.
 * Uses an equirectangular projection — accurate enough for <50 km segments.
 */
export function pointToSegmentKm(
  p: LatLng,
  a: LatLng,
  b: LatLng
): { dist: number; t: number; segLen: number } {
  const meanLat = ((a.lat + b.lat) / 2) * (Math.PI / 180);
  const kmLat = 111.0;
  const kmLng = 111.0 * Math.cos(meanLat);

  const ax = a.lng * kmLng, ay = a.lat * kmLat;
  const bx = b.lng * kmLng, by = b.lat * kmLat;
  const px = p.lng * kmLng, py = p.lat * kmLat;

  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) {
    return { dist: Math.hypot(px - ax, py - ay), t: 0, segLen: 0 };
  }
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx, cy = ay + t * dy;
  return { dist: Math.hypot(px - cx, py - cy), t, segLen: Math.sqrt(len2) };
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function formatKm(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  if (meters < 10000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters / 1000)} km`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h) return `${h} h ${m} min`;
  return `${m} min`;
}
