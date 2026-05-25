"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Plus, Search, RefreshCw, Package, TrendingUp, TrendingDown,
  DollarSign, ShoppingCart, Star, Edit, Trash2, Eye, Filter,
  CheckSquare, Square, MoreHorizontal, Tag, AlertTriangle,
  ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, X
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

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

const ACCENT = "#12D6C5";

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
      style={isActive
        ? { background: "rgba(22,199,132,0.12)", color: "#16C784" }
        : { background: "rgba(239,68,68,0.1)", color: "#EF4444" }
      }
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: isActive ? "#16C784" : "#EF4444" }} />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}>Out of Stock</span>;
  if (stock < 10)
    return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B" }}>Low Stock</span>;
  return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: "rgba(22,199,132,0.12)", color: "#16C784" }}>In Stock</span>;
}

export default function ProductsPage() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf: number;
    function applyHeight(nextScale: number) { if (!innerRef.current || !outerRef.current) return; outerRef.current.style.height = "auto"; const naturalH = innerRef.current.scrollHeight; const visualH = naturalH * nextScale; const isMobile = window.innerWidth < 1024; const screenAvail = isMobile ? window.innerHeight - 64 : Infinity; outerRef.current.style.height = `${visualH}px`; }
    function recalc() { if (!innerRef.current || !outerRef.current) return; const vw = outerRef.current.offsetWidth || window.innerWidth; const baseW = vw < 960 ? 750 : 1380; const nextScale = Math.min(1, vw / baseW); innerRef.current.style.width = `${baseW}px`; innerRef.current.style.transform = `scale(${nextScale})`; innerRef.current.style.transformOrigin = "top left"; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(nextScale))); }
    recalc(); const t = setTimeout(recalc, 400); window.addEventListener("resize", recalc); return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);

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
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : data.items ?? data.products ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    load().finally(() => setTimeout(() => setIsRefreshing(false), 300));
  };

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || (statusFilter === "active" ? p.isActive : !p.isActive);
    const matchStock = stockFilter === "all" ||
      (stockFilter === "out" && p.stock === 0) ||
      (stockFilter === "low" && p.stock > 0 && p.stock < 10) ||
      (stockFilter === "in" && p.stock >= 10);
    return matchSearch && matchStatus && matchStock;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const stats = [
    {
      label: "Total Products", value: products.length,
      icon: Package, iconBg: "rgba(18,214,197,0.12)", iconColor: ACCENT,
      sub: `${products.filter(p => p.isActive).length} active`,
      trend: <span style={{ color: ACCENT }}><ArrowUpRight className="h-3 w-3 inline" /> Live</span>,
    },
    {
      label: "In Stock", value: products.filter(p => p.stock >= 10).length,
      icon: ShoppingCart, iconBg: "rgba(22,199,132,0.12)", iconColor: "#16C784",
      sub: `${products.filter(p => p.stock > 0 && p.stock < 10).length} low`,
      trend: <span style={{ color: "#16C784" }}><ArrowUpRight className="h-3 w-3 inline" /></span>,
    },
    {
      label: "Out of Stock", value: products.filter(p => p.stock === 0).length,
      icon: AlertTriangle, iconBg: "rgba(239,68,68,0.1)", iconColor: "#EF4444",
      sub: "Need restocking",
      trend: <span style={{ color: "#EF4444" }}><ArrowDownRight className="h-3 w-3 inline" /></span>,
    },
    {
      label: "Featured", value: products.filter(p => p.isFeatured).length,
      icon: Star, iconBg: "rgba(245,158,11,0.12)", iconColor: "#F59E0B",
      sub: "On homepage",
      trend: <span style={{ color: "#F59E0B" }}><ArrowUpRight className="h-3 w-3 inline" /></span>,
    },
  ];

  const handleSelectAll = () => {
    if (selected.size === paginated.length && paginated.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginated.map(p => p.id)));
    }
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
    } catch { /* ignore */ }
  };

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: "var(--bg-primary)", margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: "var(--bg-primary)", padding: "24px" }}>
        <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)" }}>

          {/* Header */}
          <div className="flex flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                <Link href="/admin" className="hover:underline" style={{ color: "var(--text-muted)" }}>Home</Link>
                <span>/</span>
                <span>Products</span>
              </div>
              <h1 className="text-2xl font-bold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>Products</h1>
              <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                Manage your product catalogue — {products.length} total
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="btn-secondary !h-10 !w-10 !px-0 flex items-center justify-center"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
              <Link href="/admin/products/new" className="btn-primary flex items-center gap-2 px-4 h-10">
                <Plus className="h-4 w-4" /> Add Product
              </Link>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="admin-card !p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: s.iconBg }}>
                    <s.icon className="h-5 w-5" style={{ color: s.iconColor }} />
                  </div>
                  <div className="text-xs font-semibold">{s.trend}</div>
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)", minHeight: "2.5rem" }}>{s.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>{s.value}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {error && (
            <div className="rounded-xl p-4 text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}

          {/* Filter Bar */}
          <div className="admin-card !p-4 flex items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "var(--text-muted)" }} />
              <input
                placeholder="Search products or SKU..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="admin-input pl-10 w-full"
              />
            </div>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="admin-input h-9 text-sm !w-auto min-w-[130px]">
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select value={stockFilter} onChange={e => { setStockFilter(e.target.value); setPage(1); }} className="admin-input h-9 text-sm !w-auto min-w-[130px]">
              <option value="all">All Stock</option>
              <option value="in">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
            {selected.size > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{selected.size} selected</span>
                <button className="btn-secondary h-9 px-3 text-xs flex items-center gap-1.5" style={{ color: "#EF4444" }}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
                <button onClick={() => setSelected(new Set())} className="h-9 w-9 flex items-center justify-center btn-secondary !px-0">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="admin-card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="!px-4 !py-3 w-10">
                      <button onClick={handleSelectAll}>
                        {selected.size === paginated.length && paginated.length > 0
                          ? <CheckSquare className="h-4 w-4" style={{ color: ACCENT }} />
                          : <Square className="h-4 w-4" style={{ color: "var(--text-muted)" }} />}
                      </button>
                    </th>
                    <th>Product</th>
                    <th>Category / Brand</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Rating</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(rowsPerPage)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan={8}>
                          <div className="h-5 rounded animate-pulse my-1 mx-2" style={{ background: "var(--icon-bg)" }} />
                        </td>
                      </tr>
                    ))
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-14">
                        <Package className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--text-muted)" }} />
                        <p className="font-semibold text-sm" style={{ color: "var(--text-muted)" }}>
                          {search || statusFilter !== "all" || stockFilter !== "all" ? "No products match filters" : "No products yet"}
                        </p>
                        {!search && statusFilter === "all" && stockFilter === "all" && (
                          <Link href="/admin/products/new" className="inline-flex items-center gap-1 text-xs font-semibold mt-2" style={{ color: ACCENT }}>
                            <Plus className="h-3.5 w-3.5" /> Add your first product
                          </Link>
                        )}
                      </td>
                    </tr>
                  ) : paginated.map((product) => (
                    <tr key={product.id}>
                      <td className="!px-4">
                        <button onClick={() => toggleSelect(product.id)}>
                          {selected.has(product.id)
                            ? <CheckSquare className="h-4 w-4" style={{ color: ACCENT }} />
                            : <Square className="h-4 w-4" style={{ color: "var(--text-muted)" }} />}
                        </button>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                            style={{ background: "var(--icon-bg)", border: "1px solid var(--card-border)" }}
                          >
                            {product.images?.[0]?.url ? (
                              <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <Package className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate max-w-[200px]" style={{ color: "var(--text-primary)" }}>
                              {product.name}
                            </p>
                            {product.sku && (
                              <p className="text-xs mt-0.5 font-mono" style={{ color: "var(--text-muted)" }}>SKU: {product.sku}</p>
                            )}
                            {product.isFeatured && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold" style={{ color: "#F59E0B" }}>
                                <Star className="h-2.5 w-2.5 fill-current" /> Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          {product.category && (
                            <span className="px-2 py-0.5 rounded-lg text-xs font-semibold" style={{ background: "rgba(18,214,197,0.1)", color: ACCENT }}>
                              {product.category.name}
                            </span>
                          )}
                          {product.brand && (
                            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{product.brand.name}</p>
                          )}
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{formatPrice(product.price)}</p>
                          {product.salePrice && product.salePrice < product.price && (
                            <p className="text-xs mt-0.5 line-through" style={{ color: "var(--text-muted)" }}>{formatPrice(product.salePrice)}</p>
                          )}
                        </div>
                      </td>
                      <td>
                        <div>
                          <StockBadge stock={product.stock} />
                          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{product.stock} units</p>
                        </div>
                      </td>
                      <td>
                        <StatusBadge isActive={product.isActive} />
                      </td>
                      <td>
                        {product.rating != null ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-current" style={{ color: "#F59E0B" }} />
                            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{product.rating.toFixed(1)}</span>
                            {product.reviewCount != null && (
                              <span className="text-xs" style={{ color: "var(--text-muted)" }}>({product.reviewCount})</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors"
                            style={{ color: "var(--text-muted)" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "var(--hover-bg)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors"
                            style={{ color: "var(--text-muted)" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "var(--hover-bg)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
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
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderTop: "1px solid var(--card-border)" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Rows per page</span>
                <select
                  value={rowsPerPage}
                  onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                  className="admin-input h-8 !py-0 text-xs !w-auto"
                >
                  {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {filtered.length === 0 ? "0" : `${(page - 1) * rowsPerPage + 1}–${Math.min(page * rowsPerPage, filtered.length)}`} of {filtered.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 w-8 rounded-lg flex items-center justify-center btn-secondary !px-0 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors"
                      style={pageNum === page
                        ? { background: ACCENT, color: "#fff" }
                        : { color: "var(--text-muted)" }}
                      onMouseEnter={e => { if (pageNum !== page) e.currentTarget.style.background = "var(--hover-bg)"; }}
                      onMouseLeave={e => { if (pageNum !== page) e.currentTarget.style.background = "transparent"; }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 w-8 rounded-lg flex items-center justify-center btn-secondary !px-0 disabled:opacity-40"
                >
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
