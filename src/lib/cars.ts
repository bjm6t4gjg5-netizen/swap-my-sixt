import type { BodyShape, CarClass, CarClassId, CarModel } from "./types";
import { carBody } from "./carVisuals";

// Sixt car classes, roughly ordered from smallest/cheapest to largest/priciest.
export const CAR_CLASSES: CarClass[] = [
  { id: "mini",         label: "Mini",            tier: 1,  acriss: "MBMR", description: "Smallest city cars — 2–4 seats, tiny footprint." },
  { id: "economy",      label: "Economy",         tier: 2,  acriss: "EBMR", description: "Budget small hatchbacks, low running cost." },
  { id: "compact",      label: "Compact",         tier: 3,  acriss: "CDMR", description: "Golf-class hatchbacks — the everyday workhorse." },
  { id: "midsize",      label: "Mid-size",        tier: 4,  acriss: "IDMR", description: "Roomier compacts and small estates." },
  { id: "intermediate", label: "Intermediate",    tier: 5,  acriss: "SDMR", description: "Large family sedans and estates." },
  { id: "premium",      label: "Premium",         tier: 6,  acriss: "PDAR", description: "Executive sedans — BMW 3, C-Class, A4." },
  { id: "premiumPlus",  label: "Premium Plus",    tier: 7,  acriss: "UDAR", description: "Upper-executive — BMW 5, E-Class, A6." },
  { id: "luxury",       label: "Luxury",          tier: 9,  acriss: "LDAR", description: "Flagship sedans — S-Class, 7 Series, A8." },
  { id: "suvSmall",     label: "Compact SUV",     tier: 5,  acriss: "CFAR", description: "Small crossovers — X1, GLA, Q3." },
  { id: "suvMid",       label: "Mid-size SUV",    tier: 7,  acriss: "IFAR", description: "Family SUVs — X3, GLC, Q5." },
  { id: "suvPremium",   label: "Premium SUV",     tier: 8,  acriss: "PFAR", description: "Large premium SUVs — X5, GLE, Q7." },
  { id: "suvLuxury",    label: "Luxury SUV",      tier: 9,  acriss: "LFAR", description: "Flagship SUVs — X7, GLS, Range Rover." },
  { id: "sport",        label: "Sport",           tier: 9,  acriss: "XTAR", description: "Performance coupes & hot sedans — M-Series, AMG." },
  { id: "sportPlus",    label: "Sport Plus",      tier: 10, acriss: "XEAR", description: "Supercar-adjacent — 911, AMG GT, M5 CS." },
  { id: "convertible",  label: "Convertible",     tier: 8,  acriss: "STAR", description: "Cabriolets & roadsters." },
  { id: "electric",     label: "Electric",        tier: 6,  acriss: "EEAR", description: "Battery-electric vehicles, all sizes." },
  { id: "van",          label: "Van / People Mover", tier: 4, acriss: "FVAR", description: "7–9 seat passenger vans." },
  { id: "transporter",  label: "Transporter",     tier: 3,  acriss: "KVMR", description: "Cargo vans for moving & logistics." }
];

export const CAR_CLASS_BY_ID: Record<CarClassId, CarClass> =
  Object.fromEntries(CAR_CLASSES.map((c) => [c.id, c])) as Record<CarClassId, CarClass>;

// Representative Sixt fleet models. Not exhaustive, but covers the cars
// you actually see at German/European Sixt counters.
export const CAR_MODELS: CarModel[] = [
  // Mini
  { brand: "Fiat", model: "500", classId: "mini" },
  { brand: "Volkswagen", model: "up!", classId: "mini" },
  { brand: "Renault", model: "Twingo", classId: "mini" },
  { brand: "Toyota", model: "Aygo X", classId: "mini" },
  { brand: "Hyundai", model: "i10", classId: "mini" },

  // Economy
  { brand: "Volkswagen", model: "Polo", classId: "economy" },
  { brand: "Opel", model: "Corsa", classId: "economy" },
  { brand: "Renault", model: "Clio", classId: "economy" },
  { brand: "Ford", model: "Fiesta", classId: "economy" },
  { brand: "Hyundai", model: "i20", classId: "economy" },
  { brand: "Seat", model: "Ibiza", classId: "economy" },
  { brand: "Peugeot", model: "208", classId: "economy" },

  // Compact
  { brand: "Volkswagen", model: "Golf", classId: "compact" },
  { brand: "Ford", model: "Focus", classId: "compact" },
  { brand: "Opel", model: "Astra", classId: "compact" },
  { brand: "BMW", model: "1 Series", classId: "compact" },
  { brand: "Mercedes-Benz", model: "A-Class", classId: "compact" },
  { brand: "Audi", model: "A3", classId: "compact" },
  { brand: "Seat", model: "Leon", classId: "compact" },
  { brand: "Mazda", model: "3", classId: "compact" },

  // Mid-size
  { brand: "Volkswagen", model: "Golf Variant", classId: "midsize", body: "wagon" },
  { brand: "Skoda", model: "Octavia", classId: "midsize" },
  { brand: "BMW", model: "2 Series Active Tourer", classId: "midsize" },
  { brand: "Mercedes-Benz", model: "B-Class", classId: "midsize" },
  { brand: "Ford", model: "Focus Estate", classId: "midsize", body: "wagon" },

  // Intermediate
  { brand: "Volkswagen", model: "Passat", classId: "intermediate", body: "sedan" },
  { brand: "Volkswagen", model: "Passat Variant", classId: "intermediate", body: "wagon" },
  { brand: "Skoda", model: "Superb", classId: "intermediate" },
  { brand: "Skoda", model: "Superb Combi", classId: "intermediate", body: "wagon" },
  { brand: "Opel", model: "Insignia", classId: "intermediate" },
  { brand: "Ford", model: "Mondeo", classId: "intermediate" },

  // Premium
  { brand: "BMW", model: "3 Series Limousine", classId: "premium", body: "sedan" },
  { brand: "BMW", model: "3 Series Touring", classId: "premium", body: "wagon" },
  { brand: "Mercedes-Benz", model: "C-Class", classId: "premium", body: "sedan" },
  { brand: "Mercedes-Benz", model: "C-Class Estate", classId: "premium", body: "wagon" },
  { brand: "Audi", model: "A4 Limousine", classId: "premium", body: "sedan" },
  { brand: "Audi", model: "A4 Avant", classId: "premium", body: "wagon" },
  { brand: "BMW", model: "4 Series Gran Coupé", classId: "premium" },
  { brand: "Jaguar", model: "XE", classId: "premium" },

  // Premium Plus
  { brand: "BMW", model: "5 Series Limousine", classId: "premiumPlus", body: "sedan" },
  { brand: "BMW", model: "5 Series Touring", classId: "premiumPlus", body: "wagon" },
  { brand: "Mercedes-Benz", model: "E-Class", classId: "premiumPlus", body: "sedan" },
  { brand: "Mercedes-Benz", model: "E-Class Estate", classId: "premiumPlus", body: "wagon" },
  { brand: "Audi", model: "A6 Limousine", classId: "premiumPlus", body: "sedan" },
  { brand: "Audi", model: "A6 Avant", classId: "premiumPlus", body: "wagon" },
  { brand: "BMW", model: "6 Series Gran Turismo", classId: "premiumPlus" },

  // Luxury
  { brand: "BMW", model: "7 Series", classId: "luxury" },
  { brand: "Mercedes-Benz", model: "S-Class", classId: "luxury" },
  { brand: "Audi", model: "A8", classId: "luxury" },
  { brand: "Maserati", model: "Ghibli", classId: "luxury" },

  // Compact SUV
  { brand: "BMW", model: "X1", classId: "suvSmall", awd: true },
  { brand: "Mercedes-Benz", model: "GLA", classId: "suvSmall", awd: true },
  { brand: "Audi", model: "Q3", classId: "suvSmall", awd: true },
  { brand: "Volkswagen", model: "T-Roc", classId: "suvSmall" },
  { brand: "Volkswagen", model: "Tiguan", classId: "suvSmall" },
  { brand: "Opel", model: "Grandland", classId: "suvSmall" },

  // Mid-size SUV
  { brand: "BMW", model: "X3", classId: "suvMid", awd: true },
  { brand: "Mercedes-Benz", model: "GLC", classId: "suvMid", awd: true },
  { brand: "Audi", model: "Q5", classId: "suvMid", awd: true },
  { brand: "BMW", model: "X4", classId: "suvMid", awd: true },
  { brand: "Volvo", model: "XC60", classId: "suvMid", awd: true },
  { brand: "Land Rover", model: "Range Rover Evoque", classId: "suvMid", awd: true },

  // Premium SUV
  { brand: "BMW", model: "X5", classId: "suvPremium", awd: true },
  { brand: "Mercedes-Benz", model: "GLE", classId: "suvPremium", awd: true },
  { brand: "Audi", model: "Q7", classId: "suvPremium", awd: true },
  { brand: "BMW", model: "X6", classId: "suvPremium", awd: true },
  { brand: "Porsche", model: "Macan", classId: "suvPremium", awd: true },

  // Luxury SUV
  { brand: "BMW", model: "X7", classId: "suvLuxury", awd: true },
  { brand: "Mercedes-Benz", model: "GLS", classId: "suvLuxury", awd: true },
  { brand: "Land Rover", model: "Range Rover", classId: "suvLuxury", awd: true },
  { brand: "Audi", model: "Q8", classId: "suvLuxury", awd: true },
  { brand: "Porsche", model: "Cayenne", classId: "suvLuxury", awd: true },

  // Sport
  { brand: "BMW", model: "M2", classId: "sport", body: "coupe", performance: true },
  { brand: "BMW", model: "M3", classId: "sport", body: "sedan", performance: true, awd: true },
  { brand: "BMW", model: "M4", classId: "sport", body: "coupe", performance: true },
  { brand: "Mercedes-AMG", model: "C 43", classId: "sport", body: "sedan", performance: true, awd: true },
  { brand: "Mercedes-AMG", model: "A 45 S", classId: "sport", body: "hatch", performance: true, awd: true },
  { brand: "Audi", model: "RS 3", classId: "sport", body: "sedan", performance: true, awd: true },
  { brand: "Audi", model: "S5", classId: "sport", body: "coupe", performance: true, awd: true },
  { brand: "Porsche", model: "718 Cayman", classId: "sport", body: "coupe", performance: true },

  // Sport Plus
  { brand: "Porsche", model: "911 Carrera", classId: "sportPlus", body: "coupe", performance: true },
  { brand: "BMW", model: "M5", classId: "sportPlus", body: "sedan", performance: true, awd: true },
  { brand: "Mercedes-AMG", model: "GT", classId: "sportPlus", body: "coupe", performance: true },
  { brand: "BMW", model: "M8 Competition", classId: "sportPlus", body: "coupe", performance: true, awd: true },

  // Convertible
  { brand: "BMW", model: "4 Series Convertible", classId: "convertible", cabrio: true },
  { brand: "Mercedes-Benz", model: "C-Class Cabriolet", classId: "convertible", cabrio: true },
  { brand: "BMW", model: "Z4 Roadster", classId: "convertible", cabrio: true },
  { brand: "Mini", model: "Convertible", classId: "convertible", cabrio: true },
  { brand: "Audi", model: "A5 Cabriolet", classId: "convertible", cabrio: true },
  { brand: "Porsche", model: "718 Boxster", classId: "convertible", cabrio: true, performance: true },

  // Electric
  { brand: "Tesla", model: "Model 3", classId: "electric", body: "sedan", ev: true },
  { brand: "Tesla", model: "Model Y", classId: "electric", body: "suv", ev: true, awd: true },
  { brand: "BMW", model: "i4", classId: "electric", body: "sedan", ev: true },
  { brand: "BMW", model: "iX3", classId: "electric", body: "suv", ev: true },
  { brand: "BMW", model: "iX1", classId: "electric", body: "suv", ev: true },
  { brand: "Mercedes-Benz", model: "EQA", classId: "electric", body: "suv", ev: true },
  { brand: "Mercedes-Benz", model: "EQE", classId: "electric", body: "sedan", ev: true },
  { brand: "Polestar", model: "2", classId: "electric", body: "sedan", ev: true },
  { brand: "Audi", model: "Q4 e-tron", classId: "electric", body: "suv", ev: true },
  { brand: "Volkswagen", model: "ID.4", classId: "electric", body: "suv", ev: true },
  { brand: "Volkswagen", model: "ID.3", classId: "electric", body: "hatch", ev: true },
  { brand: "Hyundai", model: "Ioniq 5", classId: "electric", body: "suv", ev: true },
  { brand: "Kia", model: "EV6", classId: "electric", body: "suv", ev: true },

  // Van / People Mover
  { brand: "Volkswagen", model: "Multivan", classId: "van" },
  { brand: "Mercedes-Benz", model: "V-Class", classId: "van" },
  { brand: "Volkswagen", model: "Caravelle", classId: "van" },
  { brand: "Ford", model: "Tourneo Custom", classId: "van" },

  // Transporter
  { brand: "Mercedes-Benz", model: "Sprinter", classId: "transporter" },
  { brand: "Volkswagen", model: "Crafter", classId: "transporter" },
  { brand: "Ford", model: "Transit", classId: "transporter" },
  { brand: "Volkswagen", model: "Transporter", classId: "transporter" },
  { brand: "Opel", model: "Movano", classId: "transporter" }
];

export const CAR_BRANDS: string[] = Array.from(
  new Set(CAR_MODELS.map((m) => m.brand))
).sort();

export function modelsInClass(classId: CarClassId): CarModel[] {
  return CAR_MODELS.filter((m) => m.classId === classId);
}

/** Google Images search for a real photo of a car. */
export function carPhotoSearchUrl(brand: string, model: string): string {
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
    `${brand} ${model}`
  )}`;
}

/** The silhouette a model actually has (own override, else the class default). */
export function effectiveBody(m: CarModel): BodyShape {
  return m.body ?? carBody(m.classId);
}

// Body-type search keywords, incl. German terms (Limousine, Kombi, Avant…).
const BODY_KEYWORDS: Record<string, BodyShape> = {
  limousine: "sedan", limo: "sedan", sedan: "sedan", saloon: "sedan",
  stufenheck: "sedan", notchback: "sedan",
  avant: "wagon", kombi: "wagon", combi: "wagon", estate: "wagon",
  wagon: "wagon", touring: "wagon", variant: "wagon", caravan: "wagon",
  suv: "suv", crossover: "suv", geländewagen: "suv", gelaendewagen: "suv",
  offroad: "suv", "4x4": "suv",
  coupe: "coupe", "coupé": "coupe",
  cabrio: "convertible", cabriolet: "convertible", convertible: "convertible",
  roadster: "convertible", spider: "convertible", spyder: "convertible",
  van: "van", bus: "van", transporter: "van", multivan: "van", mpv: "van",
  hatch: "hatch", hatchback: "hatch", kleinwagen: "hatch", schrägheck: "hatch"
};

/**
 * Searches models by brand/model text and by body-type keywords
 * (e.g. "limousine", "avant", "kombi", "cabrio").
 */
export function searchCars(query: string): CarModel[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const words = q.split(/\s+/).filter(Boolean);
  const bodyWords = words.filter((w) => BODY_KEYWORDS[w]);
  const textWords = words.filter((w) => !BODY_KEYWORDS[w]);
  const wantBodies = bodyWords.map((w) => BODY_KEYWORDS[w]);

  return CAR_MODELS.filter((m) => {
    const hay = `${m.brand} ${m.model}`.toLowerCase();
    if (hay.includes(q)) return true;
    if (words.length === 0) return false;
    const textOk = textWords.every((w) => hay.includes(w));
    const bodyOk =
      wantBodies.length === 0 || wantBodies.includes(effectiveBody(m));
    return textOk && bodyOk;
  });
}
