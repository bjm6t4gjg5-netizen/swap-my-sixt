import type { LatLng, Route } from "./types";

const OSRM = "https://router.project-osrm.org/route/v1/driving";

/**
 * Driving routes through an ordered list of waypoints. Returns up to three
 * alternatives (index 0 is the fastest). OSRM only returns alternatives for a
 * plain origin→destination request; with a via-waypoint you'll get just one.
 */
export async function fetchRoutes(waypoints: LatLng[]): Promise<Route[]> {
  if (waypoints.length < 2) {
    throw new Error("Need at least an origin and a destination.");
  }
  const coordStr = waypoints.map((w) => `${w.lng},${w.lat}`).join(";");
  const url =
    `${OSRM}/${coordStr}` +
    `?overview=full&geometries=geojson&steps=false&alternatives=3`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Routing service error (${res.status}). Try again shortly.`);
  }
  const data = await res.json();
  if (data.code !== "Ok" || !data.routes?.length) {
    throw new Error("No drivable route found between those points.");
  }
  return (data.routes as any[]).map((r) => ({
    coordinates: (r.geometry.coordinates as [number, number][]).map(
      ([lng, lat]) => ({ lat, lng })
    ),
    distance: r.distance,
    duration: r.duration
  }));
}

/** Convenience: just the fastest route. */
export async function fetchRoute(waypoints: LatLng[]): Promise<Route> {
  return (await fetchRoutes(waypoints))[0];
}
