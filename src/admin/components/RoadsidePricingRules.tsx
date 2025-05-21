import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaFileImport, FaFileExport, FaCarSide } from 'react-icons/fa';
import { roadsideAssistanceService } from '../../services/RoadsideAssistanceService';

interface RoadsidePricingRulesProps {
  packageId: string;
  packageName: string;
  onClose: () => void;
}

interface RoadsidePricingRule {
  id: string;
  packageId: string;
  description: string;
  price: number;
  carAgeMonthsFrom: number;
  carAgeMonthsTo: number;
  mileageKmFrom: number;
  mileageKmTo: number;
  vehicleCategory: string;
  duration: number; // Duration in months
  createdAt?: string;
  updatedAt?: string;
}

const RoadsidePricingRules: React.FC<RoadsidePricingRulesProps> = ({ packageId, packageName, onClose }) => {
  // Pricing rules for the selected package
  const [pricingRules, setPricingRules] = useState<RoadsidePricingRule[]>([]);
  
  // State for editing/adding a rule
  const [editingRule, setEditingRule] = useState<RoadsidePricingRule | null>(null);
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
        const mockRules: RoadsidePricingRule[] = [
          {
            id: 'rule-1',
            packageId: packageId,
            description: 'Standard vejhjælp (0-3 år, 0-60.000 km)',
            price: 950,
            carAgeMonthsFrom: 0,
            carAgeMonthsTo: 36,
            mileageKmFrom: 0,
            mileageKmTo: 60000,
            vehicleCategory: 'personbil',
            duration: 12,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'rule-2',
            packageId: packageId,
            description: 'Standard vejhjælp (3-6 år, 60.000-120.000 km)',
            price: 1250,
            carAgeMonthsFrom: 36,
            carAgeMonthsTo: 72,
            mileageKmFrom: 60000,
            mileageKmTo: 120000,
            vehicleCategory: 'personbil',
            duration: 12,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'rule-3',
            packageId: packageId,
            description: 'Premium vejhjælp (0-3 år, 0-60.000 km)',
            price: 1450,
            carAgeMonthsFrom: 0,
            carAgeMonthsTo: 36,
            mileageKmFrom: 0,
            mileageKmTo: 60000,
            vehicleCategory: 'personbil',
            duration: 24,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'rule-4',
            packageId: packageId,
            description: 'Premium vejhjælp (3-6 år, 60.000-120.000 km)',
            price: 1950,
            carAgeMonthsFrom: 36,
            carAgeMonthsTo: 72,
            mileageKmFrom: 60000,
            mileageKmTo: 120000,
            vehicleCategory: 'personbil',
            duration: 24,
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
  const handleEditRule = (rule: RoadsidePricingRule) => {
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
      duration: 12,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setIsAddingRule(true);
  };
  
  // Save rule changes
  const handleSaveRule = () => {
    if (!editingRule) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // For demo purposes, we're just updating the local state
      // In a real application, you would make an API call
      if (isAddingRule) {
        // Generate a simple ID for demo
        const newRule = {
          ...editingRule,
          id: `rule-${Date.now()}`
        };
        setPricingRules([...pricingRules, newRule]);
      } else {
        // Update existing rule
        setPricingRules(pricingRules.map(rule => 
          rule.id === editingRule.id ? editingRule : rule
        ));
      }
      
      // Clear editing state
      setEditingRule(null);
      setIsAddingRule(false);
    } catch (err) {
      console.error('Error saving pricing rule:', err);
      setError('Der opstod en fejl ved gem af prisregel.');
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
    
    setEditingRule(prev => {
      if (!prev) return prev;
      
      // Handle numeric values
      if (
        name === 'price' || 
        name === 'carAgeMonthsFrom' || 
        name === 'carAgeMonthsTo' || 
        name === 'mileageKmFrom' || 
        name === 'mileageKmTo' || 
        name === 'duration'
      ) {
        return {
          ...prev,
          [name]: Number(value)
        };
      }
      
      // Handle string values
      return {
        ...prev,
        [name]: value
      };
    });
  };
  
  // Delete a rule
  const handleDeleteRule = (ruleId: string) => {
    if (window.confirm('Er du sikker på, at du vil slette denne prisregel?')) {
      setPricingRules(pricingRules.filter(rule => rule.id !== ruleId));
    }
  };
  
  // Import CSV (mockup for demo)
  const handleImportCSV = () => {
    alert('CSV import funktionalitet vil blive implementeret i produktionsversionen.');
  };
  
  // Export CSV (mockup for demo)
  const handleExportCSV = () => {
    alert('CSV eksport funktionalitet vil blive implementeret i produktionsversionen.');
  };
  
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <FaCarSide className="mr-2" />
            Prisregler for {packageName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={24} />
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between mb-4">
          <div>
            <button
              onClick={handleAddRule}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
              disabled={!!editingRule}
            >
              <FaPlus className="mr-2" />
              Tilføj ny prisregel
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleImportCSV}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md flex items-center"
              disabled={!!editingRule}
            >
              <FaFileImport className="mr-2" />
              Importér CSV
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md flex items-center"
              disabled={!!editingRule}
            >
              <FaFileExport className="mr-2" />
              Eksportér CSV
            </button>
          </div>
        </div>
        
        {/* Rule editing form */}
        {editingRule && (
          <div className="bg-gray-50 p-4 mb-4 border border-gray-300 rounded-md">
            <h3 className="text-lg font-medium mb-4">
              {isAddingRule ? 'Tilføj ny prisregel' : 'Redigér prisregel'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beskrivelse
                </label>
                <input
                  type="text"
                  name="description"
                  value={editingRule.description}
                  onChange={handleRuleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pris pr. år (DKK)
                </label>
                <input
                  type="number"
                  name="price"
                  value={editingRule.price}
                  onChange={handleRuleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min={0}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Indtast årlig pris. Systemet omregner automatisk til pris pr. måned ud fra aftalens varighed.
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bilalder fra (måneder)
                </label>
                <input
                  type="number"
                  name="carAgeMonthsFrom"
                  value={editingRule.carAgeMonthsFrom}
                  onChange={handleRuleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bilalder til (måneder)
                </label>
                <input
                  type="number"
                  name="carAgeMonthsTo"
                  value={editingRule.carAgeMonthsTo}
                  onChange={handleRuleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kilometertal fra
                </label>
                <input
                  type="number"
                  name="mileageKmFrom"
                  value={editingRule.mileageKmFrom}
                  onChange={handleRuleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kilometertal til
                </label>
                <input
                  type="number"
                  name="mileageKmTo"
                  value={editingRule.mileageKmTo}
                  onChange={handleRuleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Køretøjstype
                </label>
                <select
                  name="vehicleCategory"
                  value={editingRule.vehicleCategory}
                  onChange={handleRuleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="personbil">Personbil</option>
                  <option value="varebil">Varebil</option>
                  <option value="motorcykel">Motorcykel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Varighed (måneder)
                </label>
                <select
                  name="duration"
                  value={editingRule.duration}
                  onChange={handleRuleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="12">12 måneder</option>
                  <option value="24">24 måneder</option>
                  <option value="36">36 måneder</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleSaveRule}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center"
              >
                <FaSave className="mr-2" />
                Gem
              </button>
              <button
                onClick={handleCancelRuleEdit}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md flex items-center"
              >
                <FaTimes className="mr-2" />
                Annuller
              </button>
            </div>
          </div>
        )}
        
        {/* Rules table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Beskrivelse</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Pris</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Bilalder (mdr)</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Km</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Varighed</th>
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
                    {rule.carAgeMonthsFrom}-{rule.carAgeMonthsTo}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    {rule.mileageKmFrom?.toLocaleString('da-DK')}-{rule.mileageKmTo?.toLocaleString('da-DK')}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    {rule.duration} mdr
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
              Ingen prisregler fundet for denne vejhjælpspakke
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

export default RoadsidePricingRules;
