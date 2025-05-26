import React from 'react';

interface NavigationButtonsProps {
  isBekræftEnabled: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  isBekræftEnabled,
  onBack,
  onConfirm
}) => {
  return (
    <div className="mt-8 flex justify-between">
      <button
        onClick={onBack}
        className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Tilbage
      </button>
      <button
        onClick={onConfirm}
        disabled={!isBekræftEnabled}
        className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isBekræftEnabled ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
      >
        Bekræft og fortsæt
      </button>
    </div>
  );
};

export default NavigationButtons;
