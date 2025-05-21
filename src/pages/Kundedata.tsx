import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLand } from '../contexts/LandContext';
import { FaArrowLeft, FaArrowRight, FaUser, FaCheck, FaExclamationTriangle, FaMobileAlt } from 'react-icons/fa';
import SendSmsForm from '../components/SendSmsForm';
import SmsStatusTracker from '../components/SmsStatusTracker';
import smsService, { SmsStatus, CustomerData } from '../services/SmsService';

interface LocationState {
  aftaleData?: any;
  bildataFormData?: any;
}

const Kundedata: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  // Brug LandContext til at få det valgte land
  const { selectedCountry, phoneCode } = useLand();
  
  // Opret state til data
  const [aftaleData, setAftaleData] = useState(state?.aftaleData || {});
  const [bildataFormData, setBildataFormData] = useState(state?.bildataFormData || {});
  const [smsStatus, setSmsStatus] = useState<SmsStatus | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [formComplete, setFormComplete] = useState(false);
  
  // Kundedata state
  const [formData, setFormData] = useState({
    fornavn: '',
    efternavn: '',
    email: '',
    telefon: '',
    adresse: '',
    postnummer: '',
    by: '',
    land: selectedCountry.label,
    samtykke: false
  });
  
  // Opdater land, når det valgte land ændres
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      land: selectedCountry.label
    }));
  }, [selectedCountry]);

  // Gå tilbage til Aftaleoverblik-siden
  const handleGoBack = () => {
    navigate('/aftaleoverblik', { 
      state: { 
        aftaleData, 
        bildataFormData,
        fromKundedata: true
      } 
    });
  };

  // Gå videre til Kontrakt-siden
  const handleContinue = () => {
    navigate('/kontrakt', { 
      state: { 
        aftaleData, 
        bildataFormData, 
        kundedata: formData 
      } 
    });
  };

  // Håndter feltændringer i manuel indtastning
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Valider formular
    validateForm();
  };

  // Validér om formularen er komplet
  const validateForm = () => {
    const requiredFields = ['fornavn', 'efternavn', 'email', 'telefon', 'adresse', 'postnummer', 'by'];
    const isComplete = requiredFields.every(field => formData[field as keyof typeof formData]);
    setFormComplete(isComplete && formData.samtykke);
  };

  // Når SMS er sendt
  const handleSmsSent = (status: SmsStatus) => {
    setSmsStatus(status);
  };

  // Når kundedata er modtaget fra SMS-flow
  const handleCustomerDataReceived = (data: CustomerData) => {
    setFormData({
      fornavn: data.fornavn,
      efternavn: data.efternavn,
      email: data.email,
      telefon: data.telefon,
      adresse: data.adresse,
      postnummer: data.postnummer,
      by: data.by,
      land: data.land,
      samtykke: data.samtykke
    });
    
    // Marker formularen som komplet
    setFormComplete(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Topbar med tilbage-knap og titel */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={handleGoBack}
          className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          <FaArrowLeft className="mr-2" /> Aftaleoverblik
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Kundeoplysninger</h1>
        <div></div> {/* Tom div for at centrere titlen */}
      </div>

      {/* Aftaleoverblik resumé - lille visning af bil og aftale */}
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm p-4 mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-2 mr-3 hidden sm:flex">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-lg">{bildataFormData.bilmaerke} {bildataFormData.model}</h3>
              <p className="text-sm text-gray-600">
                {bildataFormData.nummerplade ? 
                  <span className="bg-blue-50 text-blue-700 py-0.5 px-2 rounded font-medium">Reg: {bildataFormData.nummerplade}</span> : 
                  <span className="bg-amber-50 text-amber-700 py-0.5 px-2 rounded font-medium">Stelnr: {bildataFormData.stelnummer}</span>
                }
              </p>
            </div>
          </div>
          <div className="text-right bg-white py-2 px-4 rounded-lg border border-gray-100 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-gray-500">Serviceaftale</p>
            <p className="font-semibold text-blue-700">{aftaleData.aftaletype}, {aftaleData.loebetid} måneder</p>
          </div>
        </div>
      </div>

      {/* Kundedata indsamlingssektion */}
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 rounded-full p-2 mr-3">
            <FaUser className="text-blue-600 text-xl" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Kundeoplysninger</h2>
        </div>
        
        {/* Instruktionstekst */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8 rounded-r-lg">
          <p className="text-blue-700">
            Indtast kundens oplysninger manuelt eller send en SMS til kunden, så de selv kan indtaste deres oplysninger.
          </p>
        </div>

        {/* SMS formular - vises hvis ingen SMS er sendt endnu */}
        {!smsStatus && (
          <div className="bg-gradient-to-r from-white to-blue-50 rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <SendSmsForm 
              phoneCode={phoneCode} 
              onSmsSent={handleSmsSent} 
              aftaleOverblikData={{
                ...aftaleData,
                bilmaerke: bildataFormData.bilmaerke,
                model: bildataFormData.model
              }}
            />
          </div>
        )}
        
        {/* SMS status tracker - vises når en SMS er sendt */}
        {smsStatus && (
          <div className="bg-gradient-to-r from-white to-blue-50 rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <SmsStatusTracker 
              smsStatus={smsStatus} 
              onCustomerDataReceived={handleCustomerDataReceived} 
            />
          </div>
        )}
        
        {/* Toggle til manuel indtastning */}
        {!formComplete && (
          <div className="mt-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-1 border border-gray-200">
              <details className="group">
                <summary className="cursor-pointer flex items-center p-4 text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Indtast kundeoplysninger manuelt i stedet</span>
                  <svg className="w-5 h-5 ml-auto transform group-open:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="p-5 bg-gradient-to-r from-blue-50 to-white rounded-b-xl">
                  <form onSubmit={(e) => { e.preventDefault(); validateForm(); }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="fornavn" className="block text-sm font-medium text-gray-700">Fornavn <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          name="fornavn"
                          id="fornavn"
                          value={formData.fornavn}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all"
                          placeholder="Indtast fornavn"
                        />
                      </div>

                      <div>
                        <label htmlFor="efternavn" className="block text-sm font-medium text-gray-700">Efternavn <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          name="efternavn"
                          id="efternavn"
                          value={formData.efternavn}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all"
                          placeholder="Indtast efternavn"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all"
                          placeholder="eksempel@email.dk"
                        />
                      </div>

                      <div>
                        <label htmlFor="telefon" className="block text-sm font-medium text-gray-700">Telefon <span className="text-red-500">*</span></label>
                        <div className="mt-1 flex rounded-lg shadow-sm overflow-hidden">
                          <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm font-medium">
                            {phoneCode}
                          </span>
                          <input
                            type="tel"
                            name="telefon"
                            id="telefon"
                            value={formData.telefon}
                            onChange={handleChange}
                            required
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all"
                            placeholder="12 34 56 78"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label htmlFor="adresse" className="block text-sm font-medium text-gray-700">Adresse <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          name="adresse"
                          id="adresse"
                          value={formData.adresse}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all"
                          placeholder="Gade, husnummer"
                        />
                      </div>

                      <div>
                        <label htmlFor="postnummer" className="block text-sm font-medium text-gray-700">Postnummer <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          name="postnummer"
                          id="postnummer"
                          value={formData.postnummer}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all"
                          placeholder="1234"
                        />
                      </div>

                      <div>
                        <label htmlFor="by" className="block text-sm font-medium text-gray-700">By <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          name="by"
                          id="by"
                          value={formData.by}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all"
                          placeholder="Indtast by"
                        />
                      </div>

                      <div>
                        <label htmlFor="land" className="block text-sm font-medium text-gray-700">Land <span className="text-red-500">*</span></label>
                        <select
                          name="land"
                          id="land"
                          value={formData.land}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              land: e.target.value
                            }));
                          }}
                          required
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all"
                        >
                          <option value="Danmark">Danmark</option>
                          <option value="Sverige">Sverige</option>
                          <option value="Norge">Norge</option>
                          <option value="Finland">Finland</option>
                          <option value="Tyskland">Tyskland</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-6 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                      <div className="flex items-center">
                        <input
                          id="samtykke"
                          name="samtykke"
                          type="checkbox"
                          checked={formData.samtykke}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              samtykke: e.target.checked
                            }));
                            validateForm();
                          }}
                          required
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all"
                        />
                        <label htmlFor="samtykke" className="ml-3 block text-sm text-gray-700">
                          Jeg giver samtykke til behandling af mine personoplysninger <span className="text-red-500">*</span>
                        </label>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-center">
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105 duration-200"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Gem kundeoplysninger
                      </button>
                    </div>
                  </form>
                </div>
              </details>
            </div>
          </div>
        )}
      </div>

      {/* Navigationsknapper */}
      <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 mt-8">
        <button 
          onClick={handleGoBack}
          className="px-5 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center sm:justify-start"
        >
          <FaArrowLeft className="mr-2" /> Tilbage til aftaleoverblik
        </button>
        
        <button 
          onClick={handleContinue}
          disabled={!formComplete}
          className={`inline-flex items-center justify-center px-5 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white ${formComplete ? 'bg-blue-600 hover:bg-blue-700 transform transition-all hover:scale-105 duration-200' : 'bg-gray-300 cursor-not-allowed'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          Fortsæt til kontrakt <FaArrowRight className="ml-2" />
        </button>
      </div>
      
      {/* Information hvis data ikke er komplette */}
      {!formComplete && (
        <div className="mt-6 p-5 bg-gradient-to-r from-amber-50 to-white border-l-4 border-amber-400 rounded-r-xl shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="bg-amber-100 rounded-full p-2">
                <FaExclamationTriangle className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-base font-medium text-amber-800">Venligst udfyld alle påkrævede kundeoplysninger</h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>For at fortsætte til kontraktgenerering skal kundens oplysninger være udfyldt korrekt. Du kan enten:</p>
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Sende en SMS til kunden, så de selv kan udfylde oplysningerne</li>
                  <li>Indtaste kundens oplysninger manuelt via formularen ovenfor</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Kundedata;
