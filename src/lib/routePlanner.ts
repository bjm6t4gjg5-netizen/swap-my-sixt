// Builds up to three route options (A / B / C). Route A is the fastest;
// B and C are deliberate detours that swing through Sixt-dense areas the
// fastest route misses — so a small extra drive can unlock more swap options.

import type { CarClassId, LatLng, Route } from "./types";
import { fetchRoutes } from "./routing";
import { STATIONS } from "./stations";
import { stationsAlongRoute } from "./heuristic";
import { haversineKm, pointToSegmentKm } from "./geo";

export interface RouteOption {
  key: "A" | "B" | "C";
  route: Route;
  /** Sixt stations within this route's corridor. */
  stationCount: number;
  /** Short explanation of how this option was derived. */
  note: string;
}

/** Minimum distance (km) from a point to a route polyline. */
function minDistToRouteKm(p: LatLng, coords: LatLng[]): number {
  let min = Infinity;
  for (let i = 0; i < coords.length - 1; i++) {
    const seg = pointToSegmentKm(p, coords[i], coords[i + 1]);
    if (seg.dist < min) min = seg.dist;
    if (min < 0.2) break;
  }
  return min;
}

function nearDuplicate(a: Route, b: Route): boolean {
  return Math.abs(a.distance - b.distance) / Math.max(a.distance, 1) < 0.02;
}

export async function buildRouteOptions(
  origin: LatLng,
  dest: LatLng,
  classId: CarClassId | null
): Promise<RouteOption[]> {
  const base = await fetchRoutes([origin, dest]);
  const routeA = base[0];
  const aCoords = routeA.coordinates;

  const options: RouteOption[] = [
    {
      key: "A",
      route: routeA,
      stationCount: stationsAlongRoute(routeA, STATIONS, classId).length,
      note: "Fastest route"
    }
  ];

  // Detour candidates: Sixt stations a moderate hop off route A, ranked so
  // that a station sitting in a cluster (a detour that unlocks several) wins.
  const candidates = STATIONS.map((s) => ({
    s,
    d: minDistToRouteKm(s, aCoords)
  }))
    .filter((x) => x.d > 8 && x.d < 80)
    .map((x) => ({
      ...x,
      cluster: STATIONS.filter(
        (o) => o.id !== x.s.id && haversineKm(o, x.s) < 30
      ).length
    }))
    .sort((a, b) => b.cluster - a.cluster || a.d - b.d);

  // Pick up to two spatially-distinct detour anchors.
  const anchors: { s: (typeof candidates)[0]["s"] }[] = [];
  for (const c of candidates) {
    if (anchors.length >= 2) break;
    if (anchors.some((a) => haversineKm(a.s, c.s) < 70)) continue;
    anchors.push({ s: c.s });
  }

  // Fetch the detour routes in parallel.
  const detours = await Promise.all(
    anchors.map((a) =>
      fetchRoutes([origin, { lat: a.s.lat, lng: a.s.lng }, dest])
        .then((r) => ({ route: r[0], anchor: a.s }))
        .catch(() => null)
    )
  );

  const keys: ("B" | "C")[] = ["B", "C"];
  for (const d of detours) {
    if (!d || options.length >= 3) continue;
    if (options.some((o) => nearDuplicate(o.route, d.route))) continue;
    options.push({
      key: keys[options.length - 1],
      route: d.route,
      stationCount: stationsAlongRoute(d.route, STATIONS, classId).length,
      note: `Detour via ${d.anchor.name.replace("SIXT ", "")}`
    });
  }

  // If still short, fill with OSRM's own alternatives.
  for (let i = 1; i < base.length && options.length < 3; i++) {
    if (options.some((o) => nearDuplicate(o.route, base[i]))) continue;
    options.push({
      key: keys[options.length - 1],
      route: base[i],
      stationCount: stationsAlongRoute(base[i], STATIONS, classId).length,
      note: "Alternative route"
    });
  }

  return options;
}
