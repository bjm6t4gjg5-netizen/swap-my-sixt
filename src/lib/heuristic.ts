import type {
  CarClassId,
  LatLng,
  Route,
  ScoredStation,
  Station
} from "./types";
import { clamp, haversineKm, pointToSegmentKm } from "./geo";

/** Base availability from overall fleet size of a branch. */
function fleetBase(tier: Station["fleet"]): number {
  return { XL: 0.85, L: 0.7, M: 0.55, S: 0.38 }[tier] ?? 0.5;
}

/**
 * How likely the branch stocks a given car class, before time-of-day
 * adjustments. Returns 0–1.
 */
export function classFactor(station: Station, classId: CarClassId): number {
  const base = fleetBase(station.fleet);
  const p = station.premium;
  const e = station.electric;

  switch (classId) {
    case "mini":         return clamp(base + 0.12, 0, 0.97);
    case "economy":      return clamp(base + 0.15, 0, 0.98);
    case "compact":      return clamp(base + 0.10, 0, 0.96);
    case "midsize":      return clamp(base + 0.04, 0, 0.95);
    case "intermediate": return base;
    case "premium":      return p;
    case "premiumPlus":  return p * 0.92;
    case "luxury":       return p * 0.62;
    case "suvSmall":     return clamp((base + p) / 2 + 0.06, 0, 0.95);
    case "suvMid":       return (base + p) / 2;
    case "suvPremium":   return p * 0.82;
    case "suvLuxury":    return p * 0.58;
    case "sport":        return p * 0.70;
    case "sportPlus":    return p * 0.42;
    case "convertible":  return p * 0.60;
    case "electric":     return e;
    case "van":          return base * 0.72;
    case "transporter":  return base * 0.58;
    default:             return base;
  }
}

/** Branch-type bonus — airports & big stations turn fleet over fastest. */
function typeBoost(station: Station): number {
  if (station.type === "airport") return 0.08;
  if (station.type === "train") return 0.04;
  return 0;
}

/**
 * Estimates whether the branch is likely open right now and how that
 * affects the chance of a car being ready. Returns a 0–1 multiplier.
 */
export function hoursMultiplier(station: Station, when: Date = new Date()): number {
  const h = station.hours || "";
  if (/24h|24\/7/i.test(h)) return 1.0;

  const day = when.getDay(); // 0 Sun … 6 Sat
  const hour = when.getHours();
  const isSunday = day === 0;
  const isSaturday = day === 6;

  const match = h.match(/(\d{1,2}):?(\d{2})\s*[–\-]\s*(\d{1,2}):?(\d{2})/);
  let openHour = 7;
  let closeHour = 19;
  if (match) {
    openHour = parseInt(match[1], 10);
    closeHour = parseInt(match[3], 10);
  }

  let mult = 1.0;
  if (/Mon[–\-]Fri/i.test(h) && (isSaturday || isSunday)) mult = 0.22;
  else if (/Mon[–\-]Sat/i.test(h) && isSunday) mult = 0.28;

  if (hour < openHour - 1 || hour >= closeHour) mult = Math.min(mult, 0.18);
  else if (hour < openHour || hour >= closeHour - 1) mult = Math.min(mult, 0.6);

  return mult;
}

/** Generic availability when no class is targeted ("Any car"). */
function genericFactor(station: Station): number {
  return fleetBase(station.fleet);
}

/**
 * Full availability score for a station, 0–1.
 * Pass `null` as the class for a generic "any car" estimate.
 */
export function computeScore(
  station: Station,
  classId: CarClassId | null,
  when: Date = new Date()
): number {
  const factor = classId
    ? classFactor(station, classId)
    : genericFactor(station);
  const boost = typeBoost(station);
  const hours = hoursMultiplier(station, when);
  return clamp((factor + boost) * hours, 0, 0.98);
}

/** Verdict bucket from a 0–1 score. */
export type Verdict = "ok" | "mid" | "no";
export function verdict(score: number): Verdict {
  if (score >= 0.65) return "ok";
  if (score >= 0.35) return "mid";
  return "no";
}

export function verdictLabel(score: number): string {
  const v = verdict(score);
  if (v === "ok") return "Recommended";
  if (v === "mid") return "Call ahead";
  return "Long shot";
}

/** Estimated round-trip detour time, including the counter swap itself. */
export function estimateDetourMin(distFromRouteKm: number): number {
  const driveMin = ((distFromRouteKm * 1.4 * 2) / 55) * 60;
  return Math.round(driveMin + 15);
}

/**
 * Finds Sixt stations within a corridor of the route, scores each one,
 * and returns them sorted by progress from the start.
 */
export function stationsAlongRoute(
  route: Route,
  stations: Station[],
  classId: CarClassId | null,
  when: Date = new Date()
): ScoredStation[] {
  const coords = route.coordinates;
  if (coords.length < 2) return [];

  const routeKm = route.distance / 1000;
  // corridor half-width — generous enough to include branches a short
  // detour off the route, scaled to trip length
  const corridorKm = clamp(routeKm / 42, 6, 24);

  // cumulative km along the polyline
  const cum: number[] = [0];
  for (let i = 1; i < coords.length; i++) {
    cum.push(cum[i - 1] + haversineKm(coords[i - 1], coords[i]));
  }

  const out: ScoredStation[] = [];
  for (const s of stations) {
    let minDist = Infinity;
    let progress = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      const seg = pointToSegmentKm(s, coords[i], coords[i + 1]);
      if (seg.dist < minDist) {
        minDist = seg.dist;
        progress = cum[i] + seg.t * seg.segLen;
      }
      if (minDist < 0.1) break;
    }
    if (minDist <= corridorKm) {
      out.push({
        ...s,
        fromRouteKm: minDist,
        distFromStartKm: progress,
        detourMin: estimateDetourMin(minDist),
        score: computeScore(s, classId, when)
      });
    }
  }

  out.sort((a, b) => a.distFromStartKm - b.distFromStartKm);
  return out;
}

/** Nearest stations to a point, scored — used by research views. */
export function nearestStations(
  point: LatLng,
  stations: Station[],
  classId: CarClassId | null,
  limit = 20,
  when: Date = new Date()
): ScoredStation[] {
  return stations
    .map((s) => {
      const d = haversineKm(point, s);
      return {
        ...s,
        fromRouteKm: d,
        distFromStartKm: d,
        detourMin: estimateDetourMin(d),
        score: computeScore(s, classId, when)
      };
    })
    .sort((a, b) => a.fromRouteKm - b.fromRouteKm)
    .slice(0, limit);
}
