import React, { useState } from 'react';
import VehicleDataService, { VehicleDataError, VehicleDataErrorType } from '../services/VehicleDataService';
import { FaSearch, FaSpinner, FaExclamationTriangle, FaCheckCircle, FaCar } from 'react-icons/fa';

/**
 * VehicleSearch component for searching vehicles by license plate or VIN number
 * This is a standalone component that demonstrates the use of VehicleDataService
 */
const VehicleSearch: React.FC = () => {
  const [searchType, setSearchType] = useState<'licensePlate' | 'vin'>('licensePlate');
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicleInfo, setVehicleInfo] = useState<any>(null);
  const [inspectionInfo, setInspectionInfo] = useState<any>(null);

  // Handle search form submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchValue.trim()) {
      setError(searchType === 'licensePlate' 
        ? 'Indtast venligst en nummerplade' 
        : 'Indtast venligst et stelnummer');
      return;
    }

    setIsSearching(true);
    setError(null);
    setVehicleInfo(null);
    setInspectionInfo(null);

    try {
      // Call the appropriate API method based on search type
      const response = searchType === 'licensePlate'
        ? await VehicleDataService.getVehicleDataByLicensePlate(searchValue)
        : await VehicleDataService.getVehicleDataByVin(searchValue);

      // Extract basic vehicle info and inspection data
      const basicInfo = VehicleDataService.extractBasicVehicleInfo(response);
      const latestInspection = VehicleDataService.getLatestInspection(response);

      setVehicleInfo(basicInfo);
      setInspectionInfo(latestInspection);
    } catch (error) {
      console.error('Error searching for vehicle:', error);
      
      if (error instanceof VehicleDataError) {
        switch(error.type) {
          case VehicleDataErrorType.NOT_FOUND:
            setError(`Kunne ikke finde køretøj med dette ${searchType === 'licensePlate' ? 'nummerplade' : 'stelnummer'}`);
            break;
          case VehicleDataErrorType.NETWORK_ERROR:
            setError('Netværksfejl ved forbindelse til Carrus API. Prøv igen senere.');
            break;
          default:
            setError(`Fejl ved søgning: ${error.message}`);
        }
      } else {
        setError(`Uventet fejl: ${error instanceof Error ? error.message : 'Ukendt fejl'}`);
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center">
          <FaCar className="mr-2" /> Køretøjsopslag via Carrus API
        </h2>
        <p className="text-gray-600">
          Søg efter køretøjsoplysninger ved at indtaste nummerplade eller stelnummer
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex mb-4">
          <div className="flex items-center mr-4">
            <input
              type="radio"
              id="licensePlate"
              name="searchType"
              checked={searchType === 'licensePlate'}
              onChange={() => setSearchType('licensePlate')}
              className="mr-2"
            />
            <label htmlFor="licensePlate">Nummerplade</label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="vin"
              name="searchType"
              checked={searchType === 'vin'}
              onChange={() => setSearchType('vin')}
              className="mr-2"
            />
            <label htmlFor="vin">Stelnummer</label>
          </div>
        </div>

        <div className="flex">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={searchType === 'licensePlate' ? 'F.eks. AB12345' : 'F.eks. VF17RRL0H50576482'}
            className="flex-grow px-4 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r flex items-center"
          >
            {isSearching ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : (
              <FaSearch className="mr-2" />
            )}
            Søg
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <FaExclamationTriangle className="mr-2" />
          {error}
        </div>
      )}

      {vehicleInfo && (
        <div className="bg-green-50 border border-green-200 rounded p-4 mb-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <FaCheckCircle className="text-green-600 mr-2" />
            Køretøjsoplysninger
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold text-gray-700 mb-2">Grundlæggende oplysninger</h4>
              <ul className="space-y-2">
                <li><span className="font-medium">Mærke:</span> {vehicleInfo.make}</li>
                <li><span className="font-medium">Model:</span> {vehicleInfo.model}</li>
                <li><span className="font-medium">Variant:</span> {vehicleInfo.variant || '-'}</li>
                <li><span className="font-medium">Årgang:</span> {vehicleInfo.year}</li>
                <li><span className="font-medium">Nummerplade:</span> {vehicleInfo.registrationNumber || '-'}</li>
                <li><span className="font-medium">Stelnummer:</span> {vehicleInfo.vin}</li>
                <li><span className="font-medium">Første registrering:</span> {vehicleInfo.firstRegistrationDate}</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-700 mb-2">Tekniske detaljer</h4>
              <ul className="space-y-2">
                <li><span className="font-medium">Brændstof:</span> {vehicleInfo.fuel}</li>
                <li><span className="font-medium">Farve:</span> {vehicleInfo.color || '-'}</li>
                <li><span className="font-medium">Motor:</span> {vehicleInfo.enginePowerKw} kW / {vehicleInfo.enginePowerHp} hk</li>
                <li><span className="font-medium">Motorstørrelse:</span> {vehicleInfo.engineCapacity ? `${vehicleInfo.engineCapacity} cm³` : '-'}</li>
                <li><span className="font-medium">Brændstofforbrug:</span> {vehicleInfo.fuelConsumption ? `${vehicleInfo.fuelConsumption} km/l` : '-'}</li>
                <li><span className="font-medium">CO2-udledning:</span> {vehicleInfo.co2Emissions ? `${vehicleInfo.co2Emissions} g/km` : '-'}</li>
                <li><span className="font-medium">Vægt:</span> {vehicleInfo.weight ? `${vehicleInfo.weight} kg` : '-'}</li>
              </ul>
            </div>
          </div>

          {inspectionInfo && (
            <div className="mt-6">
              <h4 className="font-bold text-gray-700 mb-2">Seneste syn</h4>
              <ul className="space-y-2">
                <li><span className="font-medium">Dato:</span> {inspectionInfo.date}</li>
                <li><span className="font-medium">Resultat:</span> {inspectionInfo.result}</li>
                <li><span className="font-medium">Type:</span> {inspectionInfo.type}</li>
                <li><span className="font-medium">Kilometerstand:</span> {inspectionInfo.odometerReading ? `${inspectionInfo.odometerReading} km` : '-'}</li>
                <li><span className="font-medium">Næste syn:</span> {inspectionInfo.nextInspectionDate || '-'}</li>
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="text-sm text-gray-500 mt-4">
        <p>Denne komponent demonstrerer brugen af VehicleDataService til at hente køretøjsdata fra Carrus API.</p>
        <p>API-nøgle: <code>ir5uSxUiWNYXGEen_gDoX3YNSNGfsWcLYgxCNmUc7HE</code></p>
      </div>
    </div>
  );
};

export default VehicleSearch;
