import React, { useState, useEffect } from 'react';
import { FaSun, FaSnowflake, FaCalendarDay, FaPlus, FaTrash, FaPencilAlt, FaSave, FaTimes, FaEdit } from 'react-icons/fa';
import CSVImportExport from './CSVImportExport';

// Grundlæggende data-struktur for dækstørrelser
interface DaekStoerrelse {
  id: number;
  bredde: number;
  profil: number;
  diameter: number;
  displayName?: string; // Genereret automatisk, f.eks. "205/55R16"
}

// Priser for dækstørrelser baseret på kategori
interface DaekPriser {
  stoerrelseId: number;
  budget: number;
  economy: number;
  premium: number;
}

// Initial data
const initialDaekStoerrelseData: DaekStoerrelse[] = [
  { id: 1, bredde: 195, profil: 65, diameter: 15, displayName: "195/65R15" },
  { id: 2, bredde: 205, profil: 55, diameter: 16, displayName: "205/55R16" },
  { id: 3, bredde: 225, profil: 45, diameter: 17, displayName: "225/45R17" },
  { id: 4, bredde: 235, profil: 40, diameter: 18, displayName: "235/40R18" },
  { id: 5, bredde: 245, profil: 35, diameter: 19, displayName: "245/35R19" },
];

// Initial prisdata
const initialDaekPriser: { [key: string]: DaekPriser[] } = {
  sommer: [
    { stoerrelseId: 1, budget: 450, economy: 650, premium: 950 },
    { stoerrelseId: 2, budget: 550, economy: 750, premium: 1050 },
    { stoerrelseId: 3, budget: 650, economy: 950, premium: 1250 },
    { stoerrelseId: 4, budget: 750, economy: 1050, premium: 1450 },
    { stoerrelseId: 5, budget: 850, economy: 1150, premium: 1650 },
  ],
  vinter: [
    { stoerrelseId: 1, budget: 500, economy: 700, premium: 1000 },
    { stoerrelseId: 2, budget: 600, economy: 800, premium: 1100 },
    { stoerrelseId: 3, budget: 700, economy: 1000, premium: 1300 },
    { stoerrelseId: 4, budget: 800, economy: 1100, premium: 1500 },
    { stoerrelseId: 5, budget: 900, economy: 1200, premium: 1700 },
  ],
  helaar: [
    { stoerrelseId: 1, budget: 550, economy: 750, premium: 1050 },
    { stoerrelseId: 2, budget: 650, economy: 850, premium: 1150 },
    { stoerrelseId: 3, budget: 750, economy: 1050, premium: 1350 },
    { stoerrelseId: 4, budget: 850, economy: 1150, premium: 1550 },
    { stoerrelseId: 5, budget: 950, economy: 1250, premium: 1750 },
  ],
};

const AdminDaekStoerrelserPriser: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sommer' | 'vinter' | 'helaar'>('sommer');
  const [daekStoerrelseData, setDaekStoerrelseData] = useState<DaekStoerrelse[]>(initialDaekStoerrelseData);
  const [daekPriser, setDaekPriser] = useState<{ [key: string]: DaekPriser[] }>(initialDaekPriser);
  
  // State til at holde styr på ny dækstørrelse input
  const [newDaekStoerrelse, setNewDaekStoerrelse] = useState<{
    bredde: string;
    profil: string;
    diameter: string;
  }>({ bredde: '', profil: '', diameter: '' });
  
  // State for redigering af dækstørrelse
  const [editingStoerrelseId, setEditingStoerrelseId] = useState<number | null>(null);
  const [editingStoerrelse, setEditingStoerrelse] = useState<{
    id: number;
    bredde: string;
    profil: string;
    diameter: string;
  } | null>(null);
  
  // State til at spore fejl i input
  const [inputErrors, setInputErrors] = useState<{
    bredde: boolean;
    profil: boolean;
    diameter: boolean;
  }>({ bredde: false, profil: false, diameter: false });
  
  // State til at spore fejl i redigeringsinput
  const [editErrors, setEditErrors] = useState<{
    bredde: boolean;
    profil: boolean;
    diameter: boolean;
  }>({ bredde: false, profil: false, diameter: false });
  
  useEffect(() => {
    // Load saved data from localStorage if available
    const savedDaekStoerrelseData = localStorage.getItem('daekStoerrelseData');
    const savedDaekPriser = localStorage.getItem('daekPriser');
    
    if (savedDaekStoerrelseData) {
      setDaekStoerrelseData(JSON.parse(savedDaekStoerrelseData));
    }
    
    if (savedDaekPriser) {
      setDaekPriser(JSON.parse(savedDaekPriser));
    }
  }, []);
  
  useEffect(() => {
    // Save to localStorage when data changes
    localStorage.setItem('daekStoerrelseData', JSON.stringify(daekStoerrelseData));
    localStorage.setItem('daekPriser', JSON.stringify(daekPriser));
  }, [daekStoerrelseData, daekPriser]);
  
  // Category color scheme
  const categoryColors = {
    sommer: {
      bg: 'bg-yellow-100',
      border: 'border-yellow-300',
      text: 'text-yellow-800',
      icon: <FaSun className="text-yellow-500 mr-2" />
    },
    vinter: {
      bg: 'bg-blue-100',
      border: 'border-blue-300',
      text: 'text-blue-800',
      icon: <FaSnowflake className="text-blue-500 mr-2" />
    },
    helaar: {
      bg: 'bg-green-100',
      border: 'border-green-300',
      text: 'text-green-800',
      icon: <FaCalendarDay className="text-green-500 mr-2" />
    }
  };
  
  // Validér input for dækstørrelser
  const validateDaekInput = (field: string, value: string): boolean => {
    const numValue = parseInt(value);
    
    if (isNaN(numValue)) return false;
    
    // Valideringsregler for de forskellige felter
    switch (field) {
      case 'bredde':
        return numValue >= 135 && numValue <= 395 && numValue % 5 === 0;
      case 'profil':
        return numValue >= 20 && numValue <= 95 && numValue % 5 === 0;
      case 'diameter':
        return numValue >= 14 && numValue <= 23;
      default:
        return false;
    }
  };
  
  // Håndter ændringer til input for ny dækstørrelse
  const handleNewDaekStoerrelseChange = (field: string, value: string) => {
    setNewDaekStoerrelse(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Kun validér hvis der er indtastet en værdi
    if (value.trim() !== '') {
      const isValid = validateDaekInput(field, value);
      setInputErrors(prev => ({
        ...prev,
        [field]: !isValid
      }));
    } else {
      setInputErrors(prev => ({
        ...prev,
        [field]: false
      }));
    }
  };
  
  // Tilføj ny dækstørrelse
  const handleAddDaekStoerrelse = () => {
    // Validér input
    const bredde = parseInt(newDaekStoerrelse.bredde);
    const profil = parseInt(newDaekStoerrelse.profil);
    const diameter = parseInt(newDaekStoerrelse.diameter);
    
    if (isNaN(bredde) || isNaN(profil) || isNaN(diameter) ||
        !validateDaekInput('bredde', newDaekStoerrelse.bredde) ||
        !validateDaekInput('profil', newDaekStoerrelse.profil) ||
        !validateDaekInput('diameter', newDaekStoerrelse.diameter)) {
      // Opdater fejlstatus
      setInputErrors({
        bredde: isNaN(bredde) || !validateDaekInput('bredde', newDaekStoerrelse.bredde),
        profil: isNaN(profil) || !validateDaekInput('profil', newDaekStoerrelse.profil),
        diameter: isNaN(diameter) || !validateDaekInput('diameter', newDaekStoerrelse.diameter)
      });
      return;
    }
    
    // Tjek om størrelsen allerede eksisterer
    const exists = daekStoerrelseData.some(size => 
      size.bredde === bredde && 
      size.profil === profil && 
      size.diameter === diameter
    );
    
    if (exists) {
      alert('Denne dækstørrelse eksisterer allerede.');
      return;
    }
    
    // Generer displayName
    const displayName = `${bredde}/${profil}R${diameter}`;
    
    // Opret nyt id
    const newId = daekStoerrelseData.length > 0 ? 
      Math.max(...daekStoerrelseData.map(size => size.id)) + 1 : 1;
    
    // Tilføj ny størrelse
    const newSize: DaekStoerrelse = {
      id: newId,
      bredde,
      profil,
      diameter,
      displayName
    };
    
    // Opdater state
    setDaekStoerrelseData([...daekStoerrelseData, newSize]);
    
    // Tilføj standard priser for den nye størrelse
    const defaultPris = 500; // Standardpris for alle nye størrelser
    
    // Opdater prisinformation for alle sæsoner
    const updatedPriser = {...daekPriser};
    ['sommer', 'vinter', 'helaar'].forEach(season => {
      updatedPriser[season] = [...updatedPriser[season], {
        stoerrelseId: newId,
        budget: defaultPris,
        economy: defaultPris * 1.3,  // 30% højere end budget
        premium: defaultPris * 1.7    // 70% højere end budget
      }];
    });
    
    setDaekPriser(updatedPriser);
    
    // Nulstil input
    setNewDaekStoerrelse({ bredde: '', profil: '', diameter: '' });
    setInputErrors({ bredde: false, profil: false, diameter: false });
  };
  
  // Start redigering af dækstørrelse
  const startEditing = (stoerrelse: DaekStoerrelse) => {
    setEditingStoerrelseId(stoerrelse.id);
    setEditingStoerrelse({
      id: stoerrelse.id,
      bredde: stoerrelse.bredde.toString(),
      profil: stoerrelse.profil.toString(),
      diameter: stoerrelse.diameter.toString()
    });
    setEditErrors({ bredde: false, profil: false, diameter: false });
  };
  
  // Annuller redigering
  const cancelEditing = () => {
    setEditingStoerrelseId(null);
    setEditingStoerrelse(null);
  };
  
  // Validér redigeringsinput
  const validateEditInput = (field: string, value: string): boolean => {
    return validateDaekInput(field, value);
  };
  
  // Håndter ændringer til redigeringsinput
  const handleEditChange = (field: string, value: string) => {
    if (!editingStoerrelse) return;
    
    setEditingStoerrelse(prev => ({
      ...prev!,
      [field]: value
    }));
    
    // Kun validér hvis der er indtastet en værdi
    if (value.trim() !== '') {
      const isValid = validateEditInput(field, value);
      setEditErrors(prev => ({
        ...prev,
        [field]: !isValid
      }));
    } else {
      setEditErrors(prev => ({
        ...prev,
        [field]: false
      }));
    }
  };
  
  // Gem redigeret dækstørrelse
  const saveEditing = () => {
    if (!editingStoerrelse) return;
    
    // Validér input
    const bredde = parseInt(editingStoerrelse.bredde);
    const profil = parseInt(editingStoerrelse.profil);
    const diameter = parseInt(editingStoerrelse.diameter);
    
    if (isNaN(bredde) || isNaN(profil) || isNaN(diameter) ||
        !validateEditInput('bredde', editingStoerrelse.bredde) ||
        !validateEditInput('profil', editingStoerrelse.profil) ||
        !validateEditInput('diameter', editingStoerrelse.diameter)) {
      // Opdater fejlstatus
      setEditErrors({
        bredde: isNaN(bredde) || !validateEditInput('bredde', editingStoerrelse.bredde),
        profil: isNaN(profil) || !validateEditInput('profil', editingStoerrelse.profil),
        diameter: isNaN(diameter) || !validateEditInput('diameter', editingStoerrelse.diameter)
      });
      return;
    }
    
    // Tjek om en anden størrelse med samme værdier allerede eksisterer
    const exists = daekStoerrelseData.some(size => 
      size.id !== editingStoerrelse.id && // Ignorér den størrelse vi er ved at redigere
      size.bredde === bredde && 
      size.profil === profil && 
      size.diameter === diameter
    );
    
    if (exists) {
      alert('En dækstørrelse med disse mål eksisterer allerede.');
      return;
    }
    
    // Opdater displayName
    const displayName = `${bredde}/${profil}R${diameter}`;
    
    // Opdater dækstørrelse
    const updatedDaekStoerrelseData = daekStoerrelseData.map(size => {
      if (size.id === editingStoerrelse.id) {
        return {
          ...size,
          bredde,
          profil,
          diameter,
          displayName
        };
      }
      return size;
    });
    
    setDaekStoerrelseData(updatedDaekStoerrelseData);
    setEditingStoerrelseId(null);
    setEditingStoerrelse(null);
  };
  
  // Slet dækstørrelse og tilhørende prisdata
  const handleDeleteDaekStoerrelse = (id: number) => {
    if (window.confirm('Er du sikker på, at du vil slette denne dækstørrelse? Dette vil også slette alle tilhørende prisdata.')) {
      // Afbryd redigering hvis vi er ved at redigere den størrelse, der slettes
      if (editingStoerrelseId === id) {
        cancelEditing();
      }
      
      // Slet dækstørrelse
      setDaekStoerrelseData(daekStoerrelseData.filter(size => size.id !== id));
      
      // Slet prisdata for alle sæsoner
      const updatedPriser = {...daekPriser};
      ['sommer', 'vinter', 'helaar'].forEach(season => {
        updatedPriser[season] = updatedPriser[season].filter(pris => pris.stoerrelseId !== id);
      });
      
      setDaekPriser(updatedPriser);
    }
  };
  
  // Håndter ændring af pris for en dækstørrelse
  const handlePrisChange = (stoerrelseId: number, kategori: 'budget' | 'economy' | 'premium', value: string, applyToAllSeasons: boolean = false) => {
    const numValue = parseInt(value) || 0;
    
    // Opdater prisen for den valgte kategori og dækstørrelse
    const updatedPriser = {...daekPriser};
    
    if (applyToAllSeasons) {
      // Opdater alle sæsoner med samme pris
      ['sommer', 'vinter', 'helaar'].forEach(season => {
        const priserForSeason = [...updatedPriser[season]];
        const prisIndex = priserForSeason.findIndex(pris => pris.stoerrelseId === stoerrelseId);
        
        if (prisIndex !== -1) {
          priserForSeason[prisIndex] = {
            ...priserForSeason[prisIndex],
            [kategori]: numValue
          };
          
          updatedPriser[season] = priserForSeason;
        }
      });
    } else {
      // Opdater kun den aktive sæson
      const priserForSeason = [...updatedPriser[activeTab]];
      const prisIndex = priserForSeason.findIndex(pris => pris.stoerrelseId === stoerrelseId);
      
      if (prisIndex !== -1) {
        priserForSeason[prisIndex] = {
          ...priserForSeason[prisIndex],
          [kategori]: numValue
        };
        
        updatedPriser[activeTab] = priserForSeason;
      }
    }
    
    setDaekPriser(updatedPriser);
  };
  
  // Kopier priser fra aktuel sæson til alle sæsoner
  const copyPricesAcrossAllSeasons = (stoerrelseId: number) => {
    if (!window.confirm('Er du sikker på, at du vil kopiere priserne fra den aktuelle sæson til alle sæsoner?')) {
      return;
    }
    
    const updatedPriser = {...daekPriser};
    const currentSeason = activeTab;
    const currentPrices = updatedPriser[currentSeason].find(p => p.stoerrelseId === stoerrelseId);
    
    if (!currentPrices) return;
    
    // Kopier priser til alle andre sæsoner
    ['sommer', 'vinter', 'helaar'].forEach(season => {
      if (season === currentSeason) return; // Skip den aktuelle sæson
      
      const seasonPrices = updatedPriser[season];
      const priceIndex = seasonPrices.findIndex(p => p.stoerrelseId === stoerrelseId);
      
      if (priceIndex !== -1) {
        seasonPrices[priceIndex] = {
          ...seasonPrices[priceIndex],
          budget: currentPrices.budget,
          economy: currentPrices.economy,
          premium: currentPrices.premium
        };
      }
    });
    
    setDaekPriser(updatedPriser);
    alert('Priser er blevet kopieret til alle sæsoner.');
  };

  // Håndter import af CSV data for dækstørrelser og priser
  const handleImportDaekStoerrelseCSV = (csvData: any[]) => {
    if (!csvData || csvData.length === 0) return;
    
    // Find den højeste eksisterende ID for at generere nye ID'er
    const maxId = daekStoerrelseData.reduce((max, size) => Math.max(max, size.id), 0);
    let newIdCounter = maxId + 1;
    
    // Nye dækstørrelser og prisopdateringer
    const newSizes: DaekStoerrelse[] = [];
    const updatedSizes: DaekStoerrelse[] = [];
    const updatedPriser = {...daekPriser};
    
    // Initialiser manglende prisdata for alle sæsoner
    ['sommer', 'vinter', 'helaar'].forEach(season => {
      if (!updatedPriser[season]) {
        updatedPriser[season] = [];
      }
    });

    csvData.forEach((row, index) => {
      // Valider nødvendige felter er til stede
      const bredde = Number(row.bredde);
      const profil = Number(row.profil);
      const diameter = Number(row.diameter);
      
      if (isNaN(bredde) || isNaN(profil) || isNaN(diameter)) {
        console.error(`Række ${index + 1}: Ugyldig dækstørrelse data`, row);
        return; // Skip denne række
      }
      
      // Generer displayName
      const displayName = `${bredde}/${profil}R${diameter}`;
      
      // Tjek om denne størrelse allerede eksisterer
      const existingSize = daekStoerrelseData.find(
        size => size.bredde === bredde && size.profil === profil && size.diameter === diameter
      );
      
      let sizeId: number;
      
      if (existingSize) {
        // Opdater eksisterende størrelse
        sizeId = existingSize.id;
        updatedSizes.push({
          ...existingSize,
          bredde,
          profil,
          diameter,
          displayName
        });
      } else {
        // Opret ny størrelse
        sizeId = newIdCounter++;
        newSizes.push({
          id: sizeId,
          bredde,
          profil,
          diameter,
          displayName
        });
      }
      
      // Opdater prisdata for hver sæson hvis tilgængelig i CSV
      ['sommer', 'vinter', 'helaar'].forEach(season => {
        const budget = Number(row[`budget_${season}`]);
        const economy = Number(row[`economy_${season}`]);
        const premium = Number(row[`premium_${season}`]);
        
        // Tjek om prisdata er tilgængelig for denne sæson
        const hasPriceData = !isNaN(budget) || !isNaN(economy) || !isNaN(premium);
        
        if (hasPriceData) {
          // Find eksisterende prisdata
          const priceIndex = updatedPriser[season].findIndex(p => p.stoerrelseId === sizeId);
          
          if (priceIndex !== -1) {
            // Opdater eksisterende prisdata
            updatedPriser[season][priceIndex] = {
              ...updatedPriser[season][priceIndex],
              budget: !isNaN(budget) ? budget : updatedPriser[season][priceIndex].budget,
              economy: !isNaN(economy) ? economy : updatedPriser[season][priceIndex].economy,
              premium: !isNaN(premium) ? premium : updatedPriser[season][priceIndex].premium
            };
          } else {
            // Tilføj ny prisdata
            updatedPriser[season].push({
              stoerrelseId: sizeId,
              budget: !isNaN(budget) ? budget : 0,
              economy: !isNaN(economy) ? economy : 0,
              premium: !isNaN(premium) ? premium : 0
            });
          }
        }
      });
    });
    
    // Opdater state med nye og opdaterede data
    const combinedSizes = [
      ...daekStoerrelseData.filter(size => 
        !updatedSizes.some(updated => updated.id === size.id)
      ),
      ...updatedSizes,
      ...newSizes
    ];
    
    setDaekStoerrelseData(combinedSizes);
    setDaekPriser(updatedPriser);
  };
  
  // Generer CSV data for eksport
  const generateExportData = () => {
    const exportData: any[] = [];
    
    daekStoerrelseData.forEach(size => {
      const row: any = {
        bredde: size.bredde,
        profil: size.profil,
        diameter: size.diameter
      };
      
      // Tilføj prisdata for hver sæson
      ['sommer', 'vinter', 'helaar'].forEach(season => {
        const priceData = daekPriser[season]?.find(p => p.stoerrelseId === size.id);
        if (priceData) {
          row[`budget_${season}`] = priceData.budget;
          row[`economy_${season}`] = priceData.economy;
          row[`premium_${season}`] = priceData.premium;
        } else {
          row[`budget_${season}`] = 0;
          row[`economy_${season}`] = 0;
          row[`premium_${season}`] = 0;
        }
      });
      
      exportData.push(row);
    });
    
    return exportData;
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">Administration af dækstørrelser og priser</h2>
      
      {/* Tab navigation for seasons */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          className={`px-4 py-2 flex items-center ${
            activeTab === 'sommer' ? 
            `${categoryColors.sommer.bg} ${categoryColors.sommer.text} ${categoryColors.sommer.border} border-b-2` : 
            'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('sommer')}
        >
          {categoryColors.sommer.icon} Sommerdæk
        </button>
        <button
          className={`px-4 py-2 flex items-center ${
            activeTab === 'vinter' ? 
            `${categoryColors.vinter.bg} ${categoryColors.vinter.text} ${categoryColors.vinter.border} border-b-2` : 
            'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('vinter')}
        >
          {categoryColors.vinter.icon} Vinterdæk
        </button>
        <button
          className={`px-4 py-2 flex items-center ${
            activeTab === 'helaar' ? 
            `${categoryColors.helaar.bg} ${categoryColors.helaar.text} ${categoryColors.helaar.border} border-b-2` : 
            'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('helaar')}
        >
          {categoryColors.helaar.icon} Helårsdæk
        </button>
      </div>
      
      {/* Tilføj ny dækstørrelse */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Tilføj ny dækstørrelse</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bredde</label>
            <input 
              type="number" 
              value={newDaekStoerrelse.bredde} 
              onChange={e => handleNewDaekStoerrelseChange('bredde', e.target.value)} 
              className={`block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                inputErrors.bredde ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="f.eks. 205"
              min="135"
              max="395"
              step="5"
            />
            {inputErrors.bredde && (
              <p className="mt-1 text-xs text-red-500">Skal være mellem 135-395 og delelig med 5</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profil</label>
            <input 
              type="number" 
              value={newDaekStoerrelse.profil} 
              onChange={e => handleNewDaekStoerrelseChange('profil', e.target.value)} 
              className={`block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                inputErrors.profil ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="f.eks. 55"
              min="20"
              max="95"
              step="5"
            />
            {inputErrors.profil && (
              <p className="mt-1 text-xs text-red-500">Skal være mellem 20-95 og delelig med 5</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diameter</label>
            <input 
              type="number" 
              value={newDaekStoerrelse.diameter} 
              onChange={e => handleNewDaekStoerrelseChange('diameter', e.target.value)} 
              className={`block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                inputErrors.diameter ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="f.eks. 16"
              min="14"
              max="23"
            />
            {inputErrors.diameter && (
              <p className="mt-1 text-xs text-red-500">Skal være mellem 14-23</p>
            )}
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleAddDaekStoerrelse}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md flex items-center"
              disabled={!newDaekStoerrelse.bredde || !newDaekStoerrelse.profil || !newDaekStoerrelse.diameter ||
                inputErrors.bredde || inputErrors.profil || inputErrors.diameter}
            >
              <FaPlus className="mr-1" /> Tilføj dækstørrelse
            </button>
          </div>
        </div>
      </div>
      
      {/* Dækstørrelser og priser */}
      <div className="mt-6 overflow-x-auto">
        <h3 className="text-md font-medium text-gray-700 mb-3">Dækstørrelser og priser ({activeTab})</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Størrelse</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget (kr)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Economy (kr)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Premium (kr)</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Handling</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {daekStoerrelseData.sort((a, b) => {
              // Først sorter efter diameter
              if (a.diameter !== b.diameter) return a.diameter - b.diameter;
              // Dernæst efter bredde
              if (a.bredde !== b.bredde) return a.bredde - b.bredde;
              // Til sidst efter profil
              return a.profil - b.profil;
            }).map(size => {
              // Find prisdata for dækstørrelsen i den aktive sæson
              const prisData = daekPriser[activeTab].find(pris => pris.stoerrelseId === size.id);
              
              return (
                <tr key={size.id} className={editingStoerrelseId === size.id ? 'bg-blue-50' : ''}>
                  {editingStoerrelseId === size.id && editingStoerrelse ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="grid grid-cols-3 gap-1">
                          <div>
                            <input 
                              type="number" 
                              value={editingStoerrelse.bredde} 
                              onChange={(e) => handleEditChange('bredde', e.target.value)}
                              className={`block w-full border rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                editErrors.bredde ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              min="135"
                              max="395"
                              step="5"
                            />
                            {editErrors.bredde && (
                              <p className="mt-1 text-xs text-red-500">135-395, delelig med 5</p>
                            )}
                          </div>
                          <div>
                            <input 
                              type="number" 
                              value={editingStoerrelse.profil} 
                              onChange={(e) => handleEditChange('profil', e.target.value)}
                              className={`block w-full border rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                editErrors.profil ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              min="20"
                              max="95"
                              step="5"
                            />
                            {editErrors.profil && (
                              <p className="mt-1 text-xs text-red-500">20-95, delelig med 5</p>
                            )}
                          </div>
                          <div>
                            <input 
                              type="number" 
                              value={editingStoerrelse.diameter} 
                              onChange={(e) => handleEditChange('diameter', e.target.value)}
                              className={`block w-full border rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                editErrors.diameter ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              min="14"
                              max="23"
                            />
                            {editErrors.diameter && (
                              <p className="mt-1 text-xs text-red-500">14-23</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input 
                          type="number" 
                          value={prisData?.budget || 0} 
                          onChange={(e) => handlePrisChange(size.id, 'budget', e.target.value)}
                          className="block w-24 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          min="0"
                          step="50"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input 
                          type="number" 
                          value={prisData?.economy || 0} 
                          onChange={(e) => handlePrisChange(size.id, 'economy', e.target.value)}
                          className="block w-24 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          min="0"
                          step="50"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input 
                          type="number" 
                          value={prisData?.premium || 0} 
                          onChange={(e) => handlePrisChange(size.id, 'premium', e.target.value)}
                          className="block w-24 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          min="0"
                          step="50"
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
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {size.displayName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <input 
                            type="number" 
                            value={prisData?.budget || 0} 
                            onChange={(e) => handlePrisChange(size.id, 'budget', e.target.value)}
                            className="block w-24 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            min="0"
                            step="50"
                          />
                          <button 
                            onClick={() => handlePrisChange(size.id, 'budget', (prisData?.budget || 0).toString(), true)}
                            className="text-blue-500 hover:text-blue-700 p-1" 
                            title="Anvend denne pris på alle sæsoner"
                          >
                            <FaSun className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <input 
                            type="number" 
                            value={prisData?.economy || 0} 
                            onChange={(e) => handlePrisChange(size.id, 'economy', e.target.value)}
                            className="block w-24 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            min="0"
                            step="50"
                          />
                          <button 
                            onClick={() => handlePrisChange(size.id, 'economy', (prisData?.economy || 0).toString(), true)}
                            className="text-blue-500 hover:text-blue-700 p-1" 
                            title="Anvend denne pris på alle sæsoner"
                          >
                            <FaSun className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <input 
                            type="number" 
                            value={prisData?.premium || 0} 
                            onChange={(e) => handlePrisChange(size.id, 'premium', e.target.value)}
                            className="block w-24 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            min="0"
                            step="50"
                          />
                          <button 
                            onClick={() => handlePrisChange(size.id, 'premium', (prisData?.premium || 0).toString(), true)}
                            className="text-blue-500 hover:text-blue-700 p-1" 
                            title="Anvend denne pris på alle sæsoner"
                          >
                            <FaSun className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => startEditing(size)} className="text-blue-500 hover:text-blue-700" title="Rediger størrelse">
                            <FaEdit />
                          </button>
                          <button onClick={() => copyPricesAcrossAllSeasons(size.id)} className="text-green-500 hover:text-green-700" title="Kopier priser til alle sæsoner">
                            <FaCalendarDay />
                          </button>
                          <button onClick={() => handleDeleteDaekStoerrelse(size.id)} className="text-red-500 hover:text-red-700" title="Fjern dækstørrelse">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
            
            {daekStoerrelseData.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  Ingen dækstørrelser tilføjet. Tilføj en dækstørrelse herover.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <CSVImportExport 
        type="daekstoerrelse" 
        onImport={handleImportDaekStoerrelseCSV} 
        onExport={generateExportData} 
      />

      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Vejledning:</h3>
        <p className="text-sm text-gray-600">
          På denne side kan du administrere dækstørrelser og priserne for hver størrelse baseret på kategori (budget, economy, premium).
          Brug fanerne foroven til at skifte mellem sommerdæk, vinterdæk og helårsdæk. 
          Priserne kan være forskellige for hver dæksæson. Du kan ændre priser ved at indtaste nye værdier i inputfelterne.
          Brug CSV import/export funktionen til at nemt importere dækstørrelser og priser fra en CSV fil eller eksportere dine data.
        </p>
      </div>
    </div>
  );
};

export default AdminDaekStoerrelserPriser;
