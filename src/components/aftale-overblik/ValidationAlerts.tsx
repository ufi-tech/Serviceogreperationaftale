import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

interface ValidationAlertsProps {
  directNavigation: boolean;
  indtegningskravOk: boolean;
  bilAlder: number;
  bilKm: number;
  maksAlderVedIndtegning: number;
  maksKmVedIndtegning: number;
}

const ValidationAlerts: React.FC<ValidationAlertsProps> = ({
  directNavigation,
  indtegningskravOk,
  bilAlder,
  bilKm,
  maksAlderVedIndtegning,
  maksKmVedIndtegning
}) => {
  return (
    <>
      {directNavigation && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
          <p className="font-bold">Advarsel</p>
          <p>Du er navigeret direkte til denne side. Nogle data mangler muligvis. Start venligst forfra for at sikre korrekt dataindsamling.</p>
        </div>
      )}

      {!indtegningskravOk && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <FaExclamationTriangle className="text-red-500" />
            </div>
            <div className="ml-3">
              <p className="font-bold">Bilen opfylder ikke kravene til indtegning</p>
              <div className="mt-2">
                <ul className="list-disc list-inside text-sm">
                  {bilAlder > maksAlderVedIndtegning && (
                    <li>Bilen er {bilAlder} år gammel, hvilket overstiger grænsen på {maksAlderVedIndtegning} år</li>
                  )}
                  {bilKm > maksKmVedIndtegning && (
                    <li>Bilen har kørt {bilKm.toLocaleString('da-DK')} km, hvilket overstiger grænsen på {maksKmVedIndtegning.toLocaleString('da-DK')} km</li>
                  )}
                </ul>
              </div>
              <p className="mt-2 text-sm">
                Kontakt venligst din serviceaftale-ansvarlige for at drøfte individuelle muligheder.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ValidationAlerts;
