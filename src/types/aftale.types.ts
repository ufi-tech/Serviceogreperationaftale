/**
 * Type definitions for service agreement components
 */

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
  koereklarVaegt?: string;
  bilType?: string;
  fabriksgarantiMdr?: string;
}

export interface AftaleData {
  aftaleType: 'service' | 'service-og-reparation' | '';
  kilometerPerÅr: number;
  løbetid: number;
  serviceInterval: number;
  vejhjaelp: {
    valgt: boolean;
    pakke?: string;
    pris?: number;
  };
  daekAftale: {
    valgt: boolean;
    valgteTyper: {
      sommer: boolean;
      vinter: boolean;
      helaar: boolean;
    };
    kategoriSommer?: 'economy' | 'premium' | 'budget';
    kategoriVinter?: 'economy' | 'premium' | 'budget';
    kategoriHelaar?: 'economy' | 'premium' | 'budget';
  };
  garantiforsikring: {
    valgt: boolean;
    udbyder?: string;
    pakke?: string;
    pris?: number;
    forhandlerBetaler50Procent: boolean;
  };
  laanebilVedService: 'ja' | 'nej' | '';
}

export interface BeregnedePriser {
  grundpris: number;
  daekPris: number;
  vejhjaelpPris: number;
  garantiForsikringPris: number;
  totalPris: number;
  maanedligPris: number;
  rabatter?: {
    fabriksGaranti?: number;
    [key: string]: number | undefined;
  };
}

export type AftaleTypeOption = 'service' | 'service-og-reparation';
