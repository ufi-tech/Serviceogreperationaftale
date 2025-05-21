import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaEdit, FaTrash, FaStar, FaRegStar, FaToggleOn, FaToggleOff, FaChevronUp, FaChevronDown, FaEllipsisV, FaMoneyBillWave } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { RoadsideAssistanceService, RoadsideProvider, RoadsidePackage } from '../../services/RoadsideAssistanceService';

const roadsideService = new RoadsideAssistanceService();

const RoadsidePackagesAdminPage: React.FC = () => {
  const [providers, setProviders] = useState<RoadsideProvider[]>([]);
  const [packages, setPackages] = useState<RoadsidePackage[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPackage, setEditingPackage] = useState<RoadsidePackage | null>(null);
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
      const data = await roadsideService.getAdminRoadsideProviders();
      setProviders(data.filter((p: RoadsideProvider) => p.active));
      setError(null);
      
      if (data.length > 0 && data.some((p: RoadsideProvider) => p.preferred)) {
        // Vælg automatisk den første foretrukne udbyder
        const preferredProvider = data.find((p: RoadsideProvider) => p.preferred);
        if (preferredProvider) {
          setSelectedProviderId(preferredProvider.id);
        }
      }
    } catch (err) {
      setError('Fejl ved indlæsning af vejhjælpsudbydere');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPackages = async (providerId: string) => {
    setLoading(true);
    try {
      const data = await roadsideService.getAdminRoadsidePackages(providerId);
      // Sorter pakker efter order-feltet
      setPackages(data.sort((a: RoadsidePackage, b: RoadsidePackage) => (a.order || 0) - (b.order || 0)));
      setError(null);
    } catch (err) {
      setError('Fejl ved indlæsning af vejhjælpspakker');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (pkg: RoadsidePackage) => {
    const newStatus = pkg.status === 'active' ? 'inactive' : 'active';
    try {
      const updatedPackage = await roadsideService.updateRoadsidePackage(
        pkg.id,
        { status: newStatus }
      );
      
      if (updatedPackage) {
        setPackages(packages.map(p => 
          p.id === pkg.id ? { ...p, status: newStatus } : p
        ));
      }
    } catch (err) {
      setError('Fejl ved opdatering af pakke status');
      console.error(err);
    }
  };

  const handleToggleRecommended = async (pkg: RoadsidePackage) => {
    try {
      const updatedPackage = await roadsideService.updateRoadsidePackage(
        pkg.id,
        { recommended: !pkg.recommended }
      );
      
      if (updatedPackage) {
        setPackages(packages.map(p => 
          p.id === pkg.id ? { ...p, recommended: !pkg.recommended } : p
        ));
      }
    } catch (err) {
      setError('Fejl ved opdatering af anbefalet status');
      console.error(err);
    }
  };

  const handleMoveUp = async (pkg: RoadsidePackage, index: number) => {
    if (index === 0) return; // Allerede øverst
    
    const newOrder = (packages[index - 1].order || 0) - 1;
    try {
      const updatedPackage = await roadsideService.updateRoadsidePackage(
        pkg.id,
        { order: newOrder }
      );
      
      if (updatedPackage) {
        // Opdater lokalt og genindlæs for at sikre korrekt sortering
        await loadPackages(selectedProviderId);
      }
    } catch (err) {
      setError('Fejl ved ændring af pakke rækkefølge');
      console.error(err);
    }
  };

  const handleMoveDown = async (pkg: RoadsidePackage, index: number) => {
    if (index === packages.length - 1) return; // Allerede nederst
    
    const newOrder = (packages[index + 1].order || 0) + 1;
    try {
      const updatedPackage = await roadsideService.updateRoadsidePackage(
        pkg.id,
        { order: newOrder }
      );
      
      if (updatedPackage) {
        // Opdater lokalt og genindlæs for at sikre korrekt sortering
        await loadPackages(selectedProviderId);
      }
    } catch (err) {
      setError('Fejl ved ændring af pakke rækkefølge');
      console.error(err);
    }
  };

  const handleEdit = (pkg: RoadsidePackage) => {
    setEditingPackage(pkg);
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  const handleDelete = async (packageId: string) => {
    if (window.confirm('Er du sikker på, at du vil slette denne vejhjælpspakke?')) {
      try {
        await roadsideService.deleteRoadsidePackage(packageId);
        setPackages(packages.filter(p => p.id !== packageId));
      } catch (err) {
        setError('Fejl ved sletning af vejhjælpspakke');
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
    if (!selectedProviderId) {
      setError('Vælg venligst en udbyder først');
      return;
    }
    
    const maxOrder = packages.length > 0 
      ? Math.max(...packages.map(p => p.order || 0)) + 1 
      : 1;
    
    setEditingPackage({
      id: '',
      providerId: selectedProviderId,
      name: '',
      description: '',
      status: 'active',
      coverage: [],
      price: 0,
      termsUrl: '',
      recommended: false,
      order: maxOrder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setIsModalOpen(true);
  };

  const handleSavePackage = async () => {
    if (!editingPackage) return;
    
    try {
      let savedPackage: RoadsidePackage | null;
      
      if (editingPackage.id) {
        // Opdater eksisterende pakke
        savedPackage = await roadsideService.updateRoadsidePackage(
          editingPackage.id,
          editingPackage
        );
        
        if (savedPackage) {
          setPackages(packages.map(p => 
            p.id === editingPackage.id ? savedPackage as RoadsidePackage : p
          ));
        }
      } else {
        // Opret ny pakke
        const { id, createdAt, updatedAt, ...newPackageData } = editingPackage;
        savedPackage = await roadsideService.createRoadsidePackage(newPackageData);
        
        if (savedPackage) {
          setPackages([...packages, savedPackage]);
        }
      }
      
      setIsModalOpen(false);
      setEditingPackage(null);
    } catch (err) {
      setError('Fejl ved gem af vejhjælpspakke');
      console.error(err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editingPackage) return;
    
    const { name, value } = e.target;
    setEditingPackage({
      ...editingPackage,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingPackage) return;
    
    const { name, checked } = e.target;
    setEditingPackage({
      ...editingPackage,
      [name]: checked
    });
  };

  const handleCoverageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!editingPackage) return;
    
    const coverageText = e.target.value;
    const coverageArray = coverageText.split(',').map(item => item.trim()).filter(item => item);
    
    setEditingPackage({
      ...editingPackage,
      coverage: coverageArray
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Administrer Vejhjælpspakker</h1>
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
          <option value="">Vælg vejhjælpsudbyder</option>
          {providers.map(provider => (
            <option key={provider.id} value={provider.id}>
              {provider.name} {provider.preferred ? '★' : ''}
            </option>
          ))}
        </select>
      </div>

      {loading && !selectedProviderId ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Indlæser vejhjælpsudbydere...</p>
        </div>
      ) : loading && selectedProviderId ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Indlæser vejhjælpspakker...</p>
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
                  Dækning
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pris
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Anbefalet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rækkefølge
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Handlinger
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {packages.map((pkg, index) => (
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
                      {pkg.coverage.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {pkg.price} kr/md
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleToggleRecommended(pkg)}
                      className={`flex items-center ${pkg.recommended ? 'text-amber-500' : 'text-gray-400'}`}
                    >
                      {pkg.recommended ? (
                        <>
                          <FaStar size={18} className="mr-1" /> Anbefalet
                        </>
                      ) : (
                        <>
                          <FaRegStar size={18} className="mr-1" /> Standard
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleMoveUp(pkg, index)}
                        disabled={index === 0}
                        className={`${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        <FaChevronUp size={16} />
                      </button>
                      <span className="text-gray-500">{pkg.order || 0}</span>
                      <button 
                        onClick={() => handleMoveDown(pkg, index)}
                        disabled={index === packages.length - 1}
                        className={`${index === packages.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        <FaChevronDown size={16} />
                      </button>
                    </div>
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
                            to={`/admin/roadside-packages/${pkg.id}/pricing-rules`}
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
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Ingen vejhjælpspakker fundet for denne udbyder
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
          <p className="text-gray-600">Vælg en udbyder for at se og administrere vejhjælpspakker</p>
        </div>
      )}

      {/* Modal til redigering/oprettelse af pakke */}
      {isModalOpen && editingPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {editingPackage.id ? 'Rediger vejhjælpspakke' : 'Tilføj ny vejhjælpspakke'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Navn
                </label>
                <input
                  type="text"
                  name="name"
                  value={editingPackage.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pris (kr/md)
                </label>
                <input
                  type="number"
                  name="price"
                  value={editingPackage.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="1"
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
                  Dækning (kommasepareret liste)
                </label>
                <textarea
                  value={editingPackage.coverage.join(', ')}
                  onChange={handleCoverageChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="F.eks. Danmark, Starthjælp, Hjulskifte, Bugsering"
                />
              </div>
              
              <div className="flex items-center space-x-6 mt-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="recommended"
                    name="recommended"
                    checked={editingPackage.recommended || false}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="recommended" className="ml-2 block text-sm text-gray-900">
                    Anbefalet pakke
                  </label>
                </div>
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

export default RoadsidePackagesAdminPage;
