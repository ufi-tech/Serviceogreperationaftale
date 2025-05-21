import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaTruckMonster, FaClock, FaRoad, FaCoins, FaPencilAlt, FaSave, FaTimes } from 'react-icons/fa';

// Initial configuration for service agreements
const initialHkKategorier = [
  { id: 1, minHK: 0, maxHK: 100, name: "Lille", basePris: 199 },
  { id: 2, minHK: 101, maxHK: 150, name: "Mellem", basePris: 249 },
  { id: 3, minHK: 151, maxHK: 200, name: "Stor", basePris: 299 },
  { id: 4, minHK: 201, maxHK: 300, name: "Premium", basePris: 349 },
  { id: 5, minHK: 301, maxHK: 500, name: "Luksus", basePris: 399 },
];

const initialMaxValues = {
  maxAlderVedIndtegning: 7, // 7 år
  maxKmVedIndtegning: 150000, // 150.000 km
};

const initialRabatStruktur = {
  fabriksgaranti: {
    "2 år": 10, // 10% rabat ved 2 års fabriksgaranti
    "3 år": 15, // 15% rabat ved 3 års fabriksgaranti 
    "4 år": 20, // 20% rabat ved 4 års fabriksgaranti
    "5+ år": 25, // 25% rabat ved 5+ års fabriksgaranti
  }
};

const initialVarebilTillaeg = 15; // 15% tillæg for varebiler

const initialPriserPerKm = {
  "15000": 1.0,   // Basispris ved 15.000 km/år
  "20000": 1.15,  // 15% tillæg ved 20.000 km/år
  "25000": 1.25,  // 25% tillæg ved 25.000 km/år
  "30000": 1.35,  // 35% tillæg ved 30.000 km/år
  "35000": 1.45,  // 45% tillæg ved 35.000 km/år
  "40000": 1.55,  // 55% tillæg ved 40.000 km/år
  "45000": 1.65,  // 65% tillæg ved 45.000 km/år
  "50000": 1.75,  // 75% tillæg ved 50.000 km/år
  "55000": 1.85,  // 85% tillæg ved 55.000 km/år
  "60000": 2.0,   // 100% tillæg ved 60.000 km/år
};

const initialPriserPerLoebetid = {
  "12": 1.0,   // Basispris ved 12 måneder løbetid
  "24": 0.95,  // 5% rabat ved 24 måneder løbetid
  "36": 0.90,  // 10% rabat ved 36 måneder løbetid
  "48": 0.85,  // 15% rabat ved 48 måneder løbetid
  "60": 0.80,  // 20% rabat ved 60 måneder løbetid
};

const AdminServiceAftale: React.FC = () => {
  // Hent gemte kategorier fra localStorage eller brug standardværdier
  const getSavedHkKategorier = () => {
    const savedData = localStorage.getItem('hkKategorier');
    return savedData ? JSON.parse(savedData) : initialHkKategorier;
  };

  const [hkKategorier, setHkKategorier] = useState(getSavedHkKategorier);
  const [maxValues, setMaxValues] = useState(initialMaxValues);
  const [varebilTillaeg, setVarebilTillaeg] = useState(initialVarebilTillaeg);
  const [rabatStruktur, setRabatStruktur] = useState(initialRabatStruktur);
  const [priserPerKm, setPriserPerKm] = useState(initialPriserPerKm);
  const [priserPerLoebetid, setPriserPerLoebetid] = useState(initialPriserPerLoebetid);
  
  // Redigeringstilstand
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<{
    id: number;
    minHK: number;
    maxHK: number;
    name: string;
    basePris: number;
  } | null>(null);
  
  // Gem HK-kategorier i localStorage når de ændres
  useEffect(() => {
    localStorage.setItem('hkKategorier', JSON.stringify(hkKategorier));
  }, [hkKategorier]);
  
  const [activeTab, setActiveTab] = useState<'kategorier' | 'indstillinger' | 'priser'>('kategorier');
  
  // Ny HK kategori
  const [newHkCategory, setNewHkCategory] = useState({
    minHK: 0,
    maxHK: 0,
    name: '',
    basePris: 0
  });
  
  const handleAddHkCategory = () => {
    if (!newHkCategory.name || newHkCategory.minHK < 0 || newHkCategory.maxHK <= newHkCategory.minHK || newHkCategory.basePris <= 0) {
      return; // Validering fejlet
    }
    
    const newId = hkKategorier.length > 0 ? Math.max(...hkKategorier.map((k: {id: number}) => k.id)) + 1 : 1;
    
    setHkKategorier([...hkKategorier, {
      id: newId,
      minHK: newHkCategory.minHK,
      maxHK: newHkCategory.maxHK,
      name: newHkCategory.name,
      basePris: newHkCategory.basePris
    }]);
    
    // Nulstil input felter
    setNewHkCategory({
      minHK: 0,
      maxHK: 0,
      name: '',
      basePris: 0
    });
  };
  
  const handleRemoveHkCategory = (id: number) => {
    // Afslut redigering hvis den kategori, der slettes, er ved at blive redigeret
    if (editingCategoryId === id) {
      setEditingCategoryId(null);
      setEditingCategory(null);
    }
    setHkKategorier(hkKategorier.filter((category: {id: number}) => category.id !== id));
  };
  
  // Start redigering af en kategori
  const startEditing = (category: {id: number; minHK: number; maxHK: number; name: string; basePris: number}) => {
    setEditingCategoryId(category.id);
    setEditingCategory({ ...category });
  };
  
  // Afbryd redigering
  const cancelEditing = () => {
    setEditingCategoryId(null);
    setEditingCategory(null);
  };
  
  // Gem ændringer til en kategori
  const saveEditing = () => {
    if (!editingCategory) return;

    // Find den kategori, der redigeres
    const updatedCategories = hkKategorier.map((cat: {id: number; minHK: number; maxHK: number; name: string; basePris: number}) => {
      if (cat.id === editingCategory.id) {
        return { ...editingCategory };
      }
      return cat;
    });

    // Sorter kategorier efter min HK for at finde den næste kategori
    const sortedCategories = [...updatedCategories].sort((a, b) => a.minHK - b.minHK);
    
    // Find indeks for den redigerede kategori i den sorterede liste
    const editedIndex = sortedCategories.findIndex((cat: {id: number}) => cat.id === editingCategory.id);
    
    // Hvis der er en næste kategori, opdater dens minHK værdi
    if (editedIndex < sortedCategories.length - 1) {
      const nextCategory = sortedCategories[editedIndex + 1];
      // Opdater kun hvis nuværende maxHK er højere end næste minHK
      if (editingCategory.maxHK >= nextCategory.minHK - 1) {
        const nextIndex = updatedCategories.findIndex((cat: {id: number}) => cat.id === nextCategory.id);
        if (nextIndex !== -1) {
          updatedCategories[nextIndex] = {
            ...updatedCategories[nextIndex],
            minHK: editingCategory.maxHK + 1
          };
        }
      }
    }

    setHkKategorier(updatedCategories);
    setEditingCategoryId(null);
    setEditingCategory(null);
  };

  // Håndter ændringer til redigeringsformular
  const handleEditChange = (field: string, value: any) => {
    if (!editingCategory) return;
    
    const updatedValue = field === 'name' ? value : parseInt(value) || 0;
    setEditingCategory({
      ...editingCategory,
      [field]: updatedValue
    });
  };

  const handleMaxValuesChange = (field: keyof typeof maxValues, value: number) => {
    setMaxValues({
      ...maxValues,
      [field]: value
    });
  };

  const handleVarebilTillaegChange = (value: number) => {
    setVarebilTillaeg(value);
  };

  const handleRabatStrukturChange = (type: keyof typeof rabatStruktur.fabriksgaranti, value: number) => {
    setRabatStruktur({
      ...rabatStruktur,
      fabriksgaranti: {
        ...rabatStruktur.fabriksgaranti,
        [type]: value
      }
    });
  };

  const handlePriserPerKmChange = (km: keyof typeof priserPerKm, value: number) => {
    setPriserPerKm({
      ...priserPerKm,
      [km]: value
    });
  };

  const handlePriserPerLoebetidChange = (months: keyof typeof priserPerLoebetid, value: number) => {
    setPriserPerLoebetid({
      ...priserPerLoebetid,
      [months]: value
    });
  };

  const handleSaveSettings = () => {
    // Her ville der normalt være API-kald for at gemme ændringer til backend
    console.log("Gemmer serviceaftale indstillinger:", {
      hkKategorier,
      maxValues,
      varebilTillaeg,
      rabatStruktur,
      priserPerKm,
      priserPerLoebetid
    });
    alert("Indstillinger gemt!");
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm rounded-t-lg mr-2 flex items-center ${
            activeTab === 'kategorier' 
              ? 'bg-white border border-gray-200 border-b-0' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('kategorier')}
        >
          <FaTruckMonster className="mr-2" />
          HK-kategorier
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm rounded-t-lg mr-2 flex items-center ${
            activeTab === 'indstillinger' 
              ? 'bg-white border border-gray-200 border-b-0' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('indstillinger')}
        >
          <FaClock className="mr-2" />
          Indtegningskrav
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm rounded-t-lg mr-2 flex items-center ${
            activeTab === 'priser' 
              ? 'bg-white border border-gray-200 border-b-0' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('priser')}
        >
          <FaCoins className="mr-2" />
          Prisstruktur
        </button>
      </div>
      
      {activeTab === 'kategorier' && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">HK-kategorier</h2>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Tilføj ny HK-kategori</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min HK</label>
                <input 
                  type="number" 
                  value={newHkCategory.minHK} 
                  onChange={e => setNewHkCategory({...newHkCategory, minHK: parseInt(e.target.value) || 0})} 
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max HK</label>
                <input 
                  type="number" 
                  value={newHkCategory.maxHK} 
                  onChange={e => setNewHkCategory({...newHkCategory, maxHK: parseInt(e.target.value) || 0})} 
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori navn</label>
                <input 
                  type="text" 
                  value={newHkCategory.name} 
                  onChange={e => setNewHkCategory({...newHkCategory, name: e.target.value})} 
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Basispris (kr/md)</label>
                <input 
                  type="number" 
                  value={newHkCategory.basePris} 
                  onChange={e => setNewHkCategory({...newHkCategory, basePris: parseInt(e.target.value) || 0})} 
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  min="0"
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={handleAddHkCategory}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md flex items-center"
                disabled={!newHkCategory.name || newHkCategory.minHK < 0 || newHkCategory.maxHK <= newHkCategory.minHK || newHkCategory.basePris <= 0}
              >
                <FaPlus className="mr-1" /> Tilføj kategori
              </button>
            </div>
          </div>
          <div className="mt-6 overflow-x-auto">
            <h3 className="text-md font-medium text-gray-700 mb-3">HK-kategorier</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Navn</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min HK</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max HK</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basispris</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Handling</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hkKategorier
                  .sort((a: {minHK: number}, b: {minHK: number}) => a.minHK - b.minHK)
                  .map((kategori: {id: number; minHK: number; maxHK: number; name: string; basePris: number}) => (
                  <tr key={kategori.id} className={editingCategoryId === kategori.id ? 'bg-blue-50' : ''}>
                    {editingCategoryId === kategori.id && editingCategory ? (
                      <React.Fragment>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <input 
                            type="text" 
                            value={editingCategory.name} 
                            onChange={(e) => handleEditChange('name', e.target.value)}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <input 
                            type="number" 
                            value={editingCategory.minHK} 
                            onChange={(e) => handleEditChange('minHK', e.target.value)}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            min="0"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <input 
                            type="number" 
                            value={editingCategory.maxHK} 
                            onChange={(e) => handleEditChange('maxHK', e.target.value)}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            min="0"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <input 
                            type="number" 
                            value={editingCategory.basePris} 
                            onChange={(e) => handleEditChange('basePris', e.target.value)}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            min="0"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <div className="flex justify-end space-x-2">
                            <button onClick={saveEditing} className="text-green-500 hover:text-green-700" title="Gem ændringer">
                              <FaSave />
                            </button>
                            <button onClick={cancelEditing} className="text-gray-500 hover:text-gray-700" title="Annuller redigering">
                              <FaTimes />
                            </button>
                          </div>
                        </td>
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{kategori.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{kategori.minHK}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{kategori.maxHK}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{kategori.basePris} kr./md</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => startEditing(kategori)} 
                              className="text-blue-500 hover:text-blue-700" 
                              title="Rediger kategori"
                            >
                              <FaPencilAlt />
                            </button>
                            <button 
                              onClick={() => handleRemoveHkCategory(kategori.id)} 
                              className="text-red-500 hover:text-red-700" 
                              title="Fjern kategori"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </React.Fragment>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {activeTab === 'indstillinger' && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Indtegningskrav og Rabatter</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="text-md font-medium text-gray-700 mb-3">Maksimal alder og kilometer</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maksimal alder ved indtegning (år)</label>
                  <input 
                    type="number" 
                    value={maxValues.maxAlderVedIndtegning} 
                    onChange={e => handleMaxValuesChange('maxAlderVedIndtegning', parseInt(e.target.value) || 0)} 
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maksimale kilometer ved indtegning</label>
                  <input 
                    type="number" 
                    value={maxValues.maxKmVedIndtegning} 
                    onChange={e => handleMaxValuesChange('maxKmVedIndtegning', parseInt(e.target.value) || 0)} 
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    min="0"
                    step="1000"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="text-md font-medium text-gray-700 mb-3">Varebilstillæg</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Procentvis tillæg for varebiler (%)</label>
                <input 
                  type="number" 
                  value={varebilTillaeg} 
                  onChange={e => handleVarebilTillaegChange(parseInt(e.target.value) || 0)} 
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="text-md font-medium text-gray-700 mb-3">Fabriksgaranti rabatter</h3>
              
              <div className="space-y-4">
                {Object.entries(rabatStruktur.fabriksgaranti).map(([garantiPeriode, rabatProcent]) => (
                  <div key={garantiPeriode}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fabriksgaranti {garantiPeriode} (% rabat)
                    </label>
                    <input 
                      type="number" 
                      value={rabatProcent} 
                      onChange={e => handleRabatStrukturChange(garantiPeriode as keyof typeof rabatStruktur.fabriksgaranti, parseInt(e.target.value) || 0)} 
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      min="0"
                      max="100"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'priser' && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Prisstruktur</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="text-md font-medium text-gray-700 mb-3">
                <FaRoad className="inline-block mr-1" /> Kilometer priskoefficienter
              </h3>
              <div className="text-xs text-gray-500 mb-4">
                Angiv prisfaktor for forskellige årlige kilometertal (1.0 = basispris).
              </div>
              
              <div className="space-y-4">
                {Object.entries(priserPerKm).map(([km, factor]) => (
                  <div key={km} className="flex items-center space-x-2">
                    <label className="w-24 flex-shrink-0 block text-sm font-medium text-gray-700">
                      {parseInt(km).toLocaleString('da-DK')} km/år:
                    </label>
                    <input 
                      type="number" 
                      value={factor} 
                      onChange={e => handlePriserPerKmChange(km as keyof typeof priserPerKm, parseFloat(e.target.value) || 1.0)} 
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      min="0.1"
                      max="5"
                      step="0.05"
                    />
                    <span className="text-sm text-gray-500">
                      {factor > 1 ? `+${Math.round((factor - 1) * 100)}%` : 
                       factor < 1 ? `-${Math.round((1 - factor) * 100)}%` : 
                       'Basispris'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="text-md font-medium text-gray-700 mb-3">
                <FaClock className="inline-block mr-1" /> Løbetid priskoefficienter
              </h3>
              <div className="text-xs text-gray-500 mb-4">
                Angiv prisfaktor for forskellige løbetider (1.0 = basispris).
              </div>
              
              <div className="space-y-4">
                {Object.entries(priserPerLoebetid).map(([months, factor]) => (
                  <div key={months} className="flex items-center space-x-2">
                    <label className="w-24 flex-shrink-0 block text-sm font-medium text-gray-700">
                      {months} måneder:
                    </label>
                    <input 
                      type="number" 
                      value={factor} 
                      onChange={e => handlePriserPerLoebetidChange(months as keyof typeof priserPerLoebetid, parseFloat(e.target.value) || 1.0)} 
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      min="0.1"
                      max="5"
                      step="0.05"
                    />
                    <span className="text-sm text-gray-500">
                      {factor > 1 ? `+${Math.round((factor - 1) * 100)}%` : 
                       factor < 1 ? `-${Math.round((1 - factor) * 100)}%` : 
                       'Basispris'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSaveSettings}
          className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md"
        >
          Gem indstillinger
        </button>
      </div>
      
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Vejledning:</h3>
        <p className="text-sm text-gray-600">
          På denne side kan du konfigurere serviceaftale indstillinger, herunder HK-kategorier og prisberegning.
          Husk at gemme dine ændringer ved at klikke på "Gem indstillinger" knappen.
        </p>
      </div>
    </div>
  );
};

export default AdminServiceAftale;
