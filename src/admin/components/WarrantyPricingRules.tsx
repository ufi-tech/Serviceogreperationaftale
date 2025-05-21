import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaFileImport, FaFileExport, FaBolt } from 'react-icons/fa';
import warrantyService, { WarrantyPackage, WarrantyPricingRule } from '../../services/WarrantyService';

interface WarrantyPricingRulesProps {
  packageId: string;
  packageName: string;
  onClose: () => void;
}

// Default fuelType er el eftersom beregner primært er til elbiler
const DEFAULT_FUEL_TYPE = 'el';

const WarrantyPricingRules: React.FC<WarrantyPricingRulesProps> = ({ packageId, packageName, onClose }) => {
  // Pricing rules for the selected package
  const [pricingRules, setPricingRules] = useState<WarrantyPricingRule[]>([]);
  
  // State for editing/adding a rule
  const [editingRule, setEditingRule] = useState<WarrantyPricingRule | null>(null);
  const [isAddingRule, setIsAddingRule] = useState<boolean>(false);

  // Loading and error states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch pricing rules for the selected package
  useEffect(() => {
    const fetchPricingRules = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // For demo purposes, we use mock data
        // In a real application, you would fetch this from the API
        const mockRules: WarrantyPricingRule[] = [
          {
            id: 'rule-1',
            packageId: packageId,
            description: 'Standard elbilsgaranti 0-3 år, 0-60.000 km',
            price: 4500,
            carAgeMonthsFrom: 0,
            carAgeMonthsTo: 36,
            mileageKmFrom: 0,
            mileageKmTo: 60000,
            vehicleCategory: 'personbil',
            fuelType: 'el',
            motorEffectHpFrom: 100,
            motorEffectHpTo: 300,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'rule-2',
            packageId: packageId,
            description: 'Udvidet elbilsgaranti 3-5 år, 60.000-100.000 km',
            price: 6500,
            carAgeMonthsFrom: 36,
            carAgeMonthsTo: 60,
            mileageKmFrom: 60000,
            mileageKmTo: 100000,
            vehicleCategory: 'personbil',
            fuelType: 'el',
            motorEffectHpFrom: 100,
            motorEffectHpTo: 300,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'rule-3',
            packageId: packageId,
            description: 'Performance elbilsgaranti 0-3 år, 0-60.000 km',
            price: 7500,
            carAgeMonthsFrom: 0,
            carAgeMonthsTo: 36,
            mileageKmFrom: 0,
            mileageKmTo: 60000,
            vehicleCategory: 'personbil',
            fuelType: 'el',
            motorEffectHpFrom: 300,
            motorEffectHpTo: 800,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'rule-4',
            packageId: packageId,
            description: 'Benzinbilsgaranti 0-3 år, 0-60.000 km',
            price: 3800,
            carAgeMonthsFrom: 0,
            carAgeMonthsTo: 36,
            mileageKmFrom: 0,
            mileageKmTo: 60000,
            engineSizeCcmFrom: 1000,
            engineSizeCcmTo: 2000,
            vehicleCategory: 'personbil',
            fuelType: 'benzin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        
        setPricingRules(mockRules);
      } catch (err) {
        console.error('Error fetching pricing rules:', err);
        setError('Der opstod en fejl ved hentning af prisregler.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPricingRules();
  }, [packageId]);
  
  // Start editing a rule
  const handleEditRule = (rule: WarrantyPricingRule) => {
    setEditingRule({ ...rule });
    setIsAddingRule(false);
  };
  
  // Start adding a new rule
  const handleAddRule = () => {
    setEditingRule({
      id: '',
      packageId: packageId,
      description: '',
      price: 0,
      carAgeMonthsFrom: 0,
      carAgeMonthsTo: 60,
      mileageKmFrom: 0,
      mileageKmTo: 100000,
      vehicleCategory: 'personbil',
      fuelType: DEFAULT_FUEL_TYPE, // Default er el
      motorEffectHpFrom: 100, // For elbiler
      motorEffectHpTo: 500, // For elbiler
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setIsAddingRule(true);
  };
  
  // Save rule changes
  const handleSaveRule = async () => {
    try {
      if (!editingRule) return;
      
      setLoading(true);
      setError(null);
      
      // For demo purposes, we're just updating the local state
      // In a real application, you would make an API call
      if (isAddingRule) {
        // Generate a simple ID for demo
        const newRuleId = `rule-${Date.now()}`;
        const newRuleObj = {
          ...editingRule,
          id: newRuleId
        };
        
        setPricingRules([...pricingRules, newRuleObj]);
      } else {
        // Update existing rule
        const updatedRules = pricingRules.map(rule => 
          rule.id === editingRule.id ? { ...editingRule } : rule
        );
        setPricingRules(updatedRules);
      }
      
      setEditingRule(null);
      setIsAddingRule(false);
    } catch (err) {
      console.error('Error saving pricing rule:', err);
      setError('Der opstod en fejl ved gemning af prisregel.');
    } finally {
      setLoading(false);
    }
  };
  
  // Cancel rule editing
  const handleCancelRuleEdit = () => {
    setEditingRule(null);
    setIsAddingRule(false);
  };
  
  // Handle rule field changes
  const handleRuleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editingRule) return;
    
    const { name, value } = e.target;
    
    // Handle numeric fields
    if ([
      'price', 
      'carAgeMonthsFrom', 'carAgeMonthsTo', 
      'mileageKmFrom', 'mileageKmTo', 
      'engineSizeCcmFrom', 'engineSizeCcmTo',
      'motorEffectHpFrom', 'motorEffectHpTo'
    ].includes(name)) {
      setEditingRule({
        ...editingRule,
        [name]: Number(value),
        updatedAt: new Date().toISOString()
      });
    } else {
      setEditingRule({
        ...editingRule,
        [name]: value,
        updatedAt: new Date().toISOString()
      });
    }
  };
  
  // Delete a rule
  const handleDeleteRule = (ruleId: string) => {
    if (window.confirm('Er du sikker på, at du vil slette denne prisregel?')) {
      const updatedRules = pricingRules.filter(rule => rule.id !== ruleId);
      setPricingRules(updatedRules);
    }
  };
  
  // Import CSV (mockup for demo)
  const handleImportCSV = () => {
    alert('I en produktionsversion ville dette importere prisregler fra en CSV-fil.');
  };
  
  // Export CSV (mockup for demo)
  const handleExportCSV = () => {
    alert('I en produktionsversion ville dette eksportere prisregler til en CSV-fil.');
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-full max-w-5xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Prisregler for {packageName}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={handleImportCSV}
              className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-sm"
            >
              <FaFileImport className="mr-1" /> Importer CSV
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm"
            >
              <FaFileExport className="mr-1" /> Eksporter CSV
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center text-sm"
            >
              <FaTimes className="mr-1" /> Luk
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Add new rule button */}
        <div className="mb-4">
          <button
            onClick={handleAddRule}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <FaPlus className="mr-2" /> Tilføj ny prisregel
          </button>
        </div>
        
        {/* Rule editor */}
        {editingRule && (
          <div className="mb-8 p-4 border border-blue-200 rounded-lg bg-blue-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-blue-800">
                {isAddingRule ? 'Tilføj ny prisregel' : 'Rediger prisregel'}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveRule}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-sm"
                >
                  <FaSave className="mr-1" /> Gem
                </button>
                <button
                  onClick={handleCancelRuleEdit}
                  className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center text-sm"
                >
                  <FaTimes className="mr-1" /> Annuller
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Beskrivelse <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={editingRule.description || ''}
                  onChange={handleRuleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Pris (DKK) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={editingRule.price}
                  onChange={handleRuleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="vehicleCategory" className="block text-sm font-medium text-gray-700 mb-1">
                  Bilkategori
                </label>
                <select
                  id="vehicleCategory"
                  name="vehicleCategory"
                  value={editingRule.vehicleCategory || 'personbil'}
                  onChange={handleRuleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="personbil">Personbil</option>
                  <option value="varebil">Varebil</option>
                  <option value="suv">SUV</option>
                  <option value="premium">Premium/Luksus</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 mb-1">
                  Drivmiddel
                </label>
                <select
                  id="fuelType"
                  name="fuelType"
                  value={editingRule.fuelType || DEFAULT_FUEL_TYPE}
                  onChange={handleRuleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="el">El</option>
                  <option value="benzin">Benzin</option>
                  <option value="diesel">Diesel</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="plugin-hybrid">Plugin-hybrid</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="carAgeMonthsFrom" className="block text-sm font-medium text-gray-700 mb-1">
                  Alder fra (måneder)
                </label>
                <input
                  type="number"
                  id="carAgeMonthsFrom"
                  name="carAgeMonthsFrom"
                  value={editingRule.carAgeMonthsFrom || 0}
                  onChange={handleRuleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="carAgeMonthsTo" className="block text-sm font-medium text-gray-700 mb-1">
                  Alder til (måneder)
                </label>
                <input
                  type="number"
                  id="carAgeMonthsTo"
                  name="carAgeMonthsTo"
                  value={editingRule.carAgeMonthsTo || 0}
                  onChange={handleRuleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="mileageKmFrom" className="block text-sm font-medium text-gray-700 mb-1">
                  Km-stand fra
                </label>
                <input
                  type="number"
                  id="mileageKmFrom"
                  name="mileageKmFrom"
                  value={editingRule.mileageKmFrom || 0}
                  onChange={handleRuleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="mileageKmTo" className="block text-sm font-medium text-gray-700 mb-1">
                  Km-stand til
                </label>
                <input
                  type="number"
                  id="mileageKmTo"
                  name="mileageKmTo"
                  value={editingRule.mileageKmTo || 0}
                  onChange={handleRuleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            {/* Motoreffekt (HK) for elbiler eller Motorstørrelse (CCM) for fossildrevne biler */}
            <div className="mt-4">
              {editingRule.fuelType === 'el' || editingRule.fuelType === 'hybrid' || editingRule.fuelType === 'plugin-hybrid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="motorEffectHpFrom" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaBolt className="text-amber-500 mr-1" /> Motoreffekt fra (HK)
                    </label>
                    <input
                      type="number"
                      id="motorEffectHpFrom"
                      name="motorEffectHpFrom"
                      value={editingRule.motorEffectHpFrom || 0}
                      onChange={handleRuleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="motorEffectHpTo" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaBolt className="text-amber-500 mr-1" /> Motoreffekt til (HK)
                    </label>
                    <input
                      type="number"
                      id="motorEffectHpTo"
                      name="motorEffectHpTo"
                      value={editingRule.motorEffectHpTo || 0}
                      onChange={handleRuleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="engineSizeCcmFrom" className="block text-sm font-medium text-gray-700 mb-1">
                      Motorstørrelse fra (ccm)
                    </label>
                    <input
                      type="number"
                      id="engineSizeCcmFrom"
                      name="engineSizeCcmFrom"
                      value={editingRule.engineSizeCcmFrom || 0}
                      onChange={handleRuleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="engineSizeCcmTo" className="block text-sm font-medium text-gray-700 mb-1">
                      Motorstørrelse til (ccm)
                    </label>
                    <input
                      type="number"
                      id="engineSizeCcmTo"
                      name="engineSizeCcmTo"
                      value={editingRule.engineSizeCcmTo || 0}
                      onChange={handleRuleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Pricing rules table */}
<p className="text-xs text-gray-500 mb-2">
  Alle priser er årlige. Systemet omregner automatisk til månedspris i aftalemodulet.
</p>
<div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Beskrivelse</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Pris (årligt)</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Drivmiddel</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Alder (mdr)</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Km</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Motor</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Handlinger</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pricingRules.map(rule => (
                <tr key={rule.id}>
                  <td className="px-3 py-4 text-sm text-gray-900">
                    {rule.description}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 font-medium">
                    {new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK' }).format(rule.price)}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      rule.fuelType === 'el' ? 'bg-green-100 text-green-800' : 
                      rule.fuelType === 'hybrid' || rule.fuelType === 'plugin-hybrid' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {rule.fuelType === 'el' && <FaBolt className="mr-1" />}
                      {rule.fuelType === 'el' ? 'El' : 
                       rule.fuelType === 'benzin' ? 'Benzin' : 
                       rule.fuelType === 'diesel' ? 'Diesel' : 
                       rule.fuelType === 'hybrid' ? 'Hybrid' : 
                       rule.fuelType === 'plugin-hybrid' ? 'Plugin-hybrid' : rule.fuelType}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    {rule.carAgeMonthsFrom}-{rule.carAgeMonthsTo}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    {rule.mileageKmFrom?.toLocaleString('da-DK')}-{rule.mileageKmTo?.toLocaleString('da-DK')}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    {rule.fuelType === 'el' || rule.fuelType === 'hybrid' || rule.fuelType === 'plugin-hybrid' ? 
                      `${rule.motorEffectHpFrom}-${rule.motorEffectHpTo} HK` : 
                      `${rule.engineSizeCcmFrom}-${rule.engineSizeCcmTo} ccm`}
                  </td>
                  <td className="px-3 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditRule(rule)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {pricingRules.length === 0 && !loading && (
            <div className="text-center py-4 text-gray-500">
              Ingen prisregler fundet for denne garantipakke
            </div>
          )}
          
          {loading && (
            <div className="text-center py-4 text-gray-500">
              Indlæser...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WarrantyPricingRules;
