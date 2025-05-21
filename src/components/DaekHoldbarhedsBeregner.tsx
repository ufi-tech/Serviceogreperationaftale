import React, { useState, useEffect } from 'react';
import { FaCar, FaTruck, FaSyncAlt } from 'react-icons/fa';
import { RiRoadMapLine } from 'react-icons/ri';

// Interface for biltype data
interface BilTypeData {
  type: 'Personbil' | 'SUV' | 'Varebil';
  hk: number;
  vaegt: number;
}

// Interface for dækholdbarhedsdata
interface DaekHoldbarhedsData {
  budget: number;
  economy: number;
  premium: number;
}

// Interface for justeringsfaktorer
interface JusteringsFaktorer {
  koersel: {
    by: number;
    landevej: number;
    motorvej: number;
  };
  koerestil: 'Rolig' | 'Normal' | 'Sporty';
  saeson: 'Helårs' | 'Sommer' | 'Vinter';
}

// Props for komponenten
interface DaekHoldbarhedsBeregnerProps {
  onHoldbarhedChanged?: (holdbarhedsData: DaekHoldbarhedsData) => void;
  initialBilData?: BilTypeData;
}

// Konstanter for baseline værdier
const BASELINE_HOLDBARHED = {
  Personbil: {
    budget: 35000,
    economy: 42000,
    premium: 49000
  },
  SUV: {
    budget: 31500,
    economy: 37800,
    premium: 44100
  },
  Varebil: {
    budget: 28000, 
    economy: 33600,
    premium: 39200
  }
};

// Konstanter for justeringsfaktorer (procentvis)
const KOERESTIL_FAKTOR = {
  Rolig: 1.05,
  Normal: 1.0,
  Sporty: 0.9
};

const SAESON_FAKTOR = {
  Helårs: 0.95,
  Sommer: 1.0,
  Vinter: 0.9
};

const HK_FAKTOR_PER_50_OVER_100 = 0.95; // 5% reduktion for hver 50 HK over 100

const DaekHoldbarhedsBeregner: React.FC<DaekHoldbarhedsBeregnerProps> = ({ 
  onHoldbarhedChanged, 
  initialBilData 
}) => {
  // State for registreringsnummer input
  const [regnr, setRegnr] = useState<string>('');
  
  // State for bildata
  const [bilData, setBilData] = useState<BilTypeData>(
    initialBilData || { type: 'Personbil', hk: 100, vaegt: 1200 }
  );
  
  // State for holdbarhedsestimater
  const [holdbarhed, setHoldbarhed] = useState<DaekHoldbarhedsData>({
    budget: BASELINE_HOLDBARHED.Personbil.budget,
    economy: BASELINE_HOLDBARHED.Personbil.economy,
    premium: BASELINE_HOLDBARHED.Personbil.premium
  });
  
  // State for manuel justering
  const [manuelJustering, setManuelJustering] = useState<boolean>(false);
  
  // State for justeringsfaktorer
  const [justeringsFaktorer, setJusteringsFaktorer] = useState<JusteringsFaktorer>({
    koersel: {
      by: 30,
      landevej: 50,
      motorvej: 20
    },
    koerestil: 'Normal',
    saeson: 'Helårs'
  });
  
  // Beregn samlet justeringsfaktor
  const beregnJusteringsFaktor = (): number => {
    if (!manuelJustering) return 1.0;
    
    // Kørselsmønster faktor (by kørsel slider reducerer holdbarhed)
    const koerselFaktor = 1 - (justeringsFaktorer.koersel.by * 0.002); // Max 20% reduktion ved 100% bykørsel
    
    // Kørestil faktor
    const koerestilFaktor = KOERESTIL_FAKTOR[justeringsFaktorer.koerestil];
    
    // Sæson faktor
    const saesonFaktor = SAESON_FAKTOR[justeringsFaktorer.saeson];
    
    return koerselFaktor * koerestilFaktor * saesonFaktor;
  };
  
  // Beregn HK faktor
  const beregnHKFaktor = (hk: number): number => {
    if (hk <= 100) return 1.0;
    
    const hkOver100 = hk - 100;
    const antalTrin = Math.floor(hkOver100 / 50);
    
    return Math.pow(HK_FAKTOR_PER_50_OVER_100, antalTrin);
  };
  
  // Beregn estimeret holdbarhed baseret på bildata og justeringsfaktorer
  const beregnHoldbarhed = () => {
    // Basisværdier baseret på biltype
    const basisHoldbarhed = BASELINE_HOLDBARHED[bilData.type];
    
    // HK faktor
    const hkFaktor = beregnHKFaktor(bilData.hk);
    
    // Manuel justeringsfaktor
    const justeringsFaktor = beregnJusteringsFaktor();
    
    // Beregn endelige holdbarhedsværdier
    const nyHoldbarhed = {
      budget: Math.round(basisHoldbarhed.budget * hkFaktor * justeringsFaktor / 1000) * 1000,
      economy: Math.round(basisHoldbarhed.economy * hkFaktor * justeringsFaktor / 1000) * 1000,
      premium: Math.round(basisHoldbarhed.premium * hkFaktor * justeringsFaktor / 1000) * 1000
    };
    
    setHoldbarhed(nyHoldbarhed);
    
    // Kald callback hvis defineret
    if (onHoldbarhedChanged) {
      onHoldbarhedChanged(nyHoldbarhed);
    }
  };
  
  // Hent bildata fra registreringsnummer
  const hentBilData = async () => {
    try {
      // Denne del skal erstattes med et reelt API-kald til motorregistret
      // Mock data til demonstration
      const mockBilTypeData: BilTypeData = {
        type: Math.random() > 0.5 ? 'Personbil' : (Math.random() > 0.5 ? 'SUV' : 'Varebil'),
        hk: Math.floor(Math.random() * 200) + 70,
        vaegt: Math.floor(Math.random() * 1000) + 1000
      };
      
      setBilData(mockBilTypeData);
      
      // For demo: Vis en alert med fundne data
      alert(`Bil fundet: ${mockBilTypeData.type}, ${mockBilTypeData.hk} HK, ${mockBilTypeData.vaegt} kg`);
    } catch (error) {
      alert('Fejl ved opslag af registreringsnummer. Tjek venligst at nummeret er korrekt.');
    }
  };
  
  // Opdater holdbarhed når bildata eller justeringsfaktorer ændres
  useEffect(() => {
    beregnHoldbarhed();
  }, [bilData, manuelJustering, justeringsFaktorer]);
  
  // Funktion til at formatere tal med tusindtalsseparator
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mt-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
        <RiRoadMapLine className="mr-2" /> Dækholdbarheds-estimator
      </h3>
      
      {/* Registreringsnummer og biltypesektion */}
      <div className="mb-4 p-3 bg-gray-50 rounded-md">
        <div className="font-medium mb-2">Bil information:</div>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <div className="flex-grow sm:flex-grow-0">
            <label className="block text-xs text-gray-600 mb-1">Registreringsnummer</label>
            <div className="flex">
              <input 
                type="text" 
                value={regnr} 
                onChange={e => setRegnr(e.target.value)} 
                placeholder="AB 12 345" 
                className="w-full p-2 border rounded-l-md"
              />
              <button 
                onClick={hentBilData} 
                className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
              >
                Hent
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Biltype</label>
            <select 
              value={bilData.type} 
              onChange={e => setBilData({...bilData, type: e.target.value as any})} 
              className="p-2 border rounded-md w-full"
            >
              <option value="Personbil">Personbil</option>
              <option value="SUV">SUV</option>
              <option value="Varebil">Varebil</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">HK</label>
            <input 
              type="number" 
              value={bilData.hk} 
              onChange={e => setBilData({...bilData, hk: Number(e.target.value)})} 
              className="p-2 border rounded-md w-28"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Vægt (kg)</label>
            <input 
              type="number" 
              value={bilData.vaegt} 
              onChange={e => setBilData({...bilData, vaegt: Number(e.target.value)})} 
              className="p-2 border rounded-md w-28"
            />
          </div>
        </div>
      </div>
      
      {/* Holdbarhedsestimater */}
      <div className="mb-4 p-3 bg-gray-50 rounded-md">
        <div className="flex justify-between items-center mb-3">
          <div className="font-medium">
            Estimeret dækholdbarhed baseret på biltype og motoreffekt:
          </div>
          <button 
            onClick={beregnHoldbarhed} 
            className="flex items-center text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
          >
            <FaSyncAlt className="mr-1" /> Genberegn
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left py-2 px-4 bg-gray-100">Kvalitet</th>
                <th className="text-center py-2 px-4 bg-yellow-50">Budget</th>
                <th className="text-center py-2 px-4 bg-blue-50">Economy</th>
                <th className="text-center py-2 px-4 bg-green-50">Premium</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-4 border-t">Estimeret holdbarhed (km)</td>
                <td className="py-2 px-4 border-t text-center font-medium">{formatNumber(holdbarhed.budget)}</td>
                <td className="py-2 px-4 border-t text-center font-medium">{formatNumber(holdbarhed.economy)}</td>
                <td className="py-2 px-4 border-t text-center font-medium">{formatNumber(holdbarhed.premium)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mt-4">
          <label className="flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={manuelJustering} 
              onChange={e => setManuelJustering(e.target.checked)} 
              className="mr-2"
            />
            <span>Aktiver manuel justering</span>
          </label>
        </div>
      </div>
      
      {/* Manuel justeringssektion */}
      {manuelJustering && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="font-medium mb-2">Justeringsfaktorer:</div>
          
          <div className="mb-3">
            <label className="block text-sm mb-1">Kørselsmønster:</label>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-grow">
                <label className="block text-xs text-gray-600 mb-1">By (%)</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={justeringsFaktorer.koersel.by} 
                  onChange={e => {
                    const by = Number(e.target.value);
                    // Automatisk justering så summen altid er 100%
                    const resterende = 100 - by;
                    const landevej = Math.round(resterende * 0.7);
                    const motorvej = resterende - landevej;
                    
                    setJusteringsFaktorer({
                      ...justeringsFaktorer, 
                      koersel: {
                        by,
                        landevej,
                        motorvej
                      }
                    });
                  }} 
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>By: {justeringsFaktorer.koersel.by}%</span>
                  <span>Landevej: {justeringsFaktorer.koersel.landevej}%</span>
                  <span>Motorvej: {justeringsFaktorer.koersel.motorvej}%</span>
                </div>
              </div>
              
              <div className="text-sm font-medium px-2 py-1 bg-red-50 text-red-700 rounded">
                {justeringsFaktorer.koersel.by > 60 ? '-' : '+'}
                {Math.round(Math.abs(1 - (1 - (justeringsFaktorer.koersel.by * 0.002))) * 100)}%
              </div>
            </div>
          </div>
          
          <div className="mb-3 flex flex-wrap gap-4">
            <div>
              <label className="block text-sm mb-1">Kørestil:</label>
              <div className="flex items-center gap-3">
                <select 
                  value={justeringsFaktorer.koerestil} 
                  onChange={e => setJusteringsFaktorer({
                    ...justeringsFaktorer, 
                    koerestil: e.target.value as any
                  })} 
                  className="p-2 border rounded-md"
                >
                  <option value="Rolig">Rolig</option>
                  <option value="Normal">Normal</option>
                  <option value="Sporty">Sporty</option>
                </select>
                
                <div className={`text-sm font-medium px-2 py-1 rounded 
                  ${justeringsFaktorer.koerestil === 'Rolig' 
                    ? 'bg-green-50 text-green-700' 
                    : justeringsFaktorer.koerestil === 'Sporty' 
                      ? 'bg-red-50 text-red-700' 
                      : 'bg-gray-50 text-gray-700'
                  }`}>
                  {KOERESTIL_FAKTOR[justeringsFaktorer.koerestil] === 1 
                    ? '±0%' 
                    : (KOERESTIL_FAKTOR[justeringsFaktorer.koerestil] > 1 ? '+' : '-') + 
                      Math.round(Math.abs(1 - KOERESTIL_FAKTOR[justeringsFaktorer.koerestil]) * 100) + '%'
                  }
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm mb-1">Sæson:</label>
              <div className="flex items-center gap-3">
                <select 
                  value={justeringsFaktorer.saeson} 
                  onChange={e => setJusteringsFaktorer({
                    ...justeringsFaktorer, 
                    saeson: e.target.value as any
                  })} 
                  className="p-2 border rounded-md"
                >
                  <option value="Helårs">Helårsdæk</option>
                  <option value="Sommer">Sommerdæk</option>
                  <option value="Vinter">Vinterdæk</option>
                </select>
                
                <div className={`text-sm font-medium px-2 py-1 rounded 
                  ${justeringsFaktorer.saeson === 'Sommer' 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                  }`}>
                  {SAESON_FAKTOR[justeringsFaktorer.saeson] === 1 
                    ? '±0%' 
                    : (SAESON_FAKTOR[justeringsFaktorer.saeson] > 1 ? '+' : '-') + 
                      Math.round(Math.abs(1 - SAESON_FAKTOR[justeringsFaktorer.saeson]) * 100) + '%'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Prisindeks baseret på holdbarhed */}
      <div className="p-3 bg-blue-50 rounded-md">
        <div className="font-medium mb-2">Prisindeks baseret på holdbarhed:</div>
        <div className="flex justify-around text-center">
          <div>
            <div className="font-bold">Budget</div>
            <div className="bg-white px-3 py-1 rounded-full shadow-sm">
              100
            </div>
          </div>
          <div>
            <div className="font-bold">Economy</div>
            <div className="bg-white px-3 py-1 rounded-full shadow-sm">
              {Math.round((holdbarhed.economy / holdbarhed.budget) * 100)}
            </div>
          </div>
          <div>
            <div className="font-bold">Premium</div>
            <div className="bg-white px-3 py-1 rounded-full shadow-sm">
              {Math.round((holdbarhed.premium / holdbarhed.budget) * 100)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DaekHoldbarhedsBeregner;
