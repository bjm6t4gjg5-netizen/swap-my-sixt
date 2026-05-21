import type { CarVariant } from "./types";

// Real-world engine variants of cars common in the German Sixt rental fleet.
// Specs are approximate manufacturer figures — close enough for comparison.
export const CAR_VARIANTS: CarVariant[] = [
  // ── BMW 1 Series (compact, hatch) ─────────────────────────────────
  { id: "bmw-1-118i", brand: "BMW", family: "1 Series", trim: "118i", classId: "compact", body: "hatch", fuel: "Petrol", hp: 136, topSpeed: 213, accel: 8.5, drivetrain: "FWD", consumption: 6.0, seats: 5 },
  { id: "bmw-1-120d", brand: "BMW", family: "1 Series", trim: "120d", classId: "compact", body: "hatch", fuel: "Diesel", hp: 190, topSpeed: 235, accel: 6.9, drivetrain: "AWD", consumption: 4.8, seats: 5 },
  { id: "bmw-1-m135i", brand: "BMW", family: "1 Series", trim: "M135i xDrive", classId: "compact", body: "hatch", fuel: "Petrol", hp: 306, topSpeed: 250, accel: 4.8, drivetrain: "AWD", consumption: 7.5, seats: 5 },

  // ── BMW 3 Series (premium, sedan) ─────────────────────────────────
  { id: "bmw-3-318i", brand: "BMW", family: "3 Series", trim: "318i", classId: "premium", body: "sedan", fuel: "Petrol", hp: 156, topSpeed: 223, accel: 8.4, drivetrain: "RWD", consumption: 6.2, seats: 5 },
  { id: "bmw-3-320i", brand: "BMW", family: "3 Series", trim: "320i", classId: "premium", body: "sedan", fuel: "Petrol", hp: 184, topSpeed: 237, accel: 7.1, drivetrain: "RWD", consumption: 6.4, seats: 5 },
  { id: "bmw-3-320d", brand: "BMW", family: "3 Series", trim: "320d", classId: "premium", body: "sedan", fuel: "Diesel", hp: 190, topSpeed: 240, accel: 6.9, drivetrain: "RWD", consumption: 4.8, seats: 5 },
  { id: "bmw-3-330i", brand: "BMW", family: "3 Series", trim: "330i", classId: "premium", body: "sedan", fuel: "Petrol", hp: 245, topSpeed: 250, accel: 5.8, drivetrain: "RWD", consumption: 6.7, seats: 5 },
  { id: "bmw-3-330e", brand: "BMW", family: "3 Series", trim: "330e", classId: "premium", body: "sedan", fuel: "Plug-in Hybrid", hp: 292, topSpeed: 230, accel: 5.9, drivetrain: "RWD", consumption: 1.6, seats: 5 },
  { id: "bmw-3-m340i", brand: "BMW", family: "3 Series", trim: "M340i xDrive", classId: "premium", body: "sedan", fuel: "Petrol", hp: 374, topSpeed: 250, accel: 4.4, drivetrain: "AWD", consumption: 8.0, seats: 5 },

  // ── BMW 4 Series (premium, coupe) ─────────────────────────────────
  { id: "bmw-4-420i", brand: "BMW", family: "4 Series", trim: "420i", classId: "premium", body: "coupe", fuel: "Petrol", hp: 184, topSpeed: 240, accel: 7.5, drivetrain: "RWD", consumption: 6.6, seats: 4 },
  { id: "bmw-4-430i", brand: "BMW", family: "4 Series", trim: "430i", classId: "premium", body: "coupe", fuel: "Petrol", hp: 245, topSpeed: 250, accel: 5.8, drivetrain: "RWD", consumption: 6.9, seats: 4 },
  { id: "bmw-4-m440i", brand: "BMW", family: "4 Series", trim: "M440i xDrive", classId: "premium", body: "coupe", fuel: "Petrol", hp: 374, topSpeed: 250, accel: 4.5, drivetrain: "AWD", consumption: 8.1, seats: 4 },

  // ── BMW 5 Series (premiumPlus, sedan) ─────────────────────────────
  { id: "bmw-5-520i", brand: "BMW", family: "5 Series", trim: "520i", classId: "premiumPlus", body: "sedan", fuel: "Petrol", hp: 208, topSpeed: 230, accel: 7.5, drivetrain: "RWD", consumption: 6.5, seats: 5 },
  { id: "bmw-5-530i", brand: "BMW", family: "5 Series", trim: "530i", classId: "premiumPlus", body: "sedan", fuel: "Petrol", hp: 258, topSpeed: 250, accel: 6.2, drivetrain: "RWD", consumption: 6.6, seats: 5 },
  { id: "bmw-5-520d", brand: "BMW", family: "5 Series", trim: "520d", classId: "premiumPlus", body: "sedan", fuel: "Diesel", hp: 197, topSpeed: 235, accel: 7.3, drivetrain: "RWD", consumption: 5.1, seats: 5 },
  { id: "bmw-5-540i", brand: "BMW", family: "5 Series", trim: "540i xDrive", classId: "premiumPlus", body: "sedan", fuel: "Petrol", hp: 333, topSpeed: 250, accel: 4.9, drivetrain: "AWD", consumption: 7.6, seats: 5 },

  // ── BMW 3 Series Touring (premium, wagon) ─────────────────────────
  { id: "bmw-3-touring-320d", brand: "BMW", family: "3 Series Touring", trim: "320d", classId: "premium", body: "wagon", fuel: "Diesel", hp: 190, topSpeed: 233, accel: 7.4, drivetrain: "RWD", consumption: 5.0, seats: 5 },
  { id: "bmw-3-touring-330i", brand: "BMW", family: "3 Series Touring", trim: "330i", classId: "premium", body: "wagon", fuel: "Petrol", hp: 245, topSpeed: 250, accel: 6.1, drivetrain: "RWD", consumption: 6.9, seats: 5 },

  // ── BMW 5 Series Touring (premiumPlus, wagon) ─────────────────────
  { id: "bmw-5-touring-520d", brand: "BMW", family: "5 Series Touring", trim: "520d", classId: "premiumPlus", body: "wagon", fuel: "Diesel", hp: 197, topSpeed: 233, accel: 7.6, drivetrain: "RWD", consumption: 5.3, seats: 5 },
  { id: "bmw-5-touring-530i", brand: "BMW", family: "5 Series Touring", trim: "530i", classId: "premiumPlus", body: "wagon", fuel: "Petrol", hp: 258, topSpeed: 250, accel: 6.5, drivetrain: "RWD", consumption: 6.9, seats: 5 },

  // ── BMW X1 (suvSmall, suv) ────────────────────────────────────────
  { id: "bmw-x1-sdrive18i", brand: "BMW", family: "X1", trim: "sDrive18i", classId: "suvSmall", body: "suv", fuel: "Petrol", hp: 136, topSpeed: 207, accel: 9.2, drivetrain: "FWD", consumption: 6.8, seats: 5 },
  { id: "bmw-x1-xdrive23i", brand: "BMW", family: "X1", trim: "xDrive23i", classId: "suvSmall", body: "suv", fuel: "Petrol", hp: 218, topSpeed: 234, accel: 7.1, drivetrain: "AWD", consumption: 7.4, seats: 5 },
  { id: "bmw-x1-xdrive23d", brand: "BMW", family: "X1", trim: "xDrive23d", classId: "suvSmall", body: "suv", fuel: "Diesel", hp: 211, topSpeed: 230, accel: 7.4, drivetrain: "AWD", consumption: 5.4, seats: 5 },

  // ── BMW X3 (suvMid, suv) ──────────────────────────────────────────
  { id: "bmw-x3-xdrive20i", brand: "BMW", family: "X3", trim: "xDrive20i", classId: "suvMid", body: "suv", fuel: "Petrol", hp: 184, topSpeed: 215, accel: 8.3, drivetrain: "AWD", consumption: 7.7, seats: 5 },
  { id: "bmw-x3-xdrive30i", brand: "BMW", family: "X3", trim: "xDrive30i", classId: "suvMid", body: "suv", fuel: "Petrol", hp: 245, topSpeed: 240, accel: 6.6, drivetrain: "AWD", consumption: 8.0, seats: 5 },
  { id: "bmw-x3-xdrive30d", brand: "BMW", family: "X3", trim: "xDrive30d", classId: "suvMid", body: "suv", fuel: "Diesel", hp: 286, topSpeed: 245, accel: 5.8, drivetrain: "AWD", consumption: 6.2, seats: 5 },
  { id: "bmw-x3-m40i", brand: "BMW", family: "X3", trim: "M40i", classId: "suvMid", body: "suv", fuel: "Petrol", hp: 360, topSpeed: 250, accel: 4.9, drivetrain: "AWD", consumption: 9.0, seats: 5 },

  // ── BMW X4 (suvMid, coupe-SUV) ────────────────────────────────────
  { id: "bmw-x4-xdrive20i", brand: "BMW", family: "X4", trim: "xDrive20i", classId: "suvMid", body: "suv", fuel: "Petrol", hp: 184, topSpeed: 215, accel: 8.3, drivetrain: "AWD", consumption: 8.2, seats: 5 },
  { id: "bmw-x4-xdrive30d", brand: "BMW", family: "X4", trim: "xDrive30d", classId: "suvMid", body: "suv", fuel: "Diesel", hp: 286, topSpeed: 247, accel: 5.7, drivetrain: "AWD", consumption: 6.5, seats: 5 },
  { id: "bmw-x4-m40i", brand: "BMW", family: "X4", trim: "M40i", classId: "suvMid", body: "suv", fuel: "Petrol", hp: 360, topSpeed: 250, accel: 4.8, drivetrain: "AWD", consumption: 9.5, seats: 5 },

  // ── BMW X5 (suvPremium, suv) ──────────────────────────────────────
  { id: "bmw-x5-xdrive40i", brand: "BMW", family: "X5", trim: "xDrive40i", classId: "suvPremium", body: "suv", fuel: "Petrol", hp: 381, topSpeed: 243, accel: 5.6, drivetrain: "AWD", consumption: 9.3, seats: 5 },
  { id: "bmw-x5-xdrive40d", brand: "BMW", family: "X5", trim: "xDrive40d", classId: "suvPremium", body: "suv", fuel: "Diesel", hp: 352, topSpeed: 243, accel: 5.9, drivetrain: "AWD", consumption: 7.4, seats: 5 },
  { id: "bmw-x5-m60i", brand: "BMW", family: "X5", trim: "M60i xDrive", classId: "suvPremium", body: "suv", fuel: "Petrol", hp: 530, topSpeed: 250, accel: 4.3, drivetrain: "AWD", consumption: 11.5, seats: 5 },

  // ── BMW M models (sport / sportPlus) ──────────────────────────────
  { id: "bmw-m2-m2", brand: "BMW", family: "M2", trim: "M2", classId: "sport", body: "coupe", fuel: "Petrol", hp: 460, topSpeed: 285, accel: 4.1, drivetrain: "RWD", consumption: 9.8, seats: 4 },
  { id: "bmw-m3-competition", brand: "BMW", family: "M3", trim: "M3 Competition", classId: "sport", body: "sedan", fuel: "Petrol", hp: 510, topSpeed: 290, accel: 3.9, drivetrain: "RWD", consumption: 10.1, seats: 5 },
  { id: "bmw-m4-competition", brand: "BMW", family: "M4", trim: "M4 Competition", classId: "sport", body: "coupe", fuel: "Petrol", hp: 510, topSpeed: 290, accel: 3.9, drivetrain: "RWD", consumption: 10.0, seats: 4 },

  // ── BMW 2 Series Coupe (premium, coupe) ───────────────────────────
  { id: "bmw-2-220i", brand: "BMW", family: "2 Series Coupe", trim: "220i", classId: "premium", body: "coupe", fuel: "Petrol", hp: 184, topSpeed: 236, accel: 7.5, drivetrain: "RWD", consumption: 6.7, seats: 4 },
  { id: "bmw-2-m240i", brand: "BMW", family: "2 Series Coupe", trim: "M240i xDrive", classId: "premium", body: "coupe", fuel: "Petrol", hp: 374, topSpeed: 250, accel: 4.3, drivetrain: "AWD", consumption: 8.0, seats: 4 },

  // ── BMW Z4 (convertible) ──────────────────────────────────────────
  { id: "bmw-z4-sdrive20i", brand: "BMW", family: "Z4", trim: "sDrive20i", classId: "convertible", body: "convertible", fuel: "Petrol", hp: 197, topSpeed: 240, accel: 6.6, drivetrain: "RWD", consumption: 6.8, seats: 2 },
  { id: "bmw-z4-m40i", brand: "BMW", family: "Z4", trim: "M40i", classId: "convertible", body: "convertible", fuel: "Petrol", hp: 340, topSpeed: 250, accel: 4.5, drivetrain: "RWD", consumption: 7.4, seats: 2 },

  // ── BMW electric ──────────────────────────────────────────────────
  { id: "bmw-i4-edrive40", brand: "BMW", family: "i4", trim: "i4 eDrive40", classId: "electric", body: "sedan", fuel: "Electric", hp: 340, topSpeed: 190, accel: 5.7, drivetrain: "RWD", consumption: 16.1, seats: 5 },
  { id: "bmw-ix3-ix3", brand: "BMW", family: "iX3", trim: "iX3", classId: "electric", body: "suv", fuel: "Electric", hp: 286, topSpeed: 180, accel: 6.8, drivetrain: "RWD", consumption: 18.5, seats: 5 },

  // ── Mercedes A-Class (compact, hatch) ─────────────────────────────
  { id: "mercedes-a-a180", brand: "Mercedes", family: "A-Class", trim: "A180", classId: "compact", body: "hatch", fuel: "Petrol", hp: 136, topSpeed: 213, accel: 8.9, drivetrain: "FWD", consumption: 5.9, seats: 5 },
  { id: "mercedes-a-a200", brand: "Mercedes", family: "A-Class", trim: "A200", classId: "compact", body: "hatch", fuel: "Petrol", hp: 163, topSpeed: 227, accel: 8.0, drivetrain: "FWD", consumption: 6.1, seats: 5 },
  { id: "mercedes-a-a220d", brand: "Mercedes", family: "A-Class", trim: "A220d", classId: "compact", body: "hatch", fuel: "Diesel", hp: 190, topSpeed: 235, accel: 7.0, drivetrain: "FWD", consumption: 4.6, seats: 5 },
  { id: "mercedes-a-amg-a35", brand: "Mercedes", family: "A-Class", trim: "AMG A35 4MATIC", classId: "sport", body: "hatch", fuel: "Petrol", hp: 306, topSpeed: 250, accel: 4.7, drivetrain: "AWD", consumption: 7.6, seats: 5 },

  // ── Mercedes C-Class (premium, sedan) ─────────────────────────────
  { id: "mercedes-c-c180", brand: "Mercedes", family: "C-Class", trim: "C180", classId: "premium", body: "sedan", fuel: "Petrol", hp: 170, topSpeed: 231, accel: 8.6, drivetrain: "RWD", consumption: 6.3, seats: 5 },
  { id: "mercedes-c-c200", brand: "Mercedes", family: "C-Class", trim: "C200", classId: "premium", body: "sedan", fuel: "Petrol", hp: 204, topSpeed: 246, accel: 7.3, drivetrain: "RWD", consumption: 6.5, seats: 5 },
  { id: "mercedes-c-c220d", brand: "Mercedes", family: "C-Class", trim: "C220d", classId: "premium", body: "sedan", fuel: "Diesel", hp: 200, topSpeed: 245, accel: 7.3, drivetrain: "RWD", consumption: 4.7, seats: 5 },
  { id: "mercedes-c-c300", brand: "Mercedes", family: "C-Class", trim: "C300", classId: "premium", body: "sedan", fuel: "Petrol", hp: 258, topSpeed: 250, accel: 6.0, drivetrain: "RWD", consumption: 6.9, seats: 5 },
  { id: "mercedes-c-amg-c43", brand: "Mercedes", family: "C-Class", trim: "AMG C43 4MATIC", classId: "sport", body: "sedan", fuel: "Petrol", hp: 408, topSpeed: 250, accel: 4.6, drivetrain: "AWD", consumption: 8.5, seats: 5 },

  // ── Mercedes E-Class (premiumPlus, sedan) ─────────────────────────
  { id: "mercedes-e-e200", brand: "Mercedes", family: "E-Class", trim: "E200", classId: "premiumPlus", body: "sedan", fuel: "Petrol", hp: 204, topSpeed: 240, accel: 7.5, drivetrain: "RWD", consumption: 6.9, seats: 5 },
  { id: "mercedes-e-e220d", brand: "Mercedes", family: "E-Class", trim: "E220d", classId: "premiumPlus", body: "sedan", fuel: "Diesel", hp: 197, topSpeed: 240, accel: 7.4, drivetrain: "RWD", consumption: 5.0, seats: 5 },
  { id: "mercedes-e-e300e", brand: "Mercedes", family: "E-Class", trim: "E300e", classId: "premiumPlus", body: "sedan", fuel: "Plug-in Hybrid", hp: 320, topSpeed: 250, accel: 6.2, drivetrain: "RWD", consumption: 1.0, seats: 5 },
  { id: "mercedes-e-e450", brand: "Mercedes", family: "E-Class", trim: "E450 4MATIC", classId: "premiumPlus", body: "sedan", fuel: "Petrol", hp: 381, topSpeed: 250, accel: 4.5, drivetrain: "AWD", consumption: 8.1, seats: 5 },

  // ── Mercedes CLA (premium, coupe) ─────────────────────────────────
  { id: "mercedes-cla-cla180", brand: "Mercedes", family: "CLA", trim: "CLA180", classId: "premium", body: "coupe", fuel: "Petrol", hp: 136, topSpeed: 210, accel: 9.1, drivetrain: "FWD", consumption: 6.0, seats: 5 },
  { id: "mercedes-cla-cla200", brand: "Mercedes", family: "CLA", trim: "CLA200", classId: "premium", body: "coupe", fuel: "Petrol", hp: 163, topSpeed: 225, accel: 8.2, drivetrain: "FWD", consumption: 6.1, seats: 5 },
  { id: "mercedes-cla-cla220d", brand: "Mercedes", family: "CLA", trim: "CLA220d", classId: "premium", body: "coupe", fuel: "Diesel", hp: 190, topSpeed: 235, accel: 7.1, drivetrain: "FWD", consumption: 4.6, seats: 5 },

  // ── Mercedes CLE (premium coupe / convertible) ────────────────────
  { id: "mercedes-cle-200", brand: "Mercedes", family: "CLE", trim: "200 Coupé", classId: "premium", body: "coupe", fuel: "Petrol", hp: 204, topSpeed: 240, accel: 7.3, drivetrain: "RWD", consumption: 7.0, seats: 4 },
  { id: "mercedes-cle-300", brand: "Mercedes", family: "CLE", trim: "300 4MATIC Coupé", classId: "premium", body: "coupe", fuel: "Petrol", hp: 258, topSpeed: 250, accel: 6.2, drivetrain: "AWD", consumption: 7.6, seats: 4 },
  { id: "mercedes-cle-cabrio", brand: "Mercedes", family: "CLE", trim: "200 Cabriolet", classId: "convertible", body: "convertible", fuel: "Petrol", hp: 204, topSpeed: 237, accel: 7.6, drivetrain: "RWD", consumption: 7.3, seats: 4 },
  { id: "mercedes-cle-amg53", brand: "Mercedes", family: "CLE", trim: "AMG 53 4MATIC+", classId: "sport", body: "coupe", fuel: "Petrol", hp: 449, topSpeed: 250, accel: 4.2, drivetrain: "AWD", consumption: 9.0, seats: 4 },

  // ── Mercedes C-Class Estate (premium, wagon) ──────────────────────
  { id: "mercedes-c-estate-c200", brand: "Mercedes", family: "C-Class Estate", trim: "C200", classId: "premium", body: "wagon", fuel: "Petrol", hp: 204, topSpeed: 244, accel: 7.5, drivetrain: "RWD", consumption: 6.8, seats: 5 },
  { id: "mercedes-c-estate-c220d", brand: "Mercedes", family: "C-Class Estate", trim: "C220d", classId: "premium", body: "wagon", fuel: "Diesel", hp: 200, topSpeed: 243, accel: 7.5, drivetrain: "RWD", consumption: 4.9, seats: 5 },

  // ── Mercedes GLB (suvSmall, suv) ──────────────────────────────────
  { id: "mercedes-glb-glb200", brand: "Mercedes", family: "GLB", trim: "GLB200", classId: "suvSmall", body: "suv", fuel: "Petrol", hp: 163, topSpeed: 207, accel: 9.1, drivetrain: "FWD", consumption: 7.0, seats: 7 },
  { id: "mercedes-glb-glb220d", brand: "Mercedes", family: "GLB", trim: "GLB220d 4MATIC", classId: "suvSmall", body: "suv", fuel: "Diesel", hp: 190, topSpeed: 217, accel: 7.6, drivetrain: "AWD", consumption: 5.4, seats: 7 },

  // ── Mercedes GLA (suvSmall, suv) ──────────────────────────────────
  { id: "mercedes-gla-gla200", brand: "Mercedes", family: "GLA", trim: "GLA200", classId: "suvSmall", body: "suv", fuel: "Petrol", hp: 163, topSpeed: 210, accel: 8.7, drivetrain: "FWD", consumption: 6.6, seats: 5 },
  { id: "mercedes-gla-gla220d", brand: "Mercedes", family: "GLA", trim: "GLA220d 4MATIC", classId: "suvSmall", body: "suv", fuel: "Diesel", hp: 190, topSpeed: 219, accel: 7.3, drivetrain: "AWD", consumption: 5.2, seats: 5 },

  // ── Mercedes GLC (suvMid, suv) ────────────────────────────────────
  { id: "mercedes-glc-glc200", brand: "Mercedes", family: "GLC", trim: "GLC200 4MATIC", classId: "suvMid", body: "suv", fuel: "Petrol", hp: 204, topSpeed: 218, accel: 8.0, drivetrain: "AWD", consumption: 7.8, seats: 5 },
  { id: "mercedes-glc-glc300", brand: "Mercedes", family: "GLC", trim: "GLC300 4MATIC", classId: "suvMid", body: "suv", fuel: "Petrol", hp: 258, topSpeed: 240, accel: 6.2, drivetrain: "AWD", consumption: 8.1, seats: 5 },
  { id: "mercedes-glc-glc300d", brand: "Mercedes", family: "GLC", trim: "GLC300d 4MATIC", classId: "suvMid", body: "suv", fuel: "Diesel", hp: 269, topSpeed: 240, accel: 6.4, drivetrain: "AWD", consumption: 6.0, seats: 5 },
  { id: "mercedes-glc-amg-glc43", brand: "Mercedes", family: "GLC", trim: "AMG GLC43 4MATIC", classId: "suvMid", body: "suv", fuel: "Petrol", hp: 421, topSpeed: 250, accel: 4.8, drivetrain: "AWD", consumption: 9.6, seats: 5 },

  // ── Mercedes GLE (suvPremium, suv) ────────────────────────────────
  { id: "mercedes-gle-gle350de", brand: "Mercedes", family: "GLE", trim: "GLE350de 4MATIC", classId: "suvPremium", body: "suv", fuel: "Plug-in Hybrid", hp: 333, topSpeed: 210, accel: 6.8, drivetrain: "AWD", consumption: 1.2, seats: 5 },
  { id: "mercedes-gle-gle450", brand: "Mercedes", family: "GLE", trim: "GLE450 4MATIC", classId: "suvPremium", body: "suv", fuel: "Petrol", hp: 381, topSpeed: 250, accel: 5.7, drivetrain: "AWD", consumption: 9.8, seats: 5 },

  // ── Mercedes electric ─────────────────────────────────────────────
  { id: "mercedes-eqa-eqa250", brand: "Mercedes", family: "EQA", trim: "EQA 250", classId: "electric", body: "suv", fuel: "Electric", hp: 190, topSpeed: 160, accel: 8.6, drivetrain: "FWD", consumption: 17.7, seats: 5 },
  { id: "mercedes-eqe-eqe350", brand: "Mercedes", family: "EQE", trim: "EQE 350+", classId: "electric", body: "sedan", fuel: "Electric", hp: 292, topSpeed: 210, accel: 6.4, drivetrain: "RWD", consumption: 16.0, seats: 5 },

  // ── Audi A3 (compact, hatch) ──────────────────────────────────────
  { id: "audi-a3-35tfsi", brand: "Audi", family: "A3", trim: "35 TFSI", classId: "compact", body: "hatch", fuel: "Petrol", hp: 150, topSpeed: 224, accel: 8.4, drivetrain: "FWD", consumption: 5.6, seats: 5 },
  { id: "audi-a3-40tfsi", brand: "Audi", family: "A3", trim: "40 TFSI", classId: "compact", body: "hatch", fuel: "Petrol", hp: 190, topSpeed: 235, accel: 6.9, drivetrain: "FWD", consumption: 6.2, seats: 5 },
  { id: "audi-a3-35tdi", brand: "Audi", family: "A3", trim: "35 TDI", classId: "compact", body: "hatch", fuel: "Diesel", hp: 150, topSpeed: 224, accel: 8.4, drivetrain: "FWD", consumption: 4.4, seats: 5 },
  { id: "audi-a3-s3", brand: "Audi", family: "A3", trim: "S3", classId: "sport", body: "hatch", fuel: "Petrol", hp: 333, topSpeed: 250, accel: 4.7, drivetrain: "AWD", consumption: 7.8, seats: 5 },

  // ── Audi A4 (premium, sedan) ──────────────────────────────────────
  { id: "audi-a4-35tfsi", brand: "Audi", family: "A4", trim: "35 TFSI", classId: "premium", body: "sedan", fuel: "Petrol", hp: 150, topSpeed: 222, accel: 9.0, drivetrain: "FWD", consumption: 6.3, seats: 5 },
  { id: "audi-a4-40tfsi", brand: "Audi", family: "A4", trim: "40 TFSI", classId: "premium", body: "sedan", fuel: "Petrol", hp: 204, topSpeed: 241, accel: 7.3, drivetrain: "FWD", consumption: 6.6, seats: 5 },
  { id: "audi-a4-40tdi", brand: "Audi", family: "A4", trim: "40 TDI", classId: "premium", body: "sedan", fuel: "Diesel", hp: 204, topSpeed: 241, accel: 7.4, drivetrain: "AWD", consumption: 4.9, seats: 5 },
  { id: "audi-a4-s4-tdi", brand: "Audi", family: "A4", trim: "S4 TDI", classId: "sport", body: "sedan", fuel: "Diesel", hp: 341, topSpeed: 250, accel: 4.9, drivetrain: "AWD", consumption: 6.7, seats: 5 },

  // ── Audi A6 (premiumPlus, sedan) ──────────────────────────────────
  { id: "audi-a6-40tfsi", brand: "Audi", family: "A6", trim: "40 TFSI", classId: "premiumPlus", body: "sedan", fuel: "Petrol", hp: 204, topSpeed: 241, accel: 8.0, drivetrain: "FWD", consumption: 6.8, seats: 5 },
  { id: "audi-a6-45tfsi", brand: "Audi", family: "A6", trim: "45 TFSI quattro", classId: "premiumPlus", body: "sedan", fuel: "Petrol", hp: 265, topSpeed: 250, accel: 6.1, drivetrain: "AWD", consumption: 7.4, seats: 5 },
  { id: "audi-a6-40tdi", brand: "Audi", family: "A6", trim: "40 TDI", classId: "premiumPlus", body: "sedan", fuel: "Diesel", hp: 204, topSpeed: 246, accel: 7.9, drivetrain: "FWD", consumption: 5.1, seats: 5 },
  { id: "audi-a6-50tdi", brand: "Audi", family: "A6", trim: "50 TDI quattro", classId: "premiumPlus", body: "sedan", fuel: "Diesel", hp: 286, topSpeed: 250, accel: 5.5, drivetrain: "AWD", consumption: 6.2, seats: 5 },

  // ── Audi A4 Avant (premium, wagon) ────────────────────────────────
  { id: "audi-a4-avant-40tfsi", brand: "Audi", family: "A4 Avant", trim: "40 TFSI", classId: "premium", body: "wagon", fuel: "Petrol", hp: 204, topSpeed: 240, accel: 7.6, drivetrain: "FWD", consumption: 6.9, seats: 5 },
  { id: "audi-a4-avant-40tdi", brand: "Audi", family: "A4 Avant", trim: "40 TDI quattro", classId: "premium", body: "wagon", fuel: "Diesel", hp: 204, topSpeed: 238, accel: 7.7, drivetrain: "AWD", consumption: 5.2, seats: 5 },

  // ── Audi A6 Avant (premiumPlus, wagon) ────────────────────────────
  { id: "audi-a6-avant-45tfsi", brand: "Audi", family: "A6 Avant", trim: "45 TFSI quattro", classId: "premiumPlus", body: "wagon", fuel: "Petrol", hp: 265, topSpeed: 250, accel: 6.2, drivetrain: "AWD", consumption: 7.6, seats: 5 },
  { id: "audi-a6-avant-50tdi", brand: "Audi", family: "A6 Avant", trim: "50 TDI quattro", classId: "premiumPlus", body: "wagon", fuel: "Diesel", hp: 286, topSpeed: 250, accel: 5.7, drivetrain: "AWD", consumption: 6.4, seats: 5 },

  // ── Audi A5 Sportback (premium, coupe) ────────────────────────────
  { id: "audi-a5-40tfsi", brand: "Audi", family: "A5", trim: "40 TFSI", classId: "premium", body: "coupe", fuel: "Petrol", hp: 204, topSpeed: 241, accel: 7.3, drivetrain: "FWD", consumption: 6.7, seats: 5 },
  { id: "audi-a5-s5-tdi", brand: "Audi", family: "A5", trim: "S5 TDI", classId: "sport", body: "coupe", fuel: "Diesel", hp: 341, topSpeed: 250, accel: 4.8, drivetrain: "AWD", consumption: 6.8, seats: 5 },

  // ── Audi Q3 (suvSmall, suv) ───────────────────────────────────────
  { id: "audi-q3-35tfsi", brand: "Audi", family: "Q3", trim: "35 TFSI", classId: "suvSmall", body: "suv", fuel: "Petrol", hp: 150, topSpeed: 207, accel: 9.2, drivetrain: "FWD", consumption: 6.8, seats: 5 },
  { id: "audi-q3-40tfsi", brand: "Audi", family: "Q3", trim: "40 TFSI quattro", classId: "suvSmall", body: "suv", fuel: "Petrol", hp: 190, topSpeed: 220, accel: 7.4, drivetrain: "AWD", consumption: 7.6, seats: 5 },
  { id: "audi-q3-35tdi", brand: "Audi", family: "Q3", trim: "35 TDI", classId: "suvSmall", body: "suv", fuel: "Diesel", hp: 150, topSpeed: 207, accel: 9.3, drivetrain: "FWD", consumption: 5.2, seats: 5 },

  // ── Audi Q5 (suvMid, suv) ─────────────────────────────────────────
  { id: "audi-q5-40tfsi", brand: "Audi", family: "Q5", trim: "40 TFSI quattro", classId: "suvMid", body: "suv", fuel: "Petrol", hp: 204, topSpeed: 222, accel: 7.6, drivetrain: "AWD", consumption: 8.0, seats: 5 },
  { id: "audi-q5-45tfsi", brand: "Audi", family: "Q5", trim: "45 TFSI quattro", classId: "suvMid", body: "suv", fuel: "Petrol", hp: 265, topSpeed: 240, accel: 6.3, drivetrain: "AWD", consumption: 8.4, seats: 5 },
  { id: "audi-q5-40tdi", brand: "Audi", family: "Q5", trim: "40 TDI quattro", classId: "suvMid", body: "suv", fuel: "Diesel", hp: 204, topSpeed: 222, accel: 7.6, drivetrain: "AWD", consumption: 5.6, seats: 5 },
  { id: "audi-q5-sq5", brand: "Audi", family: "Q5", trim: "SQ5 TDI", classId: "suvMid", body: "suv", fuel: "Diesel", hp: 341, topSpeed: 250, accel: 5.1, drivetrain: "AWD", consumption: 7.1, seats: 5 },

  // ── Audi RS3 (sportPlus territory but RS3→sport per rules) ────────
  { id: "audi-rs3-rs3", brand: "Audi", family: "RS3", trim: "RS3", classId: "sport", body: "hatch", fuel: "Petrol", hp: 400, topSpeed: 290, accel: 3.8, drivetrain: "AWD", consumption: 8.9, seats: 5 },

  // ── Audi electric ─────────────────────────────────────────────────
  { id: "audi-q4-etron-45", brand: "Audi", family: "Q4 e-tron", trim: "Q4 e-tron 45", classId: "electric", body: "suv", fuel: "Electric", hp: 286, topSpeed: 180, accel: 6.7, drivetrain: "RWD", consumption: 16.6, seats: 5 },

  // ── VW Polo (economy, hatch) ──────────────────────────────────────
  { id: "vw-polo-10tsi", brand: "Volkswagen", family: "Polo", trim: "1.0 TSI", classId: "economy", body: "hatch", fuel: "Petrol", hp: 95, topSpeed: 187, accel: 10.8, drivetrain: "FWD", consumption: 5.4, seats: 5 },

  // ── VW Golf (compact, hatch) ──────────────────────────────────────
  { id: "vw-golf-15tsi", brand: "Volkswagen", family: "Golf", trim: "1.5 TSI", classId: "compact", body: "hatch", fuel: "Petrol", hp: 150, topSpeed: 224, accel: 8.5, drivetrain: "FWD", consumption: 5.7, seats: 5 },
  { id: "vw-golf-20tdi", brand: "Volkswagen", family: "Golf", trim: "2.0 TDI", classId: "compact", body: "hatch", fuel: "Diesel", hp: 150, topSpeed: 223, accel: 8.4, drivetrain: "FWD", consumption: 4.5, seats: 5 },

  // ── VW Golf GTI / R (sport, hatch) ────────────────────────────────
  { id: "vw-golf-gti", brand: "Volkswagen", family: "Golf GTI", trim: "GTI", classId: "sport", body: "hatch", fuel: "Petrol", hp: 265, topSpeed: 250, accel: 5.9, drivetrain: "FWD", consumption: 7.4, seats: 5 },
  { id: "vw-golf-r", brand: "Volkswagen", family: "Golf R", trim: "R", classId: "sport", body: "hatch", fuel: "Petrol", hp: 333, topSpeed: 270, accel: 4.6, drivetrain: "AWD", consumption: 8.0, seats: 5 },

  // ── VW Golf Variant (compact, wagon) ──────────────────────────────
  { id: "vw-golf-variant-15tsi", brand: "Volkswagen", family: "Golf Variant", trim: "1.5 TSI", classId: "compact", body: "wagon", fuel: "Petrol", hp: 150, topSpeed: 222, accel: 8.8, drivetrain: "FWD", consumption: 5.9, seats: 5 },
  { id: "vw-golf-variant-20tdi", brand: "Volkswagen", family: "Golf Variant", trim: "2.0 TDI", classId: "compact", body: "wagon", fuel: "Diesel", hp: 150, topSpeed: 221, accel: 8.7, drivetrain: "FWD", consumption: 4.7, seats: 5 },

  // ── VW Passat (intermediate, wagon) ───────────────────────────────
  { id: "vw-passat-15etsi", brand: "Volkswagen", family: "Passat", trim: "1.5 eTSI", classId: "intermediate", body: "wagon", fuel: "Hybrid", hp: 150, topSpeed: 220, accel: 9.1, drivetrain: "FWD", consumption: 6.0, seats: 5 },
  { id: "vw-passat-20tdi", brand: "Volkswagen", family: "Passat", trim: "2.0 TDI", classId: "intermediate", body: "wagon", fuel: "Diesel", hp: 150, topSpeed: 222, accel: 9.0, drivetrain: "FWD", consumption: 5.0, seats: 5 },

  // ── VW Tiguan (suvSmall, suv) ─────────────────────────────────────
  { id: "vw-tiguan-15etsi", brand: "Volkswagen", family: "Tiguan", trim: "1.5 eTSI", classId: "suvSmall", body: "suv", fuel: "Hybrid", hp: 150, topSpeed: 205, accel: 9.4, drivetrain: "FWD", consumption: 6.7, seats: 5 },
  { id: "vw-tiguan-20tdi", brand: "Volkswagen", family: "Tiguan", trim: "2.0 TDI", classId: "suvSmall", body: "suv", fuel: "Diesel", hp: 150, topSpeed: 205, accel: 9.3, drivetrain: "FWD", consumption: 5.6, seats: 5 },

  // ── VW electric ───────────────────────────────────────────────────
  { id: "vw-id3-pro", brand: "Volkswagen", family: "ID.3", trim: "Pro", classId: "electric", body: "hatch", fuel: "Electric", hp: 204, topSpeed: 160, accel: 7.4, drivetrain: "RWD", consumption: 15.5, seats: 5 },
  { id: "vw-id4-pro", brand: "Volkswagen", family: "ID.4", trim: "Pro", classId: "electric", body: "suv", fuel: "Electric", hp: 286, topSpeed: 180, accel: 6.7, drivetrain: "RWD", consumption: 16.8, seats: 5 },

  // ── Tesla Model 3 (electric, sedan) ───────────────────────────────
  { id: "tesla-model3-rwd", brand: "Tesla", family: "Model 3", trim: "RWD", classId: "electric", body: "sedan", fuel: "Electric", hp: 283, topSpeed: 201, accel: 6.1, drivetrain: "RWD", consumption: 13.2, seats: 5 },
  { id: "tesla-model3-long-range", brand: "Tesla", family: "Model 3", trim: "Long Range", classId: "electric", body: "sedan", fuel: "Electric", hp: 498, topSpeed: 201, accel: 4.4, drivetrain: "AWD", consumption: 14.0, seats: 5 },
  { id: "tesla-model3-performance", brand: "Tesla", family: "Model 3", trim: "Performance", classId: "electric", body: "sedan", fuel: "Electric", hp: 460, topSpeed: 261, accel: 3.1, drivetrain: "AWD", consumption: 15.0, seats: 5 },

  // ── Tesla Model Y (electric, suv) ─────────────────────────────────
  { id: "tesla-modely-rwd", brand: "Tesla", family: "Model Y", trim: "RWD", classId: "electric", body: "suv", fuel: "Electric", hp: 295, topSpeed: 217, accel: 6.9, drivetrain: "RWD", consumption: 15.0, seats: 5 },
  { id: "tesla-modely-long-range", brand: "Tesla", family: "Model Y", trim: "Long Range", classId: "electric", body: "suv", fuel: "Electric", hp: 514, topSpeed: 217, accel: 5.0, drivetrain: "AWD", consumption: 15.7, seats: 5 },
  { id: "tesla-modely-performance", brand: "Tesla", family: "Model Y", trim: "Performance", classId: "electric", body: "suv", fuel: "Electric", hp: 460, topSpeed: 250, accel: 3.7, drivetrain: "AWD", consumption: 16.9, seats: 5 },

  // ── Porsche Cayenne (suvLuxury, suv) ──────────────────────────────
  { id: "porsche-cayenne-cayenne", brand: "Porsche", family: "Cayenne", trim: "Cayenne", classId: "suvLuxury", body: "suv", fuel: "Petrol", hp: 353, topSpeed: 248, accel: 6.0, drivetrain: "AWD", consumption: 11.4, seats: 5 },
  { id: "porsche-cayenne-s", brand: "Porsche", family: "Cayenne", trim: "Cayenne S", classId: "suvLuxury", body: "suv", fuel: "Petrol", hp: 474, topSpeed: 273, accel: 4.7, drivetrain: "AWD", consumption: 12.5, seats: 5 },

  // ── Porsche Macan (suvPremium, suv) ───────────────────────────────
  { id: "porsche-macan-macan", brand: "Porsche", family: "Macan", trim: "Macan", classId: "suvPremium", body: "suv", fuel: "Petrol", hp: 265, topSpeed: 232, accel: 6.2, drivetrain: "AWD", consumption: 10.7, seats: 5 },
  { id: "porsche-macan-s", brand: "Porsche", family: "Macan", trim: "Macan S", classId: "suvPremium", body: "suv", fuel: "Petrol", hp: 380, topSpeed: 259, accel: 4.6, drivetrain: "AWD", consumption: 11.7, seats: 5 },

  // ── Porsche 911 / 718 (sportPlus / sport) ─────────────────────────
  { id: "porsche-911-carrera", brand: "Porsche", family: "911", trim: "Carrera", classId: "sportPlus", body: "coupe", fuel: "Petrol", hp: 394, topSpeed: 294, accel: 4.1, drivetrain: "RWD", consumption: 10.8, seats: 4 },
  { id: "porsche-718-cayman", brand: "Porsche", family: "718", trim: "Cayman", classId: "sport", body: "coupe", fuel: "Petrol", hp: 300, topSpeed: 275, accel: 5.1, drivetrain: "RWD", consumption: 9.0, seats: 2 },

  // ── Skoda Octavia (midsize, wagon) ────────────────────────────────
  { id: "skoda-octavia-15tsi", brand: "Skoda", family: "Octavia", trim: "1.5 TSI", classId: "midsize", body: "wagon", fuel: "Petrol", hp: 150, topSpeed: 224, accel: 8.5, drivetrain: "FWD", consumption: 5.8, seats: 5 },
  { id: "skoda-octavia-20tdi", brand: "Skoda", family: "Octavia", trim: "2.0 TDI", classId: "midsize", body: "wagon", fuel: "Diesel", hp: 150, topSpeed: 223, accel: 8.6, drivetrain: "FWD", consumption: 4.8, seats: 5 },

  // ── Skoda Superb (intermediate, wagon) ────────────────────────────
  { id: "skoda-superb-20tdi", brand: "Skoda", family: "Superb", trim: "2.0 TDI", classId: "intermediate", body: "wagon", fuel: "Diesel", hp: 150, topSpeed: 220, accel: 9.4, drivetrain: "FWD", consumption: 5.2, seats: 5 },

  // ── Opel Corsa (economy, hatch) ───────────────────────────────────
  { id: "opel-corsa-12", brand: "Opel", family: "Corsa", trim: "1.2", classId: "economy", body: "hatch", fuel: "Petrol", hp: 100, topSpeed: 190, accel: 10.2, drivetrain: "FWD", consumption: 5.5, seats: 5 },

  // ── Opel Astra (compact, hatch) ───────────────────────────────────
  { id: "opel-astra-12", brand: "Opel", family: "Astra", trim: "1.2", classId: "compact", body: "hatch", fuel: "Petrol", hp: 130, topSpeed: 210, accel: 9.7, drivetrain: "FWD", consumption: 5.6, seats: 5 },

  // ── Ford Focus (compact, hatch) ───────────────────────────────────
  { id: "ford-focus-10ecoboost", brand: "Ford", family: "Focus", trim: "1.0 EcoBoost", classId: "compact", body: "hatch", fuel: "Petrol", hp: 125, topSpeed: 200, accel: 10.0, drivetrain: "FWD", consumption: 5.7, seats: 5 },

  // ── Mini Cooper (compact, hatch) ──────────────────────────────────
  { id: "mini-cooper-cooper", brand: "Mini", family: "Cooper", trim: "Cooper", classId: "compact", body: "hatch", fuel: "Petrol", hp: 156, topSpeed: 225, accel: 7.7, drivetrain: "FWD", consumption: 5.8, seats: 4 },

  // ── Fiat 500 (mini, hatch) ────────────────────────────────────────
  { id: "fiat-500-500", brand: "Fiat", family: "500", trim: "500", classId: "mini", body: "hatch", fuel: "Petrol", hp: 70, topSpeed: 167, accel: 12.9, drivetrain: "FWD", consumption: 5.0, seats: 4 },

  // ── Volvo XC40 (suvSmall, suv) ────────────────────────────────────
  { id: "volvo-xc40-b4", brand: "Volvo", family: "XC40", trim: "B4", classId: "suvSmall", body: "suv", fuel: "Hybrid", hp: 197, topSpeed: 180, accel: 8.4, drivetrain: "FWD", consumption: 7.3, seats: 5 },

  // ── Volvo XC60 (suvMid, suv) ──────────────────────────────────────
  { id: "volvo-xc60-b5", brand: "Volvo", family: "XC60", trim: "B5", classId: "suvMid", body: "suv", fuel: "Hybrid", hp: 250, topSpeed: 180, accel: 7.0, drivetrain: "AWD", consumption: 8.1, seats: 5 }
];

export const VARIANT_BY_ID: Record<string, CarVariant> = Object.fromEntries(
  CAR_VARIANTS.map((v) => [v.id, v])
);

/** Full display name, e.g. "BMW 5 Series 530i". */
export function variantLabel(v: CarVariant): string {
  return `${v.brand} ${v.family} ${v.trim}`;
}

/** Search variants by brand / family / trim words. */
export function searchVariants(query: string): CarVariant[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const words = q.split(/\s+/).filter(Boolean);
  return CAR_VARIANTS.filter((v) => {
    const hay = `${v.brand} ${v.family} ${v.trim}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  }).slice(0, 12);
}

/** Combined-consumption label with the right unit. */
export function consumptionLabel(v: CarVariant): string {
  return v.fuel === "Electric"
    ? `${v.consumption} kWh/100km`
    : `${v.consumption} l/100km`;
}

