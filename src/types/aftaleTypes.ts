export interface BeregnResultat {
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
  garantiForsikringPris: number;
  subtotal: number;
  moms: number;
  totalPris: number;
  maanedligPris: number;
}

export interface BeregnedePriser {
  maanedspris: number;
  aarligPris: number;
  totalPris: number;
  rabat: number;
  rabatProcent: number;
}

export interface ValideringsFejl {
  alder?: string;
  kilometer?: string;
}

export interface BildataFormData {
  nummerplade: string;
  stelnummer: string;
  bilmaerke: string;
  model: string;
  betegnelse: string;
  hk: string;
  foersteRegistreringsdato: string;
  kilometer: string;
  kmAarligt: string;
  koereklarVaegt?: number;
  bilType?: string;
  fabriksgarantiMdr?: string;
}

export interface VejhjaelpData {
  valgt: boolean;
  type?: string;
  pris?: number;
  udbyder?: string;
  pakke?: string;
}

export interface DaekAftaleData {
  valgt: boolean;
  valgteTyper: {
    sommer: boolean;
    vinter: boolean;
    helaar: boolean;
  };
  kategoriSommer?: 'economy' | 'premium' | 'budget';
  kategoriVinter?: 'economy' | 'premium' | 'budget';
  kategoriHelaar?: 'economy' | 'premium' | 'budget';
  pris?: number;
}

export interface GarantiforsikringData {
  valgt: boolean;
  udbyder?: string;
  pakke?: string;
  pris?: number;
  forhandlerDækningProcent: 0 | 50 | 100; // 0 = ingen dækning, 50 = 50% dækning, 100 = 100% dækning
  // Tilføjet for baglæns kompatibilitet - bruges i nogle komponenter
  forhandlerBetaler50Procent?: boolean; // true = 50% dækning, false = ingen dækning
}

export interface LaanebilData {
  valgt: boolean;
}

export interface AftaleData {
  aftaleType: 'service' | 'service-og-reparation';
  kilometerPerÅr: number;
  løbetid: number;
  totalKilometer: number;
  vejhjaelp: VejhjaelpData;
  daekAftale: DaekAftaleData;
  garantiforsikring: GarantiforsikringData;
  laanebil: LaanebilData;
  erPrivat?: boolean;
  land?: string;
}
