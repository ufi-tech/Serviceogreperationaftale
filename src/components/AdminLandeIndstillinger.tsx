import React, { useState, useEffect } from 'react';
import { FaGlobe, FaEuroSign, FaPercentage, FaSave, FaUndo } from 'react-icons/fa';
import { euCountries, CountryOption } from '../data/countryData';
import { useLand } from '../contexts/LandContext';

const AdminLandeIndstillinger: React.FC = () => {
  const { selectedCountry, setSelectedCountry } = useLand();
  
  // State til visning og redigering af landedata
  const [countries, setCountries] = useState(euCountries);
  const [defaultCountryCode, setDefaultCountryCode] = useState(selectedCountry.value);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCountry, setEditingCountry] = useState<CountryOption | null>(null);
  
  // Filtrer lande baseret på søgning
  const filteredCountries = searchTerm.trim() === '' 
    ? countries 
    : countries.filter(country => 
        country.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
  
  // Sæt default land
  const handleSetDefaultCountry = (country: CountryOption) => {
    setDefaultCountryCode(country.value);
    setSelectedCountry(country);
  };
  
  // Start redigering af et land
  const handleEditCountry = (country: CountryOption) => {
    setEditingCountry({...country});
  };
  
  // Gem ændringer til landedata
  const handleSaveCountryEdit = () => {
    if (!editingCountry) return;
    
    setCountries(countries.map(country => 
      country.value === editingCountry.value ? editingCountry : country
    ));
    
    // Hvis det er det valgte land, opdater også det valgte land
    if (editingCountry.value === defaultCountryCode) {
      setSelectedCountry(editingCountry);
    }
    
    setEditingCountry(null);
  };
  
  // Annuller redigering
  const handleCancelEdit = () => {
    setEditingCountry(null);
  };
  
  // Håndter ændringer i redigeringsfelterne
  const handleEditChange = (field: string, value: string | number) => {
    if (!editingCountry) return;
    
    if (field === 'vatRate') {
      const vatRate = parseFloat(value as string);
      if (isNaN(vatRate) || vatRate < 0 || vatRate > 100) return;
      
      setEditingCountry({
        ...editingCountry,
        vatRate: vatRate
      });
    } else if (field === 'currencyCode') {
      setEditingCountry({
        ...editingCountry,
        currency: {
          ...editingCountry.currency,
          code: value as string
        }
      });
    } else if (field === 'currencySymbol') {
      setEditingCountry({
        ...editingCountry,
        currency: {
          ...editingCountry.currency,
          symbol: value as string
        }
      });
    } else if (field === 'currencyPosition') {
      setEditingCountry({
        ...editingCountry,
        currency: {
          ...editingCountry.currency,
          position: value as 'before' | 'after'
        }
      });
    }
  };
  
  // Gem ændringer til localStorage når de ændres
  useEffect(() => {
    localStorage.setItem('countriesData', JSON.stringify(countries));
  }, [countries]);
  
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Landeindstillinger</h2>
      
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h3 className="text-md font-medium text-gray-700 mb-2 sm:mb-0">Tilgængelige Lande</h3>
          <div>
            <input
              type="text"
              placeholder="Søg efter land..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Land
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ISO Kode
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valuta
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Momssats
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Standard
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Handling
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCountries.map((country) => (
                <tr key={country.value} className={country.value === defaultCountryCode ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">{country.label}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {country.value.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {country.currency.code} ({country.currency.symbol})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {country.vatRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleSetDefaultCountry(country)}
                      className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded ${country.value === defaultCountryCode ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                    >
                      <FaGlobe className="mr-1" />
                      {country.value === defaultCountryCode ? 'Standard' : 'Sæt som standard'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleEditCountry(country)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Rediger
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Redigeringsformular */}
      {editingCountry && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 m-4 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Rediger {editingCountry.label}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaGlobe className="inline-block mr-1" /> Land
                </label>
                <input
                  type="text"
                  value={editingCountry.label}
                  disabled
                  className="block w-full border border-gray-300 bg-gray-50 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaEuroSign className="inline-block mr-1" /> Valutakode
                </label>
                <input
                  type="text"
                  value={editingCountry.currency.code}
                  onChange={(e) => handleEditChange('currencyCode', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaEuroSign className="inline-block mr-1" /> Valutasymbol
                </label>
                <input
                  type="text"
                  value={editingCountry.currency.symbol}
                  onChange={(e) => handleEditChange('currencySymbol', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaEuroSign className="inline-block mr-1" /> Symbol position
                </label>
                <select
                  value={editingCountry.currency.position}
                  onChange={(e) => handleEditChange('currencyPosition', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="before">Før beløb (f.eks. $100)</option>
                  <option value="after">Efter beløb (f.eks. 100 kr.)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaPercentage className="inline-block mr-1" /> Momssats (%)
                </label>
                <input
                  type="number"
                  value={editingCountry.vatRate}
                  onChange={(e) => handleEditChange('vatRate', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div className="mt-5 flex justify-end space-x-3">
              <button
                onClick={handleCancelEdit}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaUndo className="mr-1" /> Annuller
              </button>
              <button
                onClick={handleSaveCountryEdit}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaSave className="mr-1" /> Gem
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Vejledning:</h3>
        <p className="text-sm text-gray-600">
          På denne side kan du konfigurere landeindstillinger for applikationen.
          Du kan sætte et land som standard, redigere valutaoplysninger og momssatser.
          Landeindstillingerne påvirker hvordan priser vises og beregnes på tværs af applikationen.
        </p>
      </div>
    </div>
  );
};

export default AdminLandeIndstillinger;
