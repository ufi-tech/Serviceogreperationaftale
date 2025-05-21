import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { WarrantyPricingRule } from '../services/WarrantyService';

// Udvid WarrantyPricingRule med hestekræfter til el-biler
interface ExtendedWarrantyPricingRule extends WarrantyPricingRule {
  enginePowerHpFrom?: number;
  enginePowerHpTo?: number;
}

interface EditWarrantyRuleModalProps {
  isOpen: boolean;
  rule: WarrantyPricingRule | null;
  onClose: () => void;
  onSave: (rule: WarrantyPricingRule) => void;
}

const EditWarrantyRuleModal: React.FC<EditWarrantyRuleModalProps> = ({ 
  isOpen, 
  rule, 
  onClose, 
  onSave 
}) => {
  const [editedRule, setEditedRule] = useState<ExtendedWarrantyPricingRule | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (rule) {
      // Opret den udvidede regel med default værdier
      const extendedRule: ExtendedWarrantyPricingRule = { 
        ...rule,
        // Sæt el som standardvalg, hvis der ikke allerede er valgt
        fuelType: rule.fuelType || 'el',
        // Initialiser hestekræfter til undefined, hvis de ikke allerede er sat
        enginePowerHpFrom: undefined,
        enginePowerHpTo: undefined 
      };
      setEditedRule(extendedRule);
    }
  }, [rule]);

  if (!isOpen || !editedRule) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Håndter numeriske værdier
    if (['price', 'carAgeMonthsFrom', 'carAgeMonthsTo', 'mileageKmFrom', 'mileageKmTo', 
         'engineSizeCcmFrom', 'engineSizeCcmTo', 'enginePowerHpFrom', 'enginePowerHpTo'].includes(name)) {
      const numValue = value === '' ? undefined : Number(value);
      setEditedRule(prev => prev ? { ...prev, [name]: numValue } : null);
    } else {
      // Håndter tekst værdier
      setEditedRule(prev => prev ? { ...prev, [name]: value === '' ? undefined : value } : null);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validér påkrævede felter
    if (!editedRule.price) {
      newErrors.price = 'Pris er påkrævet';
    }
    
    // Validér, at "fra" er mindre end "til" for intervaller
    if (editedRule.carAgeMonthsFrom !== undefined && 
        editedRule.carAgeMonthsTo !== undefined && 
        editedRule.carAgeMonthsFrom > editedRule.carAgeMonthsTo) {
      newErrors.carAgeMonthsFrom = 'Fra-værdi skal være mindre end eller lig med til-værdi';
    }
    
    if (editedRule.mileageKmFrom !== undefined && 
        editedRule.mileageKmTo !== undefined && 
        editedRule.mileageKmFrom > editedRule.mileageKmTo) {
      newErrors.mileageKmFrom = 'Fra-værdi skal være mindre end eller lig med til-værdi';
    }
    
    // Validér motorstørrelse eller hestekræfter, afhængigt af brændstoftype
    if (editedRule.fuelType === 'el') {
      if (editedRule.enginePowerHpFrom !== undefined && 
          editedRule.enginePowerHpTo !== undefined && 
          editedRule.enginePowerHpFrom > editedRule.enginePowerHpTo) {
        newErrors.enginePowerHpFrom = 'Fra-værdi skal være mindre end eller lig med til-værdi';
      }
    } else {
      if (editedRule.engineSizeCcmFrom !== undefined && 
          editedRule.engineSizeCcmTo !== undefined && 
          editedRule.engineSizeCcmFrom > editedRule.engineSizeCcmTo) {
        newErrors.engineSizeCcmFrom = 'Fra-værdi skal være mindre end eller lig med til-værdi';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Konverter vores udvidede regel tilbage til en standard WarrantyPricingRule
      // og fjern eventuelle enginePowerHp felter
      const { enginePowerHpFrom, enginePowerHpTo, ...standardRule } = editedRule;
      
      // Hvis det er en el-bil, kopier hestekræfter til motorstørrelse-felterne
      // så vi kan bruge de eksisterende felter i backend
      const finalRule: WarrantyPricingRule = {
        ...standardRule,
        updatedAt: new Date().toISOString()
      };
      
      // Hvis det er en el-bil, brug hestekræfter som motorstørrelse i databasen
      if (editedRule.fuelType === 'el') {
        finalRule.engineSizeCcmFrom = enginePowerHpFrom;
        finalRule.engineSizeCcmTo = enginePowerHpTo;
      }
      
      onSave(finalRule);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {editedRule.id ? 'Redigér garantiprisregel' : 'Tilføj garantiprisregel'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Beskrivelse */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beskrivelse
              </label>
              <textarea 
                name="description"
                value={editedRule.description || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={2}
              />
            </div>

            {/* Pris */}
            <div className={errors.price ? "relative" : ""}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pris (DKK) <span className="text-red-500">*</span>
              </label>
              <input 
                type="number"
                name="price"
                value={editedRule.price || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                required
              />
              {errors.price && (
                <p className="absolute text-sm text-red-500">{errors.price}</p>
              )}
            </div>

            {/* Bilalder interval */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bilalder (måneder)
              </label>
              <div className="flex space-x-4">
                <div className={`w-1/2 ${errors.carAgeMonthsFrom ? "relative" : ""}`}>
                  <input 
                    type="number"
                    name="carAgeMonthsFrom"
                    value={editedRule.carAgeMonthsFrom === undefined ? '' : editedRule.carAgeMonthsFrom}
                    onChange={handleInputChange}
                    placeholder="Fra"
                    className={`w-full px-3 py-2 border ${errors.carAgeMonthsFrom ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.carAgeMonthsFrom && (
                    <p className="absolute text-sm text-red-500">{errors.carAgeMonthsFrom}</p>
                  )}
                </div>
                <div className="w-1/2">
                  <input 
                    type="number"
                    name="carAgeMonthsTo"
                    value={editedRule.carAgeMonthsTo === undefined ? '' : editedRule.carAgeMonthsTo}
                    onChange={handleInputChange}
                    placeholder="Til"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Kilometertal interval */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kilometertal
              </label>
              <div className="flex space-x-4">
                <div className={`w-1/2 ${errors.mileageKmFrom ? "relative" : ""}`}>
                  <input 
                    type="number"
                    name="mileageKmFrom"
                    value={editedRule.mileageKmFrom === undefined ? '' : editedRule.mileageKmFrom}
                    onChange={handleInputChange}
                    placeholder="Fra"
                    className={`w-full px-3 py-2 border ${errors.mileageKmFrom ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.mileageKmFrom && (
                    <p className="absolute text-sm text-red-500">{errors.mileageKmFrom}</p>
                  )}
                </div>
                <div className="w-1/2">
                  <input 
                    type="number"
                    name="mileageKmTo"
                    value={editedRule.mileageKmTo === undefined ? '' : editedRule.mileageKmTo}
                    onChange={handleInputChange}
                    placeholder="Til"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Motorstørrelse eller Hestekræfter interval - vises dynamisk baseret på brændstoftype */}
            <div className="col-span-2">
              {editedRule.fuelType === 'el' ? (
                /* Vis Antal hk for el-biler */
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Antal hk
                  </label>
                  <div className="flex space-x-4">
                    <div className={`w-1/2 ${errors.enginePowerHpFrom ? "relative" : ""}`}>
                      <input 
                        type="number"
                        name="enginePowerHpFrom"
                        value={editedRule.enginePowerHpFrom === undefined ? '' : editedRule.enginePowerHpFrom}
                        onChange={handleInputChange}
                        placeholder="Fra"
                        className={`w-full px-3 py-2 border ${errors.enginePowerHpFrom ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {errors.enginePowerHpFrom && (
                        <p className="absolute text-sm text-red-500">{errors.enginePowerHpFrom}</p>
                      )}
                    </div>
                    <div className="w-1/2">
                      <input 
                        type="number"
                        name="enginePowerHpTo"
                        value={editedRule.enginePowerHpTo === undefined ? '' : editedRule.enginePowerHpTo}
                        onChange={handleInputChange}
                        placeholder="Til"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Vis Motorstørrelse (ccm) for fossile brændstoffer og hybrid */
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motorstørrelse (ccm)
                  </label>
                  <div className="flex space-x-4">
                    <div className={`w-1/2 ${errors.engineSizeCcmFrom ? "relative" : ""}`}>
                      <input 
                        type="number"
                        name="engineSizeCcmFrom"
                        value={editedRule.engineSizeCcmFrom === undefined ? '' : editedRule.engineSizeCcmFrom}
                        onChange={handleInputChange}
                        placeholder="Fra"
                        className={`w-full px-3 py-2 border ${errors.engineSizeCcmFrom ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {errors.engineSizeCcmFrom && (
                        <p className="absolute text-sm text-red-500">{errors.engineSizeCcmFrom}</p>
                      )}
                    </div>
                    <div className="w-1/2">
                      <input 
                        type="number"
                        name="engineSizeCcmTo"
                        value={editedRule.engineSizeCcmTo === undefined ? '' : editedRule.engineSizeCcmTo}
                        onChange={handleInputChange}
                        placeholder="Til"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Køretøjskategori */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Køretøjskategori
              </label>
              <select
                name="vehicleCategory"
                value={editedRule.vehicleCategory || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Alle kategorier</option>
                <option value="personbil">Personbil</option>
                <option value="varebil">Varebil</option>
                <option value="suv">SUV</option>
              </select>
            </div>

            {/* Brændstoftype */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brændstoftype
              </label>
              <select
                name="fuelType"
                value={editedRule.fuelType || 'el'}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="el">El</option>
                <option value="benzin">Benzin</option>
                <option value="diesel">Diesel</option>
                <option value="hybrid">Hybrid</option>
                <option value="plugin-hybrid">Plugin-hybrid</option>
                <option value="">Alle typer</option>
              </select>
            </div>
          </div>

          {/* Knapper */}
          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Annuller
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Gem
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWarrantyRuleModal;
