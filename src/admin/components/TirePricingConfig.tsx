import React, { useState, useEffect, useMemo } from 'react';
import { FaSave, FaCalculator, FaCog, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { TirePricingConfig as TirePricingSettings, getTirePricingConfig, saveTirePricingConfig } from '../../api/tiresApi';

// Eksempel på bilprofil til beregning
interface CarProfile {
  weight: number;
  horsePower: number;
  annualKm: number;
  tireSize: string;
  tireCategory: string;
  contractDuration: number; // år
  summerAndWinter: boolean;
  
  // Nye felter for mønsterdybde
  currentTiresTreadDepth: number;       // Mønsterdybde på nuværende dæk (mm) - gennemsnit
  secondSetTreadDepth?: number;         // Mønsterdybde på andet sæt dæk (mm) - gennemsnit, hvis relevant
  markCurrentTiresAsNew: boolean;       // Marker hvis de nuværende dæk er nye og ikke skal medregnes
  markSecondSetAsNew: boolean;          // Marker hvis det andet sæt er nyt og ikke skal medregnes
  
  // Nye felter for fælge
  extraWheelSetPrice: number;           // Pris for ekstra fælge der skal finansieres (0 = ingen ekstra fælge)
}

// Interface for beregnede resultater
interface TireCalculationResult {
  expectedLifespan: number;
  numberOfSets: number;
  totalCost: number;
  monthlyPrice: number;
}

const TirePricingConfig: React.FC = () => {
  // State til konfigurationsindstillinger
  const [settings, setSettings] = useState<TirePricingSettings>({
    marginPerTire: 300,
    mountingFeePerTire: 100,
    disposalFeePerTire: 25,
    storageFeePerSeason: 400,
    seasonalChangeFee: 800,
    baseKmBudget: 30000,
    baseKmEconomy: 40000,
    baseKmPremium: 55000,
    weightFactorPer100kg: 2.0,
    powerFactorPer10hp: 1.0,
    highMileageReduction: 5.0,
    minTreadDepthValue: 3.0,    // Dæk har 0% værdi ved 3mm mønsterdybde
    maxTreadDepthValue: 8.0     // Dæk har 100% værdi ved 8mm mønsterdybde (nye dæk)
  });
  
  // State til at vise loading og success notifikation
  const [loading, setLoading] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  // Hent konfiguration når komponenten indlæses
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await getTirePricingConfig();
        setSettings(config);
        setLoading(false);
      } catch (error) {
        console.error('Fejl ved hentning af konfiguration:', error);
        setLoading(false);
      }
    };
    
    fetchConfig();
  }, []);
  
  // Eksempelbiloversigt til forhåndsvisning
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);
  
  // Eksempelbiler til beregning
  const exampleCars: CarProfile[] = [
    {
      weight: 1200,
      horsePower: 100,
      annualKm: 15000,
      tireSize: "185/65R15",
      tireCategory: "economy",
      contractDuration: 3,
      summerAndWinter: false,
      currentTiresTreadDepth: 6.5,     // Let slidte dæk (6,5 mm tilbage)
      markCurrentTiresAsNew: false,    // Dækkene er ikke nye og skal medregnes i beregningen
      markSecondSetAsNew: false,       // Intet andet sæt
      extraWheelSetPrice: 0           // Ingen ekstra fælge
    },
    {
      weight: 1600,
      horsePower: 150,
      annualKm: 20000,
      tireSize: "205/55R16",
      tireCategory: "economy",
      contractDuration: 3,
      summerAndWinter: true,
      currentTiresTreadDepth: 7.8,     // Næsten nye sommerdæk (7,8 mm tilbage)
      secondSetTreadDepth: 7.2,        // Let slidte vinterdæk (7,2 mm tilbage)
      markCurrentTiresAsNew: false,    // Dækkene er ikke nye og skal medregnes
      markSecondSetAsNew: false,       // Dækkene er ikke nye og skal medregnes
      extraWheelSetPrice: 0            // Ingen ekstra fælge
    },
    {
      weight: 2000,
      horsePower: 220,
      annualKm: 30000,
      tireSize: "225/45R18",
      tireCategory: "premium",
      contractDuration: 3,
      summerAndWinter: true,
      currentTiresTreadDepth: 8.0,     // Helt nye sommerdæk (8,0 mm)
      secondSetTreadDepth: 8.0,        // Helt nye vinterdæk (8,0 mm)
      markCurrentTiresAsNew: true,     // Sommerdækkene er nye og skal ikke medregnes
      markSecondSetAsNew: true,        // Vinterdækkene er nye og skal ikke medregnes
      extraWheelSetPrice: 8000         // Ekstra alufælge til 8.000 kr.
    }
  ];
  
  // Håndtere ændringer i inputs
  const handleChange = (field: keyof TirePricingSettings, value: number) => {
    setSettings({
      ...settings,
      [field]: value
    });
  };
  
  // Gem indstillinger via API
  const saveSettings = async () => {
    try {
      setSaveStatus('saving');
      const success = await saveTirePricingConfig(settings);
      
      if (success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Fejl ved gemning af indstillinger:', error);
      setSaveStatus('error');
    }
  };
  
  // Beregningsfunktion til dækpriser
  const calculateTirePricing = (car: CarProfile, settings: TirePricingSettings): TireCalculationResult => {
    // Simulerede basispriser for eksemplet
    const baseTirePrices = {
      'economy': {
        '185/65R15': 600,
        '205/55R16': 800,
        '225/45R18': 1200
      },
      'budget': {
        '185/65R15': 400,
        '205/55R16': 550,
        '225/45R18': 800
      },
      'premium': {
        '185/65R15': 800,
        '205/55R16': 1100,
        '225/45R18': 1600
      }
    };
    
    // Hent basispris for dækstørrelse og kategori
    const category = car.tireCategory as 'economy' | 'budget' | 'premium';
    const size = car.tireSize as '185/65R15' | '205/55R16' | '225/45R18';
    const baseTirePrice = baseTirePrices[category]?.[size] || 800; // Fallback til 800 hvis kombination ikke findes
    
    // Beregn samlet pris pr. dæk inkl. avance og gebyrer
    const totalPricePerTire = baseTirePrice + settings.marginPerTire + 
                              settings.mountingFeePerTire + settings.disposalFeePerTire;
    
    // Hent basisholdbarhed baseret på dæktype fra konfigurationen
    let baseLifespan: number;
    switch (car.tireCategory) {
      case 'budget':
        baseLifespan = settings.baseKmBudget;
        break;
      case 'premium':
        baseLifespan = settings.baseKmPremium;
        break;
      default: // standard
        baseLifespan = settings.baseKmEconomy;
        break;
    }
    
    // Juster levetid baseret på bilens egenskaber og de konfigurerede faktorer
    const weightReductionPercent = (Math.max(0, car.weight - 1500) / 100) * settings.weightFactorPer100kg / 100;
    const weightFactor = Math.max(0.8, 1 - weightReductionPercent);
    
    const powerReductionPercent = (Math.max(0, car.horsePower - 120) / 10) * settings.powerFactorPer10hp / 100;
    const powerFactor = Math.max(0.8, 1 - powerReductionPercent);
    
    const usageFactor = car.annualKm > 25000 ? (1 - settings.highMileageReduction / 100) : 1;
    
    // Beregn justeret levetid
    const expectedLifespan = Math.round(baseLifespan * weightFactor * powerFactor * usageFactor);
    
    // Beregn antal dæk-udskiftninger der er nødvendige i aftaleperioden
    const totalKmDuringContract = car.annualKm * car.contractDuration;
  
    // Hvis kunden har både sommer- og vinterdæk, køres der kun halvdelen af årlig kørsel på hvert sæt
    // F.eks. ved 20.000 km/år køres ca. 10.000 km på sommerdæk og 10.000 km på vinterdæk
    const effectiveKmPerSet = car.summerAndWinter ? totalKmDuringContract / 2 : totalKmDuringContract;
  
    // Beregn hvor meget mønster der er tilbage på dækkene indtil slidgrænsen (konfigurerbar, standard 3mm)
    const currentTiresRemainingTread = car.currentTiresTreadDepth - settings.minTreadDepthValue;
    const secondSetRemainingTread = car.secondSetTreadDepth ? car.secondSetTreadDepth - settings.minTreadDepthValue : 0;
  
    // Hent mønsterdybde-værdierne fra konfigurationen
    const newTireTreadDepth = settings.maxTreadDepthValue; // 8mm standard
    const minimumTreadDepth = settings.minTreadDepthValue; // 3mm standard
    const totalUsableTread = newTireTreadDepth - minimumTreadDepth; // Typisk 5mm er den totale slidbane der kan bruges
  
    // Beregn hvor mange km de nuværende dæk kan køre inden de skal udskiftes
    // Baseret på forholdet mellem resterende mønster og total brugbar mønsterdybde
    let currentTiresRemainingKm = 0;
    if (!car.markCurrentTiresAsNew) {
      currentTiresRemainingKm = (currentTiresRemainingTread / totalUsableTread) * expectedLifespan;
    }
  
    // For andet sæt dæk (hvis relevant)
    let secondSetRemainingKm = 0;
    if (car.summerAndWinter && !car.markSecondSetAsNew && car.secondSetTreadDepth) {
      secondSetRemainingKm = (secondSetRemainingTread / totalUsableTread) * expectedLifespan;
    }
  
    // Beregn effektivt antal kilometer der skal dækkes af nye dæk
    // Træk resterende kilometer på nuværende dæk fra totalen
    let effectiveNewTiresKm = effectiveKmPerSet;
  
    // Hvis dækkene ikke er markeret som nye (dvs. de er allerede betalt), så fratrækker vi deres restlevetid
    if (!car.markCurrentTiresAsNew) {
      effectiveNewTiresKm -= currentTiresRemainingKm;
    }
  
    // Samme for andet sæt, hvis relevant
    let effectiveSecondSetNewTiresKm = car.summerAndWinter ? effectiveKmPerSet : 0;
    if (car.summerAndWinter && !car.markSecondSetAsNew && car.secondSetTreadDepth) {
      effectiveSecondSetNewTiresKm -= secondSetRemainingKm;
    }
  
    // Sørg for at vi ikke får negative værdier
    effectiveNewTiresKm = Math.max(0, effectiveNewTiresKm);
    effectiveSecondSetNewTiresKm = Math.max(0, effectiveSecondSetNewTiresKm);
  
    // Beregn antal udskiftninger baseret på de justerede kilometertal
    const replacementsForFirstSet = Math.max(0, Math.ceil(effectiveNewTiresKm / expectedLifespan) - 
                                          (car.markCurrentTiresAsNew ? 0 : 1));
  
    const replacementsForSecondSet = car.summerAndWinter ? 
                                  Math.max(0, Math.ceil(effectiveSecondSetNewTiresKm / expectedLifespan) - 
                                          (car.markSecondSetAsNew ? 0 : 1)) : 0;
  
    // Antal fysiske dæksæt kunden har (enten 1 eller 2)
    const physicalSets = car.summerAndWinter ? 2 : 1;
  
    // Vi viser hvor mange sæt kunden reelt betaler for i aftaleperioden
    // Nu tager vi højde for om nuværende dæk er markeret som nye (allerede betalt) eller ikke
    let numberOfSets = 0;
  
    if (car.summerAndWinter) {
      // For sommerdæk (medregner kun hvis de ikke er markeret som nye)
      const summerSets = (car.markCurrentTiresAsNew ? 0 : 1) + replacementsForFirstSet;
      
      // For vinterdæk (medregner kun hvis de ikke er markeret som nye)
      const winterSets = (car.markSecondSetAsNew ? 0 : 1) + replacementsForSecondSet;
      
      // Totalt antal sæt der skal betales for (begrænset til 4)
      numberOfSets = Math.min(summerSets + winterSets, 4);
    } else {
      // Kun ét sæt dæk (helår eller enkelt sæson)
      // Medregner kun hvis det ikke er markeret som nyt
      numberOfSets = Math.min((car.markCurrentTiresAsNew ? 0 : 1) + replacementsForFirstSet, 2);
    }
    
    // Antal dæk pr. sæt
    const tiresPerSet = 4;
    
    // Samlet pris for dæk, inklusiv evt. ekstra fælge
    const totalTireCost = (totalPricePerTire * tiresPerSet * numberOfSets) + car.extraWheelSetPrice;
    
    // Ekstra omkostninger for sæsonopbevaring og -skifte
    let storageAndChangeCost = 0;
    if (car.summerAndWinter) {
      // Opbevaring pr. sæson - et sæt opbevares når det andet er i brug
      // Sommerdæk opbevares ca. 6 måneder (okt-apr), vinterdæk opbevares ca. 6 måneder (apr-okt)
      // Gebyr opkræves pr. sæson og i hele aftaleperioden
      const storageCost = settings.storageFeePerSeason * car.contractDuration * 2; // 2 sæsoner pr. år
      
      // Sæsonskifte - sker 2 gange årligt
      // April: Skift fra vinter- til sommerdæk
      // Oktober: Skift fra sommer- til vinterdæk
      // Gebyr opkræves for hvert skifte i hele aftaleperioden
      const seasonalChangeCost = settings.seasonalChangeFee * car.contractDuration * 2; // 2 skift pr. år
      
      storageAndChangeCost = storageCost + seasonalChangeCost;
    }
    
    // Samlet pris
    const totalCost = totalTireCost + storageAndChangeCost;
    
    // Månedlig ydelse
    const monthlyPrice = Math.round(totalCost / (car.contractDuration * 12));
    
    // Juster den viste levetid baseret på om kunden har ét eller to sæt dæk
    // Ved både sommer- og vinterdæk vises den praktiske levetid i år, som er dobbelt så lang
    // fordi hvert sæt kun bruges halvdelen af året
    const displayedLifespan = car.summerAndWinter ? expectedLifespan * 2 : expectedLifespan;
  
    return {
      expectedLifespan: displayedLifespan, // Viser den justerede forventede levetid
      numberOfSets,
      totalCost,
      monthlyPrice
    };
  };
  
  // Beregning af dækpriser baseret på nuværende indstillinger
  const calculations = useMemo(() => {
    return exampleCars.map(car => calculateTirePricing(car, settings));
  }, [settings, exampleCars]);
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Konfiguration af dækpriser</h3>
        <button
          onClick={saveSettings}
          disabled={saveStatus === 'saving'}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
            saveStatus === 'saving' || saveStatus === 'success' 
              ? 'bg-blue-500' 
              : saveStatus === 'error' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {saveStatus === 'saving' ? (
            <>
              <FaSpinner className="mr-2 animate-spin" /> Gemmer...
            </>
          ) : saveStatus === 'success' ? (
            <>
              <FaCheckCircle className="mr-2" /> Gemt!
            </>
          ) : (
            <>
              <FaSave className="mr-2" /> Gem indstillinger
            </>
          )}
        </button>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <FaSpinner className="animate-spin text-blue-500 text-2xl" />
            <span className="ml-2 text-gray-600">Indlæser konfiguration...</span>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">
              Alle priser er ekskl. moms. Beløbene tillægges 25% moms ved beregning af kundens månedlige ydelse.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-md font-medium mb-4">Priser og avancer</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fast avance pr. dæk (ekskl. moms)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        value={settings.marginPerTire}
                        onChange={(e) => handleChange('marginPerTire', parseFloat(e.target.value))}
                        min="0"
                        step="10"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">kr.</span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Dette beløb lægges oveni dækprisen som ren avance
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monteringsudgift pr. dæk (ekskl. moms)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        value={settings.mountingFeePerTire}
                        onChange={(e) => handleChange('mountingFeePerTire', parseFloat(e.target.value))}
                        min="0"
                        step="5"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">kr.</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bortskaffelsesgebyr pr. dæk (ekskl. moms)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        value={settings.disposalFeePerTire}
                        onChange={(e) => handleChange('disposalFeePerTire', parseFloat(e.target.value))}
                        min="0"
                        step="5"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">kr.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium mb-4">Håndtering af sæsondæk</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opbevaringsgebyr pr. sæson (ekskl. moms)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        value={settings.storageFeePerSeason}
                        onChange={(e) => handleChange('storageFeePerSeason', parseFloat(e.target.value))}
                        min="0"
                        step="50"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">kr.</span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Opbevaringsgebyr pr. sæson for et komplet sæt dæk
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gebyr for sæsonskifte (ekskl. moms)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        value={settings.seasonalChangeFee}
                        onChange={(e) => handleChange('seasonalChangeFee', parseFloat(e.target.value))}
                        min="0"
                        step="50"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">kr.</span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Pris pr. skift for alle 4 hjul (sommer til vinter eller omvendt)
                    </p>
                  </div>
                </div>
              </div>
            </div>
        
            <div className="mt-8 border-t border-gray-200 pt-6">
              <button
                type="button"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaCog className="mr-2 text-gray-500" />
                {showAdvancedSettings ? 'Skjul avancerede indstillinger' : 'Vis avancerede indstillinger'}
              </button>
            </div>
            
            {showAdvancedSettings && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium mb-4">Basiskilometer for dæktyper</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Budget dæk - basiskilometer
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="number"
                          value={settings.baseKmBudget}
                          onChange={(e) => handleChange('baseKmBudget', parseFloat(e.target.value))}
                          min="10000"
                          step="1000"
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">km</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Economy dæk - basiskilometer
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="number"
                          value={settings.baseKmEconomy}
                          onChange={(e) => handleChange('baseKmEconomy', parseFloat(e.target.value))}
                          min="10000"
                          step="1000"
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">km</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Premium dæk - basiskilometer
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="number"
                          value={settings.baseKmPremium}
                          onChange={(e) => handleChange('baseKmPremium', parseFloat(e.target.value))}
                          min="10000"
                          step="1000"
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">km</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-4">Justeringsfaktorer for levetid</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reduktion pr. 100 kg over 1500 kg
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="number"
                          value={settings.weightFactorPer100kg}
                          onChange={(e) => handleChange('weightFactorPer100kg', parseFloat(e.target.value))}
                          min="0"
                          max="10"
                          step="0.1"
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reduktion pr. 10 hk over 120 hk
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="number"
                          value={settings.powerFactorPer10hp}
                          onChange={(e) => handleChange('powerFactorPer10hp', parseFloat(e.target.value))}
                          min="0"
                          max="10"
                          step="0.1"
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reduktion ved kørsel over 25.000 km/år
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="number"
                          value={settings.highMileageReduction}
                          onChange={(e) => handleChange('highMileageReduction', parseFloat(e.target.value))}
                          min="0"
                          max="20"
                          step="0.5"
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-blue-600 mb-3">Mønsterdybde værdisætning</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mønsterdybde med 0% værdi
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="number"
                            value={settings.minTreadDepthValue}
                            onChange={(e) => handleChange('minTreadDepthValue', parseFloat(e.target.value))}
                            min="1.6"
                            max="6"
                            step="0.1"
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">mm</span>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Dæk med denne mønsterdybde har 0 kr. i værdi (standard: 3 mm)
                        </p>
                      </div>
                      
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mønsterdybde med 100% værdi
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="number"
                            value={settings.maxTreadDepthValue}
                            onChange={(e) => handleChange('maxTreadDepthValue', parseFloat(e.target.value))}
                            min="6.1"
                            max="10"
                            step="0.1"
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">mm</span>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Dæk med denne mønsterdybde har 100% værdi (standard: 8 mm, nye dæk)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Information om profildybde */}
                <div className="md:col-span-2 bg-blue-50 p-3 rounded border border-blue-100 mt-2">
                  <p className="text-sm font-medium text-blue-800 mb-1">Profildybde</p>
                  <p className="text-sm text-blue-600">
                    Beregning foretages til 3mm profildybde, hvor det anbefales at udskifte dækkene.
                    Dette er relevant for sikkerhed og overholdelse af lovkrav.
                  </p>
                </div>
              </div>
            )}
        
            {/* Beregningseksempler */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-md font-medium mb-4 flex items-center">
                <FaCalculator className="mr-2 text-blue-500" /> Beregningseksempler
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {calculations.map((calc, index) => (
                  <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                      {exampleCars[index].weight} kg, {exampleCars[index].horsePower} hk
                    </h4>
                    <div className="mb-3">
                      <div className="text-xs text-gray-500">Bilprofil:</div>
                      <ul className="text-xs text-gray-600 ml-4 list-disc">
                        <li>{exampleCars[index].annualKm.toLocaleString()} km/år</li>
                        <li>Dækstr.: {exampleCars[index].tireSize}</li>
                        <li>Kategori: {exampleCars[index].tireCategory}</li>
                        <li>{exampleCars[index].contractDuration} års aftale</li>
                        <li><strong>{exampleCars[index].summerAndWinter ? 'Sommer- og vinterdæk (2 sæt á 4 dæk)' : 'Kun ét sæt dæk (4 dæk)'}</strong></li>
                        <li>Mønsterdybde: {exampleCars[index].currentTiresTreadDepth} mm {exampleCars[index].markCurrentTiresAsNew ? '(nye, ikke medregnet)' : ''}</li>
                        {exampleCars[index].summerAndWinter && exampleCars[index].secondSetTreadDepth && (
                          <li>Mønsterdybde 2. sæt: {exampleCars[index].secondSetTreadDepth} mm {exampleCars[index].markSecondSetAsNew ? '(nye, ikke medregnet)' : ''}</li>
                        )}
                        {exampleCars[index].extraWheelSetPrice > 0 && (
                          <li>Ekstra fælge: {exampleCars[index].extraWheelSetPrice.toLocaleString()} kr.</li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Estimeret holdbarhed:</span>
                        <span className="font-medium">{calc.expectedLifespan.toLocaleString()} km</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Antal dæksæt:</span>
                        <span className="font-medium">{calc.numberOfSets} sæt (1 sæt = 4 dæk) </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Total pris (ekskl. moms):</span>
                        <span className="font-medium">{calc.totalCost.toLocaleString()} kr.</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-blue-200 pt-3 mt-3">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Pr. måned (ekskl. moms):</span>
                        <span className="font-bold text-blue-700">{calc.monthlyPrice.toLocaleString()} kr.</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="font-medium">Pr. måned (inkl. moms):</span>
                        <span className="font-bold text-blue-800">{(calc.monthlyPrice * 1.25).toLocaleString()} kr.</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TirePricingConfig;
