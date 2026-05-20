import type { CarClass, CarClassId, CarModel } from "./types";

// Sixt car classes, roughly ordered from smallest/cheapest to largest/priciest.
export const CAR_CLASSES: CarClass[] = [
  { id: "mini",         label: "Mini",            acriss: "MBMR", description: "Smallest city cars — 2–4 seats, tiny footprint." },
  { id: "economy",      label: "Economy",         acriss: "EBMR", description: "Budget small hatchbacks, low running cost." },
  { id: "compact",      label: "Compact",         acriss: "CDMR", description: "Golf-class hatchbacks — the everyday workhorse." },
  { id: "midsize",      label: "Mid-size",        acriss: "IDMR", description: "Roomier compacts and small estates." },
  { id: "intermediate", label: "Intermediate",    acriss: "SDMR", description: "Large family sedans and estates." },
  { id: "premium",      label: "Premium",         acriss: "PDAR", description: "Executive sedans — BMW 3, C-Class, A4." },
  { id: "premiumPlus",  label: "Premium Plus",    acriss: "UDAR", description: "Upper-executive — BMW 5, E-Class, A6." },
  { id: "luxury",       label: "Luxury",          acriss: "LDAR", description: "Flagship sedans — S-Class, 7 Series, A8." },
  { id: "suvSmall",     label: "Compact SUV",     acriss: "CFAR", description: "Small crossovers — X1, GLA, Q3." },
  { id: "suvMid",       label: "Mid-size SUV",    acriss: "IFAR", description: "Family SUVs — X3, GLC, Q5." },
  { id: "suvPremium",   label: "Premium SUV",     acriss: "PFAR", description: "Large premium SUVs — X5, GLE, Q7." },
  { id: "suvLuxury",    label: "Luxury SUV",      acriss: "LFAR", description: "Flagship SUVs — X7, GLS, Range Rover." },
  { id: "sport",        label: "Sport",           acriss: "XTAR", description: "Performance coupes & hot sedans — M-Series, AMG." },
  { id: "sportPlus",    label: "Sport Plus",      acriss: "XEAR", description: "Supercar-adjacent — 911, AMG GT, M5 CS." },
  { id: "convertible",  label: "Convertible",     acriss: "STAR", description: "Cabriolets & roadsters." },
  { id: "electric",     label: "Electric",        acriss: "EEAR", description: "Battery-electric vehicles, all sizes." },
  { id: "van",          label: "Van / People Mover", acriss: "FVAR", description: "7–9 seat passenger vans." },
  { id: "transporter",  label: "Transporter",     acriss: "KVMR", description: "Cargo vans for moving & logistics." }
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
  { brand: "Volkswagen", model: "Golf Variant", classId: "midsize" },
  { brand: "Skoda", model: "Octavia", classId: "midsize" },
  { brand: "BMW", model: "2 Series Active Tourer", classId: "midsize" },
  { brand: "Mercedes-Benz", model: "B-Class", classId: "midsize" },
  { brand: "Ford", model: "Focus Estate", classId: "midsize" },

  // Intermediate
  { brand: "Volkswagen", model: "Passat", classId: "intermediate" },
  { brand: "Skoda", model: "Superb", classId: "intermediate" },
  { brand: "Opel", model: "Insignia", classId: "intermediate" },
  { brand: "Ford", model: "Mondeo", classId: "intermediate" },

  // Premium
  { brand: "BMW", model: "3 Series", classId: "premium" },
  { brand: "Mercedes-Benz", model: "C-Class", classId: "premium" },
  { brand: "Audi", model: "A4", classId: "premium" },
  { brand: "BMW", model: "4 Series Gran Coupé", classId: "premium" },
  { brand: "Jaguar", model: "XE", classId: "premium" },

  // Premium Plus
  { brand: "BMW", model: "5 Series", classId: "premiumPlus" },
  { brand: "Mercedes-Benz", model: "E-Class", classId: "premiumPlus" },
  { brand: "Audi", model: "A6", classId: "premiumPlus" },
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
  { brand: "BMW", model: "M2", classId: "sport", performance: true },
  { brand: "BMW", model: "M3", classId: "sport", performance: true, awd: true },
  { brand: "BMW", model: "M4", classId: "sport", performance: true },
  { brand: "Mercedes-AMG", model: "C 43", classId: "sport", performance: true, awd: true },
  { brand: "Mercedes-AMG", model: "A 45 S", classId: "sport", performance: true, awd: true },
  { brand: "Audi", model: "RS 3", classId: "sport", performance: true, awd: true },
  { brand: "Audi", model: "S5", classId: "sport", performance: true, awd: true },
  { brand: "Porsche", model: "718 Cayman", classId: "sport", performance: true },

  // Sport Plus
  { brand: "Porsche", model: "911 Carrera", classId: "sportPlus", performance: true },
  { brand: "BMW", model: "M5", classId: "sportPlus", performance: true, awd: true },
  { brand: "Mercedes-AMG", model: "GT", classId: "sportPlus", performance: true },
  { brand: "BMW", model: "M8 Competition", classId: "sportPlus", performance: true, awd: true },

  // Convertible
  { brand: "BMW", model: "4 Series Convertible", classId: "convertible", cabrio: true },
  { brand: "Mercedes-Benz", model: "C-Class Cabriolet", classId: "convertible", cabrio: true },
  { brand: "BMW", model: "Z4 Roadster", classId: "convertible", cabrio: true },
  { brand: "Mini", model: "Convertible", classId: "convertible", cabrio: true },
  { brand: "Audi", model: "A5 Cabriolet", classId: "convertible", cabrio: true },
  { brand: "Porsche", model: "718 Boxster", classId: "convertible", cabrio: true, performance: true },

  // Electric
  { brand: "Tesla", model: "Model 3", classId: "electric", ev: true },
  { brand: "Tesla", model: "Model Y", classId: "electric", ev: true, awd: true },
  { brand: "BMW", model: "i4", classId: "electric", ev: true },
  { brand: "BMW", model: "iX3", classId: "electric", ev: true },
  { brand: "BMW", model: "iX1", classId: "electric", ev: true },
  { brand: "Mercedes-Benz", model: "EQA", classId: "electric", ev: true },
  { brand: "Mercedes-Benz", model: "EQE", classId: "electric", ev: true },
  { brand: "Polestar", model: "2", classId: "electric", ev: true },
  { brand: "Audi", model: "Q4 e-tron", classId: "electric", ev: true },
  { brand: "Volkswagen", model: "ID.4", classId: "electric", ev: true },
  { brand: "Volkswagen", model: "ID.3", classId: "electric", ev: true },
  { brand: "Hyundai", model: "Ioniq 5", classId: "electric", ev: true },
  { brand: "Kia", model: "EV6", classId: "electric", ev: true },

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

export function searchCars(query: string): CarModel[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return CAR_MODELS.filter(
    (m) =>
      m.brand.toLowerCase().includes(q) ||
      m.model.toLowerCase().includes(q) ||
      `${m.brand} ${m.model}`.toLowerCase().includes(q)
  );
}
