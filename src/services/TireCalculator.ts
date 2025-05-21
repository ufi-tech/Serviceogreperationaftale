/**
 * TireCalculator - Service til beregning af dæk-holdbarhed og prisjustering
 * Baseret på køreklar vægt, antal hestekræfter og årligt kørte kilometer
 */

// Basale kategorier for køretøjsvægt
export enum WeightCategory {
  LIGHT = 'light',     // Under 1300 kg
  MEDIUM = 'medium',   // 1300-1800 kg
  HEAVY = 'heavy',     // Over 1800 kg
}

// Basale kategorier for motoreffekt
export enum PowerCategory {
  LOW = 'low',         // Under 120 hk
  MEDIUM = 'medium',   // 120-200 hk
  HIGH = 'high',       // Over 200 hk
}

// Basale kategorier for årligt kørselsbehov
export enum KmCategory {
  LOW = 'low',         // Under 15.000 km/år
  MEDIUM = 'medium',   // 15.000-30.000 km/år
  HIGH = 'high',       // Over 30.000 km/år
}

interface TireCalculationParams {
  weight: number;       // Vægt i kg
  horsePower: number;   // Hestekræfter
  annualKm: number;     // Kilometer per år
  tireType?: string;    // Dæktype (standard, premium, budget)
  tireDiameter?: number; // Dækdiameter i tommer
}

interface TireCalculationResult {
  estimatedLifespan: number;  // Forventet levetid i km
  priceAdjustment: number;    // Prisjustering i procent
  recommendedTireChange: number; // Anbefalet dækskift i måneder
  wearFactor: number;         // Slidfaktor (1-10)
  weightCategory: WeightCategory;
  powerCategory: PowerCategory;
  kmCategory: KmCategory;
}

/**
 * Beregn forventet dækholdbarhed baseret på bilens egenskaber
 */
export function calculateTireDurability(params: TireCalculationParams): TireCalculationResult {
  // Kategoriser bilen baseret på vægt
  const weightCategory = categorizeWeight(params.weight);
  
  // Kategoriser bilen baseret på hestekræfter
  const powerCategory = categorizePower(params.horsePower);
  
  // Kategoriser årligt kørselsbehov
  const kmCategory = categorizeAnnualKm(params.annualKm);
  
  // Beregn slidfaktor baseret på vægt, hestekræfter og dæktype
  const wearFactor = calculateWearFactor(weightCategory, powerCategory, params.tireType);
  
  // Beregn estimeret dæklevetid i km
  const estimatedLifespan = calculateLifespan(wearFactor, params.tireType);
  
  // Beregn hvor ofte dæk bør skiftes baseret på årlig kørsel
  const recommendedTireChange = Math.max(12, Math.floor(estimatedLifespan / params.annualKm * 12));
  
  // Beregn prisjustering baseret på alle faktorer
  const priceAdjustment = calculatePriceAdjustment(
    weightCategory, 
    powerCategory, 
    kmCategory, 
    params.tireDiameter
  );
  
  return {
    estimatedLifespan,
    priceAdjustment,
    recommendedTireChange,
    wearFactor,
    weightCategory,
    powerCategory,
    kmCategory
  };
}

/**
 * Kategori-hjælpefunktioner
 */
function categorizeWeight(weight: number): WeightCategory {
  if (weight < 1300) return WeightCategory.LIGHT;
  if (weight <= 1800) return WeightCategory.MEDIUM;
  return WeightCategory.HEAVY;
}

function categorizePower(horsePower: number): PowerCategory {
  if (horsePower < 120) return PowerCategory.LOW;
  if (horsePower <= 200) return PowerCategory.MEDIUM;
  return PowerCategory.HIGH;
}

function categorizeAnnualKm(annualKm: number): KmCategory {
  if (annualKm < 15000) return KmCategory.LOW;
  if (annualKm <= 30000) return KmCategory.MEDIUM;
  return KmCategory.HIGH;
}

/**
 * Beregn slidfaktor (1-10) baseret på bilens kategorier
 * Højere værdi = hurtigere slid
 */
function calculateWearFactor(
  weightCategory: WeightCategory, 
  powerCategory: PowerCategory,
  tireType?: string
): number {
  // Basisværdier for hver kategori
  const weightFactors = {
    [WeightCategory.LIGHT]: 1,
    [WeightCategory.MEDIUM]: 2,
    [WeightCategory.HEAVY]: 3,
  };
  
  const powerFactors = {
    [PowerCategory.LOW]: 1,
    [PowerCategory.MEDIUM]: 2.5,
    [PowerCategory.HIGH]: 4,
  };
  
  // Basis slidfaktor
  let wearFactor = weightFactors[weightCategory] + powerFactors[powerCategory];
  
  // Juster for dæktypen
  if (tireType === 'premium') {
    wearFactor *= 0.8; // Premium dæk holder længere
  } else if (tireType === 'budget') {
    wearFactor *= 1.2; // Budget dæk slider hurtigere
  }
  
  // Normalisér til 1-10 skala
  return Math.min(10, Math.max(1, wearFactor));
}

/**
 * Beregn forventet levetid for dæk baseret på slidfaktor
 */
function calculateLifespan(wearFactor: number, tireType?: string): number {
  // Basislevetid (højere er bedre)
  const baseLifespan = 50000;
  
  // Standardfaktor baseret på dæktype
  let typeMultiplier = 1;
  if (tireType === 'premium') {
    typeMultiplier = 1.3; // Premium dæk holder længere
  } else if (tireType === 'budget') {
    typeMultiplier = 0.8; // Budget dæk holder kortere
  }
  
  // Beregn levetid baseret på slidfaktor (omvendt forhold)
  // Slidfaktor 1 = meget lidt slid = længere levetid
  // Slidfaktor 10 = meget slid = kortere levetid
  const slidFaktorMultiplier = 1 - ((wearFactor - 1) / 9) * 0.7;
  
  return Math.round(baseLifespan * typeMultiplier * slidFaktorMultiplier);
}

/**
 * Beregn prisjustering baseret på alle faktorer
 * Returnerer en procent, hvor positiv = prisstigning, negativ = prisreduktion
 */
function calculatePriceAdjustment(
  weightCategory: WeightCategory,
  powerCategory: PowerCategory,
  kmCategory: KmCategory,
  tireDiameter?: number
): number {
  // Basisjusteringer per kategori
  const weightAdjustments = {
    [WeightCategory.LIGHT]: 0,
    [WeightCategory.MEDIUM]: 10,
    [WeightCategory.HEAVY]: 20,
  };
  
  const powerAdjustments = {
    [PowerCategory.LOW]: 0,
    [PowerCategory.MEDIUM]: 5,
    [PowerCategory.HIGH]: 15,
  };
  
  const kmAdjustments = {
    [KmCategory.LOW]: -5,
    [KmCategory.MEDIUM]: 0,
    [KmCategory.HIGH]: 10,
  };
  
  // Beregn den samlede justering
  let adjustment = weightAdjustments[weightCategory] + 
                   powerAdjustments[powerCategory] + 
                   kmAdjustments[kmCategory];
  
  // Juster for dækstørrelse hvis angivet
  if (tireDiameter) {
    if (tireDiameter <= 16) {
      adjustment -= 5; // Mindre dæk er billigere
    } else if (tireDiameter >= 19) {
      adjustment += 10; // Større dæk er dyrere
    }
  }
  
  return adjustment;
}

/**
 * Eksporterede hjælpefunktioner til admin-interface
 */
export function getWeightCategoryLabel(category: WeightCategory): string {
  const labels = {
    [WeightCategory.LIGHT]: 'Let (under 1300 kg)',
    [WeightCategory.MEDIUM]: 'Medium (1300-1800 kg)',
    [WeightCategory.HEAVY]: 'Tung (over 1800 kg)',
  };
  return labels[category];
}

export function getPowerCategoryLabel(category: PowerCategory): string {
  const labels = {
    [PowerCategory.LOW]: 'Lav (under 120 hk)',
    [PowerCategory.MEDIUM]: 'Medium (120-200 hk)',
    [PowerCategory.HIGH]: 'Høj (over 200 hk)',
  };
  return labels[category];
}

export function getKmCategoryLabel(category: KmCategory): string {
  const labels = {
    [KmCategory.LOW]: 'Lav (under 15.000 km/år)',
    [KmCategory.MEDIUM]: 'Medium (15.000-30.000 km/år)',
    [KmCategory.HIGH]: 'Høj (over 30.000 km/år)',
  };
  return labels[category];
}

export default {
  calculateTireDurability,
  getWeightCategoryLabel,
  getPowerCategoryLabel,
  getKmCategoryLabel,
  WeightCategory,
  PowerCategory,
  KmCategory
};
