import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaLink, FaCog } from 'react-icons/fa';
import warrantyService, { 
  WarrantyProvider, 
  WarrantyPackage
} from '../../services/WarrantyService';
import WarrantyPricingRules from './WarrantyPricingRules';

const WarrantyManagement: React.FC = () => {
  // States for providers and packages
  const [providers, setProviders] = useState<WarrantyProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [packages, setPackages] = useState<WarrantyPackage[]>([]);
  
  // States for editing
  const [editingProvider, setEditingProvider] = useState<WarrantyProvider | null>(null);
  const [editingPackage, setEditingPackage] = useState<WarrantyPackage | null>(null);
  const [newProvider, setNewProvider] = useState<boolean>(false);
  const [newPackage, setNewPackage] = useState<boolean>(false);
  
  // State for pricing rules
  const [showPricingRules, setShowPricingRules] = useState<boolean>(false);
  const [selectedPackageForPricing, setSelectedPackageForPricing] = useState<{id: string, name: string} | null>(null);

  // Loading and error states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch providers on component mount
  useEffect(() => {
    fetchProviders();
  }, []);
  
  // Fetch packages when a provider is selected
  useEffect(() => {
    if (selectedProvider) {
      fetchPackages(selectedProvider);
    } else {
      setPackages([]);
    }
  }, [selectedProvider]);
  
  // Fetch warranty providers
  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      // For demo purposes, we use mock data
      const fetchedProviders = warrantyService.getMockWarrantyProviders();
      setProviders(fetchedProviders);
      // Select first provider if available
      if (fetchedProviders.length > 0 && !selectedProvider) {
        setSelectedProvider(fetchedProviders[0].id);
      }
    } catch (err) {
      console.error('Error fetching warranty providers:', err);
      setError('Der opstod en fejl ved hentning af garantiudbydere.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch warranty packages for a specific provider
  const fetchPackages = async (providerId: string) => {
    try {
      setLoading(true);
      setError(null);
      // For demo purposes, we use mock data
      const fetchedPackages = warrantyService.getMockWarrantyPackages(providerId);
      setPackages(fetchedPackages);
    } catch (err) {
      console.error('Error fetching warranty packages:', err);
      setError('Der opstod en fejl ved hentning af garantipakker.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle provider selection
  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    setEditingProvider(null);
    setEditingPackage(null);
    setNewProvider(false);
    setNewPackage(false);
  };
  
  // Start editing a provider
  const handleEditProvider = (provider: WarrantyProvider) => {
    setEditingProvider({ ...provider });
    setEditingPackage(null);
    setNewProvider(false);
    setNewPackage(false);
  };
  
  // Start creating a new provider
  const handleNewProvider = () => {
    setEditingProvider({
      id: '',
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      internalNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setNewProvider(true);
    setEditingPackage(null);
    setNewPackage(false);
  };
  
  // Save provider changes
  const handleSaveProvider = async () => {
    try {
      if (!editingProvider) return;
      
      setLoading(true);
      setError(null);
      
      // For demo purposes, we're just updating the local state
      // In a real application, you would make an API call
      if (newProvider) {
        // Generate a simple ID for demo
        const newProviderId = `provider-${Date.now()}`;
        const newProviderObj = {
          ...editingProvider,
          id: newProviderId
        };
        
        setProviders([...providers, newProviderObj]);
        setSelectedProvider(newProviderId);
      } else {
        // Update existing provider
        const updatedProviders = providers.map(p => 
          p.id === editingProvider.id ? { ...editingProvider } : p
        );
        setProviders(updatedProviders);
      }
      
      setEditingProvider(null);
      setNewProvider(false);
    } catch (err) {
      console.error('Error saving provider:', err);
      setError('Der opstod en fejl ved gemning af garantiudbyder.');
    } finally {
      setLoading(false);
    }
  };
  
  // Cancel provider editing
  const handleCancelProviderEdit = () => {
    setEditingProvider(null);
    setNewProvider(false);
  };
  
  // Handle provider field changes
  const handleProviderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingProvider) return;
    
    const { name, value } = e.target;
    setEditingProvider({
      ...editingProvider,
      [name]: value,
      updatedAt: new Date().toISOString()
    });
  };
  
  // Start editing a package
  const handleEditPackage = (pkg: WarrantyPackage) => {
    setEditingPackage({ ...pkg });
    setEditingProvider(null);
    setNewProvider(false);
    setNewPackage(false);
  };
  
  // Start creating a new package
  const handleNewPackage = () => {
    if (!selectedProvider) return;
    
    setEditingPackage({
      id: '',
      providerId: selectedProvider,
      name: '',
      status: 'active',
      keyCoverages: [],
      termsUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setNewPackage(true);
    setEditingProvider(null);
    setNewProvider(false);
  };
  
  // Save package changes
  const handleSavePackage = async () => {
    try {
      if (!editingPackage) return;
      
      setLoading(true);
      setError(null);
      
      // For demo purposes, we're just updating the local state
      // In a real application, you would make an API call
      if (newPackage) {
        // Generate a simple ID for demo
        const newPackageId = `package-${Date.now()}`;
        const newPackageObj = {
          ...editingPackage,
          id: newPackageId
        };
        
        setPackages([...packages, newPackageObj]);
      } else {
        // Update existing package
        const updatedPackages = packages.map(p => 
          p.id === editingPackage.id ? { ...editingPackage } : p
        );
        setPackages(updatedPackages);
      }
      
      setEditingPackage(null);
      setNewPackage(false);
    } catch (err) {
      console.error('Error saving package:', err);
      setError('Der opstod en fejl ved gemning af garantipakke.');
    } finally {
      setLoading(false);
    }
  };
  
  // Cancel package editing
  const handleCancelPackageEdit = () => {
    setEditingPackage(null);
    setNewPackage(false);
  };
  
  // Open pricing rules for a package
  const handleOpenPricingRules = (pkg: WarrantyPackage) => {
    setSelectedPackageForPricing({
      id: pkg.id,
      name: pkg.name
    });
    setShowPricingRules(true);
  };
  
  // Close pricing rules modal
  const handleClosePricingRules = () => {
    setShowPricingRules(false);
    setSelectedPackageForPricing(null);
  };
  
  // Handle package field changes
  const handlePackageChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editingPackage) return;
    
    const { name, value } = e.target;
    
    if (name === 'keyCoverages') {
      // Split by comma and trim each item
      const coverages = value.split(',').map(item => item.trim()).filter(item => item);
      setEditingPackage({
        ...editingPackage,
        keyCoverages: coverages,
        updatedAt: new Date().toISOString()
      });
    } else {
      setEditingPackage({
        ...editingPackage,
        [name]: value,
        updatedAt: new Date().toISOString()
      });
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Administrer Garantiudbydere og Pakker</h2>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Providers List */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-700">Garantiudbydere</h3>
            <button
              onClick={handleNewProvider}
              className="px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm"
            >
              <FaPlus className="mr-1" /> Ny udbyder
            </button>
          </div>
          
          <div className="space-y-2">
            {providers.map(provider => (
              <div 
                key={provider.id}
                className={`p-3 rounded-md cursor-pointer flex justify-between items-center ${
                  selectedProvider === provider.id ? 'bg-blue-100 border border-blue-300' : 'bg-white border border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => handleProviderSelect(provider.id)}
              >
                <div>
                  <h4 className="font-medium">{provider.name}</h4>
                  {provider.contactPerson && (
                    <p className="text-sm text-gray-600">{provider.contactPerson}</p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditProvider(provider);
                  }}
                  className="p-1 text-gray-500 hover:text-blue-600"
                >
                  <FaEdit />
                </button>
              </div>
            ))}
            
            {providers.length === 0 && !loading && (
              <p className="text-center text-gray-500 py-4">Ingen udbydere fundet</p>
            )}
            
            {loading && (
              <p className="text-center text-gray-500 py-4">Indlæser...</p>
            )}
          </div>
        </div>
        
        {/* Provider Edit Form */}
        {editingProvider && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-700">
                {newProvider ? 'Opret Udbyder' : 'Rediger Udbyder'}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveProvider}
                  className="px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-sm"
                  disabled={loading}
                >
                  <FaSave className="mr-1" /> Gem
                </button>
                <button
                  onClick={handleCancelProviderEdit}
                  className="px-2 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center text-sm"
                >
                  <FaTimes className="mr-1" /> Annuller
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Navn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editingProvider.name}
                  onChange={handleProviderChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">
                  Kontaktperson
                </label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  value={editingProvider.contactPerson || ''}
                  onChange={handleProviderChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={editingProvider.email || ''}
                  onChange={handleProviderChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={editingProvider.phone || ''}
                  onChange={handleProviderChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="internalNotes" className="block text-sm font-medium text-gray-700 mb-1">
                  Interne noter
                </label>
                <textarea
                  id="internalNotes"
                  name="internalNotes"
                  rows={3}
                  value={editingProvider.internalNotes || ''}
                  onChange={handleProviderChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Packages Section */}
        {selectedProvider && !editingProvider && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-700">
                Garantipakker
                {providers.find(p => p.id === selectedProvider)?.name && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({providers.find(p => p.id === selectedProvider)?.name})
                  </span>
                )}
              </h3>
              <button
                onClick={handleNewPackage}
                className="px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm"
              >
                <FaPlus className="mr-1" /> Ny pakke
              </button>
            </div>
            
            {/* Package Edit Form */}
            {editingPackage && (
              <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-blue-800">
                    {newPackage ? 'Opret Garantipakke' : 'Rediger Garantipakke'}
                  </h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSavePackage}
                      className="px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-sm"
                      disabled={loading}
                    >
                      <FaSave className="mr-1" /> Gem
                    </button>
                    <button
                      onClick={handleCancelPackageEdit}
                      className="px-2 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center text-sm"
                    >
                      <FaTimes className="mr-1" /> Annuller
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pkgName" className="block text-sm font-medium text-gray-700 mb-1">
                      Pakkenavn <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="pkgName"
                      name="name"
                      value={editingPackage.name}
                      onChange={handlePackageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={editingPackage.status}
                      onChange={handlePackageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="active">Aktiv</option>
                      <option value="inactive">Inaktiv</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="keyCoverages" className="block text-sm font-medium text-gray-700 mb-1">
                      Dækningsområder (kommasepareret)
                    </label>
                    <input
                      type="text"
                      id="keyCoverages"
                      name="keyCoverages"
                      value={editingPackage.keyCoverages?.join(', ') || ''}
                      onChange={handlePackageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="F.eks.: Motor, Gearkasse, Kobling, Elektronik"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="termsUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center">
                        <FaLink className="mr-1 text-blue-500" />
                        Link til forsikringsbetingelser
                      </div>
                    </label>
                    <input
                      type="url"
                      id="termsUrl"
                      name="termsUrl"
                      value={editingPackage.termsUrl || ''}
                      onChange={handlePackageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="https://example.com/betingelser.pdf"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Angiv fuld URL til forsikringsbetingelserne. Dette vil blive vist til brugeren som "Se fulde forsikringsbetingelser".
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Packages List */}
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Navn</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Betingelser</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Handlinger</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {packages.map(pkg => (
                    <tr key={pkg.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{pkg.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          pkg.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {pkg.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {pkg.termsUrl ? (
                          <a 
                            href={pkg.termsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                          >
                            <FaLink className="mr-1" /> Vis
                          </a>
                        ) : (
                          <span className="text-gray-400">Ikke angivet</span>
                        )}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => handleOpenPricingRules(pkg)}
                          className="text-amber-600 hover:text-amber-900 mr-2"
                          title="Administrer prisregler"
                        >
                          <FaCog />
                        </button>
                        <button
                          onClick={() => handleEditPackage(pkg)}
                          className="text-blue-600 hover:text-blue-900 mr-2"
                          title="Redigér pakke"
                        >
                          <FaEdit />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {packages.length === 0 && !loading && (
                <div className="text-center py-4 text-gray-500">
                  Ingen pakker fundet for denne udbyder
                </div>
              )}
              
              {loading && (
                <div className="text-center py-4 text-gray-500">
                  Indlæser...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Pricing Rules Modal */}
      {showPricingRules && selectedPackageForPricing && (
        <WarrantyPricingRules
          packageId={selectedPackageForPricing.id}
          packageName={selectedPackageForPricing.name}
          onClose={handleClosePricingRules}
        />
      )}
    </div>
  );
};

export default WarrantyManagement;
