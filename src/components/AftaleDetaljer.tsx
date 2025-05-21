import React, { useState, useEffect } from 'react';
import { FaCarSide, FaCalendarAlt } from 'react-icons/fa';

interface AftaleDetaljerProps {
  onChange?: (values: any) => void;
}

// Predefinerede løbetider i måneder
const loebetider = [12, 24, 36, 48, 60];

// Predefinerede kilometer per år muligheder
const kilometerPerAar = [10000, 15000, 20000, 25000, 30000, 35000, 40000];

const AftaleDetaljer: React.FC<AftaleDetaljerProps> = ({ onChange }) => {
  const [valgtLoebetid, setValgtLoebetid] = useState<number>(36);
  const [valgtKm, setValgtKm] = useState<number>(20000);
  
  // Opdater parent component når værdier ændres
  useEffect(() => {
    onChange?.({
      løbetid: valgtLoebetid,
      kilometerPerÅr: valgtKm,
      totalKilometer: Math.round(valgtKm * (valgtLoebetid / 12))
    });
  }, [valgtLoebetid, valgtKm, onChange]);

  return (
    <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Aftaledetaljer</h3>
      
      {/* Løbetid vælger */}
      <div className="mb-6">
        <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <FaCalendarAlt className="mr-2 text-blue-500" />
          <span>Vælg løbetid:</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {loebetider.map((måneder) => (
            <button
              key={måneder}
              className={`py-2 px-4 rounded-md border font-medium ${
                valgtLoebetid === måneder 
                  ? 'bg-blue-100 border-blue-400 text-blue-700 ring-2 ring-blue-500'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setValgtLoebetid(måneder)}
            >
              {måneder < 12 ? `${måneder} mdr.` : `${måneder / 12} år`}
            </button>
          ))}
        </div>
      </div>
      
      {/* Km per år vælger */}
      <div>
        <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <FaCarSide className="mr-2 text-blue-500" />
          <span>Vælg kilometer pr. år:</span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {kilometerPerAar.map((km) => (
            <button
              key={km}
              className={`py-2 px-1 rounded-md border font-medium ${
                valgtKm === km 
                  ? 'bg-blue-100 border-blue-400 text-blue-700 ring-2 ring-blue-500'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setValgtKm(km)}
            >
              {km.toLocaleString('da-DK')} km
            </button>
          ))}
        </div>
      </div>
      
      {/* Total oversigt */}
      <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
        <div className="text-sm text-gray-600">
          <strong>Aftaleperiode: </strong>
          <span>
            {valgtLoebetid < 12 ? `${valgtLoebetid} måneder` : `${valgtLoebetid / 12} år`}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          <strong>Årlig kørsel: </strong>
          <span>{valgtKm.toLocaleString('da-DK')} km pr. år</span>
        </div>
        <div className="text-sm font-medium text-gray-700 mt-1">
          <strong>Total dækning: </strong>
          <span className="text-blue-700">
            {Math.round(valgtKm * (valgtLoebetid / 12)).toLocaleString('da-DK')} km
          </span>
        </div>
      </div>
    </div>
  );
};

export default AftaleDetaljer;
