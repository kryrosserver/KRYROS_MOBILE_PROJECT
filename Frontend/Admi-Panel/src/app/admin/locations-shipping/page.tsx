"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Plus, Edit, Trash2, Search, RefreshCcw, Globe, 
  MapPin, Building2, Truck, ChevronRight, Settings2, 
  CheckCircle2, XCircle, X, Map as MapIcon, PlusCircle,
  AlertCircle
} from "lucide-react";

type Tab = "countries" | "states" | "cities" | "zones";

export default function LocationsShippingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("countries");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [isNewShippingEnabled, setIsNewShippingEnabled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [activeZone, setActiveZone] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [countryForm, setCountryForm] = useState({ name: "", code: "", currencyCode: "", currencySymbol: "", symbolPosition: "BEFORE", exchangeRate: 1, autoRate: true, flag: "", status: true, isDefault: false });
  const [stateForm, setStateForm] = useState({ countryId: "", name: "", code: "", isActive: true });
  const [cityForm, setCityForm] = useState({ stateId: "", name: "", isActive: true });
  const [zoneForm, setZoneForm] = useState({ name: "", countryId: "", stateId: "", cityId: "", priority: 0, isActive: true });
  const [methodForm, setMethodForm] = useState({ zoneId: "", name: "", price: 0, freeShippingThreshold: 0, estimatedDays: "", status: true });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const statusRes = await fetch("/api/admin/shipping-zones/status");
      setIsNewShippingEnabled(await statusRes.json());

      let url = `/api/admin/${activeTab}`;
      if (activeTab === "zones") url = `/api/admin/shipping-zones`;
      const res = await fetch(url);
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);

      // Load dependencies
      if (activeTab === "states" || activeTab === "zones") {
        const cRes = await fetch("/api/admin/countries");
        setCountries(await cRes.json());
      }
      if (activeTab === "cities" || activeTab === "zones") {
        const sRes = await fetch("/api/admin/states");
        setStates(await sRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const toggleFeature = async (enabled: boolean) => {
    try {
      await fetch("/api/admin/shipping-zones/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      setIsNewShippingEnabled(enabled);
    } catch (e) {
      alert("Error toggling feature");
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenModal = (item?: any) => {
    setEditingItem(item || null);
    if (activeTab === "countries") {
      setCountryForm(item ? { ...item, exchangeRate: Number(item.exchangeRate) } : { name: "", code: "", currencyCode: "", currencySymbol: "", symbolPosition: "BEFORE", exchangeRate: 1, autoRate: true, flag: "", status: true, isDefault: false });
    } else if (activeTab === "states") {
      setStateForm(item ? { ...item } : { countryId: "", name: "", code: "", isActive: true });
    } else if (activeTab === "cities") {
      setCityForm(item ? { ...item } : { stateId: "", name: "", isActive: true });
    } else if (activeTab === "zones") {
      setZoneForm(item ? { ...item } : { name: "", countryId: "", stateId: "", cityId: "", priority: 0, isActive: true });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let url = `/api/admin/${activeTab === "zones" ? "shipping-zones" : activeTab}`;
      if (editingItem) url += `/${editingItem.id}`;
      
      const body = activeTab === "countries" ? countryForm : 
                   activeTab === "states" ? stateForm : 
                   activeTab === "cities" ? cityForm : zoneForm;

      const res = await fetch(url, {
        method: editingItem ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowModal(false);
        loadData();
      }
    } catch (e) {
      alert("Error saving");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      let url = `/api/admin/${activeTab === "zones" ? "shipping-zones" : activeTab}/${id}`;
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) loadData();
    } catch (e) {
      alert("Error deleting");
    }
  };

  const handleOpenMethodModal = (zone: any, method?: any) => {
    setActiveZone(zone);
    setEditingMethod(method || null);
    setMethodForm({
      zoneId: zone.id,
      name: method?.name || "",
      price: Number(method?.price || 0),
      freeShippingThreshold: Number(method?.freeShippingThreshold || 0),
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
      
      const res = await fetch(url, {
        method: editingMethod ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(methodForm),
      });

      if (res.ok) {
        setShowMethodModal(false);
        loadData();
      }
    } catch (e) {
      alert("Error saving method");
    } finally {
      setSaving(false);
    }
  };

  const handleMethodDelete = async (id: string) => {
    if (!confirm("Delete this shipping method?")) return;
    try {
      const res = await fetch(`/api/admin/shipping-zones/methods/${id}`, { method: "DELETE" });
      if (res.ok) loadData();
    } catch (e) {
      alert("Error deleting method");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${isNewShippingEnabled ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"}`}>
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Locations & Shipping System</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">
              Status: {isNewShippingEnabled ? "🟢 Active (Location Based)" : "⚪ Offline (Global Only)"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enable Location Shipping</span>
            <button 
              onClick={() => toggleFeature(!isNewShippingEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNewShippingEnabled ? "bg-kryros-green" : "bg-slate-300"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isNewShippingEnabled ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-kryros-green hover:bg-kryros-green/90 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-lg shadow-green-500/20"
          >
            <Plus className="h-5 w-5" />
            Add {activeTab.slice(0, -1)}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-8">
        {[
          { id: "countries", label: "Countries", icon: Globe },
          { id: "states", label: "States / Provinces", icon: MapIcon },
          { id: "cities", label: "Cities", icon: Building2 },
          { id: "zones", label: "Shipping Zones", icon: Truck },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium transition-all ${
              activeTab === tab.id 
                ? "border-kryros-green text-kryros-green" 
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kryros-green/20"
            />
          </div>
          <button onClick={loadData} className="p-2 text-slate-500 hover:text-kryros-green"><RefreshCcw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} /></button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-4">Name / Info</th>
                {activeTab === "countries" && <th className="px-6 py-4">Currency</th>}
                {activeTab === "states" && <th className="px-6 py-4">Country</th>}
                {activeTab === "cities" && <th className="px-6 py-4">State</th>}
                {activeTab === "zones" && <th className="px-6 py-4">Target Location</th>}
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No items found</td></tr>
              ) : data.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {activeTab === "countries" && <span className="text-xl">{item.flag || "🏳️"}</span>}
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        {item.code && <p className="text-xs text-slate-500">{item.code}</p>}
                      </div>
                    </div>
                  </td>
                  {activeTab === "countries" && <td className="px-6 py-4 text-sm font-medium">{item.currencyCode} ({item.currencySymbol})</td>}
                  {activeTab === "states" && <td className="px-6 py-4 text-sm">{item.country?.name}</td>}
                  {activeTab === "cities" && <td className="px-6 py-4 text-sm">{item.state?.name}</td>}
                  {activeTab === "zones" && (
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {item.city ? <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-tight">City: {item.city.name}</span> :
                           item.state ? <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-tight">State: {item.state.name}</span> :
                           item.country ? <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-tight">Country: {item.country.name}</span> :
                           <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded uppercase font-bold italic tracking-tight">Global Default</span>}
                        </div>
                        <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-2 mt-2">
                          {item.shippingMethods?.map((m: any) => (
                            <div key={m.id} className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded group/method">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-700">{m.name}</span>
                                <span className="text-slate-500">${Number(m.price).toFixed(2)} {m.freeShippingThreshold > 0 && `(Free > $${m.freeShippingThreshold})`}</span>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover/method:opacity-100 transition-all">
                                <button onClick={() => handleOpenMethodModal(item, m)} className="p-1 text-blue-500 hover:bg-blue-100 rounded"><Edit className="h-3 w-3" /></button>
                                <button onClick={() => handleMethodDelete(m.id)} className="p-1 text-red-500 hover:bg-red-100 rounded"><Trash2 className="h-3 w-3" /></button>
                              </div>
                            </div>
                          ))}
                          <button 
                            onClick={() => handleOpenMethodModal(item)}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-kryros-green hover:text-kryros-green/80 uppercase tracking-widest mt-1"
                          >
                            <PlusCircle className="h-3 w-3" />
                            Add Method
                          </button>
                        </div>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${item.status || item.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}>
                      {item.status || item.isActive ? "Active" : "Inactive"}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {editingItem ? `Edit ${activeTab.slice(0, -1)}` : `Add ${activeTab.slice(0, -1)}`}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {activeTab === "countries" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><label className="text-sm font-bold">Name</label><input required className="w-full p-2 bg-slate-50 border rounded-lg mt-1" value={countryForm.name} onChange={e => setCountryForm({...countryForm, name: e.target.value})} /></div>
                  <div><label className="text-sm font-bold">Code (ZM)</label><input required className="w-full p-2 bg-slate-50 border rounded-lg mt-1" value={countryForm.code} onChange={e => setCountryForm({...countryForm, code: e.target.value})} /></div>
                  <div><label className="text-sm font-bold">Flag Emoji</label><input className="w-full p-2 bg-slate-50 border rounded-lg mt-1" value={countryForm.flag} onChange={e => setCountryForm({...countryForm, flag: e.target.value})} /></div>
                </div>
              )}

              {activeTab === "states" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold">Select Country</label>
                    <select required className="w-full p-2 bg-slate-50 border rounded-lg mt-1" value={stateForm.countryId} onChange={e => setStateForm({...stateForm, countryId: e.target.value})}>
                      <option value="">Select a country</option>
                      {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div><label className="text-sm font-bold">State Name</label><input required className="w-full p-2 bg-slate-50 border rounded-lg mt-1" value={stateForm.name} onChange={e => setStateForm({...stateForm, name: e.target.value})} /></div>
                </div>
              )}

              {activeTab === "cities" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold">Select State</label>
                    <select required className="w-full p-2 bg-slate-50 border rounded-lg mt-1" value={cityForm.stateId} onChange={e => setCityForm({...cityForm, stateId: e.target.value})}>
                      <option value="">Select a state</option>
                      {states.map(s => <option key={s.id} value={s.id}>{s.name} ({s.country?.name})</option>)}
                    </select>
                  </div>
                  <div><label className="text-sm font-bold">City Name</label><input required className="w-full p-2 bg-slate-50 border rounded-lg mt-1" value={cityForm.name} onChange={e => setCityForm({...cityForm, name: e.target.value})} /></div>
                </div>
              )}

              {activeTab === "zones" && (
                <div className="space-y-4">
                  <div><label className="text-sm font-bold">Zone Name</label><input required className="w-full p-2 bg-slate-50 border rounded-lg mt-1" value={zoneForm.name} onChange={e => setZoneForm({...zoneForm, name: e.target.value})} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold">Priority (High first)</label>
                      <input type="number" className="w-full p-2 bg-slate-50 border rounded-lg mt-1" value={zoneForm.priority} onChange={e => setZoneForm({...zoneForm, priority: parseInt(e.target.value)})} />
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-3">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Scope Selection (Leave empty for Global)</p>
                    <select className="w-full p-2 bg-white border rounded-lg text-sm" value={zoneForm.countryId} onChange={e => setZoneForm({...zoneForm, countryId: e.target.value, stateId: "", cityId: ""})}>
                      <option value="">Any Country (Global)</option>
                      {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {zoneForm.countryId && (
                      <select className="w-full p-2 bg-white border rounded-lg text-sm" value={zoneForm.stateId} onChange={e => setZoneForm({...zoneForm, stateId: e.target.value, cityId: ""})}>
                        <option value="">Any State in this Country</option>
                        {states.filter(s => s.countryId === zoneForm.countryId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    )}
                    {zoneForm.stateId && (
                      <select className="w-full p-2 bg-white border rounded-lg text-sm" value={zoneForm.cityId} onChange={e => setZoneForm({...zoneForm, cityId: e.target.value})}>
                        <option value="">Any City in this State</option>
                        {states.find(s => s.id === zoneForm.stateId)?.cities?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              )}

              <button disabled={saving} className="w-full py-3 bg-kryros-green text-white rounded-lg font-bold shadow-lg shadow-green-500/20 disabled:opacity-50">
                {saving ? "Saving..." : "Confirm & Save"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Shipping Method Modal */}
      {showMethodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{editingMethod ? "Edit Method" : "Add Method"}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Zone: {activeZone?.name}</p>
              </div>
              <button onClick={() => setShowMethodModal(false)} className="p-2 text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleMethodSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold">Method Name</label>
                <input required placeholder="e.g. Express Shipping" className="w-full p-2 bg-slate-50 border rounded-lg mt-1" value={methodForm.name} onChange={e => setMethodForm({...methodForm, name: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold">Price ($)</label>
                  <input type="number" step="0.01" className="w-full p-2 bg-slate-50 border rounded-lg mt-1" value={methodForm.price} onChange={e => setMethodForm({...methodForm, price: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold">Free Threshold ($)</label>
                  <input type="number" step="0.01" className="w-full p-2 bg-slate-50 border rounded-lg mt-1" value={methodForm.freeShippingThreshold} onChange={e => setMethodForm({...methodForm, freeShippingThreshold: parseFloat(e.target.value)})} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold">Estimated Days</label>
                <input placeholder="e.g. 3-5 days" className="w-full p-2 bg-slate-50 border rounded-lg mt-1" value={methodForm.estimatedDays} onChange={e => setMethodForm({...methodForm, estimatedDays: e.target.value})} />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" checked={methodForm.status} onChange={e => setMethodForm({...methodForm, status: e.target.checked})} />
                <span className="text-sm font-medium">Method Active</span>
              </div>

              <button disabled={saving} className="w-full py-3 bg-kryros-green text-white rounded-lg font-bold shadow-lg shadow-green-500/20 disabled:opacity-50">
                {saving ? "Saving..." : "Confirm Method"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
