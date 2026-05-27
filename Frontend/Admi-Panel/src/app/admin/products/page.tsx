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
  const BG = "#F8F9FA";
  const CARD = "#FFFFFF";
  const BORDER = "#E5E7EB";
  const TEXT = "#111827";
  const TEXT2 = "#4B5563";
  const TEXT3 = "#9CA3AF";
  const HOVER = "#F9FAFB";
  const HEADER_BG = "#FFFFFF";
  const ICON_BG = "#F9FAFB";
  const ACCENT = "#6366F1";


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
          `Server error ${res.status}   please try refreshing.`
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

  const card = { background: CARD, border: "1px solid #E5E7EB", borderRadius: 14 };

  const stockBadge = (stock: number) => {
    if (stock === 0) return { color: "#EF4444", bg: "rgba(239,68,68,0.1)", label: "Out of Stock" };
    if (stock < 10) return { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", label: "Low Stock" };
    return { color: "#16C784", bg: "rgba(22,199,132,0.12)", label: "In Stock" };
  };

  const stats = [
    { label: "Total Products", value: products.length, icon: Package, color: "#6366F1", sub: `${products.filter(p => p.isActive).length} active`, up: true },
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
    <div style={{ background: "#F8F9FA", minHeight: "100vh", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Products</h2>
          <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>{products.length} products</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { setIsRefreshing(true); load().then(() => setIsRefreshing(false)); }}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 16px", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <RefreshCw style={{ width: 14, height: 14 }} /> Refresh
          </button>
          <Link href="/admin/products/new" style={{ display: "flex", alignItems: "center", gap: 8, background: "#6366F1", border: "none", borderRadius: 10, padding: "9px 18px", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
            <Plus style={{ width: 15, height: 15 }} /> Add Product
          </Link>
        </div>
      </div>
      {error && <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#EF4444", marginBottom: 16 }}>{error}</div>}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 320 }}>
          <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", width: 15, height: 15 }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search products..."
            style={{ width: "100%", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 12px 9px 36px", color: "#111827", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 14px", color: "#374151", fontSize: 13, outline: "none", cursor: "pointer" }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={stockFilter} onChange={e => { setStockFilter(e.target.value); setPage(1); }}
          style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 14px", color: "#374151", fontSize: 13, outline: "none", cursor: "pointer" }}>
          <option value="all">All Stock</option>
          <option value="in">In Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                <th style={{ padding: "11px 16px" }}><input type="checkbox" onChange={e => { if (e.target.checked) setSelected(new Set(products.map(p => p.id))); else setSelected(new Set()); }} checked={products.length > 0 && products.every(p => selected.has(p.id))} /></th>
                {["Product", "Price", "Stock", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontWeight: 700, color: "#374151", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} style={{ padding: "14px 16px" }}><div style={{ height: 14, borderRadius: 6, background: "#F3F4F6", width: j === 0 ? 20 : j === 1 ? 140 : 80 }} /></td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>No products found.</td></tr>
              ) : products.map((p, idx) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #F3F4F6", background: selected.has(p.id) ? "#EEF2FF" : idx % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                  <td style={{ padding: "12px 16px" }}><input type="checkbox" checked={selected.has(p.id)} onChange={() => { const next = new Set(selected); next.has(p.id) ? next.delete(p.id) : next.add(p.id); setSelected(next); }} /></td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {p.images?.[0]?.url ? <img src={p.images[0].url} alt={p.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", border: "1px solid #E5E7EB" }} /> : (
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#6366F1" }}>{p.name?.charAt(0)}</div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: "#111827" }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: "#9CA3AF" }}>{p.sku || "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#111827" }}>${(p.price || 0).toFixed(2)}</td>
                  <td style={{ padding: "12px 16px", color: "#6B7280" }}>{p.stock ?? 0}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: p.isActive ? "#D1FAE5" : "#FEE2E2", color: p.isActive ? "#065F46" : "#991B1B" }}>{p.isActive ? "Active" : "Inactive"}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Link href={`/admin/products/${p.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 7, padding: "5px 10px", color: "#4338CA", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                      <Edit style={{ width: 13, height: 13 }} /> Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
