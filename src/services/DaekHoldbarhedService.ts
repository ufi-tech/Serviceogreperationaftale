export interface HoldbarhedInput {
  hk: number;
  bilType: 'personbil' | 'varebil';
  daekBredde: number;
  daekProfil: number;
  daekDiameter: number;
  daekKategori: 'budget' | 'economy' | 'premium';
  koerselsType: 'by' | 'landevej' | 'blandet';
}

export interface HoldbarhedOutput {
  forventetKm: number;
  forventetAar: number;
  slidFaktor: number; // 0-1, hvor 1 er højt slid
  anbefalinger: string[];
}

export class DaekHoldbarhedService {
  private static readonly BASIC_LIFESPAN = {
    budget: 30000,   // Basisværdi for budget dæk (km)
    economy: 40000,  // Basisværdi for economy dæk (km)
    premium: 55000   // Basisværdi for premium dæk (km)
  };
  
  private static readonly HK_THRESHOLDS = [
    { threshold: 100, factor: 1.0 },
    { threshold: 150, factor: 0.95 },
    { threshold: 200, factor: 0.85 },
    { threshold: 250, factor: 0.75 },
    { threshold: 300, factor: 0.65 },
    { threshold: 350, factor: 0.55 },
    { threshold: 400, factor: 0.5 }
  ];
  
  private static readonly VEHICLE_TYPE_FACTOR = {
    personbil: 1.0,
    varebil: 0.8
  };
  
  private static readonly KOERSELS_TYPE_FACTOR = {
    by: 0.8,       // Bykørsel slider mere
    landevej: 1.2, // Landevejskørsel slider mindre
    blandet: 1.0   // Gennemsnitlig slidfaktor
  };
  
  private static readonly PROFIL_FACTOR = {
    high: 1.1,    // Høj profil (65+)
    medium: 1.0,  // Medium profil (40-60)
    low: 0.9      // Lav profil (35-)
  };

  // Beregn forventet holdbarhed baseret på input
  public static beregnHoldbarhed(input: HoldbarhedInput): HoldbarhedOutput {
    // Start med basisværdien for dækkategorien
    let forventetKm = this.BASIC_LIFESPAN[input.daekKategori];
    
    // Anvend HK-faktor
    const hkFaktor = this.beregnHkFaktor(input.hk);
    forventetKm *= hkFaktor;
    
    // Anvend biltype-faktor
    forventetKm *= this.VEHICLE_TYPE_FACTOR[input.bilType];
    
    // Anvend kørselstype-faktor (hvis angivet)
    if (input.koerselsType) {
      forventetKm *= this.KOERSELS_TYPE_FACTOR[input.koerselsType];
    }
    
    // Anvend dækprofil-faktor
    const profilFaktor = this.beregnProfilFaktor(input.daekProfil);
    forventetKm *= profilFaktor;
    
    // Beregn slidfaktor (inverteret, hvor højere værdi = højere slid)
    const slidFaktor = 1 - (forventetKm / (this.BASIC_LIFESPAN[input.daekKategori] * 1.5));
    
    // Beregn forventet levetid i år (antag 15.000 km årligt)
    const forventetAar = Math.round((forventetKm / 15000) * 10) / 10;
    
    // Afrund forventet km til nærmeste 1000
    forventetKm = Math.round(forventetKm / 1000) * 1000;
    
    // Generer anbefalinger
    const anbefalinger = this.genererAnbefalinger(input, slidFaktor);
    
    return {
      forventetKm,
      forventetAar,
      slidFaktor,
      anbefalinger
    };
  }
  
  // Beregn faktor baseret på HK
  private static beregnHkFaktor(hk: number): number {
    for (let i = this.HK_THRESHOLDS.length - 1; i >= 0; i--) {
      if (hk >= this.HK_THRESHOLDS[i].threshold) {
        return this.HK_THRESHOLDS[i].factor;
      }
    }
    return 1.0; // Default hvis under laveste threshold
  }
  
  // Beregn faktor baseret på dækprofil
  private static beregnProfilFaktor(profil: number): number {
    if (profil >= 65) return this.PROFIL_FACTOR.high;
    if (profil <= 35) return this.PROFIL_FACTOR.low;
    return this.PROFIL_FACTOR.medium;
  }
  
  // Generer relevante anbefalinger baseret på input og resultater
  private static genererAnbefalinger(input: HoldbarhedInput, slidFaktor: number): string[] {
    const anbefalinger: string[] = [];
    
    // Basisanbefalinger baseret på slidfaktor
    if (slidFaktor > 0.7) {
      anbefalinger.push("Vi anbefaler hyppigere dækskifte pga. kombinationen af høj HK og biltype.");
    }
    
    // Anbefalinger baseret på dækkategori
    if (input.hk > 200 && input.daekKategori === 'budget') {
      anbefalinger.push("Med din bils HK anbefaler vi at opgradere til economy eller premium dæk for længere holdbarhed.");
    }
    
    // Anbefalinger baseret på biltype
    if (input.bilType === 'varebil' && input.daekKategori !== 'premium') {
      anbefalinger.push("For varebiler anbefaler vi premium dæk for bedre holdbarhed ved høj belastning.");
    }
    
    // Anbefalinger baseret på dækprofil
    if (input.daekProfil < 40 && input.hk > 250) {
      anbefalinger.push("Kombination af lav profil og høj HK reducerer dækkets levetid betydeligt.");
    }
    
    return anbefalinger;
  }
}
