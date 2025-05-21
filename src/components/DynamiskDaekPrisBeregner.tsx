import React, { useState, useEffect } from 'react';
import { DaekPrisJusteringService } from '../services/DaekPrisJusteringService';
import { DaekHoldbarhedService, HoldbarhedInput, HoldbarhedOutput } from '../services/DaekHoldbarhedService';
import { FaInfoCircle } from 'react-icons/fa';

interface DynamiskDaekPrisBeregnerProps {
  bilData?: {
    hk: number;
    bilType: 'personbil' | 'varebil';
  };
  daekData: {
    bredde: number;
    profil: number;
    diameter: number;
    kategori: 'budget' | 'economy' | 'premium';
    saeson: 'sommer' | 'vinter' | 'helaar';
  };
  grundpris: number;
  visDetaljer?: boolean;
  onPrisBeregnet?: (pris: number, faktor: number) => void;
}

const DynamiskDaekPrisBeregner: React.FC<DynamiskDaekPrisBeregnerProps> = ({
  bilData,
  daekData,
  grundpris,
  visDetaljer = false,
  onPrisBeregnet
}) => {
  const [holdbarhed, setHoldbarhed] = useState<HoldbarhedOutput | null>(null);
  const [justeretPris, setJusteretPris] = useState<number>(grundpris);
  const [prisFaktor, setPrisFaktor] = useState<number>(1);
  const [showFaktorInfo, setShowFaktorInfo] = useState<boolean>(false);
  
  // Beregn holdbarhed baseret på bildata og dækdata
  useEffect(() => {
    if (!daekData || !bilData) return;

    const input: HoldbarhedInput = {
      hk: bilData.hk,
      bilType: bilData.bilType,
      daekBredde: daekData.bredde,
      daekProfil: daekData.profil,
      daekDiameter: daekData.diameter,
      daekKategori: daekData.kategori,
      koerselsType: 'blandet' // Standard koerselstype
    };
    
    const holdbarhedsData = DaekHoldbarhedService.beregnHoldbarhed(input);
    setHoldbarhed(holdbarhedsData);
  }, [bilData, daekData]);
  
  // Beregn den justerede pris baseret på dækdata, holdbarhed og grundpris
  useEffect(() => {
    if (!daekData) return;
    
    // Konverter strenge til tal
    const bredde = typeof daekData.bredde === 'string' 
      ? parseInt(daekData.bredde) 
      : daekData.bredde || 0;
    
    const profil = typeof daekData.profil === 'string' 
      ? parseInt(daekData.profil) 
      : daekData.profil || 0;
    
    const diameter = typeof daekData.diameter === 'string' 
      ? parseInt(daekData.diameter) 
      : daekData.diameter || 0;
    
    // Beregn prisjusteringsfaktor
    const faktor = DaekPrisJusteringService.beregnPrisjusteringsFaktor(
      holdbarhed,
      bredde,
      profil,
      diameter,
      daekData.saeson,
      daekData.kategori
    );
    
    // Beregn justeret pris
    const nyPris = Math.round(grundpris * faktor);
    
    // Opdater tilstand
    setJusteretPris(nyPris);
    setPrisFaktor(faktor);
    
    // Kald callback hvis defineret
    if (onPrisBeregnet) {
      onPrisBeregnet(nyPris, faktor);
    }
  }, [daekData, grundpris, holdbarhed, onPrisBeregnet]);
  
  // Forsimpling af faktorværdi til læsbar visning
  const formattedFaktor = () => {
    return Math.round(prisFaktor * 100) / 100;
  };
  
  // Farve til faktoren baseret på værdi
  const faktorFarve = () => {
    if (prisFaktor < 0.95) return 'text-green-600';
    if (prisFaktor > 1.05) return 'text-red-600';
    return 'text-gray-700';
  };
  
  // Beskrivelse af faktoren
  const faktorBeskrivelse = () => {
    if (prisFaktor < 0.9) return '(Betydelig rabat)';
    if (prisFaktor < 0.95) return '(Rabat)';
    if (prisFaktor > 1.1) return '(Betydelig tillæg)';
    if (prisFaktor > 1.05) return '(Tillæg)';
    return '(Standard)';
  };
  
  // Hvis komponenten ikke skal vise detaljer, returner kun en tom div
  if (!visDetaljer) {
    return null;
  }
  
  return (
    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm font-medium text-blue-800">Dynamisk prisjustering</div>
          <div className="flex items-center">
            <span className="text-sm mr-1">Prisjusteringsfaktor:</span>
            <span className={`font-medium ${faktorFarve()}`}>
              {formattedFaktor()}x
            </span>
            <span className="text-xs text-gray-500 ml-1">
              {faktorBeskrivelse()}
            </span>
            <button 
              onClick={() => setShowFaktorInfo(!showFaktorInfo)}
              className="ml-1 text-blue-500 hover:text-blue-700"
            >
              <FaInfoCircle />
            </button>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-blue-800">Beregnet pris</div>
          <div className="font-bold">
            {justeretPris.toLocaleString()} kr
          </div>
        </div>
      </div>
      
      {showFaktorInfo && (
        <div className="mt-3 p-2 bg-white rounded text-xs text-gray-600">
          <p className="mb-1">Prisjusteringsfaktoren tager højde for:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>Dækdimension: Større dæk = højere pris</li>
            <li>Dækprofil: Lavere profil = højere pris</li>
            <li>Sæsontype: Vinterdæk og helårsdæk har typisk tillæg</li>
            <li>Kvalitetskategori: Budget, economy, eller premium</li>
            {holdbarhed && (
              <li>Forventet holdbarhed: {holdbarhed.forventetKm.toLocaleString()} km / {holdbarhed.forventetAar} år</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DynamiskDaekPrisBeregner;
