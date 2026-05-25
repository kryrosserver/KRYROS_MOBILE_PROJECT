"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Plus, Edit, Trash2, Search, RefreshCcw, LayoutGrid, X,
  ChevronRight, ChevronDown, ChevronLeft, Bell, Calendar,
  Sun, Moon, Menu, Download, MoreHorizontal, Filter,
  Settings, Upload, Tag, MoreVertical,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "@/providers/ThemeProvider";

const ACCENT = "#12D6C5";
const MOBILE_BASE = 750;
const DESKTOP_BASE = 1380;
const ROWS_PER_PAGE = 10;

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  showOnHome: boolean;
  parentId?: string;
  sortOrder?: number;
  _count?: { products: number };
  children?: Category[];
};

const CATEGORY_COLORS = ["#12D6C5", "#3B82F6", "#F59E0B", "#8B5CF6", "#EF4444", "#22C55E", "#EC4899"];

function MiniSparkline({ color = ACCENT, up = true }: { color?: string; up?: boolean }) {
  const pts = up
    ? [10, 18, 14, 24, 20, 32, 28]
    : [32, 26, 28, 18, 22, 14, 12];
  const max = Math.max(...pts), min = Math.min(...pts);
  const w = 80, h = 32;
  const points = pts.map((v, i) => `${(i / (pts.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * (h - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CategoriesPage() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const { isDark, toggleTheme } = useTheme();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [parentFilter, setParentFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", slug: "", description: "", image: "",
    parentId: "", isActive: true, showOnHome: false,
  });

  const BG = "var(--bg-primary)";
  const CARD = "var(--card-bg)";
  const BORDER = "var(--card-border)";
  const TEXT = "var(--text-primary)";
  const TEXT2 = "var(--text-secondary)";
  const HOVER = "var(--hover-bg)";
  const HEADER_BG = "var(--bg-secondary)";
  const ICON_BG = "var(--icon-bg)";

  useEffect(() => {
    let raf: number;
    function applyHeight(s: number) {
      if (!innerRef.current || !outerRef.current) return;
      outerRef.current.style.height = "auto";
      const naturalH = innerRef.current.scrollHeight;
      const visualH = naturalH * s;
      const isMob = window.innerWidth < 1024;
      const avail = isMob ? window.innerHeight - 64 : Infinity;
      outerRef.current.style.height = `${visualH}px`;
    }
    function recalc() {
      if (!innerRef.current || !outerRef.current) return;
      const vw = outerRef.current.offsetWidth || window.innerWidth;
      const baseW = vw < 960 ? MOBILE_BASE : DESKTOP_BASE;
      const s = Math.min(1, vw / baseW);
      innerRef.current.style.width = `${baseW}px`;
      innerRef.current.style.transform = `scale(${s})`;
      innerRef.current.style.transformOrigin = "top left";
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(s)));
    }
    recalc();
    const t = setTimeout(recalc, 400);
    window.addEventListener("resize", recalc);
    return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, [categories]);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/categories", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : data?.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  async function compressImage(file: File, maxWidth = 800, quality = 0.8): Promise<string> {
    const blobURL = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image(); i.onload = () => resolve(i); i.onerror = reject; i.src = blobURL;
    });
    const scale = Math.min(1, maxWidth / img.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(blobURL);
    return canvas.toDataURL("image/jpeg", quality);
  }

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setForm({ name: category.name, slug: category.slug, description: category.description || "", image: category.image || "", parentId: category.parentId || "", isActive: category.isActive, showOnHome: category.showOnHome || false });
    } else {
      setEditingCategory(null);
      setForm({ name: "", slug: "", description: "", image: "", parentId: "", isActive: true, showOnHome: false });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) { alert("Please enter a category name"); return; }
    setSaving(true);
    try {
      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : "/api/admin/categories";
      const res = await fetch(url, {
        method: editingCategory ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, parentId: form.parentId || null }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to save category"); }
      await loadCategories();
      setShowModal(false);
    } catch (e: any) { alert(e.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? Products may become unassigned.")) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await loadCategories();
    } catch (e: any) { alert(e.message); }
  };

  const active = categories.filter(c => c.isActive);
  const inactive = categories.filter(c => !c.isActive);
  const totalProducts = categories.reduce((s, c) => s + (c._count?.products || 0), 0);
  const rootCategories = categories.filter(c => !c.parentId);

  const filtered = categories.filter(c => {
    const matchSearch = !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "ALL" || (statusFilter === "ACTIVE" ? c.isActive : !c.isActive);
    const matchParent = parentFilter === "ALL" || (parentFilter === "ROOT" ? !c.parentId : c.parentId === parentFilter);
    return matchSearch && matchStatus && matchParent;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pageItems = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const toggleSelect = (id: string) => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll = () => setSelectedIds(s => s.length === pageItems.length ? [] : pageItems.map(c => c.id));

  const pieData = [
    { name: "Active Categories", value: active.length || 1, color: ACCENT },
    { name: "Inactive Categories", value: inactive.length || 0, color: "#EF4444" },
  ];

  const topCategories = [...categories]
    .sort((a, b) => (b._count?.products || 0) - (a._count?.products || 0))
    .slice(0, 5);

  const card = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14 };

  const pageNums = (() => {
    const nums: (number | "...")[] = [];
    if (totalPages <= 7) for (let i = 1; i <= totalPages; i++) nums.push(i);
    else {
      if (page <= 4) { for (let i = 1; i <= 5; i++) nums.push(i); nums.push("...", totalPages); }
      else if (page >= totalPages - 3) { nums.push(1, "..."); for (let i = totalPages - 4; i <= totalPages; i++) nums.push(i); }
      else { nums.push(1, "...", page - 1, page, page + 1, "...", totalPages); }
    }
    return nums;
  })();

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: BG, margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: BG, color: TEXT, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* ── TOP HEADER BAR ── */}
        <header style={{ background: HEADER_BG, borderBottom: `1px solid ${BORDER}`, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>
              <Menu style={{ width: 20, height: 20 }} />
            </button>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: TEXT, whiteSpace: "nowrap", margin: 0 }}>Category Management</h1>
          </div>
          <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: TEXT2, width: 15, height: 15 }} />
            <input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
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
        <div style={{ padding: "20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Page title + actions — full width above both columns */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>Category Management</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: TEXT2 }}>
                <span>Home</span>
                <ChevronRight style={{ width: 13, height: 13 }} />
                <span>Categories</span>
                <ChevronRight style={{ width: 13, height: 13 }} />
                <span style={{ color: ACCENT }}>All Categories</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", borderRadius: 10, overflow: "hidden" }}>
                <button
                  onClick={() => handleOpenModal()}
                  style={{ display: "flex", alignItems: "center", gap: 8, background: ACCENT, border: "none", padding: "9px 18px", color: "#0B1320", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                  <Plus style={{ width: 15, height: 15 }} />
                  Add New Category
                </button>
                <button style={{ background: "#10C4B5", border: "none", padding: "9px 10px", color: "#0B1320", cursor: "pointer", borderLeft: "1px solid rgba(0,0,0,0.15)" }}>
                  <ChevronDown style={{ width: 14, height: 14 }} />
                </button>
              </div>
              <button style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 18px", color: TEXT2, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                <Download style={{ width: 15, height: 15 }} />
                Export Categories
                <ChevronDown style={{ width: 13, height: 13 }} />
              </button>
              <button style={{ display: "flex", alignItems: "center", justifyContent: "center", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 12px", color: TEXT2, cursor: "pointer" }}>
                <MoreHorizontal style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#EF4444" }}>{error}</div>
          )}

          {/* Stat cards — full width, matching dashboard layout */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {[
                { label: "Total Categories", value: categories.length, change: "+12.4%", up: true, color: "#22C55E", icon: LayoutGrid },
                { label: "Active Categories", value: active.length, change: "+11.8%", up: true, color: "#8B5CF6", icon: Tag },
                { label: "Inactive Categories", value: inactive.length, change: "+8.3%", up: false, color: "#EF4444", icon: X },
                { label: "Total Products", value: totalProducts, change: "+18.6%", up: true, color: ACCENT, icon: Tag },
              ].map((s, i) => (
                <div key={i} style={{ ...card, padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <s.icon style={{ width: 20, height: 20, color: s.color }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: TEXT2, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: TEXT, lineHeight: 1, marginBottom: 6 }}>{s.value.toLocaleString()}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: s.up ? "#22C55E" : "#EF4444" }}>
                      {s.up ? "▲" : "▼"} {s.change} vs last month
                    </span>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <MiniSparkline color={s.color} up={s.up} />
                  </div>
                </div>
              ))}
            </div>

            {/* Filters row */}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ position: "relative", flex: 1, maxWidth: 260 }}>
                <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: TEXT2 }} />
                <input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                  style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 12px 9px 30px", color: TEXT, fontSize: 13, outline: "none" }}
                />
              </div>
              <div style={{ position: "relative" }}>
                <select
                  value={statusFilter}
                  onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                  style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 32px 9px 12px", color: TEXT2, fontSize: 13, outline: "none", appearance: "none", cursor: "pointer" }}>
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                <ChevronDown style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: TEXT2, pointerEvents: "none" }} />
              </div>
              <div style={{ position: "relative" }}>
                <select
                  value={parentFilter}
                  onChange={e => { setParentFilter(e.target.value); setPage(1); }}
                  style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 32px 9px 12px", color: TEXT2, fontSize: 13, outline: "none", appearance: "none", cursor: "pointer" }}>
                  <option value="ALL">All Parent Categories</option>
                  <option value="ROOT">Root Only</option>
                  {rootCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: TEXT2, pointerEvents: "none" }} />
              </div>
              <button style={{ display: "flex", alignItems: "center", gap: 7, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 16px", color: TEXT2, fontSize: 13, cursor: "pointer" }}>
                <Filter style={{ width: 13, height: 13 }} />
                Filters
              </button>
              <button onClick={loadCategories} style={{ display: "flex", alignItems: "center", gap: 6, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 14px", color: TEXT2, fontSize: 13, cursor: "pointer" }}>
                <RefreshCcw style={{ width: 13, height: 13 }} />
              </button>
            </div>

            {/* Table */}
            <div style={{ ...card, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${BORDER}`, background: HOVER }}>
                      <th style={{ padding: "12px 16px", width: 40, textAlign: "left" }}>
                        <input type="checkbox" checked={selectedIds.length === pageItems.length && pageItems.length > 0} onChange={toggleAll} style={{ accentColor: ACCENT, width: 14, height: 14 }} />
                      </th>
                      {["Category", "Parent Category", "Products", "Status", "Sort Order", "Actions"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: h === "Actions" ? "right" : "left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [...Array(8)].map((_, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                          <td colSpan={7} style={{ padding: "14px 16px" }}>
                            <div style={{ height: 14, borderRadius: 6, background: HOVER }} />
                          </td>
                        </tr>
                      ))
                    ) : pageItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: 48, textAlign: "center", fontSize: 13, color: TEXT2 }}>
                          <LayoutGrid style={{ width: 36, height: 36, margin: "0 auto 10px", opacity: 0.3 }} />
                          <div>No categories found</div>
                        </td>
                      </tr>
                    ) : pageItems.map((cat, idx) => {
                      const parentName = cat.parentId ? (categories.find(c => c.id === cat.parentId)?.name || "—") : "—";
                      const isSelected = selectedIds.includes(cat.id);
                      const colorIdx = idx % CATEGORY_COLORS.length;
                      return (
                        <tr
                          key={cat.id}
                          style={{ borderBottom: `1px solid ${BORDER}`, background: isSelected ? `${ACCENT}08` : "transparent" }}
                          onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = HOVER; }}
                          onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}>
                          <td style={{ padding: "12px 16px" }}>
                            <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(cat.id)} style={{ accentColor: ACCENT, width: 14, height: 14 }} />
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 9, background: `${CATEGORY_COLORS[colorIdx]}18`, border: `1px solid ${CATEGORY_COLORS[colorIdx]}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                                {cat.image
                                  ? <img src={cat.image} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 3 }} />
                                  : <LayoutGrid style={{ width: 16, height: 16, color: CATEGORY_COLORS[colorIdx] }} />}
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{cat.name}</div>
                                <div style={{ fontSize: 11, color: TEXT2, marginTop: 1 }}>{cat.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: TEXT2 }}>{parentName}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: TEXT }}>{(cat._count?.products || 0).toLocaleString()}</td>
                          <td style={{ padding: "12px 16px" }}>
                            {cat.isActive ? (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(34,197,94,0.14)", color: "#22C55E", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E" }} />
                                Active
                              </span>
                            ) : (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(239,68,68,0.14)", color: "#EF4444", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444" }} />
                                Inactive
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: TEXT2 }}>{cat.sortOrder ?? 1}</td>
                          <td style={{ padding: "12px 16px", textAlign: "right" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                              <button
                                onClick={() => handleOpenModal(cat)}
                                style={{ background: "rgba(59,130,246,0.1)", border: "none", borderRadius: 8, padding: 7, color: "#3B82F6", cursor: "pointer" }}
                                title="Edit">
                                <Edit style={{ width: 13, height: 13 }} />
                              </button>
                              <button
                                onClick={() => handleDelete(cat.id)}
                                style={{ background: "rgba(239,68,68,0.08)", border: "none", borderRadius: 8, padding: 7, color: TEXT2, cursor: "pointer" }}
                                title="More">
                                <MoreVertical style={{ width: 13, height: 13 }} />
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
              <div style={{ padding: "14px 16px", borderTop: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: TEXT2 }}>
                  Showing {filtered.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1} to {Math.min(page * ROWS_PER_PAGE, filtered.length)} of {filtered.length} categories
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{ width: 30, height: 30, borderRadius: 8, background: HOVER, border: `1px solid ${BORDER}`, color: TEXT2, cursor: page === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: page === 1 ? 0.5 : 1 }}>
                    <ChevronLeft style={{ width: 14, height: 14 }} />
                  </button>
                  {pageNums.map((n, i) => (
                    <button
                      key={i}
                      onClick={() => typeof n === "number" && setPage(n)}
                      style={{ width: 30, height: 30, borderRadius: 8, border: n === page ? "none" : `1px solid ${BORDER}`, background: n === page ? ACCENT : HOVER, color: n === page ? "#0B1320" : TEXT2, fontWeight: n === page ? 700 : 400, fontSize: 13, cursor: typeof n === "number" ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{ width: 30, height: 30, borderRadius: 8, background: HOVER, border: `1px solid ${BORDER}`, color: TEXT2, cursor: page === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: page === totalPages ? 0.5 : 1 }}>
                    <ChevronRight style={{ width: 14, height: 14 }} />
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 8, fontSize: 13, color: TEXT2 }}>
                    Rows per page:
                    <span style={{ fontWeight: 700, color: TEXT }}>{ROWS_PER_PAGE}</span>
                    <ChevronDown style={{ width: 13, height: 13 }} />
                  </div>
                </div>
              </div>
            </div>

          {/* Overview panels row — 3 columns matching dashboard layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 14 }}>

            {/* Category Overview */}
            <div style={{ ...card, padding: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 14 }}>Category Overview</div>
              <div style={{ position: "relative", height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: TEXT }}
                      itemStyle={{ color: TEXT2 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", pointerEvents: "none" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: TEXT }}>{categories.length}</div>
                  <div style={{ fontSize: 10, color: TEXT2 }}>Total Categories</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                {pieData.map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ width: 9, height: 9, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: TEXT2 }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>
                      {d.value} ({categories.length ? ((d.value / categories.length) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ ...card, padding: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 12 }}>Quick Actions</div>
              {[
                { icon: Plus, label: "Add New Category", action: () => handleOpenModal() },
                { icon: Upload, label: "Bulk Import Categories", action: () => {} },
                { icon: Download, label: "Export Categories", action: () => {} },
                { icon: Settings, label: "Category Settings", action: () => {} },
              ].map((a, i) => (
                <button
                  key={i}
                  onClick={a.action}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", padding: "10px 0", cursor: "pointer", borderBottom: i < 3 ? `1px solid ${BORDER}` : "none" }}
                  onMouseEnter={e => { e.currentTarget.style.background = HOVER; e.currentTarget.style.borderRadius = "8px"; e.currentTarget.style.padding = "10px 8px"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.padding = "10px 0"; }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${ACCENT}14`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <a.icon style={{ width: 14, height: 14, color: ACCENT }} />
                    </div>
                    <span style={{ fontSize: 13, color: TEXT, fontWeight: 500 }}>{a.label}</span>
                  </div>
                  <ChevronRight style={{ width: 14, height: 14, color: TEXT2 }} />
                </button>
              ))}
            </div>

            {/* Top Categories */}
            <div style={{ ...card, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Top Categories</div>
                <button style={{ fontSize: 11, color: ACCENT, background: "transparent", border: "none", cursor: "pointer", fontWeight: 600 }}>View All</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {topCategories.length === 0
                  ? categories.slice(0, 5).map((cat, i) => (
                    <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                        {cat.image
                          ? <img src={cat.image} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 3 }} />
                          : <LayoutGrid style={{ width: 14, height: 14, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.name}</div>
                        <div style={{ fontSize: 11, color: TEXT2 }}>{(cat._count?.products || 0).toLocaleString()} products</div>
                      </div>
                    </div>
                  ))
                  : topCategories.map((cat, i) => (
                    <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                        {cat.image
                          ? <img src={cat.image} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 3 }} />
                          : <LayoutGrid style={{ width: 14, height: 14, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.name}</div>
                        <div style={{ fontSize: 11, color: TEXT2 }}>{(cat._count?.products || 0).toLocaleString()} products</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>{/* end body */}
      </div>

      {/* ── ADD/EDIT MODAL ── */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "var(--modal-overlay)", backdropFilter: "blur(4px)" }}>
          <div style={{ width: "100%", maxWidth: 440, borderRadius: 18, overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,0.4)", background: CARD, border: `1px solid ${BORDER}` }}>
            <div style={{ padding: "18px 22px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: 0 }}>{editingCategory ? "Edit Category" : "Add New Category"}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
              {/* Image upload */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, background: HOVER, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ width: 56, height: 56, borderRadius: 10, background: CARD, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                  {form.image ? <img src={form.image} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} /> : <LayoutGrid style={{ width: 24, height: 24, color: TEXT2 }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Category Image</div>
                  <input type="file" accept="image/*" onChange={async e => {
                    const f = e.target.files?.[0];
                    if (f) { const c = await compressImage(f); setForm(prev => ({ ...prev, image: c })); }
                  }} style={{ fontSize: 12, color: TEXT2, width: "100%" }} />
                </div>
              </div>
              {[
                { label: "Category Name *", key: "name", placeholder: "e.g. Electronics, Laptops" },
                { label: "Custom Slug (optional)", key: "slug", placeholder: "e.g. electronics (auto-generated)" },
                { label: "Description", key: "description", placeholder: "Brief category overview..." },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: TEXT2, display: "block", marginBottom: 6 }}>{f.label}</label>
                  {f.key === "description"
                    ? <textarea value={(form as any)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: "100%", background: HOVER, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 12px", color: TEXT, fontSize: 13, outline: "none", resize: "none", height: 72 }} />
                    : <input value={(form as any)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: "100%", background: HOVER, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 12px", color: TEXT, fontSize: 13, outline: "none" }} />}
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: TEXT2, display: "block", marginBottom: 6 }}>Parent Category (optional)</label>
                <select value={form.parentId} onChange={e => setForm(prev => ({ ...prev, parentId: e.target.value }))} style={{ width: "100%", background: HOVER, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 12px", color: TEXT, fontSize: 13, outline: "none", appearance: "none" }}>
                  <option value="">None (Root Category)</option>
                  {categories.filter(c => c.id !== editingCategory?.id && !c.parentId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))} style={{ accentColor: ACCENT, width: 14, height: 14 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: TEXT2 }}>Active</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={form.showOnHome} onChange={e => setForm(prev => ({ ...prev, showOnHome: e.target.checked }))} style={{ accentColor: ACCENT, width: 14, height: 14 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: TEXT2 }}>Show on Homepage</span>
                </label>
              </div>
            </div>
            <div style={{ padding: "16px 22px", borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setShowModal(false)} style={{ background: HOVER, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 20px", color: TEXT2, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ background: ACCENT, border: "none", borderRadius: 10, padding: "9px 24px", color: "#0B1320", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", minWidth: 130 }}>
                {saving ? "Saving..." : "Save Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
