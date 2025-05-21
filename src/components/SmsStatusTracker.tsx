import React, { useState, useEffect } from 'react';
import { FaSpinner, FaCheck, FaExclamationTriangle, FaEnvelope, FaEnvelopeOpen, FaUser, FaPhoneAlt, FaAt, FaMapMarkerAlt, FaSms, FaSync } from 'react-icons/fa';
import smsService, { SmsStatus, CustomerData } from '../services/SmsService';

interface SmsStatusTrackerProps {
  smsStatus: SmsStatus;
  onCustomerDataReceived: (data: CustomerData) => void;
}

const SmsStatusTracker: React.FC<SmsStatusTrackerProps> = ({ 
  smsStatus, 
  onCustomerDataReceived 
}) => {
  const [currentStatus, setCurrentStatus] = useState<SmsStatus>(smsStatus);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Poll for status updates
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const pollStatus = async () => {
      try {
        setIsPolling(true);
        
        // Hent status
        const status = await smsService.checkSmsStatus(smsStatus.id);
        setCurrentStatus(status);
        
        // Hvis kunden har indsendt data, hent den
        if (status.customerDataSubmitted && !customerData) {
          const data = await smsService.getCustomerData(smsStatus.id);
          if (data) {
            setCustomerData(data);
            onCustomerDataReceived(data);
          }
        }
      } catch (err) {
        console.error('Fejl ved polling af SMS status:', err);
        setError('Der opstod en fejl ved hentning af status. Prøv igen senere.');
      } finally {
        setIsPolling(false);
      }
    };
    
    // Start polling hvis kunden ikke har indsendt data endnu
    if (!currentStatus.customerDataSubmitted) {
      interval = setInterval(pollStatus, 5000); // Poll hvert 5. sekund
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [smsStatus.id, currentStatus.customerDataSubmitted, customerData, onCustomerDataReceived]);
  
  // Manuelt opdater status
  const handleRefreshStatus = async () => {
    try {
      setIsPolling(true);
      setError(null);
      
      const status = await smsService.checkSmsStatus(smsStatus.id);
      setCurrentStatus(status);
      
      if (status.customerDataSubmitted) {
        const data = await smsService.getCustomerData(smsStatus.id);
        if (data) {
          setCustomerData(data);
          onCustomerDataReceived(data);
        }
      }
    } catch (err) {
      console.error('Fejl ved manuel opdatering af status:', err);
      setError('Der opstod en fejl ved opdatering af status. Prøv igen senere.');
    } finally {
      setIsPolling(false);
    }
  };
  
  // Hjælpefunktion til at vise status
  const renderStatusIndicator = () => {
    if (currentStatus.customerDataSubmitted) {
      return <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"><FaCheck className="text-green-600 text-lg" /></div>;
    } else if (currentStatus.linkOpened) {
      return <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><FaEnvelopeOpen className="text-blue-600 text-lg" /></div>;
    } else if (currentStatus.status === 'delivered') {
      return <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center"><FaEnvelope className="text-blue-500 text-lg" /></div>;
    } else if (currentStatus.status === 'sent') {
      return <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"><FaEnvelope className="text-gray-600 text-lg" /></div>;
    } else {
      return <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center"><FaExclamationTriangle className="text-amber-600 text-lg" /></div>;
    }
  };
  
  const getStatusText = () => {
    if (currentStatus.customerDataSubmitted) {
      return 'Kundedata modtaget';
    } else if (currentStatus.linkOpened) {
      return 'Kunden har åbnet linket og udfylder data';
    } else if (currentStatus.status === 'delivered') {
      return 'SMS modtaget af kundens telefon';
    } else if (currentStatus.status === 'sent') {
      return 'SMS afsendt';
    } else {
      return 'Afventer status';
    }
  };
  
  // Progress trin baseret på status
  const getSteps = () => [
    { 
      label: 'SMS afsendt', 
      complete: ['sent', 'delivered'].includes(currentStatus.status) || currentStatus.linkOpened || currentStatus.customerDataSubmitted 
    },
    { 
      label: 'SMS modtaget', 
      complete: currentStatus.status === 'delivered' || currentStatus.linkOpened || currentStatus.customerDataSubmitted 
    },
    { 
      label: 'Link åbnet', 
      complete: currentStatus.linkOpened || currentStatus.customerDataSubmitted 
    },
    { 
      label: 'Data indsendt', 
      complete: currentStatus.customerDataSubmitted 
    }
  ];
  
  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-100 shadow-sm p-6 mb-6">
      <div className="flex items-center mb-5">
        <div className="bg-blue-100 rounded-full p-2 mr-3">
          <FaSms className="text-blue-600 text-xl" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800">SMS Status</h3>
      </div>
      
      <div className="bg-white rounded-lg border border-blue-100 p-5 shadow-inner">
        {/* Status header */}
        <div className="flex items-center space-x-4 mb-5">
          <div className="flex-shrink-0">
            {renderStatusIndicator()}
          </div>
          <div className="flex-grow">
            <p className="font-semibold text-lg">
              {getStatusText()}
            </p>
            <p className="text-sm text-gray-600">
              Sendt til: <span className="font-medium">{currentStatus.phoneNumber}</span> | 
              <span className="text-gray-500 ml-1 text-xs">
                {new Date(currentStatus.timestamp).toLocaleString('da-DK')}
              </span>
            </p>
          </div>
          <button
            onClick={handleRefreshStatus}
            disabled={isPolling}
            className="flex-shrink-0 inline-flex items-center p-3 border border-blue-200 rounded-lg shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Opdater status"
            title="Opdater status"
          >
            {isPolling ? (
              <FaSpinner className="animate-spin h-5 w-5" />
            ) : (
              <FaSync className="h-5 w-5" />
            )}
          </button>
        </div>
        
        {/* Progress steps */}
        <div className="mb-5">
          <div className="relative">
            {/* Progress bar */}
            <div className="overflow-hidden h-2 mb-6 text-xs flex rounded bg-gray-200">
              <div 
                style={{ 
                  width: `${Math.max(25, getSteps().filter(step => step.complete).length * 25)}%` 
                }} 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
              ></div>
            </div>
            
            {/* Steps */}
            <div className="flex justify-between">
              {getSteps().map((step, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full ${step.complete ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'} mb-1 transition-colors duration-300`}>
                    {step.complete ? <FaCheck /> : index + 1}
                  </div>
                  <div className="text-xs text-center max-w-[80px]">
                    <span className={step.complete ? 'text-blue-600 font-medium' : 'text-gray-500'}>{step.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-5 flex items-start">
            <FaExclamationTriangle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
      
      {/* Kundedata sektion */}
      {currentStatus.customerDataSubmitted && customerData && (
        <div className="mt-6 pt-2">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 rounded-full p-2 mr-3">
              <FaUser className="text-green-600 text-xl" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800">Modtagne kundeoplysninger</h4>
          </div>
          
          <div className="bg-white rounded-lg border border-green-100 p-5 shadow-inner">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 rounded-full p-1.5 mr-2">
                    <FaUser className="text-blue-600" />
                  </div>
                  <h5 className="font-medium">Kontaktoplysninger</h5>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="text-gray-500 w-20 flex-shrink-0">Navn:</span>
                    <span className="font-medium">{customerData.fornavn} {customerData.efternavn}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-500 w-20 flex-shrink-0">Email:</span>
                    <span className="font-medium text-blue-600">{customerData.email}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-500 w-20 flex-shrink-0">Telefon:</span>
                    <span className="font-medium">{customerData.telefon}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 rounded-full p-1.5 mr-2">
                    <FaMapMarkerAlt className="text-blue-600" />
                  </div>
                  <h5 className="font-medium">Adresseoplysninger</h5>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="text-gray-500 w-20 flex-shrink-0">Adresse:</span>
                    <span className="font-medium">{customerData.adresse}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-500 w-20 flex-shrink-0">Postnr:</span>
                    <span className="font-medium">{customerData.postnummer}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-500 w-20 flex-shrink-0">By:</span>
                    <span className="font-medium">{customerData.by}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-500 w-20 flex-shrink-0">Land:</span>
                    <span className="font-medium">{customerData.land}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 bg-green-50 border border-green-100 rounded-lg p-3 flex items-center">
              <FaCheck className="text-green-600 mr-2" />
              <p className="text-sm text-green-700">Kundedata er modtaget og kan nu bruges i kontrakten.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmsStatusTracker;
