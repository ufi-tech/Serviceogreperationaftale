import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaCheck, FaInfoCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import warrantyService, { 
  WarrantyProvider, 
  WarrantyPackage, 
  WarrantyPriceResponse,
  WarrantyPricingRule,
  WarrantyPriceRequest
} from '../services/WarrantyService';

interface GarantiforsikringValgProps {
  initialSelected: boolean;
  initialCoverage?: string;
  bilAlder: number;
  bilKm: number;
  motorStoerrelseCcm?: number; // Motorstørrelse i CCM for konventionelle biler
  motorEffektHk?: number;      // Motoreffekt i hestekræfter for el-biler
  bilType?: string;           // f.eks. 'personbil', 'varebil', 'suv'
  braendstofType?: string;    // f.eks. 'benzin', 'diesel', 'el', 'hybrid' 
  onChange: (data: {
    valgt: boolean,
    udbyder?: string,
    pakke?: string,
    pris?: number,
    forhandlerBetaler50Procent: boolean
  }) => void;
}

// Interface flyttet til WarrantyService.ts

const GarantiforsikringValg: React.FC<GarantiforsikringValgProps> = ({ 
  initialSelected, 
  initialCoverage, 
  bilAlder,
  bilKm,
  motorStoerrelseCcm,
  motorEffektHk,
  bilType = 'personbil',
  braendstofType = 'benzin',
  onChange 
}) => {
  // State variabler - fjernet initialSelected fra intern state for at bruge props direkte
  const [providers, setProviders] = useState<WarrantyProvider[]>([]);
  const [packages, setPackages] = useState<WarrantyPackage[]>([]);
  const [pricingRules, setPricingRules] = useState<WarrantyPricingRule[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [priceResponse, setPriceResponse] = useState<WarrantyPriceResponse | null>(null);
  const [dealerCoverage, setDealerCoverage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [priceWarning, setPriceWarning] = useState<string | null>(null);
  const [featuresVisible, setFeaturesVisible] = useState<boolean>(false);

  // Nulstil intern state, når komponenten monteres eller initialSelected ændres
  useEffect(() => {
    // Nulstil alle interne states, hvis garantiforsikring ikke er valgt
    if (!initialSelected) {
      setSelectedProvider('');
      setSelectedPackage('');
      setPriceResponse(null);
      setDealerCoverage(false);
      setError(null);
      setPriceWarning(null);
      setFeaturesVisible(false);
      setPricingRules([]);
    }
  }, [initialSelected]);

  // Hent garantiudbydere når komponenten mountes eller aktiveres
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // I et produktionsmiljø vil vi bruge getWarrantyProviders() i stedet for mock
        const fetchedProviders = warrantyService.getMockWarrantyProviders();
        setProviders(fetchedProviders);
        
        // Kun sæt selectedProvider hvis den ikke allerede er sat
        if (selectedProvider === '' && fetchedProviders.length > 0) {
          // Hvis initialCoverage er defineret, vælg tilsvarende udbyder
          if (initialCoverage) {
            const matchingProvider = fetchedProviders.find(p => initialCoverage.startsWith(p.id));
            if (matchingProvider) {
              setSelectedProvider(matchingProvider.id);
            } else {
              // Ellers vælg den første
              setSelectedProvider(fetchedProviders[0].id);
            }
          } else {
            // Ingen initialCoverage, vælg den første
            setSelectedProvider(fetchedProviders[0].id);
          }
        }
      } catch (err) {
        console.error('Fejl ved hentning af garantiudbydere:', err);
        setError('Der opstod en fejl ved hentning af garantiudbydere. Prøv igen senere.');
      } finally {
        setLoading(false);
      }
    };

    // Kun hent udbydere, hvis garantiforsikring er aktiveret
    if (initialSelected) {
      fetchProviders();
    }
  }, [initialSelected, initialCoverage, selectedProvider]);

  // Hent garantipakker når en udbyder vælges
  useEffect(() => {
    const fetchPackages = async () => {
      if (!selectedProvider) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // I et produktionsmiljø vil vi bruge getWarrantyPackages() i stedet for mock
        const fetchedPackages = warrantyService.getMockWarrantyPackages(selectedProvider);
        setPackages(fetchedPackages);
        
        // Hvis initialCoverage er defineret, vælg tilsvarende pakke
        if (initialCoverage && fetchedPackages.length > 0) {
          const matchingPackage = fetchedPackages.find(p => initialCoverage === p.id);
          if (matchingPackage) {
            setSelectedPackage(matchingPackage.id);
          } else {
            // Ellers vælg den første
            setSelectedPackage(fetchedPackages[0].id);
          }
        } else if (fetchedPackages.length > 0) {
          // Default til første pakke
          setSelectedPackage(fetchedPackages[0].id);
        }
      } catch (err) {
        console.error('Fejl ved hentning af garantipakker:', err);
        setError('Der opstod en fejl ved hentning af garantipakker. Prøv igen senere.');
      } finally {
        setLoading(false);
      }
    };

    if (initialSelected) {
      fetchPackages();
    }
  }, [selectedProvider, initialSelected, initialCoverage]);

  // Hent prisregler når en pakke vælges
  useEffect(() => {
    const fetchPricingRules = () => {
      if (!selectedPackage || !initialSelected) {
        setPricingRules([]);
        return;
      }

      // Simulér hentning af prisregler fra backend
      // I et rigtigt miljø ville vi hente disse fra API'en
      const mockRules: WarrantyPricingRule[] = [
        {
          id: '1',
          packageId: selectedPackage,
          description: 'Standard garanti for nyere biler',
          price: 5000,
          carAgeMonthsFrom: 0,
          carAgeMonthsTo: 36,
          mileageKmFrom: 0,
          mileageKmTo: 60000,
          engineSizeCcmFrom: 0,
          engineSizeCcmTo: 3000,
          vehicleCategory: 'personbil',
          fuelType: 'benzin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          packageId: selectedPackage,
          description: 'Standard garanti for nyere biler',
          price: 5500,
          carAgeMonthsFrom: 0,
          carAgeMonthsTo: 36,
          mileageKmFrom: 0,
          mileageKmTo: 60000,
          engineSizeCcmFrom: 0,
          engineSizeCcmTo: 3000,
          vehicleCategory: 'personbil',
          fuelType: 'diesel',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          packageId: selectedPackage,
          description: 'Standard garanti for ældre biler',
          price: 7500,
          carAgeMonthsFrom: 37,
          carAgeMonthsTo: 84,
          mileageKmFrom: 0,
          mileageKmTo: 100000,
          engineSizeCcmFrom: 0,
          engineSizeCcmTo: 3000,
          vehicleCategory: 'personbil',
          fuelType: 'benzin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '4',
          packageId: selectedPackage,
          description: 'Premium garanti for el-biler',
          price: 8000,
          carAgeMonthsFrom: 0,
          carAgeMonthsTo: 60,
          mileageKmFrom: 0,
          mileageKmTo: 100000,
          motorEffectHpFrom: 100, // Hestekræfter for el-biler
          motorEffectHpTo: 500,
          vehicleCategory: 'personbil',
          fuelType: 'el',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '5',
          packageId: selectedPackage,
          description: 'Standard garanti for varebiler',
          price: 9000,
          carAgeMonthsFrom: 0,
          carAgeMonthsTo: 48,
          mileageKmFrom: 0,
          mileageKmTo: 120000,
          vehicleCategory: 'varebil',
          fuelType: 'diesel',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '6',
          packageId: selectedPackage,
          description: 'Standard garanti for SUV',
          price: 7000,
          carAgeMonthsFrom: 0,
          carAgeMonthsTo: 60,
          mileageKmFrom: 0,
          mileageKmTo: 100000,
          vehicleCategory: 'suv',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      // Filtrer kun regler, der matcher den valgte pakke
      const filteredRules = mockRules.filter(rule => rule.packageId === selectedPackage);
      setPricingRules(filteredRules);
    };
    
    fetchPricingRules();
  }, [selectedPackage, initialSelected]);

  // Beregn pris baseret på prisregler, bilens data og valgte pakke
  useEffect(() => {
    const calculatePrice = () => {
      if (!selectedPackage || !initialSelected || pricingRules.length === 0) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setPriceWarning(null);
        
        // Bilens data til matchning med prisregler
        const carAgeMonths = bilAlder * 12; // Konverter år til måneder
        const mileageKm = bilKm;
        const engineSizeCcm = braendstofType !== 'el' ? motorStoerrelseCcm : undefined; // Kun for konventionelle biler
        const motorEffectHp = braendstofType === 'el' ? motorEffektHk : undefined; // Kun for el-biler
        
        // Find den matchende prisregel
        let matchingRule: WarrantyPricingRule | undefined;
        
        // Søg efter en regel der matcher alle kriterier
        matchingRule = pricingRules.find(rule => {
          // Check køretøjskategori, hvis specificeret
          if (rule.vehicleCategory && rule.vehicleCategory !== bilType) {
            return false;
          }
          
          // Check brændstoftype, hvis specificeret
          if (rule.fuelType && rule.fuelType !== braendstofType) {
            return false;
          }
          
          // Check aldersinterval
          if (rule.carAgeMonthsFrom !== undefined && rule.carAgeMonthsTo !== undefined) {
            if (carAgeMonths < rule.carAgeMonthsFrom || carAgeMonths > rule.carAgeMonthsTo) {
              return false;
            }
          }
          
          // Check kilometer-interval
          if (rule.mileageKmFrom !== undefined && rule.mileageKmTo !== undefined) {
            if (mileageKm < rule.mileageKmFrom || mileageKm > rule.mileageKmTo) {
              return false;
            }
          }
          
          // Check motorstørrelse for konventionelle biler
          if (braendstofType !== 'el' && engineSizeCcm !== undefined && rule.engineSizeCcmFrom !== undefined && rule.engineSizeCcmTo !== undefined) {
            if (engineSizeCcm < rule.engineSizeCcmFrom || engineSizeCcm > rule.engineSizeCcmTo) {
              return false;
            }
          }
          
          // Check motoreffekt (hestekræfter) for el-biler
          if (braendstofType === 'el' && motorEffectHp !== undefined && rule.motorEffectHpFrom !== undefined && rule.motorEffectHpTo !== undefined) {
            if (motorEffectHp < rule.motorEffectHpFrom || motorEffectHp > rule.motorEffectHpTo) {
              return false;
            }
          }
          
          // Alle kriterier matcher
          return true;
        });
        
        // Hvis ingen præcis regel findes, prøv en mere generisk (uden motor/brændstoftype)
        if (!matchingRule) {
          matchingRule = pricingRules.find(rule => {
            // Check køretøjskategori, hvis specificeret
            if (rule.vehicleCategory && rule.vehicleCategory !== bilType) {
              return false;
            }
            
            // Check aldersinterval
            if (rule.carAgeMonthsFrom !== undefined && rule.carAgeMonthsTo !== undefined) {
              if (carAgeMonths < rule.carAgeMonthsFrom || carAgeMonths > rule.carAgeMonthsTo) {
                return false;
              }
            }
            
            // Check kilometer-interval
            if (rule.mileageKmFrom !== undefined && rule.mileageKmTo !== undefined) {
              if (mileageKm < rule.mileageKmFrom || mileageKm > rule.mileageKmTo) {
                return false;
              }
            }
            
            return true;
          });
        }
        
        // Hvis der stadig ikke er et match, tag den første regel som fallback
        if (!matchingRule && pricingRules.length > 0) {
          matchingRule = pricingRules[0];
          setPriceWarning('Bemærk: Prisen er et estimat, da bilen ikke helt matcher garantivilkårene.');
        }
        
        if (matchingRule) {
          // Beregn den endelige pris baseret på forhandlerdækning
          const originalPrice = matchingRule.price;
          const finalPrice = dealerCoverage ? originalPrice * 0.5 : originalPrice;
          
          // Opret et prisresponse-objekt
          const response: WarrantyPriceResponse = {
            originalPrice,
            finalPrice,
            currency: 'DKK',
            dealerCoverage: dealerCoverage ? 50 : 0,
            validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() // 15 dage fra nu
          };
          
          setPriceResponse(response);
          
          // Opdater parent component med de valgte data
          onChange({
            valgt: initialSelected,
            udbyder: selectedProvider,
            pakke: selectedPackage,
            pris: finalPrice,
            forhandlerBetaler50Procent: dealerCoverage
          });
        } else {
          setError('Ingen passende garantiprisregler fundet til denne bil.');
        }
      } catch (err) {
        console.error('Fejl ved beregning af garantipris:', err);
        setError('Der opstod en fejl ved beregning af garantipris. Prøv igen senere.');
      } finally {
        setLoading(false);
      }
    };

    calculatePrice();
  }, [pricingRules, selectedPackage, dealerCoverage, initialSelected, bilAlder, bilKm, motorStoerrelseCcm, motorEffektHk, bilType, braendstofType, onChange, selectedProvider]);

  // Denne komponent har ikke længere en toggle-knap - det håndteres i parent

  // Håndter valg af udbyder
  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value;
    
    // Undgå at opdatere, hvis værdien er den samme
    if (newProvider === selectedProvider) return;
    
    // Opdater lokal state
    setSelectedProvider(newProvider);
    setSelectedPackage(''); // Reset pakke når udbyder ændres
    setPriceResponse(null); // Reset prisrespons
    
    // Informer parent-komponenten om ændringen
    onChange({
      valgt: true,
      udbyder: newProvider,
      pakke: '',
      pris: 0, // Nulstil pris, da pakke er nulstillet
      forhandlerBetaler50Procent: dealerCoverage
    });
  };

  // Håndter valg af pakke
  const handlePackageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPackage = e.target.value;
    
    // Undgå at opdatere, hvis værdien er den samme
    if (newPackage === selectedPackage) return;
    
    // Opdater lokal state
    setSelectedPackage(newPackage);
    setPriceResponse(null); // Reset prisrespons, da ny pakke er valgt
    
    // Informer parent-komponenten om ændringen
    onChange({
      valgt: true,
      udbyder: selectedProvider,
      pakke: newPackage,
      pris: 0, // Nulstil pris, indtil ny pris er beregnet
      forhandlerBetaler50Procent: dealerCoverage
    });
  };

  // Håndter toggling af forhandlerdækning
  const handleDealerCoverageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isDealerCoverage = e.target.checked;
    
    // Opdater lokal state
    setDealerCoverage(isDealerCoverage);
    
    // Beregn ny pris baseret på forhandlerdækning
    const originalPrice = priceResponse?.originalPrice || 0;
    const finalPrice = isDealerCoverage ? originalPrice * 0.5 : originalPrice;
    
    // Informer parent-komponenten om ændringen
    onChange({
      valgt: true,
      udbyder: selectedProvider,
      pakke: selectedPackage,
      pris: finalPrice,
      forhandlerBetaler50Procent: isDealerCoverage
    });
  };

  // Find aktuel pakke
  const currentPackage = packages.find(p => p.id === selectedPackage);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 mt-6">
      {/* Header er fjernet for at undgå duplikering - nu håndteres toggle-funktionaliteten i AftaleoverblikPage */}
      
      {/* Garantiforsikring UI - Kontrollen ligger nu udelukkende i parent */}
      
      {/* Garantidetaljer hvis valgt */}
      {initialSelected && (
        <div className="px-6 py-4 border-t border-gray-200">
          {loading && (
            <div className="flex justify-center my-4">
              <FaSpinner className="animate-spin text-amber-500 text-xl" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Valg af garantiudbyder */}
            <div className="mb-4">
              <label htmlFor="warranty-provider" className="block text-sm font-medium text-gray-700 mb-1">
                Vælg garantiudbyder
              </label>
              <select
                id="warranty-provider"
                value={selectedProvider || ''}
                onChange={handleProviderChange}
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                disabled={loading || providers.length === 0}
              >
                <option value="" disabled>{providers.length === 0 ? "Ingen udbydere tilgængelige" : "Vælg udbyder"}</option>
                {providers.map(provider => (
                  <option key={provider.id} value={provider.id}>{provider.name}</option>
                ))}
              </select>
            </div>
            
            {/* Valg af garantipakke - kun vist når en udbyder er valgt */}
            {selectedProvider && (
              <div className="mb-4">
                <label htmlFor="warranty-package" className="block text-sm font-medium text-gray-700 mb-1">
                  Vælg garantipakke
                </label>
                <select
                  id="warranty-package"
                  value={selectedPackage || ''}
                  onChange={handlePackageChange}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  disabled={loading || packages.length === 0}
                >
                  <option value="" disabled>{packages.length === 0 ? "Ingen pakker tilgængelige" : "Vælg pakke"}</option>
                  {packages.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Pakkedetaljer og pris */}
            {selectedPackage && currentPackage && (
              <div>
                {/* Pakke features */}
                <div className="mt-2">
                  <button
                    type="button"
                    className="flex items-center text-sm text-amber-700 hover:text-amber-800"
                    onClick={() => setFeaturesVisible(!featuresVisible)}
                  >
                    <FaInfoCircle className="mr-1" />
                    {featuresVisible ? 'Skjul detaljer' : 'Vis detaljer'}
                  </button>

                  {featuresVisible && (
                    <div className="mt-2 bg-amber-50 p-3 rounded-md border border-amber-100">
                      <p className="text-sm font-medium text-amber-800 mb-2">Dækningsomfang</p>
                      <ul className="list-disc pl-5 text-sm text-amber-700 space-y-1">
                        {currentPackage.keyCoverages?.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                      {currentPackage.termsUrl && (
                        <a 
                          href={currentPackage.termsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-3 text-xs text-amber-700 hover:text-amber-800 underline"
                        >
                          Se fulde forsikringsbetingelser
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Pris */}
                {priceResponse && (
                  <div className="mt-4 bg-gray-50 p-3 rounded-md border border-gray-200">
                    {priceWarning && (
                      <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700 flex items-start">
                        <FaExclamationTriangle className="text-amber-500 mr-1 mt-0.5 flex-shrink-0" />
                        <span>{priceWarning}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Garantipris:</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK' }).format(priceResponse.originalPrice)}
                      </span>
                    </div>

                    {/* Forhandlerdækning sektion */}
                    <div className="mt-2 flex items-center justify-between">
                      <label htmlFor="dealer-coverage" className="flex items-center">
                        <input
                          type="checkbox"
                          id="dealer-coverage"
                          checked={dealerCoverage}
                          onChange={handleDealerCoverageChange}
                          className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          Forhandler dækker 50%
                        </span>
                      </label>
                    </div>

                    {/* Endelig pris */}
                    {dealerCoverage && (
                      <div className="mt-2 pt-2 border-t border-dashed border-gray-300">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Din pris:</span>
                          <span className="font-bold text-green-600">
                            {new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK' }).format(priceResponse.finalPrice)}
                          </span>
                        </div>
                        <p className="text-xs text-green-600 text-right mt-1">50% rabat fra forhandler</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GarantiforsikringValg;
