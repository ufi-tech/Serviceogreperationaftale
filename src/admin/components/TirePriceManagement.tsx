import React, { useState, useEffect, useRef } from 'react';
import { FaSave, FaPlus, FaTrash, FaUpload, FaDownload, FaEdit, FaSearch, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { TireData, getTires, saveTire, deleteTire, importTiresFromCSV, exportTiresToCSV } from '../../api/tiresApi';

// Model for det lokale redigeringsformat
interface EditableTire extends Omit<TireData, 'season' | 'basePrice'> {
  type: 'summer' | 'winter' | 'allseason'; // For bagudkompatibilitet
  price: number; // For bagudkompatibilitet
  lastUpdated?: string; // Dato for seneste opdatering (valgfri)
}

// Hjælpefunktioner for datakonvertering mellem API og UI

// Konverter fra API TireData format til EditableTire UI format
const toEditableTire = (tire: TireData): EditableTire => {
  return {
    id: tire.id,
    brand: tire.brand,
    model: tire.model,
    size: tire.size,
    category: tire.category,
    type: tire.season === 'all-season' ? 'allseason' : tire.season, // Konverter season til type
    price: tire.basePrice, // Brug basePrice som price
    stock: tire.stock,
    ean: tire.ean,
    supplierRef: tire.supplierRef
  };
};

// Konverter fra EditableTire UI format til API TireData format
const toApiTireData = (tire: EditableTire): TireData => {
  return {
    id: tire.id,
    brand: tire.brand,
    model: tire.model,
    size: tire.size,
    category: tire.category,
    season: tire.type === 'allseason' ? 'all-season' : tire.type as 'summer' | 'winter' | 'all-season', // Konverter type til season
    basePrice: tire.price, // Brug price som basePrice
    stock: tire.stock || 0,
    ean: tire.ean || '',
    supplierRef: tire.supplierRef || ''
  };
};

// Tom standard dæk-template til oprettelse
const newTireTemplate: EditableTire = {
  id: '',
  brand: '',
  model: '',
  size: '',
  category: 'economy',
  type: 'summer',
  price: 0,
  stock: 10,
  ean: '',
  supplierRef: ''
};

// Komponenten til håndtering af dækpriser
const TirePriceManagement: React.FC = () => {
  const [tirePrices, setTirePrices] = useState<EditableTire[]>([]);
  const [filteredPrices, setFilteredPrices] = useState<EditableTire[]>([]);
  const [editingPrice, setEditingPrice] = useState<EditableTire | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [filters, setFilters] = useState({
    size: '',
    brand: '',
    category: '',
    type: ''
  });
  
  // Hent dæk fra API ved komponent-mount
  useEffect(() => {
    const fetchTires = async () => {
      try {
        setLoading(true);
        setError(null);
        const tires = await getTires();
        const editableTires = tires.map(toEditableTire);
        setTirePrices(editableTires);
        setLoading(false);
      } catch (err) {
        console.error('Fejl ved hentning af dæk:', err);
        setError('Der opstod en fejl ved hentning af dæk. Prøv igen senere.');
        setLoading(false);
      }
    };
    
    fetchTires();
  }, []);
  
  // Opdater filtrerede priser når filter eller priser ændres
  useEffect(() => {
    let filtered = [...tirePrices];
    
    if (filters.size) {
      filtered = filtered.filter(tire => 
        tire.size.toLowerCase().includes(filters.size.toLowerCase())
      );
    }
    
    if (filters.brand) {
      filtered = filtered.filter(tire => 
        tire.brand.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }
    
    if (filters.category) {
      filtered = filtered.filter(tire => 
        tire.category === filters.category
      );
    }
    
    if (filters.type) {
      filtered = filtered.filter(tire => 
        tire.type === filters.type
      );
    }
    
    setFilteredPrices(filtered);
  }, [filters, tirePrices]);
  
  // Håndter filter-ændringer
  const handleFilterChange = (field: string, value: string) => {
    setFilters({
      ...filters,
      [field]: value
    });
  };
  
  // Håndter redigering af dæk
  const handleEdit = (tire: EditableTire) => {
    setEditingPrice({...tire});
    setIsAdding(false);
  };
  
  // Håndter tilføjelse af nyt dæk
  const handleAdd = () => {
    setEditingPrice({...newTireTemplate, id: crypto.randomUUID()});
    setIsAdding(true);
  };
  
  // Håndter sletning af dæk
  const handleDelete = async (id: string) => {
    if (window.confirm('Er du sikker på, at du vil slette dette dæk?')) {
      try {
        setActionStatus('loading');
        const success = await deleteTire(id);
        
        if (success) {
          setTirePrices(tirePrices.filter(tire => tire.id !== id));
          setActionStatus('success');
          setTimeout(() => setActionStatus('idle'), 2000);
        } else {
          setActionStatus('error');
          setError('Der opstod en fejl ved sletning af dækket');
        }
      } catch (err) {
        console.error('Fejl ved sletning af dæk:', err);
        setActionStatus('error');
        setError('Der opstod en fejl ved sletning af dækket');
      }
    }
  };
  
  // Håndter gemning af ændringer
  const handleSave = async () => {
    if (!editingPrice) return;
    
    try {
      setActionStatus('loading');
      
      // Konverter til API-format
      const tireData = toApiTireData(editingPrice);
      
      // Gem til API
      const success = await saveTire(tireData);
      
      if (success) {
        // Opdater lokal tilstand
        if (isAdding) {
          setTirePrices([...tirePrices, editingPrice]);
        } else {
          setTirePrices(tirePrices.map(tire => 
            tire.id === editingPrice.id ? editingPrice : tire
          ));
        }
        
        setEditingPrice(null);
        setActionStatus('success');
        setTimeout(() => setActionStatus('idle'), 2000);
      } else {
        setActionStatus('error');
        setError('Der opstod en fejl ved gemning af dækket');
      }
    } catch (err) {
      console.error('Fejl ved gemning af dæk:', err);
      setActionStatus('error');
      setError('Der opstod en fejl ved gemning af dækket');
    }
  };
  
  // Håndter annullering af redigering
  const handleCancel = () => {
    setEditingPrice(null);
  };
  
  // Håndter ændring i inputfelter
  const handleInputChange = (field: keyof EditableTire, value: any) => {
    if (!editingPrice) return;
    
    setEditingPrice({
      ...editingPrice,
      [field]: field === 'price' ? Number(value) : value
    });
  };
  
  // Håndter upload af CSV
  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setActionStatus('loading');
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const csv = event.target?.result as string;
          const success = await importTiresFromCSV(csv);
          
          if (success) {
            // Genindlæs dæk fra API
            const tires = await getTires();
            const editableTires = tires.map(toEditableTire);
            setTirePrices(editableTires);
            setActionStatus('success');
            setTimeout(() => setActionStatus('idle'), 2000);
          } else {
            setActionStatus('error');
            setError('Der opstod en fejl ved import af CSV-filen');
          }
        } catch (err) {
          console.error('Fejl ved behandling af CSV:', err);
          setActionStatus('error');
          setError('Der opstod en fejl ved behandling af CSV-filen');
        }
      };
      
      reader.onerror = () => {
        setActionStatus('error');
        setError('Der opstod en fejl ved læsning af filen');
      };
      
      reader.readAsText(file);
    } catch (err) {
      console.error('Fejl ved upload af CSV:', err);
      setActionStatus('error');
      setError('Der opstod en fejl ved upload af CSV-filen');
    } finally {
      // Nulstil fileinput for at tillade samme fil igen
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // CSV-eksport funktion
  const handleCSVExport = async () => {
    try {
      setActionStatus('loading');
      const csvData = await exportTiresToCSV();
      
      if (csvData) {
        // Opret en Blob og download filen
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.setAttribute('download', `daekpriser_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setActionStatus('success');
        setTimeout(() => setActionStatus('idle'), 2000);
      } else {
        setActionStatus('error');
        setError('Der opstod en fejl ved eksport til CSV');
      }
    } catch (err) {
      console.error('Fejl ved CSV-eksport:', err);
      setActionStatus('error');
      setError('Der opstod en fejl ved eksport til CSV');
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Dækprisadministration</h3>
        <div className="flex space-x-2">
          <label className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
            <FaUpload className="mr-2" /> Import CSV
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleCSVUpload} 
              className="hidden" 
            />
          </label>
          <button
            onClick={handleCSVExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FaDownload className="mr-2" /> Eksport CSV
          </button>
          <button
            onClick={handleAdd}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <FaPlus className="mr-2" /> Tilføj dæk
          </button>
        </div>
      </div>
      
      {/* Filtre */}
      <div className="bg-gray-50 px-4 py-3 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="sizeFilter" className="block text-xs font-medium text-gray-700 mb-1">
              Størrelse
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 text-xs" />
              </div>
              <input
                type="text"
                id="sizeFilter"
                value={filters.size}
                onChange={(e) => handleFilterChange('size', e.target.value)}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="205/55R16"
              />
            </div>
          </div>
          <div>
            <label htmlFor="brandFilter" className="block text-xs font-medium text-gray-700 mb-1">
              Mærke
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 text-xs" />
              </div>
              <input
                type="text"
                id="brandFilter"
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Michelin"
              />
            </div>
          </div>
          <div>
            <label htmlFor="categoryFilter" className="block text-xs font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <select
              id="categoryFilter"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Alle</option>
              <option value="budget">Budget</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <div>
            <label htmlFor="typeFilter" className="block text-xs font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="typeFilter"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Alle</option>
              <option value="summer">Sommer</option>
              <option value="winter">Vinter</option>
              <option value="allseason">Helårs</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Redigeringsformular */}
      {editingPrice && (
        <div className="bg-gray-50 p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">
              {isAdding ? 'Tilføj nyt dæk' : 'Rediger dæk'}
            </h4>
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                <FaSave className="mr-2" /> Gem
              </button>
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                Annuller
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Størrelse
              </label>
              <input
                type="text"
                value={editingPrice.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="F.eks. 205/55R16"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mærke
              </label>
              <input
                type="text"
                value={editingPrice.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="F.eks. Michelin"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <input
                type="text"
                value={editingPrice.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="F.eks. Primacy 4"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <select
                value={editingPrice.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="budget">Budget</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={editingPrice.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="summer">Sommer</option>
                <option value="winter">Vinter</option>
                <option value="allseason">Helårs</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pris (ekskl. moms)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  value={editingPrice.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                  placeholder="0"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">kr.</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center h-full pt-6">
              <input
                id="stock"
                name="stock"
                type="checkbox"
                checked={editingPrice.stock > 0}
                onChange={(e) => handleInputChange('stock', e.target.checked ? 10 : 0)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="stock" className="ml-2 block text-sm text-gray-900">
                På lager
              </label>
            </div>
          </div>
        </div>
      )}
      
      {/* Tabel med dækpriser */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Størrelse
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mærke/Model
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kategori
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pris (ekskl. moms)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sidst opdateret
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Handlinger
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPrices.map((tire) => (
              <tr key={tire.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {tire.size}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{tire.brand}</div>
                  <div className="text-sm text-gray-500">{tire.model}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    tire.category === 'premium' ? 'bg-blue-100 text-blue-800' :
                    tire.category === 'economy' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {tire.category === 'premium' ? 'Premium' :
                     tire.category === 'economy' ? 'Economy' : 'Budget'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tire.type === 'summer' ? 'Sommer' :
                   tire.type === 'winter' ? 'Vinter' : 'Helårs'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {tire.price.toLocaleString()} kr.
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    tire.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {tire.stock > 0 ? 'På lager' : 'Ikke på lager'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tire.lastUpdated}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(tire)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(tire.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {filteredPrices.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                  Ingen dækpriser matcher dine filtre
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination - kunne tilføjes her */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Viser <span className="font-medium">{filteredPrices.length}</span> af{' '}
              <span className="font-medium">{tirePrices.length}</span> dækpriser
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TirePriceManagement;
