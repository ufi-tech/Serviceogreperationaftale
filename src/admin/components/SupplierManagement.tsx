import React, { useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaEnvelope, FaPhone } from 'react-icons/fa';

// Leverandørtyper baseret på de services systemet understøtter
type SupplierType = 'service' | 'warranty' | 'roadside' | 'tires';

// Interface for underleverandører
interface Supplier {
  id: string;
  name: string;
  type: SupplierType;
  contactPerson: string;
  email: string;
  phone: string;
  active: boolean;
  emailTemplate: string;
}

// Mock-data til demo
const initialSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'CAC Mobility',
    type: 'service',
    contactPerson: 'Anders Jensen',
    email: 'service@cacmobility.dk',
    phone: '12345678',
    active: true,
    emailTemplate: 'Kære [contactPerson],\n\nVi har oprettet en ny serviceaftale for [customer] på køretøjet [make] [model], årgang [year] med registreringsnummer [regNumber].\n\nAftaletype: [serviceType]\nLøbetid: [duration] år\nForventet årligt køremønster: [annualKm] km\n\nVenligst bekræft modtagelsen af denne aftale og igangsæt de nødvendige processer.\n\nMed venlig hilsen,\n[sender]'
  },
  {
    id: '2',
    name: 'Fragus',
    type: 'warranty',
    contactPerson: 'Mette Nielsen',
    email: 'warranty@fragus.dk',
    phone: '87654321',
    active: true,
    emailTemplate: 'Kære [contactPerson],\n\nVi har solgt en garantiforsikring til [customer] for køretøjet [make] [model], årgang [year] med registreringsnummer [regNumber] og nuværende km-stand [mileage].\n\nGarantiniveau: [warrantyLevel]\nLøbetid: [duration] år\n\nVenligst bekræft modtagelsen og opret garantien i jeres system.\n\nMed venlig hilsen,\n[sender]'
  },
  {
    id: '3',
    name: 'Assist 24',
    type: 'roadside',
    contactPerson: 'Lars Petersen',
    email: 'support@assist24.dk',
    phone: '45678901',
    active: true,
    emailTemplate: 'Kære [contactPerson],\n\nVi har solgt et vejhjælpsabonnement til [customer] for køretøjet [make] [model], årgang [year] med registreringsnummer [regNumber].\n\nVejhjælpstype: [roadsideType]\nLøbetid: [duration] år\n\nVenligst bekræft modtagelsen og aktiver abonnementet i jeres system.\n\nMed venlig hilsen,\n[sender]'
  }
];

const SupplierManagement: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [viewTemplateId, setViewTemplateId] = useState<string | null>(null);

  // Nyt tomt leverandør-objekt
  const emptySupplier: Supplier = {
    id: Date.now().toString(),
    name: '',
    type: 'service',
    contactPerson: '',
    email: '',
    phone: '',
    active: true,
    emailTemplate: 'Kære [contactPerson],\n\nVi har oprettet en ny aftale for [customer]...\n\nMed venlig hilsen,\n[sender]'
  };

  // Håndter redigering af leverandør
  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier({...supplier});
    setIsAdding(false);
  };

  // Håndter tilføjelse af ny leverandør
  const handleAdd = () => {
    setEditingSupplier({...emptySupplier});
    setIsAdding(true);
  };

  // Håndter sletning af leverandør
  const handleDelete = (id: string) => {
    if (window.confirm('Er du sikker på, at du vil slette denne leverandør?')) {
      setSuppliers(suppliers.filter(supplier => supplier.id !== id));
    }
  };

  // Håndter gemning af ændringer
  const handleSave = () => {
    if (editingSupplier) {
      if (isAdding) {
        setSuppliers([...suppliers, editingSupplier]);
      } else {
        setSuppliers(suppliers.map(supplier => 
          supplier.id === editingSupplier.id ? editingSupplier : supplier
        ));
      }
      setEditingSupplier(null);
      setIsAdding(false);
    }
  };

  // Håndter annullering af redigering
  const handleCancel = () => {
    setEditingSupplier(null);
    setIsAdding(false);
  };

  // Opdater felter i redigeringstilstand
  const handleFieldChange = (field: keyof Supplier, value: string | boolean) => {
    if (editingSupplier) {
      setEditingSupplier({
        ...editingSupplier,
        [field]: value
      });
    }
  };

  // Typelabel-mapping
  const typeLabels: Record<SupplierType, string> = {
    service: 'Serviceaftale',
    warranty: 'Garantiforsikring',
    roadside: 'Vejhjælp',
    tires: 'Dækaftale'
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Underleverandør Administration</h3>
        <button
          onClick={handleAdd}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <FaPlus className="mr-2" /> Tilføj underleverandør
        </button>
      </div>

      {/* Redigeringsformular */}
      {editingSupplier && (
        <div className="bg-gray-50 p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">
              {isAdding ? 'Tilføj ny underleverandør' : 'Rediger underleverandør'}
            </h4>
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                <FaSave className="mr-2" /> Gem
              </button>
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                <FaTimes className="mr-2" /> Annuller
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Navn
                </label>
                <input
                  type="text"
                  value={editingSupplier.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={editingSupplier.type}
                  onChange={(e) => handleFieldChange('type', e.target.value as SupplierType)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="service">Serviceaftale</option>
                  <option value="warranty">Garantiforsikring</option>
                  <option value="roadside">Vejhjælp</option>
                  <option value="tires">Dækaftale</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kontaktperson
                </label>
                <input
                  type="text"
                  value={editingSupplier.contactPerson}
                  onChange={(e) => handleFieldChange('contactPerson', e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editingSupplier.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={editingSupplier.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div className="flex items-center mb-4">
                <input
                  id="active"
                  type="checkbox"
                  checked={editingSupplier.active}
                  onChange={(e) => handleFieldChange('active', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                  Aktiv
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email-skabelon
            </label>
            <div className="text-xs text-gray-500 mb-2">
              Brug variabler som [customer], [make], [model] osv. for dynamisk indhold
            </div>
            <textarea
              value={editingSupplier.emailTemplate}
              onChange={(e) => handleFieldChange('emailTemplate', e.target.value)}
              rows={8}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
      )}

      {/* Template visning */}
      {viewTemplateId && (
        <div className="bg-gray-50 p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">Email-skabelon</h4>
            <button
              onClick={() => setViewTemplateId(null)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              <FaTimes className="mr-2" /> Luk
            </button>
          </div>
          <div className="bg-white p-4 border border-gray-200 rounded-md whitespace-pre-wrap">
            {suppliers.find(s => s.id === viewTemplateId)?.emailTemplate}
          </div>
        </div>
      )}

      {/* Tabelliste */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Navn
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kontaktperson
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kontakt
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Handlinger
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {suppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{typeLabels[supplier.type]}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{supplier.contactPerson}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <FaEnvelope className="mr-1" /> {supplier.email}
                    <span className="mx-2">|</span>
                    <FaPhone className="mr-1" /> {supplier.phone}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    supplier.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {supplier.active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => setViewTemplateId(supplier.id)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Skabelon
                  </button>
                  <button
                    onClick={() => handleEdit(supplier)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(supplier.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupplierManagement;
