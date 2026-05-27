"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Edit, Trash2, Search, RefreshCw, Map as MapIcon, ChevronLeft, X, ChevronRight, Globe,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

const ACCENT = "#6366F1";

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>{children}</label>;
}

function DarkModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid var(--card-border)", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--card-border)" }}>
          <h2 className="text-base font-bold" style={{ color: "#111827" }}>{title}</h2>
          <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center btn-secondary !px-0"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function StatesPage() {
  useEffect(() => {}, []);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ countryId: "", name: "", code: "", isActive: true });
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const rowsPerPage = 12;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sR, cR] = await Promise.all([fetch("/api/admin/states"), fetch("/api/admin/countries")]);
      const sJ = await sR.json(); const cJ = await cR.json();
      setData(Array.isArray(sJ) ? sJ : sJ.data || []);
      setCountries(Array.isArray(cJ) ? cJ : cJ.data || []);
    } catch { setData([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = () => { setIsRefreshing(true); load().finally(() => setTimeout(() => setIsRefreshing(false), 300)); };

  const openModal = (item?: any) => {
    setEditingItem(item || null);
    setForm(item ? { ...item } : { countryId: "", name: "", code: "", isActive: true });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const url = `/api/admin/states${editingItem ? `/${editingItem.id}` : ""}`;
      const r = await fetch(url, { method: editingItem ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (r.ok) { setShowModal(false); load(); }
      else { const e = await r.json(); alert(e.error || e.message || "Failed"); }
    } catch { alert("Error saving"); } finally { setSaving(false); }
  };

  const filtered = data.filter(d => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.country?.name?.toLowerCase().includes(search.toLowerCase());
    const matchCountry = countryFilter === "all" || d.countryId === countryFilter || d.country?.id === countryFilter;
    return matchSearch && matchCountry;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const countriesCount = new Set(data.map(d => d.countryId || d.country?.id)).size;
  const stats = [
    { label: "Total States",    value: data.length,                           color: "#6366F1",    bg: "rgba(59,130,246,0.12)",  icon: MapIcon },
    { label: "Active",          value: data.filter(d => d.isActive).length,   color: "#16C784", bg: "rgba(22,199,132,0.12)",  icon: MapIcon },
    { label: "Countries Covered", value: countriesCount,                      color: "#6366F1", bg: "rgba(18,214,197,0.12)",  icon: Globe },
  ];

  return (
    <div style={{ background: "#F5F6FA", minHeight: "100%", padding: "24px" }}>
      <div style={{ background: "#F5F6FA", padding: "24px" }}>
        <div className="space-y-6 pb-20" style={{ color: "#111827" }}>

          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/admin/locations-shipping" style={{ display: "flex", alignItems: "center", gap: 6, background: "#FFFFFF", border: "1px solid var(--card-border)", borderRadius: 8, padding: "5px 12px", color: "#4B5563", fontSize: 12, textDecoration: "none" }}><ArrowLeft style={{ width: 13, height: 13 }} /> Back to Locations</Link>
              <div>
                <div className="flex items-center gap-2 text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>
                  <Link href="/admin/locations-shipping" style={{ color: "var(--text-muted)" }}>Locations & Shipping</Link><span>/</span><span>States</span>
                </div>
                <h1 className="text-2xl font-bold whitespace-nowrap">States / Provinces</h1>
                <p className="text-sm mt-0.5" style={{ color: "#4B5563" }}>Manage administrative regions for each country</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleRefresh} className="btn-secondary !h-10 !w-10 !px-0 flex items-center justify-center">
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
              <button onClick={() => openModal()} className="btn-primary flex items-center gap-2 px-4 h-10">
                <Plus className="h-4 w-4" /> Add State
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {stats.map(s => (
              <div key={s.label} className="admin-card !p-5">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}><s.icon className="h-5 w-5" style={{ color: s.color }} /></div>
                <p className="text-sm" style={{ color: "#4B5563", minHeight: "2.5rem" }}>{s.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="admin-card !p-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "var(--text-muted)" }} />
              <input placeholder="Search state or country…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="admin-input pl-10 w-full" />
            </div>
            <select value={countryFilter} onChange={e => { setCountryFilter(e.target.value); setPage(1); }} className="admin-input h-9 text-sm !w-auto min-w-[180px]">
              <option value="all">All Countries</option>
              {countries.map(c => <option key={c.id} value={c.id}>{c.flag} {c.name}</option>)}
            </select>
          </div>

          <div className="admin-card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead><tr><th>State / Province</th><th>Code</th><th>Country</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
                <tbody>
                  {loading ? (
                    [...Array(6)].map((_, i) => <tr key={i}><td colSpan={5}><div className="h-5 rounded animate-pulse my-1 mx-2" style={{ background: "#F9FAFB" }} /></td></tr>)
                  ) : paginated.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-14">
                      <MapIcon className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--text-muted)" }} />
                      <p className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>No states found</p>
                    </td></tr>
                  ) : paginated.map(item => (
                    <tr key={item.id}>
                      <td><p className="font-semibold text-sm" style={{ color: "#111827" }}>{item.name}</p></td>
                      <td><p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{item.code || " "}</p></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.country?.flag || "🏳️"}</span>
                          <p className="text-sm" style={{ color: "#4B5563" }}>{item.country?.name || " "}</p>
                        </div>
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold"
                          style={item.isActive ? { background: "rgba(22,199,132,0.12)", color: "#16C784" } : { background: "#F9FAFB", color: "var(--text-muted)" }}>
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openModal(item)} className="h-8 w-8 rounded-lg flex items-center justify-center btn-secondary !px-0"><Edit className="h-4 w-4" /></button>
                          <button onClick={async () => { if (confirm("Delete this state?")) { await fetch(`/api/admin/states/${item.id}`, { method: "DELETE" }); load(); } }}
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
            <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: "1px solid var(--card-border)" }}>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{filtered.length === 0 ? "0" : `${(page - 1) * rowsPerPage + 1}–${Math.min(page * rowsPerPage, filtered.length)}`} of {filtered.length}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-8 w-8 rounded-lg flex items-center justify-center btn-secondary !px-0 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => { const n = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i; return <button key={n} onClick={() => setPage(n)} className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-semibold" style={n === page ? { background: "#6366F1", color: "#fff" } : { color: "var(--text-muted)" }}>{n}</button>; })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 w-8 rounded-lg flex items-center justify-center btn-secondary !px-0 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <DarkModal title={editingItem ? "Edit State" : "Add State"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Country</Label>
              <select required value={form.countryId} onChange={e => setForm(f => ({ ...f, countryId: e.target.value }))} className="admin-input w-full">
                <option value="">Select a country</option>
                {countries.map(c => <option key={c.id} value={c.id}>{c.flag} {c.name}</option>)}
              </select>
            </div>
            <div><Label>State Name</Label><input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="admin-input w-full" placeholder="e.g. Lusaka Province" /></div>
            <div><Label>State Code (Optional)</Label><input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} className="admin-input w-full" placeholder="e.g. LSK" /></div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))} className="h-5 w-5 rounded flex items-center justify-center cursor-pointer"
                style={{ background: form.isActive ? "#6366F1" : "#F9FAFB", border: `2px solid ${form.isActive ? "#6366F1" : "#E5E7EB"}` }}>
                {form.isActive && <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className="text-xs font-semibold" style={{ color: "#4B5563" }}>Active</span>
            </label>
            <button disabled={saving} className="w-full btn-primary h-11 mt-2 disabled:opacity-50">{saving ? "Saving…" : "Confirm & Save"}</button>
          </form>
        </DarkModal>
      )}
    </div>
  );
}