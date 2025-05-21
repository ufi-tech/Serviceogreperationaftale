import React, { useState, useEffect } from 'react';
import { FaSpinner, FaPaperPlane, FaCheck, FaExclamationTriangle, FaMobileAlt, FaSms, FaCopy } from 'react-icons/fa';
import smsService, { SmsStatus } from '../services/SmsService';

interface SendSmsFormProps {
  phoneCode: string;
  onSmsSent: (smsStatus: SmsStatus) => void;
  aftaleOverblikData: any;
}

const SendSmsForm: React.FC<SendSmsFormProps> = ({ phoneCode, onSmsSent, aftaleOverblikData }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValidPhone, setIsValidPhone] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formattedNumber, setFormattedNumber] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const demoLink = 'https://service-aftale.dk/kundedata/abc123def456';
  
  // Validerer telefonnummeret
  const validatePhoneNumber = (value: string) => {
    // Simpel validering: Mindst 8 cifre
    const isValid = /^\d{8,}$/.test(value.trim());
    setIsValidPhone(isValid);
    return isValid;
  };
  
  // Formaterer telefonnummer med mellemrum for bedre læsbarhed
  useEffect(() => {
    if (phoneNumber) {
      // Indsæt mellemrum for hver 2 cifre (fx 12 34 56 78)
      const formatted = phoneNumber.replace(/(.{2})/g, '$1 ').trim();
      setFormattedNumber(formatted);
    } else {
      setFormattedNumber('');
    }
  }, [phoneNumber]);
  
  // Håndterer ændring af telefonnummer
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Fjern alle ikke-tal
    setPhoneNumber(value);
    validatePhoneNumber(value);
  };
  
  // Sender SMS
  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Indtast et gyldigt telefonnummer');
      return;
    }
    
    try {
      setIsSending(true);
      setError(null);
      
      // Send SMS med aftaledata
      const smsStatus = await smsService.sendCustomerDataCollectionSms(
        phoneNumber,
        phoneCode.replace('+', ''), // Fjern + fra landekoden
        aftaleOverblikData
      );
      
      // Callback til parent
      onSmsSent(smsStatus);
      
      // Nulstil form
      setPhoneNumber('');
      setIsValidPhone(false);
    } catch (err) {
      console.error('Fejl ved afsendelse af SMS:', err);
      setError('Der opstod en fejl ved afsendelse af SMS. Prøv igen senere.');
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-100 shadow-sm p-6 mb-6">
      <div className="flex items-center mb-4">
        <div className="bg-blue-100 rounded-full p-2 mr-3">
          <FaSms className="text-blue-600 text-xl" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800">Send SMS til kunden</h3>
      </div>
      
      <div className="pl-12 mb-6">
        <p className="text-gray-600">
          Send en SMS til kunden med et link, hvor de kan indtaste deres oplysninger. 
          SMS'en indeholder også en kort opsummering af aftalen.
        </p>
      </div>
      
      <div className="bg-white rounded-lg border border-blue-100 p-5 shadow-inner">
        <form onSubmit={handleSendSms}>
          <div className="mb-5">
            <label htmlFor="smsPhone" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <FaMobileAlt className="mr-2 text-blue-500" />
              Kundens mobilnummer
            </label>
            
            <div className="relative">
              {/* Telefonnummer input med landekode */}
              <div className="mt-1 flex rounded-lg shadow-sm overflow-hidden border border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 bg-white">
                <div className="inline-flex items-center px-4 py-2.5 border-r border-gray-300 bg-blue-50 text-blue-700 font-medium">
                  {phoneCode}
                </div>
                <input
                  type="tel"
                  id="smsPhone"
                  value={formattedNumber}
                  onChange={handlePhoneChange}
                  className="flex-1 min-w-0 block w-full px-4 py-2.5 border-0 focus:ring-0 text-base"
                  placeholder="12 34 56 78"
                  maxLength={24}
                  disabled={isSending}
                />
                
                {isValidPhone && !isSending && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <FaCheck className="text-green-500" />
                  </div>
                )}
              </div>
              
              {/* Info tekst under input */}
              <p className="mt-1.5 text-xs text-gray-500 pl-2">
                Landekode opdateres automatisk baseret på landevalg i admin
              </p>
            </div>
            
            {/* Fejlmeddelelse */}
            {error && (
              <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-md flex items-start">
                <FaExclamationTriangle className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
          
          {/* SMS Preview */}
          <div className="mb-5 bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs font-medium text-gray-500">SMS FORHÅNDSVISNING</p>
              <button 
                type="button" 
                onClick={() => {
                  navigator.clipboard.writeText(demoLink);
                  setLinkCopied(true);
                  setTimeout(() => setLinkCopied(false), 2000);
                }}
                className="text-xs flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <FaCopy className="mr-1" /> {linkCopied ? 'Kopieret!' : 'Kopier link'}
              </button>
            </div>
            <div className="relative bg-amber-50 p-3 rounded-lg border-l-4 border-amber-400">
              <p className="text-sm text-gray-600 leading-relaxed">
                <span className="font-semibold">Service-aftale:</span> Din serviceaftale er klar. For at gennemføre aftalen bedes du indtaste dine personlige oplysninger via nedenstående link. Herefter kan vi sende dig den endelige kontrakt til godkendelse.
                <br />
                <br />
                <span 
                  className="text-blue-600 underline cursor-pointer" 
                  onClick={() => {
                    navigator.clipboard.writeText(demoLink);
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 2000);
                  }}
                >
                  {demoLink}
                </span>
                {aftaleOverblikData?.bilmaerke && (
                  <><br /><br />Køretøj: {aftaleOverblikData.bilmaerke} {aftaleOverblikData.model}<br />Aftale: {aftaleOverblikData.aftaletype || 'Serviceaftale'}, {aftaleOverblikData.loebetid} måneder</>  
                )} 
              </p>
            </div>
          </div>
          
          {/* Send SMS knap */}
          <div className="flex justify-end">
            <button
              type="submit"
              className={`flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-lg shadow-sm text-white transition-all ${
                isValidPhone && !isSending
                  ? 'bg-blue-600 hover:bg-blue-700 transform hover:-translate-y-0.5'
                  : 'bg-gray-400 cursor-not-allowed'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              disabled={!isValidPhone || isSending}
            >
              {isSending ? (
                <>
                  <FaSpinner className="animate-spin mr-2 text-lg" /> Sender...
                </>
              ) : (
                <>
                  <FaPaperPlane className="mr-2 text-lg" /> Send SMS
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendSmsForm;
