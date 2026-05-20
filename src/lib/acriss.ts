import type { CarClassId } from "./types";

/**
 * ACRISS / SIPP car-classification codes.
 * A code is 4 letters: [Category][Type][Transmission&Drive][Fuel&AirCon].
 * Rental confirmations (Sixt included) quote these next to "… or similar".
 */

// Position 1 — Category
const CATEGORY: Record<string, string> = {
  M: "Mini", N: "Mini Elite",
  E: "Economy", H: "Economy Elite",
  C: "Compact", D: "Compact Elite",
  I: "Intermediate", J: "Intermediate Elite",
  S: "Standard", R: "Standard Elite",
  F: "Fullsize", G: "Fullsize Elite",
  P: "Premium", U: "Premium Elite",
  L: "Luxury", W: "Luxury Elite",
  O: "Oversize", X: "Special"
};

// Position 2 — Body type
const BODY: Record<string, string> = {
  B: "2–3 Door", C: "2/4 Door", D: "4–5 Door",
  W: "Estate / Wagon", V: "Passenger Van", L: "Limousine",
  S: "Sport", T: "Convertible", F: "SUV",
  J: "Open-Air All-Terrain", X: "Special", P: "Pickup (2-door)",
  Q: "Pickup (4-door)", Z: "Special Offer", E: "Coupe",
  M: "Monospace / MPV", R: "Recreational Vehicle", H: "Motor Home",
  Y: "2-Wheel Vehicle", N: "Roadster", G: "Crossover",
  K: "Commercial Van / Truck"
};

// Position 3 — Transmission & drive
const TRANSMISSION: Record<string, { gearbox: string; drive: string }> = {
  M: { gearbox: "Manual", drive: "" },
  N: { gearbox: "Manual", drive: "4WD" },
  C: { gearbox: "Manual", drive: "AWD" },
  A: { gearbox: "Automatic", drive: "" },
  B: { gearbox: "Automatic", drive: "4WD" },
  D: { gearbox: "Automatic", drive: "AWD" }
};

// Position 4 — Fuel & air conditioning
const FUEL: Record<string, { fuel: string; ac: boolean }> = {
  R: { fuel: "", ac: true },
  N: { fuel: "", ac: false },
  D: { fuel: "Diesel", ac: true },
  Q: { fuel: "Diesel", ac: false },
  H: { fuel: "Hybrid", ac: true },
  I: { fuel: "Plug-in Hybrid", ac: true },
  E: { fuel: "Electric", ac: true },
  C: { fuel: "Electric", ac: true },
  L: { fuel: "Electric", ac: false },
  V: { fuel: "Petrol", ac: true },
  Z: { fuel: "Petrol", ac: false },
  F: { fuel: "Multi-fuel", ac: true },
  M: { fuel: "Multi-fuel", ac: false },
  A: { fuel: "Hydrogen", ac: true },
  B: { fuel: "Hydrogen", ac: false },
  U: { fuel: "Ethanol", ac: true },
  X: { fuel: "Ethanol", ac: false }
};

export interface AcrissDecoded {
  valid: boolean;
  code: string;
  category: string;
  bodyType: string;
  gearbox: string;
  drive: string;
  fuel: string;
  ac: boolean;
  classId: CarClassId;
  /** A friendly one-line description. */
  summary: string;
}

/** Maps the category + body letters to one of the app's internal classes. */
function toClassId(cat: string, body: string, fuelLetter: string): CarClassId {
  // Electric always wins
  if (["E", "C", "L"].includes(fuelLetter)) return "electric";

  // Body-type overrides
  if (body === "T" || body === "N") return "convertible";
  if (body === "V" || body === "M") return "van";
  if (["K", "P", "Q"].includes(body)) return "transporter";
  if (body === "S" || body === "E") {
    return ["P", "U", "L", "W"].includes(cat) ? "sportPlus" : "sport";
  }
  if (["F", "G", "J"].includes(body)) {
    if (["M", "N", "E", "H", "C", "D"].includes(cat)) return "suvSmall";
    if (["I", "J", "S", "R"].includes(cat)) return "suvMid";
    if (["F", "G", "P", "U"].includes(cat)) return "suvPremium";
    return "suvLuxury";
  }

  // Otherwise map by category
  const byCat: Record<string, CarClassId> = {
    M: "mini", N: "mini",
    E: "economy", H: "economy",
    C: "compact", D: "compact",
    I: "midsize", J: "midsize",
    S: "intermediate", R: "intermediate",
    F: "premium", G: "premium",
    P: "premiumPlus", U: "premiumPlus",
    L: "luxury", W: "luxury",
    O: "van", X: "compact"
  };
  return byCat[cat] ?? "compact";
}

/** Decode a 4-letter ACRISS code. Tolerates lowercase and surrounding spaces. */
export function decodeAcriss(raw: string): AcrissDecoded {
  const code = (raw || "").trim().toUpperCase();
  const blank: AcrissDecoded = {
    valid: false,
    code,
    category: "",
    bodyType: "",
    gearbox: "",
    drive: "",
    fuel: "",
    ac: false,
    classId: "compact",
    summary: ""
  };

  if (!/^[A-Z]{4}$/.test(code)) return blank;

  const [c1, c2, c3, c4] = code.split("");
  const category = CATEGORY[c1];
  const bodyType = BODY[c2];
  const trans = TRANSMISSION[c3];
  const fuelInfo = FUEL[c4];

  if (!category || !bodyType || !trans || !fuelInfo) {
    return { ...blank, category: category ?? "", bodyType: bodyType ?? "" };
  }

  const classId = toClassId(c1, c2, c4);

  const parts = [
    category,
    bodyType,
    trans.gearbox + (trans.drive ? " " + trans.drive : ""),
    fuelInfo.fuel || "",
    fuelInfo.ac ? "A/C" : "no A/C"
  ].filter(Boolean);

  return {
    valid: true,
    code,
    category,
    bodyType,
    gearbox: trans.gearbox,
    drive: trans.drive,
    fuel: fuelInfo.fuel,
    ac: fuelInfo.ac,
    classId,
    summary: parts.join(" · ")
  };
}

/** A few well-known examples to show as hints in the UI. */
export const ACRISS_EXAMPLES: { code: string; label: string }[] = [
  { code: "EDMR", label: "Economy hatchback, manual" },
  { code: "CDAR", label: "Compact, automatic" },
  { code: "IDAR", label: "Mid-size sedan, automatic" },
  { code: "PDAR", label: "Premium sedan, automatic" },
  { code: "FFAR", label: "Fullsize SUV, automatic" },
  { code: "LDAR", label: "Luxury sedan, automatic" },
  { code: "PTAR", label: "Premium convertible" },
  { code: "IFBR", label: "Intermediate SUV, 4WD" },
  { code: "EEAE", label: "Economy electric" }
];
