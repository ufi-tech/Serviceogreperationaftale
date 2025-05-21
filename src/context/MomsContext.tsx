import React, { createContext, useState, ReactNode, useEffect } from 'react';

interface MomsContextType {
  erErhverv: boolean;
  setErErhverv: (value: boolean) => void;
  visMedMoms: (beloeb: number) => number;
}

const defaultState: MomsContextType = {
  erErhverv: false,
  setErErhverv: () => {},
  visMedMoms: (beloeb) => beloeb,
};

export const MomsContext = createContext<MomsContextType>(defaultState);

interface MomsProviderProps {
  children: ReactNode;
}

export const MomsProvider: React.FC<MomsProviderProps> = ({ children }) => {
  const [erErhverv, setErErhverv] = useState<boolean>(false);
  
  // Funktion til at beregne pris med eller uden moms
  const visMedMoms = (beloeb: number): number => {
    if (erErhverv) {
      return beloeb; // Erhverv vises uden moms (eks. moms)
    } else {
      return Math.round(beloeb * 1.25); // Private kunder vises med moms (inkl. moms)
    }
  };
  
  // Prøv at hente erErhverv status fra localStorage ved opstart
  useEffect(() => {
    const gemt = localStorage.getItem('erErhverv');
    if (gemt !== null) {
      setErErhverv(gemt === 'true');
    }
  }, []);
  
  // Gem erErhverv status i localStorage når den ændres
  useEffect(() => {
    localStorage.setItem('erErhverv', erErhverv.toString());
  }, [erErhverv]);

  return (
    <MomsContext.Provider value={{ erErhverv, setErErhverv, visMedMoms }}>
      {children}
    </MomsContext.Provider>
  );
};
