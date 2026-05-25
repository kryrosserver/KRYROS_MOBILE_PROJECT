"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Edit, Trash2, RefreshCw, Truck, ChevronLeft, X, ChevronRight, PlusCircle, Globe, Map as MapIcon, Building2 } from "lucide-react";
import Link from "next/link";

const ACCENT = "#EF4444";

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>{children}</label>;
}

function DarkModal({ title, onClose, width = "max-w-lg", children }: { title: string; onClose: () => void; width?: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}>
      <div className={`w-full ${width} rounded-2xl overflow-hidden`} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--card-border)" }}>
          <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{title}</h2>
          <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center btn-secondary !px-0"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function ShippingZonesPage() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf: number;
    function applyHeight(s: number) { if (!innerRef.current || !outerRef.current) return; outerRef.current.style.height = "auto"; const h = innerRef.current.scrollHeight * s; const avail = window.innerWidth < 1024 ? window.innerHeight - 64 : Infinity; outerRef.current.style.height = `${Math.max(h, avail)}px`; }
    function recalc() { if (!innerRef.current || !outerRef.current) return; const vw = outerRef.current.offsetWidth || window.innerWidth; const base = vw < 960 ? 750 : 1380; const s = Math.min(1, vw / base); innerRef.current.style.width = `${base}px`; innerRef.current.style.transform = `scale(${s})`; innerRef.current.style.transformOrigin = "top left"; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(s))); }
    recalc(); const t = setTimeout(recalc, 400); window.addEventListener("resize", recalc); return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [activeZone, setActiveZone] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [zoneForm, setZoneForm] = useState({ name: "", countryId: "", stateId: "", cityId: "", priority: 0, isActive: true });
  const [methodForm, setMethodForm] = useState({ zoneId: "", name: "", price: "0", freeShippingThreshold: "0", estimatedDays: "", status: true, sortOrder: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [zR, cR, sR] = await Promise.all([fetch("/api/admin/shipping-zones"), fetch("/api/admin/countries"), fetch("/api/admin/states")]);
      const zJ = await zR.json(); const cJ = await cR.json(); const sJ = await sR.json();
      setData(Array.isArray(zJ) ? zJ : zJ.data || []);
      setCountries(Array.isArray(cJ) ? cJ : cJ.data || []);
      setStates(Array.isArray(sJ) ? sJ : sJ.data || []);
    } catch { setData([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = () => { setIsRefreshing(true); load().finally(() => setTimeout(() => setIsRefreshing(false), 300)); };

  const openZoneModal = (item?: any) => {
    setEditingItem(item || null);
    setZoneForm(item ? { ...item } : { name: "", countryId: "", stateId: "", cityId: "", priority: 0, isActive: true });
    setShowModal(true);
  };

  const handleZoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const url = `/api/admin/shipping-zones${editingItem ? `/${editingItem.id}` : ""}`;
      const r = await fetch(url, { method: editingItem ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(zoneForm) });
      if (r.ok) { setShowModal(false); load(); }
      else alert("Failed to save zone");
    } finally { setSaving(false); }
  };

  const openMethodModal = (zone: any, method?: any) => {
    setActiveZone(zone); setEditingMethod(method || null);
    setMethodForm({ zoneId: zone.id, name: method?.name || "", price: String(method?.price || 0), freeShippingThreshold: String(method?.freeShippingThreshold || 0), estimatedDays: method?.estimatedDays || "", status: method ? method.status : true, sortOrder: method?.sortOrder || 0 });
    setShowMethodModal(true);
  };

  const handleMethodSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const url = editingMethod ? `/api/admin/shipping-zones/methods/${editingMethod.id}` : `/api/admin/shipping-zones/methods`;
      const body = { ...methodForm, price: parseFloat(methodForm.price) || 0, freeShippingThreshold: parseFloat(methodForm.freeShippingThreshold) || 0, sortOrder: parseInt(String(methodForm.sortOrder)) || 0 };
      const r = await fetch(url, { method: editingMethod ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (r.ok) { setShowMethodModal(false); load(); }
      else alert("Failed to save method");
    } finally { setSaving(false); }
  };

  const totalMethods = data.reduce((sum, z) => sum + (z.shippingMethods?.length || 0), 0);
  const stats = [
    { label: "Shipping Zones",   value: data.length,                          color: ACCENT,    bg: "rgba(239,68,68,0.12)",   icon: Truck },
    { label: "Active Zones",     value: data.filter(d => d.isActive).length,  color: "#16C784", bg: "rgba(22,199,132,0.12)",  icon: Truck },
    { label: "Total Methods",    value: totalMethods,                          color: "#12D6C5", bg: "rgba(18,214,197,0.12)",  icon: Truck },
  ];

  function LocationTag({ zone }: { zone: any }) {
    if (zone.city) return <span className="px-2 py-0.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1" style={{ background: "rgba(59,130,246,0.12)", color: "#3B82F6" }}><Building2 className="h-3 w-3" />{zone.city.name}</span>;
    if (zone.state) return <span className="px-2 py-0.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1" style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B" }}><MapIcon className="h-3 w-3" />{zone.state.name}</span>;
    if (zone.country) return <span className="px-2 py-0.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1" style={{ background: "rgba(22,199,132,0.12)", color: "#16C784" }}><Globe className="h-3 w-3" />{zone.country.name}</span>;
    return <span className="px-2 py-0.5 rounded-lg text-xs font-semibold" style={{ background: "var(--icon-bg)", color: "var(--text-muted)" }}>Global Default</span>;
  }

  return (
    <div ref={outerRef} style={{ overflow: "auto", background: "var(--bg-primary)", margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: "var(--bg-primary)", padding: "24px" }}>
        <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)" }}>

          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/admin/locations-shipping" className="h-9 w-9 rounded-xl flex items-center justify-center btn-secondary !px-0"><ChevronLeft className="h-4 w-4" /></Link>
              <div>
                <div className="flex items-center gap-2 text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>
                  <Link href="/admin/locations-shipping" style={{ color: "var(--text-muted)" }}>Locations & Shipping</Link><span>/</span><span>Zones</span>
                </div>
                <h1 className="text-2xl font-bold whitespace-nowrap">Shipping Zones</h1>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Create regional shipping rules and pricing</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleRefresh} className="btn-secondary !h-10 !w-10 !px-0 flex items-center justify-center">
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
              <button onClick={() => openZoneModal()} className="btn-primary flex items-center gap-2 px-4 h-10">
                <Plus className="h-4 w-4" /> Add Zone
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {stats.map(s => (
              <div key={s.label} className="admin-card !p-5">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}><s.icon className="h-5 w-5" style={{ color: s.color }} /></div>
                <p className="text-sm" style={{ color: "var(--text-secondary)", minHeight: "2.5rem" }}>{s.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="admin-card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead><tr><th>Zone Name</th><th>Target Location</th><th>Shipping Methods</th><th>Priority</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
                <tbody>
                  {loading ? (
                    [...Array(4)].map((_, i) => <tr key={i}><td colSpan={6}><div className="h-5 rounded animate-pulse my-1 mx-2" style={{ background: "var(--icon-bg)" }} /></td></tr>)
                  ) : data.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-14">
                      <Truck className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--text-muted)" }} />
                      <p className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>No shipping zones yet</p>
                      <button onClick={() => openZoneModal()} className="inline-flex items-center gap-1 text-xs font-semibold mt-2" style={{ color: "#12D6C5" }}>
                        <Plus className="h-3.5 w-3.5" /> Create your first zone
                      </button>
                    </td></tr>
                  ) : data.map(item => (
                    <tr key={item.id}>
                      <td><p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{item.name}</p></td>
                      <td><LocationTag zone={item} /></td>
                      <td>
                        <div className="flex flex-col gap-1">
                          {item.shippingMethods?.map((m: any) => (
                            <div key={m.id} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg group/method"
                              style={{ background: "var(--hover-bg)", border: "1px solid var(--card-border)" }}>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: "var(--icon-bg)", color: "var(--text-muted)" }}>#{m.sortOrder ?? 0}</span>
                                <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{m.name}</span>
                                <span className="text-xs font-bold" style={{ color: "#12D6C5" }}>${Number(m.price).toFixed(2)}</span>
                              </div>
                              <button onClick={() => openMethodModal(item, m)} className="opacity-0 group-hover/method:opacity-100 h-5 w-5 rounded flex items-center justify-center btn-secondary !px-0 transition-opacity">
                                <Edit className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                          <button onClick={() => openMethodModal(item)} className="flex items-center gap-1 text-xs font-semibold px-2 py-1.5 rounded-lg transition-all"
                            style={{ color: "#12D6C5" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(18,214,197,0.08)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <PlusCircle className="h-3.5 w-3.5" /> Add Method
                          </button>
                        </div>
                      </td>
                      <td>
                        <span className="text-xs font-mono px-2 py-0.5 rounded-lg" style={{ background: "var(--icon-bg)", color: "var(--text-muted)" }}>{item.priority ?? 0}</span>
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold"
                          style={item.isActive ? { background: "rgba(22,199,132,0.12)", color: "#16C784" } : { background: "var(--icon-bg)", color: "var(--text-muted)" }}>
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openZoneModal(item)} className="h-8 w-8 rounded-lg flex items-center justify-center btn-secondary !px-0"><Edit className="h-4 w-4" /></button>
                          <button onClick={async () => { if (confirm("Delete this zone?")) { await fetch(`/api/admin/shipping-zones/${item.id}`, { method: "DELETE" }); load(); } }}
                            className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors" style={{ color: "var(--text-muted)" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#EF4444"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}>
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
        </div>
      </div>

      {/* Zone Modal */}
      {showModal && (
        <DarkModal title={editingItem ? "Edit Zone" : "Add Shipping Zone"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleZoneSubmit} className="space-y-4">
            <div><Label>Zone Name</Label><input required value={zoneForm.name} onChange={e => setZoneForm(f => ({ ...f, name: e.target.value }))} className="admin-input w-full" placeholder="e.g. Lusaka Metro" /></div>
            <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--hover-bg)", border: "1px solid var(--card-border)" }}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Target Location</p>
              <div><Label>Country</Label>
                <select value={zoneForm.countryId} onChange={e => setZoneForm(f => ({ ...f, countryId: e.target.value, stateId: "", cityId: "" }))} className="admin-input w-full">
                  <option value="">Global Default (All)</option>
                  {countries.map(c => <option key={c.id} value={c.id}>{c.flag} {c.name}</option>)}
                </select>
              </div>
              {zoneForm.countryId && (
                <div><Label>State (Optional)</Label>
                  <select value={zoneForm.stateId} onChange={e => setZoneForm(f => ({ ...f, stateId: e.target.value, cityId: "" }))} className="admin-input w-full">
                    <option value="">Any State</option>
                    {states.filter(s => s.countryId === zoneForm.countryId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Priority</Label><input type="number" value={zoneForm.priority} onChange={e => setZoneForm(f => ({ ...f, priority: parseInt(e.target.value) || 0 }))} className="admin-input w-full" /></div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div onClick={() => setZoneForm(f => ({ ...f, isActive: !f.isActive }))} className="h-5 w-5 rounded flex items-center justify-center cursor-pointer"
                style={{ background: zoneForm.isActive ? "#12D6C5" : "var(--icon-bg)", border: `2px solid ${zoneForm.isActive ? "#12D6C5" : "var(--card-border)"}` }}>
                {zoneForm.isActive && <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Active</span>
            </label>
            <button disabled={saving} className="w-full btn-primary h-11 disabled:opacity-50">{saving ? "Saving…" : "Save Zone"}</button>
            <button type="button" onClick={() => setShowModal(false)} className="w-full text-xs font-bold uppercase tracking-widest py-2" style={{ color: "var(--text-muted)" }}>Cancel</button>
          </form>
        </DarkModal>
      )}

      {/* Method Modal */}
      {showMethodModal && (
        <DarkModal title={editingMethod ? "Edit Shipping Method" : `Add Method — ${activeZone?.name}`} onClose={() => setShowMethodModal(false)} width="max-w-md">
          <form onSubmit={handleMethodSubmit} className="space-y-4">
            <div><Label>Method Name</Label><input required value={methodForm.name} onChange={e => setMethodForm(f => ({ ...f, name: e.target.value }))} className="admin-input w-full" placeholder="e.g. Express Delivery" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Price ($)</Label><input type="number" step="0.01" value={methodForm.price} onChange={e => setMethodForm(f => ({ ...f, price: e.target.value }))} className="admin-input w-full" /></div>
              <div><Label>Free Over ($)</Label><input type="number" step="0.01" value={methodForm.freeShippingThreshold} onChange={e => setMethodForm(f => ({ ...f, freeShippingThreshold: e.target.value }))} className="admin-input w-full" /></div>
            </div>
            <div><Label>Estimated Days</Label><input value={methodForm.estimatedDays} onChange={e => setMethodForm(f => ({ ...f, estimatedDays: e.target.value }))} className="admin-input w-full" placeholder="e.g. 1-2 days" /></div>
            <div><Label>Sort Order</Label><input type="number" value={methodForm.sortOrder} onChange={e => setMethodForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} className="admin-input w-full" /></div>
            <button disabled={saving} className="w-full btn-primary h-11 disabled:opacity-50">{saving ? "Saving…" : "Save Method"}</button>
            <button type="button" onClick={() => setShowMethodModal(false)} className="w-full text-xs font-bold uppercase tracking-widest py-2" style={{ color: "var(--text-muted)" }}>Cancel</button>
          </form>
        </DarkModal>
      )}
    </div>
  );
}
