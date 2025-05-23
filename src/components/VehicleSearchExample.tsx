import React, { useEffect, useState } from 'react';
import VehicleDataService from '../services/VehicleDataService';
import { FaSpinner, FaExclamationTriangle, FaCheckCircle, FaCar } from 'react-icons/fa';

/**
 * VehicleSearchExample - Et eksempel på søgning efter nummerplade EF10570
 */
const VehicleSearchExample: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vehicleInfo, setVehicleInfo] = useState<any>(null);
  const [inspectionInfo, setInspectionInfo] = useState<any>(null);
  
  // Nummerplade til søgning
  const licensePlate = 'EF10570';

  useEffect(() => {
    const searchVehicle = async () => {
      try {
        // Hent køretøjsdata fra Carrus API
        const response = await VehicleDataService.getVehicleDataByLicensePlate(licensePlate);
        
        // Udtræk grundlæggende køretøjsoplysninger og synsdata
        const basicInfo = VehicleDataService.extractBasicVehicleInfo(response);
        const latestInspection = VehicleDataService.getLatestInspection(response);
        
        setVehicleInfo(basicInfo);
        setInspectionInfo(latestInspection);
      } catch (error) {
        console.error('Fejl ved søgning efter køretøj:', error);
        setError(`Kunne ikke finde køretøj med nummerplade ${licensePlate}: ${error instanceof Error ? error.message : 'Ukendt fejl'}`);
      } finally {
        setIsLoading(false);
      }
    };

    searchVehicle();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <FaSpinner className="animate-spin text-blue-600 mr-2 text-2xl" />
        <p>Søger efter køretøj med nummerplade {licensePlate}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
        <FaExclamationTriangle className="mr-2 text-xl" />
        <div>
          <p className="font-bold">Fejl ved søgning</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center">
          <FaCar className="mr-2" /> Køretøjsoplysninger for {licensePlate}
        </h2>
        <div className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
          Søgning gennemført
        </div>
      </div>

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
        <p>Dette er et eksempel på søgning efter nummerplade EF10570 ved hjælp af VehicleDataService.</p>
        <p>Tidspunkt for søgning: {new Date().toLocaleString('da-DK')}</p>
      </div>
    </div>
  );
};

export default VehicleSearchExample;
