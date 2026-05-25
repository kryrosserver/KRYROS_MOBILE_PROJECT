"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Edit, Trash2, Search, RefreshCw, Settings2, ChevronLeft, X, ChevronRight, Truck } from "lucide-react";
import Link from "next/link";

const ACCENT = "#8B5CF6";

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>{children}</label>;
}

function DarkModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--card-border)" }}>
          <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{title}</h2>
          <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center btn-secondary !px-0"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function GlobalMethodsPage() {
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
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", fee: "0", minThreshold: "0", estimatedDays: "", isActive: true, sortOrder: 0 });
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch("/api/admin/shipping"); const j = await r.json(); setData(Array.isArray(j) ? j : j.methods || []); }
    catch { setData([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = () => { setIsRefreshing(true); load().finally(() => setTimeout(() => setIsRefreshing(false), 300)); };

  const openModal = (item?: any) => {
    setEditingItem(item || null);
    setForm(item ? { ...item, fee: String(item.fee), minThreshold: String(item.minThreshold), sortOrder: item.sortOrder ?? 0 }
      : { name: "", description: "", fee: "0", minThreshold: "0", estimatedDays: "", isActive: true, sortOrder: 0 });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const url = `/api/admin/shipping${editingItem ? `/${editingItem.id}` : ""}`;
      const body = { ...form, fee: parseFloat(form.fee) || 0, minThreshold: parseFloat(form.minThreshold) || 0, sortOrder: parseInt(String(form.sortOrder)) || 0 };
      const r = await fetch(url, { method: editingItem ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (r.ok) { setShowModal(false); load(); }
      else { const e = await r.json(); alert(e.error || e.message || "Failed"); }
    } catch { alert("Error saving"); } finally { setSaving(false); }
  };

  const filtered = data.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.description?.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const freeCount = data.filter(d => Number(d.minThreshold) === 0 && Number(d.fee) === 0).length;
  const stats = [
    { label: "Global Methods",  value: data.length,                         color: ACCENT,    bg: "rgba(139,92,246,0.12)",  icon: Settings2 },
    { label: "Active",          value: data.filter(d => d.isActive).length, color: "#16C784", bg: "rgba(22,199,132,0.12)",  icon: Truck },
    { label: "Always Free",     value: freeCount,                           color: "#12D6C5", bg: "rgba(18,214,197,0.12)",  icon: Truck },
  ];

  const setF = (p: Partial<typeof form>) => setForm(f => ({ ...f, ...p }));

  return (
    <div ref={outerRef} style={{ overflow: "auto", background: "var(--bg-primary)", margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: "var(--bg-primary)", padding: "24px" }}>
        <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)" }}>

          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/admin/locations-shipping" className="h-9 w-9 rounded-xl flex items-center justify-center btn-secondary !px-0"><ChevronLeft className="h-4 w-4" /></Link>
              <div>
                <div className="flex items-center gap-2 text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>
                  <Link href="/admin/locations-shipping" style={{ color: "var(--text-muted)" }}>Locations & Shipping</Link><span>/</span><span>Global Methods</span>
                </div>
                <h1 className="text-2xl font-bold whitespace-nowrap">Global Methods</h1>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Default shipping rules applied across all locations</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleRefresh} className="btn-secondary !h-10 !w-10 !px-0 flex items-center justify-center">
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
              <button onClick={() => openModal()} className="btn-primary flex items-center gap-2 px-4 h-10">
                <Plus className="h-4 w-4" /> Add Method
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

          <div className="admin-card !p-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "var(--text-muted)" }} />
              <input placeholder="Search methods…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="admin-input pl-10 w-full" />
            </div>
          </div>

          <div className="admin-card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead><tr>
                  <th className="w-16">Order</th><th>Method / Description</th><th>Price</th><th>Free Over</th><th>Est. Delivery</th><th>Status</th><th className="text-right">Actions</th>
                </tr></thead>
                <tbody>
                  {loading ? (
                    [...Array(5)].map((_, i) => <tr key={i}><td colSpan={7}><div className="h-5 rounded animate-pulse my-1 mx-2" style={{ background: "var(--icon-bg)" }} /></td></tr>)
                  ) : paginated.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-14">
                      <Settings2 className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--text-muted)" }} />
                      <p className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>No global methods yet</p>
                      <button onClick={() => openModal()} className="inline-flex items-center gap-1 text-xs font-semibold mt-2" style={{ color: "#12D6C5" }}>
                        <Plus className="h-3.5 w-3.5" /> Add your first method
                      </button>
                    </td></tr>
                  ) : paginated.map(item => (
                    <tr key={item.id}>
                      <td>
                        <span className="text-xs font-mono px-2 py-0.5 rounded-lg" style={{ background: "var(--icon-bg)", color: "var(--text-muted)" }}>{item.sortOrder ?? 0}</span>
                      </td>
                      <td>
                        <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{item.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{item.description || "No description"}</p>
                      </td>
                      <td>
                        <p className="font-bold text-sm" style={{ color: Number(item.fee) === 0 ? "#16C784" : "var(--text-primary)" }}>
                          {Number(item.fee) === 0 ? "Free" : `$${Number(item.fee).toFixed(2)}`}
                        </p>
                      </td>
                      <td>
                        <p className="text-sm font-medium" style={{ color: Number(item.minThreshold) > 0 ? "#16C784" : "var(--text-muted)" }}>
                          {Number(item.minThreshold) > 0 ? `$${Number(item.minThreshold).toFixed(2)}` : "—"}
                        </p>
                      </td>
                      <td className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.estimatedDays || "—"}</td>
                      <td>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold"
                          style={item.isActive ? { background: "rgba(22,199,132,0.12)", color: "#16C784" } : { background: "var(--icon-bg)", color: "var(--text-muted)" }}>
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openModal(item)} className="h-8 w-8 rounded-lg flex items-center justify-center btn-secondary !px-0"><Edit className="h-4 w-4" /></button>
                          <button onClick={async () => { if (confirm("Delete this method?")) { await fetch(`/api/admin/shipping/${item.id}`, { method: "DELETE" }); load(); } }}
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
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => { const n = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i; return <button key={n} onClick={() => setPage(n)} className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-semibold" style={n === page ? { background: ACCENT, color: "#fff" } : { color: "var(--text-muted)" }}>{n}</button>; })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 w-8 rounded-lg flex items-center justify-center btn-secondary !px-0 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <DarkModal title={editingItem ? "Edit Global Method" : "Add Global Method"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Method Name</Label><input required value={form.name} onChange={e => setF({ name: e.target.value })} className="admin-input w-full" placeholder="e.g. Standard Shipping" /></div>
            <div><Label>Description</Label><input value={form.description} onChange={e => setF({ description: e.target.value })} className="admin-input w-full" placeholder="e.g. Delivery within 3-5 business days" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Shipping Fee ($)</Label><input type="number" step="0.01" value={form.fee} onChange={e => setF({ fee: e.target.value })} className="admin-input w-full" /></div>
              <div><Label>Free Over ($)</Label><input type="number" step="0.01" value={form.minThreshold} onChange={e => setF({ minThreshold: e.target.value })} className="admin-input w-full" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Estimated Days</Label><input value={form.estimatedDays} onChange={e => setF({ estimatedDays: e.target.value })} className="admin-input w-full" placeholder="3-5 days" /></div>
              <div><Label>Sort Order</Label><input type="number" value={form.sortOrder} onChange={e => setF({ sortOrder: parseInt(e.target.value) || 0 })} className="admin-input w-full" /></div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div onClick={() => setF({ isActive: !form.isActive })} className="h-5 w-5 rounded flex items-center justify-center cursor-pointer"
                style={{ background: form.isActive ? "#12D6C5" : "var(--icon-bg)", border: `2px solid ${form.isActive ? "#12D6C5" : "var(--card-border)"}` }}>
                {form.isActive && <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Active</span>
            </label>
            <button disabled={saving} className="w-full btn-primary h-11 disabled:opacity-50">{saving ? "Saving…" : "Confirm & Save"}</button>
          </form>
        </DarkModal>
      )}
    </div>
  );
}
