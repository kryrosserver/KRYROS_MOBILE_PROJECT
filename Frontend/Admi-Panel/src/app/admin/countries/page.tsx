"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  RefreshCcw,
  Globe,
  DollarSign,
  CheckCircle2,
  XCircle,
  X,
  CreditCard,
  PlusCircle
} from "lucide-react";

type PaymentMethod = {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  isActive: boolean;
};

type Country = {
  id: string;
  name: string;
  code: string;
  currencyCode: string;
  currencySymbol: string;
  symbolPosition: "BEFORE" | "AFTER";
  exchangeRate: number;
  autoRate: boolean;
  lastRateUpdate?: string;
  flag?: string;
  status: boolean;
  isDefault: boolean;
  paymentMethods: PaymentMethod[];
};

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    code: "",
    currencyCode: "",
    currencySymbol: "",
    symbolPosition: "BEFORE" as "BEFORE" | "AFTER",
    exchangeRate: 1,
    autoRate: true,
    flag: "",
    status: true,
    isDefault: false,
  });

  const loadCountries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/countries", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load countries");
      const data = await res.json();
      setCountries(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  const handleOpenModal = (country?: Country) => {
    if (country) {
      setEditingCountry(country);
      setForm({
        name: country.name,
        code: country.code,
        currencyCode: country.currencyCode,
        currencySymbol: country.currencySymbol,
        symbolPosition: country.symbolPosition,
        exchangeRate: Number(country.exchangeRate),
        autoRate: country.autoRate,
        flag: country.flag || "",
        status: country.status,
        isDefault: country.isDefault,
      });
    } else {
      setEditingCountry(null);
      setForm({
        name: "",
        code: "",
        currencyCode: "",
        currencySymbol: "",
        symbolPosition: "BEFORE",
        exchangeRate: 1,
        autoRate: true,
        flag: "",
        status: true,
        isDefault: false,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingCountry 
        ? `/api/admin/countries/${editingCountry.id}` 
        : "/api/admin/countries";
      const method = editingCountry ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to save country");
      
      setShowModal(false);
      loadCountries();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this country?")) return;
    try {
      const res = await fetch(`/api/admin/countries/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      loadCountries();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.currencyCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Countries & Currencies</h1>
          <p className="text-slate-500">Manage multi-country support and exchange rates</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" />
          Add Country
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search country or currency..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            />
          </div>
          <button 
            onClick={() => loadCountries()}
            className="p-2 text-slate-500 hover:text-green-500 hover:bg-slate-50 rounded-lg transition-all"
            title="Refresh"
          >
            <RefreshCcw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                <th className="px-6 py-4">Country</th>
                <th className="px-6 py-4">Currency</th>
                <th className="px-6 py-4">Exchange Rate</th>
                <th className="px-6 py-4">Auto Update</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                    Loading countries...
                  </td>
                </tr>
              ) : filteredCountries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                    {searchTerm ? "No countries match your search" : "No countries added yet"}
                  </td>
                </tr>
              ) : filteredCountries.map((country) => (
                <tr key={country.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{country.flag || "🏳️"}</span>
                      <div>
                        <p className="font-semibold text-slate-900">{country.name}</p>
                        <p className="text-xs text-slate-500">{country.code}</p>
                      </div>
                      {country.isDefault && (
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">DEFAULT</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <p className="font-medium text-slate-700">{country.currencyCode} ({country.currencySymbol})</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Pos: {country.symbolPosition}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-600">
                    1 USD = {Number(country.exchangeRate).toFixed(2)} {country.currencyCode}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      country.autoRate ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"
                    }`}>
                      {country.autoRate ? "Automatic" : "Manual"}
                    </span>
                    {country.lastRateUpdate && (
                      <p className="text-[10px] text-slate-400 mt-1">
                        Updated: {new Date(country.lastRateUpdate).toLocaleString()}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      country.status ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {country.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(country)}
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(country.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {editingCountry ? "Edit Country" : "Add New Country"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Country Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Zambia"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Country Code (ISO)</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. ZM"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Currency Code</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. ZMW"
                    value={form.currencyCode}
                    onChange={(e) => setForm({ ...form, currencyCode: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Currency Symbol</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. ZK"
                    value={form.currencySymbol}
                    onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Symbol Position</label>
                  <select 
                    value={form.symbolPosition}
                    onChange={(e) => setForm({ ...form, symbolPosition: e.target.value as "BEFORE" | "AFTER" })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  >
                    <option value="BEFORE">Before Price ($100)</option>
                    <option value="AFTER">After Price (100 ZMW)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Flag Emoji</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 🇿🇲"
                    value={form.flag}
                    onChange={(e) => setForm({ ...form, flag: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">Exchange Rate (1 USD = ?)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Auto Update</span>
                    <button 
                      type="button"
                      onClick={() => setForm({ ...form, autoRate: !form.autoRate })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.autoRate ? "bg-purple-600" : "bg-slate-300"}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.autoRate ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                </div>
                <input 
                  type="number" 
                  step="0.000001"
                  disabled={form.autoRate}
                  value={form.exchangeRate}
                  onChange={(e) => setForm({ ...form, exchangeRate: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 disabled:opacity-50 font-mono"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-green-500 focus:ring-green-500/20"
                  />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Active Status</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500/20"
                  />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Set as Default</span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-[2] px-4 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg font-bold transition-all shadow-md shadow-green-500/20"
                >
                  {saving ? "Saving..." : editingCountry ? "Update Country" : "Save Country"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
