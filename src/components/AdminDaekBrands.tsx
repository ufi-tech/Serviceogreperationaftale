import React, { useState, useEffect } from 'react';
import { FaSun, FaSnowflake, FaCalendarDay, FaPlus, FaTrash } from 'react-icons/fa';
import CSVImportExport from './CSVImportExport';

// Initial list of tire brands to populate the admin panel
const initialDaekBrands = [
  { id: 1, name: 'Michelin', categories: { sommer: ['premium'], vinter: ['premium'], helaar: ['premium'] } },
  { id: 2, name: 'Continental', categories: { sommer: ['premium'], vinter: ['premium'], helaar: ['premium'] } },
  { id: 3, name: 'Bridgestone', categories: { sommer: ['premium'], vinter: ['premium'], helaar: ['premium'] } },
  { id: 4, name: 'Pirelli', categories: { sommer: ['premium'], vinter: ['premium'], helaar: ['premium'] } },
  { id: 5, name: 'Goodyear', categories: { sommer: ['premium'], vinter: ['premium'], helaar: ['premium'] } },
  { id: 6, name: 'Falken', categories: { sommer: ['economy'], vinter: ['economy'], helaar: ['economy'] } },
  { id: 7, name: 'Hankook', categories: { sommer: ['economy'], vinter: ['economy'], helaar: ['economy'] } },
  { id: 8, name: 'Nexen', categories: { sommer: ['economy'], vinter: ['economy'], helaar: ['economy'] } },
  { id: 9, name: 'Kumho', categories: { sommer: ['economy'], vinter: ['economy'], helaar: ['economy'] } },
  { id: 10, name: 'Toyo', categories: { sommer: ['economy'], vinter: ['economy'], helaar: ['economy'] } },
  { id: 11, name: 'Sailun', categories: { sommer: ['budget'], vinter: ['budget'], helaar: ['budget'] } },
  { id: 12, name: 'Jinyu', categories: { sommer: ['budget'], vinter: ['budget'], helaar: ['budget'] } },
  { id: 13, name: 'Fortuna', categories: { sommer: ['budget'], vinter: ['budget'], helaar: ['budget'] } },
  { id: 14, name: 'Nankang', categories: { sommer: ['budget'], vinter: ['budget'], helaar: ['budget'] } },
  { id: 15, name: 'Maxxis', categories: { sommer: ['budget'], vinter: ['budget'], helaar: ['budget'] } },
];

const AdminDaekBrands: React.FC = () => {
  const [daekBrands, setDaekBrands] = useState(initialDaekBrands);
  const [newBrandName, setNewBrandName] = useState('');
  const [activeTab, setActiveTab] = useState<'sommer' | 'vinter' | 'helaar'>('sommer');
  
  // Gem data i localStorage
  useEffect(() => {
    const savedDaekBrands = localStorage.getItem('daekBrands');
    
    if (savedDaekBrands) {
      setDaekBrands(JSON.parse(savedDaekBrands));
    }
  }, []);
  
  // Gem data til localStorage når brands ændres
  useEffect(() => {
    localStorage.setItem('daekBrands', JSON.stringify(daekBrands));
  }, [daekBrands]);
  
  // Category color scheme based on your requirements
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
  
  const handleAddBrand = () => {
    if (newBrandName.trim() === '') return;
    
    const newBrand = {
      id: daekBrands.length + 1,
      name: newBrandName.trim(),
      categories: {
        sommer: [],
        vinter: [],
        helaar: []
      }
    };
    
    setDaekBrands([...daekBrands, newBrand]);
    setNewBrandName('');
  };
  
  const handleRemoveBrand = (id: number) => {
    setDaekBrands(daekBrands.filter(brand => brand.id !== id));
  };
  
  // Opdateret til kun at tillade ét flueben pr. dækbrand
  const handleCategoryChange = (brandId: number, category: 'budget' | 'economy' | 'premium', checked: boolean) => {
    if (!checked) {
      // Hvis fluebenet fjernes, fjerner vi bare kategorien
      setDaekBrands(daekBrands.map(brand => {
        if (brand.id === brandId) {
          const updatedCategories = {...brand.categories};
          updatedCategories[activeTab] = [];
          return {
            ...brand,
            categories: updatedCategories
          };
        }
        return brand;
      }));
    } else {
      // Hvis fluebenet sættes, fjerner vi alle andre kategorier og tilføjer kun den valgte
      setDaekBrands(daekBrands.map(brand => {
        if (brand.id === brandId) {
          const updatedCategories = {...brand.categories};
          updatedCategories[activeTab] = [category]; // Kun den valgte kategori bevares
          return {
            ...brand,
            categories: updatedCategories
          };
        }
        return brand;
      }));
    }
  };
  
  // Håndter import af CSV data for dækbrands
  const handleImportDaekBrandCSV = (csvData: any[]) => {
    if (!csvData || csvData.length === 0) return;
    
    // Find den højeste eksisterende ID for at generere nye ID'er
    const maxId = daekBrands.reduce((max, brand) => Math.max(max, brand.id), 0);
    let newIdCounter = maxId + 1;
    
    // Behandl hver række i CSV data
    const importedBrands = csvData.map(row => {
      // Tjek om brand navn findes
      const brandName = row.navn || row.name || '';
      if (!brandName.trim()) return null;
      
      // Tjek om mærket allerede eksisterer
      const existingBrand = daekBrands.find(brand => 
        brand.name.toLowerCase() === brandName.toLowerCase()
      );
      
      // Initialiser kategorier
      const categories: { sommer: string[], vinter: string[], helaar: string[] } = {
        sommer: [],
        vinter: [],
        helaar: []
      };
      
      // Bestem kategori (budget, economy, premium)
      const kategori = (row.kategori || row.category || '').toLowerCase();
      if (['budget', 'economy', 'premium'].includes(kategori)) {
        // Tildel kategorien til de relevante sæsoner baseret på CSV-data
        const sommer = row.sommer === 'true' || row.sommer === true;
        const vinter = row.vinter === 'true' || row.vinter === true;
        const helaar = row.helaar === 'true' || row.helaar === true;
        
        if (sommer) categories.sommer = [kategori];
        if (vinter) categories.vinter = [kategori];
        if (helaar) categories.helaar = [kategori];
      }
      
      if (existingBrand) {
        // Opdater eksisterende brand
        return {
          ...existingBrand,
          categories: {
            sommer: categories.sommer.length > 0 ? categories.sommer : existingBrand.categories.sommer,
            vinter: categories.vinter.length > 0 ? categories.vinter : existingBrand.categories.vinter,
            helaar: categories.helaar.length > 0 ? categories.helaar : existingBrand.categories.helaar
          }
        };
      } else {
        // Opret nyt brand
        return {
          id: newIdCounter++,
          name: brandName,
          categories
        };
      }
    }).filter((brand): brand is {id: number, name: string, categories: {sommer: string[], vinter: string[], helaar: string[]}} => !!brand);
    
    // Opdater state med importerede brands
    const updatedBrands = [
      ...daekBrands.filter(existingBrand => 
        !importedBrands.some(importedBrand => importedBrand.id === existingBrand.id)
      ),
      ...importedBrands
    ];
    
    setDaekBrands(updatedBrands);
  };
  
  // Generer CSV data for eksport
  const generateExportData = () => {
    return daekBrands.map(brand => ({
      navn: brand.name,
      kategori: brand.categories.sommer[0] || '',
      sommer: brand.categories.sommer.length > 0,
      vinter: brand.categories.vinter.length > 0,
      helaar: brand.categories.helaar.length > 0,
    }));
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Administrer Dækbrands og Kategorier</h2>
      
      {/* Season tabs */}
      <div className="flex space-x-2 mb-4">
        <button 
          className={`px-4 py-2 rounded-lg font-medium flex items-center ${
            activeTab === 'sommer' 
              ? `${categoryColors.sommer.bg} ${categoryColors.sommer.text} ${categoryColors.sommer.border}` 
              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('sommer')}
        >
          {categoryColors.sommer.icon} Sommerdæk
        </button>
        
        <button 
          className={`px-4 py-2 rounded-lg font-medium flex items-center ${
            activeTab === 'vinter' 
              ? `${categoryColors.vinter.bg} ${categoryColors.vinter.text} ${categoryColors.vinter.border}` 
              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('vinter')}
        >
          {categoryColors.vinter.icon} Vinterdæk
        </button>
        
        <button 
          className={`px-4 py-2 rounded-lg font-medium flex items-center ${
            activeTab === 'helaar' 
              ? `${categoryColors.helaar.bg} ${categoryColors.helaar.text} ${categoryColors.helaar.border}` 
              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('helaar')}
        >
          {categoryColors.helaar.icon} Helårsdæk
        </button>
      </div>
      
      {/* Add new brand input */}
      <div className="flex items-center space-x-2 mb-4">
        <input
          type="text"
          value={newBrandName}
          onChange={(e) => setNewBrandName(e.target.value)}
          placeholder="Indtast nyt dækbrand..."
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddBrand}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md flex items-center"
          disabled={newBrandName.trim() === ''}
        >
          <FaPlus className="mr-1" /> Tilføj
        </button>
      </div>
      
      {/* Brands table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dækbrand
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Budget
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Economy
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Premium
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Handling
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {daekBrands.map((brand) => (
              <tr key={brand.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {brand.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={brand.categories[activeTab].includes('budget')}
                    onChange={(e) => handleCategoryChange(brand.id, 'budget', e.target.checked)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={brand.categories[activeTab].includes('economy')}
                    onChange={(e) => handleCategoryChange(brand.id, 'economy', e.target.checked)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={brand.categories[activeTab].includes('premium')}
                    onChange={(e) => handleCategoryChange(brand.id, 'premium', e.target.checked)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => handleRemoveBrand(brand.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Fjern dækbrand"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CSVImportExport
        type="daekbrand"
        onImport={handleImportDaekBrandCSV}
        onExport={generateExportData}
      />
      
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Vejledning:</h3>
        <p className="text-sm text-gray-600">
          På denne side kan du administrere hvilke dækbrands der tilhører hvilke kategorier for hver dæksæson.
          Du kan vælge én kategori for hvert brand (budget, economy eller premium), og indstillingerne kan være forskellige for hver sæson.
          Brug fanerne foroven til at skifte mellem sommerdæk, vinterdæk og helårsdæk.
          <br/><br/>
          Du kan nemt importere og eksportere dækmærker via CSV-fil. CSV filen skal indeholde kolonnerne: navn, kategori, sommer, vinter, helaar.
        </p>
      </div>
    </div>
  );
};

export default AdminDaekBrands;
