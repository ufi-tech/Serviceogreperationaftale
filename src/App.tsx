import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { FaCar, FaClipboardList, FaUser, FaFileSignature, FaCog } from 'react-icons/fa';
import Bildata from './pages/Bildata';
import AftaleoverblikPage from './pages/AftaleoverblikPage';
import Kundedata from './pages/Kundedata';
import Kontrakt from './pages/Kontrakt';
import Admin from './pages/Admin';
import ProgressStepper from './components/ProgressStepper';

// Admin pages for warranty, roadside assistance, and service & repair
import RoadsidePackagesAdminPage from './pages/admin/RoadsidePackagesAdminPage';
import RoadsidePricingRulesAdminPage from './pages/admin/RoadsidePricingRulesAdminPage';
import WarrantyPackagesAdminPage from './pages/admin/WarrantyPackagesAdminPage';
import ServiceRepairPackagesAdminPage from './pages/admin/ServiceRepairPackagesAdminPage';
import { MomsProvider } from './contexts/MomsContext';
import { BilProfilerProvider } from './contexts/BilProfilerContext';
import { LandProvider } from './contexts/LandContext';
import { PrisBeregnerProvider } from './contexts/PrisBeregnerContext';
import { ValidationProvider } from './contexts/ValidationContext';

function App() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('');

  // Definer alle mulige tabs
  const allTabs = [
    { id: 'bildata', path: '/', label: 'Bildata', icon: <FaCar /> },
    { id: 'aftaleoverblik', path: '/aftaleoverblik', label: 'Aftaleoverblik', icon: <FaClipboardList /> },
    { id: 'kundedata', path: '/kundedata', label: 'Kundedata', icon: <FaUser /> },
    { id: 'kontrakt', path: '/kontrakt', label: 'Kontrakt', icon: <FaFileSignature /> },
    { id: 'admin', path: '/admin', label: 'Admin', icon: <FaCog /> },
  ];
  
  // Check om vi er på admin-siden
  const isAdminPage = location.pathname === '/admin';
  
  // På bruger-sider (ikke admin) viser vi kun Admin-tab'en, da Progress-Stepper viser de andre
  // På admin siden viser vi alle tabs 
  const tabs = isAdminPage ? allTabs : [allTabs[4]]; // Kun vis Admin på brugersider

  return (
    <LandProvider>
      <MomsProvider>
        <PrisBeregnerProvider>
          <BilProfilerProvider>
            <ValidationProvider>
              <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow">
                  <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center">
                      <img 
                        src="/assets/logo.png" 
                        alt="Abiler Logo" 
                        className="h-16 w-auto" 
                      />
                      <h1 className="ml-4 text-2xl font-bold text-gray-900">Service & Reparationsaftale</h1>
                    </div>
                  </div>
                </header>

                {/* Navigation Tabs */}
                <nav className="bg-white border-b border-gray-200">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                      {tabs.map((tab) => (
                        <Link
                          key={tab.id}
                          to={tab.path}
                          className={`${
                            location.pathname === tab.path
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                        >
                          <span className="mr-2">{tab.icon}</span>
                          {tab.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </nav>

                {/* Progress Stepper - vises kun på bruger-siderne, ikke på Admin-siden */}
                {!isAdminPage && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                    <ProgressStepper />
                  </div>
                )}
                
                {/* Main Content */}
                <main className="max-w-7xl mx-auto py-4 sm:px-6 lg:px-8">
                  <div className="px-4 py-6 sm:px-0">
                    {/* <ProgressStepper /> Fjernet duplikat herfra */}
                    <Routes>
                      <Route path="/" element={<Bildata />} />
                      <Route path="/aftaleoverblik" element={<AftaleoverblikPage />} />
                      <Route path="/kundedata" element={<Kundedata />} />
                      <Route path="/kontrakt" element={<Kontrakt />} />
                      <Route path="/admin" element={<Admin />} />
                      
                      {/* Ruter til admin-sider for garanti, vejhjælp og service & reparation */}
                      <Route path="/admin/roadside-packages" element={<RoadsidePackagesAdminPage />} />
                      <Route path="/admin/roadside-packages/:packageId/pricing-rules" element={<RoadsidePricingRulesAdminPage />} />
                      <Route path="/admin/warranty-packages" element={<WarrantyPackagesAdminPage />} />
                      <Route path="/admin/service-repair-packages" element={<ServiceRepairPackagesAdminPage />} />
                    </Routes>
                  </div>
                </main>
              </div>
            </ValidationProvider>
          </BilProfilerProvider>
        </PrisBeregnerProvider>
      </MomsProvider>
    </LandProvider>
  );
}

export default App;
