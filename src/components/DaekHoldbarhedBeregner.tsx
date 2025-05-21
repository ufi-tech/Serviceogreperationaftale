import React, { useState, useEffect } from 'react';
import { DaekHoldbarhedService, HoldbarhedInput, HoldbarhedOutput } from '../services/DaekHoldbarhedService';

interface DaekHoldbarhedBeregnerProps {
  bilData?: {
    hk: number;
    bilType: 'personbil' | 'varebil';
  };
  daekData?: {
    bredde: number;
    profil: number;
    diameter: number;
    kategori: 'budget' | 'economy' | 'premium';
  };
  onHoldbarhedBeregnet?: (holdbarhed: HoldbarhedOutput) => void;
}

const DaekHoldbarhedBeregner: React.FC<DaekHoldbarhedBeregnerProps> = ({ 
  bilData, 
  daekData,
  onHoldbarhedBeregnet 
}) => {
  const [input, setInput] = useState<HoldbarhedInput>({
    hk: bilData?.hk || 150,
    bilType: bilData?.bilType || 'personbil',
    daekBredde: daekData?.bredde || 205,
    daekProfil: daekData?.profil || 55,
    daekDiameter: daekData?.diameter || 16,
    daekKategori: daekData?.kategori || 'economy',
    koerselsType: 'blandet'
  });
  
  const [resultat, setResultat] = useState<HoldbarhedOutput | null>(null);
  
  // Beregn holdbarhed når input ændres
  useEffect(() => {
    const holdbarhed = DaekHoldbarhedService.beregnHoldbarhed(input);
    setResultat(holdbarhed);
    
    if (onHoldbarhedBeregnet) {
      onHoldbarhedBeregnet(holdbarhed);
    }
  }, [input, onHoldbarhedBeregnet]);
  
  // Opdater input når props ændres
  useEffect(() => {
    const nytInput = { ...input };
    
    if (bilData) {
      nytInput.hk = bilData.hk;
      nytInput.bilType = bilData.bilType;
    }
    
    if (daekData) {
      nytInput.daekBredde = daekData.bredde;
      nytInput.daekProfil = daekData.profil;
      nytInput.daekDiameter = daekData.diameter;
      nytInput.daekKategori = daekData.kategori;
    }
    
    setInput(nytInput);
  }, [bilData, daekData]);
  
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mt-4">
      <h3 className="text-lg font-medium mb-4">Forventet dækholdbarhed</h3>
      
      {resultat && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="text-sm text-blue-700">Forventet levetid</div>
              <div className="text-2xl font-bold text-blue-900">{resultat.forventetKm.toLocaleString()} km</div>
            </div>
            <div className="bg-green-50 p-3 rounded-md">
              <div className="text-sm text-green-700">Estimeret år</div>
              <div className="text-2xl font-bold text-green-900">{resultat.forventetAar} år</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-sm">
              <span>Slidfaktor</span>
              <span className={
                resultat.slidFaktor < 0.4 ? 'text-green-600' :
                resultat.slidFaktor < 0.7 ? 'text-yellow-600' : 'text-red-600'
              }>
                {Math.round(resultat.slidFaktor * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  resultat.slidFaktor < 0.4 ? 'bg-green-600' :
                  resultat.slidFaktor < 0.7 ? 'bg-yellow-500' : 'bg-red-600'
                }`}
                style={{ width: `${Math.round(resultat.slidFaktor * 100)}%` }}
              ></div>
            </div>
          </div>
          
          {resultat.anbefalinger.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">Anbefalinger</h4>
              <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                {resultat.anbefalinger.map((anbefaling, idx) => (
                  <li key={idx}>{anbefaling}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-6">
        <h4 className="font-medium mb-2">Juster parametre</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kørselstype
            </label>
            <select
              value={input.koerselsType}
              onChange={(e) => setInput({...input, koerselsType: e.target.value as any})}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="by">Primært bykørsel</option>
              <option value="landevej">Primært landevejskørsel</option>
              <option value="blandet">Blandet kørsel</option>
            </select>
          </div>
          
          {!bilData && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hestekræfter (HK)
                </label>
                <input
                  type="number"
                  value={input.hk}
                  onChange={(e) => setInput({...input, hk: Number(e.target.value)})}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biltype
                </label>
                <select
                  value={input.bilType}
                  onChange={(e) => setInput({...input, bilType: e.target.value as any})}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="personbil">Personbil</option>
                  <option value="varebil">Varebil</option>
                </select>
              </div>
            </>
          )}
          
          {!daekData && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bredde
                  </label>
                  <input
                    type="number"
                    value={input.daekBredde}
                    onChange={(e) => setInput({...input, daekBredde: Number(e.target.value)})}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profil
                  </label>
                  <input
                    type="number"
                    value={input.daekProfil}
                    onChange={(e) => setInput({...input, daekProfil: Number(e.target.value)})}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Diameter
                  </label>
                  <input
                    type="number"
                    value={input.daekDiameter}
                    onChange={(e) => setInput({...input, daekDiameter: Number(e.target.value)})}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dækkategori
                </label>
                <select
                  value={input.daekKategori}
                  onChange={(e) => setInput({...input, daekKategori: e.target.value as any})}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="budget">Budget</option>
                  <option value="economy">Economy</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DaekHoldbarhedBeregner;
