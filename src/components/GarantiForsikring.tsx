import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaInfoCircle, FaBuilding, FaPercent } from 'react-icons/fa';

interface GarantiForsikringProps {
  onGarantiForsikringChange: (data: {
    valgt: boolean;
    udbyder: string;
    pris: number;
    forhandlerBetaler50Procent: boolean;
  }) => void;
  visPrisInklMoms: boolean;
  formatPris: (pris: number) => string;
  aftaleType: string; // For at kontrollere om komponenten overhovedet skal vises
}

// Predefinerede udbydere
const garantiUdbydere = [
  { id: 'fragus', navn: 'Fragus', standardPris: 2500 },
  { id: 'cargarantie', navn: 'Car Garantie', standardPris: 2800 },
  { id: 'nordic', navn: 'Nordic Garantiforsikring', standardPris: 2300 },
  { id: 'gsf', navn: 'GSF Garantiforsikring', standardPris: 2600 },
  { id: 'andet', navn: 'Anden udbyder', standardPris: 0 },
];

const GarantiForsikring: React.FC<GarantiForsikringProps> = ({ 
  onGarantiForsikringChange, 
  visPrisInklMoms,
  formatPris,
  aftaleType
}) => {
  const [visGarantiForsikring, setVisGarantiForsikring] = useState<boolean>(false);
  const [valgtUdbyder, setValgtUdbyder] = useState<string>('fragus');
  const [garantiPris, setGarantiPris] = useState<number>(2500); // Standard pris
  const [forhandlerBetaler50Procent, setForhandlerBetaler50Procent] = useState<boolean>(false);
  const [visPrisInfo, setVisPrisInfo] = useState<boolean>(false);
  
  // Vis kun for serviceaftale (ikke for service- og reparationsaftale)
  const skalVises = aftaleType === 'serviceaftale';

  // Send data til forælderkomponenten ved ændringer
  useEffect(() => {
    onGarantiForsikringChange({
      valgt: visGarantiForsikring && skalVises,
      udbyder: valgtUdbyder,
      pris: garantiPris,
      forhandlerBetaler50Procent
    });
  }, [visGarantiForsikring, valgtUdbyder, garantiPris, forhandlerBetaler50Procent, skalVises, onGarantiForsikringChange]);

  // Håndtér skift af udbyder
  const handleUdbyderSkift = (udbyderID: string) => {
    setValgtUdbyder(udbyderID);
    // Find standardprisen for den valgte udbyder
    const udbyder = garantiUdbydere.find(u => u.id === udbyderID);
    if (udbyder && udbyderID !== 'andet') {
      setGarantiPris(udbyder.standardPris);
    }
    // For "Anden udbyder" beholder vi værdien, hvis den allerede er ændret
  };

  // Beregn den faktiske pris baseret på om forhandleren betaler 50%
  const faktiskPris = forhandlerBetaler50Procent ? garantiPris / 2 : garantiPris;

  // Hvis komponenten ikke skal vises baseret på aftaletypen
  if (!skalVises) {
    return null;
  }

  return (
    <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-amber-100 rounded-full p-2 mr-3">
            <FaShieldAlt className="text-amber-600 text-lg" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-800">Garantiforsikring mod mekanisk svigt</h3>
            <p className="text-sm text-gray-600">Tilføj ekstra sikkerhed for uforudsete mekaniske fejl</p>
          </div>
        </div>
        
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={visGarantiForsikring}
            onChange={() => setVisGarantiForsikring(!visGarantiForsikring)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
        </label>
      </div>
      
      {/* Ekstra indstillinger - vises kun når garantiforsikring er valgt */}
      {visGarantiForsikring && (
        <div className="mt-4 bg-amber-50 p-4 rounded-lg border border-amber-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vælg garantiforsikringsudbyder</label>
              <select
                value={valgtUdbyder}
                onChange={(e) => handleUdbyderSkift(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
              >
                {garantiUdbydere.map(udbyder => (
                  <option key={udbyder.id} value={udbyder.id}>{udbyder.navn}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Årlig præmie</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">kr.</span>
                </div>
                <input
                  type="number"
                  value={garantiPris}
                  onChange={(e) => setGarantiPris(Number(e.target.value))}
                  className="focus:ring-amber-500 focus:border-amber-500 block w-full pl-12 pr-12 sm:text-sm border-gray-300 rounded-md"
                  placeholder="0"
                  min="0"
                  max="100000"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">{visPrisInklMoms ? 'inkl. moms' : 'ekskl. moms'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center">
              <input
                id="forhandlerRabat"
                name="forhandlerRabat"
                type="checkbox"
                checked={forhandlerBetaler50Procent}
                onChange={() => setForhandlerBetaler50Procent(!forhandlerBetaler50Procent)}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label htmlFor="forhandlerRabat" className="ml-2 block text-sm text-gray-700 flex items-center">
                <FaBuilding className="mr-1 text-amber-500" /> Forhandler betaler 50% af præmien
              </label>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between p-3 bg-white rounded-md border border-amber-200">
            <div>
              <button
                type="button"
                onClick={() => setVisPrisInfo(!visPrisInfo)}
                className="text-amber-600 text-sm flex items-center hover:text-amber-700"
              >
                <FaInfoCircle className="mr-1" /> {visPrisInfo ? 'Skjul detaljer' : 'Vis detaljer'}
              </button>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Præmie per år</p>
              <p className="text-xl font-semibold text-gray-900">{formatPris(faktiskPris)}</p>
              {forhandlerBetaler50Procent && (
                <p className="text-xs text-amber-600 flex items-center justify-end">
                  <FaPercent className="mr-1" /> 50% forhandlerrabat anvendt
                </p>
              )}
            </div>
          </div>
          
          {visPrisInfo && (
            <div className="mt-2 text-sm text-gray-600 bg-white p-3 rounded-md border border-gray-200">
              <h4 className="font-medium text-gray-700 mb-2">Garantiforsikring detaljer:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Dækker mekaniske og elektroniske fejl efter udløb af fabriksgarantien</li>
                <li>Gælder i hele aftalens løbetid</li>
                <li>Supplerer din serviceaftale perfekt, især for el- og hybridbiler</li>
                <li>Opkræves årligt sammen med serviceaftale</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GarantiForsikring;
