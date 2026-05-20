import type { LatLng } from "./types";

const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const REVERSE = "https://nominatim.openstreetmap.org/reverse";

export interface Place {
  id: string;
  lat: number;
  lng: number;
  shortName: string;
  fullName: string;
}

function shortLabel(d: any): string {
  const a = d.address || {};
  const name =
    d.namedetails?.name ||
    a.attraction ||
    a.tourism ||
    a.amenity ||
    a.shop ||
    a.building ||
    a.road ||
    (d.display_name || "").split(",")[0];
  const city =
    a.city || a.town || a.village || a.municipality || a.county || "";
  return city && name && !String(name).includes(city)
    ? `${name}, ${city}`
    : name || d.display_name;
}

/** Free-text geocoding via Nominatim, optionally biased toward a location. */
export async function geocode(
  query: string,
  near?: LatLng | null
): Promise<Place[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const params = new URLSearchParams({
    q,
    format: "json",
    addressdetails: "1",
    namedetails: "1",
    limit: "6"
  });
  if (near) {
    const d = 1.2;
    params.set(
      "viewbox",
      `${near.lng - d},${near.lat + d},${near.lng + d},${near.lat - d}`
    );
  }

  const res = await fetch(`${NOMINATIM}?${params}`, {
    headers: { "Accept-Language": navigator.language || "en" }
  });
  if (!res.ok) throw new Error("Search service unavailable.");
  const data = await res.json();
  return (data as any[]).map((d) => ({
    id: String(d.place_id),
    lat: parseFloat(d.lat),
    lng: parseFloat(d.lon),
    shortName: shortLabel(d),
    fullName: d.display_name
  }));
}

/** Reverse-geocode a coordinate to a human label. */
export async function reverseGeocode(point: LatLng): Promise<string> {
  try {
    const params = new URLSearchParams({
      lat: String(point.lat),
      lon: String(point.lng),
      format: "json",
      zoom: "16"
    });
    const res = await fetch(`${REVERSE}?${params}`, {
      headers: { "Accept-Language": navigator.language || "en" }
    });
    if (!res.ok) return "Dropped pin";
    const d = await res.json();
    return shortLabel(d) || "Dropped pin";
  } catch {
    return "Dropped pin";
  }
}
