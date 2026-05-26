"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Star, RefreshCw, Plus, Trash2, Image as ImageIcon, Package,
  X, ChevronLeft, Tag, ToggleLeft, ToggleRight, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

const ACCENT = "#12D6C5";

export default function WholesaleDealsPage() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf: number;
    function applyHeight(s: number) { if (!innerRef.current || !outerRef.current) return; outerRef.current.style.height = "auto"; const h = innerRef.current.scrollHeight * s; const avail = window.innerWidth < 1024 ? window.innerHeight - 64 : Infinity; outerRef.current.style.height = `${Math.max(h, avail)}px`; }
    function recalc() { if (!innerRef.current || !outerRef.current) return; const vw = outerRef.current.offsetWidth || window.innerWidth; const base = vw < 960 ? 750 : 1380; if (vw <= 599) { innerRef.current.style.width = "750px"; innerRef.current.style.transform = "none"; innerRef.current.style.transformOrigin = "top left"; if (outerRef.current) { outerRef.current.style.overflowX = "auto"; outerRef.current.style.height = "auto"; } return; } if (outerRef.current) outerRef.current.style.overflowX = "hidden"; const s = Math.min(1, vw / base); innerRef.current.style.width = `${base}px`; innerRef.current.style.transform = `scale(${s})`; innerRef.current.style.transformOrigin = "top left"; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(s))); }
    recalc(); const t = setTimeout(recalc, 400); window.addEventListener("resize", recalc); return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);

  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState({ title: "", subtitle: "", slug: "", minQty: "", price: "" });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/internal/admin/cms/sections", { cache: "no-store", credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        setSections(Array.isArray(data) ? data : data?.data || []);
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = () => { setIsRefreshing(true); load().finally(() => setTimeout(() => setIsRefreshing(false), 300)); };

  async function compressImage(file: File, maxWidth = 800, quality = 0.85): Promise<string> {
    const blobURL = URL.createObjectURL(file);
    const img = new Image();
    await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = reject; img.src = blobURL; });
    const scale = Math.min(1, maxWidth / img.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(blobURL);
    return canvas.toDataURL("image/jpeg", quality);
  }

  const dealSections = sections.filter((s: any) => s.type === "wholesale_deals");
  const allItems = dealSections.flatMap((s: any) => (Array.isArray(s.config?.items) ? s.config.items : []).map((it: any) => ({ ...it, _sectionId: s.id, _sectionActive: s.isActive })));

  const stats = [
    { label: "Deal Sections", value: dealSections.length, color: ACCENT, bg: "rgba(18,214,197,0.12)", icon: Star },
    { label: "Total Deals", value: allItems.length, color: "#16C784", bg: "rgba(22,199,132,0.12)", icon: Tag },
    { label: "Active Sections", value: dealSections.filter((s: any) => s.isActive).length, color: "#F59E0B", bg: "rgba(245,158,11,0.12)", icon: ToggleRight },
  ];

  const handleCreateSection = async () => {
    setSaving(true);
    try {
      const sample = [
        { title: "Bulk Deal #1", subtitle: "Min 10 units", price: 9999, minQty: 10 },
        { title: "Bulk Deal #2", subtitle: "Min 5 units", price: 54999, minQty: 5 },
      ];
      const res = await fetch("/internal/admin/cms/sections", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "wholesale_deals", title: "Featured Wholesale Deals", isActive: true, order: 5, config: { items: sample } }),
      });
      if (res.ok) await load();
    } finally { setSaving(false); }
  };

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: "var(--bg-primary)", margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: "var(--bg-primary)", padding: "24px" }}>
        <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)" }}>

          {/* Header */}
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/admin/wholesale" style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 8, padding: "5px 12px", color: "var(--text-secondary)", fontSize: 12, textDecoration: "none" }}>
                <ArrowLeft style={{ width: 13, height: 13 }} /> Back to Wholesale
              </Link>
              <div>
                <div className="flex items-center gap-2 text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>
                  <Link href="/admin/wholesale" style={{ color: "var(--text-muted)" }}>Wholesale</Link>
                  <span>/</span><span>Deals</span>
                </div>
                <h1 className="text-2xl font-bold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>Wholesale Deals</h1>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Manage featured wholesale offers shown on the storefront</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleRefresh} className="btn-secondary !h-10 !w-10 !px-0 flex items-center justify-center">
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
              {dealSections.length === 0 && (
                <button onClick={handleCreateSection} disabled={saving} className="btn-primary flex items-center gap-2 px-4 h-10">
                  <Plus className="h-4 w-4" /> {saving ? "Creating…" : "Create Deals Section"}
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map(s => (
              <div key={s.label} className="admin-card !p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                    <s.icon className="h-5 w-5" style={{ color: s.color }} />
                  </div>
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)", minHeight: "2.5rem" }}>{s.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {!loading && dealSections.length === 0 && (
            <div className="admin-card flex flex-col items-center justify-center py-16 gap-4">
              <Star className="h-12 w-12 opacity-20" style={{ color: "var(--text-muted)" }} />
              <p className="font-semibold text-sm" style={{ color: "var(--text-muted)" }}>No wholesale deals section yet</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Click "Create Deals Section" to get started</p>
            </div>
          )}

          {/* Deal Sections */}
          {dealSections.map((section: any) => {
            const items: any[] = Array.isArray(section.config?.items) ? section.config.items : [];
            return (
              <div key={section.id} className="admin-card space-y-6">
                {/* Section Header */}
                <div className="flex items-center justify-between pb-4" style={{ borderBottom: "1px solid var(--card-border)" }}>
                  <div className="flex-1 max-w-sm">
                    <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>Section Title</p>
                    <input
                      defaultValue={section.title || "Wholesale Deals"}
                      className="admin-input font-bold w-full"
                      onBlur={async (e) => {
                        await fetch(`/internal/admin/cms/sections/${section.id}`, {
                          method: "PUT", credentials: "same-origin",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ title: e.target.value }),
                        });
                        await load();
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <button
                        onClick={async () => {
                          await fetch(`/internal/admin/cms/sections/${section.id}`, {
                            method: "PUT", credentials: "same-origin",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ isActive: !section.isActive }),
                          });
                          await load();
                        }}
                      >
                        {section.isActive
                          ? <ToggleRight className="h-6 w-6" style={{ color: ACCENT }} />
                          : <ToggleLeft className="h-6 w-6" style={{ color: "var(--text-muted)" }} />}
                      </button>
                      <span className="text-sm font-semibold" style={{ color: section.isActive ? ACCENT : "var(--text-muted)" }}>
                        {section.isActive ? "Active on Site" : "Hidden"}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Add New Deal Row */}
                <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--hover-bg)", border: "1px solid var(--card-border)" }}>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Add New Deal</p>
                  <div className="grid grid-cols-6 gap-3">
                    <input placeholder="Product Title" className="admin-input" value={newItem.title} onChange={e => setNewItem(f => ({ ...f, title: e.target.value }))} />
                    <input placeholder="Subtitle (e.g. Min 10 units)" className="admin-input" value={newItem.subtitle} onChange={e => setNewItem(f => ({ ...f, subtitle: e.target.value }))} />
                    <input placeholder="Product Slug" className="admin-input" value={newItem.slug} onChange={e => setNewItem(f => ({ ...f, slug: e.target.value }))} />
                    <input type="number" placeholder="Min Qty" className="admin-input" value={newItem.minQty} onChange={e => setNewItem(f => ({ ...f, minQty: e.target.value }))} />
                    <input type="number" placeholder="Wholesale Price" className="admin-input" value={newItem.price} onChange={e => setNewItem(f => ({ ...f, price: e.target.value }))} />
                    <button
                      disabled={!newItem.title || !newItem.price}
                      onClick={async () => {
                        if (!newItem.title || !newItem.price) return;
                        const updated = [...items, { title: newItem.title, subtitle: newItem.subtitle, slug: newItem.slug, minQty: Number(newItem.minQty) || 1, price: Number(newItem.price) }];
                        await fetch(`/internal/admin/cms/sections/${section.id}`, {
                          method: "PUT", credentials: "same-origin",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ config: { items: updated } }),
                        });
                        setNewItem({ title: "", subtitle: "", slug: "", minQty: "", price: "" });
                        await load();
                      }}
                      className="btn-primary flex items-center justify-center gap-2 disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" /> Add
                    </button>
                  </div>
                </div>

                {/* Deals Table */}
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <Package className="h-8 w-8 opacity-20" style={{ color: "var(--text-muted)" }} />
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>No deals added yet. Use the form above to add one.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Product</th>
                          <th>Subtitle</th>
                          <th>Min Qty</th>
                          <th className="text-right">Price</th>
                          <th className="text-right">Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((it: any, idx: number) => (
                          <tr key={idx}>
                            <td className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>{idx + 1}</td>
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center" style={{ background: "var(--icon-bg)", border: "1px solid var(--card-border)" }}>
                                  {it.image
                                    ? <img src={it.image} alt={it.title} className="h-full w-full object-cover" />
                                    : <Package className="h-4 w-4" style={{ color: "var(--text-muted)" }} />}
                                </div>
                                <div>
                                  <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{it.title}</p>
                                  {it.slug && <p className="text-xs font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>{it.slug}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="text-sm" style={{ color: "var(--text-secondary)" }}>{it.subtitle || "—"}</td>
                            <td>
                              <span className="px-2 py-0.5 rounded-lg text-xs font-bold" style={{ background: "rgba(18,214,197,0.1)", color: ACCENT }}>
                                Min {it.minQty || 1}
                              </span>
                            </td>
                            <td className="text-right font-bold" style={{ color: "var(--text-primary)" }}>
                              {formatPrice(it.price)}
                            </td>
                            <td className="text-right">
                              <button
                                onClick={async () => {
                                  const updated = items.filter((_: any, i: number) => i !== idx);
                                  await fetch(`/internal/admin/cms/sections/${section.id}`, {
                                    method: "PUT", credentials: "same-origin",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ config: { items: updated } }),
                                  });
                                  await load();
                                }}
                                className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors"
                                style={{ color: "var(--text-muted)" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#EF4444"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}
