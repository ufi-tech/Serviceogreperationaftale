import React from 'react';
import { FaCar } from 'react-icons/fa';
import { formatDate } from '../../utils/dateUtils';
import { BildataFormData } from '../../types/aftale.types';

interface BilOplysningerSektionProps {
  bildataFormData: BildataFormData;
  bilAlder: number;
  bilKm: number;
}

const BilOplysningerSektion: React.FC<BilOplysningerSektionProps> = ({ 
  bildataFormData, 
  bilAlder, 
  bilKm 
}) => {
  return (
    <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-800">Bilen du opretter serviceaftale til</h2>
      </div>
      
      <div className="grid md:grid-cols-4 gap-6 p-6">
        {/* Venstre kolonne - Nummerplade og basisinfo */}
        <div className="md:col-span-1">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 flex flex-col items-center">
            {/* Hvis nummerplade findes, vises den i nummerplade-format */}
            {bildataFormData.nummerplade ? (
              <div className="bg-white border-2 border-black rounded px-4 py-2 font-bold text-xl tracking-wider mb-3">
                {bildataFormData.nummerplade}
              </div>
            ) : (
              <>
                {/* Hvis nummerplade ikke findes, viser vi "Ny bil" og fremhæver stelnummeret */}
                <div className="bg-yellow-50 border border-yellow-300 rounded px-4 py-2 text-center mb-3">
                  <p className="font-bold text-yellow-800">Ny bil</p>
                  <p className="text-xs text-yellow-700">Afventer registrering</p>
                </div>
              </>
            )}
            
            <div className="text-center">
              <p className="text-base font-medium text-gray-900">
                {bildataFormData.bilmaerke} {bildataFormData.model}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {bildataFormData.betegnelse}
              </p>
              <p className="text-sm font-medium text-gray-800 mt-2">
                {bildataFormData.hk} HK
              </p>
            </div>
          </div>
        </div>
        
        {/* Højre kolonne - Detaljer om bilen */}
        <div className="md:col-span-3">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Venstre side - Detaljeret bildata */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Biloplysninger</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Stelnummer</dt>
                  <dd className="text-sm font-medium text-gray-900">{bildataFormData.stelnummer}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Første registrering</dt>
                  <dd className="text-sm font-medium text-gray-900">{formatDate(bildataFormData.foersteRegistreringsdato)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Kilometerstand</dt>
                  <dd className="text-sm font-medium text-gray-900">{bilKm.toLocaleString('da-DK')} km</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Forventet årligt</dt>
                  <dd className="text-sm font-medium text-gray-900">{parseInt(bildataFormData.kmAarligt || '0', 10).toLocaleString('da-DK')} km/år</dd>
                </div>
                {bildataFormData.koereklarVaegt && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Køreklar vægt</dt>
                    <dd className="text-sm font-medium text-gray-900">{parseInt(bildataFormData.koereklarVaegt, 10).toLocaleString('da-DK')} kg</dd>
                  </div>
                )}
              </dl>
            </div>
            
            {/* Højre side - Servicedata og biltype */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Serviceoplysninger</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Bilens alder</dt>
                  <dd className="text-sm font-medium text-gray-900">{bilAlder} år</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Biltype</dt>
                  <dd className="text-sm font-medium text-gray-900">{bildataFormData.bilType || 'Ikke angivet'}</dd>
                </div>
                {bildataFormData.fabriksgarantiMdr && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Fabriksgaranti</dt>
                    <dd className="text-sm font-medium text-gray-900">{bildataFormData.fabriksgarantiMdr} måneder</dd>
                  </div>
                )}
              </dl>
              
              {/* Ikoner for biltype */}
              <div className="mt-4 flex items-center space-x-2 text-blue-600">
                <FaCar size={20} />
                <span className="text-sm font-medium">{bildataFormData.bilType || 'Personbil'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BilOplysningerSektion;
