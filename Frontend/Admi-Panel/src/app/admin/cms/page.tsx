"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Plus, Search, Filter, Eye, Edit, Trash2, MoreVertical,
  Download, Upload, Settings, CheckSquare, Square,
  Home, FileText, Shield, Info, Phone, HelpCircle, AlertCircle,
  FileCode, ChevronLeft, ChevronRight, X, Save, Globe,
  SortAsc, SortDesc, LayoutGrid, CheckCircle2, Clock, RefreshCw,
  Bell, Calendar, Sun, Moon, Menu, ChevronDown,
} from "lucide-react";

type CMSPage = {
  id: string; title: string; slug: string; content?: string;
  metaTitle?: string; metaDescription?: string;
  isActive: boolean; createdAt: string; updatedAt: string;
};

const PAGE_ICONS: Record<string, any> = {
  home: Home, shop: LayoutGrid, "about-us": Info, "terms-conditions": FileText,
  "privacy-policy": Shield, "refund-policy": AlertCircle, "shipping-policy": FileText,
  faq: HelpCircle, "contact-us": Phone, "how-it-works": FileCode, wholesale: Globe,
  "get-now": FileCode, cart: FileText, checkout: FileText, "track-order": RefreshCw,
  account: Settings, "maintenance-mode": Settings,
};
const PAGE_COLORS: Record<string, { color: string; bg: string }> = {
  home:               { color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
  shop:               { color: "#6366F1", bg: "rgba(18,214,197,0.15)" },
  "about-us":         { color: "#6366F1", bg: "rgba(18,214,197,0.15)" },
  "terms-conditions": { color: "#64748B", bg: "rgba(100,116,139,0.15)" },
  "privacy-policy":   { color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
  "refund-policy":    { color: "#F97316", bg: "rgba(249,115,22,0.15)" },
  "shipping-policy":  { color: "#0EA5E9", bg: "rgba(14,165,233,0.15)" },
  faq:                { color: "#8B5CF6", bg: "rgba(139,92,246,0.15)" },
  "contact-us":       { color: "#6366F1", bg: "rgba(18,214,197,0.15)" },
  "how-it-works":     { color: "#6366F1", bg: "rgba(99,102,241,0.15)" },
  wholesale:          { color: "#8B5CF6", bg: "rgba(139,92,246,0.15)" },
  "get-now":          { color: "#FACC15", bg: "rgba(250,204,21,0.15)" },
  cart:               { color: "#22C55E", bg: "rgba(34,197,94,0.15)"  },
  checkout:           { color: "#EF4444", bg: "rgba(239,68,68,0.15)"  },
  "track-order":      { color: "#14B8A6", bg: "rgba(20,184,166,0.15)" },
  account:            { color: "#6366F1", bg: "rgba(99,102,241,0.15)" },
  "maintenance-mode": { color: "#EF4444", bg: "rgba(239,68,68,0.15)" },
};
const STATIC_PAGES: CMSPage[] = [
  { id: "static-home",               title: "Home",              slug: "home",               isActive: true,  createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: "static-shop",               title: "Shop",              slug: "shop",               isActive: true,  createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: "static-about-us",           title: "About Us",          slug: "about-us",           isActive: true,  createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: "static-contact-us",         title: "Contact Us",        slug: "contact-us",         isActive: true,  createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: "static-faq",                title: "FAQ",               slug: "faq",                isActive: true,  createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: "static-how-it-works",       title: "How It Works",      slug: "how-it-works",       isActive: true,  createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: "static-wholesale",          title: "Wholesale",         slug: "wholesale",          isActive: true,  createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: "static-get-now",            title: "Get Now (BNPL)",    slug: "get-now",            isActive: true,  createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: "static-terms-conditions",   title: "Terms & Conditions", slug: "terms-conditions",  isActive: true,  createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: "static-privacy-policy",     title: "Privacy Policy",    slug: "privacy-policy",     isActive: true,  createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: "static-refund-policy",      title: "Refund Policy",     slug: "refund-policy",      isActive: true,  createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: "static-shipping-policy",    title: "Shipping Policy",   slug: "shipping-policy",    isActive: true,  createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: "static-cart",               title: "Cart",              slug: "cart",               isActive: true,  createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: "static-checkout",           title: "Checkout",          slug: "checkout",           isActive: true,  createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: "static-track-order",        title: "Track Order",       slug: "track-order",        isActive: true,  createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: "static-account",            title: "My Account",        slug: "account",            isActive: true,  createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: "static-maintenance-mode",   title: "Maintenance Mode",  slug: "maintenance-mode",   isActive: false, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
];
const SYSTEM_SLUGS = ["home", "shop", "cart", "checkout", "account", "maintenance-mode"];
const TRASH_SLUGS  = ["maintenance-mode"];

function getPageIcon(slug: string) { return PAGE_ICONS[slug] || FileText; }
function getPageColor(slug: string) { return PAGE_COLORS[slug] || { color: "#64748B", bg: "rgba(100,116,139,0.15)" }; }
function getPageType(slug: string) {
  if (SYSTEM_SLUGS.includes(slug)) return { label: "System", color: "#3B82F6", bg: "rgba(59,130,246,0.12)" };
  return { label: "Static Page", color: "#6366F1", bg: "rgba(18,214,197,0.12)" };
}
function getPageStatus(p: CMSPage): "published" | "draft" | "trash" {
  if (TRASH_SLUGS.includes(p.slug)) return "trash";
  return p.isActive ? "published" : "draft";
}

/* Pure SVG sparkline */
function MiniSparkline({ color = "#6366F1", up = true }: { color?: string; up?: boolean }) {
  const pts = up ? "0,28 14,20 28,24 42,10 56,16 70,4 84,8" : "0,4 14,8 28,6 42,16 56,12 70,22 84,26";
  return (
    <svg width="80" height="28" viewBox="0 0 84 32" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3}/>
          <stop offset="100%" stopColor={color} stopOpacity={0}/>
        </linearGradient>
      </defs>
      <polygon points={`${pts} 84,32 0,32`} fill={`url(#sg${color.replace("#","")})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  );
}

function StatusBadge({ status }: { status: "published" | "draft" | "trash" }) {
  const map = {
    published: { label: "Published", color: "#16C784", bg: "rgba(22,199,132,0.12)", border: "rgba(22,199,132,0.2)" },
    draft:     { label: "Draft",     color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.2)" },
    trash:     { label: "Trash",     color: "#EF4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.2)" },
  };
  const s = map[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      {s.label}
    </span>
  );
}

function DonutChart({ published, draft, trash }: { published: number; draft: number; trash: number }) {
  const total = published + draft + trash || 1;
  const r = 40, cx = 50, cy = 50, circ = 2 * Math.PI * r;
  const pDash = (published / total) * circ;
  const dDash = (draft / total) * circ;
  const tDash = (trash / total) * circ;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <svg width={100} height={100} viewBox="0 0 100 100">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F9FAFB" strokeWidth="10" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#16C784" strokeWidth="10" strokeDasharray={`${pDash} ${circ}`} strokeDashoffset={0} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F59E0B" strokeWidth="10" strokeDasharray={`${dDash} ${circ}`} strokeDashoffset={-pDash} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EF4444" strokeWidth="10" strokeDasharray={`${tDash} ${circ}`} strokeDashoffset={-(pDash + dDash)} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="#111827">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="8" fill="#4B5563">Total</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11 }}>
        {[
          { color: "#16C784", label: "Published", val: published },
          { color: "#F59E0B", label: "Draft",     val: draft },
          { color: "#EF4444", label: "Trash",     val: trash },
        ].map(row => (
          <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: row.color, flexShrink: 0 }} />
            <span style={{ color: "#4B5563" }}>{row.label}</span>
            <span style={{ fontWeight: 700, color: "#111827", marginLeft: "auto", paddingLeft: 10 }}>{row.val} ({Math.round((row.val / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const ROW_OPTIONS = [10, 20, 50];

export default function CMSPagesManager() {
  const [pages, setPages]               = useState<CMSPage[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter]     = useState("all");
  const [selected, setSelected]         = useState<Set<string>>(new Set());
  const [page, setPage]                 = useState(1);
  const [rowsPerPage, setRowsPerPage]   = useState(10);
  const [sortDir, setSortDir]           = useState<"asc" | "desc">("asc");
  const [showModal, setShowModal]       = useState(false);
  const [editingPage, setEditingPage]   = useState<CMSPage | null>(null);
  const [saving, setSaving]             = useState(false);
  const [syncingPages, setSyncingPages] = useState(false);
  const [syncMsg, setSyncMsg]           = useState<string | null>(null);
  const [openMenu, setOpenMenu]         = useState<string | null>(null);
  const menuRef   = useRef<HTMLDivElement>(null);

  const BG = "#F5F6FA";
  const CARD = "#FFFFFF";
  const BORDER = "#E5E7EB";
  const TEXT = "#111827";
  const TEXT2 = "#4B5563";
  const HOVER = "#F9FAFB";

  const [form, setForm] = useState({
    title: "", slug: "", content: "", metaTitle: "", metaDescription: "", isActive: true,
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/pages", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const backendPages: CMSPage[] = Array.isArray(data) ? data : [];
        if (backendPages.length > 0) {
          const slugs = new Set(backendPages.map(p => p.slug));
          setPages([...backendPages, ...STATIC_PAGES.filter(p => !slugs.has(p.slug))]);
        } else { setPages(STATIC_PAGES); }
      } else { setPages(STATIC_PAGES); }
    } catch { setPages(STATIC_PAGES); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);


  const filtered = pages.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase());
    const status = getPageStatus(p);
    const matchStatus = statusFilter === "all" || statusFilter === status;
    const matchType = typeFilter === "all" || (typeFilter === "system" ? SYSTEM_SLUGS.includes(p.slug) : !SYSTEM_SLUGS.includes(p.slug));
    return matchSearch && matchStatus && matchType;
  });
  const sorted = [...filtered].sort((a, b) => {
    const diff = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    return sortDir === "asc" ? diff : -diff;
  });
  const totalPages = Math.ceil(sorted.length / rowsPerPage);
  const pageNums = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (page >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  })();
  const paginated  = sorted.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const published  = pages.filter(p => getPageStatus(p) === "published").length;
  const draft      = pages.filter(p => getPageStatus(p) === "draft").length;
  const trash      = pages.filter(p => getPageStatus(p) === "trash").length;

  const statCards = [
    { label: "Total Pages",     value: pages.length, color: "#6366F1",    iconBg: `#6366F115`,          icon: LayoutGrid,   trend: 14.2, up: true,  spark: [20,28,22,35,30,40, pages.length] },
    { label: "Published Pages", value: published,    color: "#16C784", iconBg: "rgba(22,199,132,0.12)", icon: CheckCircle2, trend: 11.8, up: true,  spark: [15,20,18,25,22,30, published] },
    { label: "Draft Pages",     value: draft,        color: "#F59E0B", iconBg: "rgba(245,158,11,0.12)", icon: Clock,        trend: 20.0, up: false, spark: [2,3,2,4,3,3, draft] },
    { label: "Trash Pages",     value: trash,        color: "#EF4444", iconBg: "rgba(239,68,68,0.12)",  icon: Trash2,       trend: 33.3, up: false, spark: [1,0,1,0,1,0, trash] },
  ];

  const topPages = [...pages].slice(0, 5).map((p, i) => ({
    ...p, views: [12845, 8452, 6125, 5214, 4987][i] || 500,
  }));

  const handleSelectAll = () => { if (selected.size === paginated.length) setSelected(new Set()); else setSelected(new Set(paginated.map(p => p.id))); };
  const handleSelect = (id: string) => { const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s); };

  const openAdd = () => { setEditingPage(null); setForm({ title: "", slug: "", content: "", metaTitle: "", metaDescription: "", isActive: true }); setShowModal(true); };
  const openEdit = (p: CMSPage) => { setEditingPage(p); setForm({ title: p.title, slug: p.slug, content: p.content || "", metaTitle: p.metaTitle || "", metaDescription: p.metaDescription || "", isActive: p.isActive }); setShowModal(true); setOpenMenu(null); };

  const handleSyncAllPages = async () => {
    setSyncingPages(true);
    setSyncMsg(null);
    try {
      const res = await fetch("/api/admin/cms/pages/sync-all", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Error ${res.status}`);
      setSyncMsg(`✓ ${body.message || "All pages synced to database!"}`);
      await load(); // Refresh page list
    } catch (err: any) {
      setSyncMsg(`✗ ${err.message || "Sync failed"}`);
    } finally {
      setSyncingPages(false);
      setTimeout(() => setSyncMsg(null), 5000);
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) return alert("Title and slug are required");
    setSaving(true);
    try {
      const url = editingPage ? `/api/admin/cms/pages/${editingPage.id}` : "/api/admin/cms/pages";
      const res = await fetch(url, { method: editingPage ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) { setShowModal(false); load(); }
      else { const d = await res.json(); alert(d.error || "Failed to save"); }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this page? This cannot be undone.")) return;
    setOpenMenu(null);
    const res = await fetch(`/api/admin/cms/pages/${id}`, { method: "DELETE" });
    if (res.ok) load();
  };

  const handleToggleStatus = async (p: CMSPage) => {
    setOpenMenu(null);
    await fetch(`/api/admin/cms/pages/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !p.isActive }) });
    load();
  };

  const formatDate = (iso: string) => {
    if (!iso) return " ";
    const d = new Date(iso);
    return { date: d.toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" }), time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) };
  };

  const inp: React.CSSProperties = { background: HOVER, border: "1px solid #E5E7EB", borderRadius: 10, padding: "8px 14px", color: TEXT, fontSize: 13, outline: "none", height: 36 };
  const sideCard: React.CSSProperties = { background: CARD, border: "1px solid #E5E7EB", borderRadius: 14, padding: "20px" };

  return (
    <div style={{ background: "#F5F6FA", minHeight: "100%", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Content Management</h2>
          <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>Manage pages, sections, and site content</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleSyncAllPages} disabled={syncingPages}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 16px", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <RefreshCw style={{ width: 14, height: 14 }} /> {syncingPages ? "Syncing..." : "Sync Pages"}
          </button>
          <button onClick={() => { setEditingPage(null); setShowModal(true); }}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "#6366F1", border: "none", borderRadius: 10, padding: "9px 18px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            <Plus style={{ width: 15, height: 15 }} /> New Page
          </button>
        </div>
      </div>

      {syncMsg && (
        <div style={{ background: "#D1FAE5", border: "1px solid #A7F3D0", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#065F46", marginBottom: 16 }}>{syncMsg}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ marginBottom: 20 }}>
        {[
          { label: "Total Pages", value: pages.length, color: "#6366F1" },
          { label: "Published", value: pages.filter(p => p.isActive && !TRASH_SLUGS.includes(p.slug)).length, color: "#22C55E" },
          { label: "Drafts", value: pages.filter(p => !p.isActive && !TRASH_SLUGS.includes(p.slug)).length, color: "#F59E0B" },
          { label: "System", value: pages.filter(p => SYSTEM_SLUGS.includes(p.slug)).length, color: "#3B82F6" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 320 }}>
          <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", width: 15, height: 15 }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search pages..."
            style={{ width: "100%", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 12px 9px 36px", color: "#111827", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 14px", color: "#374151", fontSize: 13, outline: "none", cursor: "pointer" }}>
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="trash">Trash</option>
        </select>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
          style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 14px", color: "#374151", fontSize: 13, outline: "none", cursor: "pointer" }}>
          <option value="all">All Types</option>
          <option value="system">System</option>
          <option value="static">Static</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                <th style={{ padding: "11px 16px", textAlign: "left" }}><input type="checkbox" onChange={e => {
                  if (e.target.checked) setSelected(new Set(paginated.map(p => p.id)));
                  else setSelected(new Set());
                }} checked={paginated.length > 0 && paginated.every(p => selected.has(p.id))} /></th>
                {["Page", "Type", "Status", "Last Updated", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontWeight: 700, color: "#374151", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} style={{ padding: "14px 16px" }}><div style={{ height: 14, borderRadius: 6, background: "#F3F4F6", width: j === 0 ? 20 : j === 1 ? 140 : 80 }} /></td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>No pages found.</td></tr>
              ) : paginated.map((p, idx) => {
                const status = getPageStatus(p);
                const typeInfo = getPageType(p.slug);
                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid #F3F4F6", background: selected.has(p.id) ? "#EEF2FF" : idx % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <input type="checkbox" checked={selected.has(p.id)} onChange={() => {
                        const next = new Set(selected);
                        next.has(p.id) ? next.delete(p.id) : next.add(p.id);
                        setSelected(next);
                      }} />
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: getPageColor(p.slug).bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <FileText style={{ width: 18, height: 18, color: getPageColor(p.slug).color }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#111827" }}>{p.title}</div>
                          <div style={{ fontSize: 11, color: "#9CA3AF" }}>/{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: typeInfo.bg, color: typeInfo.color }}>{typeInfo.label}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: status === "published" ? "#D1FAE5" : status === "draft" ? "#FEF3C7" : "#FEE2E2", color: status === "published" ? "#065F46" : status === "draft" ? "#92400E" : "#991B1B" }}>
                        {status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#6B7280", fontSize: 12 }}>
                      {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Link href={`/admin/cms/${p.slug}`} style={{ display: "flex", alignItems: "center", gap: 4, background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 7, padding: "5px 10px", color: "#4338CA", fontSize: 12, fontWeight: 600, textDecoration: "none", cursor: "pointer" }}>
                          <Edit style={{ width: 13, height: 13 }} /> Edit
                        </Link>
                        <button onClick={() => handleToggleStatus(p)}
                          style={{ display: "flex", alignItems: "center", gap: 4, background: p.isActive ? "#FEF2F2" : "#D1FAE5", border: "1px solid " + (p.isActive ? "#FECACA" : "#A7F3D0"), borderRadius: 7, padding: "5px 10px", color: p.isActive ? "#DC2626" : "#065F46", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                          {p.isActive ? "Disable" : "Enable"}
                        </button>
                        <button onClick={() => handleDelete(p.id)}
                          style={{ display: "flex", alignItems: "center", gap: 4, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 7, padding: "5px 10px", color: "#DC2626", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                          <Trash2 style={{ width: 13, height: 13 }} />
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid #E5E7EB" }}>
          <span style={{ fontSize: 12, color: "#6B7280" }}>
            {paginated.length === 0 ? "0" : `${(page-1)*rowsPerPage+1}–${Math.min(page*rowsPerPage, filtered.length)}`} of {filtered.length}
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
              style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid #E5E7EB", background: "#fff", color: "#374151", cursor: page===1?"not-allowed":"pointer", opacity: page===1?0.4:1, fontSize: 13 }}>&#8249;</button>
            {pageNums.map((n, i) => (
              <button key={i} onClick={() => typeof n === "number" && setPage(n)} disabled={n === "..."}
                style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid #E5E7EB", background: n===page?"#6366F1":"#fff", color: n===page?"#fff":"#374151", fontWeight: n===page?700:400, cursor: n==="..."?"default":"pointer", fontSize: 13, minWidth: 32 }}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
              style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid #E5E7EB", background: "#fff", color: "#374151", cursor: page===totalPages?"not-allowed":"pointer", opacity: page===totalPages?0.4:1, fontSize: 13 }}>&#8250;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
