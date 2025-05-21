import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaFilePdf, FaPrint, FaEye, FaCheck, FaExclamationTriangle, FaEnvelope } from 'react-icons/fa';

interface LocationState {
  kundedata?: any;
  aftaleData?: any;
  bildataFormData?: any;
}

const Kontrakt: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  // Indlæs data fra de foregående trin
  const [kundedata, setKundedata] = useState<any>(state?.kundedata || {});
  const [aftaleData, setAftaleData] = useState<any>(state?.aftaleData || {});
  const [bildataFormData, setBildataFormData] = useState<any>(state?.bildataFormData || {});
  
  // Kontrakt-relaterede states
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [pdfGenerated, setPdfGenerated] = useState<boolean>(false);
  const [smsSent, setSmsSent] = useState<boolean>(false);
  
  // Navigér tilbage til kundedata-siden
  const handleBack = () => {
    navigate('/kundedata', { state: { aftaleData, bildataFormData, kundedata } });
  };
  
  // Simulerede handlinger
  const generatePdf = () => {
    alert('Genererer kontrakt-PDF...');
    setPdfGenerated(true);
  };
  
  const viewPdf = () => {
    alert('DEMO: Her ville PDF-kontrakten åbne i et nyt vindue');
  };
  
  const printPdf = () => {
    alert('DEMO: Her ville PDF-kontrakten blive sendt til udskrift');
  };
  
  const sendToSignature = () => {
    alert('DEMO: Kontrakt sendes til underskrift via SMS til ' + kundedata.telefon);
    setSmsSent(true);
  };
  
  const sendToSupplier = (supplier: string) => {
    alert('DEMO: Her ville der åbne en email til ' + supplier);
  };
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header med navigations-knap */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={handleBack}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
        >
          <FaArrowLeft className="mr-2" /> Tilbage
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Kontrakt</h1>
        <div></div> {/* Tom div for at centrere titlen */}
      </div>
      
      {/* Kontrakt-oplysninger */}
      <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-50 to-white">
          <h2 className="text-lg font-medium text-gray-900">Kontraktdetaljer</h2>
        </div>
        <div className="border-t border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3">Kunde</h3>
              <p><span className="text-gray-500">Navn:</span> {kundedata.fornavn} {kundedata.efternavn}</p>
              <p><span className="text-gray-500">Email:</span> {kundedata.email}</p>
              <p><span className="text-gray-500">Telefon:</span> {kundedata.telefon}</p>
              <p><span className="text-gray-500">Adresse:</span> {kundedata.adresse}, {kundedata.postnummer} {kundedata.by}</p>
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3">Køretøj</h3>
              <p><span className="text-gray-500">Bil:</span> {bildataFormData.bilmaerke} {bildataFormData.model}</p>
              <p><span className="text-gray-500">Årgang:</span> {bildataFormData.aargang}</p>
              <p><span className="text-gray-500">Reg. nr:</span> {bildataFormData.nummerplade || '-'}</p>
              <p><span className="text-gray-500">Kilometer:</span> {bildataFormData.kilometer?.toLocaleString() || '-'} km</p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-base font-medium text-gray-900 mb-3">Aftale</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <p><span className="text-gray-500">Type:</span> {aftaleData.aftaletype || '-'}</p>
              <p><span className="text-gray-500">Løbetid:</span> {aftaleData.loebetid || '-'} år</p>
              <p><span className="text-gray-500">Månedlig ydelse:</span> {aftaleData.maanedligYdelse?.toLocaleString() || '-'} kr.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* PDF-generering og afsendelse */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-50 to-white">
          <h2 className="text-lg font-medium text-gray-900">Kontrakt-dokument</h2>
        </div>
        <div className="p-6">
          {!pdfGenerated ? (
            <div className="text-center p-6">
              <button
                onClick={generatePdf}
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaFilePdf className="mr-2" /> Generer kontrakt PDF
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                    <FaFilePdf className="text-red-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">Kontrakt er klar</h3>
                    <p className="text-sm text-gray-500">PDF-filen er genereret og klar til gennemgang</p>
                  </div>
                </div>
                <div className="space-x-3">
                  <button
                    onClick={viewPdf}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <FaEye className="mr-2" /> Se kontrakt
                  </button>
                  <button
                    onClick={printPdf}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <FaPrint className="mr-2" /> Print
                  </button>
                </div>
              </div>
              
              {!smsSent ? (
                <div>
                  <div className="flex items-center mb-4">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="terms" className="ml-2 text-sm text-gray-900">
                      Jeg bekræfter at oplysningerne er korrekte og accepterer vilkårene
                    </label>
                  </div>
                  <button
                    onClick={sendToSignature}
                    disabled={!acceptedTerms}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${acceptedTerms ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    <FaEnvelope className="mr-2" /> Send kontrakt til underskrift via SMS
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 p-4 rounded-md border border-green-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaCheck className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Kontrakt sendt til underskrift</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>Kontrakten er sendt til {kundedata.telefon}.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Underleverandør sektion - vises kun når SMS er sendt */}
      {smsSent && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-50 to-white">
            <h2 className="text-lg font-medium text-gray-900">Notificér underleverandører</h2>
          </div>
          <div className="p-6">
            <p className="mb-4 text-sm text-gray-600">
              Send besked til underleverandører for at opsætte de valgte services:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-1">Dækaftale</h3>
                <p className="text-sm text-gray-500 mb-4">CAC Mobility</p>
                <button 
                  onClick={() => sendToSupplier('CAC Mobility')}
                  className="inline-flex items-center px-3 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                >
                  <FaEnvelope className="mr-2" /> Send besked
                </button>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-1">Garantiforsikring</h3>
                <p className="text-sm text-gray-500 mb-4">Fragus</p>
                <button 
                  onClick={() => sendToSupplier('Fragus')}
                  className="inline-flex items-center px-3 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                >
                  <FaEnvelope className="mr-2" /> Send besked
                </button>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-1">Vejhjælp</h3>
                <p className="text-sm text-gray-500 mb-4">Assist 24</p>
                <button 
                  onClick={() => sendToSupplier('Assist 24')}
                  className="inline-flex items-center px-3 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                >
                  <FaEnvelope className="mr-2" /> Send besked
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Kontrakt;
