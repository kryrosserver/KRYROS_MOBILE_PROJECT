"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Bell, Calendar, Sun, Moon, Menu, ChevronDown, ChevronRight,
  Search, Plus, Edit, Trash2, Tag, Globe, RefreshCcw, X,
  CheckCircle2, XCircle, Download, MoreHorizontal, Filter,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useTheme } from "@/providers/ThemeProvider";

const ACCENT = "#12D6C5";
const ROWS_PER_PAGE = 10;
const BRAND_COLORS = ["#12D6C5", "#3B82F6", "#F59E0B", "#8B5CF6", "#EF4444", "#22C55E", "#EC4899"];

type Brand = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  isActive: boolean;
  categoryId?: string;
  category?: { id: string; name: string };
};

type Category = { id: string; name: string };

function MiniSparkline({ color = ACCENT, up = true }: { color?: string; up?: boolean }) {
  const data = up
    ? [{ v: 1 }, { v: 2 }, { v: 1.5 }, { v: 3 }, { v: 2.5 }, { v: 4 }, { v: 3.8 }]
    : [{ v: 4 }, { v: 3 }, { v: 3.5 }, { v: 2 }, { v: 2.5 }, { v: 1.5 }, { v: 1.2 }];
  return (
    <ResponsiveContainer width="100%" height={32}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sgb${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#sgb${color.replace("#", "")})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function BrandsPage() {
  const { isDark, toggleTheme } = useTheme();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "", website: "", isActive: true, categoryId: "" });

  const BG = "var(--bg-primary)";
  const CARD = "var(--card-bg)";
  const BORDER = "var(--card-border)";
  const TEXT = "var(--text-primary)";
  const TEXT2 = "var(--text-secondary)";
  const HOVER = "var(--hover-bg)";
  const HEADER_BG = "var(--bg-secondary)";
  const ICON_BG = "var(--icon-bg)";

  useEffect(() => {}, []);

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : data?.data || []);
    } catch {}
  }, []);

  const loadBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/brands", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load brands");
      const data = await res.json();
      setBrands(Array.isArray(data) ? data : data?.data || []);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadBrands(); loadCategories(); }, [loadBrands, loadCategories]);

  const handleOpenModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setForm({ name: brand.name, slug: brand.slug, description: brand.description || "", website: brand.website || "", isActive: brand.isActive, categoryId: brand.categoryId || "" });
    } else {
      setEditingBrand(null);
      setForm({ name: "", slug: "", description: "", website: "", isActive: true, categoryId: "" });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) { alert("Please enter a brand name"); return; }
    setSaving(true);
    try {
      const url = editingBrand ? `/api/admin/brands/${editingBrand.id}` : "/api/admin/brands";
      const res = await fetch(url, { method: editingBrand ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to save"); }
      await loadBrands();
      setShowModal(false);
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this brand? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/brands/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await loadBrands();
    } catch (e: any) { alert(e.message); }
  };

  const handleCleanup = async () => {
    if (!confirm("Run database maintenance? This will reset brand data. Continue?")) return;
    try {
      await fetch("/api/admin/brands/cleanup-corrupted-data", { method: "POST" });
      alert("Maintenance complete.");
      await loadBrands();
    } catch (e: any) { alert(e.message); }
  };

  const active = brands.filter(b => b.isActive);
  const inactive = brands.filter(b => !b.isActive);
  const filtered = brands.filter(b => {
    const matchSearch = !searchTerm || b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "ALL" || (statusFilter === "ACTIVE" ? b.isActive : !b.isActive);
    return matchSearch && matchStatus;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pageItems = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
  const toggleSelect = (id: string) => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll = () => setSelectedIds(s => s.length === pageItems.length ? [] : pageItems.map(b => String(b.id)));

  const card = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14 };
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
            <h1 style={{ fontSize: 17, fontWeight: 700, color: TEXT, whiteSpace: "nowrap", margin: 0 }}>Brand Management</h1>
          </div>
          <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: TEXT2, width: 15, height: 15 }} />
            <input
              placeholder="Search brands..."
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
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Page title + actions */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>Brand Management</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: TEXT2 }}>
                <span>Home</span>
                <ChevronRight style={{ width: 13, height: 13 }} />
                <span>Products</span>
                <ChevronRight style={{ width: 13, height: 13 }} />
                <span style={{ color: ACCENT }}>Brands</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", borderRadius: 10, overflow: "hidden" }}>
                <button onClick={() => handleOpenModal()} style={{ display: "flex", alignItems: "center", gap: 8, background: ACCENT, border: "none", padding: "9px 18px", color: "#0B1320", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                  <Plus style={{ width: 15, height: 15 }} /> Add New Brand
                </button>
                <button style={{ background: "#10C4B5", border: "none", padding: "9px 10px", color: "#0B1320", cursor: "pointer", borderLeft: "1px solid rgba(0,0,0,0.15)" }}>
                  <ChevronDown style={{ width: 14, height: 14 }} />
                </button>
              </div>
              <button style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 18px", color: TEXT2, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                <Download style={{ width: 15, height: 15 }} /> Export <ChevronDown style={{ width: 13, height: 13 }} />
              </button>
              <button style={{ display: "flex", alignItems: "center", justifyContent: "center", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 12px", color: TEXT2, cursor: "pointer" }}>
                <MoreHorizontal style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#EF4444", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {error}
              <button onClick={handleCleanup} style={{ border: "none", background: "transparent", color: "#EF4444", fontSize: 12, textDecoration: "underline", cursor: "pointer", fontWeight: 600 }}>Run DB Maintenance</button>
            </div>
          )}

          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">>
            {[
              { label: "Total Brands", value: brands.length, change: "+12.4%", up: true, color: ACCENT, icon: Tag },
              { label: "Active Brands", value: active.length, change: "+11.8%", up: true, color: "#22C55E", icon: CheckCircle2 },
              { label: "Inactive Brands", value: inactive.length, change: "+2.1%", up: false, color: "#EF4444", icon: XCircle },
              { label: "Categories", value: categories.length, change: "+8.3%", up: true, color: "#8B5CF6", icon: Tag },
            ].map((s, i) => (
              <div key={i} style={{ ...card, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <s.icon style={{ width: 20, height: 20, color: s.color }} />
                  </div>
                </div>
                <div style={{ fontSize: 11, color: TEXT2, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: TEXT, lineHeight: 1, marginBottom: 6 }}>{s.value.toLocaleString()}</div>
                <span style={{ fontSize: 11, fontWeight: 700, color: s.up ? "#22C55E" : "#EF4444" }}>
                  {s.up ? "▲" : "▼"} {s.change} vs last month
                </span>
                <div style={{ marginTop: 8 }}>
                  <MiniSparkline color={s.color} up={s.up} />
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
              <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: TEXT2 }} />
              <input
                placeholder="Search brands..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 12px 9px 30px", color: TEXT, fontSize: 13, outline: "none" }}
              />
            </div>
            <div style={{ position: "relative" }}>
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 32px 9px 12px", color: TEXT2, fontSize: 13, outline: "none", appearance: "none", cursor: "pointer" }}>
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <ChevronDown style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: TEXT2, pointerEvents: "none" }} />
            </div>
            <button style={{ display: "flex", alignItems: "center", gap: 7, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 16px", color: TEXT2, fontSize: 13, cursor: "pointer" }}>
              <Filter style={{ width: 13, height: 13 }} /> Filters
            </button>
            <button onClick={loadBrands} style={{ display: "flex", alignItems: "center", gap: 6, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 14px", color: TEXT2, fontSize: 13, cursor: "pointer" }}>
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
                    {["Brand", "Category", "Slug", "Website", "Status", "Actions"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: h === "Actions" ? "right" : "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(8)].map((_, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                        <td colSpan={7} style={{ padding: "14px 16px" }}><div style={{ height: 14, borderRadius: 6, background: HOVER }} /></td>
                      </tr>
                    ))
                  ) : pageItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: 48, textAlign: "center", fontSize: 13, color: TEXT2 }}>
                        <Tag style={{ width: 36, height: 36, margin: "0 auto 10px", opacity: 0.3 }} />
                        <div>No brands found</div>
                      </td>
                    </tr>
                  ) : pageItems.map((brand, idx) => {
                    const isSelected = selectedIds.includes(String(brand.id));
                    const colorIdx = idx % BRAND_COLORS.length;
                    return (
                      <tr key={brand.id}
                        style={{ borderBottom: `1px solid ${BORDER}`, background: isSelected ? `${ACCENT}08` : "transparent" }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = HOVER; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}>
                        <td style={{ padding: "12px 16px" }}>
                          <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(String(brand.id))} style={{ accentColor: ACCENT, width: 14, height: 14 }} />
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: `${BRAND_COLORS[colorIdx]}18`, border: `1px solid ${BRAND_COLORS[colorIdx]}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Tag style={{ width: 16, height: 16, color: BRAND_COLORS[colorIdx] }} />
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{brand.name}</div>
                              {brand.description && <div style={{ fontSize: 11, color: TEXT2, marginTop: 2, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{brand.description}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {brand.category
                            ? <span style={{ fontSize: 11, fontWeight: 700, color: ACCENT, background: `${ACCENT}15`, padding: "3px 10px", borderRadius: 20 }}>{brand.category.name}</span>
                            : <span style={{ fontSize: 11, fontStyle: "italic", color: TEXT2 }}>Unassigned</span>}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <code style={{ fontSize: 11, background: ICON_BG, color: ACCENT, padding: "3px 8px", borderRadius: 6, fontFamily: "monospace" }}>{brand.slug}</code>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {brand.website
                            ? <a href={brand.website} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: ACCENT, textDecoration: "none" }}><Globe style={{ width: 13, height: 13 }} /> Visit</a>
                            : <span style={{ fontSize: 12, color: TEXT2 }}>—</span>}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: brand.isActive ? "#22C55E" : "#EF4444", background: brand.isActive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", padding: "4px 10px", borderRadius: 20 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: brand.isActive ? "#22C55E" : "#EF4444", flexShrink: 0 }} />
                            {brand.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                            {[
                              { Icon: Edit, onClick: () => handleOpenModal(brand), hc: "#3B82F6", hb: "rgba(59,130,246,0.1)" },
                              { Icon: Trash2, onClick: () => handleDelete(brand.id), hc: "#EF4444", hb: "rgba(239,68,68,0.1)" },
                            ].map(({ Icon, onClick, hc, hb }, ii) => (
                              <button key={ii} onClick={onClick}
                                style={{ padding: 8, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: TEXT2, display: "flex" }}
                                onMouseEnter={e => { e.currentTarget.style.color = hc; e.currentTarget.style.background = hb; }}
                                onMouseLeave={e => { e.currentTarget.style.color = TEXT2; e.currentTarget.style.background = "transparent"; }}>
                                <Icon style={{ width: 15, height: 15 }} />
                              </button>
                            ))}
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
              <span style={{ fontSize: 12, color: TEXT2 }}>
                Showing {filtered.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1}–{Math.min(page * ROWS_PER_PAGE, filtered.length)} of {filtered.length} brands
              </span>
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

        {/* ── ADD / EDIT MODAL ── */}
        {showModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "var(--modal-overlay)", backdropFilter: "blur(4px)" }}>
            <div style={{ ...card, width: "100%", maxWidth: 480, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px rgba(0,0,0,0.4)" }}>
              <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: 0 }}>{editingBrand ? "Edit Brand" : "Add New Brand"}</h3>
                <button onClick={() => setShowModal(false)}
                  style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: TEXT2, display: "flex", alignItems: "center", justifyContent: "center" }}
                  onMouseEnter={e => (e.currentTarget.style.background = HOVER)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>
              <div style={{ padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Brand Name *", key: "name", placeholder: "e.g. Apple, Samsung, HP", type: "input" },
                  { label: "Slug (auto-generated if empty)", key: "slug", placeholder: "e.g. apple", type: "input" },
                  { label: "Website URL", key: "website", placeholder: "https://www.example.com", type: "input" },
                  { label: "Description", key: "description", placeholder: "Brief brand overview...", type: "textarea" },
                ].map(({ label, key, placeholder, type }) => (
                  <div key={key}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: TEXT2, marginBottom: 6 }}>{label}</label>
                    {type === "textarea" ? (
                      <textarea value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder}
                        style={{ width: "100%", background: ICON_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 14px", color: TEXT, fontSize: 13, outline: "none", resize: "vertical", minHeight: 72, boxSizing: "border-box" }} />
                    ) : (
                      <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder}
                        style={{ width: "100%", background: ICON_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 14px", color: TEXT, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    )}
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: TEXT2, marginBottom: 6 }}>Category</label>
                  <div style={{ position: "relative" }}>
                    <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                      style={{ width: "100%", background: ICON_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 36px 10px 14px", color: TEXT, fontSize: 13, outline: "none", appearance: "none", cursor: "pointer", boxSizing: "border-box" }}>
                      <option value="">-- Select Category --</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <ChevronDown style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: TEXT2, pointerEvents: "none" }} />
                  </div>
                  <p style={{ fontSize: 11, color: TEXT2, marginTop: 5 }}>Brands under this category will show up in the Mega Menu</p>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} style={{ accentColor: ACCENT, width: 15, height: 15 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: TEXT2 }}>Active and visible in shop</span>
                </label>
              </div>
              <div style={{ padding: "16px 24px", borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0 }}>
                <button onClick={() => setShowModal(false)}
                  style={{ padding: "9px 20px", borderRadius: 10, border: `1px solid ${BORDER}`, background: CARD, color: TEXT2, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  style={{ padding: "9px 24px", borderRadius: 10, border: "none", background: ACCENT, color: "#0B1320", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Saving..." : editingBrand ? "Save Changes" : "Add Brand"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}