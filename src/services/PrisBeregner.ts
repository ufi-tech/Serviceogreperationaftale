import { CountryOption } from '../data/countryData';
import { DaekPrisJusteringService } from './DaekPrisJusteringService';
import { getTires, getTirePricingConfig, TireData, TirePricingConfig } from '../api/tiresApi';
import TireCalculator from './TireCalculator';

// Interfaces for beregning
export interface HkKategori {
  id: number;
  minHK: number;
  maxHK: number;
  name: string;
  basePris: number;
}

export interface DaekBrandKategori {
  budget: number;
  economy: number;
  premium: number;
}

export interface MaxValues {
  maxAlderVedIndtegning: number;
  maxKmVedIndtegning: number;
}

export interface RabatStruktur {
  fabriksgaranti: {
    "2 år": number;
    "3 år": number;
    "4 år": number;
    "5+ år": number;
  }
}

export interface PriserPerKm {
  "15000": number;
  "20000": number;
  "25000": number;
  "30000": number;
  "35000": number;
  "40000": number;
  "45000": number;
  "50000": number;
  "55000": number;
  "60000": number;
}

export interface PriserPerLoebetid {
  "12": number;
  "24": number;
  "36": number;
  "48": number;
  "60": number;
}

export interface AftalePrisBeregningData {
  // Bil data
  hk: number;
  bilAlder: number;
  kilometer: number;
  isVarebil: boolean;
  koereklarVaegt?: number; // Tilføjet køreklar vægt
  fabriksGarantiAar: number; // 0 for ingen fabriksgaranti
  
  // Aftale detaljer
  kmPerAar: "15000" | "20000" | "25000" | "30000" | "35000" | "40000" | "45000" | "50000" | "55000" | "60000";
  loebetidMaaneder: "12" | "24" | "36" | "48" | "60";
  inkluderVejhjaelp: boolean;
  aftaletype: "service" | "service_reparation";
  
  // Dæk relateret
  daekBrandKategori?: "budget" | "economy" | "premium";
  daekDimension?: {
    bredde: number;
    profil: number;
    diameter: number;
  }
  // For forskellige størrelser på for- og bagaksel
  forskelligeDaekStoerrelserForBag?: boolean;
  daekDimensionBag?: {
    bredde: number;
    profil: number;
    diameter: number;
  }
  
  // Mønsterdybde på dæk (1.6mm er lovkrav, 8mm er nye dæk)
  daekMoensterdybde?: number;
  
  // Flag for om dækken er nye og allerede betalt
  daekErNye?: boolean;
  
  // Pris for ekstra fælge
  ekstraFaelgePris?: number;
  
  // Garantiforsikring
  garantiForsikring?: {
    valgt: boolean;
    udbyder: string;
    pris: number;
    forhandlerBetaler50Procent: boolean;
  };
  
  // Land og moms
  selectedCountry: CountryOption;
  erPrivat: boolean;
}

export interface BeregnResultat {
  grundpris: number;
  rabatter: {
    fabriksGaranti: number;
    loebetid: number;
    total: number;
  };
  tillaeg: {
    varebil: number;
    kmAar: number;
    total: number;
  };
  daekpris: number;
  vejhjaelpPris: number;
  garantiForsikringPris: number; // Tilføjet for garantiforsikring
  subtotal: number;
  moms: number;
  totalPris: number;
  maanedligPris: number;
}

// Hent data fra localStorage (eller brug standardværdier)
const getHkKategorier = (): HkKategori[] => {
  const savedKategorier = localStorage.getItem('hkKategorier');
  if (savedKategorier) {
    return JSON.parse(savedKategorier);
  }
  
  // Standardværdier
  return [
    { id: 1, minHK: 0, maxHK: 100, name: "Lille", basePris: 199 },
    { id: 2, minHK: 101, maxHK: 150, name: "Mellem", basePris: 249 },
    { id: 3, minHK: 151, maxHK: 200, name: "Stor", basePris: 299 },
    { id: 4, minHK: 201, maxHK: 300, name: "Premium", basePris: 349 },
    { id: 5, minHK: 301, maxHK: 500, name: "Luksus", basePris: 399 },
  ];
};

const getVarebilTillaeg = (): number => {
  const savedTillaeg = localStorage.getItem('varebilTillaeg');
  return savedTillaeg ? parseFloat(savedTillaeg) : 15; // 15% standard
};

const getRabatStruktur = (): RabatStruktur => {
  const savedRabatStruktur = localStorage.getItem('rabatStruktur');
  if (savedRabatStruktur) {
    return JSON.parse(savedRabatStruktur);
  }
  
  // Standardværdier
  return {
    fabriksgaranti: {
      "2 år": 10, // 10% rabat ved 2 års fabriksgaranti
      "3 år": 15, // 15% rabat ved 3 års fabriksgaranti 
      "4 år": 20, // 20% rabat ved 4 års fabriksgaranti
      "5+ år": 25, // 25% rabat ved 5+ års fabriksgaranti
    }
  };
};

const getPriserPerKm = (): PriserPerKm => {
  const savedPriser = localStorage.getItem('priserPerKm');
  if (savedPriser) {
    return JSON.parse(savedPriser);
  }
  
  // Standardværdier
  return {
    "15000": 1.0,   // Basispris ved 15.000 km/år
    "20000": 1.15,  // 15% tillæg ved 20.000 km/år
    "25000": 1.25,  // 25% tillæg ved 25.000 km/år
    "30000": 1.35,  // 35% tillæg ved 30.000 km/år
    "35000": 1.45,  // 45% tillæg ved 35.000 km/år
    "40000": 1.55,  // 55% tillæg ved 40.000 km/år
    "45000": 1.65,  // 65% tillæg ved 45.000 km/år
    "50000": 1.75,  // 75% tillæg ved 50.000 km/år
    "55000": 1.85,  // 85% tillæg ved 55.000 km/år
    "60000": 2.0,   // 100% tillæg ved 60.000 km/år
  };
};

const getPriserPerLoebetid = (): PriserPerLoebetid => {
  const savedPriser = localStorage.getItem('priserPerLoebetid');
  if (savedPriser) {
    return JSON.parse(savedPriser);
  }
  
  // Standardværdier
  return {
    "12": 1.0,   // Basispris ved 12 måneder løbetid
    "24": 0.95,  // 5% rabat ved 24 måneder løbetid
    "36": 0.90,  // 10% rabat ved 36 måneder løbetid
    "48": 0.85,  // 15% rabat ved 48 måneder løbetid
    "60": 0.80,  // 20% rabat ved 60 måneder løbetid
  };
};

const getDaekPriser = (): DaekBrandKategori => {
  const savedPriser = localStorage.getItem('daekPriser');
  if (savedPriser) {
    return JSON.parse(savedPriser);
  }
  
  // Standardværdier - månedlig pris pr. kategori
  return {
    budget: 99,
    economy: 149,
    premium: 199
  };
};

// Find HK-kategori baseret på bilens HK
const findHkKategori = (hk: number): HkKategori | undefined => {
  const kategorier = getHkKategorier();
  return kategorier.find(kategori => hk >= kategori.minHK && hk <= kategori.maxHK);
};

// Beregn fabriksgarantirabat
const beregnFabriksGarantiRabat = (garantiAar: number): number => {
  const rabatStruktur = getRabatStruktur().fabriksgaranti;
  
  if (garantiAar <= 0) return 0;
  if (garantiAar === 2) return rabatStruktur["2 år"];
  if (garantiAar === 3) return rabatStruktur["3 år"];
  if (garantiAar === 4) return rabatStruktur["4 år"];
  if (garantiAar >= 5) return rabatStruktur["5+ år"];
  
  return 0;
};

// Beregn varebilstillæg
const beregnVarebilTillaeg = (isVarebil: boolean): number => {
  if (!isVarebil) return 0;
  return getVarebilTillaeg();
};

// Beregn prisfaktor baseret på km/år
const beregnKmAarFaktor = (kmPerAar: keyof PriserPerKm): number => {
  return getPriserPerKm()[kmPerAar];
};

// Beregn prisfaktor baseret på løbetid
const beregnLoebetidFaktor = (loebetidMaaneder: keyof PriserPerLoebetid): number => {
  return getPriserPerLoebetid()[loebetidMaaneder];
};

// Funktion til at beregne mønsterdybdejustering
const beregnMoensterdybdeJustering = (moensterdybde?: number): number => {
  if (moensterdybde === undefined) return 1.0; // Ingen justering hvis ikke angivet
  
  // Normaliseret mønsterdybde (mellem lovkravet 1.6mm og 8mm for nye dæk)
  // Hvis mønsterdybden er mindre end lovkravet, sættes den til lovkravet
  const normalizedDybde = Math.max(1.6, Math.min(8.0, moensterdybde));
  
  // Værdi af dæk baseret på mønsterdybde:
  // - 8mm (nye dæk): 100% værdi
  // - 3mm eller mindre: 0% værdi
  
  // Hvis mønsterdybden er 3mm eller mindre, er dækkets værdi 0
  if (normalizedDybde <= 3.0) {
    return 0.0;
  }
  
  // Linear interpolation mellem 3mm (0% værdi) og 8mm (100% værdi)
  const range = 8.0 - 3.0; // Forskellen mellem ny og slidte dæk
  const værdiProcent = (normalizedDybde - 3.0) / range; // 0 (3mm) til 1 (8mm)
  
  return værdiProcent;
};


// Asynchronous version of tire price calculation
export const beregnDaekPrisAsync = async (
  kategori: "budget" | "economy" | "premium" | undefined,
  dimensionFor?: { bredde: number; profil: number; diameter: number },
  forskelligeStoerrelserForBag: boolean = false,
  dimensionBag?: { bredde: number; profil: number; diameter: number },
  moensterdybde?: number,
  erNye?: boolean,
  ekstraFaelgePris: number = 0,
  annualKm: number = 15000,
  contractMonths: number = 36
): Promise<number> => {
  if (!kategori || !dimensionFor) return 0;
  // Build tire size string
  const sizeStr = `${dimensionFor.bredde}/${dimensionFor.profil}R${dimensionFor.diameter}`;
  // Fetch tire catalog
  const tires: TireData[] = await getTires({ size: sizeStr, category: kategori });
  const tire = tires[0];
  if (!tire) return 0;
  // Fetch pricing config
  const config: TirePricingConfig = await getTirePricingConfig();
  // Calculate base price (net + margin + mounting + disposal)
  const perTirePrice = tire.basePrice + config.marginPerTire + config.mountingFeePerTire + config.disposalFeePerTire;
  // Estimate durability
  const durability = TireCalculator.calculateTireDurability({
    weight: 1500, // TODO: Pass real value
    horsePower: 120, // TODO: Pass real value
    annualKm,
    tireType: kategori,
    tireDiameter: dimensionFor.diameter
  });
  const kmPerTire = durability.estimatedLifespan;
  // How many tires needed in contract period?
  const contractYears = contractMonths / 12;
  const totalKm = annualKm * contractYears;
  const tiresNeeded = Math.ceil(totalKm / kmPerTire) * 4; // 4 tires per set
  // Total tire cost
  let totalTireCost = perTirePrice * tiresNeeded;
  if (ekstraFaelgePris) totalTireCost += ekstraFaelgePris;
  // Monthly price
  const monthlyPrice = totalTireCost / contractMonths;
  return Math.round(monthlyPrice);
};

// Keep the old sync version for compatibility (returns 0 always)
const beregnDaekPris = (
  kategori: "budget" | "economy" | "premium" | undefined,
  dimensionFor?: { bredde: number; profil: number; diameter: number },
  forskelligeStoerrelserForBag: boolean = false,
  dimensionBag?: { bredde: number; profil: number; diameter: number },
  moensterdybde?: number,
  erNye?: boolean,
  ekstraFaelgePris: number = 0
): number => {
  // Deprecated, brug beregnDaekPrisAsync i stedet.
  return 0;
};

// Fast månedlig pris for vejhjælp
const beregnVejhjaelpPris = (): number => {
  return 29;
};

const beregnMoms = (pris: number, vatRate: number, erPrivat: boolean): number => {
  if (!erPrivat) return 0; // Ingen moms for erhverv
  return pris * vatRate;
};

// Hovedberegningsfunktion
// Async version of main calculation function
export const beregnAftalePrisAsync = async (data: AftalePrisBeregningData): Promise<BeregnResultat> => {
  // Find HK-kategori og basis pris
  const hkKategori = findHkKategori(data.hk);
  if (!hkKategori) {
    throw new Error(`Kunne ikke finde HK-kategori for ${data.hk}HK`);
  }
  const grundpris = hkKategori.basePris;
  // Beregn rabatter
  const fabriksGarantiRabatProcent = beregnFabriksGarantiRabat(data.fabriksGarantiAar);
  const fabriksGarantiRabat = grundpris * (fabriksGarantiRabatProcent / 100);
  const loebetidFaktor = beregnLoebetidFaktor(data.loebetidMaaneder);
  const loebetidRabat = grundpris * (1 - loebetidFaktor);
  const totalRabat = fabriksGarantiRabat + loebetidRabat;
  // Beregn tillæg
  const varebilTillaegProcent = beregnVarebilTillaeg(data.isVarebil);
  const varebilTillaeg = grundpris * (varebilTillaegProcent / 100);
  const kmAarFaktor = beregnKmAarFaktor(data.kmPerAar);
  const kmAarTillaeg = grundpris * (kmAarFaktor - 1);
  const totalTillaeg = varebilTillaeg + kmAarTillaeg;
  // Beregn dækpris og vejhjælp hvis valgt
  const daekpris = await beregnDaekPrisAsync(
    data.daekBrandKategori,
    data.daekDimension,
    data.forskelligeDaekStoerrelserForBag || false,
    data.daekDimensionBag,
    data.daekMoensterdybde,
    data.daekErNye,
    data.ekstraFaelgePris || 0,
    parseInt(data.kmPerAar, 10),
    parseInt(data.loebetidMaaneder, 10)
  );
  const vejhjaelpPris = data.inkluderVejhjaelp ? beregnVejhjaelpPris() : 0;
  // Beregn subtotal uden moms
  const subtotal = (grundpris - totalRabat + totalTillaeg + daekpris + vejhjaelpPris);
  // Beregn moms hvis privat
  const momsProcent = data.selectedCountry.vatRate / 100;
  const moms = beregnMoms(subtotal, momsProcent, data.erPrivat);
  // Beregn total og månedlig pris
  const totalPris = subtotal + moms;
  const maanedligPris = totalPris;
  // Beregn garantiforsikringspris (kun hvis valgt og kun for serviceaftale)
  let garantiForsikringPris = 0;
  if (data.garantiForsikring?.valgt && data.aftaletype === 'service') {
    let aarligPraemie = data.garantiForsikring.pris;
    if (data.garantiForsikring.forhandlerBetaler50Procent) {
      aarligPraemie = aarligPraemie / 2;
    }
    const aftaleAar = Number(data.loebetidMaaneder) / 12;
    garantiForsikringPris = aarligPraemie * aftaleAar;
  }
  // Opdater subtotal og total baseret på garantiforsikringspris
  const subtotalMedForsikring = subtotal + garantiForsikringPris;
  const totalPrisMedForsikring = subtotalMedForsikring + moms;
  const maanedligPrisMedForsikring = totalPrisMedForsikring / Number(data.loebetidMaaneder);
  return {
    grundpris,
    rabatter: {
      fabriksGaranti: fabriksGarantiRabat,
      loebetid: loebetidRabat,
      total: totalRabat
    },
    tillaeg: {
      varebil: varebilTillaeg,
      kmAar: kmAarTillaeg,
      total: totalTillaeg
    },
    daekpris: daekpris,
    vejhjaelpPris: vejhjaelpPris,
    garantiForsikringPris: garantiForsikringPris,
    subtotal: subtotalMedForsikring,
    moms: moms,
    totalPris: totalPrisMedForsikring,
    maanedligPris: maanedligPrisMedForsikring
  };
};

export const beregnAftalePris = (data: AftalePrisBeregningData): BeregnResultat => {
  // Find HK-kategori og basis pris
  const hkKategori = findHkKategori(data.hk);
  if (!hkKategori) {
    throw new Error(`Kunne ikke finde HK-kategori for ${data.hk}HK`);
  }
  
  const grundpris = hkKategori.basePris;
  
  // Beregn rabatter
  const fabriksGarantiRabatProcent = beregnFabriksGarantiRabat(data.fabriksGarantiAar);
  const fabriksGarantiRabat = grundpris * (fabriksGarantiRabatProcent / 100);
  
  const loebetidFaktor = beregnLoebetidFaktor(data.loebetidMaaneder);
  const loebetidRabat = grundpris * (1 - loebetidFaktor);
  
  const totalRabat = fabriksGarantiRabat + loebetidRabat;
  
  // Beregn tillæg
  const varebilTillaegProcent = beregnVarebilTillaeg(data.isVarebil);
  const varebilTillaeg = grundpris * (varebilTillaegProcent / 100);
  
  const kmAarFaktor = beregnKmAarFaktor(data.kmPerAar);
  const kmAarTillaeg = grundpris * (kmAarFaktor - 1);
  
  const totalTillaeg = varebilTillaeg + kmAarTillaeg;
  
  // Beregn dækpris og vejhjælp hvis valgt
  // Use async tire price calculation
// NOTE: This requires beregnAftalePris to be async if you want to await the result
const daekpris = 0; // Placeholder, see beregnAftalePrisAsync below
  const vejhjaelpPris = data.inkluderVejhjaelp ? beregnVejhjaelpPris() : 0;
  
  // Beregn subtotal uden moms
  const subtotal = (grundpris - totalRabat + totalTillaeg + daekpris + vejhjaelpPris);
  
  // Beregn moms hvis privat
  const momsProcent = data.selectedCountry.vatRate / 100;
  const moms = beregnMoms(subtotal, momsProcent, data.erPrivat);
  
  // Beregn total og månedlig pris
  const totalPris = subtotal + moms;
  const maanedligPris = totalPris;
  
  // Beregn garantiforsikringspris (kun hvis valgt og kun for serviceaftale)
  let garantiForsikringPris = 0;
  if (data.garantiForsikring?.valgt && data.aftaletype === 'service') {
    let aarligPraemie = data.garantiForsikring.pris;
    
    // Anvendt forhandlerrabat, hvis valgt
    if (data.garantiForsikring.forhandlerBetaler50Procent) {
      aarligPraemie = aarligPraemie / 2;
    }
    
    // Beregn total pris for hele aftaleperioden
    const aftaleAar = Number(data.loebetidMaaneder) / 12;
    garantiForsikringPris = aarligPraemie * aftaleAar;
  }
  
  // Opdater subtotal og total baseret på garantiforsikringspris
  const subtotalMedForsikring = subtotal + garantiForsikringPris;
  const totalPrisMedForsikring = subtotalMedForsikring + moms;
  const maanedligPrisMedForsikring = totalPrisMedForsikring / Number(data.loebetidMaaneder);
  
  return {
    grundpris,
    rabatter: {
      fabriksGaranti: fabriksGarantiRabat,
      loebetid: loebetidRabat,
      total: totalRabat
    },
    tillaeg: {
      varebil: varebilTillaeg,
      kmAar: kmAarTillaeg,
      total: totalTillaeg
    },
    daekpris: daekpris,
    vejhjaelpPris: vejhjaelpPris,
    garantiForsikringPris: garantiForsikringPris,
    subtotal: subtotalMedForsikring,
    moms: moms,
    totalPris: totalPrisMedForsikring,
    maanedligPris: maanedligPrisMedForsikring
  };
};
