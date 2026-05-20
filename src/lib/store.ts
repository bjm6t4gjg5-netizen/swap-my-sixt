import { writable, type Writable } from "svelte/store";
import type { Booking, CarClassId, LatLng } from "./types";

/** A writable store that mirrors itself into localStorage. */
function persisted<T>(key: string, initial: T): Writable<T> {
  let start = initial;
  try {
    const raw = localStorage.getItem(key);
    if (raw != null) start = JSON.parse(raw) as T;
  } catch {
    /* private mode / unavailable */
  }
  const store = writable<T>(start);
  store.subscribe((val) => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {
      /* ignore */
    }
  });
  return store;
}

export type TabId = "navigate" | "booking" | "cars" | "stations";

export const activeTab = writable<TabId>("navigate");

/** Preferred car class — the one you're hunting for. */
export const carClass = persisted<CarClassId>("sixt.carClass", "premium");

/** The user's current Sixt booking, entered manually. */
export const booking = persisted<Booking | null>("sixt.booking", null);

/** Last known device location, shared across views. */
export const myLocation = writable<LatLng | null>(null);

/** Recently searched destinations, most-recent first. */
export interface RecentPlace {
  label: string;
  lat: number;
  lng: number;
}
export const recents = persisted<RecentPlace[]>("sixt.recents", []);

export function addRecent(p: RecentPlace): void {
  recents.update((list) => {
    const filtered = list.filter(
      (x) => x.label !== p.label || x.lat !== p.lat
    );
    return [p, ...filtered].slice(0, 6);
  });
}

/** An endpoint for a route: a coordinate plus a human label. */
export interface NamedPoint {
  lat: number;
  lng: number;
  label: string;
}

/**
 * A request to pre-fill the Navigate tab — used when another tab
 * (e.g. Booking) wants to start a route. The Map view consumes it.
 */
export interface NavRequest {
  origin?: NamedPoint;
  dest?: NamedPoint;
  carClass?: CarClassId;
}
export const navRequest = writable<NavRequest | null>(null);

export function requestNavigation(req: NavRequest): void {
  if (req.carClass) carClass.set(req.carClass);
  navRequest.set(req);
  activeTab.set("navigate");
}
