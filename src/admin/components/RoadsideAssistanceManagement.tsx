import React, { useState, useEffect } from 'react';
import { FaCarSide, FaSpinner, FaExclamationTriangle, FaInfoCircle, FaUser, FaEnvelope, FaPhone, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaCog, FaLink } from 'react-icons/fa';
import { roadsideAssistanceService, RoadsidePackage } from '../../services/RoadsideAssistanceService';
import RoadsidePricingRules from './RoadsidePricingRules';

interface RoadsideProvider {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  internalNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface NewProviderFormData {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  internalNotes: string;
}

const RoadsideAssistanceManagement: React.FC = () => {
  console.log('RoadsideAssistanceManagement komponent indlæst!');
  
  // State for providers
  const [providers, setProviders] = useState<RoadsideProvider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // CRUD state for providers
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null);
  const [formData, setFormData] = useState<NewProviderFormData>({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    internalNotes: ''
  });
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  
  // Package state
  const [packages, setPackages] = useState<RoadsidePackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [packageError, setPackageError] = useState<string | null>(null);
  
  // State for pricing rules
  const [showPricingRules, setShowPricingRules] = useState<boolean>(false);
  const [selectedPackageForPricing, setSelectedPackageForPricing] = useState<{id: string, name: string} | null>(null);
  
  // Fetch providers on component mount
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedProviders = await roadsideAssistanceService.getMockRoadsideProviders();
        setProviders(fetchedProviders);
        
        // Select first provider if available and none selected
        if (fetchedProviders.length > 0 && !selectedProviderId) {
          setSelectedProviderId(fetchedProviders[0].id);
        }
      } catch (err) {
        console.error('Error fetching providers:', err);
        setError('Der opstod en fejl ved hentning af vejhjælpsudbydere.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProviders();
  }, []);
  
  // Fetch packages when a provider is selected
  useEffect(() => {
    const fetchPackages = async () => {
      if (!selectedProviderId) {
        setPackages([]);
        return;
      }
      
      try {
        setLoadingPackages(true);
        setPackageError(null);
        const fetchedPackages = await roadsideAssistanceService.getMockRoadsidePackages(selectedProviderId);
        setPackages(fetchedPackages);
      } catch (err) {
        console.error('Error fetching packages:', err);
        setPackageError('Der opstod en fejl ved hentning af vejhjælpspakker.');
      } finally {
        setLoadingPackages(false);
      }
    };
    
    fetchPackages();
  }, [selectedProviderId]);

  // Handle provider selection
  const handleSelectProvider = (providerId: string) => {
    if (editingProviderId || showAddForm) return; // Disable selection while editing/adding
    setSelectedProviderId(providerId === selectedProviderId ? null : providerId);
  };
  
  // Find the selected provider
  const selectedProvider = providers.find(p => p.id === selectedProviderId);
  
  // Form handling
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset form and UI state
  const resetForm = () => {
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      internalNotes: ''
    });
    setShowAddForm(false);
    setEditingProviderId(null);
    setDeleteConfirmationId(null);
  };

  // Show success message temporarily
  const showTemporarySuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // Add new provider
  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would be an API call
      // For now, simulate adding with a unique ID
      const newProvider: RoadsideProvider = {
        ...formData,
        id: `provider-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // In a real implementation, this would be an API call
      // await roadsideAssistanceService.addProvider(newProvider);
      
      // Update state with new provider
      setProviders([...providers, newProvider]);
      resetForm();
      showTemporarySuccessMessage('Vejhjælpsudbyder tilføjet!');
    } catch (err) {
      console.error('Error adding provider:', err);
      setError('Der opstod en fejl ved tilføjelse af vejhjælpsudbyder.');
    } finally {
      setLoading(false);
    }
  };

  // Start editing a provider
  const handleStartEdit = (provider: RoadsideProvider) => {
    setEditingProviderId(provider.id);
    setFormData({
      name: provider.name,
      contactPerson: provider.contactPerson || '',
      email: provider.email || '',
      phone: provider.phone || '',
      internalNotes: provider.internalNotes || ''
    });
  };

  // Save edited provider
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProviderId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get the updated provider
      const updatedProvider: RoadsideProvider = {
        ...providers.find(p => p.id === editingProviderId)!,
        ...formData,
        updatedAt: new Date().toISOString()
      };
      
      // In a real implementation, this would be an API call
      // await roadsideAssistanceService.updateProvider(editingProviderId, updatedProvider);
      
      // Update state
      setProviders(providers.map(p => 
        p.id === editingProviderId ? updatedProvider : p
      ));
      
      resetForm();
      showTemporarySuccessMessage('Vejhjælpsudbyder opdateret!');
    } catch (err) {
      console.error('Error updating provider:', err);
      setError('Der opstod en fejl ved opdatering af vejhjælpsudbyder.');
    } finally {
      setLoading(false);
    }
  };

  // Delete provider
  const handleDeleteProvider = async (providerId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, this would be an API call
      // await roadsideAssistanceService.deleteProvider(providerId);
      
      // Update state
      setProviders(providers.filter(p => p.id !== providerId));
      if (selectedProviderId === providerId) {
        setSelectedProviderId(null);
      }
      
      setDeleteConfirmationId(null);
      showTemporarySuccessMessage('Vejhjælpsudbyder slettet!');
    } catch (err) {
      console.error('Error deleting provider:', err);
      setError('Der opstod en fejl ved sletning af vejhjælpsudbyder.');
    } finally {
      setLoading(false);
    }
  };
  
  // Open pricing rules for a package
  const handleOpenPricingRules = (pkg: RoadsidePackage) => {
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
  
  return (
    <div className="roadside-assistance-management">
      <h2 className="section-title flex items-center text-xl font-bold mb-4">
        <FaCarSide className="mr-2" />
        Vejhjælpsudbydere Administration
      </h2>
      
      {/* Success message */}
      {successMessage && (
        <div className="success-message bg-green-50 border-l-4 border-green-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="error-message bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <FaExclamationTriangle className="text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <div className="loading-spinner flex items-center justify-center p-4">
          <FaSpinner className="animate-spin mr-2 text-blue-500" />
          <span>Indlæser...</span>
        </div>
      )}

      {/* Add provider button */}
      {!showAddForm && !editingProviderId && (
        <button
          onClick={() => setShowAddForm(true)}
          className="mb-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded flex items-center"
        >
          <FaPlus className="mr-2" />
          Tilføj ny vejhjælpsudbyder
        </button>
      )}
      
      {/* Add/Edit Provider Form */}
      {(showAddForm || editingProviderId) && (
        <div className="provider-form bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="text-lg font-medium mb-4">
            {editingProviderId ? 'Rediger vejhjælpsudbyder' : 'Tilføj ny vejhjælpsudbyder'}
          </h3>
          
          <form onSubmit={editingProviderId ? handleSaveEdit : handleAddProvider}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Navn *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="internalNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Interne noter
              </label>
              <textarea
                id="internalNotes"
                name="internalNotes"
                value={formData.internalNotes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded flex items-center"
                disabled={loading}
              >
                <FaSave className="mr-2" />
                {editingProviderId ? 'Gem ændringer' : 'Tilføj udbyder'}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded flex items-center"
              >
                <FaTimes className="mr-2" />
                Annuller
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Providers List */}
      <div className="providers-section bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Vejhjælpsudbydere</h3>
        
        <div className="providers-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.length === 0 && !loading && (
            <p className="no-data-message col-span-full flex items-center text-gray-500">
              <FaInfoCircle className="mr-2" />
              Ingen vejhjælpsudbydere fundet. Tilføj den første udbyder.
            </p>
          )}
          
          {providers.map(provider => (
            <div 
              key={provider.id}
              className={`provider-card border rounded-lg p-4 ${provider.id === selectedProviderId ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="provider-name font-medium">{provider.name}</h4>
                
                {/* Action buttons */}
                {!editingProviderId && !showAddForm && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(provider);
                      }}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FaEdit />
                    </button>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmationId(provider.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Provider details */}
              <div className="provider-details cursor-pointer" onClick={() => handleSelectProvider(provider.id)}>
                {provider.contactPerson && (
                  <div className="provider-detail flex items-center text-sm text-gray-600">
                    <FaUser className="mr-2 text-gray-400" />
                    <span>{provider.contactPerson}</span>
                  </div>
                )}
                
                {provider.email && (
                  <div className="provider-detail flex items-center text-sm text-gray-600">
                    <FaEnvelope className="mr-2 text-gray-400" />
                    <span>{provider.email}</span>
                  </div>
                )}
                
                {provider.phone && (
                  <div className="provider-detail flex items-center text-sm text-gray-600">
                    <FaPhone className="mr-2 text-gray-400" />
                    <span>{provider.phone}</span>
                  </div>
                )}
              </div>
              
              {/* Delete confirmation */}
              {deleteConfirmationId === provider.id && (
                <div className="delete-confirmation mt-2 p-2 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-600 mb-2">Er du sikker på, at du vil slette denne udbyder?</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProvider(provider.id);
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded"
                    >
                      Ja, slet
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmationId(null);
                      }}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 text-xs py-1 px-2 rounded"
                    >
                      Annuller
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Provider Details */}
      {selectedProvider && !editingProviderId && !showAddForm && (
        <div className="selected-provider-details mt-6 bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Detaljer for {selectedProvider.name}</h3>
          
          <div className="provider-info-card grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="info-row">
              <strong className="block text-sm font-medium text-gray-500">Kontaktperson:</strong>
              <span className="text-gray-900">{selectedProvider.contactPerson || 'Ikke angivet'}</span>
            </div>
            
            <div className="info-row">
              <strong className="block text-sm font-medium text-gray-500">Email:</strong>
              <span className="text-gray-900">{selectedProvider.email || 'Ikke angivet'}</span>
            </div>
            
            <div className="info-row">
              <strong className="block text-sm font-medium text-gray-500">Telefon:</strong>
              <span className="text-gray-900">{selectedProvider.phone || 'Ikke angivet'}</span>
            </div>
            
            <div className="info-row">
              <strong className="block text-sm font-medium text-gray-500">Oprettet:</strong>
              <span className="text-gray-900">
                {selectedProvider.createdAt 
                  ? new Date(selectedProvider.createdAt).toLocaleDateString('da-DK') 
                  : 'Ikke angivet'}
              </span>
            </div>
            
            <div className="info-row md:col-span-2">
              <strong className="block text-sm font-medium text-gray-500">Interne Noter:</strong>
              <p className="text-gray-900 mt-1">{selectedProvider.internalNotes || 'Ingen noter'}</p>
            </div>
          </div>
          
          {/* Packages for the provider */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Vejhjælpspakker</h3>
            </div>
            
            {packageError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <div className="flex">
                  <FaExclamationTriangle className="text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{packageError}</p>
                  </div>
                </div>
              </div>
            )}
            
            {loadingPackages ? (
              <div className="flex justify-center p-4">
                <FaSpinner className="animate-spin text-blue-500" />
              </div>
            ) : packages.length > 0 ? (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Navn</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Pris</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Dækning</th>
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
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pkg.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {pkg.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK' }).format(pkg.price)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {pkg.coverage.slice(0, 2).join(', ')}
                          {pkg.coverage.length > 2 && '...'}
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 bg-gray-50 rounded">
                <p>Ingen vejhjælpspakker fundet for denne udbyder</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Pricing Rules Modal */}
      {showPricingRules && selectedPackageForPricing && (
        <RoadsidePricingRules
          packageId={selectedPackageForPricing.id}
          packageName={selectedPackageForPricing.name}
          onClose={handleClosePricingRules}
        />
      )}
    </div>
  );
};

export default RoadsideAssistanceManagement;
