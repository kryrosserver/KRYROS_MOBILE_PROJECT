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
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useTheme } from "@/providers/ThemeProvider";

const ACCENT = "#12D6C5";
const MOBILE_BASE = 750;
const DESKTOP_BASE = 1380;

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
  shop:               { color: "#12D6C5", bg: "rgba(18,214,197,0.15)" },
  "about-us":         { color: "#12D6C5", bg: "rgba(18,214,197,0.15)" },
  "terms-conditions": { color: "#64748B", bg: "rgba(100,116,139,0.15)" },
  "privacy-policy":   { color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
  "refund-policy":    { color: "#F97316", bg: "rgba(249,115,22,0.15)" },
  "shipping-policy":  { color: "#0EA5E9", bg: "rgba(14,165,233,0.15)" },
  faq:                { color: "#8B5CF6", bg: "rgba(139,92,246,0.15)" },
  "contact-us":       { color: "#12D6C5", bg: "rgba(18,214,197,0.15)" },
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
  return { label: "Static Page", color: ACCENT, bg: "rgba(18,214,197,0.12)" };
}
function getPageStatus(p: CMSPage): "published" | "draft" | "trash" {
  if (TRASH_SLUGS.includes(p.slug)) return "trash";
  return p.isActive ? "published" : "draft";
}

function MiniSparkline({ values, color }: { values: number[]; color: string }) {
  const data = values.map(v => ({ v }));
  const id = `cms-spark-${color.replace("#", "")}`;
  return (
    <ResponsiveContainer width={80} height={28}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#${id})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
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
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--icon-bg)" strokeWidth="10" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#16C784" strokeWidth="10" strokeDasharray={`${pDash} ${circ}`} strokeDashoffset={0} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F59E0B" strokeWidth="10" strokeDasharray={`${dDash} ${circ}`} strokeDashoffset={-pDash} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EF4444" strokeWidth="10" strokeDasharray={`${tDash} ${circ}`} strokeDashoffset={-(pDash + dDash)} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-primary)">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="8" fill="var(--text-secondary)">Total</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11 }}>
        {[
          { color: "#16C784", label: "Published", val: published },
          { color: "#F59E0B", label: "Draft",     val: draft },
          { color: "#EF4444", label: "Trash",     val: trash },
        ].map(row => (
          <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: row.color, flexShrink: 0 }} />
            <span style={{ color: "var(--text-secondary)" }}>{row.label}</span>
            <span style={{ fontWeight: 700, color: "var(--text-primary)", marginLeft: "auto", paddingLeft: 10 }}>{row.val} ({Math.round((row.val / total) * 100)}%)</span>
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
  const [openMenu, setOpenMenu]         = useState<string | null>(null);
  const menuRef   = useRef<HTMLDivElement>(null);
  const outerRef  = useRef<HTMLDivElement>(null);
  const innerRef  = useRef<HTMLDivElement>(null);
  const { isDark, toggleTheme } = useTheme();

  const BG      = "var(--bg-primary)";
  const CARD    = "var(--card-bg)";
  const BORDER  = "var(--card-border)";
  const TEXT    = "var(--text-primary)";
  const TEXT2   = "var(--text-secondary)";
  const HOVER   = "var(--hover-bg)";

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

  useEffect(() => {
    let raf: number;
    function applyHeight(s: number) { if (!innerRef.current || !outerRef.current) return; outerRef.current.style.height = "auto"; outerRef.current.style.height = `${innerRef.current.scrollHeight * s}px`; }
    function recalc() { if (!innerRef.current || !outerRef.current) return; const vw = outerRef.current.offsetWidth || window.innerWidth; const bw = vw < 960 ? MOBILE_BASE : DESKTOP_BASE; if (vw <= 599) { innerRef.current.style.width = "750px"; innerRef.current.style.transform = "none"; innerRef.current.style.transformOrigin = "top left"; if (outerRef.current) { outerRef.current.style.overflowX = "auto"; outerRef.current.style.height = "auto"; } return; } if (outerRef.current) outerRef.current.style.overflowX = "hidden"; const s = Math.min(1, vw / bw); innerRef.current.style.width = `${bw}px`; innerRef.current.style.transform = `scale(${s})`; innerRef.current.style.transformOrigin = "top left"; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(s))); }
    recalc(); const t = setTimeout(recalc, 400); window.addEventListener("resize", recalc); return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
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
  const paginated  = sorted.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const published  = pages.filter(p => getPageStatus(p) === "published").length;
  const draft      = pages.filter(p => getPageStatus(p) === "draft").length;
  const trash      = pages.filter(p => getPageStatus(p) === "trash").length;

  const statCards = [
    { label: "Total Pages",     value: pages.length, color: ACCENT,    iconBg: `${ACCENT}15`,          icon: LayoutGrid,   trend: 14.2, up: true,  spark: [20,28,22,35,30,40, pages.length] },
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
    if (!iso) return "—";
    const d = new Date(iso);
    return { date: d.toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" }), time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) };
  };

  const inp: React.CSSProperties = { background: HOVER, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "8px 14px", color: TEXT, fontSize: 13, outline: "none", height: 36 };
  const sideCard: React.CSSProperties = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "20px" };

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: BG, margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: BG, color: TEXT, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* HEADER */}
        <header style={{ background: "var(--bg-secondary)", borderBottom: `1px solid ${BORDER}`, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", gap: 16, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}><Menu style={{ width: 20, height: 20 }} /></button>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: TEXT, whiteSpace: "nowrap", margin: 0 }}>CMS & Pages</h1>
          </div>
          <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: TEXT2, width: 15, height: 15 }} />
            <input placeholder="Search pages..." style={{ ...inp, width: "100%", paddingLeft: 36, paddingRight: 40, boxSizing: "border-box" }} />
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: TEXT2, background: HOVER, padding: "2px 5px", borderRadius: 4 }}>⌘K</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ position: "relative", background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>
              <Bell style={{ width: 20, height: 20 }} />
              <span style={{ position: "absolute", top: 0, right: 0, background: "#EF4444", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>1</span>
            </button>
            <button onClick={toggleTheme} style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>{isDark ? <Sun style={{ width: 20, height: 20 }} /> : <Moon style={{ width: 20, height: 20 }} />}</button>
            <button style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "7px 14px", color: TEXT2, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
              <Calendar style={{ width: 14, height: 14 }} /> May 20 – May 26, 2025 <ChevronDown style={{ width: 13, height: 13 }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0B1320", flexShrink: 0 }}>K</div>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: TEXT, lineHeight: 1 }}>Admin</div><div style={{ fontSize: 10, color: TEXT2, marginTop: 1 }}>Super Admin</div></div>
              <ChevronDown style={{ width: 14, height: 14, color: TEXT2 }} />
            </div>
          </div>
        </header>

        {/* BODY */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Page title + actions */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: TEXT2, marginBottom: 6 }}>
                <Link href="/admin" style={{ color: TEXT2, textDecoration: "none" }}>Home</Link>
                <span>/</span>
                <span style={{ color: TEXT2 }}>CMS & Pages</span>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>CMS & Pages</h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: 8, background: ACCENT, border: "none", borderRadius: 10, padding: "9px 18px", color: "#0B1320", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
                <Plus style={{ width: 15, height: 15 }} /> Add New Page
              </button>
              <button style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 14px", color: TEXT2, fontSize: 13, cursor: "pointer" }}>
                <SortAsc style={{ width: 15, height: 15 }} /> Reorder
              </button>
              <button style={{ width: 38, height: 38, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, color: TEXT2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MoreVertical style={{ width: 15, height: 15 }} />
              </button>
            </div>
          </div>

          {/* ── STAT CARDS ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {statCards.map((c, i) => (
              <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "20px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: c.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <c.icon style={{ width: 18, height: 18, color: c.color }} />
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: TEXT2, lineHeight: 1.3 }}>{c.label}</p>
                </div>
                <p style={{ fontSize: 28, fontWeight: 800, color: c.color, margin: 0 }}>{c.value}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: TEXT2 }}>
                    <span style={{ color: c.up ? "#16C784" : "#EF4444" }}>{c.up ? "↑" : "↓"} {c.trend}%</span> vs last month
                  </span>
                  <MiniSparkline values={c.spark} color={c.color} />
                </div>
              </div>
            ))}
          </div>

          {/* ── MAIN CONTENT + SIDEBAR ── */}
          <div style={{ display: "flex", gap: 16, alignItems: "start" }}>

            {/* Main Content */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>

              {/* Filter Bar */}
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, position: "relative", minWidth: 220 }}>
                  <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: TEXT2 }} />
                  <input placeholder="Search pages..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                    style={{ ...inp, width: "100%", paddingLeft: 32, boxSizing: "border-box" }} />
                </div>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ ...inp, minWidth: 120 }}>
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="trash">Trash</option>
                </select>
                <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} style={{ ...inp, minWidth: 140 }}>
                  <option value="all">All Page Types</option>
                  <option value="system">System</option>
                  <option value="static">Static Page</option>
                </select>
                <button style={{ ...inp, display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", cursor: "pointer" }}>
                  <Filter style={{ width: 13, height: 13 }} /> Filters
                </button>
              </div>

              {/* Table */}
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                        {["", "Page Title", "Page Type", "Status", "Last Updated", "Order", "Actions"].map((h, i) => (
                          <th key={i}
                            onClick={h === "Last Updated" ? () => setSortDir(d => d === "asc" ? "desc" : "asc") : undefined}
                            style={{ padding: "12px 14px", textAlign: (i === 5 ? "center" : i === 6 ? "right" : "left") as "center" | "left" | "right", fontSize: 10, fontWeight: 800, color: TEXT2, textTransform: "uppercase" as const, letterSpacing: "0.06em", whiteSpace: "nowrap" as const, background: CARD, cursor: h === "Last Updated" ? "pointer" : "default" }}>
                            {h === "Last Updated" ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                Last Updated {sortDir === "asc" ? <SortAsc style={{ width: 12, height: 12 }} /> : <SortDesc style={{ width: 12, height: 12 }} />}
                              </div>
                            ) : (
                              i === 0 ? (
                                <button onClick={handleSelectAll} style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, display: "flex" }}>
                                  {selected.size === paginated.length && paginated.length > 0
                                    ? <CheckSquare style={{ width: 14, height: 14, color: ACCENT }} />
                                    : <Square style={{ width: 14, height: 14 }} />}
                                </button>
                              ) : h
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        [...Array(6)].map((_, i) => (
                          <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                            {[...Array(7)].map((_, j) => (
                              <td key={j} style={{ padding: "12px 14px" }}>
                                <div style={{ height: 14, borderRadius: 6, background: HOVER, animation: "pulse 1.5s infinite" }} />
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : paginated.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: "60px 14px", textAlign: "center" }}>
                            <FileText style={{ width: 36, height: 36, color: TEXT2, opacity: 0.2, margin: "0 auto 10px" }} />
                            <p style={{ fontSize: 13, fontWeight: 700, color: TEXT2 }}>No pages found</p>
                            <button onClick={openAdd} style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: ACCENT, background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" }}>Add your first page</button>
                          </td>
                        </tr>
                      ) : paginated.map((p, idx) => {
                        const PageIcon  = getPageIcon(p.slug);
                        const pageColor = getPageColor(p.slug);
                        const type      = getPageType(p.slug);
                        const status    = getPageStatus(p);
                        const isSelected = selected.has(p.id);
                        const dateInfo   = formatDate(p.updatedAt);
                        return (
                          <tr key={p.id} style={{ borderBottom: `1px solid ${BORDER}`, background: isSelected ? `${ACCENT}08` : "transparent", transition: "background 0.1s" }}
                            onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = HOVER; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isSelected ? `${ACCENT}08` : "transparent"; }}>
                            <td style={{ padding: "12px 14px", width: 40 }}>
                              <button onClick={() => handleSelect(p.id)} style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex" }}>
                                {isSelected ? <CheckSquare style={{ width: 14, height: 14, color: ACCENT }} /> : <Square style={{ width: 14, height: 14, color: TEXT2 }} />}
                              </button>
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: pageColor.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  <PageIcon style={{ width: 14, height: 14, color: pageColor.color }} />
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <p style={{ fontSize: 13, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</p>
                                  <p style={{ fontSize: 11, color: TEXT2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>/{p.slug}</p>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: type.bg, color: type.color }}>{type.label}</span>
                            </td>
                            <td style={{ padding: "12px 14px" }}><StatusBadge status={status} /></td>
                            <td style={{ padding: "12px 14px", fontSize: 11, color: TEXT2 }}>
                              <p>{typeof dateInfo === "object" ? dateInfo.date : dateInfo}</p>
                              <p style={{ fontSize: 10, marginTop: 2 }}>{typeof dateInfo === "object" ? dateInfo.time : ""} Admin</p>
                            </td>
                            <td style={{ padding: "12px 14px", textAlign: "center", fontSize: 12, fontWeight: 700, color: TEXT2 }}>
                              {(page - 1) * rowsPerPage + idx + 1}
                            </td>
                            <td style={{ padding: "12px 14px", textAlign: "right" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>
                                <a href={`/${p.slug}`} target="_blank" rel="noreferrer"
                                  style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: TEXT2, textDecoration: "none", transition: "background 0.1s" }}
                                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = HOVER; (e.currentTarget as HTMLElement).style.color = TEXT; }}
                                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = TEXT2; }}>
                                  <Eye style={{ width: 14, height: 14 }} />
                                </a>
                                <Link href={`/admin/cms/${p.slug}`}
                                  style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: TEXT2, textDecoration: "none", transition: "background 0.1s" }}
                                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = HOVER; (e.currentTarget as HTMLElement).style.color = ACCENT; }}
                                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = TEXT2; }}>
                                  <Edit style={{ width: 14, height: 14 }} />
                                </Link>
                                <div style={{ position: "relative" }} ref={openMenu === p.id ? menuRef : undefined}>
                                  <button onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)}
                                    style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: TEXT2, background: "transparent", border: "none", cursor: "pointer", transition: "background 0.1s" }}
                                    onMouseEnter={e => { e.currentTarget.style.background = HOVER; e.currentTarget.style.color = TEXT; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = TEXT2; }}>
                                    <MoreVertical style={{ width: 14, height: 14 }} />
                                  </button>
                                  {openMenu === p.id && (
                                    <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 4, width: 170, borderRadius: 12, overflow: "hidden", zIndex: 50, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", background: CARD, border: `1px solid ${BORDER}` }}>
                                      {[
                                        { label: p.isActive ? "Set as Draft" : "Publish", action: () => handleToggleStatus(p), color: p.isActive ? "#F59E0B" : "#16C784" },
                                        { label: "Edit Page",   action: () => openEdit(p),       color: TEXT },
                                        { label: "Delete Page", action: () => handleDelete(p.id), color: "#EF4444" },
                                      ].map(item => (
                                        <button key={item.label} onClick={item.action}
                                          style={{ width: "100%", textAlign: "left", padding: "10px 16px", fontSize: 13, color: item.color, background: "transparent", border: "none", cursor: "pointer", transition: "background 0.1s" }}
                                          onMouseEnter={e => { e.currentTarget.style.background = HOVER; }}
                                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                                          {item.label}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {!loading && sorted.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: `1px solid ${BORDER}` }}>
                    <p style={{ fontSize: 11, color: TEXT2 }}>
                      Showing {Math.min((page - 1) * rowsPerPage + 1, sorted.length)} to {Math.min(page * rowsPerPage, sorted.length)} of {sorted.length} pages
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        style={{ width: 30, height: 30, borderRadius: 8, background: "transparent", border: "none", cursor: page === 1 ? "default" : "pointer", color: TEXT2, display: "flex", alignItems: "center", justifyContent: "center", opacity: page === 1 ? 0.4 : 1 }}>
                        <ChevronLeft style={{ width: 14, height: 14 }} />
                      </button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
                        <button key={n} onClick={() => setPage(n)}
                          style={{ width: 30, height: 30, borderRadius: 8, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", background: page === n ? ACCENT : "transparent", color: page === n ? "#fff" : TEXT2, transition: "background 0.1s" }}>
                          {n}
                        </button>
                      ))}
                      {totalPages > 5 && <span style={{ fontSize: 11, color: TEXT2, padding: "0 4px" }}>...</span>}
                      {totalPages > 5 && (
                        <button onClick={() => setPage(totalPages)}
                          style={{ width: 30, height: 30, borderRadius: 8, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", background: "transparent", color: TEXT2 }}>
                          {totalPages}
                        </button>
                      )}
                      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                        style={{ width: 30, height: 30, borderRadius: 8, background: "transparent", border: "none", cursor: page >= totalPages ? "default" : "pointer", color: TEXT2, display: "flex", alignItems: "center", justifyContent: "center", opacity: page >= totalPages ? 0.4 : 1 }}>
                        <ChevronRight style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: TEXT2 }}>Rows per page:</span>
                      <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }} style={{ ...inp, height: 28, fontSize: 12, padding: "2px 8px" }}>
                        {ROW_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── SIDEBAR ── */}
            <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>

              <div style={sideCard}>
                <h3 style={{ fontSize: 12, fontWeight: 800, color: TEXT, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Page Overview</h3>
                <DonutChart published={published} draft={draft} trash={trash} />
              </div>

              <div style={sideCard}>
                <h3 style={{ fontSize: 12, fontWeight: 800, color: TEXT, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Quick Actions</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {[
                    { label: "Add New Page",      icon: Plus,     action: openAdd },
                    { label: "Bulk Import Pages", icon: Upload,   action: () => {} },
                    { label: "Export Pages",      icon: Download, action: () => {} },
                    { label: "Page Settings",     icon: Settings, action: () => {} },
                    { label: "Reorder Pages",     icon: SortAsc,  action: () => {} },
                  ].map(item => (
                    <button key={item.label} onClick={item.action}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 10, fontSize: 12, fontWeight: 700, color: TEXT2, background: "transparent", border: "none", cursor: "pointer", textAlign: "left", transition: "background 0.1s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = HOVER; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                      <item.icon style={{ width: 14, height: 14, flexShrink: 0 }} />
                      {item.label}
                      <ChevronRight style={{ width: 12, height: 12, marginLeft: "auto", opacity: 0.4 }} />
                    </button>
                  ))}
                </div>
              </div>

              {topPages.length > 0 && (
                <div style={sideCard}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <h3 style={{ fontSize: 12, fontWeight: 800, color: TEXT, textTransform: "uppercase", letterSpacing: "0.06em" }}>Top Pages</h3>
                    <button style={{ fontSize: 11, fontWeight: 700, color: ACCENT, background: "transparent", border: "none", cursor: "pointer" }}>View All</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {topPages.map(p => {
                      const PageIcon  = getPageIcon(p.slug);
                      const pageColor = getPageColor(p.slug);
                      return (
                        <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: pageColor.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <PageIcon style={{ width: 12, height: 12, color: pageColor.color }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</p>
                            <p style={{ fontSize: 10, color: TEXT2 }}>/{p.slug}</p>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{p.views.toLocaleString()}</p>
                            <p style={{ fontSize: 10, color: TEXT2 }}>views</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── MODAL ── */}
          {showModal && (
            <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
              <div style={{ width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto", borderRadius: 20, background: CARD, border: `1px solid ${BORDER}`, boxShadow: "0 40px 100px rgba(0,0,0,0.4)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: `1px solid ${BORDER}` }}>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: TEXT, margin: 0 }}>{editingPage ? "Edit Page" : "Add New Page"}</h2>
                  <button onClick={() => setShowModal(false)}
                    style={{ width: 34, height: 34, borderRadius: 10, background: "transparent", border: "none", cursor: "pointer", color: TEXT2, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.1s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = HOVER; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                    <X style={{ width: 16, height: 16 }} />
                  </button>
                </div>
                <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Page Title *</label>
                      <input value={form.title} onChange={e => { const title = e.target.value; const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); setForm(f => ({ ...f, title, ...(!editingPage ? { slug } : {}) })); }}
                        style={{ ...inp, width: "100%", height: 40, boxSizing: "border-box" }} placeholder="About Us" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Slug *</label>
                      <div style={{ position: "relative" }}>
                        <Globe style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, color: TEXT2 }} />
                        <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                          style={{ ...inp, width: "100%", height: 40, paddingLeft: 28, boxSizing: "border-box", fontFamily: "monospace", fontSize: 12 }} placeholder="about-us" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Page Content</label>
                    <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                      rows={6} style={{ ...inp, height: "auto", width: "100%", resize: "none", boxSizing: "border-box" }} placeholder="Write your page content here..." />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Meta Title</label>
                      <input value={form.metaTitle} onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))} style={{ ...inp, width: "100%", height: 40, boxSizing: "border-box" }} placeholder="SEO title" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Meta Description</label>
                      <input value={form.metaDescription} onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))} style={{ ...inp, width: "100%", height: 40, boxSizing: "border-box" }} placeholder="SEO description" />
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, background: HOVER }}>
                    <div onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                      style={{ width: 42, height: 23, borderRadius: 12, background: form.isActive ? ACCENT : HOVER, border: `1px solid ${BORDER}`, cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                      <div style={{ position: "absolute", top: 3, left: form.isActive ? 20 : 3, width: 17, height: 17, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{form.isActive ? "Published" : "Draft"}</p>
                      <p style={{ fontSize: 11, color: TEXT2 }}>{form.isActive ? "Page is live on the website" : "Page is hidden from public view"}</p>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, padding: "16px 24px", borderTop: `1px solid ${BORDER}` }}>
                  <button onClick={() => setShowModal(false)}
                    style={{ height: 40, padding: "0 20px", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, color: TEXT2, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    style={{ height: 40, padding: "0 20px", background: ACCENT, border: "none", borderRadius: 10, color: "#0B1320", fontWeight: 800, fontSize: 13, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, opacity: saving ? 0.7 : 1 }}>
                    <Save style={{ width: 14, height: 14 }} />
                    {saving ? "Saving..." : editingPage ? "Save Changes" : "Create Page"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
