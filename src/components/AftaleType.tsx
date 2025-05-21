import React, { useState } from 'react';
import { FaTools, FaCog, FaInfoCircle } from 'react-icons/fa';

interface AftaleTypeProps {
  onChange?: (values: any) => void;
}

const AftaleType: React.FC<AftaleTypeProps> = ({ onChange }) => {
  const [aftaleType, setAftaleType] = useState<'service' | 'serviceOgReparation'>('service');
  const [showInfo, setShowInfo] = useState<boolean>(false);
  
  const handleAftaleTypeChange = (type: 'service' | 'serviceOgReparation') => {
    setAftaleType(type);
    onChange?.({ aftaleType: type });
  };
  
  return (
    <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Aftaletype</h3>
        <div 
          className="text-sm text-gray-500 flex items-center cursor-pointer hover:text-gray-700"
          onClick={() => setShowInfo(true)}
        >
          <FaInfoCircle className="mr-1" /> Se beskrivelse
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <button
          className={`p-4 rounded-lg border ${
            aftaleType === 'service' 
              ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-500' 
              : 'bg-white border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => handleAftaleTypeChange('service')}
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${aftaleType === 'service' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <FaCog className={`${aftaleType === 'service' ? 'text-blue-600' : 'text-gray-600'}`} size={20} />
            </div>
            <div className="ml-4 text-left">
              <h4 className={`text-lg font-medium ${aftaleType === 'service' ? 'text-blue-700' : 'text-gray-700'}`}>
                Service
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                Dækker alle planlagte serviceeftersyn
              </p>
            </div>
          </div>
        </button>
        
        <button
          className={`p-4 rounded-lg border ${
            aftaleType === 'serviceOgReparation' 
              ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-500' 
              : 'bg-white border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => handleAftaleTypeChange('serviceOgReparation')}
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${aftaleType === 'serviceOgReparation' ? 'bg-indigo-100' : 'bg-gray-100'}`}>
              <FaTools className={`${aftaleType === 'serviceOgReparation' ? 'text-indigo-600' : 'text-gray-600'}`} size={20} />
            </div>
            <div className="ml-4 text-left">
              <h4 className={`text-lg font-medium ${aftaleType === 'serviceOgReparation' ? 'text-indigo-700' : 'text-gray-700'}`}>
                Service & Reparation
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                Dækker både service og reparationer
              </p>
            </div>
          </div>
        </button>
      </div>
      
      {/* Info popup */}
      {showInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" onClick={() => setShowInfo(false)}>
          <div className="w-full max-w-md rounded-lg shadow-lg bg-white border p-0 m-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gray-100 px-4 py-3 rounded-t-lg flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-800">
                Aftaletyper - information
              </h3>
              <button 
                onClick={() => setShowInfo(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                  <FaCog className="text-blue-600 mr-2" /> Service
                </h4>
                <p className="text-gray-600">
                  Serviceaftalen dækker alle producentens anbefalede serviceeftersyn i henhold til servicebogen. 
                  Dette inkluderer olieudskiftning, filterskift og alle de planlagte serviceeftersyn.
                </p>
                <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                  <li>Alle planlagte serviceeftersyn</li>
                  <li>Motorolie og filter</li>
                  <li>Pollenfilter, luftfilter</li>
                  <li>Tændrør (når påkrævet)</li>
                  <li>Bremsevæske</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                  <FaTools className="text-indigo-600 mr-2" /> Service & Reparation
                </h4>
                <p className="text-gray-600">
                  Denne aftale dækker både service som beskrevet ovenfor samt reparationer, der kan opstå 
                  som følge af slitage på bilens komponenter. Dette giver ekstra tryghed med forudsigelige omkostninger.
                </p>
                <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                  <li>Alt indeholdt i serviceaftalen</li>
                  <li>Reparationer på grund af slitage</li>
                  <li>Udskiftning af bremseklodser/skiver</li>
                  <li>Støddæmpere ved nedslidning</li>
                  <li>Kobling (ved normal slitage)</li>
                  <li>Batteri, generator, starter</li>
                </ul>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                Bemærk: Visse skader og reparationer dækkes ikke, fx skader som følge af udefrakommende påvirkninger, 
                misbrug eller mangelfuld vedligeholdelse. Læs de komplette vilkår for detaljerede oplysninger.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AftaleType;
