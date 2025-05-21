import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCar, FaClipboardList, FaUser, FaFileSignature, FaCheck, FaLock } from 'react-icons/fa';
import { useValidation, StepId } from '../contexts/ValidationContext';

interface Step {
  id: StepId;
  path: string;
  label: string;
  icon: React.ReactNode;
}

const ProgressStepper: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { validationStatus, isStepAccessible } = useValidation();

  const steps: Step[] = [
    { id: 'bildata', path: '/', label: 'Bildata', icon: <FaCar /> },
    { id: 'aftaleoverblik', path: '/aftaleoverblik', label: 'Aftaleoverblik', icon: <FaClipboardList /> },
    { id: 'kundedata', path: '/kundedata', label: 'Kundedata', icon: <FaUser /> },
    { id: 'kontrakt', path: '/kontrakt', label: 'Kontrakt', icon: <FaFileSignature /> },
  ];

  const activeStepIndex = steps.findIndex(step => step.path === location.pathname);
  const isAdminPage = location.pathname === '/admin';

  if (isAdminPage) {
    return null;
  }

  return (
    <div className="py-4 px-6 bg-white rounded-lg shadow-sm mb-6">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = activeStepIndex > index && validationStatus[step.id];
          const isActive = activeStepIndex === index;
          const accessible = isStepAccessible(step.id);

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center relative">
                <button 
                  onClick={() => {
                    if (accessible) {
                      navigate(step.path);
                    }
                  }}
                  disabled={!accessible}
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-blue-500 text-white' : accessible ? 'bg-gray-200 text-gray-500 hover:bg-gray-300' : 'bg-gray-200 text-gray-400 cursor-not-allowed'} ${accessible ? 'cursor-pointer' : 'cursor-not-allowed'} transition-colors`}
                  title={accessible ? `Gå til ${step.label}` : `Afslut og valider de forrige trin først`}
                >
                  {isCompleted ? <FaCheck /> : !accessible ? <FaLock size={10} /> : step.icon}
                </button>
                <span 
                  className={`mt-2 text-xs font-medium ${isActive ? 'text-blue-500' : isCompleted ? 'text-green-500' : accessible ? 'text-gray-500' : 'text-gray-400'}`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div 
                  className={`flex-1 h-1 mx-2 ${
                    (activeStepIndex > index && validationStatus[step.id]) ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressStepper;
