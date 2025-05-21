import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaFileCsv, FaDownload, FaUpload, FaEllipsisV } from 'react-icons/fa';
import roadsideAssistanceService, { RoadsidePricingRule, RoadsidePackage } from '../../services/RoadsideAssistanceService';

// Bruger den eksisterende service-instans

const RoadsidePricingRulesAdminPage: React.FC = () => {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();

  const [pricingRules, setPricingRules] = useState<RoadsidePricingRule[]>([]);
  const [packageDetails, setPackageDetails] = useState<RoadsidePackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState<RoadsidePricingRule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [fileImportRef, setFileImportRef] = useState<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!packageId) {
      setError('Ingen pakke-ID angivet');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        // Hent pakkedetaljer - her bruger vi getAdminRoadsidePackages og filtrerer
        const packages = await roadsideAssistanceService.getAdminRoadsidePackages();
        const matchingPackage = packages.find(pkg => pkg.id === packageId);
        setPackageDetails(matchingPackage || null);

        // Hent prisregler
        const rules = await roadsideAssistanceService.getMockRoadsidePricingRules(packageId);
        setPricingRules(rules);
        setError(null);
      } catch (err) {
        console.error('Fejl ved indlæsning af data:', err);
        setError('Der opstod en fejl ved indlæsning af data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [packageId]);

  const handleAddNew = () => {
    if (!packageId) return;
    
    setEditingRule({
      id: '',
      packageId: packageId,
      description: '',
      price: 0,
      carAgeMonthsFrom: 0,
      carAgeMonthsTo: 120,
      vehicleCategory: '',
      fuelType: '',
      isCommercial: false,
      countryRegion: 'denmark',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setIsModalOpen(true);
  };

  const handleEdit = (rule: RoadsidePricingRule) => {
    setEditingRule({ ...rule });
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  const handleDelete = async (ruleId: string) => {
    if (!packageId) return;
    
    if (window.confirm('Er du sikker på, at du vil slette denne prisregel?')) {
      try {
        // I virkeligheden ville vi kalde et API endpoint her
        // Da vi ikke har dette endpoint, simulerer vi en sletning
        setPricingRules(pricingRules.filter(rule => rule.id !== ruleId));
        showTemporarySuccessMessage('Prisregel blev slettet');
      } catch (err) {
        setError('Fejl ved sletning af prisregel');
        console.error(err);
      }
    }
    setActiveDropdown(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editingRule) return;
    
    const { name, value } = e.target;
    let parsedValue: any = value;
    
    // Konverter numeriske værdier
    if (name === 'price' || 
        name === 'carAgeMonthsFrom' || 
        name === 'carAgeMonthsTo' || 
        name === 'mileageKmFrom' || 
        name === 'mileageKmTo') {
      parsedValue = value === '' ? null : Number(value);
    }
    
    setEditingRule({
      ...editingRule,
      [name]: parsedValue
    });
  };

  const handleSaveRule = async () => {
    if (!editingRule || !packageId) return;
    
    try {
      // I virkeligheden ville vi kalde et API endpoint her
      // Da vi ikke har disse endpoints, simulerer vi gemning/opdatering
      let savedRule: RoadsidePricingRule;
      if (editingRule.id) {
        // Opdater eksisterende regel lokalt
        savedRule = { ...editingRule, updatedAt: new Date().toISOString() };
        setPricingRules(pricingRules.map(rule => 
          rule.id === savedRule.id ? savedRule : rule
        ));
        showTemporarySuccessMessage('Prisregel blev opdateret');
      } else {
        // Opret ny regel lokalt
        savedRule = { 
          ...editingRule, 
          id: `rule-${packageId}-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString() 
        };
        setPricingRules([...pricingRules, savedRule]);
        showTemporarySuccessMessage('Ny prisregel blev oprettet');
      }
      
      setIsModalOpen(false);
      setEditingRule(null);
    } catch (err) {
      setError('Fejl ved gem af prisregel');
      console.error(err);
    }
  };

  const handleExportCSV = async () => {
    if (!packageId) return;
    
    try {
      // Simulerer eksport her, da vi ikke har denne metode implementeret
      // I virkeligheden ville dette kalde et API endpoint
      
      // Opret CSV-indhold baseret på prisreglerne
      const headers = ['ID', 'Beskrivelse', 'Pris', 'Biltype', 'Brændstof', 'Region'];
      const rows = pricingRules.map(rule => [
        rule.id,
        rule.description || '',
        rule.price.toString(),
        rule.vehicleCategory || '',
        rule.fuelType || '',
        rule.countryRegion || ''
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Opret en downloadbar blob
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Opret et midlertidigt link-element for at trigge download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `roadside-pricing-rules-${packageId}.csv`);
      link.click();
      
      showTemporarySuccessMessage('CSV-eksport er begyndt - filen downloades snart');
    } catch (err) {
      setError('Fejl ved eksport til CSV');
      console.error(err);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      // Simulerer download af CSV-skabelon
      const templateHeaders = ['Beskrivelse', 'Pris', 'BilalderFra', 'BilalderTil', 'Biltype', 'Brændstof', 'Region', 'Erhverv'];
      const templateRow = ['Eksempelpris', '100', '0', '120', 'personbil', 'benzin', 'denmark', 'nej'];
      
      const csvContent = [
        templateHeaders.join(','),
        templateRow.join(',')
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'roadside-pricing-rules-template.csv');
      link.click();
      
      showTemporarySuccessMessage('CSV-skabelon downloades');
    } catch (err) {
      setError('Fejl ved download af CSV-skabelon');
      console.error(err);
    }
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !packageId) {
      return;
    }
    
    setImportError(null);
    
    // Tjek filformat
    if (!file.name.endsWith('.csv')) {
      setImportError('Filen skal være i CSV-format');
      return;
    }
    
    // Tjek filstørrelse (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImportError('Filen er for stor (max 5MB)');
      return;
    }
    
    // Simuler import (i virkeligheden ville vi sende filen til et API endpoint)
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvContent = event.target?.result as string;
        if (!csvContent) {
          setImportError('Kunne ikke læse CSV-fil');
          return;
        }
        
        // Simpel CSV parser
        const lines = csvContent.split('\n');
        if (lines.length < 2) {
          setImportError('CSV-filen er tom eller har ikke de korrekte data');
          return;
        }
        
        // Parse CSV til nye prisregler
        const headers = lines[0].split(',');
        const newRules: RoadsidePricingRule[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',');
          if (values.length < 2) continue;
          
          newRules.push({
            id: `rule-${packageId}-import-${i}-${Date.now()}`,
            packageId: packageId,
            description: values[0] || '',
            price: parseInt(values[1]) || 0,
            carAgeMonthsFrom: parseInt(values[2]) || 0,
            carAgeMonthsTo: parseInt(values[3]) || undefined,
            vehicleCategory: values[4] || '',
            fuelType: values[5] || '',
            countryRegion: values[6] || 'denmark',
            isCommercial: values[7]?.toLowerCase() === 'ja' || values[7]?.toLowerCase() === 'yes',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
        
        // Opdater state med de nye regler
        setPricingRules([...pricingRules, ...newRules]);
        showTemporarySuccessMessage(`CSV-import gennemført: ${newRules.length} prisregler importeret`);
        
      } catch (err) {
        setImportError('Fejl ved import af CSV-fil');
        console.error(err);
      }
      
      // Nulstil fil-input
      if (fileImportRef) {
        fileImportRef.value = '';
      }
    };
    
    reader.onerror = () => {
      setImportError('Kunne ikke læse CSV-fil');
    };
    
    reader.readAsText(file);
  };

  const showTemporarySuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };
  
  const handleToggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const getVehicleCategoryLabel = (category: string | undefined): string => {
    if (!category) return 'Alle';
    
    const categories: {[key: string]: string} = {
      'small': 'Lille',
      'medium': 'Mellem',
      'large': 'Stor',
      'suv': 'SUV',
      'van': 'Varevogn'
    };
    
    return categories[category] || category;
  };

  const getFuelTypeLabel = (fuelType: string | undefined): string => {
    if (!fuelType) return 'Alle';
    
    const fuelTypes: {[key: string]: string} = {
      'petrol': 'Benzin',
      'diesel': 'Diesel',
      'electric': 'El',
      'hybrid': 'Hybrid',
      'plugin_hybrid': 'Plugin-hybrid'
    };
    
    return fuelTypes[fuelType] || fuelType;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/admin/roadside-packages')}
          className="text-blue-600 hover:text-blue-800 flex items-center mr-4"
        >
          <FaArrowLeft className="mr-1" /> Tilbage til vejhjælpspakker
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Prisregler for {packageDetails?.name || 'vejhjælpspakke'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      <div className="flex justify-between mb-6">
        <button
          onClick={handleAddNew}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FaPlus className="mr-2" /> Tilføj ny prisregel
        </button>
        
        <div className="flex space-x-2">
          <button
            onClick={handleExportCSV}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FaFileCsv className="mr-2" /> Eksporter til CSV
          </button>
          <button
            onClick={handleDownloadTemplate}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FaDownload className="mr-2" /> Download CSV-skabelon
          </button>
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleImportCSV}
              ref={setFileImportRef}
            />
            <button
              onClick={() => fileImportRef?.click()}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FaUpload className="mr-2" /> Importer fra CSV
            </button>
          </div>
        </div>
      </div>

      {importError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Import fejlede:</p>
          <p>{importError}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Indlæser prisregler...</p>
        </div>
      ) : pricingRules.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beskrivelse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pris
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bilalder (mdr)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Region
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Biltype/Brændstof
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Handlinger
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pricingRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {rule.description || 'Ingen beskrivelse'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {rule.price} kr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rule.carAgeMonthsFrom || 0} - {rule.carAgeMonthsTo === null ? 'Ubegrænset' : rule.carAgeMonthsTo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rule.countryRegion ? (
                      <span className="capitalize">
                        {rule.countryRegion === 'denmark' ? 'Danmark' : 
                         rule.countryRegion === 'nordic' ? 'Norden' : 
                         rule.countryRegion === 'europe' ? 'Europa' : rule.countryRegion}
                      </span>
                    ) : 'Alle regioner'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{getVehicleCategoryLabel(rule.vehicleCategory)}</div>
                    <div>{getFuelTypeLabel(rule.fuelType)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                    <div className="relative">
                      <button 
                        onClick={() => handleToggleDropdown(rule.id)}
                        className="text-gray-600 hover:text-gray-900 p-1"
                      >
                        <FaEllipsisV size={16} />
                      </button>
                      
                      {activeDropdown === rule.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
                          <button
                            onClick={() => handleEdit(rule)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <FaEdit className="inline-block mr-2" /> Rediger Prisregel
                          </button>
                          
                          <button
                            onClick={() => handleDelete(rule.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-red-600"
                          >
                            <FaTrash className="inline-block mr-2" /> Slet Prisregel
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
          <p className="text-gray-600">Ingen prisregler fundet for denne vejhjælpspakke</p>
          <button
            onClick={handleAddNew}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-flex items-center"
          >
            <FaPlus className="mr-2" /> Tilføj den første prisregel
          </button>
        </div>
      )}

      {/* Modal til redigering/oprettelse af prisregel */}
      {isModalOpen && editingRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {editingRule.id ? 'Rediger prisregel' : 'Tilføj ny prisregel'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beskrivelse
                </label>
                <input
                  type="text"
                  name="description"
                  value={editingRule.description || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="F.eks. Standard pris for nyere biler"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pris (kr)
                </label>
                <input
                  type="number"
                  name="price"
                  value={editingRule.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="1"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bilalder (måneder)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    name="carAgeMonthsFrom"
                    value={editingRule.carAgeMonthsFrom || 0}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    placeholder="Fra"
                  />
                  <span>til</span>
                  <input
                    type="number"
                    name="carAgeMonthsTo"
                    value={editingRule.carAgeMonthsTo === null ? '' : editingRule.carAgeMonthsTo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    placeholder="Til (tom = ingen grænse)"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Region
                </label>
                <select
                  name="countryRegion"
                  value={editingRule.countryRegion || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="denmark">Danmark</option>
                  <option value="nordic">Norden</option>
                  <option value="europe">Europa</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biltype
                </label>
                <select
                  name="vehicleCategory"
                  value={editingRule.vehicleCategory || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Alle</option>
                  <option value="small">Lille</option>
                  <option value="medium">Mellem</option>
                  <option value="large">Stor</option>
                  <option value="suv">SUV</option>
                  <option value="van">Varevogn</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brændstoftype
                </label>
                <select
                  name="fuelType"
                  value={editingRule.fuelType || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Alle</option>
                  <option value="petrol">Benzin</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">El</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="plugin_hybrid">Plugin-hybrid</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Erhvervsbrug
                </label>
                <select
                  name="isCommercial"
                  value={editingRule.isCommercial ? 'true' : 'false'}
                  onChange={(e) => {
                    if (!editingRule) return;
                    setEditingRule({
                      ...editingRule,
                      isCommercial: e.target.value === 'true'
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="false">Nej</option>
                  <option value="true">Ja</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuller
              </button>
              <button
                onClick={handleSaveRule}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Gem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadsidePricingRulesAdminPage;
