import React, { useState, useEffect } from 'react';
import { FaFileUpload, FaFileDownload, FaInfoCircle, FaCheck, FaTimes, FaTrash, FaEdit, FaPlus, FaExclamationTriangle } from 'react-icons/fa';
import EditWarrantyRuleModal from './EditWarrantyRuleModal';
import warrantyService, { WarrantyProvider, WarrantyPackage, WarrantyPricingRule } from '../services/WarrantyService';
import warrantyCsvService, { ValidationError } from '../services/WarrantyCsvService';

const AdminGarantiPrisregler: React.FC = () => {
  const [providers, setProviders] = useState<WarrantyProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [packages, setPackages] = useState<WarrantyPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [pricingRules, setPricingRules] = useState<WarrantyPricingRule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewRules, setPreviewRules] = useState<WarrantyPricingRule[]>([]);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [currentRule, setCurrentRule] = useState<WarrantyPricingRule | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);
  
  // Opretter en ny prisregel
  const createNewRule = (): WarrantyPricingRule => {
    const newId = `temp-${Date.now()}`; // Midlertidigt ID, ville normalt genereres af backend
    return {
      id: newId,
      packageId: selectedPackage,
      description: '',
      price: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  // Åbner redigeringsmodal for en eksisterende regel
  const handleEditRule = (rule: WarrantyPricingRule) => {
    setCurrentRule(rule);
    setEditModalOpen(true);
  };

  // Åbner redigeringsmodal for en ny regel
  const handleAddRule = () => {
    if (!selectedPackage) {
      setError('Vælg venligst en garantipakke først');
      return;
    }
    setCurrentRule(createNewRule());
    setEditModalOpen(true);
  };

  // Gemmer ændringer til en regel
  const handleSaveRule = (updatedRule: WarrantyPricingRule) => {
    // Hvis reglen har et midlertidigt ID, tilføjer vi den som ny
    const isNewRule = updatedRule.id.startsWith('temp-');
    
    if (isNewRule) {
      setPricingRules([...pricingRules, updatedRule]);
      setSuccess('Ny prisregel oprettet.');
    } else {
      // Ellers opdaterer vi den eksisterende regel
      const updatedRules = pricingRules.map(rule => 
        rule.id === updatedRule.id ? updatedRule : rule
      );
      setPricingRules(updatedRules);
      setSuccess('Prisregel opdateret.');
    }
    
    setEditModalOpen(false);
    setCurrentRule(null);
  };

  // Åbner bekræftelsesdialog for sletning
  const handleDeleteConfirm = (ruleId: string) => {
    setRuleToDelete(ruleId);
    setConfirmModalOpen(true);
  };

  // Sletter en regel efter bekræftelse
  const confirmDelete = () => {
    if (ruleToDelete) {
      const filteredRules = pricingRules.filter(rule => rule.id !== ruleToDelete);
      setPricingRules(filteredRules);
      setSuccess('Prisregel slettet.');
      setConfirmModalOpen(false);
      setRuleToDelete(null);
    }
  };

  // Annullerer sletning
  const cancelDelete = () => {
    setConfirmModalOpen(false);
    setRuleToDelete(null);
  };

  // Hent garantiudbydere ved komponentindlæsning
  useEffect(() => {
    const loadProviders = async () => {
      setIsLoading(true);
      try {
        // Brug mock-data under udvikling
        const data = warrantyService.getMockWarrantyProviders();
        setProviders(data);
      } catch (error) {
        setError('Fejl ved indlæsning af garantiudbydere');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProviders();
  }, []);
  
  // Hent garantipakker når en udbyder vælges
  useEffect(() => {
    if (!selectedProvider) {
      setPackages([]);
      setSelectedPackage('');
      return;
    }
    
    const loadPackages = async () => {
      setIsLoading(true);
      try {
        // Brug mock-data under udvikling
        const data = warrantyService.getMockWarrantyPackages(selectedProvider);
        setPackages(data);
      } catch (error) {
        setError('Fejl ved indlæsning af garantipakker');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPackages();
  }, [selectedProvider]);
  
  // Nulstil fejl og succes-beskeder når komponenten ændres
  const resetMessages = () => {
    setError(null);
    setSuccess(null);
    setValidationErrors([]);
  };
  
  // Håndter fil-upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    resetMessages();
    
    if (!selectedPackage) {
      setError('Vælg venligst en garantipakke først');
      return;
    }
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    try {
      // Læs CSV-indholdet
      const csvContent = await warrantyCsvService.readCsvFile(file);
      
      // Parse og valider CSV-indholdet
      const { rules, errors } = warrantyCsvService.parseAndValidateWarrantyRulesCsv(csvContent);
      
      if (errors.length > 0) {
        setValidationErrors(errors);
        setError(`CSV-filen indeholder ${errors.length} fejl. Ret venligst fejlene og prøv igen.`);
        return;
      }
      
      // Kontroller at alle regler har korrekt package_id
      const invalidPackageRules = rules.filter(rule => rule.packageId !== selectedPackage);
      if (invalidPackageRules.length > 0) {
        setError(`${invalidPackageRules.length} regler har forkert package_id. Alle regler skal have package_id = "${selectedPackage}".`);
        return;
      }
      
      // Vis forhåndsvisning af reglerne
      setPreviewRules(rules);
      setShowPreview(true);
      setSuccess(`${rules.length} prisregler fundet. Gennemgå og godkend import.`);
    } catch (error) {
      setError(`Fejl ved håndtering af CSV-fil: ${(error as Error).message}`);
      console.error(error);
    } finally {
      setIsLoading(false);
      
      // Nulstil fil-input
      if (e.target.value) e.target.value = '';
    }
  };
  
  // Godkend import af prisregler
  const confirmImport = () => {
    // I en rigtig implementation ville vi gemme disse regler i en database
    // For nu gemmer vi dem bare i komponentens tilstand
    setPricingRules(previewRules);
    setSuccess(`${previewRules.length} prisregler blev importeret.`);
    setShowPreview(false);
    setPreviewRules([]);
  };
  
  // Annuller import af prisregler
  const cancelImport = () => {
    setShowPreview(false);
    setPreviewRules([]);
  };
  
  // Eksporter prisregler til CSV
  const handleExport = () => {
    if (pricingRules.length === 0) {
      setError('Ingen prisregler at eksportere.');
      return;
    }
    
    try {
      // Konverter prisregler til CSV-format
      const csvContent = warrantyCsvService.convertWarrantyRulesToCsv(pricingRules);
      
      // Download filen
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `garanti-prisregler-${selectedPackage}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setSuccess('Prisreglerne blev eksporteret til CSV-fil.');
    } catch (error) {
      setError(`Fejl ved eksport af prisregler: ${(error as Error).message}`);
      console.error(error);
    }
  };
  
  // Hjælpetekst med CSV-format
  const getHelpText = () => {
    return (
      <div>
        <h4 className="font-medium">CSV format for garantiprisregler:</h4>
        <pre className="bg-gray-100 p-2 mt-1 rounded text-xs overflow-x-auto">
          package_id,description,price,car_age_months_from,car_age_months_to,mileage_km_from,mileage_km_to,engine_size_ccm_from,engine_size_ccm_to,vehicle_category,fuel_type<br/>
          1,Standard garanti for nyere biler,5000,0,36,0,60000,0,3000,personbil,benzin<br/>
          1,Standard garanti for nyere biler,5500,0,36,0,60000,0,3000,personbil,diesel<br/>
          1,Standard garanti for ældre biler,7500,37,84,0,100000,0,3000,personbil,benzin
        </pre>
        <p className="mt-2 text-sm">
          <strong>Bemærk:</strong> Alle regler skal have samme package_id, som matcher den valgte garantipakke.
        </p>
        <ul className="mt-2 text-sm list-disc list-inside">
          <li><strong>package_id:</strong> Garantipakkens ID (påkrævet)</li>
          <li><strong>description:</strong> Beskrivelse af prisreglen</li>
          <li><strong>price:</strong> Pris i DKK (påkrævet)</li>
          <li><strong>car_age_months_from/to:</strong> Bilens alder i måneder (interval)</li>
          <li><strong>mileage_km_from/to:</strong> Kilometertal (interval)</li>
          <li><strong>engine_size_ccm_from/to:</strong> Motorstørrelse i ccm (interval)</li>
          <li><strong>vehicle_category:</strong> Køretøjskategori (f.eks. personbil, varebil)</li>
          <li><strong>fuel_type:</strong> Brændstoftype (f.eks. benzin, diesel, el)</li>
        </ul>
      </div>
    );
  };
  
  // Rendering af CSV-upload sektion
  const renderCsvUpload = () => {
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Import/Eksport af Garantiprisregler</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Vælg garantiudbyder</label>
          <select
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={selectedProvider}
            onChange={(e) => {
              setSelectedProvider(e.target.value);
              resetMessages();
            }}
          >
            <option value="">Vælg udbyder</option>
            {providers.map(provider => (
              <option key={provider.id} value={provider.id}>{provider.name}</option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Vælg garantipakke</label>
          <select
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={selectedPackage}
            onChange={(e) => {
              setSelectedPackage(e.target.value);
              resetMessages();
            }}
            disabled={!selectedProvider || packages.length === 0}
          >
            <option value="">Vælg pakke</option>
            {packages.map(pkg => (
              <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-wrap gap-4 mt-6">
          <div>
            <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
              tabIndex={selectedPackage ? 0 : -1}
              style={{ opacity: selectedPackage ? 1 : 0.5 }}
            >
              <FaFileUpload className="mr-2" />
              Importer CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="sr-only"
                disabled={!selectedPackage}
              />
            </label>
          </div>
          
          <div>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!selectedPackage || pricingRules.length === 0}
            >
              <FaFileDownload className="mr-2" />
              Eksporter CSV
            </button>
          </div>
          
          <div>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FaInfoCircle className="mr-2" />
              {showHelp ? 'Skjul hjælp' : 'Vis CSV format'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mt-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded mt-4">
            {success}
          </div>
        )}
        
        {validationErrors.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-red-700">Valideringsfejl:</h4>
            <table className="mt-2 min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Række</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kolonne</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fejl</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Værdi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {validationErrors.map((error, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{error.row}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{error.column}</td>
                    <td className="px-4 py-2 text-sm">{error.message}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-mono">{error.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {showHelp && (
          <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded">
            {getHelpText()}
          </div>
        )}
      </div>
    );
  };
  
  // Rendering af forhåndsvisning af prisregler, der skal importeres
  const renderPreview = () => {
    if (!showPreview || previewRules.length === 0) return null;
    
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-700">Forhåndsvisning af import</h3>
          <div className="flex gap-2">
            <button
              onClick={confirmImport}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              <FaCheck className="mr-2" />
              Godkend import
            </button>
            <button
              onClick={cancelImport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FaTimes className="mr-2" />
              Annuller
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beskrivelse</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pris</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bil alder (mdr)</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kilometertal</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motorstr. (ccm)</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Køretøj</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brændstof</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {previewRules.map((rule, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-2 py-2 text-sm">{rule.description || '-'}</td>
                  <td className="px-2 py-2 text-sm">{rule.price} kr</td>
                  <td className="px-2 py-2 text-sm">
                    {rule.carAgeMonthsFrom !== undefined && rule.carAgeMonthsTo !== undefined 
                      ? `${rule.carAgeMonthsFrom} - ${rule.carAgeMonthsTo}` 
                      : rule.carAgeMonthsFrom !== undefined 
                        ? `Fra ${rule.carAgeMonthsFrom}` 
                        : rule.carAgeMonthsTo !== undefined 
                          ? `Til ${rule.carAgeMonthsTo}` 
                          : 'Alle'}
                  </td>
                  <td className="px-2 py-2 text-sm">
                    {rule.mileageKmFrom !== undefined && rule.mileageKmTo !== undefined 
                      ? `${rule.mileageKmFrom} - ${rule.mileageKmTo}` 
                      : rule.mileageKmFrom !== undefined 
                        ? `Fra ${rule.mileageKmFrom}` 
                        : rule.mileageKmTo !== undefined 
                          ? `Til ${rule.mileageKmTo}` 
                          : 'Alle'}
                  </td>
                  <td className="px-2 py-2 text-sm">
                    {rule.engineSizeCcmFrom !== undefined && rule.engineSizeCcmTo !== undefined 
                      ? `${rule.engineSizeCcmFrom} - ${rule.engineSizeCcmTo}` 
                      : rule.engineSizeCcmFrom !== undefined 
                        ? `Fra ${rule.engineSizeCcmFrom}` 
                        : rule.engineSizeCcmTo !== undefined 
                          ? `Til ${rule.engineSizeCcmTo}` 
                          : 'Alle'}
                  </td>
                  <td className="px-2 py-2 text-sm">{rule.vehicleCategory || 'Alle'}</td>
                  <td className="px-2 py-2 text-sm">{rule.fuelType || 'Alle'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Rendering af eksisterende prisregler
  const renderPricingRules = () => {
    if (pricingRules.length === 0) {
      if (selectedPackage) {
        return (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="text-gray-400 mb-4">
                <FaExclamationTriangle size={48} />
              </div>
              <p className="text-gray-600 mb-4">Der er endnu ingen prisregler oprettet for denne garantipakke.</p>
              <button
                onClick={handleAddRule}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <FaPlus className="mr-2" />
                Tilføj første prisregel
              </button>
            </div>
          </div>
        );
      }
      return null;
    }
    
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-700">Eksisterende prisregler</h3>
          <button
            onClick={handleAddRule}
            disabled={!selectedPackage}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <FaPlus className="mr-1" />
            Ny regel
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beskrivelse</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pris</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bil alder (mdr)</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kilometertal</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motorstr. (ccm)</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Køretøj</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brændstof</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Handlinger</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pricingRules.map((rule, index) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-2 py-2 text-sm">{rule.description || '-'}</td>
                  <td className="px-2 py-2 text-sm">{rule.price} kr</td>
                  <td className="px-2 py-2 text-sm">
                    {rule.carAgeMonthsFrom !== undefined && rule.carAgeMonthsTo !== undefined 
                      ? `${rule.carAgeMonthsFrom} - ${rule.carAgeMonthsTo}` 
                      : rule.carAgeMonthsFrom !== undefined 
                        ? `Fra ${rule.carAgeMonthsFrom}` 
                        : rule.carAgeMonthsTo !== undefined 
                          ? `Til ${rule.carAgeMonthsTo}` 
                          : 'Alle'}
                  </td>
                  <td className="px-2 py-2 text-sm">
                    {rule.mileageKmFrom !== undefined && rule.mileageKmTo !== undefined 
                      ? `${rule.mileageKmFrom} - ${rule.mileageKmTo}` 
                      : rule.mileageKmFrom !== undefined 
                        ? `Fra ${rule.mileageKmFrom}` 
                        : rule.mileageKmTo !== undefined 
                          ? `Til ${rule.mileageKmTo}` 
                          : 'Alle'}
                  </td>
                  <td className="px-2 py-2 text-sm">
                    {rule.engineSizeCcmFrom !== undefined && rule.engineSizeCcmTo !== undefined 
                      ? `${rule.engineSizeCcmFrom} - ${rule.engineSizeCcmTo}` 
                      : rule.engineSizeCcmFrom !== undefined 
                        ? `Fra ${rule.engineSizeCcmFrom}` 
                        : rule.engineSizeCcmTo !== undefined 
                          ? `Til ${rule.engineSizeCcmTo}` 
                          : 'Alle'}
                  </td>
                  <td className="px-2 py-2 text-sm">{rule.vehicleCategory || 'Alle'}</td>
                  <td className="px-2 py-2 text-sm">{rule.fuelType || 'Alle'}</td>
                  <td className="px-2 py-2 text-sm">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditRule(rule)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEdit title="Redigér" />
                      </button>
                      <button 
                        onClick={() => handleDeleteConfirm(rule.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash title="Slet" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Rendering af bekræftelsesdialog for sletning
  const renderDeleteConfirmModal = () => {
    if (!confirmModalOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Bekræft sletning</h3>
          <p className="text-gray-600 mb-6">Er du sikker på, at du vil slette denne prisregel? Denne handling kan ikke fortrydes.</p>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={cancelDelete}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Annuller
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Slet
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="max-w-full p-4">
      <h2 className="text-xl font-semibold mb-6">Administration af Garantiprisregler</h2>
      
      {isLoading && (
        <div className="flex justify-center items-center p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      )}
      
      {!isLoading && (
        <>
          {renderCsvUpload()}
          {renderPreview()}
          {renderPricingRules()}
          {renderDeleteConfirmModal()}
          <EditWarrantyRuleModal 
            isOpen={editModalOpen}
            rule={currentRule}
            onClose={() => {
              setEditModalOpen(false);
              setCurrentRule(null);
            }}
            onSave={handleSaveRule}
          />
        </>
      )}
    </div>
  );
};

export default AdminGarantiPrisregler;
