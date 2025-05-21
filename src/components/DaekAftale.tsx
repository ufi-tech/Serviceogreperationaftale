import React, { useState, useRef, useEffect } from 'react';
import { FaInfoCircle, FaSun, FaSnowflake, FaCalendarDay, FaCheck } from 'react-icons/fa';

// Definerer en type for dæktyper for at undgå gentagelser
type DaekType = 'sommer' | 'vinter' | 'helaar';

// Definerer en type for dækkategori
type DaekKategori = 'budget' | 'economy' | 'premium';

// Definerer den datastruktur, der returneres fra DaekAftale komponenten
interface DaekAftaleData {
  valgteTyper: { sommer: boolean; vinter: boolean; helaar: boolean };
  kategoriSommer: DaekKategori;
  kategoriVinter: DaekKategori;
  kategoriHelaar: DaekKategori;
  forskelligeStoerrelserForBagSommer: boolean;
  forskelligeStoerrelserForBagVinter: boolean;
  forskelligeStoerrelserForBagHelaar: boolean;
  sommerDaekStoerrelseFor: DaekStoerrelse;
  sommerDaekStoerrelserBag: DaekStoerrelse;
  vinterDaekStoerrelseFor: DaekStoerrelse;
  vinterDaekStoerrelserBag: DaekStoerrelse;
  helaarDaekStoerrelseFor: DaekStoerrelse;
  helaarDaekStoerrelserBag: DaekStoerrelse;
  sommerDaekMoensterdybde: number;
  vinterDaekMoensterdybde: number;
  helaarDaekMoensterdybde: number;
  sommerDaekErNye: boolean;
  vinterDaekErNye: boolean;
  helaarDaekErNye: boolean;
  ekstraFaelgePris: number;
};

// Definerer dækbrands for hver kategori med beskrivelser
const daekBrands = {
  budget: {
    title: 'Budget dækbrands',
    description: 'Prisvenlige dæk med god værdi for pengene. Velegnet til biler med lavt kilometerbehov.',
    brands: ['Sailun', 'Jinyu', 'Fortuna', 'Nankang', 'Maxxis']
  },
  economy: {
    title: 'Economy dækbrands',
    description: 'Mellemklassedæk med god balance mellem pris og kvalitet. God holdbarhed og levetid.',
    brands: ['Falken', 'Hankook', 'Nexen', 'Kumho', 'Toyo']
  },
  premium: {
    title: 'Premium dækbrands',
    description: 'Højkvalitetsdæk fra førende producenter med førsteklasses egenskaber i både vådt og tørt føre.',
    brands: ['Michelin', 'Continental', 'Bridgestone', 'Pirelli', 'Goodyear']
  }
};

interface DaekStoerrelse {
  bredde: string;
  profil: string;
  diameter: string;
}

interface DaekError {
  bredde: boolean;
  profil: boolean;
  diameter: boolean;
}

interface UdvidetDaekError {
  for: DaekError;
  bag: DaekError;
}

interface DaekAftaleInitialData {
  valgteTyper?: { sommer: boolean; vinter: boolean; helaar: boolean };
  kategoriSommer?: DaekKategori;
  kategoriVinter?: DaekKategori;
  kategoriHelaar?: DaekKategori;
  forskelligeStoerrelserForBagSommer?: boolean;
  forskelligeStoerrelserForBagVinter?: boolean;
  forskelligeStoerrelserForBagHelaar?: boolean;
  sommerDaekStoerrelseFor?: DaekStoerrelse;
  sommerDaekStoerrelserBag?: DaekStoerrelse;
  vinterDaekStoerrelseFor?: DaekStoerrelse;
  vinterDaekStoerrelserBag?: DaekStoerrelse;
  helaarDaekStoerrelseFor?: DaekStoerrelse;
  helaarDaekStoerrelserBag?: DaekStoerrelse;
  
  // Mønsterdybde
  sommerDaekMoensterdybde?: number;      // Mønsterdybde på sommerdæk (mm)
  vinterDaekMoensterdybde?: number;      // Mønsterdybde på vinterdæk (mm)
  helaarDaekMoensterdybde?: number;      // Mønsterdybde på helårsdæk (mm)
  
  // Markering af nye dæk (der ikke skal medregnes i pris)
  sommerDaekErNye?: boolean;             // Om sommerdæk er nye og allerede betalt af kunden
  vinterDaekErNye?: boolean;             // Om vinterdæk er nye og allerede betalt af kunden
  helaarDaekErNye?: boolean;             // Om helårsdæk er nye og allerede betalt af kunden
  
  // Ekstra fælge
  ekstraFaelgePris?: number;             // Pris for ekstra fælge der skal finansieres i aftalen
}

interface DaekAftaleProps {
  onChange: (values: DaekAftaleData) => void;
  initialData?: DaekAftaleInitialData;
}

// Definerer standardværdier til brug for initialiseringen af states
const DEFAULT_VALGTE_TYPER = { sommer: false, vinter: false, helaar: false };
const DEFAULT_KATEGORI: DaekKategori = 'economy';
const DEFAULT_DAEK_STOERRELSE: DaekStoerrelse = { bredde: '', profil: '', diameter: '' };
const DEFAULT_MOENSTERDYBDE = 8.0;
const DEFAULT_ER_NYE = false;
const DEFAULT_FORSKELLIGE_STOERRELSER = false;
const DEFAULT_EKSTRA_FAELGE_PRIS = 0;

const DaekAftale: React.FC<DaekAftaleProps> = ({ onChange, initialData }) => {
  // Valgte dæksæsoner
  const [valgteTyper, setValgteTyper] = useState<{ sommer: boolean; vinter: boolean; helaar: boolean }>(
    initialData?.valgteTyper || DEFAULT_VALGTE_TYPER
  );

  // Dækkategori
  const [kategoriSommer, setKategoriSommer] = useState<DaekKategori>(initialData?.kategoriSommer || DEFAULT_KATEGORI);
  const [kategoriVinter, setKategoriVinter] = useState<DaekKategori>(initialData?.kategoriVinter || DEFAULT_KATEGORI);
  const [kategoriHelaar, setKategoriHelaar] = useState<DaekKategori>(initialData?.kategoriHelaar || DEFAULT_KATEGORI);
  
  const [showBrands, setShowBrands] = useState<string | null>(null);
  
  // Timeout referencer til hover-effekter for at undgå flimmer
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [isMouseOverPopup, setIsMouseOverPopup] = useState(false);
  
  // Flag for om der er forskellige størrelser for for- og bagaksel
  const [forskelligeStoerrelserForBagSommer, setForskellligeStoerrelserForBagSommer] = useState<boolean>(
    initialData?.forskelligeStoerrelserForBagSommer || DEFAULT_FORSKELLIGE_STOERRELSER
  );
  const [forskelligeStoerrelserForBagVinter, setForskellligeStoerrelserForBagVinter] = useState<boolean>(
    initialData?.forskelligeStoerrelserForBagVinter || DEFAULT_FORSKELLIGE_STOERRELSER
  );
  const [forskelligeStoerrelserForBagHelaar, setForskellligeStoerrelserForBagHelaar] = useState<boolean>(
    initialData?.forskelligeStoerrelserForBagHelaar || DEFAULT_FORSKELLIGE_STOERRELSER
  );
  
  // Dækstørrelser for foraksel (standard) - alle sæsoner
  const [sommerDaekStoerrelseFor, setSommerDaekStoerrelseFor] = useState<DaekStoerrelse>(
    initialData?.sommerDaekStoerrelseFor || DEFAULT_DAEK_STOERRELSE
  );
  const [vinterDaekStoerrelseFor, setVinterDaekStoerrelseFor] = useState<DaekStoerrelse>(
    initialData?.vinterDaekStoerrelseFor || DEFAULT_DAEK_STOERRELSE
  );
  const [helaarDaekStoerrelseFor, setHelaarDaekStoerrelseFor] = useState<DaekStoerrelse>(
    initialData?.helaarDaekStoerrelseFor || DEFAULT_DAEK_STOERRELSE
  );
  
  // Dækstørrelser for bagaksel (når forskellige) - alle sæsoner
  const [sommerDaekStoerrelserBag, setSommerDaekStoerrelserBag] = useState<DaekStoerrelse>(
    initialData?.sommerDaekStoerrelserBag || DEFAULT_DAEK_STOERRELSE
  );
  const [vinterDaekStoerrelserBag, setVinterDaekStoerrelserBag] = useState<DaekStoerrelse>(
    initialData?.vinterDaekStoerrelserBag || DEFAULT_DAEK_STOERRELSE
  );
  const [helaarDaekStoerrelserBag, setHelaarDaekStoerrelserBag] = useState<DaekStoerrelse>(
    initialData?.helaarDaekStoerrelserBag || DEFAULT_DAEK_STOERRELSE
  );
  
  // Mønsterdybde på dæk
  const [sommerDaekMoensterdybde, setSommerDaekMoensterdybde] = useState<number>(
    initialData?.sommerDaekMoensterdybde || DEFAULT_MOENSTERDYBDE
  );
  const [vinterDaekMoensterdybde, setVinterDaekMoensterdybde] = useState<number>(
    initialData?.vinterDaekMoensterdybde || DEFAULT_MOENSTERDYBDE
  );
  const [helaarDaekMoensterdybde, setHelaarDaekMoensterdybde] = useState<number>(
    initialData?.helaarDaekMoensterdybde || DEFAULT_MOENSTERDYBDE
  );
  
  // Flag for om dækkene er nye og allerede betalt (og derfor ikke skal medregnes i aftalen)
  const [sommerDaekErNye, setSommerDaekErNye] = useState<boolean>(
    initialData?.sommerDaekErNye || DEFAULT_ER_NYE
  );
  const [vinterDaekErNye, setVinterDaekErNye] = useState<boolean>(
    initialData?.vinterDaekErNye || DEFAULT_ER_NYE
  );
  const [helaarDaekErNye, setHelaarDaekErNye] = useState<boolean>(
    initialData?.helaarDaekErNye || DEFAULT_ER_NYE
  );
  
  // Ekstra fælge
  const [ekstraFaelgePris, setEkstraFaelgePris] = useState<number>(
    initialData?.ekstraFaelgePris || DEFAULT_EKSTRA_FAELGE_PRIS
  );
  
  // Valideringsfejl for foraksel dækstørrelser
  const [sommerErrorsFor, setSommerErrorsFor] = useState<DaekError>({ bredde: false, profil: false, diameter: false });
  const [vinterErrorsFor, setVinterErrorsFor] = useState<DaekError>({ bredde: false, profil: false, diameter: false });
  const [helaarErrorsFor, setHelaarErrorsFor] = useState<DaekError>({ bredde: false, profil: false, diameter: false });
  
  // Valideringsfejl for bagaksel dækstørrelser
  const [sommerErrorsBag, setSommerErrorsBag] = useState<DaekError>({ bredde: false, profil: false, diameter: false });
  const [vinterErrorsBag, setVinterErrorsBag] = useState<DaekError>({ bredde: false, profil: false, diameter: false });
  const [helaarErrorsBag, setHelaarErrorsBag] = useState<DaekError>({ bredde: false, profil: false, diameter: false });
  
  // Input references for dækstørrelser - sommer foraksel
  const sommerBreddeForInputRef = useRef<HTMLInputElement>(null);
  const sommerProfilForInputRef = useRef<HTMLInputElement>(null);
  const sommerDiameterForInputRef = useRef<HTMLInputElement>(null);
  
  // Input references for dækstørrelser - sommer bagaksel
  const sommerBreddeBagInputRef = useRef<HTMLInputElement>(null);
  const sommerProfilBagInputRef = useRef<HTMLInputElement>(null);
  const sommerDiameterBagInputRef = useRef<HTMLInputElement>(null);
  
  // Input references for dækstørrelser - vinter foraksel
  const vinterBreddeForInputRef = useRef<HTMLInputElement>(null);
  const vinterProfilForInputRef = useRef<HTMLInputElement>(null);
  const vinterDiameterForInputRef = useRef<HTMLInputElement>(null);
  
  // Input references for dækstørrelser - vinter bagaksel
  const vinterBreddeBagInputRef = useRef<HTMLInputElement>(null);
  const vinterProfilBagInputRef = useRef<HTMLInputElement>(null);
  const vinterDiameterBagInputRef = useRef<HTMLInputElement>(null);
  
  // Input references for dækstørrelser - helår foraksel
  const helaarBreddeForInputRef = useRef<HTMLInputElement>(null);
  const helaarProfilForInputRef = useRef<HTMLInputElement>(null);
  const helaarDiameterForInputRef = useRef<HTMLInputElement>(null);
  
  // Input references for dækstørrelser - helår bagaksel
  const helaarBreddeBagInputRef = useRef<HTMLInputElement>(null);
  const helaarProfilBagInputRef = useRef<HTMLInputElement>(null);
  const helaarDiameterBagInputRef = useRef<HTMLInputElement>(null);
  
  // Valideringsbeskeder for visning til brugeren
  const errorMessages = {
    bredde: 'Skal være 3 cifre mellem 135-395 og delelig med 5',
    profil: 'Skal være 2 cifre mellem 20-95 og delelig med 5',
    diameter: 'Skal være 2 cifre mellem 15-23'
  };
  
  // Funktion til at håndtere ændringer i mønsterdybde
  const handleMoensterdybdeChange = (type: DaekType, value: string) => {
    const numValue = parseFloat(value);
    
    // Validere mønsterdybde (mellem 0 og 10 mm)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
      switch (type) {
        case 'sommer':
          setSommerDaekMoensterdybde(numValue);
          break;
        case 'vinter':
          setVinterDaekMoensterdybde(numValue);
          break;
        case 'helaar':
          setHelaarDaekMoensterdybde(numValue);
          break;
      }
    }
  };

  // Funktion til at håndtere ændringer i nye dæk checkbox
  const handleNyeDaekChange = (type: DaekType, checked: boolean) => {
    switch (type) {
      case 'sommer':
        setSommerDaekErNye(checked);
        if (checked) {
          // Hvis nye dæk er markeret, sæt mønsterdybde til 8mm (nye dæk)
          setSommerDaekMoensterdybde(8);
        }
        break;
      case 'vinter':
        setVinterDaekErNye(checked);
        if (checked) {
          // Hvis nye dæk er markeret, sæt mønsterdybde til 8mm (nye dæk)
          setVinterDaekMoensterdybde(8);
        }
        break;
      case 'helaar':
        setHelaarDaekErNye(checked);
        if (checked) {
          // Hvis nye dæk er markeret, sæt mønsterdybde til 8mm (nye dæk)
          setHelaarDaekMoensterdybde(8);
        }
        break;
    }
  };

  // Funktion til at håndtere ændringer i ekstra fælgepris
  const handleEkstraFaelgePrisChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setEkstraFaelgePris(numValue);
    }
  };
  
  // Validering af dæk størrelser
  const validateDaekInput = (field: keyof DaekStoerrelse, value: string): boolean => {
    // Konverter input til tal for validering
    const numValue = parseInt(value);
    
    if (isNaN(numValue)) return false;
    
    switch(field) {
      case 'bredde':
        return numValue >= 135 && numValue <= 395 && numValue % 5 === 0;
      case 'profil':
        return numValue >= 20 && numValue <= 95 && numValue % 5 === 0;
      case 'diameter':
        return numValue >= 15 && numValue <= 23;
      default:
        return false;
    }
  };
  
  // Håndterer ændringer i dæk størrelser input for foraksel
  const handleDaekStoerrelseChangeFor = (
    type: DaekType,
    field: keyof DaekStoerrelse,
    value: string
  ) => {
    // Tillad kun tal i inputfelter
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Opdater værdier og valideringsstatus for foraksel
    if (type === 'sommer') {
      // Opdater dækstørrelse for foraksel
      setSommerDaekStoerrelseFor(prev => ({ ...prev, [field]: numericValue }));
      
      // Valider input og sæt fejl hvis nødvendigt
      if (numericValue) {
        const isValid = validateDaekInput(field, numericValue);
        setSommerErrorsFor(prev => ({ ...prev, [field]: !isValid }));
      } else {
        // Hvis feltet er tomt, fjern fejl
        setSommerErrorsFor(prev => ({ ...prev, [field]: false }));
      }
      
      // Hvis brugeren ikke har valgt forskellige størrelser, kopier til bagaksel
      if (!forskelligeStoerrelserForBagSommer) {
        setSommerDaekStoerrelserBag(prev => ({ ...prev, [field]: numericValue }));
        setSommerErrorsBag(prev => ({ ...prev, [field]: numericValue ? !validateDaekInput(field, numericValue) : false }));
      }
    }
    else if (type === 'vinter') {
      // Opdater dækstørrelse for foraksel
      setVinterDaekStoerrelseFor(prev => ({ ...prev, [field]: numericValue }));
      
      // Valider input og sæt fejl hvis nødvendigt
      if (numericValue) {
        const isValid = validateDaekInput(field, numericValue);
        setVinterErrorsFor(prev => ({ ...prev, [field]: !isValid }));
      } else {
        // Hvis feltet er tomt, fjern fejl
        setVinterErrorsFor(prev => ({ ...prev, [field]: false }));
      }
      
      // Hvis brugeren ikke har valgt forskellige størrelser, kopier til bagaksel
      if (!forskelligeStoerrelserForBagVinter) {
        setVinterDaekStoerrelserBag(prev => ({ ...prev, [field]: numericValue }));
        setVinterErrorsBag(prev => ({ ...prev, [field]: numericValue ? !validateDaekInput(field, numericValue) : false }));
      }
    }
    else if (type === 'helaar') {
      // Opdater dækstørrelse for foraksel
      setHelaarDaekStoerrelseFor(prev => ({ ...prev, [field]: numericValue }));
      
      // Valider input og sæt fejl hvis nødvendigt
      if (numericValue) {
        const isValid = validateDaekInput(field, numericValue);
        setHelaarErrorsFor(prev => ({ ...prev, [field]: !isValid }));
      } else {
        // Hvis feltet er tomt, fjern fejl
        setHelaarErrorsFor(prev => ({ ...prev, [field]: false }));
      }
      
      // Hvis brugeren ikke har valgt forskellige størrelser, kopier til bagaksel
      if (!forskelligeStoerrelserForBagHelaar) {
        setHelaarDaekStoerrelserBag(prev => ({ ...prev, [field]: numericValue }));
        setHelaarErrorsBag(prev => ({ ...prev, [field]: numericValue ? !validateDaekInput(field, numericValue) : false }));
      }
    }
  };
  
  // Håndterer ændringer i dæk størrelser input for bagaksel
  const handleDaekStoerrelseChangeBag = (
    type: DaekType,
    field: keyof DaekStoerrelse,
    value: string
  ) => {
    // Tillad kun tal i inputfelter
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Opdater værdier og valideringsstatus for bagaksel
    if (type === 'sommer') {
      // Opdater dækstørrelse for bagaksel
      setSommerDaekStoerrelserBag(prev => ({ ...prev, [field]: numericValue }));
      
      // Valider input og sæt fejl hvis nødvendigt
      if (numericValue) {
        const isValid = validateDaekInput(field, numericValue);
        setSommerErrorsBag(prev => ({ ...prev, [field]: !isValid }));
      } else {
        // Hvis feltet er tomt, fjern fejl
        setSommerErrorsBag(prev => ({ ...prev, [field]: false }));
      }
    }
    else if (type === 'vinter') {
      // Opdater dækstørrelse for bagaksel
      setVinterDaekStoerrelserBag(prev => ({ ...prev, [field]: numericValue }));
      
      // Valider input og sæt fejl hvis nødvendigt
      if (numericValue) {
        const isValid = validateDaekInput(field, numericValue);
        setVinterErrorsBag(prev => ({ ...prev, [field]: !isValid }));
      } else {
        // Hvis feltet er tomt, fjern fejl
        setVinterErrorsBag(prev => ({ ...prev, [field]: false }));
      }
    }
    else if (type === 'helaar') {
      // Opdater dækstørrelse for bagaksel
      setHelaarDaekStoerrelserBag(prev => ({ ...prev, [field]: numericValue }));
      
      // Valider input og sæt fejl hvis nødvendigt
      if (numericValue) {
        const isValid = validateDaekInput(field, numericValue);
        setHelaarErrorsBag(prev => ({ ...prev, [field]: !isValid }));
      } else {
        // Hvis feltet er tomt, fjern fejl
        setHelaarErrorsBag(prev => ({ ...prev, [field]: false }));
      }
    }
  };
  
  // Skifter tilstand for "forskellige størrelser for/bag"
  const handleForskellligeStoerrelserToggle = (type: DaekType) => {
    if (type === 'sommer') {
      const nyTilstand = !forskelligeStoerrelserForBagSommer;
      setForskellligeStoerrelserForBagSommer(nyTilstand);
      
      // Hvis vi slår funktionen fra, kopier foraksels dimensioner til bagaksel
      if (!nyTilstand) {
        setSommerDaekStoerrelserBag({...sommerDaekStoerrelseFor});
        setSommerErrorsBag({...sommerErrorsFor});
      }
    }
    else if (type === 'vinter') {
      const nyTilstand = !forskelligeStoerrelserForBagVinter;
      setForskellligeStoerrelserForBagVinter(nyTilstand);
      
      // Hvis vi slår funktionen fra, kopier foraksels dimensioner til bagaksel
      if (!nyTilstand) {
        setVinterDaekStoerrelserBag({...vinterDaekStoerrelseFor});
        setVinterErrorsBag({...vinterErrorsFor});
      }
    }
    else if (type === 'helaar') {
      const nyTilstand = !forskelligeStoerrelserForBagHelaar;
      setForskellligeStoerrelserForBagHelaar(nyTilstand);
      
      // Hvis vi slår funktionen fra, kopier foraksels dimensioner til bagaksel
      if (!nyTilstand) {
        setHelaarDaekStoerrelserBag({...helaarDaekStoerrelseFor});
        setHelaarErrorsBag({...helaarErrorsFor});
      }
    }
  };
  
  // Render dæk størrelse input felter med støtte for forskellige størrelser for for- og bagaksel
  const renderDaekStoerrelseInputs = (type: DaekType) => {
    // Bestem de relevante states og refs for den valgte dæktype
    const stoerrelseFor = 
      type === 'sommer' ? sommerDaekStoerrelseFor :
      type === 'vinter' ? vinterDaekStoerrelseFor :
      helaarDaekStoerrelseFor;
    const stoerrelserBag = 
      type === 'sommer' ? sommerDaekStoerrelserBag :
      type === 'vinter' ? vinterDaekStoerrelserBag :
      helaarDaekStoerrelserBag;
    const errorsFor = 
      type === 'sommer' ? sommerErrorsFor :
      type === 'vinter' ? vinterErrorsFor :
      helaarErrorsFor;
    const errorsBag = 
      type === 'sommer' ? sommerErrorsBag :
      type === 'vinter' ? vinterErrorsBag :
      helaarErrorsBag;
    const forskelligeStoerrelser = 
      type === 'sommer' ? forskelligeStoerrelserForBagSommer :
      type === 'vinter' ? forskelligeStoerrelserForBagVinter :
      forskelligeStoerrelserForBagHelaar;
    const setForskelligeStoerrelser = 
      type === 'sommer' ? setForskellligeStoerrelserForBagSommer :
      type === 'vinter' ? setForskellligeStoerrelserForBagVinter :
      setForskellligeStoerrelserForBagHelaar;
    const breddeForInputRef = 
      type === 'sommer' ? sommerBreddeForInputRef :
      type === 'vinter' ? vinterBreddeForInputRef :
      helaarBreddeForInputRef;
    const profilForInputRef = 
      type === 'sommer' ? sommerProfilForInputRef :
      type === 'vinter' ? vinterProfilForInputRef :
      helaarProfilForInputRef;
    const diameterForInputRef = 
      type === 'sommer' ? sommerDiameterForInputRef :
      type === 'vinter' ? vinterDiameterForInputRef :
      helaarDiameterForInputRef;
    const breddeBagInputRef = 
      type === 'sommer' ? sommerBreddeBagInputRef :
      type === 'vinter' ? vinterBreddeBagInputRef :
      helaarBreddeBagInputRef;
    const profilBagInputRef = 
      type === 'sommer' ? sommerProfilBagInputRef :
      type === 'vinter' ? vinterProfilBagInputRef :
      helaarProfilBagInputRef;
    const diameterBagInputRef = 
      type === 'sommer' ? sommerDiameterBagInputRef :
      type === 'vinter' ? vinterDiameterBagInputRef :
      helaarDiameterBagInputRef;

    // Label til checkbox
    const label = 'Forskellige størrelser for/bag?';

    // Funktion til at håndtere checkbox toggle
    const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
      setForskelligeStoerrelser(e.target.checked);
      // Hvis man slår funktionen fra, kopier foraksels værdier til bagaksel
      if (!e.target.checked) {
        stoerrelserBag.bredde = stoerrelseFor.bredde;
        stoerrelserBag.profil = stoerrelseFor.profil;
        stoerrelserBag.diameter = stoerrelseFor.diameter;
      }
    };

    // Udvidet håndtering af ændringer i foraksel dækstørrelse med automatisk fokus-skift
    const handleEnhancedChangeFor = (field: keyof DaekStoerrelse, value: string) => {
      handleDaekStoerrelseChangeFor(type, field, value);
      
      // Numerisk værdi (uden evt. ikke-tal tegn) for validering
      const numericValue = value.replace(/[^0-9]/g, '');
      
      // Hvis feltværdien er valid, flyttes fokus til næste input
      if (numericValue && validateDaekInput(field, numericValue)) {
        // Fokus automatisk til næste felt ved valid input
        if (field === 'bredde' && profilForInputRef.current) {
          profilForInputRef.current.focus();
        } else if (field === 'profil' && diameterForInputRef.current) {
          diameterForInputRef.current.focus();
        }
      }
    };
    
    // Udvidet håndtering af ændringer i bagaksel dækstørrelse med automatisk fokus-skift
    const handleEnhancedChangeBag = (field: keyof DaekStoerrelse, value: string) => {
      handleDaekStoerrelseChangeBag(type, field, value);
      
      // Numerisk værdi (uden evt. ikke-tal tegn) for validering
      const numericValue = value.replace(/[^0-9]/g, '');
      
      // Hvis feltværdien er valid, flyttes fokus til næste input
      if (numericValue && validateDaekInput(field, numericValue)) {
        // Fokus automatisk til næste felt ved valid input
        if (field === 'bredde' && profilBagInputRef.current) {
          profilBagInputRef.current.focus();
        } else if (field === 'profil' && diameterBagInputRef.current) {
          diameterBagInputRef.current.focus();
        }
      }
    };

    // Render forskellige størrelser checkbox og dækstørrelse inputs
    return (
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2 flex justify-between items-center">
          <span>Angiv dækstørrelse:</span>
          <label className="flex items-center text-sm cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={forskelligeStoerrelser} 
              onChange={() => handleForskellligeStoerrelserToggle(type)}
              className="mr-2 h-4 w-4" 
            />
            Forskellige størrelser for/bag
          </label>
        </div>
        
        {/* Foraksel dækstørrelser */}
        <div className="mb-3">
          <div className="text-sm text-gray-700 mb-2">{forskelligeStoerrelser ? 'Foraksel:' : 'Alle aksler:'}</div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Bredde (mm)</label>
              <input
                ref={breddeForInputRef}
                type="text"
                value={stoerrelseFor.bredde}
                onChange={(e) => handleEnhancedChangeFor('bredde', e.target.value)}
                className={`w-full p-2 border rounded-md ${errorsFor.bredde ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                placeholder="205"
              />
              {errorsFor.bredde && <div className="text-xs text-red-500 mt-1">{errorMessages.bredde}</div>}
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">Profil (%)</label>
              <input
                ref={profilForInputRef}
                type="text"
                value={stoerrelseFor.profil}
                onChange={(e) => handleEnhancedChangeFor('profil', e.target.value)}
                className={`w-full p-2 border rounded-md ${errorsFor.profil ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                placeholder="55"
              />
              {errorsFor.profil && <div className="text-xs text-red-500 mt-1">{errorMessages.profil}</div>}
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">Diameter (")</label>
              <input
                ref={diameterForInputRef}
                type="text"
                value={stoerrelseFor.diameter}
                onChange={(e) => handleEnhancedChangeFor('diameter', e.target.value)}
                className={`w-full p-2 border rounded-md ${errorsFor.diameter ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                placeholder="16"
              />
              {errorsFor.diameter && <div className="text-xs text-red-500 mt-1">{errorMessages.diameter}</div>}
          </div>
          </div>
        </div>
        
        {/* Bagaksel dækstørrelser - kun vist når 'forskellige størrelser' er valgt */}
        {forskelligeStoerrelser && (
          <div className="mt-3">
            <div className="text-sm text-gray-700 mb-2">Bagaksel:</div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Bredde (mm)</label>
                <input
                  ref={breddeBagInputRef}
                  type="text"
                  value={stoerrelserBag.bredde}
                  onChange={(e) => handleEnhancedChangeBag('bredde', e.target.value)}
                  className={`w-full p-2 border rounded-md ${errorsBag.bredde ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  placeholder="225"
                />
                {errorsBag.bredde && <div className="text-xs text-red-500 mt-1">{errorMessages.bredde}</div>}
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">Profil (%)</label>
                <input
                  ref={profilBagInputRef}
                  type="text"
                  value={stoerrelserBag.profil}
                  onChange={(e) => handleEnhancedChangeBag('profil', e.target.value)}
                  className={`w-full p-2 border rounded-md ${errorsBag.profil ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  placeholder="50"
                />
                {errorsBag.profil && <div className="text-xs text-red-500 mt-1">{errorMessages.profil}</div>}
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">Diameter (")</label>
                <input
                  ref={diameterBagInputRef}
                  type="text"
                  value={stoerrelserBag.diameter}
                  onChange={(e) => handleEnhancedChangeBag('diameter', e.target.value)}
                  className={`w-full p-2 border rounded-md ${errorsBag.diameter ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  placeholder="16"
                />
                {errorsBag.diameter && <div className="text-xs text-red-500 mt-1">{errorMessages.diameter}</div>}
              </div>
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-2">
          Standard format: Bredde/Profil R Diameter (f.eks. 205/55 R16)
        </div>
      </div>
    );
  };

  // Håndterer valg af dæksæson 
  const handleDaekTypeValg = (type: DaekType) => {
    if (type === 'helaar') {
      // Når helårsdæk vælges, skal sommer og vinterdæk deaktiveres
      setValgteTyper({ sommer: false, vinter: false, helaar: true });
    } else if (type === 'sommer') {
      if (valgteTyper.helaar) {
        // Hvis helårsdæk er valgt og sommer vælges, deaktiver helårsdæk
        setValgteTyper({ sommer: true, vinter: valgteTyper.vinter, helaar: false });
      } else {
        // Normal toggle for sommerdæk
        setValgteTyper(prev => ({ ...prev, sommer: !prev.sommer }));
      }
    } else if (type === 'vinter') {
      if (valgteTyper.helaar) {
        // Hvis helårsdæk er valgt og vinter vælges, deaktiver helårsdæk
        setValgteTyper({ sommer: valgteTyper.sommer, vinter: true, helaar: false });
      } else {
        // Normal toggle for vinterdæk
        setValgteTyper(prev => ({ ...prev, vinter: !prev.vinter }));
      }
    }
  };
  
  // Reset dækstørrelser og fejl ved dæk-type ændringer
  useEffect(() => {
    // Reset når der ikke er valgt sommerdæk
    if (!valgteTyper.sommer) {
      // Reset foraksel
      setSommerDaekStoerrelseFor({ bredde: '', profil: '', diameter: '' });
      setSommerErrorsFor({ bredde: false, profil: false, diameter: false });
      // Reset bagaksel
      setSommerDaekStoerrelserBag({ bredde: '', profil: '', diameter: '' });
      setSommerErrorsBag({ bredde: false, profil: false, diameter: false });
      // Reset 'forskellige størrelser' flag
      setForskellligeStoerrelserForBagSommer(false);
    }
    
    // Reset når der ikke er valgt vinterdæk
    if (!valgteTyper.vinter) {
      // Reset foraksel
      setVinterDaekStoerrelseFor({ bredde: '', profil: '', diameter: '' });
      setVinterErrorsFor({ bredde: false, profil: false, diameter: false });
      // Reset bagaksel
      setVinterDaekStoerrelserBag({ bredde: '', profil: '', diameter: '' });
      setVinterErrorsBag({ bredde: false, profil: false, diameter: false });
      // Reset 'forskellige størrelser' flag
      setForskellligeStoerrelserForBagVinter(false);
    }
    
    // Reset når der ikke er valgt helårsdæk
    if (!valgteTyper.helaar) {
      // Reset foraksel
      setHelaarDaekStoerrelseFor({ bredde: '', profil: '', diameter: '' });
      setHelaarErrorsFor({ bredde: false, profil: false, diameter: false });
      // Reset bagaksel
      setHelaarDaekStoerrelserBag({ bredde: '', profil: '', diameter: '' });
      setHelaarErrorsBag({ bredde: false, profil: false, diameter: false });
      // Reset 'forskellige størrelser' flag
      setForskellligeStoerrelserForBagHelaar(false);
    }
  }, [valgteTyper]);

  // Render dæk kategori sektion for en sæson
  const renderDaekKategoriSektion = (type: DaekType) => {
    const kategori = 
      type === 'sommer' ? kategoriSommer :
      type === 'vinter' ? kategoriVinter :
      kategoriHelaar;
    
    const setKategori = 
      type === 'sommer' ? setKategoriSommer :
      type === 'vinter' ? setKategoriVinter :
      setKategoriHelaar;
      
    const bgColors = {
      sommer: {
        budget: 'bg-yellow-50 hover:bg-yellow-100',
        economy: 'bg-yellow-100 hover:bg-yellow-200',
        premium: 'bg-yellow-200 hover:bg-yellow-300'
      },
      vinter: {
        budget: 'bg-blue-50 hover:bg-blue-100',
        economy: 'bg-blue-100 hover:bg-blue-200',
        premium: 'bg-blue-200 hover:bg-blue-300'
      },
      helaar: {
        budget: 'bg-green-50 hover:bg-green-100',
        economy: 'bg-green-100 hover:bg-green-200',
        premium: 'bg-green-200 hover:bg-green-300'
      }
    };
    
    const textColors = {
      sommer: {
        budget: 'text-yellow-600',
        economy: 'text-yellow-700',
        premium: 'text-yellow-800'
      },
      vinter: {
        budget: 'text-blue-600',
        economy: 'text-blue-700',
        premium: 'text-blue-800'
      },
      helaar: {
        budget: 'text-green-600',
        economy: 'text-green-700',
        premium: 'text-green-800'
      }
    };
    
    // Funktion til at vise dækbrands popup ved hover - uden debounce for øjeblikkelig visning
    const handleMouseEnter = (kategoriType: DaekKategori) => {
      // Ryd eksisterende timeout for at undgå konflikter
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      
      // Vis popup øjeblikkeligt
      setShowBrands(`${type}-${kategoriType}`);
    };
    
    // Forbedret handleMouseLeave der kun skjuler popup hvis musen ikke er over popuppen
    const handleMouseLeave = () => {
      // Ryd eksisterende timeout for at undgå konflikter
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      
      // Kun skjul popup hvis musen ikke er over popuppen
      if (!isMouseOverPopup) {
        // Sæt timeout for at give mulighed for at musen når hen til popuppen
        hoverTimeoutRef.current = setTimeout(() => {
          // Dobbelttjek om musen er flyttet til popuppen
          if (!isMouseOverPopup) {
            setShowBrands(null);
          }
        }, 700); // Øget til 700ms for bedre brugeroplevelse og mindre flimmer
      }
    };
    
    return (
      <div className="mb-4">
        <div className="mb-1">
          <div className="text-sm font-medium text-gray-700">Vælg dækkvalitet:</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="relative">
            <div
              className={`py-2 rounded-md text-center text-sm font-medium border ${bgColors[type].budget} ${kategori === 'budget' ? 'ring-2 ring-orange-500 border-orange-400' : ''} ${textColors[type].budget} cursor-pointer relative transition-all hover:shadow-md flex items-center justify-center`}
              onClick={() => {
                setKategori('budget');
              }}
            >
              <span className="mr-1">Budget</span>
              {kategori === 'budget' && <FaCheck className="ml-1 text-orange-600" />}
            </div>
            <div 
              className={`absolute top-1 right-1 p-1 text-gray-500 hover:text-gray-700 cursor-help`}
              onMouseEnter={() => handleMouseEnter('budget')}
              onMouseLeave={handleMouseLeave}
              title="Vis information om budget dæk"
            >
              <FaInfoCircle size={14} />
            </div>
          </div>
          
          <div className="relative">
            <div
              className={`py-2 rounded-md text-center text-sm font-medium border ${bgColors[type].economy} ${kategori === 'economy' ? 'ring-2 ring-orange-500 border-orange-400' : ''} ${textColors[type].economy} cursor-pointer relative transition-all hover:shadow-md flex items-center justify-center`}
              onClick={() => {
                setKategori('economy');
              }}
            >
              <span className="mr-1">Economy</span>
              {kategori === 'economy' && <FaCheck className="ml-1 text-orange-600" />}
            </div>
            <div 
              className={`absolute top-1 right-1 p-1 text-gray-500 hover:text-gray-700 cursor-help`}
              onMouseEnter={() => handleMouseEnter('economy')}
              onMouseLeave={handleMouseLeave}
              title="Vis information om economy dæk"
            >
              <FaInfoCircle size={14} />
            </div>
          </div>
          
          <div className="relative">
            <div
              className={`py-2 rounded-md text-center text-sm font-medium border ${bgColors[type].premium} ${kategori === 'premium' ? 'ring-2 ring-orange-500 border-orange-400' : ''} ${textColors[type].premium} cursor-pointer relative transition-all hover:shadow-md flex items-center justify-center`}
              onClick={() => {
                setKategori('premium');
              }}
            >
              <span className="mr-1">Premium</span>
              {kategori === 'premium' && <FaCheck className="ml-1 text-orange-600" />}
            </div>
            <div 
              className={`absolute top-1 right-1 p-1 text-gray-500 hover:text-gray-700 cursor-help`}
              onMouseEnter={() => handleMouseEnter('premium')}
              onMouseLeave={handleMouseLeave}
              title="Vis information om premium dæk"
            >
              <FaInfoCircle size={14} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render mønsterdybde og nye dæk sektion
  const renderMoensterdybdeOgNyeDaekSektion = (type: DaekType) => {
    // Få de korrekte states baseret på dæktypen
    const getMoensterdybde = () => {
      switch (type) {
        case 'sommer': return sommerDaekMoensterdybde;
        case 'vinter': return vinterDaekMoensterdybde;
        case 'helaar': return helaarDaekMoensterdybde;
        default: return 8;
      }
    };
    
    const getErNye = () => {
      switch (type) {
        case 'sommer': return sommerDaekErNye;
        case 'vinter': return vinterDaekErNye;
        case 'helaar': return helaarDaekErNye;
        default: return false;
      }
    };
    
    // Tjek om dæk er markeret som nye
    const erNye = getErNye();
    
    return (
      <div className="mt-4 p-3 bg-white rounded border">
        <div className="text-sm font-medium mb-2">Dækkondition</div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mønsterdybde input */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Mønsterdybde (mm)</label>
            <div className="flex">
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={erNye ? 8 : getMoensterdybde()}
                onChange={(e) => handleMoensterdybdeChange(type, e.target.value)}
                disabled={erNye} 
                readOnly={erNye}
                className={`block w-24 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${erNye ? 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed' : 'border-gray-300'}`}
              />
              <span className="ml-2 text-sm text-gray-500 self-center">mm</span>
            </div>
          </div>
          
          {/* Nye dæk checkbox */}
          <div>
            <div className="flex items-start mt-4">
              <div className="flex items-center h-5">
                <input
                  id={`nye-daek-${type}`}
                  name={`nye-daek-${type}`}
                  type="checkbox"
                  checked={erNye}
                  onChange={(e) => handleNyeDaekChange(type, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor={`nye-daek-${type}`} className="font-medium text-gray-700">
                  Nye dæk
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render ekstra fælge sektion - kun én gang, ikke per dæktype
  const renderEkstraFaelgeSektion = () => {
    return (
      <div className="mt-6 p-4 rounded-lg border bg-gray-50 border-gray-200">
        <h4 className="text-md font-medium flex items-center">
          Ekstra fælge
        </h4>
        
        <div className="mt-3 p-3 bg-white rounded border">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Pris for ekstra fælge (kr.)</label>
              <div className="flex">
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={ekstraFaelgePris}
                  onChange={(e) => handleEkstraFaelgePrisChange(e.target.value)}
                  className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <span className="ml-2 text-sm text-gray-500 self-center">kr.</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Angiv prisen for ekstra fælge, hvis disse skal finansieres i serviceaftalen.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render en komplet dæksæson sektion
  const renderDaekSaesonSektion = (daekType: DaekType) => {
    const saesonTitler = {
      sommer: 'Sommerdæk',
      vinter: 'Vinterdæk',
      helaar: 'Helårsdæk'
    };
    
    const saesonIkoner = {
      sommer: <FaSun className="mr-2 text-yellow-600" />,
      vinter: <FaSnowflake className="mr-2 text-blue-600" />,
      helaar: <FaCalendarDay className="mr-2 text-green-600" />
    };
    
    return (
      <div className={`mt-6 p-4 rounded-lg border ${daekType === 'sommer' ? 'bg-yellow-50 border-yellow-200' : 
        daekType === 'vinter' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
        <h4 className="text-md font-medium flex items-center">
          {saesonIkoner[daekType]}
          {saesonTitler[daekType]}
        </h4>
        
        {/* Dækkategori sektion */}
        {renderDaekKategoriSektion(daekType)}
        
        {/* Dækstørrelse sektion */}
        {renderDaekStoerrelseInputs(daekType)}
        
        {/* Mønsterdybde og nye dæk sektion */}
        {renderMoensterdybdeOgNyeDaekSektion(daekType)}
      </div>
    );
  };

  // Render dækbrands info popup
  const renderDaekBrandsPopup = () => {
    if (!showBrands) return null;
    
    // Parse showBrands to get type and category
    const [type, kategori] = showBrands.split('-') as ['sommer' | 'vinter' | 'helaar', 'budget' | 'economy' | 'premium'];
    
    // Styling baseret på dæktype
    const bgColor = 
      type === 'sommer' ? 'bg-yellow-50 border-yellow-200' : 
      type === 'vinter' ? 'bg-blue-50 border-blue-200' : 
      'bg-green-50 border-green-200';
    
    const headerBgColor = 
      type === 'sommer' ? 'bg-yellow-100' : 
      type === 'vinter' ? 'bg-blue-100' : 
      'bg-green-100';
    
    const textColor = 
      type === 'sommer' ? 'text-yellow-800' : 
      type === 'vinter' ? 'text-blue-800' : 
      'text-green-800';
    
    const headerIcon = 
      type === 'sommer' ? <FaSun className="mr-2" /> : 
      type === 'vinter' ? <FaSnowflake className="mr-2" /> : 
      <FaCalendarDay className="mr-2" />;
      
    const typeTitle = 
      type === 'sommer' ? 'Sommerdæk' : 
      type === 'vinter' ? 'Vinterdæk' : 
      'Helårsdæk';
    
    // Håndter mus-interaktioner for popuppen  
    const handlePopupMouseEnter = () => {
      setIsMouseOverPopup(true);
      
      // Ryd evt. lukketimeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
    };
    
    const handlePopupMouseLeave = () => {
      setIsMouseOverPopup(false);
      
      // Start lukketimeout når musen forlader popup
      hoverTimeoutRef.current = setTimeout(() => {
        setShowBrands(null);
      }, 500); // Øget til 500ms for at give brugeren mere tid til at flytte musen tilbage til knapperne
    };
      
    return (
      <div 
        className="fixed inset-0 bg-transparent flex items-center justify-center z-50" 
        onClick={() => setShowBrands(null)}
      >
        <div 
          ref={popupRef}
          className={`w-full max-w-md rounded-lg shadow-lg ${bgColor} border p-0 m-4`} 
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={handlePopupMouseEnter}
          onMouseLeave={handlePopupMouseLeave}
        >
          <div className={`${headerBgColor} ${textColor} px-4 py-3 rounded-t-lg flex items-center justify-between`}>
            <h3 className="text-lg font-medium flex items-center">
              {headerIcon} {typeTitle} - {daekBrands[kategori].title}
            </h3>
            <button 
              onClick={() => setShowBrands(null)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              ✕
            </button>
          </div>
          
          <div className="p-4">
            <p className="text-gray-600 mb-3">{daekBrands[kategori].description}</p>
            
            <div className="font-medium mb-2">Inkluderede mærker:</div>
            <div className="grid grid-cols-2 gap-2">
              {daekBrands[kategori].brands.map((brand, index) => (
                <div key={index} className="bg-white p-2 rounded border text-center">
                  {brand}
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-xs text-gray-500">
              Bemærk: Det præcise dækbrand kan variere afhængigt af tilgængelighed og sæson.
            </div>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (onChange) {
      const dataForParent = {
        valgteTyper,
        kategoriSommer,
        kategoriVinter,
        kategoriHelaar,
        // Flag for forskellige størrelser
        forskelligeStoerrelserForBagSommer,
        forskelligeStoerrelserForBagVinter,
        forskelligeStoerrelserForBagHelaar,
        // Dækstørrelser for for- og bagaksel
        sommerDaekStoerrelseFor,
        sommerDaekStoerrelserBag,
        vinterDaekStoerrelseFor,
        vinterDaekStoerrelserBag,
        helaarDaekStoerrelseFor,
        helaarDaekStoerrelserBag,
        // Mønsterdybde
        sommerDaekMoensterdybde,
        vinterDaekMoensterdybde,
        helaarDaekMoensterdybde,
        // Nye dæk markering
        sommerDaekErNye,
        vinterDaekErNye,
        helaarDaekErNye,
        // Ekstra fælge
        ekstraFaelgePris
      };
      onChange(dataForParent);
    }
  }, [
    valgteTyper,
    kategoriSommer, kategoriVinter, kategoriHelaar,
    forskelligeStoerrelserForBagSommer, forskelligeStoerrelserForBagVinter, forskelligeStoerrelserForBagHelaar,
    sommerDaekStoerrelseFor, sommerDaekStoerrelserBag,
    vinterDaekStoerrelseFor, vinterDaekStoerrelserBag,
    helaarDaekStoerrelseFor, helaarDaekStoerrelserBag,
    sommerDaekMoensterdybde, vinterDaekMoensterdybde, helaarDaekMoensterdybde,
    sommerDaekErNye, vinterDaekErNye, helaarDaekErNye,
    ekstraFaelgePris,
    onChange
  ]);

  return (
    <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Dækaftale</h3>
      
      {/* Dæk type vælger */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Vælg dæksæson(er):</div>
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 rounded-lg font-medium flex items-center ${
              valgteTyper.sommer
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-400' 
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => {
              handleDaekTypeValg('sommer');
            }}
            title='Vælg sommerdæk'
          >
            <FaSun className="mr-2" />
            Sommerdæk
            {valgteTyper.sommer && <FaCheck className="ml-2" />}
          </button>
          
          <button
            className={`px-4 py-2 rounded-lg font-medium flex items-center ${
              valgteTyper.vinter
                ? 'bg-blue-100 text-blue-800 border border-blue-400' 
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => {
              handleDaekTypeValg('vinter');
            }}
            title='Vælg vinterdæk'
          >
            <FaSnowflake className="mr-2" />
            Vinterdæk
            {valgteTyper.vinter && <FaCheck className="ml-2" />}
          </button>
          
          <button
            className={`px-4 py-2 rounded-lg font-medium flex items-center ${
              valgteTyper.helaar
                ? 'bg-green-100 text-green-800 border border-green-400' 
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => {
              handleDaekTypeValg('helaar');
            }}
            title='Vælg helårsdæk'
          >
            <FaCalendarDay className="mr-2" />
            Helårsdæk
            {valgteTyper.helaar && <FaCheck className="ml-2" />}
          </button>
        </div>
        
        <div className="text-xs text-gray-500 mt-1">
          {valgteTyper.helaar ? 
            'Helårsdæk er valgt. Vælg sommer- eller vinterdæk hvis du vil deaktivere helårsdæk.' : 
            'Du kan vælge både sommer- og vinterdæk samtidigt, eller vælge helårsdæk.'}
        </div>
      </div>
      
      {/* Viser valgte dæktyper under hinanden */}
      {valgteTyper.sommer && renderDaekSaesonSektion('sommer')}
      {valgteTyper.vinter && renderDaekSaesonSektion('vinter')}
      {valgteTyper.helaar && renderDaekSaesonSektion('helaar')}
      
      {/* Ekstra fælge sektion - vises altid hvis der er valgt mindst én dæktype */}
      {(valgteTyper.sommer || valgteTyper.vinter || valgteTyper.helaar) && renderEkstraFaelgeSektion()}
      
      {/* Render popup when showBrands is true */}
      {renderDaekBrandsPopup()}
    </div>
  );
};
export default DaekAftale;
