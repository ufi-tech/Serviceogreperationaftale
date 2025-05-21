import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLand } from './LandContext';
import { useMoms } from './MomsContext';
import { 
  beregnAftalePris, 
  AftalePrisBeregningData, 
  BeregnResultat, 
  HkKategori 
} from '../services/PrisBeregner';

// Interface for PrisBeregnerContext
interface PrisBeregnerContextType {
  beregnPris: (data: Partial<AftalePrisBeregningData>) => BeregnResultat;
  prisResultat: BeregnResultat | null;
  clearPrisResultat: () => void;
  hkKategorier: HkKategori[];
}

// Default værdier for BeregnResultat
const defaultResultat: BeregnResultat = {
  grundpris: 0,
  rabatter: {
    fabriksGaranti: 0,
    loebetid: 0,
    total: 0
  },
  tillaeg: {
    varebil: 0,
    kmAar: 0,
    total: 0
  },
  daekpris: 0,
  vejhjaelpPris: 0,
  garantiForsikringPris: 0,
  subtotal: 0,
  moms: 0,
  totalPris: 0,
  maanedligPris: 0
};

// Opret konteksten
const PrisBeregnerContext = createContext<PrisBeregnerContextType | undefined>(undefined);

// Props for PrisBeregnerProvider
interface PrisBeregnerProviderProps {
  children: ReactNode;
}

// Provider komponent
export const PrisBeregnerProvider: React.FC<PrisBeregnerProviderProps> = ({ children }) => {
  const { selectedCountry } = useLand();
  const { erPrivat } = useMoms();
  const [prisResultat, setPrisResultat] = useState<BeregnResultat | null>(null);
  const [hkKategorier, setHkKategorier] = useState<HkKategori[]>([]);
  
  // Hent HK kategorier fra localStorage
  useEffect(() => {
    const savedKategorier = localStorage.getItem('hkKategorier');
    if (savedKategorier) {
      setHkKategorier(JSON.parse(savedKategorier));
    } else {
      // Default HK-kategorier
      const defaultKategorier: HkKategori[] = [
        { id: 1, minHK: 0, maxHK: 100, name: "Lille", basePris: 199 },
        { id: 2, minHK: 101, maxHK: 150, name: "Mellem", basePris: 249 },
        { id: 3, minHK: 151, maxHK: 200, name: "Stor", basePris: 299 },
        { id: 4, minHK: 201, maxHK: 300, name: "Premium", basePris: 349 },
        { id: 5, minHK: 301, maxHK: 500, name: "Luksus", basePris: 399 },
      ];
      setHkKategorier(defaultKategorier);
    }
  }, []);
  
  // Beregn pris baseret på input data
  const beregnPris = (inputData: Partial<AftalePrisBeregningData>): BeregnResultat => {
    try {
      // Default værdier for obligatoriske felter
      const defaultData: AftalePrisBeregningData = {
        hk: 100,
        bilAlder: 0,
        kilometer: 0,
        isVarebil: false,
        fabriksGarantiAar: 0,
        kmPerAar: "15000",
        loebetidMaaneder: "12",
        inkluderVejhjaelp: false,
        aftaletype: "service",
        selectedCountry,
        erPrivat
      };
      
      // Kombiner default data med input data
      const data: AftalePrisBeregningData = { ...defaultData, ...inputData };
      
      // Beregn pris
      const resultat = beregnAftalePris(data);
      setPrisResultat(resultat);
      return resultat;
    } catch (error) {
      console.error('Fejl under prisberegning:', error);
      return defaultResultat;
    }
  };
  
  // Nulstil prisresultat
  const clearPrisResultat = () => {
    setPrisResultat(null);
  };
  
  // Værdier som skal være tilgængelige via konteksten
  const value: PrisBeregnerContextType = {
    beregnPris,
    prisResultat,
    clearPrisResultat,
    hkKategorier
  };
  
  return (
    <PrisBeregnerContext.Provider value={value}>
      {children}
    </PrisBeregnerContext.Provider>
  );
};

// Hook til nem adgang til PrisBeregnerContext
export const usePrisBeregner = (): PrisBeregnerContextType => {
  const context = useContext(PrisBeregnerContext);
  if (context === undefined) {
    throw new Error('usePrisBeregner must be used within a PrisBeregnerProvider');
  }
  return context;
};
