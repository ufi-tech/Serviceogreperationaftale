import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaChevronDown, FaChevronUp, FaCheck } from 'react-icons/fa';
import GarantiforsikringValg from '../components/GarantiforsikringValg';

// Definer typer for biltype og brændstoftype
type BilType = 'personbil' | 'varebil' | 'suv' | 'andet';
type BraendstofType = 'benzin' | 'diesel' | 'el' | 'plugin' | 'andet';

interface GarantiforsikringSektionProps {
  valgt: boolean;
  pris: number;
  udbyder?: string;
  pakke?: string;
  forhandlerDækningProcent: 0 | 50 | 100;
  onToggle: (valgt: boolean) => void;
  onChange: (data: {
    valgt: boolean;
    udbyder?: string;
    pakke?: string;
    pris?: number;
    forhandlerDækningProcent?: 0 | 50 | 100;
  }) => void;
  bilAlder: number;
  bilKm: number;
  motorStoerrelseCcm?: number;
  motorEffektHk?: number;
  bilType: BilType;
  braendstofType: BraendstofType;
}

const GarantiforsikringSektion: React.FC<GarantiforsikringSektionProps> = ({
  valgt,
  pris,
  udbyder,
  pakke,
  forhandlerDækningProcent,
  onToggle,
  onChange,
  bilAlder,
  bilKm,
  motorStoerrelseCcm,
  motorEffektHk,
  bilType,
  braendstofType,
}) => {
  // Holder styr på om komponenten er udvidet
  const [isExpanded, setIsExpanded] = useState<boolean>(valgt);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Effekt til at sikre at sektionen automatisk vises/skjules baseret på toggle-status
  useEffect(() => {
    // Når toggle ændres, opdater visningsstatus - vis når aktiveret, skjul når deaktiveret
    setIsExpanded(valgt);
  }, [valgt]);
  
  const handleToggle = (checked: boolean) => {
    console.log('Garantiforsikring toggle klikket:', checked);
    // Brug kun onToggle callback som håndterer alt state i parent komponenten
    onToggle(checked);
    // Sektionen vises/skjules automatisk via useEffect baseret på valgt-status
  };
  return (
    <div 
      className={`mt-6 bg-white rounded-lg overflow-hidden border transition-all duration-200 ${
        isHovered ? 'border-amber-300 shadow-md' : 'border-gray-200'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header med toggle */}
      {/* Header uden onClick - kun for visning af information */}
      <div 
        className={`flex items-center justify-between px-6 py-4 transition-colors ${
          isHovered ? 'bg-amber-50' : 'bg-white'
        }`}
      >
        <div className="flex-1 flex items-center">
          <div className="bg-amber-100 rounded-full p-2 mr-3">
            <FaShieldAlt className="text-amber-600 text-lg" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Garantiforsikring</h3>
            <p className="text-sm text-gray-500">Få dækning af uforudsete reparationer</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">
            {pris > 0 ? `${pris} kr/md` : 'Vælg pakke'}
          </span>
          
          {/* Toggle for at aktivere/deaktivere */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={valgt}
              onChange={(e) => {
                e.stopPropagation();
                handleToggle(e.target.checked);
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${valgt ? 'bg-amber-500' : ''}`}></div>
          </label>
          {/* Pil-knap fjernet, da funktionaliteten nu kun styres via toggle */}
        </div>
      </div>
      
      {/* Indhold der vises når komponenten er udvidet */}
      {(isExpanded || valgt) && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          {valgt ? (
            <GarantiforsikringValg 
              initialSelected={valgt}
              udbyder={udbyder || ''}
              pakke={pakke || ''}
              pris={pris}
              // Konverter forhandlerDækningProcent til forhandlerBetaler50Procent for GarantiforsikringValg
              forhandlerBetaler50Procent={forhandlerDækningProcent === 50}
              forhandlerDækningProcent={forhandlerDækningProcent}
              bilAlder={bilAlder}
              bilKm={bilKm}
              motorStoerrelseCcm={motorStoerrelseCcm}
              motorEffektHk={motorEffektHk}
              bilType={bilType}
              braendstofType={braendstofType}
              onChange={onChange}
            />
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">Aktiver garantiforsikring for at se tilgængelige muligheder</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GarantiforsikringSektion;
