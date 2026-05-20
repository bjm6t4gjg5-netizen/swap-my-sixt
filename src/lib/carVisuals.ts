import type { CarClassId } from "./types";

export type BodyShape =
  | "hatch"
  | "sedan"
  | "suv"
  | "coupe"
  | "convertible"
  | "van";

/** Which silhouette to draw for each class. */
export const BODY_OF: Record<CarClassId, BodyShape> = {
  mini: "hatch",
  economy: "hatch",
  compact: "hatch",
  midsize: "sedan",
  intermediate: "sedan",
  premium: "sedan",
  premiumPlus: "sedan",
  luxury: "sedan",
  suvSmall: "suv",
  suvMid: "suv",
  suvPremium: "suv",
  suvLuxury: "suv",
  sport: "coupe",
  sportPlus: "coupe",
  convertible: "convertible",
  electric: "sedan",
  van: "van",
  transporter: "van"
};

/** Signature colour for each class. */
export const COLOR_OF: Record<CarClassId, string> = {
  mini: "#f5b400",
  economy: "#41bfe4",
  compact: "#3b82d6",
  midsize: "#13a8a8",
  intermediate: "#6b7a8f",
  premium: "#4f5bd5",
  premiumPlus: "#2d3a8c",
  luxury: "#33353c",
  suvSmall: "#4cae5a",
  suvMid: "#2f8f4e",
  suvPremium: "#1f6b3e",
  suvLuxury: "#a06f3f",
  sport: "#e0322f",
  sportPlus: "#b11a26",
  convertible: "#ff7a1a",
  electric: "#16b894",
  van: "#7b5bd6",
  transporter: "#8a909c"
};

export function carColor(id: CarClassId): string {
  return COLOR_OF[id] ?? "#3b82d6";
}

export function carBody(id: CarClassId): BodyShape {
  return BODY_OF[id] ?? "sedan";
}
