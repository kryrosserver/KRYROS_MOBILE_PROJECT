"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Edit, Trash2, Search, RefreshCw, Globe, ChevronLeft, X, ChevronRight,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

const ACCENT = "#12D6C5";

const emptyForm = { name: "", code: "", currencyCode: "", currencySymbol: "", symbolPosition: "BEFORE", exchangeRate: 1, autoRate: true, flag: "", status: true, isDefault: false };

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>{children}</label>;
}

function DarkModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--card-border)" }}>
          <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{title}</h2>
          <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center btn-secondary !px-0">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function CountriesPage() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf: number;
    function applyHeight(s: number) { if (!innerRef.current || !outerRef.current) return; outerRef.current.style.height = "auto"; const h = innerRef.current.scrollHeight * s; const avail = window.innerWidth < 1024 ? window.innerHeight - 64 : Infinity; outerRef.current.style.height = `${Math.max(h, avail)}px`; }
    function recalc() { if (!innerRef.current || !outerRef.current) return; const vw = outerRef.current.offsetWidth || window.innerWidth; const base = vw < 960 ? 750 : 1380; if (vw <= 599) { innerRef.current.style.width = "750px"; innerRef.current.style.transform = "none"; innerRef.current.style.transformOrigin = "top left"; if (outerRef.current) { outerRef.current.style.overflowX = "auto"; outerRef.current.style.height = "auto"; } return; } if (outerRef.current) outerRef.current.style.overflowX = "hidden"; const s = Math.min(1, vw / base); innerRef.current.style.width = `${base}px`; innerRef.current.style.transform = `scale(${s})`; innerRef.current.style.transformOrigin = "top left"; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(s))); }
    recalc(); const t = setTimeout(recalc, 400); window.addEventListener("resize", recalc); return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const rowsPerPage = 12;

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch("/api/admin/countries"); const j = await r.json(); setData(Array.isArray(j) ? j : j.data || []); }
    catch { setData([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = () => { setIsRefreshing(true); load().finally(() => setTimeout(() => setIsRefreshing(false), 300)); };

  const openModal = (item?: any) => {
    setEditingItem(item || null);
    setForm(item ? { ...item, exchangeRate: Number(item.exchangeRate) } : emptyForm);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const url = `/api/admin/countries${editingItem ? `/${editingItem.id}` : ""}`;
      const r = await fetch(url, { method: editingItem ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (r.ok) { setShowModal(false); load(); }
      else { const e = await r.json(); alert(e.error || e.message || "Failed to save"); }
    } catch { alert("Error saving"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this country?")) return;
    await fetch(`/api/admin/countries/${id}`, { method: "DELETE" });
    load();
  };

  const filtered = data.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.code || "").toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const stats = [
    { label: "Total Countries",  value: data.length,                                color: ACCENT,    bg: "rgba(18,214,197,0.12)",  icon: Globe },
    { label: "Active",           value: data.filter(d => d.status).length,           color: "#16C784", bg: "rgba(22,199,132,0.12)",  icon: Globe },
    { label: "Auto-Rate Enabled",value: data.filter(d => d.autoRate).length,         color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  icon: Globe },
    { label: "Default Country",  value: data.filter(d => d.isDefault).length,        color: "#8B5CF6", bg: "rgba(139,92,246,0.12)", icon: Globe },
  ];

  const setF = (p: Partial<typeof emptyForm>) => setForm(f => ({ ...f, ...p }));

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: "var(--bg-primary)", margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: "var(--bg-primary)", padding: "24px" }}>
        <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)" }}>

          {/* Header */}
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/admin/locations-shipping" style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 8, padding: "5px 12px", color: "var(--text-secondary)", fontSize: 12, textDecoration: "none" }}>
                <ArrowLeft style={{ width: 13, height: 13 }} /> Back to Locations
              </Link>
              <div>
                <div className="flex items-center gap-2 text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>
                  <Link href="/admin/locations-shipping" style={{ color: "var(--text-muted)" }}>Locations & Shipping</Link>
                  <span>/</span><span>Countries</span>
                </div>
                <h1 className="text-2xl font-bold whitespace-nowrap">Countries</h1>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Manage supported countries and currencies</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleRefresh} className="btn-secondary !h-10 !w-10 !px-0 flex items-center justify-center">
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
              <button onClick={() => openModal()} className="btn-primary flex items-center gap-2 px-4 h-10">
                <Plus className="h-4 w-4" /> Add Country
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {stats.map(s => (
              <div key={s.label} className="admin-card !p-5">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
                  <s.icon className="h-5 w-5" style={{ color: s.color }} />
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)", minHeight: "2.5rem" }}>{s.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="admin-card !p-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "var(--text-muted)" }} />
              <input placeholder="Search country or code…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="admin-input pl-10 w-full" />
            </div>
          </div>

          {/* Table */}
          <div className="admin-card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead><tr>
                  <th>Name / Code</th><th>Currency</th><th>Exchange Rate</th><th>Status</th><th className="text-right">Actions</th>
                </tr></thead>
                <tbody>
                  {loading ? (
                    [...Array(6)].map((_, i) => <tr key={i}><td colSpan={5}><div className="h-5 rounded animate-pulse my-1 mx-2" style={{ background: "var(--icon-bg)" }} /></td></tr>)
                  ) : paginated.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-14">
                      <Globe className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--text-muted)" }} />
                      <p className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>No countries found</p>
                    </td></tr>
                  ) : paginated.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.flag || "🏳️"}</span>
                          <div>
                            <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{item.name}</p>
                            <p className="text-xs font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>{item.code}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{item.currencyCode}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{item.currencySymbol} · {item.symbolPosition}</p>
                      </td>
                      <td>
                        <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{item.exchangeRate}</p>
                        {item.autoRate && <span className="text-xs px-1.5 py-0.5 rounded font-bold mt-0.5 inline-block" style={{ background: "rgba(59,130,246,0.12)", color: "#3B82F6" }}>Auto</span>}
                      </td>
                      <td>
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold w-fit"
                            style={item.status ? { background: "rgba(22,199,132,0.12)", color: "#16C784" } : { background: "var(--icon-bg)", color: "var(--text-muted)" }}>
                            {item.status ? "Active" : "Inactive"}
                          </span>
                          {item.isDefault && <span className="inline-flex px-2 py-0.5 rounded-lg text-xs font-semibold w-fit" style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B" }}>Default</span>}
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openModal(item)} className="h-8 w-8 rounded-lg flex items-center justify-center btn-secondary !px-0">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors"
                            style={{ color: "var(--text-muted)" }}
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
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {filtered.length === 0 ? "0" : `${(page - 1) * rowsPerPage + 1}–${Math.min(page * rowsPerPage, filtered.length)}`} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-8 w-8 rounded-lg flex items-center justify-center btn-secondary !px-0 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const n = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                  return <button key={n} onClick={() => setPage(n)} className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-semibold"
                    style={n === page ? { background: ACCENT, color: "#fff" } : { color: "var(--text-muted)" }}>{n}</button>;
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 w-8 rounded-lg flex items-center justify-center btn-secondary !px-0 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <DarkModal title={editingItem ? "Edit Country" : "Add Country"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><Label>Country Name</Label><input required value={form.name} onChange={e => setF({ name: e.target.value })} className="admin-input w-full" placeholder="e.g. Zambia" /></div>
              <div><Label>Country Code</Label><input required value={form.code} onChange={e => setF({ code: e.target.value })} className="admin-input w-full" placeholder="ZM" /></div>
              <div><Label>Flag Emoji</Label><input value={form.flag} onChange={e => setF({ flag: e.target.value })} className="admin-input w-full" placeholder="🇿🇲" /></div>
              <div><Label>Currency Code</Label><input required value={form.currencyCode} onChange={e => setF({ currencyCode: e.target.value })} className="admin-input w-full" placeholder="ZMW" /></div>
              <div><Label>Currency Symbol</Label><input required value={form.currencySymbol} onChange={e => setF({ currencySymbol: e.target.value })} className="admin-input w-full" placeholder="K" /></div>
              <div><Label>Symbol Position</Label>
                <select value={form.symbolPosition} onChange={e => setF({ symbolPosition: e.target.value })} className="admin-input w-full">
                  <option value="BEFORE">Before (e.g. $10)</option><option value="AFTER">After (e.g. 10 ZK)</option>
                </select>
              </div>
              <div><Label>Exchange Rate</Label><input type="number" step="0.0001" value={form.exchangeRate} onChange={e => setF({ exchangeRate: parseFloat(e.target.value) })} className="admin-input w-full" /></div>
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              {[
                { key: "status", label: "Active" },
                { key: "autoRate", label: "Auto Exchange Rate" },
                { key: "isDefault", label: "Default Country" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                  <div onClick={() => setF({ [key]: !(form as any)[key] } as any)}
                    className="h-5 w-5 rounded flex items-center justify-center transition-all cursor-pointer"
                    style={{ background: (form as any)[key] ? ACCENT : "var(--icon-bg)", border: `2px solid ${(form as any)[key] ? ACCENT : "var(--card-border)"}` }}>
                    {(form as any)[key] && <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{label}</span>
                </label>
              ))}
            </div>
            <button disabled={saving} className="w-full btn-primary h-11 mt-2 disabled:opacity-50">
              {saving ? "Saving…" : "Confirm & Save"}
            </button>
          </form>
        </DarkModal>
      )}
    </div>
  );
}
