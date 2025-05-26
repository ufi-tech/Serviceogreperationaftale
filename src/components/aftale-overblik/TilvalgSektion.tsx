import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';

interface TilvalgSektionProps {
  aftaleData: {
    laanebilVedService: string;
  };
  onLaanebilChange: (value: 'ja' | 'nej') => void;
}

const TilvalgSektion: React.FC<TilvalgSektionProps> = ({
  aftaleData,
  onLaanebilChange
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-800">Tilvalg</h2>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {/* Lånebil ved service sektion */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="font-medium">Lånebil ved Service</h3>
                  <div className="relative ml-2 group">
                    <button className="text-gray-400 hover:text-gray-600">
                      <FaInfoCircle size={16} />
                    </button>
                    <div className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                      <div className="text-sm text-gray-600">
                        <p className="font-semibold mb-1">Lånebil ved service inkluderer:</p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Lånebil i samme størrelsesklasse</li>
                          <li>Fri km under låneperioden</li>
                          <li>Inkluderet ved alle servicetjek og reparationer</li>
                          <li>Du betaler kun forbrugsudgifter</li>
                        </ul>
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p>Undgå at skulle finde transport løsninger eller besøge værkstedet flere gange.</p>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-3 transform translate-y-full">
                        <div className="w-3 h-3 bg-white rotate-45 transform origin-center"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Ved at vælge lånebil får du stillet en bil til rådighed under værkstedsbesøg.
                </p>
              </div>
              
              {/* Radiobuttons for lånebil */}
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="laanebil"
                    value="ja"
                    checked={aftaleData.laanebilVedService === 'ja'}
                    onChange={() => onLaanebilChange('ja')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Ja</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="laanebil"
                    value="nej"
                    checked={aftaleData.laanebilVedService === 'nej'}
                    onChange={() => onLaanebilChange('nej')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Nej</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TilvalgSektion;
