import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useLand } from './LandContext';

// Interface til konteksten
interface MomsContextType {
  erPrivat: boolean;
  setErPrivat: (value: boolean) => void;
  momsSats: number;
  formatPris: (pris: number) => string;
  beregnMedMoms: (pris: number) => number;
  beregnUdenMoms: (pris: number) => number;
  visningsTekst: string; // "inkl. moms" eller "ekskl. moms"
}

// Opretter konteksten med default-værdier
const MomsContext = createContext<MomsContextType>({
  erPrivat: true,
  setErPrivat: () => {},
  momsSats: 25, // Standard dansk momssats
  formatPris: () => '',
  beregnMedMoms: () => 0,
  beregnUdenMoms: () => 0,
  visningsTekst: 'inkl. moms'
});

// Props til provider
interface MomsProviderProps {
  children: ReactNode;
}

// Provider-komponent
export const MomsProvider: React.FC<MomsProviderProps> = ({ children }) => {
  // Anvender land-konteksten
  const { selectedCountry, formatPris: formatLandPris } = useLand();
  
  const [erPrivat, setErPrivat] = useState<boolean>(() => {
    // Hent gemt værdi fra localStorage eller brug standard (true = privat)
    const savedValue = localStorage.getItem('erPrivat');
    return savedValue ? savedValue === 'true' : true;
  });
  
  // Gem erPrivat værdi i localStorage når den ændres
  useEffect(() => {
    localStorage.setItem('erPrivat', erPrivat.toString());
  }, [erPrivat]);
  
  // Momssats kommer fra det valgte land (fra LandContext)
  const momsSats = selectedCountry.vatRate;
  
  // Beregner pris med moms
  const beregnMedMoms = (pris: number): number => {
    return pris * (1 + momsSats / 100);
  };
  
  // Beregner pris uden moms
  const beregnUdenMoms = (pris: number): number => {
    return pris / (1 + momsSats / 100);
  };
  
  // Bruger formatPris fra LandContext, men viser korrekt pris baseret på erPrivat
  const formatPris = (pris: number): string => {
    const prisVisning = erPrivat ? beregnMedMoms(pris) : pris;
    return formatLandPris(prisVisning);
  };
  
  // Bestemmer visningstekst baseret på om det er privat eller erhverv
  const visningsTekst = erPrivat ? 'inkl. moms' : 'ekskl. moms';
  
  return (
    <MomsContext.Provider
      value={{
        erPrivat,
        setErPrivat,
        momsSats,
        formatPris,
        beregnMedMoms,
        beregnUdenMoms,
        visningsTekst
      }}
    >
      {children}
    </MomsContext.Provider>
  );
};

// Hook til at bruge momskonteksten
export const useMoms = () => useContext(MomsContext);
