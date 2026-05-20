import type { LatLng, Route } from "./types";

const OSRM = "https://router.project-osrm.org/route/v1/driving";

/** Fastest driving route through an ordered list of waypoints. */
export async function fetchRoute(waypoints: LatLng[]): Promise<Route> {
  if (waypoints.length < 2) {
    throw new Error("Need at least an origin and a destination.");
  }
  const coordStr = waypoints.map((w) => `${w.lng},${w.lat}`).join(";");
  const url =
    `${OSRM}/${coordStr}` +
    `?overview=full&geometries=geojson&steps=false&alternatives=false`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Routing service error (${res.status}). Try again shortly.`);
  }
  const data = await res.json();
  if (data.code !== "Ok" || !data.routes?.length) {
    throw new Error("No drivable route found between those points.");
  }
  const r = data.routes[0];
  return {
    coordinates: (r.geometry.coordinates as [number, number][]).map(
      ([lng, lat]) => ({ lat, lng })
    ),
    distance: r.distance,
    duration: r.duration
  };
}
