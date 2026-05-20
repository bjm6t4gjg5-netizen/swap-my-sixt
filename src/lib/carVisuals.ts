import type { CarClassId, BodyShape } from "./types";

export type { BodyShape };

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

/** Signature body colour per brand — so a BMW doesn't look like an Audi. */
const BRAND_COLOR: Record<string, string> = {
  BMW: "#1c69d4",
  "Mercedes-Benz": "#33363d",
  "Mercedes-AMG": "#16181c",
  Audi: "#565b63",
  Volkswagen: "#1f56a8",
  Tesla: "#c62d3a",
  Porsche: "#caa12e",
  Skoda: "#3a9e57",
  Opel: "#e0a200",
  Ford: "#1f4fa0",
  Mini: "#15643a",
  Fiat: "#d6536b",
  Volvo: "#3a5f80",
  Hyundai: "#3d6f93",
  Kia: "#5a4f6b",
  Renault: "#f0b400",
  Toyota: "#5a6470",
  Seat: "#b03a3a",
  Mazda: "#7a1f2c",
  Peugeot: "#2a3442",
  Jaguar: "#2f6a4a",
  "Land Rover": "#3c5142",
  Polestar: "#6b7785",
  Maserati: "#1f2f66"
};

/** Colour for a car: brand identity if known, else the class colour. */
export function brandColor(brand: string | undefined, classId: CarClassId): string {
  if (brand && BRAND_COLOR[brand]) return BRAND_COLOR[brand];
  return carColor(classId);
}
