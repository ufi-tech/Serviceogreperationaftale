import React, { useState, useEffect } from 'react';
import { FaCarCrash, FaInfoCircle, FaCheck, FaChevronDown, FaLink, FaStar } from 'react-icons/fa';

// Mock-data for vejhjælpsudbydere og pakker
const MOCK_VEJHJAELPS_UDBYDERE = [
  {
    id: 'falck',
    name: 'Falck Vejhjælp',
    active: true, // Angiver om udbyderen er aktiv/synlig i systemet
    preferred: true, // Angiver om udbyderen er foretrukken
    pakker: [
      {
        id: 'falck-basic',
        name: 'Falck Basic',
        price: 19,
        coverage: ['Danmark', 'Starthjælp', 'Hjulskifte', 'Bugsering (kort distance)'],
        info: 'https://example.com/falck-basic-info',
        active: true // Angiver om pakken er aktiv/synlig i systemet
      },
      {
        id: 'falck-plus',
        name: 'Falck Plus',
        price: 25,
        coverage: ['Danmark', 'Starthjælp', 'Hjulskifte', 'Bugsering', 'Reservebil (1 dag)'],
        info: 'https://example.com/falck-plus-info',
        active: true
      },
      {
        id: 'falck-europa',
        name: 'Falck Europa',
        price: 35,
        coverage: ['Europa', 'Starthjælp', 'Hjulskifte', 'Bugsering', 'Hotelovernatning', 'Hjemtransport'],
        info: 'https://example.com/falck-europa-info',
        active: true
      }
    ]
  },
  {
    id: 'sos',
    name: 'SOS International',
    active: true,
    preferred: false,
    pakker: [
      {
        id: 'sos-standard',
        name: 'SOS Standard',
        price: 22,
        coverage: ['Danmark', 'Sverige', 'Norge', 'Starthjælp', 'Hjulskifte', 'Bugsering'],
        info: 'https://example.com/sos-standard-info',
        active: true
      },
      {
        id: 'sos-premium',
        name: 'SOS Premium',
        price: 29,
        coverage: ['Europa', 'Starthjælp', 'Hjulskifte', 'Bugsering', 'Hotelovernatning', 'Hjemtransport', 'Lejebil'],
        info: 'https://example.com/sos-premium-info',
        active: true
      }
    ]
  },
  {
    id: 'dansk-autohjælp',
    name: 'Dansk Autohjælp',
    active: true,
    preferred: false,
    pakker: [
      {
        id: 'dah-basis',
        name: 'Basis Vejhjælp',
        price: 18,
        coverage: ['Danmark', 'Starthjælp', 'Hjulskifte', 'Bugsering (kort distance)'],
        info: 'https://example.com/dah-basis-info',
        active: true
      },
      {
        id: 'dah-komplet',
        name: 'Komplet Vejhjælp',
        price: 24,
        coverage: ['Danmark', 'Starthjælp', 'Hjulskifte', 'Bugsering', 'Nødreparation'],
        info: 'https://example.com/dah-komplet-info',
        active: true
      },
      {
        id: 'dah-europa',
        name: 'Europa Vejhjælp',
        price: 32,
        coverage: ['Europa', 'Starthjælp', 'Hjulskifte', 'Bugsering', 'Hotelovernatning', 'Hjemtransport'],
        info: 'https://example.com/dah-europa-info',
        active: true
      }
    ]
  }
];

interface VejhjaelpPakke {
  id: string;
  name: string;
  price: number;
  coverage: string[];
  info: string;
  active: boolean; // Angiver om pakken er aktiv/synlig i systemet
}

interface VejhjaelpUdbyder {
  id: string;
  name: string;
  active: boolean; // Angiver om udbyderen er aktiv/synlig i systemet
  preferred: boolean; // Angiver om udbyderen er foretrukken
  pakker: VejhjaelpPakke[];
}

interface VejhjaelpValgProps {
  onChange?: (values: any) => void;
  visKunForetrukneUdbydere?: boolean; // Prop til at styre om kun foretrukne udbydere skal vises
  initialUdbyder?: string; // Mulighed for at angive en forudvalgt udbyder
  initialPakke?: string; // Mulighed for at angive en forudvalgt pakke
}

const VejhjaelpValg: React.FC<VejhjaelpValgProps> = ({ 
  onChange, 
  visKunForetrukneUdbydere = false,
  initialUdbyder = '',
  initialPakke = ''
}) => {
  // Grundlæggende tilstand
  const [vejhjaelpValgt, setVejhjaelpValgt] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  
  // Udbyder og pakke valg
  const [selectedUdbyder, setSelectedUdbyder] = useState<string>(initialUdbyder);
  const [selectedPakke, setSelectedPakke] = useState<string>(initialPakke);
  
  // Data tilstand
  const [alleUdbydere] = useState<VejhjaelpUdbyder[]>(MOCK_VEJHJAELPS_UDBYDERE);
  const [visibleUdbydere, setVisibleUdbydere] = useState<VejhjaelpUdbyder[]>([]);
  const [pakker, setPakker] = useState<VejhjaelpPakke[]>([]);
  const [valgtPakke, setValgtPakke] = useState<VejhjaelpPakke | null>(null);
  
  // Filtreringstilstand
  const [visKunForetrukne, setVisKunForetrukne] = useState<boolean>(visKunForetrukneUdbydere);
  
  // Opdater visibleUdbydere når filtrering ændres
  useEffect(() => {
    console.log('Opdaterer udbydere baseret på filtrering:', { visKunForetrukne });
    
    // Filtrer udbydere baseret på active og preferred status
    let filteredUdbydere = alleUdbydere.filter(udbyder => udbyder.active);
    
    // Hvis vi kun skal vise foretrukne udbydere, filtrer yderligere
    if (visKunForetrukne) {
      filteredUdbydere = filteredUdbydere.filter(udbyder => udbyder.preferred);
    }
    
    console.log('Filtrerede udbydere:', filteredUdbydere.length);
    setVisibleUdbydere(filteredUdbydere);
    
    // Hvis den valgte udbyder ikke længere er synlig, nulstil valget
    if (selectedUdbyder && !filteredUdbydere.some(u => u.id === selectedUdbyder)) {
      console.log('Nulstiller valgt udbyder, da den ikke længere er synlig');
      setSelectedUdbyder('');
      setSelectedPakke('');
      setValgtPakke(null);
    }
  }, [alleUdbydere, visKunForetrukne, selectedUdbyder]);
  
  // Når brugeren vælger en udbyder, opdater listen af pakker
  useEffect(() => {
    console.log('Udbyder ændret til:', selectedUdbyder);
    
    if (selectedUdbyder) {
      const valgtUdbyder = alleUdbydere.find(u => u.id === selectedUdbyder);
      if (valgtUdbyder) {
        // Filtrer pakker baseret på active status
        const aktivePakker = valgtUdbyder.pakker.filter(pakke => pakke.active);
        console.log('Aktive pakker for valgt udbyder:', aktivePakker.length);
        setPakker(aktivePakker);
        
        // Hvis der ikke er valgt en pakke endnu, vælg den første
        if (!selectedPakke && aktivePakker.length > 0) {
          console.log('Vælger første pakke automatisk:', aktivePakker[0].id);
          setSelectedPakke(aktivePakker[0].id);
        }
      }
    } else {
      console.log('Ingen udbyder valgt, nulstiller pakker');
      setPakker([]);
      setSelectedPakke('');
      setValgtPakke(null);
    }
  }, [selectedUdbyder, alleUdbydere]);
  
  // Når brugeren vælger en pakke, opdater valgtPakke
  useEffect(() => {
    console.log('Pakke ændret til:', selectedPakke);
    
    if (selectedPakke && pakker.length > 0) {
      const pakke = pakker.find(p => p.id === selectedPakke);
      if (pakke) {
        console.log('Fandt valgt pakke:', pakke.name);
        setValgtPakke(pakke);
      } else {
        // Hvis den valgte pakke ikke findes i den aktuelle liste, nulstil valget
        console.log('Valgt pakke findes ikke i listen, nulstiller');
        setSelectedPakke('');
        setValgtPakke(null);
      }
    } else if (!selectedPakke) {
      console.log('Ingen pakke valgt, nulstiller valgtPakke');
      setValgtPakke(null);
    }
  }, [selectedPakke, pakker]);
  
  // Når vejhjaelpValgt eller valgtPakke ændres, send data til parent
  useEffect(() => {
    onChange?.({ 
      vejhjaelpValgt, 
      udbyder: selectedUdbyder, 
      pakke: selectedPakke,
      pris: valgtPakke?.price || 0
    });
  }, [vejhjaelpValgt, selectedUdbyder, selectedPakke, valgtPakke, onChange]);
  
  const handleVejhjaelpValg = () => {
    const nyVaerdi = !vejhjaelpValgt;
    setVejhjaelpValgt(nyVaerdi);
    
    // Hvis vejhjælp slås til og der ikke er valgt en udbyder, vælg den første
    if (nyVaerdi && !selectedUdbyder && visibleUdbydere.length > 0) {
      const firstUdbyder = visibleUdbydere[0];
      setSelectedUdbyder(firstUdbyder.id);
      
      // Vælg den første aktive pakke
      const aktivePakker = firstUdbyder.pakker.filter(pakke => pakke.active);
      if (aktivePakker.length > 0) {
        setSelectedPakke(aktivePakker[0].id);
        setValgtPakke(aktivePakker[0]);
      }
    }
  };
  
  // Håndter toggling af visning af kun foretrukne udbydere
  const handleToggleForetrukne = () => {
    console.log('Toggler visning af kun foretrukne udbydere');
    setVisKunForetrukne(prevState => !prevState);
  };
  
  const handleUdbyderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nyUdbyder = e.target.value;
    console.log('Bruger valgte udbyder:', nyUdbyder);
    setSelectedUdbyder(nyUdbyder);
    // Nulstil pakkevalg når udbyder ændres
    setSelectedPakke('');
  };
  
  const handlePakkeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nyPakke = e.target.value;
    console.log('Bruger valgte pakke:', nyPakke);
    setSelectedPakke(nyPakke);
  };
  
  return (
    <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Vejhjælp</h3>
        <div 
          className="text-sm text-gray-500 flex items-center cursor-pointer hover:text-gray-700"
          onClick={() => setShowInfo(true)}
        >
          <FaInfoCircle className="mr-1" /> Se detaljer
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <button
          className={`flex-1 p-4 rounded-lg border flex items-center ${
            vejhjaelpValgt 
              ? 'bg-green-50 border-green-400 ring-2 ring-green-500' 
              : 'bg-white border-gray-300 hover:bg-gray-50'
          }`}
          onClick={handleVejhjaelpValg}
        >
          <div className={`p-3 rounded-full ${vejhjaelpValgt ? 'bg-green-100' : 'bg-gray-100'}`}>
            <FaCarCrash className={`${vejhjaelpValgt ? 'text-green-600' : 'text-gray-600'}`} size={20} />
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <h4 className={`text-lg font-medium ${vejhjaelpValgt ? 'text-green-700' : 'text-gray-700'}`}>
                Tilføj vejhjælp
              </h4>
              {vejhjaelpValgt && <FaCheck className="text-green-500" />}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Døgnbemandet vejhjælp i hele Europa
            </p>
          </div>
        </button>
        
        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 md:max-w-xs">
          <div className="font-medium text-amber-800 mb-1">Anbefalet</div>
          <p className="text-sm text-gray-600">
            Vi anbefaler altid at tilføje vejhjælp for ekstra tryghed på vejen. Prisen starter fra 18 kr/md.
          </p>
        </div>
      </div>
      
      {/* Vejhjælp detaljer og valgmuligheder - vises kun når vejhjælp er valgt */}
      {vejhjaelpValgt && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          {/* Filter muligheder */}
          <div className="mb-4 flex items-center justify-end">
            <div className="flex items-center">
              <input
                id="kun-foretrukne"
                type="checkbox"
                checked={visKunForetrukne}
                onChange={handleToggleForetrukne}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label htmlFor="kun-foretrukne" className="ml-2 text-sm text-gray-600 flex items-center cursor-pointer">
                <FaStar className="text-amber-500 mr-1" size={14} /> Vis kun anbefalede udbydere
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Udbyder vælger */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vælg udbyder
              </label>
              <div className="relative">
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={selectedUdbyder}
                  onChange={handleUdbyderChange}
                  disabled={visibleUdbydere.length === 0}
                >
                  <option value="">Vælg vejhjælpsudbyder</option>
                  {visibleUdbydere.map(udbyder => (
                    <option key={udbyder.id} value={udbyder.id}>
                      {udbyder.name} {udbyder.preferred ? '★' : ''}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <FaChevronDown size={14} />
                </div>
              </div>
              {visibleUdbydere.length === 0 && (
                <p className="text-sm text-red-500 mt-1">Ingen udbydere tilgængelige. Prøv at deaktivere filteret.</p>
              )}
            </div>

            {/* Pakke vælger - vises kun når en udbyder er valgt */}
            {selectedUdbyder && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vælg pakke
                </label>
                <div className="relative">
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={selectedPakke}
                    onChange={handlePakkeChange}
                    disabled={pakker.length === 0}
                  >
                    <option value="">Vælg pakke</option>
                    {pakker.map(pakke => (
                      <option key={pakke.id} value={pakke.id}>
                        {pakke.name} - {pakke.price} kr/md
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <FaChevronDown size={14} />
                  </div>
                </div>
                {pakker.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">Ingen pakker tilgængelige for denne udbyder.</p>
                )}
              </div>
            )}
          </div>
          
          {/* Pakke detaljer - vises kun når en pakke er valgt */}
          {valgtPakke && (
            <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-blue-800">{valgtPakke.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">Dækning: {valgtPakke.coverage.join(', ')}</p>
                  <p className="text-sm font-medium text-blue-600 mt-2">{valgtPakke.price} kr/md</p>
                </div>
                <a 
                  href={valgtPakke.info} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                >
                  <FaLink className="mr-1" /> 
                  Vis betingelser
                </a>
              </div>
              
              {/* Sammenligning med andre pakker */}
              <div className="mt-3 pt-3 border-t border-blue-200">
                <h5 className="text-sm font-medium text-blue-700 mb-2">Sammenlign med andre pakker</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {pakker
                    .filter(p => p.id !== valgtPakke.id)
                    .slice(0, 2)
                    .map(p => (
                      <div key={p.id} className="text-xs bg-white p-2 rounded border border-blue-100">
                        <div className="font-medium">{p.name} - {p.price} kr/md</div>
                        <div className="text-gray-500 mt-1 truncate">{p.coverage.join(', ')}</div>
                        <button 
                          onClick={() => setSelectedPakke(p.id)}
                          className="text-blue-600 hover:text-blue-800 text-xs mt-1"
                        >
                          Vælg denne pakke
                        </button>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Info popup */}
      {showInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" onClick={() => setShowInfo(false)}>
          <div className="w-full max-w-md rounded-lg shadow-lg bg-white border p-0 m-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-green-100 px-4 py-3 rounded-t-lg flex items-center justify-between">
              <h3 className="text-lg font-medium text-green-800 flex items-center">
                <FaCarCrash className="mr-2" /> Vejhjælp - detaljer
              </h3>
              <button 
                onClick={() => setShowInfo(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4">
              <h4 className="font-medium text-gray-800 mb-2">Omfattende dækning i hele Europa</h4>
              <p className="text-gray-600 mb-3">
                Med vores vejhjælp får du døgnbemandet assistance, uanset hvor i Europa du befinder dig.
                Servicen dækker en bred vifte af situationer, der kan opstå på vejen.
              </p>
              
              <div className="mb-3">
                <h5 className="font-medium text-gray-700 mb-1">Vores vejhjælp inkluderer:</h5>
                <ul className="text-sm text-gray-600 list-disc list-inside">
                  <li>Starthjælp ved fladt batteri</li>
                  <li>Hjulskifte ved punktering</li>
                  <li>Bugsering til nærmeste værksted</li>
                  <li>Døgnbemandet telefonisk assistance</li>
                  <li>Hjælp ved uheld i udlandet</li>
                  <li>Hjemtransport af bilen ved større nedbrud</li>
                  <li>Hotelovernatning ved langvarige reparationer</li>
                </ul>
              </div>
              
              <div className="mb-3">
                <h5 className="font-medium text-gray-700 mb-1">Pris:</h5>
                <p className="text-sm text-gray-600">
                  Fra 18 kr. pr. måned, afhængigt af den valgte udbyder og pakke.
                  Opkræves sammen med din serviceaftale.
                </p>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                Bemærk: Selvforskyldte hændelser som f.eks. at løbe tør for brændstof kan medføre ekstra omkostninger.
                Se de komplette vilkår for detaljeret information om dækningsomfang og begrænsninger.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VejhjaelpValg;
