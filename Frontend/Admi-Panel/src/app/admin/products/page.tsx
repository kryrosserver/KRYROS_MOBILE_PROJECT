"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Plus, Search, RefreshCw, Package, TrendingUp, TrendingDown,
  DollarSign, ShoppingCart, Star, Edit, Trash2, Eye, Filter,
  CheckSquare, Square, MoreHorizontal, Tag, AlertTriangle,
  ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, X,
  Bell, Calendar, Sun, Moon, Menu, ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { useTheme } from "@/providers/ThemeProvider";

const ACCENT = "#12D6C5";

type Product = {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  price: number;
  salePrice?: number;
  stock: number;
  isActive: boolean;
  isFeatured?: boolean;
  rating?: number;
  reviewCount?: number;
  category?: { id: string; name: string };
  brand?: { id: string; name: string };
  images?: { url: string }[];
  createdAt?: string;
};

export default function ProductsPage() {
  const { isDark, toggleTheme } = useTheme();

  const BG = "var(--bg-primary)";
  const CARD = "var(--card-bg)";
  const BORDER = "var(--card-border)";
  const TEXT = "var(--text-primary)";
  const TEXT2 = "var(--text-secondary)";
  const HOVER = "var(--hover-bg)";
  const HEADER_BG = "var(--bg-secondary)";
  const ICON_BG = "var(--icon-bg)";

  useEffect(() => {}, []);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/internal/admin/products?limit=200");
      const body = await res.json().catch(() => ({}));
      if (res.status === 503) {
        throw new Error(
          body.message ||
          "The backend server is starting up (cold start). Please wait 15–30 seconds and click Retry."
        );
      }
      if (!res.ok) {
        throw new Error(
          body.error ||
          `Server error ${res.status} — please try refreshing.`
        );
      }
      setProducts(Array.isArray(body) ? body : body.data ?? body.items ?? body.products ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load products");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    load().finally(() => setTimeout(() => setIsRefreshing(false), 300));
  };

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || (statusFilter === "active" ? p.isActive : !p.isActive);
    const matchStock = stockFilter === "all" || (stockFilter === "out" && p.stock === 0) || (stockFilter === "low" && p.stock > 0 && p.stock < 10) || (stockFilter === "in" && p.stock >= 10);
    return matchSearch && matchStatus && matchStock;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleSelectAll = () => {
    if (selected.size === paginated.length && paginated.length > 0) setSelected(new Set());
    else setSelected(new Set(paginated.map(p => p.id)));
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await fetch(`/internal/admin/products/${id}`, { method: "DELETE" });
      setProducts(ps => ps.filter(p => p.id !== id));
    } catch {}
  };

  const card = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14 };

  const stockBadge = (stock: number) => {
    if (stock === 0) return { color: "#EF4444", bg: "rgba(239,68,68,0.1)", label: "Out of Stock" };
    if (stock < 10) return { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", label: "Low Stock" };
    return { color: "#16C784", bg: "rgba(22,199,132,0.12)", label: "In Stock" };
  };

  const stats = [
    { label: "Total Products", value: products.length, icon: Package, color: ACCENT, sub: `${products.filter(p => p.isActive).length} active`, up: true },
    { label: "In Stock", value: products.filter(p => p.stock >= 10).length, icon: ShoppingCart, color: "#16C784", sub: `${products.filter(p => p.stock > 0 && p.stock < 10).length} low`, up: true },
    { label: "Out of Stock", value: products.filter(p => p.stock === 0).length, icon: AlertTriangle, color: "#EF4444", sub: "Need restocking", up: false },
    { label: "Featured", value: products.filter(p => p.isFeatured).length, icon: Star, color: "#F59E0B", sub: "On homepage", up: true },
  ];

  const pageNums = (() => {
    const nums: (number | "...")[] = [];
    if (totalPages <= 7) for (let i = 1; i <= totalPages; i++) nums.push(i);
    else if (page <= 4) { for (let i = 1; i <= 5; i++) nums.push(i); nums.push("...", totalPages); }
    else if (page >= totalPages - 3) { nums.push(1, "..."); for (let i = totalPages - 4; i <= totalPages; i++) nums.push(i); }
    else nums.push(1, "...", page - 1, page, page + 1, "...", totalPages);
    return nums;
  })();

  return (
    <div style={{ overflow: "hidden", background: BG, margin: "-24px", width: "calc(100% + 48px)" }}>
      <div style={{ background: BG, color: TEXT, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* ── TOP HEADER BAR ── */}
        <header style={{ background: HEADER_BG, borderBottom: `1px solid ${BORDER}`, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>
              <Menu style={{ width: 20, height: 20 }} />
            </button>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: TEXT, whiteSpace: "nowrap", margin: 0 }}>Products Management</h1>
          </div>
          <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: TEXT2, width: 15, height: 15 }} />
            <input
              placeholder="Search products or SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "8px 40px 8px 36px", color: TEXT, fontSize: 13, outline: "none" }}
            />
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: TEXT2, background: ICON_BG, padding: "2px 5px", borderRadius: 4 }}>⌘K</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ position: "relative", background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>
              <Bell style={{ width: 20, height: 20 }} />
              <span style={{ position: "absolute", top: 0, right: 0, background: "#EF4444", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>1</span>
            </button>
            <button onClick={toggleTheme} style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>
              {isDark ? <Sun style={{ width: 20, height: 20 }} /> : <Moon style={{ width: 20, height: 20 }} />}
            </button>
            <button style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "7px 14px", color: TEXT2, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
              <Calendar style={{ width: 14, height: 14 }} />
              May 20 – May 26, 2025
              <ChevronDown style={{ width: 13, height: 13 }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0B1320", flexShrink: 0 }}>K</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, lineHeight: 1 }}>Admin</div>
                <div style={{ fontSize: 10, color: TEXT2, marginTop: 1 }}>Super Admin</div>
              </div>
              <ChevronDown style={{ width: 14, height: 14, color: TEXT2 }} />
            </div>
          </div>
        </header>

        {/* ── BODY ── */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Page title + actions */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>Products</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: TEXT2 }}>
                <Link href="/admin" style={{ color: TEXT2, textDecoration: "none" }}>Home</Link>
                <ChevronRight style={{ width: 13, height: 13 }} />
                <span style={{ color: ACCENT }}>Products</span>
              </div>
              <p style={{ fontSize: 12, color: TEXT2, marginTop: 4 }}>Manage your product catalogue — {products.length} total</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={handleRefresh}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, color: TEXT2, cursor: "pointer" }}>
                <RefreshCw style={{ width: 15, height: 15, animation: isRefreshing ? "spin 0.6s linear infinite" : "none" }} />
              </button>
              <Link href="/admin/products/new"
                style={{ display: "flex", alignItems: "center", gap: 8, background: ACCENT, border: "none", padding: "9px 18px", color: "#0B1320", fontWeight: 700, fontSize: 13, cursor: "pointer", borderRadius: 10, textDecoration: "none", whiteSpace: "nowrap" }}>
                <Plus style={{ width: 15, height: 15 }} /> Add Product
              </Link>
            </div>
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "14px 18px", fontSize: 13, color: "#EF4444", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <span>⚠️ {error}</span>
              <button onClick={load} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 7, padding: "5px 14px", color: "#EF4444", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>Retry</button>
            </div>
          )}

          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">>
            {stats.map((s, i) => (
              <div key={i} style={{ ...card, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <s.icon style={{ width: 20, height: 20, color: s.color }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.up ? "#22C55E" : "#EF4444" }}>
                    {s.up ? <ArrowUpRight style={{ width: 14, height: 14, display: "inline" }} /> : <ArrowDownRight style={{ width: 14, height: 14, display: "inline" }} />}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: TEXT2, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: TEXT, lineHeight: 1 }}>{s.value.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: TEXT2, marginTop: 4 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Filter Bar */}
          <div style={{ ...card, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
              <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: TEXT2 }} />
              <input
                placeholder="Search products or SKU..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={{ width: "100%", background: ICON_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 12px 9px 30px", color: TEXT, fontSize: 13, outline: "none" }}
              />
            </div>
            {[
              { value: statusFilter, onChange: (v: string) => { setStatusFilter(v); setPage(1); }, opts: [["all", "All Statuses"], ["active", "Active"], ["inactive", "Inactive"]] },
              { value: stockFilter, onChange: (v: string) => { setStockFilter(v); setPage(1); }, opts: [["all", "All Stock"], ["in", "In Stock"], ["low", "Low Stock"], ["out", "Out of Stock"]] },
            ].map((sel, i) => (
              <div key={i} style={{ position: "relative" }}>
                <select value={sel.value} onChange={e => sel.onChange(e.target.value)}
                  style={{ background: ICON_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 28px 9px 12px", color: TEXT2, fontSize: 13, outline: "none", appearance: "none", cursor: "pointer" }}>
                  {sel.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <ChevronDown style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, color: TEXT2, pointerEvents: "none" }} />
              </div>
            ))}
            {selected.size > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: TEXT2 }}>{selected.size} selected</span>
                <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "rgba(239,68,68,0.08)", color: "#EF4444", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  <Trash2 style={{ width: 13, height: 13 }} /> Delete
                </button>
                <button onClick={() => setSelected(new Set())}
                  style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: CARD, color: TEXT2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div style={{ ...card, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}`, background: HOVER }}>
                    <th style={{ padding: "12px 16px", width: 40, textAlign: "left" }}>
                      <button onClick={handleSelectAll} style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex" }}>
                        {selected.size === paginated.length && paginated.length > 0
                          ? <CheckSquare style={{ width: 16, height: 16, color: ACCENT }} />
                          : <Square style={{ width: 16, height: 16, color: TEXT2 }} />}
                      </button>
                    </th>
                    {["Product", "Category / Brand", "Price", "Stock", "Status", "Rating", "Actions"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: h === "Actions" ? "right" : "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(rowsPerPage)].map((_, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                        <td colSpan={8} style={{ padding: "14px 16px" }}><div style={{ height: 14, borderRadius: 6, background: HOVER }} /></td>
                      </tr>
                    ))
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: 48, textAlign: "center", fontSize: 13, color: TEXT2 }}>
                        <Package style={{ width: 36, height: 36, margin: "0 auto 10px", opacity: 0.3 }} />
                        <div>{search || statusFilter !== "all" || stockFilter !== "all" ? "No products match filters" : "No products yet"}</div>
                        {!search && statusFilter === "all" && stockFilter === "all" && (
                          <Link href="/admin/products/new" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: ACCENT, marginTop: 8, textDecoration: "none" }}>
                            <Plus style={{ width: 13, height: 13 }} /> Add your first product
                          </Link>
                        )}
                      </td>
                    </tr>
                  ) : paginated.map((product) => {
                    const isSelected = selected.has(product.id);
                    const sb = stockBadge(product.stock);
                    return (
                      <tr key={product.id}
                        style={{ borderBottom: `1px solid ${BORDER}`, background: isSelected ? `${ACCENT}08` : "transparent" }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = HOVER; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}>
                        <td style={{ padding: "12px 16px" }}>
                          <button onClick={() => toggleSelect(product.id)} style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex" }}>
                            {isSelected
                              ? <CheckSquare style={{ width: 16, height: 16, color: ACCENT }} />
                              : <Square style={{ width: 16, height: 16, color: TEXT2 }} />}
                          </button>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 9, background: ICON_BG, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                              {product.images?.[0]?.url
                                ? <img src={product.images[0].url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : <Package style={{ width: 16, height: 16, color: TEXT2 }} />}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{product.name}</div>
                              {product.sku && <div style={{ fontSize: 11, color: TEXT2, marginTop: 2, fontFamily: "monospace" }}>SKU: {product.sku}</div>}
                              {product.isFeatured && <span style={{ fontSize: 10, fontWeight: 700, color: "#F59E0B" }}>★ Featured</span>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {product.category && <span style={{ fontSize: 11, fontWeight: 700, color: ACCENT, background: `${ACCENT}15`, padding: "3px 10px", borderRadius: 20 }}>{product.category.name}</span>}
                          {product.brand && <div style={{ fontSize: 11, color: TEXT2, marginTop: 4 }}>{product.brand.name}</div>}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: TEXT }}>{formatPrice(product.price)}</div>
                          {product.salePrice && product.salePrice < product.price && (
                            <div style={{ fontSize: 11, color: TEXT2, marginTop: 2, textDecoration: "line-through" }}>{formatPrice(product.salePrice)}</div>
                          )}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: sb.color, background: sb.bg, padding: "4px 10px", borderRadius: 20 }}>{sb.label}</span>
                          <div style={{ fontSize: 11, color: TEXT2, marginTop: 4 }}>{product.stock} units</div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: product.isActive ? "#16C784" : "#EF4444", background: product.isActive ? "rgba(22,199,132,0.12)" : "rgba(239,68,68,0.1)", padding: "4px 10px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 5 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: product.isActive ? "#16C784" : "#EF4444" }} />
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {product.rating != null ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <Star style={{ width: 13, height: 13, color: "#F59E0B", fill: "#F59E0B" }} />
                              <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{product.rating.toFixed(1)}</span>
                              {product.reviewCount != null && <span style={{ fontSize: 11, color: TEXT2 }}>({product.reviewCount})</span>}
                            </div>
                          ) : <span style={{ fontSize: 11, color: TEXT2 }}>—</span>}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                            {[
                              { Icon: Eye, href: `/admin/products/${product.id}`, hc: ACCENT, hb: `${ACCENT}15` },
                              { Icon: Edit, href: `/admin/products/${product.id}/edit`, hc: "#3B82F6", hb: "rgba(59,130,246,0.1)" },
                            ].map(({ Icon, href, hc, hb }, ii) => (
                              <Link key={ii} href={href}
                                style={{ padding: 8, borderRadius: 8, color: TEXT2, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
                                onMouseEnter={e => { (e.currentTarget as any).style.color = hc; (e.currentTarget as any).style.background = hb; }}
                                onMouseLeave={e => { (e.currentTarget as any).style.color = TEXT2; (e.currentTarget as any).style.background = "transparent"; }}>
                                <Icon style={{ width: 15, height: 15 }} />
                              </Link>
                            ))}
                            <button onClick={() => handleDelete(product.id)}
                              style={{ padding: 8, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: TEXT2, display: "flex" }}
                              onMouseEnter={e => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                              onMouseLeave={e => { e.currentTarget.style.color = TEXT2; e.currentTarget.style.background = "transparent"; }}>
                              <Trash2 style={{ width: 15, height: 15 }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: `1px solid ${BORDER}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: TEXT2 }}>Rows per page</span>
                <div style={{ position: "relative" }}>
                  <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                    style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "5px 24px 5px 10px", color: TEXT2, fontSize: 12, outline: "none", appearance: "none", cursor: "pointer" }}>
                    {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <ChevronDown style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", width: 11, height: 11, color: TEXT2, pointerEvents: "none" }} />
                </div>
                <span style={{ fontSize: 12, color: TEXT2 }}>
                  {filtered.length === 0 ? "0" : `${(page - 1) * rowsPerPage + 1}–${Math.min(page * rowsPerPage, filtered.length)}`} of {filtered.length}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: CARD, color: TEXT2, cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>‹</button>
                {pageNums.map((n, i) => (
                  <button key={i} onClick={() => typeof n === "number" && setPage(n)} disabled={n === "..."}
                    style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: n === page ? ACCENT : CARD, color: n === page ? "#0B1320" : TEXT2, fontWeight: n === page ? 800 : 400, cursor: n === "..." ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{n}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: CARD, color: TEXT2, cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>›</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}