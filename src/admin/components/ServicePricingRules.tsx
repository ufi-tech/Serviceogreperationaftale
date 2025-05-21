import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { ServicePricingRule } from '../../types/ServicePricingRule';
import {
  getServicePricingRules,
  createServicePricingRule,
  updateServicePricingRule,
  deleteServicePricingRule
} from '../../api/servicePricingRulesApi';

const emptyRule: Omit<ServicePricingRule, 'id' | 'createdAt' | 'updatedAt'> = {
  provider: '',
  type: 'service',
  minKm: 0,
  maxKm: 0,
  minHk: 0,
  maxHk: 0,
  monthlyPrice: 0,
};

export default function ServicePricingRules() {
  const [rules, setRules] = useState<ServicePricingRule[]>([]);
  const [editing, setEditing] = useState<ServicePricingRule | null>(null);
  const [form, setForm] = useState<any>(emptyRule);

  useEffect(() => {
    getServicePricingRules().then(setRules);
  }, []);

  function handleEdit(rule: ServicePricingRule) {
    setEditing(rule);
    setForm(rule);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((f: any) => ({ ...f, [name]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      await updateServicePricingRule(editing.id, form);
    } else {
      await createServicePricingRule({
        ...form,
        id: Math.random().toString(36).slice(2),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    setEditing(null);
    setForm(emptyRule);
    setRules(await getServicePricingRules());
  }

  async function handleDelete(id: string) {
    await deleteServicePricingRule(id);
    setRules(await getServicePricingRules());
  }

  function handleNew() {
    setEditing(null);
    setForm(emptyRule);
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-4">Service- & Reparationspriser</h2>
      <button className="mb-4 px-3 py-1 bg-blue-500 text-white rounded" onClick={handleNew}>Opret ny regel</button>
      <div className="flex gap-4 mb-4">
  <input
    type="file"
    accept=".csv"
    id="csv-import"
    style={{ display: 'none' }}
    onChange={async (e) => {
      if (!e.target.files?.length) return;
      const file = e.target.files[0];
      const text = await file.text();
      try {
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        if (parsed.errors.length) throw new Error(parsed.errors[0].message);
        // Map CSV rows to ServicePricingRule
        const importedRules = (parsed.data as any[]).map((row) => ({
          id: Math.random().toString(36).slice(2),
          provider: row.provider,
          type: row.type,
          minKm: Number(row.minKm),
          maxKm: Number(row.maxKm),
          minHk: Number(row.minHk),
          maxHk: Number(row.maxHk),
          monthlyPrice: Number(row.monthlyPrice),
          factoryWarrantyDiscount: row.factoryWarrantyDiscount ? Number(row.factoryWarrantyDiscount) : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        // Replace all rules (could be smarter merge if ønsket)
        for (const rule of importedRules) {
          await createServicePricingRule(rule);
        }
        setRules(await getServicePricingRules());
        alert('CSV importeret!');
      } catch (err: any) {
        alert('Fejl ved import: ' + err.message);
      }
    }}
  />
  <button
    className="px-3 py-1 bg-gray-200 rounded"
    onClick={() => document.getElementById('csv-import')?.click()}
  >
    Importér CSV
  </button>
  <button
    className="px-3 py-1 bg-gray-200 rounded"
    onClick={async () => {
      const csv = Papa.unparse(rules.map(({id,createdAt,updatedAt,...rest})=>rest));
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'ev-servicepricingrules.csv';
      a.click();
    }}
  >
    Exportér CSV
  </button>
  <a
    href="/ev-servicepricingrules-template.csv"
    download
    className="px-3 py-1 bg-gray-100 rounded border border-gray-300 text-blue-700 ml-2"
  >
    Hent CSV-skabelon
  </a>
</div>
<table className="w-full text-sm mb-6">
  <thead>
    <tr className="bg-gray-100">
      <th>Udbyder</th>
      <th>Type</th>
      <th>Kørsel (km/år)</th>
      <th>HK (min-max)</th>
      <th>Månedlig pris</th>
      <th>Rabat under fabriksgaranti</th>
      <th>Handling</th>
    </tr>
  </thead>
  <tbody>
    {rules.map(rule => (
      <tr key={rule.id} className="border-b">
        <td>{rule.provider}</td>
        <td>{rule.type}</td>
        <td>{rule.minKm} - {rule.maxKm}</td>
        <td>{rule.minHk} - {rule.maxHk}</td>
        <td>{rule.monthlyPrice} kr.</td>
        <td>{rule.type === 'service+repair' ? (rule.factoryWarrantyDiscount ? rule.factoryWarrantyDiscount + ' kr.' : '-') : '-'}</td>
        <td>
          <button onClick={() => handleEdit(rule)} className="text-blue-600 mr-2">Rediger</button>
          <button onClick={() => handleDelete(rule.id)} className="text-red-600">Slet</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
      <form onSubmit={handleSave} className="space-y-2">
  <div className="flex gap-4">
    <div>
      <label>Udbyder</label>
      <input name="provider" value={form.provider || ''} onChange={handleChange} className="border ml-2" />
    </div>
    <div>
      <label>Type</label>
      <select name="type" value={form.type} onChange={handleChange} className="border ml-2">
        <option value="service">Service</option>
        <option value="service+repair">Service & Reparation</option>
      </select>
    </div>
    <div>
      <label>Kørsel min (km/år)</label>
      <input type="number" name="minKm" value={form.minKm || ''} onChange={handleChange} className="border ml-2 w-24" />
    </div>
    <div>
      <label>Kørsel max (km/år)</label>
      <input type="number" name="maxKm" value={form.maxKm || ''} onChange={handleChange} className="border ml-2 w-24" />
    </div>
    <div>
      <label>HK min</label>
      <input type="number" name="minHk" value={form.minHk || ''} onChange={handleChange} className="border ml-2 w-16" />
    </div>
    <div>
      <label>HK max</label>
      <input type="number" name="maxHk" value={form.maxHk || ''} onChange={handleChange} className="border ml-2 w-16" />
    </div>
    <div>
      <label>Månedlig pris</label>
      <input type="number" name="monthlyPrice" value={form.monthlyPrice || ''} onChange={handleChange} className="border ml-2 w-24" />
    </div>
    {form.type === 'service+repair' && (
      <div>
        <label>Rabat under fabriksgaranti (kr/mdr)</label>
        <input type="number" name="factoryWarrantyDiscount" value={form.factoryWarrantyDiscount || ''} onChange={handleChange} className="border ml-2 w-24" />
      </div>
    )}
  </div>
  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Gem</button>
</form>
    </div>
  );
}
