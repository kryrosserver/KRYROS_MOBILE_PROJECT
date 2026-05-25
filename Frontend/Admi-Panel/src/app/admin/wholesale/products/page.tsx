"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Package, Plus, Trash2, Edit, X, RefreshCw, ChevronLeft,
  Search, ShoppingCart, Tag, Layers, ChevronRight, ChevronDown, ChevronUp
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

type Product = {
  id: string; name: string; sku: string; price: number; isActive?: boolean;
  wholesalePrice?: number | null; isWholesaleOnly?: boolean;
  unitsPerPack?: number; wholesaleMoq?: number;
  category?: { id: string; name: string; slug: string };
  brand?: { id: number; name: string; slug: string };
  images?: any[];
  wholesaleTiers?: { minQuantity: number; price: number }[];
};
type Category = { id: string; name: string; slug: string };

const ACCENT = "#12D6C5";

const CATEGORY_ATTRIBUTES: Record<string, string[]> = {
  "mobile-phones": ["RAM", "Storage", "Battery", "Screen Size", "Processor", "Camera", "Color"],
  "laptops": ["RAM", "Storage", "Processor", "Graphics", "Display", "Operating System"],
  "clothing": ["Size", "Material", "Color", "Gender", "Style"],
  "shoes": ["Size", "Color", "Material", "Type"],
  "software": ["License Type", "Platform", "Version", "Validity"],
  "gadgets": ["Battery Life", "Connectivity", "Type", "Color"],
  "default": ["Color", "Material", "Weight", "Dimensions"],
};

const emptyForm = {
  name: "", sku: "", price: "", description: "", categorySlug: "",
  stockTotal: "100", stockCurrent: "100", wholesalePrice: "",
  unitsPerPack: "1", wholesaleMoq: "1", isActive: true,
  images: [] as string[],
  specifications: [] as { key: string; value: string }[],
  wholesaleTiers: [] as { minQuantity: number; price: number }[],
};

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

export default function WholesaleProductsPage() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf: number;
    function applyHeight(s: number) { if (!innerRef.current || !outerRef.current) return; outerRef.current.style.height = "auto"; const h = innerRef.current.scrollHeight * s; const avail = window.innerWidth < 1024 ? window.innerHeight - 64 : Infinity; outerRef.current.style.height = `${Math.max(h, avail)}px`; }
    function recalc() { if (!innerRef.current || !outerRef.current) return; const vw = outerRef.current.offsetWidth || window.innerWidth; const base = vw < 960 ? 750 : 1380; const s = Math.min(1, vw / base); innerRef.current.style.width = `${base}px`; innerRef.current.style.transform = `scale(${s})`; innerRef.current.style.transformOrigin = "top left"; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(s))); }
    recalc(); const t = setTimeout(recalc, 400); window.addEventListener("resize", recalc); return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState<File[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const rowsPerPage = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/admin/products?showInactive=true"),
        fetch("/api/admin/categories"),
      ]);
      if (prodRes.ok) {
        const data = await prodRes.json();
        const items = Array.isArray(data?.products) ? data.products : data?.data || [];
        setProducts(items.filter((p: any) => !!p.isWholesaleOnly));
      }
      if (catRes.ok) setCategories(await catRes.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = () => { setIsRefreshing(true); load().finally(() => setTimeout(() => setIsRefreshing(false), 300)); };

  const filtered = products.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku || "").toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const currentCategoryAttributes = CATEGORY_ATTRIBUTES[form.categorySlug] || CATEGORY_ATTRIBUTES["default"];

  const stats = [
    { label: "Wholesale Products", value: products.length, color: ACCENT, bg: "rgba(18,214,197,0.12)", icon: Package },
    { label: "Active", value: products.filter(p => p.isActive).length, color: "#16C784", bg: "rgba(22,199,132,0.12)", icon: ShoppingCart },
    { label: "Exclusive Only", value: products.filter(p => p.isWholesaleOnly).length, color: "#F59E0B", bg: "rgba(245,158,11,0.12)", icon: Tag },
  ];

  const setF = (patch: Partial<typeof emptyForm>) => setForm(f => ({ ...f, ...patch }));

  const handleSubmit = async () => {
    if (!form.name || !form.sku || !form.wholesalePrice) return alert("Name, SKU and Wholesale Price are required");
    setCreating(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name); fd.append("sku", form.sku);
      fd.append("wholesalePrice", form.wholesalePrice);
      fd.append("price", form.price || form.wholesalePrice);
      fd.append("isWholesaleOnly", "true"); fd.append("allowCredit", "false");
      fd.append("unitsPerPack", form.unitsPerPack); fd.append("wholesaleMoq", form.wholesaleMoq);
      fd.append("categorySlug", form.categorySlug || "general");
      fd.append("description", form.description);
      fd.append("isActive", String(form.isActive));
      if (form.specifications.length > 0) fd.append("specifications", JSON.stringify(form.specifications));
      files.forEach(f => fd.append("images", f));
      const res = await fetch("/internal/admin/products/upload", { method: "POST", body: fd });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Failed");
      if (form.wholesaleTiers.length > 0) {
        await fetch(`/api/admin/wholesale/prices/${body.id}`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form.wholesaleTiers),
        });
      }
      setShowCreate(false); setForm(emptyForm); setFiles([]);
      await load();
    } catch (e: unknown) { alert(e instanceof Error ? e.message : "Error"); }
    finally { setCreating(false); }
  };

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: "var(--bg-primary)", margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: "var(--bg-primary)", padding: "24px" }}>
        <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)" }}>

          {/* Header */}
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/admin/wholesale" className="h-9 w-9 rounded-xl flex items-center justify-center btn-secondary !px-0">
                <ChevronLeft className="h-4 w-4" />
              </Link>
              <div>
                <div className="flex items-center gap-2 text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>
                  <Link href="/admin/wholesale" style={{ color: "var(--text-muted)" }}>Wholesale</Link>
                  <span>/</span><span>Products</span>
                </div>
                <h1 className="text-2xl font-bold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>Wholesale Inventory</h1>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Products exclusively for wholesale partners</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleRefresh} className="btn-secondary !h-10 !w-10 !px-0 flex items-center justify-center">
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
              <button onClick={() => setShowCreate(s => !s)} className="btn-primary flex items-center gap-2 px-4 h-10">
                {showCreate ? <><ChevronUp className="h-4 w-4" /> Close Form</> : <><Plus className="h-4 w-4" /> Add Product</>}
              </button>
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

          {/* Create Form */}
          {showCreate && (
            <div className="admin-card space-y-6" style={{ border: `1px solid ${ACCENT}30` }}>
              <div className="flex items-center justify-between pb-4" style={{ borderBottom: "1px solid var(--card-border)" }}>
                <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>New Wholesale Product</p>
                <button onClick={() => setShowCreate(false)} className="h-7 w-7 rounded-lg flex items-center justify-center btn-secondary !px-0">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5" style={{ color: "var(--text-muted)" }}>Product Name *</label>
                    <input value={form.name} onChange={e => setF({ name: e.target.value })} className="admin-input w-full" placeholder="e.g. iPhone 15 Pro Max (Wholesale)" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5" style={{ color: "var(--text-muted)" }}>SKU *</label>
                    <input value={form.sku} onChange={e => setF({ sku: e.target.value })} className="admin-input w-full" placeholder="WH-IP15-PRO" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1.5" style={{ color: "var(--text-muted)" }}>Wholesale Price *</label>
                      <input type="number" value={form.wholesalePrice} onChange={e => setF({ wholesalePrice: e.target.value })} className="admin-input w-full" placeholder="0.00" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1.5" style={{ color: "var(--text-muted)" }}>Retail Ref</label>
                      <input type="number" value={form.price} onChange={e => setF({ price: e.target.value })} className="admin-input w-full" placeholder="0.00" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1.5" style={{ color: "var(--text-muted)" }}>Units / Pack</label>
                      <input type="number" value={form.unitsPerPack} onChange={e => setF({ unitsPerPack: e.target.value })} className="admin-input w-full" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1.5" style={{ color: "var(--text-muted)" }}>MOQ (Packs)</label>
                      <input type="number" value={form.wholesaleMoq} onChange={e => setF({ wholesaleMoq: e.target.value })} className="admin-input w-full" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5" style={{ color: "var(--text-muted)" }}>Category</label>
                    <select value={form.categorySlug} onChange={e => setF({ categorySlug: e.target.value })} className="admin-input w-full">
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5" style={{ color: "var(--text-muted)" }}>Description</label>
                    <textarea value={form.description} onChange={e => setF({ description: e.target.value })} className="admin-input w-full h-24 resize-none" placeholder="Wholesale product description..." />
                  </div>

                  {/* Specs */}
                  <div className="pt-2" style={{ borderTop: "1px solid var(--card-border)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Specifications</p>
                      <button
                        onClick={() => setF({ specifications: [...form.specifications, { key: "", value: "" }] })}
                        className="text-xs px-2 py-1 rounded-lg font-semibold btn-secondary"
                      >+ Add</button>
                    </div>
                    <div className="flex flex-col gap-1 mb-2">
                      {currentCategoryAttributes.map(attr => (
                        <button key={attr} onClick={() => { if (!form.specifications.find(s => s.key === attr)) setF({ specifications: [...form.specifications, { key: attr, value: "" }] }); }}
                          className="text-left px-2 py-0.5 rounded text-xs font-semibold" style={{ color: ACCENT, background: "rgba(18,214,197,0.08)" }}>
                          + {attr}
                        </button>
                      ))}
                    </div>
                    {form.specifications.map((spec, idx) => (
                      <div key={idx} className="flex gap-2 items-center mb-1.5">
                        <input placeholder="Attribute" value={spec.key} onChange={e => { const s = [...form.specifications]; s[idx].key = e.target.value; setF({ specifications: s }); }} className="admin-input h-8 text-xs flex-1" />
                        <input placeholder="Value" value={spec.value} onChange={e => { const s = [...form.specifications]; s[idx].value = e.target.value; setF({ specifications: s }); }} className="admin-input h-8 text-xs flex-1" />
                        <button onClick={() => setF({ specifications: form.specifications.filter((_, i) => i !== idx) })} className="h-7 w-7 flex items-center justify-center rounded-lg" style={{ color: "#EF4444" }}><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                  {/* Bulk Tiers */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Bulk Pricing Tiers</label>
                      <button onClick={() => setF({ wholesaleTiers: [...form.wholesaleTiers, { minQuantity: 0, price: 0 }] })} className="text-xs px-2 py-1 rounded-lg font-semibold btn-secondary">+ Add Tier</button>
                    </div>
                    <div className="rounded-xl p-3 space-y-2" style={{ background: "var(--hover-bg)", border: "1px solid var(--card-border)" }}>
                      {form.wholesaleTiers.length === 0 ? (
                        <p className="text-xs text-center py-2" style={{ color: "var(--text-muted)" }}>No bulk tiers added</p>
                      ) : form.wholesaleTiers.map((t, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <input type="number" value={t.minQuantity} onChange={e => { const nt = [...form.wholesaleTiers]; nt[i].minQuantity = Number(e.target.value); setF({ wholesaleTiers: nt }); }} className="admin-input h-8 text-xs flex-1" placeholder="Min Qty" />
                          <input type="number" value={t.price} onChange={e => { const nt = [...form.wholesaleTiers]; nt[i].price = Number(e.target.value); setF({ wholesaleTiers: nt }); }} className="admin-input h-8 text-xs flex-1" placeholder="Price" />
                          <button onClick={() => setF({ wholesaleTiers: form.wholesaleTiers.filter((_, idx) => idx !== i) })} className="h-7 w-7 flex items-center justify-center rounded-lg" style={{ color: "#EF4444" }}><X className="h-3 w-3" /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5" style={{ color: "var(--text-muted)" }}>Product Images</label>
                    <label className="flex items-center justify-center gap-2 h-16 rounded-xl border-2 border-dashed cursor-pointer transition-all text-sm font-semibold"
                      style={{ borderColor: "var(--card-border)", color: "var(--text-muted)" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
                    >
                      <input type="file" multiple accept="image/*" className="hidden" onChange={async e => {
                        const fs = Array.from(e.target.files || []);
                        const previews = await Promise.all(fs.map(f => compressImage(f, 1200, 0.85)));
                        setF({ images: [...form.images, ...previews] });
                        setFiles(prev => [...prev, ...fs]);
                      }} />
                      Upload Images
                    </label>
                    {form.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {form.images.map((src, i) => (
                          <div key={i} className="relative aspect-square rounded-lg overflow-hidden" style={{ border: "1px solid var(--card-border)" }}>
                            <img src={src} className="w-full h-full object-cover" />
                            <button onClick={() => { setF({ images: form.images.filter((_, idx) => idx !== i) }); setFiles(prev => prev.filter((_, idx) => idx !== i)); }}
                              className="absolute top-0.5 right-0.5 h-5 w-5 rounded flex items-center justify-center" style={{ background: "#EF4444" }}>
                              <X className="h-3 w-3 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-3 pt-2">
                    <button onClick={() => setF({ isActive: !form.isActive })}
                      className="h-8 px-3 rounded-lg text-xs font-semibold transition-all"
                      style={form.isActive
                        ? { background: "rgba(22,199,132,0.12)", color: "#16C784" }
                        : { background: "var(--icon-bg)", color: "var(--text-muted)" }
                      }>
                      {form.isActive ? "Active" : "Inactive"}
                    </button>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>Product visibility</span>
                  </div>

                  <button disabled={creating} onClick={handleSubmit} className="w-full btn-primary h-12 font-bold disabled:opacity-50">
                    {creating ? "Creating…" : "Save Wholesale Product"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="admin-card !p-4 flex items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "var(--text-muted)" }} />
              <input placeholder="Search products or SKU..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="admin-input pl-10 w-full" />
            </div>
          </div>

          {/* Table */}
          <div className="admin-card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Wholesale Info</th>
                    <th>Bulk Tiers</th>
                    <th>Base Price</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(rowsPerPage)].map((_, i) => (
                      <tr key={i}><td colSpan={7}><div className="h-5 rounded animate-pulse my-1 mx-2" style={{ background: "var(--icon-bg)" }} /></td></tr>
                    ))
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-14">
                        <Package className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--text-muted)" }} />
                        <p className="font-semibold text-sm" style={{ color: "var(--text-muted)" }}>
                          {search ? "No products match your search" : "No wholesale products yet"}
                        </p>
                        {!search && (
                          <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-1 text-xs font-semibold mt-2" style={{ color: ACCENT }}>
                            <Plus className="h-3.5 w-3.5" /> Add your first wholesale product
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : paginated.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center" style={{ background: "var(--icon-bg)", border: "1px solid var(--card-border)" }}>
                            {p.images?.[0]?.url
                              ? <img src={p.images[0].url} alt={p.name} className="h-full w-full object-cover" />
                              : <Package className="h-4 w-4" style={{ color: "var(--text-muted)" }} />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate max-w-[180px]" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                            <p className="text-xs font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>{p.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        {p.category ? (
                          <span className="px-2 py-0.5 rounded-lg text-xs font-semibold" style={{ background: "rgba(18,214,197,0.1)", color: ACCENT }}>
                            {p.category.name}
                          </span>
                        ) : <span style={{ color: "var(--text-muted)" }}>—</span>}
                      </td>
                      <td>
                        <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{p.unitsPerPack || 1} units/pack</p>
                        <p className="text-xs mt-0.5 font-bold uppercase" style={{ color: "var(--text-muted)" }}>MOQ: {p.wholesaleMoq || 1} packs</p>
                      </td>
                      <td>
                        {p.wholesaleTiers && p.wholesaleTiers.length > 0 ? (
                          <span className="px-2 py-0.5 rounded-lg text-xs font-semibold" style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B" }}>
                            {p.wholesaleTiers.length} tier{p.wholesaleTiers.length !== 1 ? "s" : ""}
                          </span>
                        ) : <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>}
                      </td>
                      <td>
                        <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{formatPrice(p.wholesalePrice ?? p.price)}</p>
                        {p.wholesalePrice && p.price && p.wholesalePrice !== p.price && (
                          <p className="text-xs mt-0.5 line-through" style={{ color: "var(--text-muted)" }}>Retail: {formatPrice(p.price)}</p>
                        )}
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                          style={p.isActive
                            ? { background: "rgba(22,199,132,0.12)", color: "#16C784" }
                            : { background: "rgba(239,68,68,0.1)", color: "#EF4444" }
                          }>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.isActive ? "#16C784" : "#EF4444" }} />
                          {p.isActive ? "Active" : "Hidden"}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={async () => {
                              if (!confirm("Delete this product?")) return;
                              await fetch(`/internal/admin/products/${p.id}`, { method: "DELETE" });
                              await load();
                            }}
                            className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors"
                            style={{ color: "var(--text-muted)" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#EF4444"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
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

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: "1px solid var(--card-border)" }}>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {filtered.length === 0 ? "0" : `${(page - 1) * rowsPerPage + 1}–${Math.min(page * rowsPerPage, filtered.length)}`} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-8 w-8 rounded-lg flex items-center justify-center btn-secondary !px-0 disabled:opacity-40">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const n = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                  return (
                    <button key={n} onClick={() => setPage(n)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-semibold"
                      style={n === page ? { background: ACCENT, color: "#fff" } : { color: "var(--text-muted)" }}
                    >{n}</button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 w-8 rounded-lg flex items-center justify-center btn-secondary !px-0 disabled:opacity-40">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
