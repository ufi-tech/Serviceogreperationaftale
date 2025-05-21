import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaStar, FaRegStar, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { RoadsideAssistanceService, RoadsideProvider } from '../../services/RoadsideAssistanceService';

const roadsideService = new RoadsideAssistanceService();

const RoadsideProvidersAdminPage: React.FC = () => {
  const [providers, setProviders] = useState<RoadsideProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProvider, setEditingProvider] = useState<RoadsideProvider | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const data = await roadsideService.getAdminRoadsideProviders();
      setProviders(data);
      setError(null);
    } catch (err) {
      setError('Fejl ved indlæsning af vejhjælpsudbydere');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (provider: RoadsideProvider) => {
    try {
      const updatedProvider = await roadsideService.updateRoadsideProvider(
        provider.id,
        { active: !provider.active }
      );
      
      if (updatedProvider) {
        setProviders(providers.map(p => 
          p.id === provider.id ? { ...p, active: !p.active } : p
        ));
      }
    } catch (err) {
      setError('Fejl ved opdatering af udbyder status');
      console.error(err);
    }
  };

  const handleTogglePreferred = async (provider: RoadsideProvider) => {
    try {
      const updatedProvider = await roadsideService.updateRoadsideProvider(
        provider.id,
        { preferred: !provider.preferred }
      );
      
      if (updatedProvider) {
        setProviders(providers.map(p => 
          p.id === provider.id ? { ...p, preferred: !p.preferred } : p
        ));
      }
    } catch (err) {
      setError('Fejl ved opdatering af foretrukken status');
      console.error(err);
    }
  };

  const handleEdit = (provider: RoadsideProvider) => {
    setEditingProvider({ ...provider });
    setIsModalOpen(true);
  };

  const handleDelete = async (providerId: string) => {
    if (window.confirm('Er du sikker på, at du vil slette denne vejhjælpsudbyder?')) {
      try {
        const success = await roadsideService.deleteRoadsideProvider(providerId);
        if (success) {
          setProviders(providers.filter(p => p.id !== providerId));
        } else {
          setError('Kunne ikke slette vejhjælpsudbyder');
        }
      } catch (err) {
        setError('Fejl ved sletning af vejhjælpsudbyder');
        console.error(err);
      }
    }
  };

  const handleAddNew = () => {
    setEditingProvider({
      id: '',
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      active: true,
      preferred: false,
      logoUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setIsModalOpen(true);
  };

  const handleSaveProvider = async () => {
    if (!editingProvider) return;
    
    try {
      let savedProvider: RoadsideProvider | null;
      
      if (editingProvider.id) {
        // Opdater eksisterende udbyder
        savedProvider = await roadsideService.updateRoadsideProvider(
          editingProvider.id,
          editingProvider
        );
        
        if (savedProvider) {
          setProviders(providers.map(p => 
            p.id === editingProvider.id ? savedProvider as RoadsideProvider : p
          ));
        }
      } else {
        // Opret ny udbyder
        const { id, createdAt, updatedAt, ...newProviderData } = editingProvider;
        savedProvider = await roadsideService.createRoadsideProvider(newProviderData);
        
        if (savedProvider) {
          setProviders([...providers, savedProvider]);
        }
      }
      
      setIsModalOpen(false);
      setEditingProvider(null);
    } catch (err) {
      setError('Fejl ved gem af vejhjælpsudbyder');
      console.error(err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingProvider) return;
    
    const { name, value } = e.target;
    setEditingProvider({
      ...editingProvider,
      [name]: value
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingProvider) return;
    
    const { name, checked } = e.target;
    setEditingProvider({
      ...editingProvider,
      [name]: checked
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Administrer Vejhjælpsudbydere</h1>
        <button
          onClick={handleAddNew}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FaPlus className="mr-2" /> Tilføj ny udbyder
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Indlæser vejhjælpsudbydere...</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Udbyder
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kontaktperson
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kontakt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Foretrukken
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Handlinger
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {providers.map(provider => (
                <tr key={provider.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {provider.logoUrl && (
                        <img 
                          src={provider.logoUrl} 
                          alt={provider.name} 
                          className="h-10 w-10 rounded-full mr-3 object-contain bg-gray-100"
                        />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{provider.name}</div>
                        <div className="text-sm text-gray-500">ID: {provider.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {provider.contactPerson || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{provider.email || '-'}</div>
                    <div>{provider.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleToggleActive(provider)}
                      className={`flex items-center ${provider.active ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      {provider.active ? (
                        <>
                          <FaToggleOn size={20} className="mr-1" /> Aktiv
                        </>
                      ) : (
                        <>
                          <FaToggleOff size={20} className="mr-1" /> Inaktiv
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleTogglePreferred(provider)}
                      className={`flex items-center ${provider.preferred ? 'text-amber-500' : 'text-gray-400'}`}
                    >
                      {provider.preferred ? (
                        <>
                          <FaStar size={18} className="mr-1" /> Foretrukken
                        </>
                      ) : (
                        <>
                          <FaRegStar size={18} className="mr-1" /> Standard
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(provider)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(provider.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {providers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Ingen vejhjælpsudbydere fundet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal til redigering/oprettelse af udbyder */}
      {isModalOpen && editingProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {editingProvider.id ? 'Rediger vejhjælpsudbyder' : 'Tilføj ny vejhjælpsudbyder'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Navn
                </label>
                <input
                  type="text"
                  name="name"
                  value={editingProvider.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kontaktperson
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={editingProvider.contactPerson || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={editingProvider.email || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="text"
                  name="phone"
                  value={editingProvider.phone || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo URL
                </label>
                <input
                  type="text"
                  name="logoUrl"
                  value={editingProvider.logoUrl || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex items-center space-x-6 mt-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={editingProvider.active}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                    Aktiv
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="preferred"
                    name="preferred"
                    checked={editingProvider.preferred}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="preferred" className="ml-2 block text-sm text-gray-900">
                    Foretrukken
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interne noter
              </label>
              <textarea
                name="internalNotes"
                value={editingProvider.internalNotes || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuller
              </button>
              <button
                onClick={handleSaveProvider}
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

export default RoadsideProvidersAdminPage;
