import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaCar, 
  FaQuestionCircle, 
  FaTachometerAlt, 
  FaSearch, 
  FaIdCard, 
  FaBuilding, 
  FaUser, 
  FaTruck, 
  FaCalendarAlt,
  FaInfoCircle,
  FaIndustry,
  FaCarAlt,
  FaChevronDown,
  FaChevronUp,
  FaSave,
  FaHistory,
  FaTrash,
  FaCloudDownloadAlt
} from 'react-icons/fa';
import { useMoms } from '../contexts/MomsContext';
import { useBilProfiler } from '../contexts/BilProfilerContext';
import { carBrands, BrandOption, ModelOption } from '../data/carData';
import { useValidation } from '../contexts/ValidationContext';

interface DaekStoerrelse {
  bredde: string;
  profil: string;
  diameter: string;
}

interface DaekTypeData {
  kategori: 'budget' | 'economy' | 'premium' | '';
  stoerrelse: DaekStoerrelse;
}

interface DaekAftaleData {
  valgteTyper: { sommer: boolean; vinter: boolean; helaar: boolean; };
  sommer?: DaekTypeData;
  vinter?: DaekTypeData;
  helaar?: DaekTypeData;
}

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
  koereklarVaegt?: number; // Tilføjet fra context
  bilType?: 'personbil' | 'varebil' | 'suv' | 'andet'; // Tilføjet fra context
  fabriksgarantiMdr?: string; // Udvidet fabriksgaranti i måneder
}

// Hjælpefunktion til at normalisere datoformater til YYYY-MM-DD (HTML5 date input format)
const normalizeDate = (dateStr: string): string => {
  if (!dateStr) return '';
  
  // Check for forskellige formater
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    // Allerede i format YYYY-MM-DD (HTML5 format)
    return dateStr;
  } else if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
    // Format DD.MM.YYYY, konverter til YYYY-MM-DD
    const [day, month, year] = dateStr.split('.');
    return `${year}-${month}-${day}`;
  } else if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    // Format DD-MM-YYYY, konverter til YYYY-MM-DD
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`;
  }
  // Hvis ikke et kendt format, returner uændret
  return dateStr;
};

// Hjælpefunktion til at formatere dato til visning (DD.MM.YYYY)
const formatDateForDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    // Format YYYY-MM-DD, konverter til DD.MM.YYYY
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
  }
  
  return dateStr;
};

const Bildata: React.FC = () => {
  // Anvender MomsContext, BilProfilerContext, og navigation
  const navigate = useNavigate();
  const { erPrivat, setErPrivat, visningsTekst, formatPris } = useMoms();
  const { gemteBilProfiler, gemBilProfil, findBilProfilByNummerplade, findBilProfilByStelnummer } = useBilProfiler();
  const { setStepValidated } = useValidation();
  
  // References til dropdown menuer
  const maerkeDropdownRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const historikDropdownRef = useRef<HTMLDivElement>(null);
  
  const [erVarebil, setErVarebil] = useState<boolean>(false);
  const [harDaekaftale, setHarDaekaftale] = useState<boolean>(false);
  const [soegemetode, setSoegemetode] = useState<'nummerplade' | 'stelnummer'>('nummerplade');
  const [validationErrors, setValidationErrors] = useState<{
    nummerplade?: string;
    stelnummer?: string;
  }>({});
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showHistorikDropdown, setShowHistorikDropdown] = useState<boolean>(false);
  const [isBilProfilGemt, setIsBilProfilGemt] = useState<boolean>(false);
  const [showSavePrompt, setShowSavePrompt] = useState<boolean>(false);
  
  // Autocomplete states
  const [showMaerkeDropdown, setShowMaerkeDropdown] = useState<boolean>(false);
  const [showModelDropdown, setShowModelDropdown] = useState<boolean>(false);
  const [filteredBrands, setFilteredBrands] = useState<BrandOption[]>(carBrands);
  const [filteredModels, setFilteredModels] = useState<ModelOption[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<BrandOption | null>(null);
  
  // Priser og tillæg (disse ville normalt hentes fra admin/backend)
  const [priser, setPriser] = useState({
    basisPris: 250, // Pris pr. måned uden moms for basis service
    vejhjaelpTillaeg: 40, // Pris pr. måned uden moms for vejhjælp
    varebilTillaegProcent: 15 // Procentvis tillæg for varebiler
  });
  
  // Luk dropdowns hvis der klikkes udenfor
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (maerkeDropdownRef.current && !maerkeDropdownRef.current.contains(event.target as Node)) {
        setShowMaerkeDropdown(false);
      }
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setShowModelDropdown(false);
      }
      if (historikDropdownRef.current && !historikDropdownRef.current.contains(event.target as Node)) {
        setShowHistorikDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Filtrer modeller baseret på valgt mærke
  useEffect(() => {
    if (selectedBrand) {
      setFilteredModels(selectedBrand.models);
    } else {
      setFilteredModels([]);
    }
  }, [selectedBrand]);
  
  // Formdata
  interface FormData {
    nummerplade: string;
    stelnummer: string;
    bilmaerke: string;
    model: string;
    betegnelse: string; 
    hk: string; 
    foersteRegistreringsdato: string;
    kilometer: string; 
    kmAarligt: '10000' | '15000' | '20000' | '25000' | '30000' | '35000' | '40000' | '45000' | '50000' | '55000' | '60000';
    koereklarVaegt?: number;
    bilType?: 'personbil' | 'varebil' | 'suv' | 'andet';
    fabriksgarantiMdr?: string;
  }

  const initialFormData: FormData = {
    nummerplade: '',
    stelnummer: '',
    bilmaerke: '',
    model: '',
    betegnelse: '',
    hk: '',
    foersteRegistreringsdato: '',
    kilometer: '',
    kmAarligt: '15000',
    koereklarVaegt: undefined,
    bilType: undefined,
    fabriksgarantiMdr: '',
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  
  // Validering af bildata-felter
  const [fieldErrors, setFieldErrors] = useState<{
    bilmaerke?: string;
    model?: string;
    betegnelse?: string;
    hk?: string;
    foersteRegistreringsdato?: string;
    kilometer?: string;
    kmAarligt?: string;
    koereklarVaegt?: string;
    bilType?: string;
    fabriksgarantiMdr?: string;
  }>({});
  
  // Tjekker om alle obligatoriske felter er udfyldt
  const [formComplete, setFormComplete] = useState<boolean>(false);
  
  // Dette useEffect håndterer individuelle feltfejl og opdaterer fieldErrors.
  // Det skal IKKE længere selv sætte formComplete.
  useEffect(() => {
    const errors: Partial<Record<keyof FormData, string>> = {};
    // Eksempel på validering for nummerplade (kan udvides)
    if (formData.nummerplade && !/^[A-ZÆØÅ]{2}[0-9]{5}$/i.test(formData.nummerplade.replace(/\s/g, ''))) {
      // errors.nummerplade = 'Ugyldigt format'; // Dette er eksempel, faktisk validering er mere kompleks
    }
    // Tilføj lignende for stelnummer etc. hvis fieldErrors skal bruges aktivt til at vise fejl
    // setFieldErrors(errors); // Opdater fieldErrors state her hvis nødvendigt

    // const allFieldsValid = Object.values(fieldErrors).every(error => !error);
    // FJERN setFormComplete(allFieldsValid);
  }, [formData]); // Beholder formData, fjern fieldErrors hvis det skaber loop, eller juster logikken
  // Overvej om fieldErrors skal være i dependency array, hvis dette useEffect selv opdaterer fieldErrors.
  // For nu antager vi, at fieldErrors opdateres af andre handlers som f.eks. validateAndSet.

  const validateForm = useCallback(() => {
    let isValid = true;
    const newFieldErrors: any = {};
    const requiredFields: Array<keyof Pick<FormData, 'bilmaerke' | 'model' | 'hk' | 'foersteRegistreringsdato' | 'kilometer' | 'kmAarligt'>> = [
      'bilmaerke', 'model', 'hk', 'foersteRegistreringsdato', 'kilometer', 'kmAarligt'
    ];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field]?.trim() === '') {
        newFieldErrors[field] = `Feltet er påkrævet`;
        isValid = false;
      }
    });

    // Specifik validering for nummerplade/stelnummer baseret på søgemetode
    if (soegemetode === 'nummerplade' && (!formData.nummerplade || formData.nummerplade.trim() === '')) {
      newFieldErrors.nummerpladeSog = 'Nummerplade er påkrævet for søgning';
      // validationErrors.nummerplade bruges til den inline validering, newFieldErrors.nummerpladeSog for formComplete tjek
      isValid = false;
    } else if (soegemetode === 'stelnummer' && (!formData.stelnummer || formData.stelnummer.trim() === '')) {
      newFieldErrors.stelnummerSog = 'Stelnummer er påkrævet for søgning';
      isValid = false;
    }
    
    // Yderligere specifikke valideringer kan tilføjes her, f.eks. format
    if (formData.hk && (isNaN(Number(formData.hk)) || Number(formData.hk) <= 0)) {
      newFieldErrors.hk = 'HK skal være et positivt tal';
      isValid = false;
    }
    if (formData.kilometer && (isNaN(Number(formData.kilometer.replace(/\./g, ''))) || Number(formData.kilometer.replace(/\./g, '')) < 0)) {
      newFieldErrors.kilometer = 'Kilometer skal være et positivt tal';
      isValid = false;
    }
    // Validering af dato - accepterer flere formater men kræver et gyldigt format
    if (formData.foersteRegistreringsdato) {
      // Accepterer både DD.MM.YYYY, DD-MM-YYYY eller YYYY-MM-DD
      const isValidFormat = (
        /^\d{2}\.\d{2}\.\d{4}$/.test(formData.foersteRegistreringsdato) || // DD.MM.YYYY
        /^\d{2}-\d{2}-\d{4}$/.test(formData.foersteRegistreringsdato) || // DD-MM-YYYY
        /^\d{4}-\d{2}-\d{2}$/.test(formData.foersteRegistreringsdato)    // YYYY-MM-DD (ISO)
      );
      
      if (!isValidFormat) {
        newFieldErrors.foersteRegistreringsdato = 'Dato skal være i format DD.MM.YYYY';
        isValid = false;
      }
    }

    // Return errors and validity status instead of setting state here
    return { isValid, errors: newFieldErrors }; 
  }, [formData, soegemetode]); // Dependencies remain the same

  useEffect(() => {
    const { isValid, errors } = validateForm(); // Call the refactored validateForm
    setFieldErrors(errors);                     // Set field errors here
    setFormComplete(isValid);                   // Set form completeness
    setStepValidated('bildata', isValid); 
  }, [formData, validateForm, setStepValidated]); // Dependencies remain the same

  const validateAndSet = (field: keyof FormData, value: string) => {
    let error: string | undefined;
    switch(field) {
    case 'fabriksgarantiMdr':
      if (value && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 84)) {
        error = 'Ugyldigt antal måneder (0-84)';
      }
      break;
      case 'bilmaerke':
      case 'model':
        if (!value.trim()) {
          error = `${field === 'bilmaerke' ? 'Bilmærke' : 'Model'} skal udfyldes`;
        }
        break;
      case 'hk':
        if (!value) {
          error = 'HK skal udfyldes';
        } else if (isNaN(Number(value.replace(/[,.]/g, '')))) {
          error = 'HK skal være et tal';
        } else if (Number(value.replace(/[,.]/g, '')) <= 0) {
          error = 'HK skal være større end 0';
        }
        break;
      case 'foersteRegistreringsdato':
        if (!value) {
          error = 'Registreringsdato skal udfyldes';
        } else {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            error = 'Ugyldig dato format';
          } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Nulstil tid for korrekt sammenligning med dato-input
            const inputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()); // Opret dato uden tid
            if (inputDate > today) {
              error = 'Dato kan ikke være i fremtiden';
            }
          }
        }
        break;
      case 'kilometer':
        if (!value) {
          error = 'Kilometer skal udfyldes';
        } else {
          const numericValue = Number(value.replace(/[,.]/g, ''));
          if (isNaN(numericValue)) {
            error = 'Kilometer skal være et tal';
          }
        }
        break;
      case 'koereklarVaegt': // Validering for køreklar vægt
        if (value) { // Kun valider hvis der er en værdi (tom streng er tilladt, da feltet er valgfrit via API)
          const numVal = Number(value);
          if (isNaN(numVal)) {
            error = 'Køreklar vægt skal være et tal.';
          } else if (numVal <= 0) {
            error = 'Køreklar vægt skal være et positivt tal.';
          }
        }
        break;
      case 'bilType': // Validering for biltype (valgfrit, men hvis valgt, skal det være en af mulighederne)
        // Da dette er en select, burde værdien altid være gyldig eller tom.
        // Hvis påkrævet, kunne man tjekke: if (!value) error = 'Biltype skal vælges';
        break;
      case 'kmAarligt':
        const validKmValues: string[] = ['10000', '15000', '20000', '25000', '30000', '35000', '40000', '45000', '50000', '55000', '60000'];
        if (!value || !validKmValues.includes(value)) {
          error = 'Vælg venligst et gyldigt forventet årligt kilometerantal.';
        }
        break;
    }
    
    setFieldErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let currentFormattedValueForStringFields = value; // Bruges til felter der forbliver strenge

    if (name === 'kilometer') {
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue) {
        currentFormattedValueForStringFields = parseInt(numericValue).toLocaleString('da-DK');
      } else {
        currentFormattedValueForStringFields = '';
      }
    } else if (name === 'hk') {
      currentFormattedValueForStringFields = value.replace(/[^0-9]/g, '');
    } else if (name === 'bilmaerke') {
      const filtered = carBrands.filter(brand => 
        brand.label.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredBrands(filtered);
      setShowMaerkeDropdown(true);
      if (selectedBrand && value !== selectedBrand.label) {
        setSelectedBrand(null);
        setFormData(prev => ({ ...prev, model: '' }));
      }
      // currentFormattedValueForStringFields er 'value'
    } else if (name === 'model' && selectedBrand) {
      const filtered = selectedBrand.models.filter(model => 
        model.label.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredModels(filtered);
      setShowModelDropdown(true);
      // currentFormattedValueForStringFields er 'value'
    }

    // Opdater state
    if (name === 'koereklarVaegt') {
      const numValue = parseInt(value, 10);
      // Hvis value er tom streng, sæt til undefined. Ellers, hvis NaN, også undefined, ellers numValue.
      const finalKoereklarVaegt = value === '' ? undefined : (isNaN(numValue) ? undefined : numValue);
      setFormData(prev => ({ ...prev, koereklarVaegt: finalKoereklarVaegt }));
    } else if (name === 'foersteRegistreringsdato') {
    // Normaliser datoformatet hvis det er et datofelt
    // Date input forventer YYYY-MM-DD format, så vi gemmer det i det format
    const normalizedDate = normalizeDate(value);
    setFormData(prev => ({ ...prev, [name]: normalizedDate }));
    } else {
      // For alle andre felter, inkl. bilType (som er en select med string values)
      setFormData(prev => ({ ...prev, [name]: currentFormattedValueForStringFields }));
    }
    
    // Validering
    if (name === 'nummerplade' || name === 'stelnummer') {
      const error = validateInput(name as 'nummerplade' | 'stelnummer', value); // valider altid på rå 'value'
      setValidationErrors(prev => ({ ...prev, [name]: error }));
    }
    
    // Valider andre bildata-felter - send altid den rå 'value' streng til validateAndSet
    if (['bilmaerke', 'model', 'betegnelse', 'hk', 'foersteRegistreringsdato', 'kilometer', 'kmAarligt', 'koereklarVaegt', 'bilType'].includes(name)) {
      validateAndSet(name as keyof FormData, value); 
    }
  };
  
  // Håndterer valg af bilmærke fra dropdown
  const handleBrandSelect = (brand: BrandOption) => {
    setSelectedBrand(brand);
    setFormData(prev => ({
      ...prev,
      bilmaerke: brand.label
    }));
    setShowMaerkeDropdown(false);
    validateAndSet('bilmaerke' as keyof FormData, brand.label);
    // Nulstil model-feltet
    setFormData(prev => ({
      ...prev,
      model: ''
    }));
  };
  
  // Håndterer valg af model fra dropdown
  const handleModelSelect = (model: ModelOption) => {
    setFormData(prev => ({
      ...prev,
      model: model.label
    }));
    setShowModelDropdown(false);
    validateAndSet('model' as keyof FormData, model.label);
    // Focus på næste felt efter valg af model
    const betegnelseInput = document.querySelector('input[name="betegnelse"]') as HTMLInputElement;
    if (betegnelseInput) betegnelseInput.focus();
  };
  
  // Valider nummerplade eller stelnummer ved indtastning
  const validateInput = (field: 'nummerplade' | 'stelnummer', value: string): string | undefined => {
    if (field === 'nummerplade') {
      // Danske nummerplader følger typisk formaterne: AB12345 eller AB12 345
      // Vi fjerner mellemrum og validerer
      const cleanValue = value.toUpperCase().replace(/\s+/g, '');
      if (cleanValue.length === 0) return undefined;
      
      // Match format: 2 bogstaver + 5 tal eller 2 bogstaver + 3 tal + mellemrum + 3 tal
      const nummerpladeFormat = /^[A-Za-z]{2}\d{5}$/;
      if (!nummerpladeFormat.test(cleanValue)) {
        return "Nummerpladen skal bestå af 2 bogstaver efterfulgt af 5 tal (f.eks. AB12345)";
      }
    } else if (field === 'stelnummer') {
      // Stelnumre er typisk 17 tegn
      if (value.length === 0) return undefined;
      
      if (value.length !== 17) {
        return "Stelnummeret skal indeholde præcis 17 tegn";
      }
      
      // Stelnumre kan indeholde bogstaver og tal, men ikke I, O, Q
      const stelnummerFormat = /^[A-HJ-NPR-Za-hj-npr-z0-9]{17}$/;
      if (!stelnummerFormat.test(value)) {
        return "Stelnummeret må kun indeholde bogstaver (ikke I, O, Q) og tal";
      }
    }
    
    return undefined;
  };
  
  // Håndterer søgning efter bil data
  const handleSearch = async () => {
    const soegString = soegemetode === 'nummerplade' ? formData.nummerplade : formData.stelnummer;
    
    if (!soegString.trim()) {
      setValidationErrors(prev => ({
        ...prev,
        [soegemetode]: soegemetode === 'nummerplade' ? 'Nummerpladen skal udfyldes' : 'Stelnummeret skal udfyldes'
      }));
      return;
    }
    
    // Valider input før søgning
    const error = validateInput(soegemetode, soegString);
    if (error) {
      setValidationErrors(prev => ({
        ...prev,
        [soegemetode]: error
      }));
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Søg efter bilprofil i gemte data først
      const gemt = soegemetode === 'nummerplade' 
        ? findBilProfilByNummerplade(soegString)
        : findBilProfilByStelnummer(soegString);
      
      if (gemt) {
        // Fyld formularen med den gemte bildata
        setFormData(prev => ({
          ...prev,
          bilmaerke: gemt.bilmaerke,
          model: gemt.model,
          betegnelse: gemt.betegnelse,
          hk: gemt.hk,
          foersteRegistreringsdato: gemt.foersteRegistreringsdato,
          kilometer: gemt.kilometer,
          // Bevar det nummerplade eller stelnummer vi oprindeligt søgte på
          stelnummer: gemt.stelnummer || (soegemetode === 'stelnummer' ? soegString : ''),
          nummerplade: gemt.nummerplade || (soegemetode === 'nummerplade' ? soegString : ''),
          koereklarVaegt: gemt.koereklarVaegt,
          bilType: gemt.bilType,
          fabriksgarantiMdr: gemt.fabriksgarantiMdr || '',
        }));
        
        // Opdater valgt mærke ud fra den gemte bildata
        const foundBrand = carBrands.find(brand => brand.label === gemt.bilmaerke);
        if (foundBrand) {
          setSelectedBrand(foundBrand);
        }
        
        setIsBilProfilGemt(true);
        
        // Valider felterne
        ['bilmaerke', 'model', 'betegnelse', 'hk', 'foersteRegistreringsdato', 'kilometer', 'kmAarligt'].forEach(field => {
          const value = gemt[field as keyof typeof gemt];
          validateAndSet(field as keyof FormData, typeof value === 'string' ? value : value ? String(value) : '');
        });
      } else {
        // Simulér en API anmodning med en timeout
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Her ville der normalt være et API-kald til at hente bildata
        // For nu simulerer vi bare nogle returnerede data
        const mockApiCall = (searchType: 'nummerplade' | 'stelnummer', searchValue: string) => {
          return new Promise<Partial<BilData> | null>((resolve) => {
            setTimeout(() => {
              // Eksempel på mock data
              const mockDataPersonbil: Partial<BilData> = {
                bilmaerke: 'Tesla',
                model: 'Model 3',
                betegnelse: 'Long Range',
                hk: '346',
                foersteRegistreringsdato: '2022-03-15',
                stelnummer: soegemetode === 'stelnummer' ? searchValue : 'VIN12345678901234', // Vi simulerer et stelnummer, hvis der blev søgt på nummerplade
                nummerplade: soegemetode === 'nummerplade' ? searchValue : 'AB12345', // Vi simulerer en nummerplade, hvis der blev søgt på stelnummer
                koereklarVaegt: 1650, // kg
                bilType: 'personbil',
              };
              const mockDataVarebil: Partial<BilData> = {
                bilmaerke: 'Ford',
                model: 'Transit Connect',
                betegnelse: 'L2 1.5 TDCi Trend',
                hk: '120',
                foersteRegistreringsdato: '2019-08-22',
                stelnummer: soegemetode === 'stelnummer' ? searchValue : 'FD12345ABC67890', // Vi simulerer et stelnummer, hvis der blev søgt på nummerplade
                nummerplade: soegemetode === 'nummerplade' ? searchValue : 'XY67890', // Vi simulerer en nummerplade, hvis der blev søgt på stelnummer
                koereklarVaegt: 1550, // kg
                bilType: 'varebil',
              };

              if (
                (searchType === 'nummerplade' && searchValue.toUpperCase() === 'AB12345') ||
                (searchType === 'stelnummer' && searchValue.toUpperCase() === 'VIN12345678901234')
              ) {
                resolve(mockDataPersonbil);
              } else if (
                (searchType === 'nummerplade' && searchValue.toUpperCase() === 'XY67890') ||
                (searchType === 'stelnummer' && searchValue.toUpperCase() === 'FD12345ABC67890')
              ) {
                resolve(mockDataVarebil);
              } else {
                resolve(null); // Ingen data fundet
              }
            }, 1000);
          });
        };

        const data = await mockApiCall(soegemetode, soegString);
        setIsSearching(false);

        if (data) {
          setFormData(prev => ({
            ...prev,
            bilmaerke: data.bilmaerke || '',
            model: data.model || '',
            betegnelse: data.betegnelse || '',
            hk: data.hk || '',
            foersteRegistreringsdato: data.foersteRegistreringsdato || '',
            // Bevar det nummerplade eller stelnummer vi oprindeligt søgte på
            nummerplade: soegemetode === 'nummerplade' ? prev.nummerplade : (data.nummerplade || ''),
            stelnummer: soegemetode === 'stelnummer' ? prev.stelnummer : (data.stelnummer || ''),
            koereklarVaegt: data.koereklarVaegt,
            bilType: data.bilType,
            // Nulstil kilometer, da det er specifikt for den aktuelle bil, ikke en generel modeldata
            kilometer: '', 
          }));
          // Opdater valgt mærke
          const tesla = carBrands.find(brand => brand.label === 'Tesla');
          if (tesla) {
            setSelectedBrand(tesla);
          }
          // Vis prompt om at gemme profilen
          setTimeout(() => {
            setShowSavePrompt(true);
          }, 1000);  
          
          setIsBilProfilGemt(false);
        }

        // Nulstil evt. fejl
        setValidationErrors({});
      }
    } catch (error) {
      console.error('Fejl ved søgning:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Gemmer den aktuelle bilprofil
  const handleGemBilProfil = () => {
    // Tjek om alle obligatoriske felter er udfyldt
    if (!formComplete) {
      return;
    }
    
    const profilDataToSave = {
      navn: '', 
      nummerplade: formData.nummerplade,
      stelnummer: formData.stelnummer,
      bilmaerke: formData.bilmaerke,
      model: formData.model,
      betegnelse: formData.betegnelse,
      hk: formData.hk,
      foersteRegistreringsdato: formData.foersteRegistreringsdato,
      kilometer: formData.kilometer,
      kmAarligt: formData.kmAarligt,
      koereklarVaegt: formData.koereklarVaegt,
      bilType: formData.bilType,
      fabriksgarantiMdr: formData.fabriksgarantiMdr,
    };
    
    gemBilProfil(profilDataToSave); 
    setIsBilProfilGemt(true); 
    setShowSavePrompt(false); 
  };

  const handleVaelgBilProfil = (profil: BilData) => {
    const kmValue = profil.kilometer ? String(profil.kilometer) : '';
    const hkValue = profil.hk ? String(profil.hk) : '';

    setFormData({
      nummerplade: profil.nummerplade || '',
      stelnummer: profil.stelnummer || '',
      bilmaerke: profil.bilmaerke || '',
      model: profil.model || '',
      betegnelse: profil.betegnelse || '',
      hk: hkValue,
      foersteRegistreringsdato: profil.foersteRegistreringsdato || '',
      kilometer: kmValue,
      kmAarligt: profil.kmAarligt || '15000',
      koereklarVaegt: profil.koereklarVaegt,
      bilType: profil.bilType,
      fabriksgarantiMdr: profil.fabriksgarantiMdr || '',
    });
    // Opdater valgt mærke
    const foundBrand = carBrands.find(brand => brand.label === profil.bilmaerke);
    if (foundBrand) {
      setSelectedBrand(foundBrand);
    }
    // Valider felterne
    ['bilmaerke', 'model', 'betegnelse', 'hk', 'foersteRegistreringsdato', 'kilometer', 'kmAarligt'].forEach(field => {
      const value = profil[field as keyof typeof profil];
      validateAndSet(field as keyof FormData, typeof value === 'string' ? value : value ? String(value) : '');
    });
    setShowHistorikDropdown(false);
    setIsBilProfilGemt(true);
  };
  

  return (
    <div className="bg-white shadow rounded-lg p-6 relative">
      {/* Save Prompt Modal */}
      {showSavePrompt && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Gem bilprofil</h3>
            <p className="text-gray-600 mb-6">Vil du gemme denne bilprofil til senere brug?</p>
            <div className="flex justify-end space-x-4">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => setShowSavePrompt(false)}
              >
                Annuller
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => {
                  handleGemBilProfil();
                  setShowSavePrompt(false);
                }}
              >
                Gem profil
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Bildata</h2>
        
        <div className="flex space-x-3">
          {/* Gem bilprofil knap */}
          <button
            type="button"
            onClick={handleGemBilProfil}
            disabled={!formComplete}
            className={`flex items-center text-sm font-medium ${formComplete
              ? 'text-white bg-green-600 hover:bg-green-700'
              : 'text-gray-400 bg-gray-100 cursor-not-allowed'
            } p-2 rounded-md transition-colors`}
            title={formComplete ? 'Gem denne bil til senere brug' : 'Udfyld alle påkrævede felter først'}
          >
            <FaSave className="mr-2" />
            Gem bil
          </button>
          
          {/* Bilprofil historik knap */}
          <div className="relative" ref={historikDropdownRef}>
            <button
              type="button"
              onClick={() => setShowHistorikDropdown(!showHistorikDropdown)}
              className="flex items-center text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-md transition-colors"
            >
              <FaHistory className="mr-2" />
              Tidligere biler {gemteBilProfiler.length > 0 && <span className="ml-1 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">{gemteBilProfiler.length}</span>}
              {showHistorikDropdown ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />}
            </button>
          </div>
          
          {/* Dropdown menu med tidligere gemte bilprofiler */}
          {showHistorikDropdown && (
            <div className="absolute right-0 z-10 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden">
              <div className="py-2 divide-y divide-gray-200">
                <div className="px-4 py-2 text-sm text-gray-700 font-medium bg-gray-50">
                  Tidligere gemte bilprofiler
                </div>
                
                {gemteBilProfiler.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto">
                    {gemteBilProfiler.map((profil) => (
                      <div 
                        key={profil.id} 
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={() => handleVaelgBilProfil(profil)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-blue-600">{profil.bilmaerke} {profil.model}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(profil.gemt).toLocaleDateString('da-DK')}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-600">
                          <span className="mr-3">
                            {profil.nummerplade ? profil.nummerplade : profil.stelnummer}
                          </span>
                          <span>{profil.foersteRegistreringsdato}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-600">
                    Ingen gemte bilprofiler
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <div className="flex space-x-4 mb-4">
            <div className="flex items-center">
              <input
                id="nummerplade-option"
                name="soegemetode"
                type="radio"
                checked={soegemetode === 'nummerplade'}
                onChange={() => setSoegemetode('nummerplade')}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
              />
              <label htmlFor="nummerplade-option" className="ml-2 block text-sm font-medium text-gray-700">
                Nummerplade
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="stelnummer-option"
                name="soegemetode"
                type="radio"
                checked={soegemetode === 'stelnummer'}
                onChange={() => setSoegemetode('stelnummer')}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
              />
              <label htmlFor="stelnummer-option" className="ml-2 block text-sm font-medium text-gray-700">
                Stelnummer
              </label>
            </div>
          </div>
          
          {soegemetode === 'nummerplade' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700">Nummerplade</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <div className="flex-1">
                  {/* Midlertidigt fjernet "Nummerplade design" div for debugging */}
                  <input
                    type="text"
                    name="nummerplade"
                    value={formData.nummerplade}
                    onChange={handleChange}
                    className={`block w-full border ${validationErrors.nummerplade ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 pr-10 z-10 text-black`}
                    placeholder="AB12345"
                    maxLength={7}
                    style={{ color: 'black !important', backgroundColor: 'yellow !important' }}
                  />
                  {validationErrors.nummerplade && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.nummerplade}</p>
                  )}
                </div>
                <button 
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                  onClick={handleSearch}
                  disabled={isSearching || !!validationErrors.nummerplade || !formData.nummerplade}
                >
                  {isSearching ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg> 
                      Søger...
                    </span>
                  ) : (
                    <>
                      <FaSearch className="mr-2" /> Søg
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700">Stelnummer (VIN)</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaIdCard className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="stelnummer"
                      value={formData.stelnummer}
                      onChange={handleChange}
                      className={`block w-full border ${validationErrors.stelnummer ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 pr-10`}
                      placeholder="WVWZZZ1JZXW000001"
                      maxLength={17}
                      style={{ fontFamily: 'monospace' }}
                    />
                  </div>
                  {validationErrors.stelnummer && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.stelnummer}</p>
                  )}
                </div>
                <button 
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                  onClick={handleSearch}
                  disabled={isSearching || !!validationErrors.stelnummer || !formData.stelnummer}
                >
                  {isSearching ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg> 
                      Søger...
                    </span>
                  ) : (
                    <>
                      <FaSearch className="mr-2" /> Søg
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 bg-gray-100 p-4 rounded-lg border border-gray-200">
          <h3 className="text-md font-medium text-gray-700 mb-3">Kundeoplysninger</h3>
          
          {/* Privat/Erhverv toggle med forbedret design */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kundetype</label>
              <div className="flex">
                <button
                  type="button"
                  onClick={() => setErPrivat(true)}
                  className={`relative flex-1 px-4 py-2 border ${erPrivat ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-300 text-gray-700'} rounded-l-md flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  <FaUser className="mr-2" />
                  Privat
                  {erPrivat && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">✓</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setErPrivat(false)}
                  className={`relative flex-1 px-4 py-2 border ${!erPrivat ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-300 text-gray-700'} rounded-r-md flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  <FaBuilding className="mr-2" />
                  Erhverv
                  {!erPrivat && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">✓</span>
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {erPrivat ? 'Alle priser vises inkl. moms' : 'Alle priser vises ekskl. moms'}
              </p>
            </div>
            
            {/* Varebil switch med forbedret design */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Køretøjstype</label>
              <div className="relative inline-block w-full">
                <button
                  type="button"
                  onClick={() => setErVarebil(!erVarebil)}
                  className={`w-full px-4 py-2 border ${erVarebil ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-white border-gray-300 text-gray-700'} rounded-md flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500`}
                >
                  <span className="flex items-center">
                    <FaTruck className="mr-2" />
                    Varebil
                  </span>
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${erVarebil ? 'bg-amber-500' : 'bg-gray-300'}`}>
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${erVarebil ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </div>
                </button>
                {erVarebil && (
                  <p className="mt-1 text-xs text-amber-600">
                    Varebilstillæg: +{priser.varebilTillaegProcent}% på prisen
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Prisindikator sektion */}
          <div className="bg-white p-3 rounded-md border border-gray-200 mt-2 relative">
            {isBilProfilGemt && (
              <div className="absolute -top-3 right-3 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-green-200 flex items-center">
                <FaSave className="mr-1" /> Gemt profil
              </div>
            )}
            <h4 className="text-sm font-medium text-gray-700 mb-2">Prisindikation</h4>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500">Basispris ({visningsTekst}):</span>
                <span className="ml-2 font-medium">
                  {formatPris(erPrivat ? 
                    priser.basisPris * 1.25 : // Med moms for privat
                    priser.basisPris // Uden moms for erhverv
                  )}
                </span>
                <span className="text-xs text-gray-500 ml-1">pr. måned</span>
              </div>
              {erVarebil && (
                <div className="bg-amber-100 px-2 py-1 rounded-md">
                  <span className="text-xs text-amber-700">Varebilstillæg: +{priser.varebilTillaegProcent}%</span>
                </div>
              )}
            </div>
          </div>
          
        </div>
        
        <div className="mt-6 bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md font-medium text-gray-700">Biloplysninger</h3>
            
            {/* Gem bil-knap */}
            {formComplete && (
              <button
                type="button"
                onClick={handleGemBilProfil}
                className={`flex items-center text-sm px-3 py-1.5 rounded-md ${isBilProfilGemt ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'}`}
              >
                {isBilProfilGemt ? (
                  <>
                    <FaCloudDownloadAlt className="mr-1.5" />
                    Profil gemt
                  </>
                ) : (
                  <>
                    <FaSave className="mr-1.5" />
                    Gem denne bil
                  </>
                )}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaIndustry className="mr-2 text-gray-500" />
                Bilmærke <span className="text-red-500">*</span>
              </label>
              <div className="relative" ref={maerkeDropdownRef}>
                <div className="relative">
                  <input
                    type="text"
                    name="bilmaerke"
                    value={formData.bilmaerke}
                    onChange={handleChange}
                    onClick={() => setShowMaerkeDropdown(true)}
                    className={`block w-full border ${fieldErrors.bilmaerke ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 pr-10`}
                    placeholder="Vælg eller søg efter bilmærke..."
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMaerkeDropdown(!showMaerkeDropdown)}
                    className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-gray-500"
                  >
                    {showMaerkeDropdown ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
                
                {showMaerkeDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base overflow-auto max-h-60 border border-gray-300">
                    {filteredBrands.length > 0 ? (
                      filteredBrands.map((brand) => (
                        <div
                          key={brand.value}
                          onClick={() => handleBrandSelect(brand)}
                          className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 ${selectedBrand?.value === brand.value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}`}
                        >
                          {brand.label}
                          {selectedBrand?.value === brand.value && (
                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                              ✓
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500">
                        Ingen resultater fundet
                      </div>
                    )}
                  </div>
                )}
                
                {fieldErrors.bilmaerke && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.bilmaerke}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaCarAlt className="mr-2 text-gray-500" />
                Model <span className="text-red-500">*</span>
              </label>
              <div className="relative" ref={modelDropdownRef}>
                <div className="relative">
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    onClick={() => selectedBrand && setShowModelDropdown(true)}
                    className={`block w-full border ${fieldErrors.model ? 'border-red-300 bg-red-50' : selectedBrand ? 'border-gray-300' : 'border-gray-200 bg-gray-50'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 pr-10`}
                    placeholder={selectedBrand ? "Vælg eller søg efter model..." : "Vælg først et bilmærke"}
                    disabled={!selectedBrand}
                    autoComplete="off"
                  />
                  {selectedBrand && (
                    <button
                      type="button"
                      onClick={() => setShowModelDropdown(!showModelDropdown)}
                      className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-gray-500"
                    >
                      {showModelDropdown ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  )}
                </div>
                
                {showModelDropdown && selectedBrand && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base overflow-auto max-h-60 border border-gray-300">
                    {filteredModels.length > 0 ? (
                      filteredModels.map((model) => (
                        <div
                          key={model.value}
                          onClick={() => handleModelSelect(model)}
                          className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 text-gray-900"
                        >
                          {model.label}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500">
                        Ingen resultater fundet
                      </div>
                    )}
                  </div>
                )}
                
                {fieldErrors.model && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.model}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaInfoCircle className="mr-2 text-gray-500" />
                Betegnelse
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="betegnelse"
                  value={formData.betegnelse}
                  onChange={handleChange}
                  className={`block w-full border ${fieldErrors.betegnelse ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3`}
                  placeholder="F.eks. Long Range"
                />
                {fieldErrors.betegnelse && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.betegnelse}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaTachometerAlt className="mr-2 text-gray-500" />
                HK <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="hk"
                  value={formData.hk}
                  onChange={handleChange}
                  className={`block w-full border ${fieldErrors.hk ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3`}
                  placeholder="F.eks. 346"
                />
                {fieldErrors.hk && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.hk}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaCalendarAlt className="mr-2 text-gray-500" />
                Første registrering <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="foersteRegistreringsdato"
                  value={formData.foersteRegistreringsdato}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]} // Begrænser til dagens dato som max
                  className={`block w-full border ${fieldErrors.foersteRegistreringsdato ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3`}
                />
                {fieldErrors.foersteRegistreringsdato && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.foersteRegistreringsdato}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaTachometerAlt className="mr-2 text-gray-500" />
                Kilometer <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="kilometer"
                  value={formData.kilometer}
                  onChange={handleChange}
                  className={`block w-full border ${fieldErrors.kilometer ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3`}
                  placeholder="F.eks. 15.000"
                />
                {fieldErrors.kilometer && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.kilometer}</p>
                )}
              </div>
            </div>
            
            {/* Stelnummer (vises efter opslag) */}
            {formData.stelnummer && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaIdCard className="mr-2 text-gray-500" />
                  Stelnummer (VIN)
                </label>
                <div className="flex items-center mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-sm text-gray-600 font-mono">{formData.stelnummer}</p>
                </div>
              </div>
            )}
            
            {/* Registreringsnummer (vises efter opslag) */}
            {formData.nummerplade && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaCar className="mr-2 text-gray-500" />
                  Registreringsnummer
                </label>
                <div className="flex items-center mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-sm text-gray-600 font-mono">{formData.nummerplade}</p>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaInfoCircle className="mr-2 text-gray-500" />
                Køreklar vægt
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="koereklarVaegt"
                  value={formData.koereklarVaegt}
                  onChange={handleChange}
                  className={`block w-full border ${fieldErrors.koereklarVaegt ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3`}
                  placeholder="F.eks. 1650"
                />
                {fieldErrors.koereklarVaegt && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.koereklarVaegt}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaInfoCircle className="mr-2 text-gray-500" />
                Biltyper
              </label>
              <div className="relative">
                <select
                  name="bilType"
                  value={formData.bilType}
                  onChange={handleChange}
                  className={`block w-full border ${fieldErrors.bilType ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3`}
                >
                  <option value="">Vælg en biltype</option>
                  <option value="personbil">Personbil</option>
                  <option value="varebil">Varebil</option>
                  <option value="suv">SUV</option>
                  <option value="andet">Andet</option>
                </select>
                {fieldErrors.bilType && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.bilType}</p>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Forventet km/år <span className="text-red-500">*</span></label>
              <select 
                name="kmAarligt"
                value={formData.kmAarligt}
                onChange={handleChange}
                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base ${fieldErrors.kmAarligt ? 'border-red-300 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md`}
              >
                {Array.from({length: 12}, (_, i) => (i + 1) * 5000).map(km => (
                  <option key={km} value={km}>{km.toLocaleString()} km</option>
                ))}
              </select>
              {fieldErrors.kmAarligt && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.kmAarligt}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Udvidet fabriksgaranti (mdr)</label>
              <input
                type="number"
                name="fabriksgarantiMdr"
                value={formData.fabriksgarantiMdr || ''}
                onChange={e => {
                  const val = e.target.value;
                  let error = '';
                  if (val && (isNaN(Number(val)) || Number(val) < 0 || Number(val) > 84)) {
                    error = 'Ugyldigt antal måneder (0-84)';
                  }
                  setFieldErrors((fe: any) => ({ ...fe, fabriksgarantiMdr: error }));
                  handleChange(e);
                }}
                min={0}
                max={84}
                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base ${fieldErrors.fabriksgarantiMdr ? 'border-red-300 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md`}
                placeholder="F.eks. 36"
              />
              {fieldErrors.fabriksgarantiMdr && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.fabriksgarantiMdr}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Felter markeret med <span className="text-red-500">*</span> er obligatoriske</p>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button 
            className={`inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${formComplete ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            disabled={!formComplete}
            onClick={() => {
              if (formComplete) {
                // Gem bilprofilen hvis den ikke allerede er gemt
                if (!isBilProfilGemt) {
                  handleGemBilProfil();
                }
                // Navigér til aftaleoverblik siden med formData
                navigate('/aftaleoverblik', { state: { bildataFormData: formData } });
              }
            }}
          >
            Fortsæt til aftaleoverblik
            {!formComplete && (
              <span className="ml-2 text-xs text-white-600 bg-gray-500 py-0.5 px-1.5 rounded-full">
                Udfyld alle nødvendige felter
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Bildata;
