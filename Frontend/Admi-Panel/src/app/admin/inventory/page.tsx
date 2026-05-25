"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Search, Package, Edit2, Trash2, Database, Layers, MoveRight, History, Bell, Calendar, Sun, Moon, Menu, ChevronDown } from "lucide-react";
import { useInvoiceStore, Product } from "@/providers/InvoiceStore";
import { formatPrice } from "@/lib/utils";
import { useTheme } from "@/providers/ThemeProvider";

export default function InventoryPage() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const { isDark, toggleTheme } = useTheme();
  const { products, addProduct } = useInvoiceStore();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({ name: "", price: 0 });

  useEffect(() => {
    let raf: number;
    function applyHeight(s: number) { if (!innerRef.current || !outerRef.current) return; outerRef.current.style.height = "auto"; outerRef.current.style.height = `${innerRef.current.scrollHeight * s}px`; }
    function recalc() { if (!innerRef.current || !outerRef.current) return; const vw = outerRef.current.offsetWidth || window.innerWidth; const baseW = vw < 960 ? 750 : 1380; const s = Math.min(1, vw / baseW); innerRef.current.style.width = `${baseW}px`; innerRef.current.style.transform = `scale(${s})`; innerRef.current.style.transformOrigin = "top left"; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(s))); }
    recalc(); const t = setTimeout(recalc, 400); window.addEventListener("resize", recalc); return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);

  const handleAdd = () => {
    if (!newProduct.name || newProduct.price <= 0) return;
    addProduct(newProduct);
    setNewProduct({ name: "", price: 0 });
    setShowAdd(false);
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const stats = [
    { label: "Total Items",     value: products.length,                                        color: "var(--text-primary)" },
    { label: "Low Stock",       value: 0,                                                       color: "#F59E0B" },
    { label: "Out of Stock",    value: 0,                                                       color: "#EF4444" },
    { label: "Inventory Value", value: formatPrice(products.reduce((s, p) => s + p.price, 0)), color: "#16C784" },
  ];

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: "var(--bg-primary)", margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: "var(--bg-primary)", color: "var(--text-primary)", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <header style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--card-border)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 4 }}><Menu style={{ width: 20, height: 20 }} /></button>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", margin: 0 }}>Inventory</h1>
          </div>
          <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", width: 15, height: 15 }} />
            <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 10, padding: "8px 40px 8px 36px", color: "var(--text-primary)", fontSize: 13, outline: "none" }} />
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "var(--text-secondary)", background: "var(--icon-bg)", padding: "2px 5px", borderRadius: 4 }}>⌘K</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ position: "relative", background: "transparent", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 4 }}>
              <Bell style={{ width: 20, height: 20 }} />
              <span style={{ position: "absolute", top: 0, right: 0, background: "#EF4444", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>1</span>
            </button>
            <button onClick={toggleTheme} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 4 }}>{isDark ? <Sun style={{ width: 20, height: 20 }} /> : <Moon style={{ width: 20, height: 20 }} />}</button>
            <button style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 10, padding: "7px 14px", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
              <Calendar style={{ width: 14, height: 14 }} /> May 20 – May 26, 2025 <ChevronDown style={{ width: 13, height: 13 }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#12D6C5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0B1320" }}>K</div>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>Admin</div><div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 1 }}>Super Admin</div></div>
              <ChevronDown style={{ width: 14, height: 14, color: "var(--text-secondary)" }} />
            </div>
          </div>
        </header>
        <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)", padding: "20px" }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Inventory</h2>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Track and manage your product stock levels</p>
            </div>
            <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> Add Product</button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="admin-card !py-4">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                <p className="text-2xl font-black mt-1.5" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {showAdd && (
            <div className="admin-card space-y-4">
              <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Add New Product</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="Product Name" className="admin-input" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
                <input type="number" placeholder="Unit Price" className="admin-input" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })} />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleAdd} className="btn-primary">Save Product</button>
              </div>
            </div>
          )}

          <div className="admin-card !p-0 overflow-hidden">
            <div className="p-4 flex items-center justify-between gap-4" style={{ borderBottom: "1px solid var(--card-border)" }}>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "var(--text-muted)" }} />
                <input placeholder="Search products by name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="admin-input pl-10 w-full" />
              </div>
              <div className="flex items-center gap-1">
                {[Layers, History].map((Icon, i) => (
                  <button key={i} className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-muted)" }} onMouseEnter={e => { e.currentTarget.style.background = "var(--hover-bg)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}><Icon className="h-4 w-4" /></button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead><tr><th>Product Name</th><th>SKU</th><th className="text-center">Stock</th><th className="text-right">Unit Price</th><th className="text-right">Actions</th></tr></thead>
                <tbody>
                  {filtered.length > 0 ? filtered.map((p) => (
                    <tr key={p.id} className="group">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: "var(--icon-bg)", color: "var(--text-muted)" }}><Package className="h-5 w-5" /></div>
                          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{p.name}</span>
                        </div>
                      </td>
                      <td className="font-mono text-sm" style={{ color: "var(--text-muted)" }}>#{p.id.slice(0, 8).toUpperCase()}</td>
                      <td className="text-center"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(22,199,132,0.12)", color: "#16C784" }}>In Stock</span></td>
                      <td className="text-right font-bold" style={{ color: "var(--text-primary)" }}>{formatPrice(p.price)}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {[{ Icon: MoveRight, title: "Stock Movement", danger: false }, { Icon: Edit2, title: "Edit", danger: false }, { Icon: Trash2, title: "Delete", danger: true }].map(({ Icon, title, danger }) => (
                            <button key={title} title={title} className="p-2 rounded-lg transition-colors" style={{ color: danger ? "#EF4444" : "var(--text-muted)" }} onMouseEnter={e => { e.currentTarget.style.background = danger ? "rgba(239,68,68,0.1)" : "var(--hover-bg)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}><Icon className="h-4 w-4" /></button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3" style={{ color: "var(--text-muted)" }}>
                        <Database className="h-12 w-12 opacity-20" />
                        <p className="font-semibold text-sm">No inventory found</p>
                        <button onClick={() => setShowAdd(true)} className="text-sm font-bold underline" style={{ color: "#12D6C5" }}>Add your first product</button>
                      </div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
