import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaEllipsisV, FaMoneyBillWave } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import serviceRepairService, { ServiceRepairProvider, ServiceRepairPackage } from '../../services/ServiceRepairService';

const ServiceRepairPackagesAdminPage: React.FC = () => {
  const [providers, setProviders] = useState<ServiceRepairProvider[]>([]);
  const [packages, setPackages] = useState<ServiceRepairPackage[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPackage, setEditingPackage] = useState<ServiceRepairPackage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    if (selectedProviderId) {
      loadPackages(selectedProviderId);
    } else {
      setPackages([]);
    }
  }, [selectedProviderId]);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const data = await serviceRepairService.getServiceRepairProviders();
      setProviders(data);
      setError(null);
      
      if (data.length > 0) {
        // Vælg automatisk den første udbyder
        setSelectedProviderId(data[0].id);
      }
    } catch (err) {
      setError('Fejl ved indlæsning af service & reparation-udbydere');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPackages = async (providerId: string) => {
    setLoading(true);
    try {
      const data = await serviceRepairService.getServiceRepairPackages(providerId);
      setPackages(data);
      setError(null);
    } catch (err) {
      setError('Fejl ved indlæsning af service & reparation-pakker');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (pkg: ServiceRepairPackage) => {
    const newStatus = pkg.status === 'active' ? 'inactive' : 'active';
    
    // Her ville vi normalt kalde API for at opdatere status
    // Dette er placeholder indtil API er implementeret
    try {
      // Simuler en API-opdatering i udviklingsfasen
      setPackages(packages.map(p => 
        p.id === pkg.id ? { ...p, status: newStatus } : p
      ));
    } catch (err) {
      setError('Fejl ved opdatering af pakke status');
      console.error(err);
    }
  };

  const handleEdit = (pkg: ServiceRepairPackage) => {
    setEditingPackage({...pkg});
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  const handleDelete = async (packageId: string) => {
    if (window.confirm('Er du sikker på, at du vil slette denne service & reparation-pakke?')) {
      try {
        // Her ville vi normalt kalde API for at slette pakken
        // Dette er placeholder indtil API er implementeret
        setPackages(packages.filter(p => p.id !== packageId));
      } catch (err) {
        setError('Fejl ved sletning af service & reparation-pakke');
        console.error(err);
      }
    }
    setActiveDropdown(null);
  };

  const handleToggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  // Luk dropdown hvis der klikkes udenfor
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown !== null) {
        const currentRef = dropdownRefs.current[activeDropdown];
        if (currentRef && !currentRef.contains(event.target as Node)) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  const registerDropdownRef = (id: string, ref: HTMLDivElement | null) => {
    dropdownRefs.current[id] = ref;
  };

  const handleAddNew = () => {
    setEditingPackage({
      id: '',
      providerId: selectedProviderId,
      name: '',
      status: 'inactive',
      description: '',
      serviceIntervals: [],
      termsUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setIsModalOpen(true);
  };

  const handleSavePackage = async () => {
    if (!editingPackage) return;
    
    try {
      // Her ville vi normalt kalde API for at gemme/opdatere pakken
      // Dette er placeholder indtil API er implementeret
      if (editingPackage.id) {
        // Opdatering af eksisterende pakke
        setPackages(packages.map(p => 
          p.id === editingPackage.id ? editingPackage : p
        ));
      } else {
        // Tilføjelse af ny pakke
        const newPackage = {
          ...editingPackage,
          id: `pkg-${Date.now()}` // Simuleret ID
        };
        setPackages([...packages, newPackage]);
      }
      
      setIsModalOpen(false);
      setEditingPackage(null);
    } catch (err) {
      setError(`Fejl ved ${editingPackage.id ? 'opdatering' : 'oprettelse'} af service & reparation-pakke`);
      console.error(err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editingPackage) return;
    
    const { name, value } = e.target;
    setEditingPackage({
      ...editingPackage,
      [name]: value
    });
  };

  const handleServiceIntervalsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!editingPackage) return;
    
    const intervals = e.target.value
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    setEditingPackage({
      ...editingPackage,
      serviceIntervals: intervals
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Administrer Service & Reparationspakker</h1>
        <button
          onClick={handleAddNew}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
          disabled={!selectedProviderId}
        >
          <FaPlus className="mr-2" /> Tilføj ny pakke
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Vælg udbyder
        </label>
        <select
          className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={selectedProviderId}
          onChange={(e) => setSelectedProviderId(e.target.value)}
        >
          <option value="">Vælg service & reparations-udbyder</option>
          {providers.map(provider => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
      </div>

      {loading && !selectedProviderId ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Indlæser service & reparation-udbydere...</p>
        </div>
      ) : loading && selectedProviderId ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Indlæser service & reparation-pakker...</p>
        </div>
      ) : selectedProviderId ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pakke
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service intervaller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Handlinger
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{pkg.name}</div>
                    <div className="text-sm text-gray-500">{pkg.description}</div>
                    {pkg.termsUrl && (
                      <a 
                        href={pkg.termsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        Vis betingelser
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <ul className="list-disc pl-4">
                      {pkg.serviceIntervals && pkg.serviceIntervals.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleToggleStatus(pkg)}
                      className={`flex items-center ${pkg.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      {pkg.status === 'active' ? (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="relative" ref={(ref) => registerDropdownRef(pkg.id, ref)}>
                      <button 
                        onClick={() => handleToggleDropdown(pkg.id)}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
                        aria-label="Menu"
                        title="Handlinger"
                      >
                        <FaEllipsisV size={16} />
                      </button>
                      
                      {activeDropdown === pkg.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1 border border-gray-200">
                          <button
                            onClick={() => handleEdit(pkg)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <FaEdit className="inline-block mr-2" /> Rediger Pakkeoplysninger
                          </button>
                          
                          <Link 
                            to={`/admin/service-repair-packages/${pkg.id}/pricing-rules`}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <FaMoneyBillWave className="inline-block mr-2" /> Administrer Prisregler
                          </Link>
                          
                          <button
                            onClick={() => handleDelete(pkg.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-red-600"
                          >
                            <FaTrash className="inline-block mr-2" /> Slet Pakke
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {packages.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Ingen service & reparations-pakker fundet for denne udbyder
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
          <p className="text-gray-600">Vælg en udbyder for at se og administrere service & reparations-pakker</p>
        </div>
      )}

      {/* Modal til redigering/oprettelse af pakke */}
      {isModalOpen && editingPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {editingPackage.id ? 'Rediger service & reparation-pakke' : 'Tilføj ny service & reparation-pakke'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Navn
                </label>
                <input
                  type="text"
                  name="name"
                  value={editingPackage.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={editingPackage.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Aktiv</option>
                  <option value="inactive">Inaktiv</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Betingelser URL
                </label>
                <input
                  type="text"
                  name="termsUrl"
                  value={editingPackage.termsUrl || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beskrivelse
                </label>
                <textarea
                  name="description"
                  value={editingPackage.description || ''}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service intervaller (kommasepareret liste)
                </label>
                <textarea
                  value={editingPackage.serviceIntervals ? editingPackage.serviceIntervals.join(', ') : ''}
                  onChange={handleServiceIntervalsChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="F.eks. 12 måneder, 15.000 km"
                />
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
                onClick={handleSavePackage}
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

export default ServiceRepairPackagesAdminPage;
