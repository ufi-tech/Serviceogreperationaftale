import React, { useState, useEffect } from 'react';
import TireCalculator, { 
  WeightCategory, 
  PowerCategory, 
  KmCategory,
  getWeightCategoryLabel,
  getPowerCategoryLabel,
  getKmCategoryLabel
} from '../../services/TireCalculator';
import { FaCalculator, FaCar, FaTachometerAlt, FaCog, FaSave, FaChartLine } from 'react-icons/fa';

interface TireFormData {
  weight: number;
  horsePower: number;
  annualKm: number;
  tireType: string;
  tireDiameter: number;
}

const TireCalculationConfig: React.FC = () => {
  const [formData, setFormData] = useState<TireFormData>({
    weight: 1500,
    horsePower: 150,
    annualKm: 20000,
    tireType: 'standard',
    tireDiameter: 17
  });
  
  const [result, setResult] = useState<any>(null);
  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(false);
  
  // Sæt standardværdier for demonstration
  useEffect(() => {
    calculateTireStatistics();
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Konverter til tal hvor nødvendigt
    const numValue = ['weight', 'horsePower', 'annualKm', 'tireDiameter'].includes(name) 
      ? parseInt(value, 10) 
      : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }));
  };
  
  const calculateTireStatistics = () => {
    const result = TireCalculator.calculateTireDurability(formData);
    setResult(result);
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Dæk Holdbarhed & Prisjustering
        </h3>
        <button
          onClick={() => setShowConfigPanel(!showConfigPanel)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <FaCog className="mr-2" /> {showConfigPanel ? 'Skjul konfiguration' : 'Vis konfiguration'}
        </button>
      </div>
      
      {showConfigPanel && (
        <div className="bg-gray-50 p-6 border-b border-gray-200">
          <h4 className="text-base font-medium text-gray-900 mb-4">Konfigurer beregningsmodellen</h4>
          <p className="text-sm text-gray-500 mb-4">
            Denne side er under udvikling. Den færdige version vil indeholde justerbare parametre for 
            hver af vægt-, effekt- og kørselskategorierne.
          </p>
        </div>
      )}
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input formular */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
              <FaCar className="mr-2 text-blue-500" /> Bilparametre
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Køreklar vægt (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                <div className="mt-1 text-xs text-gray-500">
                  {getWeightCategoryLabel(categorizeWeight(formData.weight))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motoreffekt (hk)
                </label>
                <input
                  type="number"
                  name="horsePower"
                  value={formData.horsePower}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                <div className="mt-1 text-xs text-gray-500">
                  {getPowerCategoryLabel(categorizePower(formData.horsePower))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forventet kørsel pr. år (km)
                </label>
                <input
                  type="number"
                  name="annualKm"
                  value={formData.annualKm}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                <div className="mt-1 text-xs text-gray-500">
                  {getKmCategoryLabel(categorizeAnnualKm(formData.annualKm))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dæktype
                </label>
                <select
                  name="tireType"
                  value={formData.tireType}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="budget">Budget</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dækdiameter (tommer)
                </label>
                <select
                  name="tireDiameter"
                  value={formData.tireDiameter}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  {[15, 16, 17, 18, 19, 20, 21, 22].map(size => (
                    <option key={size} value={size}>{size}"</option>
                  ))}
                </select>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={calculateTireStatistics}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FaCalculator className="mr-2" /> Beregn dækholdbarhed
                </button>
              </div>
            </div>
          </div>
          
          {/* Resultater */}
          {result && (
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                <FaChartLine className="mr-2 text-green-500" /> Beregningsresultater
              </h4>
              
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Forventet dæklevetid</h5>
                    <p className="text-2xl font-bold text-blue-700">
                      {result.estimatedLifespan.toLocaleString()} km
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Baseret på bil- og dækparametre
                    </p>
                  </div>
                  
                  <div className="pt-2 border-t border-blue-200">
                    <h5 className="text-sm font-medium text-gray-700">Anbefalet dækskiftsinterval</h5>
                    <p className="text-2xl font-bold text-blue-700">
                      {result.recommendedTireChange} måneder
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Baseret på årlig kørsel og estimeret levetid
                    </p>
                  </div>
                  
                  <div className="pt-2 border-t border-blue-200">
                    <h5 className="text-sm font-medium text-gray-700">Prisjustering</h5>
                    <p className={`text-2xl font-bold ${result.priceAdjustment >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {result.priceAdjustment >= 0 ? '+' : ''}{result.priceAdjustment}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Påvirkning på grundprisen for dækkene
                    </p>
                  </div>
                  
                  <div className="pt-2 border-t border-blue-200">
                    <h5 className="text-sm font-medium text-gray-700">Slidfaktor</h5>
                    <div className="flex items-center mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${(result.wearFactor/10)*100}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {result.wearFactor.toFixed(1)}/10
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Højere værdi = hurtigere dækslid
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Kategoriseringer</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Vægt:</span>
                    <span className="text-sm font-medium">{getWeightCategoryLabel(result.weightCategory)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Motoreffekt:</span>
                    <span className="text-sm font-medium">{getPowerCategoryLabel(result.powerCategory)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Årlig kørsel:</span>
                    <span className="text-sm font-medium">{getKmCategoryLabel(result.kmCategory)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Hjælpefunktioner til at vise kategori for eksempel-værdier i inputfelterne
function categorizeWeight(weight: number): WeightCategory {
  if (weight < 1300) return WeightCategory.LIGHT;
  if (weight <= 1800) return WeightCategory.MEDIUM;
  return WeightCategory.HEAVY;
}

function categorizePower(horsePower: number): PowerCategory {
  if (horsePower < 120) return PowerCategory.LOW;
  if (horsePower <= 200) return PowerCategory.MEDIUM;
  return PowerCategory.HIGH;
}

function categorizeAnnualKm(annualKm: number): KmCategory {
  if (annualKm < 15000) return KmCategory.LOW;
  if (annualKm <= 30000) return KmCategory.MEDIUM;
  return KmCategory.HIGH;
}

export default TireCalculationConfig;
