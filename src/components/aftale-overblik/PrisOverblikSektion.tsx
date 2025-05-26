import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import { BeregnedePriser } from '../../types/aftale.types';
import { useMoms } from '../../contexts/MomsContext';

interface PrisOverblikSektionProps {
  beregnedePriser: BeregnedePriser;
  aftaleData: {
    aftaleType: string;
    garantiforsikring: {
      forhandlerBetaler50Procent: boolean;
    };
  };
  formatPris: (pris: number) => string;
}

const PrisOverblikSektion: React.FC<PrisOverblikSektionProps> = ({ 
  beregnedePriser, 
  aftaleData, 
  formatPris 
}) => {
  const { erPrivat } = useMoms();

  return (
    <div className="sticky top-4 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h2 className="font-medium text-gray-800">Prisoverblik</h2>
      </div>

      <div>
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Grundpris</span>
            <span className="font-medium">{formatPris(beregnedePriser.grundpris)}</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {aftaleData.aftaleType === 'service' 
              ? 'Serviceaftale Basis' 
              : 'Serviceaftale Plus'
            }
          </div>
        </div>

        {beregnedePriser.daekPris > 0 && (
          <div className="border-t border-gray-200 px-4 py-3">
            <div className="flex justify-between items-center font-medium">
              <span>Dækaftale</span>
              <span>{formatPris(beregnedePriser.daekPris)}</span>
            </div>
          </div>
        )}

        {beregnedePriser.vejhjaelpPris > 0 && (
          <div className="border-t border-gray-200 px-4 py-3">
            <div className="flex justify-between items-center font-medium">
              <span>Vejhjælp</span>
              <span>{formatPris(beregnedePriser.vejhjaelpPris)}</span>
            </div>
          </div>
        )}

        {beregnedePriser.garantiForsikringPris > 0 && (
          <div className="border-t border-gray-200 px-4 py-3">
            <div className="flex justify-between items-center font-medium">
              <span>Garantiforsikring</span>
              <span>{formatPris(beregnedePriser.garantiForsikringPris)}</span>
            </div>
            {aftaleData.garantiforsikring.forhandlerBetaler50Procent && (
              <div className="text-sm text-green-600 mt-1 text-right">Inkl. 50% forhandlerrabat</div>
            )}
          </div>
        )}

        <div className="border-t border-b border-gray-200 px-4 py-3">
          {/* Rabatlinje for fabriksgaranti hvis relevant */}
          {beregnedePriser.rabatter?.fabriksGaranti && beregnedePriser.rabatter.fabriksGaranti > 0 && (
            <div className="flex justify-between text-sm text-green-700">
              <span>Rabat pga. fabriksgaranti</span>
              <span>-{formatPris(beregnedePriser.rabatter.fabriksGaranti)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>Samlet pris (ekskl. moms)</span>
            <span className="font-medium">{formatPris(beregnedePriser.totalPris)}</span>
          </div>
        </div>

        <div className="mt-4 bg-blue-50 p-3 rounded-md border border-blue-200 mx-4 mb-4">
          <div className="text-center">
            <div className="text-gray-600 text-sm flex items-center justify-center">
              Månedlig ydelse
              <div className="relative ml-1 group">
                <button className="text-blue-400 hover:text-blue-600 focus:outline-none">
                  <FaInfoCircle size={15} />
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-3 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10 border border-blue-200">
                  <div className="text-xs text-gray-700">
                    Alle servicepriser (garanti, vejhjælp, dæk mm.) indtastes som årlig pris i admin. Systemet omregner automatisk til månedlig pris ud fra den valgte løbetid.
                  </div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                    <div className="w-3 h-3 bg-white border border-blue-200 rotate-45 transform origin-center"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-blue-700 text-2xl font-bold">
              {formatPris(beregnedePriser.maanedligPris)}/md
            </div>
            <div className="text-gray-500 text-xs">
              {erPrivat ? 'Inkl. moms' : 'Ekskl. moms'}
            </div>
          </div>
        </div>

        <div className="px-4 pb-4 text-sm text-gray-500">
          <p>
            Priserne er baseret på de valgte aftaledetaljer og kan ændres 
            hvis bilens oplysninger eller aftalebetingelser ændres.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrisOverblikSektion;
