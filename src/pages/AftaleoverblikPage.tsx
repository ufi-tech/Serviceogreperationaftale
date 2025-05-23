import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AftaleType from '../components/AftaleType';
import AftaleDetaljer from '../components/AftaleDetaljer';
import VejhjaelpValg from '../components/VejhjaelpValg';
import DaekAftale from '../components/DaekAftale';
import GarantiforsikringValg from '../components/GarantiforsikringValg';
import { useMoms } from '../contexts/MomsContext';
import { useLand } from '../contexts/LandContext';
import { usePrisBeregner } from '../contexts/PrisBeregnerContext';
import { AftalePrisBeregningData, BeregnResultat } from '../services/PrisBeregner';
import { 
  FaArrowLeft, 
  FaArrowRight, 
  FaExclamationTriangle, 
  FaShieldAlt, 
  FaInfoCircle, 
  FaCar,
  FaTruck, 
  FaSnowflake, 
  FaRoad, 
  FaHandsHelping,
  FaOilCan,
  FaCogs,
  FaCheck,
  FaRing,
  FaCircleNotch
} from 'react-icons/fa';
import { useValidation, StepId } from '../contexts/ValidationContext';

// Dato-formateringsfunktion der konverterer ISO-datoer (YYYY-MM-DD) til dansk format (DD.MM.YYYY)
// Gyldig input er ISO-format med bindestreg (eksempel: 2025-05-20)
const formatDate = (dateStr: string): string => {
  if (!dateStr) return 'Ikke angivet';
  
  // Forsøg at parse datoen (JavaScript accepterer YYYY-MM-DD som standard format)
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    // Dato kunne ikke parses, så vi returnerer den uændret
    return dateStr;
  }
  
  // Format dato med dansk format DD.MM.YYYY med punktum som separator
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}.${month}.${year}`;
};

const AftaleoverblikPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { erPrivat } = useMoms();
  const { selectedCountry } = useLand();
  const { beregnPris } = usePrisBeregner();
  const { setStepValidated } = useValidation();

  // Maksimal alder ved indtegning (i år)
  const maksAlderVedIndtegning = 7; // 7 år
  const maksKmVedIndtegning = 150000; // 150.000 km

  // Check om der er data i location state eller om brugeren har navigeret direkte til URL'en
  const directNavigation = !location.state?.bildataFormData;
  
  // Bildata from location state (sent from Bildata.tsx) or placeholder for direct navigation
  const bildataFormData = location.state?.bildataFormData || {
    nummerplade: 'Ikke angivet',
    stelnummer: 'Ikke angivet',
    bilmaerke: 'Ikke angivet', // Placeholder, forventer string fra Bildata
    model: 'Ikke angivet',     // Placeholder, forventer string fra Bildata
    betegnelse: 'Ikke angivet',
    hk: '100', // Default HK, hvis ikke angivet
    foersteRegistreringsdato: new Date().toISOString().split('T')[0],
    kilometer: '0',
    kmAarligt: '15000', // Changed from forventedeAntalKmPrAar and aligned with Bildata.tsx FormData
    koereklarVaegt: undefined, // Placeholder for køreklar vægt
    bilType: undefined, // Placeholder for biltype
    fabriksgarantiMdr: '', // Tilføjet så feltet altid findes
    // Fields like warrantyInsuranceSelected, warrantyDealerCoverage etc. are removed as they no longer come from Bildata.tsx state
  };

  useEffect(() => {
    setStepValidated('aftaleoverblik', true);
  }, [setStepValidated]);

  // Beregn bilens alder i år
  const beregnBilAlder = (): number => {
    if (!bildataFormData.foersteRegistreringsdato) return 0;

    const regDato = new Date(bildataFormData.foersteRegistreringsdato);
    const nuDato = new Date();

    const diffTid = nuDato.getTime() - regDato.getTime();
    const diffAar = diffTid / (1000 * 3600 * 24 * 365.25);

    return Math.floor(diffAar);
  };

  const bilAlder = beregnBilAlder();
  const bilKm = typeof bildataFormData.kilometer === 'string' 
    ? parseInt(bildataFormData.kilometer.replace(/[,.\s]/g, ''), 10) 
    : bildataFormData.kilometer || 0;

  // Validering af indtegningskrav
  const [valideringsFejl, setValideringsFejl] = useState<{alder: boolean; kilometer: boolean}>({
    alder: false, 
    kilometer: false 
  });

  useEffect(() => {
    setValideringsFejl({
      alder: bilAlder > maksAlderVedIndtegning,
      kilometer: bilKm > maksKmVedIndtegning
    });
  }, [bilAlder, bilKm, maksAlderVedIndtegning, maksKmVedIndtegning]);

  // Initial state for all agreement options managed on this page
  const [aftaleData, setAftaleData] = useState({
    aftaleType: 'service', // 'service' or 'service-og-reparation'
    løbetid: 36, // months
    kilometerPerÅr: parseInt(bildataFormData.kmAarligt, 10) || 15000, // Uses kmAarligt from bildata
    totalKilometer: (parseInt(bildataFormData.kmAarligt, 10) || 15000) * (36/12),
    vejhjaelpValgt: false, // true or false
    vejhjaelp: {
      udbyder: '',
      pakke: '',
      pris: 0
    },
    laanebilValgt: 'nej', // Added for loan car: 'ja' | 'nej'
    daekaftale: {
      valgt: false, // Sikrer at master toggle er false som standard
      valgteTyper: { sommer: false, vinter: false, helaar: false }, // Specific tire types chosen
      // Categories for each tire type, to be updated by DaekAftale component
      kategoriSommer: 'economy' as 'economy' | 'premium' | 'budget',
      kategoriVinter: 'economy' as 'economy' | 'premium' | 'budget',
      kategoriHelaar: 'economy' as 'economy' | 'premium' | 'budget',
      // Dimensions can be added if needed for summary or direct pricing, but usually managed by DaekAftale
    },
    garantiforsikring: {
      valgt: false,
      udbyder: '',
      pakke: undefined as string | undefined, // Changed to string | undefined
      pris: 0,
      forhandlerBetaler50Procent: false, // True if dealer pays 50%
    }
  });

  // Recalculate totalKilometer when løbetid or kilometerPerÅr changes
  useEffect(() => {
    setAftaleData(prev => ({
      ...prev,
      totalKilometer: prev.kilometerPerÅr * (prev.løbetid / 12)
    }));
  }, [aftaleData.løbetid, aftaleData.kilometerPerÅr]);

  const [beregnedePriser, setBeregnedePriser] = useState<BeregnResultat>({
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
  });

  // Beregn priser baseret på aftaledata med prisberegneren
  useEffect(() => {
    // Konverter data til format til prisberegneren
    const prisData: AftalePrisBeregningData = {
      hk: parseInt(bildataFormData.hk) || 100, // Sørg for at HK er et tal
      bilAlder: bilAlder,
      kilometer: bilKm,
      isVarebil: bildataFormData.bilType === 'varebil', // Sæt baseret på bilType
      koereklarVaegt: bildataFormData.koereklarVaegt, // Tilføj køreklar vægt
      fabriksGarantiAar: bildataFormData.fabriksgarantiMdr && !isNaN(Number(bildataFormData.fabriksgarantiMdr)) && Number(bildataFormData.fabriksgarantiMdr) > 0
        ? Math.ceil(Number(bildataFormData.fabriksgarantiMdr) / 12)
        : 0,

      // Konverterer aftalevalg til prisberegnerformat
      kmPerAar: aftaleData.kilometerPerÅr.toString() as AftalePrisBeregningData['kmPerAar'],
      loebetidMaaneder: aftaleData.løbetid.toString() as AftalePrisBeregningData['loebetidMaaneder'],
      inkluderVejhjaelp: aftaleData.vejhjaelpValgt,
      aftaletype: aftaleData.aftaleType === 'service' ? 'service' : 'service_reparation',

      // Garantiforsikring (kun for serviceaftale)
      garantiForsikring: aftaleData.aftaleType === 'service' ? {
        valgt: aftaleData.garantiforsikring.valgt,
        udbyder: aftaleData.garantiforsikring.udbyder,
        pris: aftaleData.garantiforsikring.pris,
        forhandlerBetaler50Procent: aftaleData.garantiforsikring.forhandlerBetaler50Procent
      } : undefined,

      // Dækdata
      // Determine the primary tire category for pricing
      daekBrandKategori: (() => {
        if (aftaleData.daekaftale.valgteTyper.sommer) return aftaleData.daekaftale.kategoriSommer;
        if (aftaleData.daekaftale.valgteTyper.vinter) return aftaleData.daekaftale.kategoriVinter;
        if (aftaleData.daekaftale.valgteTyper.helaar) return aftaleData.daekaftale.kategoriHelaar;
        return undefined; // No tire type selected or no category applicable for pricing
      })() as 'economy' | 'premium' | 'budget' | undefined,

      // Land og moms settings
      selectedCountry: selectedCountry,
      erPrivat: erPrivat
    };

    // Beregn pris baseret på aftalevalg
    const resultat = beregnPris(prisData);

    // Opdater UI med prisresultat
    if (resultat) {
      setBeregnedePriser({
        grundpris: resultat.grundpris,
        rabatter: resultat.rabatter || { fabriksGaranti: 0, loebetid: 0, total: 0 },
        tillaeg: resultat.tillaeg || { varebil: 0, kmAar: 0, total: 0 },
        daekpris: resultat.daekpris || 0,
        vejhjaelpPris: resultat.vejhjaelpPris || 0,
        garantiForsikringPris: resultat.garantiForsikringPris || 0,
        subtotal: resultat.subtotal || 0,
        moms: resultat.moms || 0,
        totalPris: resultat.totalPris,
        maanedligPris: resultat.maanedligPris
      });
    }
  }, [aftaleData, bildataFormData, bilAlder, bilKm, erPrivat, selectedCountry, beregnPris]);

  // Opdater aftaledata når der foretages valg
  const handleAftaleTypeChange = (data: { aftaleType: 'service' | 'service-og-reparation' }) => {
    setAftaleData(prev => ({ ...prev, aftaleType: data.aftaleType }));
  };

  const handleAftaleDetaljerChange = (data: { kilometerPerÅr?: number; løbetid?: number }) => {
    setAftaleData(prev => ({
      ...prev,
      ...data,
      // Recalculate totalKilometer if kilometerPerÅr or løbetid changes
      totalKilometer: (data.kilometerPerÅr || prev.kilometerPerÅr) * ((data.løbetid || prev.løbetid) / 12)
    }));
  };

  const handleVejhjaelpChange = useCallback((data: any) => {
    console.log('Vejhjælp data ændret:', data);
    setAftaleData(prev => ({ 
      ...prev, 
      vejhjaelpValgt: data.vejhjaelpValgt,
      vejhjaelp: {
        udbyder: data.udbyder || '',
        pakke: data.pakke || '',
        pris: data.pris || 0
      }
    }));
  }, []);
  
  // Handler for at toggle vejhjælp direkte via checkbox
  const handleToggleVejhjaelp = (vilHaveVejhjaelp: boolean) => {
    console.log('Toggle vejhjælp:', vilHaveVejhjaelp);
    setAftaleData(prev => ({
      ...prev,
      vejhjaelpValgt: vilHaveVejhjaelp,
      // Hvis vejhjælp deaktiveres, nulstil vejhjælpsdata
      vejhjaelp: vilHaveVejhjaelp ? prev.vejhjaelp : {
        udbyder: '',
        pakke: '',
        pris: 0
      }
    }));
  };

  // Handler for master "Tilføj Dækaftale" toggle
  const handleToggleDaekAftale = (vilHaveDaekAftale: boolean) => {
    setAftaleData(prev => ({
      ...prev,
      daekaftale: {
        ...prev.daekaftale,
        valgt: vilHaveDaekAftale,
        // Hvis brugeren fravælger dækaftale, nulstilles detaljerne
        ...(!vilHaveDaekAftale ? {
          valgteTyper: { sommer: false, vinter: false, helaar: false },
          kategoriSommer: 'economy' as 'economy' | 'premium' | 'budget',
          kategoriVinter: 'economy' as 'economy' | 'premium' | 'budget',
          kategoriHelaar: 'economy' as 'economy' | 'premium' | 'budget',
          // Nulstil eventuelle andre dækspecifikke felter her, hvis de findes senere
        } : {})
      }
    }));
  };

  // Handler for DaekAftale component changes
  const handleDaekAftaleChange = (data: {
    valgteTyper: { sommer: boolean; vinter: boolean; helaar: boolean };
    kategoriSommer?: 'economy' | 'premium' | 'budget';
    kategoriVinter?: 'economy' | 'premium' | 'budget';
    kategoriHelaar?: 'economy' | 'premium' | 'budget';
    // Include other fields from DaekAftaleData if necessary, e.g., dimensions
  }) => {
    setAftaleData(prev => {
      // Bevar den eksisterende 'valgt' status, da den styres af handleToggleDaekAftale
      const masterValgtStatus = prev.daekaftale.valgt;
      return {
        ...prev,
        daekaftale: {
          ...prev.daekaftale, // Preserve existing parts of daekaftale state
          ...data,           // Apply updates from DaekAftale component (valgteTyper, categories etc.)
          valgt: masterValgtStatus, // Reapply the correct 'valgt' status
        }
      };
    });
  };

  // Håndterer ændringer fra GarantiforsikringValg-komponenten
  const handleGarantiforsikringChange = (data: {
    valgt: boolean,
    udbyder?: string,
    pakke?: string,
    pris?: number,
    forhandlerBetaler50Procent: boolean
  }) => {
    // Hvis garantiforsikring deaktiveres, nulstil ALLE felter
    if (!data.valgt) {
      setAftaleData(prev => ({
        ...prev,
        garantiforsikring: {
          valgt: false,
          udbyder: '',
          pakke: '',
          pris: 0,
          forhandlerBetaler50Procent: false
        }
      }));
      return;
    }
    
    // Ellers opdater med de nye værdier
    setAftaleData(prev => ({
      ...prev,
      garantiforsikring: {
        ...prev.garantiforsikring,
        valgt: true,
        udbyder: data.udbyder !== undefined ? data.udbyder : prev.garantiforsikring.udbyder,
        pakke: data.pakke !== undefined ? data.pakke : prev.garantiforsikring.pakke,
        pris: data.pris !== undefined ? data.pris : prev.garantiforsikring.pris,
        forhandlerBetaler50Procent: data.forhandlerBetaler50Procent
      }
    }));
  };

  // Handler for Lånebil selection
  const handleLaanebilChange = (valgt: 'ja' | 'nej') => {
    setAftaleData(prev => ({
      ...prev,
      laanebilValgt: valgt,
    }));
  };

  // Navigerer tilbage til bildata siden
  const gaTilBildata = () => {
    navigate('/');
  };

  // Navigerer frem til kundedata siden
  const gaTilKundedata = () => {
    navigate('/kundedata', { state: { bildataFormData, aftaleData, prisResultat: beregnedePriser } });
  };

  const harIndtegningsFejl = valideringsFejl.alder || valideringsFejl.kilometer;

  // Formatteringsfunktion til priser
  const formatPris = (pris: number) => {
    return new Intl.NumberFormat('da-DK', { 
      style: 'currency', 
      currency: selectedCountry.currency.code
    }).format(pris);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Advarsel ved direkte navigation */}
        {directNavigation && (
          <div className="mb-6 p-4 rounded-md bg-yellow-50 border border-yellow-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Manglende biloplysninger</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Du er navigeret direkte til aftaleoverblikket uden først at indtaste biloplysninger. 
                    For at få den mest præcise aftaleberegning anbefaler vi, at du starter med at udfylde bildata.
                  </p>
                  <div className="mt-3">
                    <button
                      onClick={gaTilBildata}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      <FaArrowLeft className="mr-2" /> Gå til Bildata
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tilbage til bildata knap og titel */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={gaTilBildata}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <FaArrowLeft className="mr-1" /> Bildata
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Aftaleoverblik</h1>
          <div></div> {/* Tom div for at centrere titlen */}
        </div>

        {/* Bildata-overblik sektion */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Bilen du opretter serviceaftale til</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6 p-6">
            {/* Venstre kolonne - Nummerplade og basisinfo */}
            <div className="md:col-span-1">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 flex flex-col items-center">
                {/* Hvis nummerplade findes, vises den i nummerplade-format */}
                {bildataFormData.nummerplade ? (
                  <div className="bg-white border-2 border-black rounded px-4 py-2 font-bold text-xl tracking-wider mb-3">
                    {bildataFormData.nummerplade}
                  </div>
                ) : (
                  /* Hvis nummerplade ikke findes, viser vi "Ny bil" og fremhæver stelnummeret */
                  <div className="bg-yellow-50 border border-yellow-300 rounded px-4 py-2 text-center mb-3">
                    <p className="font-bold text-yellow-800">Ny bil</p>
                    <p className="text-xs text-yellow-700">Afventer registrering</p>
                  </div>
                )}
                
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">
                    {bildataFormData.bilmaerke} {bildataFormData.model}
                  </p>
                  <p className="text-xs text-gray-600">
                    {bildataFormData.betegnelse}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Midterkolonne - Bil detaljer */}
            <div className="md:col-span-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Første registrering</p>
                  <p className="font-medium">
                    {formatDate(bildataFormData.foersteRegistreringsdato)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Alder</p>
                  <p className="font-medium">{bilAlder} år</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stelnummer</p>
                  <p className={`font-medium ${!bildataFormData.nummerplade ? 'text-blue-700 font-bold' : ''}`}>
                    {bildataFormData.stelnummer || 'Ikke angivet'}
                  </p>
                  {!bildataFormData.nummerplade && bildataFormData.stelnummer && (
                    <p className="text-xs text-gray-500 italic">Primær identifikation</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Motoreffekt</p>
                  <p className="font-medium">{bildataFormData.hk} HK</p>
                </div>
              </div>
            </div>
            
            {/* Højre kolonne - Kilometertæller og forventede km */}
            <div className="md:col-span-1">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="mb-3">
                  <p className="text-sm text-gray-500">Kilometertæller</p>
                  <p className="text-lg font-semibold">
                    {bilKm.toLocaleString()} km
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Årligt kørsel</p>
                  <p className="text-lg font-semibold">
                    {parseInt(bildataFormData.kmAarligt, 10).toLocaleString()} km/år
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Advarsler om indtegningskrav */}
        {(valideringsFejl.alder || valideringsFejl.kilometer) && (
          <div className="mb-6 p-4 border border-amber-200 bg-amber-50 rounded-md">
            <div className="flex items-start">
              <div className="mr-3 mt-0.5">
                <FaExclamationTriangle className="text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800">OBS: Bilen opfylder ikke standard-indtegningskrav</h3>
                <div className="mt-1 text-sm text-amber-700">
                  {valideringsFejl.alder && (
                    <p>Bilen er {bilAlder} år gammel, hvilket overstiger maksimal alder på {maksAlderVedIndtegning} år.</p>
                  )}
                  {valideringsFejl.kilometer && (
                    <p>Bilen har kørt {bilKm.toLocaleString()} km, hvilket overstiger maksimalt kilometertal på {maksKmVedIndtegning.toLocaleString()} km.</p>
                  )}
                  <p className="mt-1">Kontakt din leder for at afklare om denne bil kan indtegnes.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Aftalevalg sektion */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Vælg aftaletype og løbetid</h2>
          </div>
          
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Aftaletype vælger */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aftaletype</label>
                <div className="flex flex-col space-y-3">
                  <div className="relative">
                    <input
                      type="radio"
                      id="aftaletype-service"
                      name="aftaletype"
                      className="hidden peer"
                      checked={aftaleData.aftaleType === 'service'}
                      onChange={() => setAftaleData(prev => ({ ...prev, aftaleType: 'service' }))}
                    />
                    <label 
                      htmlFor="aftaletype-service" 
                      className="flex items-center p-3 border rounded-lg cursor-pointer 
                              peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:bg-gray-50"
                    >
                      <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full 
                                border border-gray-400 mr-3 peer-checked:bg-blue-500 peer-checked:border-blue-500">
                        <div className={`w-3 h-3 rounded-full bg-blue-500 ${aftaleData.aftaleType === 'service' ? 'block' : 'hidden'}`}></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Service</p>
                          <p className="text-sm font-medium text-blue-600">
                            {new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(beregnedePriser.grundpris * 0.8)}/md
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Standardservice efter producentens anvisninger</p>
                      </div>
                    </label>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="radio"
                      id="aftaletype-service-og-reparation"
                      name="aftaletype"
                      className="hidden peer"
                      checked={aftaleData.aftaleType === 'service-og-reparation'}
                      onChange={() => setAftaleData(prev => ({ ...prev, aftaleType: 'service-og-reparation' }))}
                    />
                    <label 
                      htmlFor="aftaletype-service-og-reparation" 
                      className="flex items-center p-3 border rounded-lg cursor-pointer 
                              peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:bg-gray-50"
                    >
                      <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full 
                                border border-gray-400 mr-3 peer-checked:bg-blue-500 peer-checked:border-blue-500">
                        <div className={`w-3 h-3 rounded-full bg-blue-500 ${aftaleData.aftaleType === 'service-og-reparation' ? 'block' : 'hidden'}`}></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Service & Reparation</p>
                          <p className="text-sm font-medium text-blue-600">
                            {new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(beregnedePriser.grundpris)}/md
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Komplet serviceaftale inkl. reparationer og sliddele</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Løbetid vælger */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Løbetid</label>
                <div className="relative">
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={aftaleData.løbetid}
                    onChange={(e) => setAftaleData(prev => ({ ...prev, løbetid: parseInt(e.target.value) }))}
                  >
                    <option value="12">12 måneder (1 år)</option>
                    <option value="24">24 måneder (2 år)</option>
                    <option value="36">36 måneder (3 år)</option>
                    <option value="48">48 måneder (4 år)</option>
                    <option value="60">60 måneder (5 år)</option>
                  </select>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Årligt kørsel</label>
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={aftaleData.kilometerPerÅr}
                    onChange={(e) => setAftaleData(prev => ({ ...prev, kilometerPerÅr: parseInt(e.target.value) }))}
                  >
                    <option value="10000">10.000 km/år</option>
                    <option value="15000">15.000 km/år</option>
                    <option value="20000">20.000 km/år</option>
                    <option value="25000">25.000 km/år</option>
                    <option value="30000">30.000 km/år</option>
                    <option value="35000">35.000 km/år</option>
                    <option value="40000">40.000 km/år</option>
                    <option value="45000">45.000 km/år</option>
                    <option value="50000">50.000 km/år</option>
                  </select>
                </div>
              </div>
              
              {/* Samlet overblik */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">Samlet overblik</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Aftaletype:</span>
                    <span className="text-sm font-medium">
                      {aftaleData.aftaleType === 'service' ? 'Service' : 'Service & Reparation'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Løbetid:</span>
                    <span className="text-sm font-medium">{aftaleData.løbetid} måneder</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Årligt kørsel:</span>
                    <span className="text-sm font-medium">{aftaleData.kilometerPerÅr.toLocaleString()} km/år</span>
                  </div>
                  
                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Samlet kilometer i perioden:</span>
                      <span className="text-sm font-bold">
                        {Math.round(aftaleData.totalKilometer).toLocaleString()} km
                      </span>
                    </div>
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(aftaleData.totalKilometer / 100000 * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0 km</span>
                        <span>100.000 km</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid til aftale sektioner og prisoverblik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Venstre kolonne: Aftalekomponenter */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
              <h2 className="text-xl font-semibold mb-4">Bil og aftaleoplysninger</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="block text-sm text-gray-600">Mærke</span>
                  <span className="font-medium text-gray-900">{bildataFormData.bilmaerke}</span>
                </div>
                <div>
                  <span className="block text-sm text-gray-600">Model</span>
                  <span className="font-medium text-gray-900">{bildataFormData.model}</span>
                </div>
                <div>
                  <span className="block text-sm text-gray-600">Betegnelse</span>
                  <span className="font-medium text-gray-900">{bildataFormData.betegnelse}</span>
                </div>
                <div>
                  <span className="block text-sm text-gray-600">Første registreringsdato</span>
                  <span className="font-medium text-gray-900">{formatDate(bildataFormData.foersteRegistreringsdato)}</span>
                </div>
                <div>
                  <span className="block text-sm text-gray-600">Kilometerstand</span>
                  <span className="font-medium text-gray-900">{bildataFormData.kilometer} km</span>
                </div>
                <div>
                  <span className="block text-sm text-gray-600">Forventet km/år</span>
                  <span className="font-medium text-gray-900">{bildataFormData.kmAarligt} km</span>
                </div>
                {bildataFormData.fabriksgarantiMdr && (
                  <div>
                    <span className="block text-sm text-gray-600">Udvidet fabriksgaranti (mdr)</span>
                    <span className="font-medium text-gray-900">{bildataFormData.fabriksgarantiMdr} mdr</span>
                  </div>
                )}
              </div>
            </div>

            {/* Justering af Løbetid */}
            <div className="mt-6">
              <label htmlFor="loebetid" className="block text-sm font-medium text-gray-700 mb-1">Løbetid (måneder)</label>
              <select
                id="loebetid"
                name="loebetid"
                value={aftaleData.løbetid}
                onChange={(e) => handleAftaleDetaljerChange({ løbetid: parseInt(e.target.value, 10) })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
              >
                {[12, 24, 36, 48, 60].map(months => (
                  <option key={months} value={months}>{months} mdr.</option>
                ))}
              </select>
            </div>

            {/* Justering af Kilometer per år */}
            <div className="mt-6">
              <label htmlFor="kilometerPerAar" className="block text-sm font-medium text-gray-700 mb-1">Kilometer pr. år</label>
              <select
                id="kilometerPerAar"
                name="kilometerPerAar"
                value={aftaleData.kilometerPerÅr}
                onChange={(e) => handleAftaleDetaljerChange({ kilometerPerÅr: parseInt(e.target.value, 10) })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
              >
                {[10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000].map(km => (
                  <option key={km} value={km}>{km.toLocaleString('da-DK')} km</option>
                ))}
              </select>
            </div>

            {/* Vejhjælp sektion - strømlinet uden dropdown */}
            <div className="mt-6 bg-white rounded-lg p-0 border border-gray-200">
              <VejhjaelpValg
                onChange={handleVejhjaelpChange}
                visKunForetrukneUdbydere={true}
                initialUdbyder={aftaleData.vejhjaelp?.udbyder || ''}
                initialPakke={aftaleData.vejhjaelp?.pakke || ''}
              />
            </div>
            
            {/* Dækaftale sektion - strømlinet design */}
            <div className="mt-6 bg-white rounded-lg p-0 border border-gray-200">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex-1 flex items-center">
                  <div className="bg-blue-100 rounded-full p-2 mr-3 relative">
                    <FaCircleNotch className="text-blue-600 text-lg" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-blue-100 rounded-full w-2 h-2"></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="font-medium">Dækaftale</h3>
                      <div className="relative ml-2 group">
                        <button className="text-gray-400 hover:text-gray-600">
                          <FaInfoCircle size={16} />
                        </button>
                        <div className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                          <div className="text-sm text-gray-600">
                            <p className="font-semibold mb-1">Dækaftale inkluderer:</p>
                            <ul className="list-disc pl-4 space-y-1">
                              <li>Nye kvalitetsdæk efter behov</li>
                              <li>Dækskifte mellem sæsoner</li>
                              <li>Opbevaring af ikke-monterede dæk</li>
                              <li>Afbalancering og montering</li>
                              <li>Ventilskift og korrekt dæktryk</li>
                              <li>Mulighed for sommer-, vinter- eller helårsdæk</li>
                            </ul>
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p>Vælg mellem budget, economy eller premium dækbrands for at matche dine behov og økonomi.</p>
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-3 transform translate-y-full">
                            <div className="w-3 h-3 bg-white rotate-45 transform origin-center"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-500">Nye dæk, skifte og opbevaring til din bil</p>
                      <div className="flex items-center">
                        <a className="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer underline ml-2">Se priser</a>
                      </div>
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={aftaleData.daekaftale.valgt}
                    onChange={() => handleToggleDaekAftale(!aftaleData.daekaftale.valgt)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
              
              {/* Dækaftale configurator - kun vist når valgt */}
              {aftaleData.daekaftale.valgt && (
                <div className="border-t border-gray-200 bg-gray-50">
                  <DaekAftale
                    initialData={aftaleData.daekaftale}
                    onChange={handleDaekAftaleChange}
                  />
                </div>
              )}
            </div>
            
            {/* Garantiforsikring sektion - optimeret design */}
            <div className="mt-6 bg-white rounded-lg p-0 border border-gray-200">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex-1 flex items-center">
                  <div className="bg-amber-100 rounded-full p-2 mr-3">
                    <FaShieldAlt className="text-amber-600 text-lg" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="font-medium">Garantiforsikring</h3>
                      <div className="bg-amber-50 rounded-full px-2 py-0.5 text-xs font-medium text-amber-800 ml-2">Anbefalet</div>
                      <div className="relative ml-2 group">
                        <button className="text-gray-400 hover:text-gray-600">
                          <FaInfoCircle size={16} />
                        </button>
                        <div className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                          <div className="text-sm text-gray-600">
                            <p className="font-semibold mb-1">Garantiforsikring inkluderer:</p>
                            <ul className="list-disc pl-4 space-y-1">
                              <li>Dækning af omkostninger ved mekaniske svigt</li>
                              <li>Beskyttelse efter bilens originale garanti udløber</li>
                              <li>Dækning af rådgiver efter dit valg</li>
                              <li>Ingen ubehagelige overraskelser ved dyre reparationer</li>
                              <li>Valg mellem forskellige dækningsniveauer</li>
                              <li>Mulighed for 50% medfinansiering fra forhandler</li>
                            </ul>
                          </div>
                          <div className="absolute bottom-0 left-3 transform translate-y-full">
                            <div className="w-3 h-3 bg-white rotate-45 transform origin-center"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-500">Ekstra sikkerhed mod mekaniske svigt</p>
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-amber-600 mr-1">Fra</p>
                        <p className="text-sm font-bold text-amber-600">99 kr/md</p>
                      </div>
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={aftaleData.garantiforsikring.valgt}
                    onChange={() => {
                      // Direkte toggle af garantiforsikring
                      handleGarantiforsikringChange({
                        valgt: !aftaleData.garantiforsikring.valgt,
                        udbyder: '',
                        pakke: '',
                        pris: 0,
                        forhandlerBetaler50Procent: false
                      });
                    }}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
              
              {/* GarantiforsikringValg-komponent - kun vist når garantiforsikring er aktiveret */}
              {aftaleData.garantiforsikring.valgt && (
                <div className="border-t border-gray-200">
                  <div className="p-6">
                    <GarantiforsikringValg 
                      initialSelected={aftaleData.garantiforsikring.valgt}
                      initialCoverage={aftaleData.garantiforsikring.pakke}
                      bilAlder={bilAlder}
                      bilKm={bilKm}
                      motorStoerrelseCcm={bildataFormData.motorStorrelse ? parseInt(bildataFormData.motorStorrelse.toString(), 10) : undefined}
                      motorEffektHk={bildataFormData.hk ? parseInt(bildataFormData.hk.toString(), 10) : undefined}
                      bilType={bildataFormData.bilType || 'personbil'}
                      braendstofType={bildataFormData.braendstofType || 'benzin'}
                      onChange={handleGarantiforsikringChange}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Lånebil Valg Sektion - strømlinet design */}
            <div className="mt-6 bg-white rounded-lg p-0 border border-gray-200">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex-1 flex items-center">
                  <div className="bg-purple-100 rounded-full p-2 mr-3">
                    <FaCar className="text-purple-600 text-lg" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="font-medium">Lånebil ved Service</h3>
                      <div className="relative ml-2 group">
                        <button className="text-gray-400 hover:text-gray-600">
                          <FaInfoCircle size={16} />
                        </button>
                        <div className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                          <div className="text-sm text-gray-600">
                            <p className="font-semibold mb-1">Lånebil ved service inkluderer:</p>
                            <ul className="list-disc pl-4 space-y-1">
                              <li>Lånebil i samme størrelsesklasse</li>
                              <li>Fri km under låneperioden</li>
                              <li>Inkluderet ved alle servicetjek og reparationer</li>
                              <li>Du betaler kun forbrugsudgifter</li>
                            </ul>
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p>Undgå at skulle finde transport løsninger eller besøge værkstedet flere gange.</p>
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-3 transform translate-y-full">
                            <div className="w-3 h-3 bg-white rotate-45 transform origin-center"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-500">Få en lånebil når din bil er til service</p>
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-purple-600">Inkluderet</p>
                      </div>
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={aftaleData.laanebilValgt === 'ja'}
                    onChange={() => handleLaanebilChange(aftaleData.laanebilValgt === 'ja' ? 'nej' : 'ja')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>
              
              {/* Bekræftelse hvis aktiveret */}
              {aftaleData.laanebilValgt === 'ja' && (
                <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-600 flex items-center">
                  <div className="bg-purple-100 rounded-full p-1.5 mr-2">
                    <FaCheck className="text-purple-600 text-xs" />
                  </div>
                  <p>Lånebil er inkluderet ved alle serviceophold. Du skal blot betale forbrugsudgifter.</p>
                </div>
              )}
            </div>

            {/* Navigationknapper */}
            <div className="mt-8 flex justify-between">
              <button
                onClick={gaTilBildata}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md flex items-center"
              >
                <FaArrowLeft className="mr-1" /> Tilbage til bildata
              </button>

              {harIndtegningsFejl && (
                <div className="text-right mb-2 text-sm text-amber-600">
                  <FaExclamationTriangle className="inline-block mr-1" />  
                  Særlig godkendelse påkrævet
                </div>
              )}
              <button
                onClick={gaTilKundedata}
                className={`px-6 py-3 ${harIndtegningsFejl ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium rounded-md flex items-center`}
              >
                Fortsæt til kundedata <FaArrowRight className="ml-2" />
              </button>
            </div>
          </div>

          {/* Prisoverblik */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 sticky top-4">
              <h3 className="text-xl font-medium mb-4">Prisoversigt</h3>

              <div className="space-y-3">
                <div className="border-t border-gray-200 px-4 py-3">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Grundpris</span>
                    <span>{formatPris(beregnedePriser.grundpris)}</span>
                  </div>
                </div>

                {beregnedePriser.daekpris > 0 && (
                  <div className="border-t border-gray-200 px-4 py-3">
                    <div className="flex justify-between items-center font-medium">
                      <span>Dækaftale</span>
                      <span>{formatPris(beregnedePriser.daekpris)}</span>
                    </div>
                  </div>
                )}

                {beregnedePriser.vejhjaelpPris > 0 && (
                  <div className="border-t border-gray-200 px-4 py-3">
                    <div className="flex justify-between items-center font-medium">
                      <span>Vejhjælp</span>
                      <span>{formatPris(beregnedePriser.vejhjaelpPris)}</span>
                    </div>
                  </div>
                )}

                {beregnedePriser.garantiForsikringPris > 0 && (
                  <div className="border-t border-gray-200 px-4 py-3">
                    <div className="flex justify-between items-center font-medium">
                      <span>Garantiforsikring</span>
                      <span>{formatPris(beregnedePriser.garantiForsikringPris)}</span>
                    </div>
                    {aftaleData.garantiforsikring.forhandlerBetaler50Procent && (
                      <div className="text-sm text-green-600 mt-1 text-right">Inkl. 50% forhandlerrabat</div>
                    )}
                  </div>
                )}

                <div className="border-t border-b border-gray-200 px-4 py-3">
                  {/* Rabatlinje for fabriksgaranti hvis relevant */}
                  {beregnedePriser.rabatter?.fabriksGaranti > 0 && (
                    <div className="flex justify-between text-sm text-green-700">
                      <span>Rabat pga. fabriksgaranti</span>
                      <span>-{formatPris(beregnedePriser.rabatter.fabriksGaranti)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Samlet pris (ekskl. moms)</span>
                    <span className="font-medium">{formatPris(beregnedePriser.totalPris)}</span>
                  </div>
                </div>

                <div className="mt-4 bg-blue-50 p-3 rounded-md border border-blue-200">
                  <div className="text-center">
                    <div className="text-gray-600 text-sm flex items-center justify-center">
  Månedlig ydelse
  <div className="relative ml-1 group">
    <button className="text-blue-400 hover:text-blue-600 focus:outline-none">
      <FaInfoCircle size={15} />
    </button>
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-3 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10 border border-blue-200">
      <div className="text-xs text-gray-700">
        Alle servicepriser (garanti, vejhjælp, dæk mm.) indtastes som årlig pris i admin. Systemet omregner automatisk til månedlig pris ud fra den valgte løbetid.
      </div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
        <div className="w-3 h-3 bg-white border border-blue-200 rotate-45 transform origin-center"></div>
      </div>
    </div>
  </div>
</div>
                    <div className="text-blue-700 text-2xl font-bold">
                      {formatPris(beregnedePriser.maanedligPris)}/md
                    </div>
                    <div className="text-gray-500 text-xs">
                      {erPrivat ? 'Inkl. moms' : 'Ekskl. moms'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  <p>
                    Priserne er baseret på de valgte aftaledetaljer og kan ændres 
                    hvis bilens oplysninger eller aftalebetingelser ændres.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AftaleoverblikPage;
