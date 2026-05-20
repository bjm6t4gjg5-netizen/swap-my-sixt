import { writable, type Writable } from "svelte/store";
import type { Booking, BodyShape, CarClassId, LatLng } from "./types";
import { CAR_CLASS_BY_ID } from "./cars";

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

export type TabId = "home" | "navigate" | "booking" | "cars" | "stations";

export const activeTab = writable<TabId>("home");

/* ============================================================
   Target — what the user is hunting for. Either nothing in
   particular ("any"), a whole class, or one specific model.
   ============================================================ */
export type Target =
  | { kind: "any" }
  | { kind: "class"; classId: CarClassId }
  | {
      kind: "model";
      classId: CarClassId;
      brand: string;
      model: string;
      body?: BodyShape;
    };

// Default hunt = the booked car (BMW 4 Series 430i — matches DEFAULT_BOOKING).
export const target = persisted<Target>("sixt.target.v2", {
  kind: "model",
  classId: "premium",
  brand: "BMW",
  model: "4 Series 430i",
  body: "coupe"
});

/** The class used for scoring — null means "any car" (generic scoring). */
export function targetClassId(t: Target): CarClassId | null {
  return t.kind === "any" ? null : t.classId;
}

/** Headline label, e.g. "Any car", "Premium", "BMW M3". */
export function targetLabel(t: Target): string {
  if (t.kind === "any") return "Any car";
  if (t.kind === "model") return `${t.brand} ${t.model}`;
  return CAR_CLASS_BY_ID[t.classId].label;
}

/** Secondary label under the headline. */
export function targetSubLabel(t: Target): string {
  if (t.kind === "any") return "Scoring by overall fleet";
  if (t.kind === "model") return `${CAR_CLASS_BY_ID[t.classId].label} class`;
  return "Vehicle class";
}

/** The user's current Sixt booking, entered manually. */
const DEFAULT_BOOKING: Booking = {
  ref: "Husum rental",
  acrissCode: "GEAR",
  bookedExample: "BMW 4 Series 430i",
  bookedVariantId: "bmw-4-430i",
  sixtStatus: "diamond",
  pickupStationId: "husum",
  pickupDate: "2026-05-23",
  pickupTime: "11:30",
  returnStationId: "husum",
  returnDate: "2026-06-09",
  returnTime: "08:30",
  expectedClassId: "premium",
  notes: ""
};
export const booking = persisted<Booking | null>(
  "sixt.booking.v4",
  DEFAULT_BOOKING
);

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
  target?: Target;
}
export const navRequest = writable<NavRequest | null>(null);

export function requestNavigation(req: NavRequest): void {
  if (req.target) target.set(req.target);
  navRequest.set(req);
  activeTab.set("navigate");
}
