"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Plus, Edit, Trash2, Search, RefreshCcw, Map as MapIcon, 
  ChevronLeft, X
} from "lucide-react";
import Link from "next/link";

export default function StatesPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ countryId: "", name: "", code: "", isActive: true });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, cRes] = await Promise.all([
        fetch("/api/admin/states"),
        fetch("/api/admin/countries")
      ]);
      const sJson = await sRes.json();
      const cJson = await cRes.json();
      setData(Array.isArray(sJson) ? sJson : sJson.data || []);
      setCountries(Array.isArray(cJson) ? cJson : cJson.data || []);
    } catch (e) {
      console.error("Error loading states:", e);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenModal = (item?: any) => {
    setEditingItem(item || null);
    setForm(item ? { ...item } : { countryId: "", name: "", code: "", isActive: true });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let url = `/api/admin/states`;
      if (editingItem) url += `/${editingItem.id}`;
      
      const res = await fetch(url, {
        method: editingItem ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowModal(false);
        loadData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || err.message || "Failed to save"}`);
      }
    } catch (e) {
      alert("Error saving");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this state?")) return;
    try {
      const res = await fetch(`/api/admin/states/${id}`, { method: "DELETE" });
      if (res.ok) loadData();
    } catch (e) {
      alert("Error deleting");
    }
  };

  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.country?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/locations-shipping" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">States / Provinces</h1>
            <p className="text-slate-500 text-sm">Manage administrative divisions for countries</p>
          </div>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-lg shadow-green-500/20"
        >
          <Plus className="h-5 w-5" />
          Add State
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search states..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
            />
          </div>
          <button onClick={loadData} className="p-2 text-slate-500 hover:text-green-600"><RefreshCcw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} /></button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-4">State Name</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Country</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Loading...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No states found</td></tr>
              ) : filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{item.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-500 font-mono">{item.code || "—"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-700">{item.country?.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${item.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}>
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenModal(item)} className="p-2 text-slate-400 hover:text-blue-500"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {editingItem ? "Edit State" : "Add State"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Country</label>
                  <select required className="w-full p-2 bg-slate-50 border rounded-lg mt-1" value={form.countryId} onChange={e => setForm({...form, countryId: e.target.value})}>
                    <option value="">Select a country</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">State Name</label>
                  <input required className="w-full p-2 bg-slate-50 border rounded-lg mt-1" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">State Code (Optional)</label>
                  <input className="w-full p-2 bg-slate-50 border rounded-lg mt-1" value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} />
                  <span className="text-xs font-bold text-slate-600 uppercase">Active</span>
                </label>
              </div>

              <button disabled={saving} className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold shadow-lg shadow-green-500/20 disabled:opacity-50 transition-all">
                {saving ? "Saving..." : "Confirm & Save"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}