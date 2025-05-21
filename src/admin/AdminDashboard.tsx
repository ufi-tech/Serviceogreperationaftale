import React, { useState } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import SupplierManagement from './components/SupplierManagement';
import TirePricingConfig from './components/TirePricingConfig';
import TirePriceManagement from './components/TirePriceManagement';
import WarrantyManagement from './components/WarrantyManagement';
import RoadsideAssistanceManagement from './components/RoadsideAssistanceManagement';
import ServicePricingRules from './components/ServicePricingRules';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('suppliers');
  const [tireSubTab, setTireSubTab] = useState<string>('configuration');
  const navigate = useNavigate();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Admin header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Serviceaftale Administration</h1>
          <Link
            to="/"
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Tilbage til app
          </Link>
        </div>
      </header>

      {/* Admin tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => handleTabChange('suppliers')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'suppliers'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Underleverandører
            </button>
            <button
              onClick={() => handleTabChange('warranty')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'warranty'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Garantiberegning
            </button>
            <button
              onClick={() => handleTabChange('roadside')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'roadside'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Vejhjælp
            </button>
            <button
              onClick={() => handleTabChange('tires')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'tires'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dækberegning
            </button>
            <button
              onClick={() => handleTabChange('servicepricing')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'servicepricing'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Service- & Reparationspriser
            </button>
            <button
              onClick={() => handleTabChange('settings')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'settings'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Indstillinger
            </button>
          </nav>
        </div>

        {/* Content area */}
        <div className="py-6">
          {activeTab === 'suppliers' && <SupplierManagement />}
          {activeTab === 'warranty' && <WarrantyManagement />}
          {activeTab === 'roadside' && <RoadsideAssistanceManagement />}
          {activeTab === 'servicepricing' && (
            <div>
              <React.Suspense fallback={<div>Indlæser...</div>}>
                <ServicePricingRules />
              </React.Suspense>
            </div>
          )}
          {activeTab === 'tires' && (
            <div>
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setTireSubTab('configuration')}
                  className={`py-2 px-4 text-sm font-medium ${tireSubTab === 'configuration' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Priskonfiguration
                </button>
                <button
                  onClick={() => setTireSubTab('catalog')}
                  className={`py-2 px-4 text-sm font-medium ${tireSubTab === 'catalog' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Dækkatalog
                </button>
              </div>
              
              {tireSubTab === 'configuration' && <TirePricingConfig />}
              {tireSubTab === 'catalog' && <TirePriceManagement />}
            </div>
          )}
          {activeTab === 'settings' && <div>Indstillinger (Under udvikling)</div>}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
