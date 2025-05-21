import { HoldbarhedOutput } from './DaekHoldbarhedService';

export interface PrisJusteringsIndeks {
  // Justeringsfaktorer for slidfaktor
  slidJusteringFaktor: number;    // Hvor meget slidfaktorren påvirker prisen (0-2, default 1)
  
  // Justeringsfaktorer for dækstørrelse
  breddeJusteringFaktor: number;  // Justering pr. 10mm over standard (195mm)
  profilJusteringFaktor: number;  // Justering pr. 5% under standard (65%)
  diameterJusteringFaktor: number; // Justering pr. tomme over standard (15")
  
  // Basisjusteringsfaktorer for sæson
  saesonFaktorer: {
    sommer: number;
    vinter: number;
    helaar: number;
  };
  
  // Basisjusteringsfaktorer for kvalitet
  kvalitetFaktorer: {
    budget: number;
    economy: number;
    premium: number;
  };
}

export const defaultPrisJusteringsIndeks: PrisJusteringsIndeks = {
  slidJusteringFaktor: 1.0,
  breddeJusteringFaktor: 0.03,  // 3% pr. 10mm over standardbredde
  profilJusteringFaktor: 0.025, // 2.5% pr. 5% under standardprofil
  diameterJusteringFaktor: 0.05, // 5% pr. tomme over standarddiameter
  
  saesonFaktorer: {
    sommer: 1.0,  // Basis
    vinter: 1.1,  // 10% dyrere end sommer
    helaar: 1.05, // 5% dyrere end sommer
  },
  
  kvalitetFaktorer: {
    budget: 0.8,   // 20% billigere end economy
    economy: 1.0,  // Basis
    premium: 1.25, // 25% dyrere end economy
  }
};

export class DaekPrisJusteringService {
  private static indeks: PrisJusteringsIndeks = {...defaultPrisJusteringsIndeks};
  
  /**
   * Beregn prisjusteringsfaktor baseret på dækholdbarhed, dimensioner, sæson og kvalitet
   */
  public static beregnPrisjusteringsFaktor(
    holdbarhed: HoldbarhedOutput | null,
    bredde: number,
    profil: number,
    diameter: number,
    saeson: 'sommer' | 'vinter' | 'helaar',
    kvalitet: 'budget' | 'economy' | 'premium'
  ): number {
    let justeringsFaktor = 1.0;
    
    // 1. Juster for slidfaktor (hvis holdbarhed er tilgængelig)
    if (holdbarhed) {
      // Jo højere slidfaktor, jo højere pris (slidfaktor på 0.5 er standard)
      const slidAfvigelse = holdbarhed.slidFaktor - 0.5;
      justeringsFaktor += slidAfvigelse * this.indeks.slidJusteringFaktor;
    }
    
    // 2. Juster for dækstørrelse
    const standardBredde = 195;
    const standardProfil = 65;
    const standardDiameter = 15;
    
    // Bredde justering (for hver 10mm over standardbredde)
    const breddeAfvigelse = Math.max(0, bredde - standardBredde) / 10;
    justeringsFaktor += breddeAfvigelse * this.indeks.breddeJusteringFaktor;
    
    // Profil justering (for hver 5% under standardprofil)
    const profilAfvigelse = Math.max(0, standardProfil - profil) / 5;
    justeringsFaktor += profilAfvigelse * this.indeks.profilJusteringFaktor;
    
    // Diameter justering (for hver tomme over standarddiameter)
    const diameterAfvigelse = Math.max(0, diameter - standardDiameter);
    justeringsFaktor += diameterAfvigelse * this.indeks.diameterJusteringFaktor;
    
    // 3. Juster for sæson
    justeringsFaktor *= this.indeks.saesonFaktorer[saeson];
    
    // 4. Juster for kvalitet
    justeringsFaktor *= this.indeks.kvalitetFaktorer[kvalitet];
    
    return justeringsFaktor;
  }
  
  /**
   * Beregn den justerede pris baseret på grundpris og justeringsfaktorer
   */
  public static beregnJusteretPris(
    grundpris: number,
    holdbarhed: HoldbarhedOutput | null,
    bredde: number,
    profil: number,
    diameter: number,
    saeson: 'sommer' | 'vinter' | 'helaar',
    kvalitet: 'budget' | 'economy' | 'premium'
  ): number {
    const faktor = this.beregnPrisjusteringsFaktor(
      holdbarhed, bredde, profil, diameter, saeson, kvalitet
    );
    
    return Math.round(grundpris * faktor);
  }
  
  /**
   * Opdater prisjusteringsindekset
   */
  public static opdaterIndeks(nytIndeks: Partial<PrisJusteringsIndeks>): void {
    this.indeks = {
      ...this.indeks,
      ...nytIndeks,
      saesonFaktorer: {
        ...this.indeks.saesonFaktorer,
        ...(nytIndeks.saesonFaktorer || {})
      },
      kvalitetFaktorer: {
        ...this.indeks.kvalitetFaktorer,
        ...(nytIndeks.kvalitetFaktorer || {})
      }
    };
    
    // Gem indeks i localStorage
    localStorage.setItem('daekPrisJusteringsIndeks', JSON.stringify(this.indeks));
  }
  
  /**
   * Nulstil prisjusteringsindekset til standardværdier
   */
  public static nulstilIndeks(): void {
    this.indeks = {...defaultPrisJusteringsIndeks};
    localStorage.setItem('daekPrisJusteringsIndeks', JSON.stringify(this.indeks));
  }
  
  /**
   * Hent det aktuelle prisjusteringsindeks
   */
  public static hentIndeks(): PrisJusteringsIndeks {
    return {...this.indeks};
  }
  
  /**
   * Initialiser prisjusteringsindekset fra localStorage
   */
  public static initialiserFraLocalStorage(): void {
    const gemt = localStorage.getItem('daekPrisJusteringsIndeks');
    if (gemt) {
      try {
        const indeks = JSON.parse(gemt);
        this.indeks = {
          ...defaultPrisJusteringsIndeks, // Brug standard som backup
          ...indeks // Overskriv med gemte værdier
        };
      } catch (error) {
        console.error('Fejl ved indlæsning af prisjusteringsindeks:', error);
        this.indeks = {...defaultPrisJusteringsIndeks};
      }
    }
  }
}
