import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { defaultCountry, CountryOption, findCountryByCode, formatCurrency } from '../data/countryData';

// Interface til LandContext
interface LandContextType {
  selectedCountry: CountryOption;
  setSelectedCountry: (country: CountryOption) => void;
  formatPris: (pris: number) => string;
  vatRate: number; // Momssats som decimaltal
  phoneCode: string; // Landets telefonkode (f.eks. +45 for Danmark)
}

// Opret konteksten
const LandContext = createContext<LandContextType | undefined>(undefined);

// Props for LandProvider
interface LandProviderProps {
  children: ReactNode;
}

// Provider komponent
export const LandProvider: React.FC<LandProviderProps> = ({ children }) => {
  // Hent gemt land fra localStorage eller brug standard (Danmark)
  const getSavedCountry = (): CountryOption => {
    const savedCountryCode = localStorage.getItem('selectedCountry');
    if (savedCountryCode) {
      const country = findCountryByCode(savedCountryCode);
      return country || defaultCountry;
    }
    return defaultCountry;
  };
  
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(getSavedCountry());
  
  // Opdater localStorage når landet ændres
  useEffect(() => {
    localStorage.setItem('selectedCountry', selectedCountry.value);
  }, [selectedCountry]);
  
  // Formatér pris med den valgte landekonfigurations valuta
  const formatPris = (pris: number): string => {
    return formatCurrency(pris, selectedCountry);
  };
  
  // Beregn momssats som decimaltal for nemmere beregninger
  const vatRate = selectedCountry.vatRate / 100;
  
  // Hent landets telefonkode
  const phoneCode = selectedCountry.phoneCode;
  
  const value = {
    selectedCountry,
    setSelectedCountry,
    formatPris,
    vatRate,
    phoneCode
  };
  
  return (
    <LandContext.Provider value={value}>
      {children}
    </LandContext.Provider>
  );
};

// Hook til nem adgang til LandContext
export const useLand = (): LandContextType => {
  const context = useContext(LandContext);
  if (context === undefined) {
    throw new Error('useLand must be used within a LandProvider');
  }
  return context;
};
