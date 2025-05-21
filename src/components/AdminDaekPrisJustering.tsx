import React, { useState, useEffect } from 'react';
import { FaUndoAlt, FaSave, FaInfoCircle } from 'react-icons/fa';
import { DaekPrisJusteringService, PrisJusteringsIndeks, defaultPrisJusteringsIndeks } from '../services/DaekPrisJusteringService';

const AdminDaekPrisJustering: React.FC = () => {
  const [indeks, setIndeks] = useState<PrisJusteringsIndeks>(defaultPrisJusteringsIndeks);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Initialiser indeks fra service når komponenten indlæses
  useEffect(() => {
    DaekPrisJusteringService.initialiserFraLocalStorage();
    setIndeks(DaekPrisJusteringService.hentIndeks());
  }, []);
  
  // Håndter ændring af et simpelt tal-input
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, path: string[]) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) return;
    
    const newIndeks = {...indeks};
    let current: any = newIndeks;
    
    // Navigér til den rette sti i objektet
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    // Opdater værdien
    current[path[path.length - 1]] = value;
    setIndeks(newIndeks);
  };
  
  // Gem indeks-ændringer
  const handleSave = () => {
    DaekPrisJusteringService.opdaterIndeks(indeks);
    setSuccessMessage('Prisjusteringsindekset er gemt!');
    
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };
  
  // Nulstil indeks til standardværdier
  const handleReset = () => {
    if (window.confirm('Er du sikker på, at du vil nulstille alle faktorer til standardværdier?')) {
      DaekPrisJusteringService.nulstilIndeks();
      setIndeks(DaekPrisJusteringService.hentIndeks());
      setSuccessMessage('Prisjusteringsindekset er nulstillet til standardværdier.');
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Prisjustering for dækaftaler</h2>
        
        <div className="flex space-x-2">
          <button
            onClick={handleReset}
            className="flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md"
            title="Nulstil til standardværdier"
          >
            <FaUndoAlt className="mr-2" /> Nulstil
          </button>
          
          <button
            onClick={handleSave}
            className="flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            <FaSave className="mr-2" /> Gem
          </button>
          
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            <FaInfoCircle className="mr-2" /> Info
          </button>
        </div>
      </div>
      
      {successMessage && (
        <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}
      
      {showInfo && (
        <div className="p-4 bg-blue-50 rounded-md border border-blue-200 text-blue-800">
          <h3 className="font-medium mb-2">Om prisjusteringsfaktorer</h3>
          <p className="mb-2">
            Disse faktorer bruges til at justere prisen på dækaftaler baseret på forskellige parametre som dækholdbarhed,
            dækdimensioner, sæson og kvalitet. Justeringerne påvirker den endelige pris for kunderne.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>
              <strong>Slidjusteringsfaktor:</strong> Hvor meget slidfaktoren (fra holdbarhedsberegningen) påvirker prisen. 
              Højere værdi betyder større prisvariation baseret på forventede slid.
            </li>
            <li>
              <strong>Dimensionsjusteringsfaktorer:</strong> Hvor meget prisen øges for dæk med større dimensioner end standarddæk.
            </li>
            <li>
              <strong>Sæson- og kvalitetsfaktorer:</strong> Relative prisfaktorer for forskellige sæsoner og kvalitetskategorier.
            </li>
          </ul>
        </div>
      )}
      
      <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-medium">Grundlæggende justeringsfaktorer</h3>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slidjusteringsfaktor (0-2)
              </label>
              <input
                type="number"
                value={indeks.slidJusteringFaktor}
                onChange={(e) => handleNumberChange(e, ['slidJusteringFaktor'])}
                step="0.1"
                min="0"
                max="2"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Hvor meget slidfaktoren påvirker prisen. Standard: 1.0
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h3 className="font-medium">Dimensionsjusteringsfaktorer</h3>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Breddejusteringsfaktor
              </label>
              <input
                type="number"
                value={indeks.breddeJusteringFaktor}
                onChange={(e) => handleNumberChange(e, ['breddeJusteringFaktor'])}
                step="0.01"
                min="0"
                max="0.5"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Prisstigning pr. 10mm over 195mm bredde
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profiljusteringsfaktor
              </label>
              <input
                type="number"
                value={indeks.profilJusteringFaktor}
                onChange={(e) => handleNumberChange(e, ['profilJusteringFaktor'])}
                step="0.01"
                min="0"
                max="0.5"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Prisstigning pr. 5% under 65% profil
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diameterjusteringsfaktor
              </label>
              <input
                type="number"
                value={indeks.diameterJusteringFaktor}
                onChange={(e) => handleNumberChange(e, ['diameterJusteringFaktor'])}
                step="0.01"
                min="0"
                max="0.5"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Prisstigning pr. tomme over 15" diameter
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h3 className="font-medium">Sæsonjusteringsfaktorer</h3>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sommerdæk (basis)
              </label>
              <input
                type="number"
                value={indeks.saesonFaktorer.sommer}
                onChange={(e) => handleNumberChange(e, ['saesonFaktorer', 'sommer'])}
                step="0.05"
                min="0.5"
                max="2"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vinterdæk
              </label>
              <input
                type="number"
                value={indeks.saesonFaktorer.vinter}
                onChange={(e) => handleNumberChange(e, ['saesonFaktorer', 'vinter'])}
                step="0.05"
                min="0.5"
                max="2"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Helårsdæk
              </label>
              <input
                type="number"
                value={indeks.saesonFaktorer.helaar}
                onChange={(e) => handleNumberChange(e, ['saesonFaktorer', 'helaar'])}
                step="0.05"
                min="0.5"
                max="2"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h3 className="font-medium">Kvalitetsjusteringsfaktorer</h3>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget
              </label>
              <input
                type="number"
                value={indeks.kvalitetFaktorer.budget}
                onChange={(e) => handleNumberChange(e, ['kvalitetFaktorer', 'budget'])}
                step="0.05"
                min="0.5"
                max="2"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Economy (basis)
              </label>
              <input
                type="number"
                value={indeks.kvalitetFaktorer.economy}
                onChange={(e) => handleNumberChange(e, ['kvalitetFaktorer', 'economy'])}
                step="0.05"
                min="0.5"
                max="2"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Premium
              </label>
              <input
                type="number"
                value={indeks.kvalitetFaktorer.premium}
                onChange={(e) => handleNumberChange(e, ['kvalitetFaktorer', 'premium'])}
                step="0.05"
                min="0.5"
                max="2"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Vejledning:</h3>
        <p className="text-sm text-gray-600">
          På denne side kan du konfigurere, hvordan prisen på dækaftaler justeres baseret på forskellige faktorer som dækholdbarhed,
          dækdimensioner, sæson og kvalitet. Justeringerne påvirker den endelige pris på dækaftaler, der tilbydes til kunderne.
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Du kan med fordel øge prisen for større dæk, dæk med lavere profil, dæk med større diameter, 
          og for dæk der forventes at have højere slidfaktor. Dette vil afspejle de faktiske omkostninger bedre.
        </p>
      </div>
    </div>
  );
};

export default AdminDaekPrisJustering;
