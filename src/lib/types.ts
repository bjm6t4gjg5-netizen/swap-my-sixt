export type LatLng = { lat: number; lng: number };

export type FleetTier = "XL" | "L" | "M" | "S";
export type StationType = "airport" | "train" | "city" | "suburb" | "rural";

export interface Station {
  id: string;
  name: string;
  addr: string;
  lat: number;
  lng: number;
  country: string;
  type: StationType;
  fleet: FleetTier;
  premium: number;   // 0–1 likelihood weight for premium/sport
  electric: number;  // 0–1 likelihood weight for EV
  hours: string;
}

export type CarClassId =
  | "mini" | "economy" | "compact" | "midsize" | "intermediate"
  | "premium" | "premiumPlus" | "luxury"
  | "suvSmall" | "suvMid" | "suvPremium" | "suvLuxury"
  | "sport" | "sportPlus" | "convertible"
  | "electric" | "van" | "transporter";

/** Side-profile silhouette used by the CarArt illustration. */
export type BodyShape =
  | "hatch"
  | "sedan"
  | "wagon"
  | "suv"
  | "coupe"
  | "convertible"
  | "van";

export interface CarModel {
  brand: string;
  model: string;
  classId: CarClassId;
  /** Overrides the class default silhouette (e.g. an SUV inside the EV class). */
  body?: BodyShape;
  // Tag flags help when filtering
  ev?: boolean;
  awd?: boolean;
  performance?: boolean;
  cabrio?: boolean;
}

export interface CarClass {
  id: CarClassId;
  label: string;
  description: string;
  /** Value tier, 1 (cheapest) … 10 (flagship) — drives negotiation logic. */
  tier: number;
  /** ACRISS-style code, e.g. "EBMR", "FBAR" — informational only */
  acriss?: string;
}

/** A car logged in negotiation mode (offered, or spotted on the lot). */
export interface NegCar {
  brand: string;
  model: string;
  classId: CarClassId;
}

export interface Route {
  coordinates: LatLng[];
  distance: number; // meters
  duration: number; // seconds
}

export interface ScoredStation extends Station {
  fromRouteKm: number;
  distFromStartKm: number;
  detourMin: number;
  score: number; // 0–1
}

export interface Booking {
  ref: string;
  /** 4-letter ACRISS/SIPP code from the rental confirmation, e.g. "PDAR". */
  acrissCode?: string;
  /** The representative model Sixt quoted, e.g. "BMW 3 Series" ("… or similar"). */
  bookedExample?: string;
  pickupStationId?: string;
  pickupDate?: string;
  returnDate?: string;
  /** Internal class — derived from the ACRISS code, or chosen manually. */
  expectedClassId: CarClassId;
  actualBrand?: string;
  actualModel?: string;
  actualClassId?: CarClassId;
  notes?: string;
  /** Negotiation mode: cars offered vs. cars spotted but not offered. */
  negotiation?: {
    offered: NegCar[];
    spotted: NegCar[];
  };
}
