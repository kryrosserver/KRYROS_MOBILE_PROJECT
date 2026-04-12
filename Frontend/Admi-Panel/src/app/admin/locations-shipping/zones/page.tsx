"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Plus, Edit, Trash2, Search, RefreshCcw, Truck, 
  ChevronLeft, X, PlusCircle
} from "lucide-react";
import Link from "next/link";

export default function ShippingZonesPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [activeZone, setActiveZone] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [zoneForm, setZoneForm] = useState({ name: "", countryId: "", stateId: "", cityId: "", priority: 0, isActive: true });
  const [methodForm, setMethodForm] = useState({ zoneId: "", name: "", price: "0", freeShippingThreshold: "0", estimatedDays: "", status: true });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [zRes, cRes, sRes] = await Promise.all([
        fetch("/api/admin/shipping-zones"),
        fetch("/api/admin/countries"),
        fetch("/api/admin/states")
      ]);
      const zJson = await zRes.json();
      const cJson = await cRes.json();
      const sJson = await sRes.json();
      setData(Array.isArray(zJson) ? zJson : zJson.data || []);
      setCountries(Array.isArray(cJson) ? cJson : cJson.data || []);
      setStates(Array.isArray(sJson) ? sJson : sJson.data || []);
    } catch (e) {
      console.error("Error loading zones:", e);
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
    setZoneForm(item ? { ...item } : { name: "", countryId: "", stateId: "", cityId: "", priority: 0, isActive: true });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let url = `/api/admin/shipping-zones`;
      if (editingItem) url += `/${editingItem.id}`;
      const res = await fetch(url, {
        method: editingItem ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(zoneForm),
      });
      if (res.ok) { setShowModal(false); loadData(); }
      else { alert("Failed to save zone"); }
    } finally { setSaving(false); }
  };

  const handleOpenMethodModal = (zone: any, method?: any) => {
    setActiveZone(zone);
    setEditingMethod(method || null);
    setMethodForm({
      zoneId: zone.id,
      name: method?.name || "",
      price: String(method?.price || 0),
      freeShippingThreshold: String(method?.freeShippingThreshold || 0),
      estimatedDays: method?.estimatedDays || "",
      status: method ? method.status : true,
    });
    setShowMethodModal(true);
  };

  const handleMethodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingMethod 
        ? `/api/admin/shipping-zones/methods/${editingMethod.id}` 
        : `/api/admin/shipping-zones/methods`;
      const body = {
        ...methodForm,
        price: parseFloat(methodForm.price) || 0,
        freeShippingThreshold: parseFloat(methodForm.freeShippingThreshold) || 0
      };
      const res = await fetch(url, {
        method: editingMethod ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) { setShowMethodModal(false); loadData(); }
      else { alert("Failed to save method"); }
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/locations-shipping" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Shipping Zones</h1>
            <p className="text-slate-500 text-sm">Create regional shipping rules and pricing</p>
          </div>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-lg shadow-green-500/20">
          <Plus className="h-5 w-5" /> Add Shipping Zone
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-4">Zone Name</th>
                <th className="px-6 py-4">Target Location</th>
                <th className="px-6 py-4">Methods</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No zones found</td></tr>
              ) : data.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-semibold text-slate-900">{item.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {item.city ? <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded uppercase font-bold">City: {item.city.name}</span> :
                       item.state ? <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded uppercase font-bold">State: {item.state.name}</span> :
                       item.country ? <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded uppercase font-bold">Country: {item.country.name}</span> :
                       <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded uppercase font-bold italic">Global Default</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      {item.shippingMethods?.map((m: any) => (
                        <div key={m.id} className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded group/method">
                          <span className="font-bold text-slate-700">{m.name} (${Number(m.price).toFixed(2)})</span>
                          <div className="flex gap-1 opacity-0 group-hover/method:opacity-100 transition-all">
                            <button onClick={() => handleOpenMethodModal(item, m)} className="p-1 text-blue-500 hover:bg-blue-100 rounded"><Edit className="h-3 w-3" /></button>
                          </div>
                        </div>
                      ))}
                      <button onClick={() => handleOpenMethodModal(item)} className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase tracking-widest"><PlusCircle className="h-3 w-3" /> Add Method</button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${item.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}>
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenModal(item)} className="p-2 text-slate-400 hover:text-blue-500"><Edit className="h-4 w-4" /></button>
                      <button onClick={async () => { if (confirm("Delete?")) { await fetch(`/api/admin/shipping-zones/${item.id}`, { method: "DELETE" }); loadData(); } }} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Zone Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <h2 className="text-xl font-bold">{editingItem ? "Edit Zone" : "Add Zone"}</h2>
            <div className="space-y-4">
              <div><label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Zone Name</label><input className="admin-input mt-1" value={zoneForm.name} onChange={e => setZoneForm({...zoneForm, name: e.target.value})} /></div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-3">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Target Selection</p>
                <select className="admin-input bg-white" value={zoneForm.countryId} onChange={e => setZoneForm({...zoneForm, countryId: e.target.value, stateId: "", cityId: ""})}>
                  <option value="">Global Default</option>
                  {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {zoneForm.countryId && (
                  <select className="admin-input bg-white" value={zoneForm.stateId} onChange={e => setZoneForm({...zoneForm, stateId: e.target.value, cityId: ""})}>
                    <option value="">Any State</option>
                    {states.filter(s => s.countryId === zoneForm.countryId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                )}
              </div>
            </div>
            <button onClick={handleSubmit} disabled={saving} className="w-full btn-primary h-12">{saving ? "Saving..." : "Save Zone"}</button>
            <button onClick={() => setShowModal(false)} className="w-full text-slate-500 text-sm font-bold uppercase tracking-widest">Cancel</button>
          </div>
        </div>
      )}

      {/* Method Modal */}
      {showMethodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-bold">{editingMethod ? "Edit Method" : "Add Method"}</h2>
            <div className="space-y-4">
              <div><label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Method Name</label><input className="admin-input mt-1" value={methodForm.name} onChange={e => setMethodForm({...methodForm, name: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Price ($)</label><input type="number" step="0.01" className="admin-input mt-1" value={methodForm.price} onChange={e => setMethodForm({...methodForm, price: e.target.value})} /></div>
                <div><label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Free Over ($)</label><input type="number" step="0.01" className="admin-input mt-1" value={methodForm.freeShippingThreshold} onChange={e => setMethodForm({...methodForm, freeShippingThreshold: e.target.value})} /></div>
              </div>
            </div>
            <button onClick={handleMethodSubmit} disabled={saving} className="w-full btn-primary h-12">{saving ? "Saving..." : "Save Method"}</button>
            <button onClick={() => setShowMethodModal(false)} className="w-full text-slate-500 text-sm font-bold uppercase tracking-widest">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}