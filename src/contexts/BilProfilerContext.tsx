import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface BilData {
  id: string;
  navn?: string;
  nummerplade: string;
  stelnummer: string;
  bilmaerke: string;
  model: string;
  betegnelse: string;
  hk: string;
  foersteRegistreringsdato: string;
  kilometer: string;
  kmAarligt: '10000' | '15000' | '20000' | '25000' | '30000' | '35000' | '40000' | '45000' | '50000' | '55000' | '60000';
  gemt: Date;
  koereklarVaegt?: number; // Vægt i kg
  bilType?: 'personbil' | 'varebil' | 'suv' | 'andet'; // Eksempler, kan udvides
  fabriksgarantiMdr?: string; // Antal måneder med fabriksgaranti
}

interface BilProfilerContextType {
  gemteBilProfiler: BilData[];
  gemBilProfil: (bilData: Omit<BilData, 'id' | 'gemt'>) => void;
  hentBilProfil: (id: string) => BilData | undefined;
  sletBilProfil: (id: string) => void;
  findBilProfilByNummerplade: (nummerplade: string) => BilData | undefined;
  findBilProfilByStelnummer: (stelnummer: string) => BilData | undefined;
}

const BilProfilerContext = createContext<BilProfilerContextType | undefined>(undefined);

interface BilProfilerProviderProps {
  children: ReactNode;
}

export const BilProfilerProvider: React.FC<BilProfilerProviderProps> = ({ children }) => {
  const [gemteBilProfiler, setGemteBilProfiler] = useState<BilData[]>([]);

  // Indlæs gemte bilprofiler fra localStorage ved opstart
  useEffect(() => {
    const gemteProfilerString = localStorage.getItem('gemteBilProfiler');
    if (gemteProfilerString) {
      try {
        const parsedProfilArray = JSON.parse(gemteProfilerString);
        if (Array.isArray(parsedProfilArray)) {
          const validProfilers: BilData[] = parsedProfilArray
            .map((profil: any) => ({
              id: profil.id,
              navn: profil.navn || undefined, // Sørg for at 'navn' er string eller undefined
              nummerplade: profil.nummerplade,
              stelnummer: profil.stelnummer,
              bilmaerke: profil.bilmaerke,
              model: profil.model,
              betegnelse: profil.betegnelse,
              hk: profil.hk,
              foersteRegistreringsdato: profil.foersteRegistreringsdato,
              kilometer: profil.kilometer,
              // Sæt en standardværdi for kmAarligt hvis det mangler, for at matche BilData interfacet
              kmAarligt: profil.kmAarligt || '15000', 
              gemt: profil.gemt ? new Date(profil.gemt) : new Date(), // Konverter streng til Date, eller brug nuværende dato som fallback
              koereklarVaegt: typeof profil.koereklarVaegt === 'number' ? profil.koereklarVaegt : undefined,
              bilType: profil.bilType || undefined, // Tilføj håndtering for bilType
            }))
            .filter(profil => 
              profil.id && 
              profil.nummerplade && 
              profil.bilmaerke && 
              profil.model && 
              profil.kmAarligt && // kmAarligt skal nu være til stede
              profil.gemt instanceof Date && !isNaN(profil.gemt.getTime()) // Tjek gyldig dato
            );
          setGemteBilProfiler(validProfilers);
        } else {
          // Hvis data ikke er et array, er det ugyldigt.
          localStorage.removeItem('gemteBilProfiler');
        }
      } catch (error) {
        console.error('Fejl ved indlæsning eller transformation af gemte bilprofiler:', error);
        localStorage.removeItem('gemteBilProfiler'); // Ryd op i ugyldige data
      }
    }
  }, []);

  // Gem bilprofiler til localStorage når de opdateres
  useEffect(() => {
    localStorage.setItem('gemteBilProfiler', JSON.stringify(gemteBilProfiler));
  }, [gemteBilProfiler]);

  // Gem en ny bilprofil
  const gemBilProfil = (bilData: Omit<BilData, 'id' | 'gemt'>) => {
    // Generer et unikt ID
    const id = `bil_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const nyBilProfil: BilData = {
      ...bilData,
      id,
      gemt: new Date()
    };

    // Tjek om vi allerede har en bil med samme nummerplade eller stelnummer
    const eksisterendeNummerplade = bilData.nummerplade && 
      gemteBilProfiler.find(profil => profil.nummerplade === bilData.nummerplade);
    
    const eksisterendeStelnummer = bilData.stelnummer && 
      gemteBilProfiler.find(profil => profil.stelnummer === bilData.stelnummer);

    if (eksisterendeNummerplade) {
      // Opdater eksisterende profil med samme nummerplade
      setGemteBilProfiler(prev => 
        prev.map(profil => 
          profil.nummerplade === bilData.nummerplade ? 
            { ...nyBilProfil, id: profil.id } : profil
        )
      );
    } else if (eksisterendeStelnummer) {
      // Opdater eksisterende profil med samme stelnummer
      setGemteBilProfiler(prev => 
        prev.map(profil => 
          profil.stelnummer === bilData.stelnummer ? 
            { ...nyBilProfil, id: profil.id } : profil
        )
      );
    } else {
      // Tilføj ny profil
      setGemteBilProfiler(prev => [...prev, nyBilProfil]);
    }
  };

  // Hent en bestemt bilprofil via ID
  const hentBilProfil = (id: string) => {
    return gemteBilProfiler.find(profil => profil.id === id);
  };

  // Slet en bilprofil
  const sletBilProfil = (id: string) => {
    setGemteBilProfiler(prev => prev.filter(profil => profil.id !== id));
  };

  // Find bilprofil via nummerplade
  const findBilProfilByNummerplade = (nummerplade: string) => {
    return gemteBilProfiler.find(
      profil => profil.nummerplade.toLowerCase() === nummerplade.toLowerCase()
    );
  };

  // Find bilprofil via stelnummer
  const findBilProfilByStelnummer = (stelnummer: string) => {
    return gemteBilProfiler.find(
      profil => profil.stelnummer.toLowerCase() === stelnummer.toLowerCase()
    );
  };

  const value = {
    gemteBilProfiler,
    gemBilProfil,
    hentBilProfil,
    sletBilProfil,
    findBilProfilByNummerplade,
    findBilProfilByStelnummer
  };

  return (
    <BilProfilerContext.Provider value={value}>
      {children}
    </BilProfilerContext.Provider>
  );
};

// Custom hook til at bruge bilprofiler-konteksten
export const useBilProfiler = () => {
  const context = useContext(BilProfilerContext);
  if (context === undefined) {
    throw new Error('useBilProfiler skal bruges inden for en BilProfilerProvider');
  }
  return context;
};
