"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Plus, Search, Filter, Eye, Edit, Trash2, MoreVertical, RefreshCw,
  Download, Upload, Settings, ArrowUpDown, CheckSquare, Square,
  Home, FileText, Shield, Info, Phone, HelpCircle, AlertCircle,
  FileCode, ChevronLeft, ChevronRight, Layout, X, Save, Globe,
  SortAsc, SortDesc, LayoutGrid, CheckCircle2, Clock
} from "lucide-react";

type CMSPage = {
  id: string;
  title: string;
  slug: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const PAGE_ICONS: Record<string, any> = {
  home: Home, "about-us": Info, "terms-conditions": FileText,
  "privacy-policy": Shield, "refund-policy": AlertCircle,
  "shipping-policy": FileText, faq: HelpCircle, "contact-us": Phone,
  "how-it-works": FileCode, "maintenance-mode": Settings,
};

const SYSTEM_SLUGS = ["home", "maintenance-mode"];

function getPageIcon(slug: string) {
  return PAGE_ICONS[slug] || FileText;
}

function getPageType(slug: string): { label: string; color: string; bg: string } {
  if (SYSTEM_SLUGS.includes(slug)) return { label: "System", color: "#3B82F6", bg: "rgba(59,130,246,0.12)" };
  return { label: "Static Page", color: "#12D6C5", bg: "rgba(18,214,197,0.12)" };
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={isActive
        ? { background: "rgba(22,199,132,0.12)", color: "#16C784", border: "1px solid rgba(22,199,132,0.2)" }
        : { background: "rgba(245,158,11,0.12)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.2)" }
      }
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: isActive ? "#16C784" : "#F59E0B" }} />
      {isActive ? "Published" : "Draft"}
    </span>
  );
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const w = 80, h = 28;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - (v / max) * (h - 4) - 2;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} className="overflow-visible opacity-70">
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DonutChart({ published, draft }: { published: number; draft: number }) {
  const total = published + draft || 1;
  const pPct = Math.round((published / total) * 100);
  const dPct = Math.round((draft / total) * 100);
  const r = 40, cx = 50, cy = 50, circ = 2 * Math.PI * r;
  const pDash = (published / total) * circ;
  const dDash = (draft / total) * circ;
  return (
    <div className="flex items-center gap-4">
      <svg width={100} height={100} viewBox="0 0 100 100">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--icon-bg)" strokeWidth="10" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#16C784" strokeWidth="10"
          strokeDasharray={`${pDash} ${circ}`} strokeDashoffset={0} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F59E0B" strokeWidth="10"
          strokeDasharray={`${dDash} ${circ}`} strokeDashoffset={-pDash} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-primary)">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="8" fill="var(--text-muted)">Total</text>
      </svg>
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#16C784" }} />
          <span style={{ color: "var(--text-secondary)" }}>Published</span>
          <span className="font-bold ml-auto pl-3" style={{ color: "var(--text-primary)" }}>{pPct}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#F59E0B" }} />
          <span style={{ color: "var(--text-secondary)" }}>Draft</span>
          <span className="font-bold ml-auto pl-3" style={{ color: "var(--text-primary)" }}>{dPct}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#EF4444" }} />
          <span style={{ color: "var(--text-secondary)" }}>Trash</span>
          <span className="font-bold ml-auto pl-3" style={{ color: "var(--text-primary)" }}>0%</span>
        </div>
      </div>
    </div>
  );
}

const ROWS_PER_PAGE = 10;

export default function CMSPagesManager() {
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState<CMSPage | null>(null);
  const [saving, setSaving] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const [form, setForm] = useState({
    title: "", slug: "", content: "", metaTitle: "", metaDescription: "", isActive: true,
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/pages", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPages(Array.isArray(data) ? data : []);
      }
    } catch {}
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
    function applyHeight(nextScale: number) {
      if (!innerRef.current || !outerRef.current) return;
      outerRef.current.style.height = "auto";
      const naturalH = innerRef.current.scrollHeight;
      const visualH = naturalH * nextScale;
      const isMobile = window.innerWidth < 1024;
      const screenAvail = isMobile ? window.innerHeight - 64 : Infinity;
      outerRef.current.style.height = `${Math.max(visualH, screenAvail)}px`;
    }
    function recalc() {
      if (!innerRef.current || !outerRef.current) return;
      const vw = outerRef.current.offsetWidth || window.innerWidth;
      const baseW = vw < 960 ? 960 : 1380;
      const nextScale = Math.min(1, vw / baseW);
      innerRef.current.style.width = `${baseW}px`;
      innerRef.current.style.transform = `scale(${nextScale})`;
      innerRef.current.style.transformOrigin = "top left";
      setScale(nextScale);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(nextScale)));
    }
    recalc();
    const t = setTimeout(recalc, 400);
    window.addEventListener("resize", recalc);
    return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);

  const filtered = pages.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || (statusFilter === "published" ? p.isActive : !p.isActive);
    const matchType = typeFilter === "all" || (typeFilter === "system" ? SYSTEM_SLUGS.includes(p.slug) : !SYSTEM_SLUGS.includes(p.slug));
    return matchSearch && matchStatus && matchType;
  });

  const sorted = [...filtered].sort((a, b) => {
    const diff = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    return sortDir === "asc" ? diff : -diff;
  });

  const totalPages = Math.ceil(sorted.length / ROWS_PER_PAGE);
  const paginated = sorted.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const published = pages.filter(p => p.isActive).length;
  const draft = pages.filter(p => !p.isActive).length;

  const statCards = [
    { label: "Total Pages", value: pages.length, color: "#12D6C5", iconBg: "rgba(18,214,197,0.12)", icon: LayoutGrid, trend: 14.2, up: true, spark: [20, 28, 22, 35, 30, 40, pages.length] },
    { label: "Published Pages", value: published, color: "#16C784", iconBg: "rgba(22,199,132,0.12)", icon: CheckCircle2, trend: 11.8, up: true, spark: [15, 20, 18, 25, 22, 30, published] },
    { label: "Draft Pages", value: draft, color: "#F59E0B", iconBg: "rgba(245,158,11,0.12)", icon: Clock, trend: 20.0, up: false, spark: [2, 3, 2, 4, 3, 3, draft] },
    { label: "Trash Pages", value: 0, color: "#EF4444", iconBg: "rgba(239,68,68,0.12)", icon: Trash2, trend: 33.3, up: false, spark: [1, 0, 1, 0, 1, 0, 0] },
  ];

  const topPages = [...pages].slice(0, 5).map((p, i) => ({
    ...p, views: [12845, 8452, 6125, 5214, 4987][i] || Math.floor(Math.random() * 5000 + 500),
  }));

  const handleSelectAll = () => {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map(p => p.id)));
  };

  const handleSelect = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const openAdd = () => {
    setEditingPage(null);
    setForm({ title: "", slug: "", content: "", metaTitle: "", metaDescription: "", isActive: true });
    setShowModal(true);
  };

  const openEdit = (p: CMSPage) => {
    setEditingPage(p);
    setForm({ title: p.title, slug: p.slug, content: p.content || "", metaTitle: p.metaTitle || "", metaDescription: p.metaDescription || "", isActive: p.isActive });
    setShowModal(true);
    setOpenMenu(null);
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) return alert("Title and slug are required");
    setSaving(true);
    try {
      const url = editingPage ? `/api/admin/cms/pages/${editingPage.id}` : "/api/admin/cms/pages";
      const res = await fetch(url, {
        method: editingPage ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
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
    await fetch(`/api/admin/cms/pages/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    load();
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })} at ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: "var(--bg-primary)", margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: "var(--bg-primary)", padding: "24px" }}>
    <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs mb-1" style={{ color: "var(--text-muted)" }}>
            <Link href="/admin" className="hover:underline" style={{ color: "var(--text-muted)" }}>Home</Link>
            <span>/</span>
            <span style={{ color: "var(--text-primary)" }}>CMS & Pages</span>
            <span>/</span>
            <span style={{ color: "var(--text-primary)" }}>All Pages</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>CMS & Pages</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="btn-secondary h-10 px-4 flex items-center gap-2 text-sm">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <div className="relative">
            <button className="btn-secondary h-10 px-4 flex items-center gap-2 text-sm">
              <SortAsc className="h-4 w-4" /> Reorder Pages
            </button>
          </div>
          <button onClick={openAdd} className="btn-primary h-10 px-4 flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" /> Add New Page
          </button>
          <button className="btn-secondary h-10 w-10 flex items-center justify-center p-0">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="admin-card !p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl shrink-0" style={{ background: card.iconBg }}>
                <card.icon className="h-5 w-5" style={{ color: card.color }} />
              </div>
              <p className="text-sm font-semibold leading-tight" style={{ color: "var(--text-secondary)" }}>{card.label}</p>
            </div>
            <p className="text-3xl font-bold" style={{ color: card.color }}>{card.value}</p>
            <div className="flex items-end justify-between">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                <span style={{ color: card.up ? "#16C784" : "#EF4444" }}>{card.up ? "↑" : "↓"} {card.trend}%</span> vs last month
              </p>
              <Sparkline values={card.spark} color={card.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Filter Bar */}
          <div className="admin-card !p-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "var(--text-muted)" }} />
              <input
                placeholder="Search pages..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="admin-input pl-9 w-full h-9 text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="admin-input h-9 text-sm !w-auto min-w-[120px]"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
              className="admin-input h-9 text-sm !w-auto min-w-[140px]"
            >
              <option value="all">All Page Types</option>
              <option value="system">System</option>
              <option value="static">Static Page</option>
            </select>
            <button className="btn-secondary h-9 px-3 flex items-center gap-2 text-sm">
              <Filter className="h-4 w-4" /> Filters
            </button>
            <button className="btn-secondary h-9 px-3 flex items-center gap-2 text-sm">
              <Filter className="h-4 w-4" />
            </button>
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
                          ? <CheckSquare className="h-4 w-4" style={{ color: "#12D6C5" }} />
                          : <Square className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                        }
                      </button>
                    </th>
                    <th>Page Title</th>
                    <th className="hidden md:table-cell">Page Type</th>
                    <th>Status</th>
                    <th
                      className="hidden lg:table-cell cursor-pointer select-none"
                      onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}
                    >
                      <div className="flex items-center gap-1">
                        Last Updated
                        {sortDir === "asc" ? <SortAsc className="h-3.5 w-3.5" /> : <SortDesc className="h-3.5 w-3.5" />}
                      </div>
                    </th>
                    <th className="hidden sm:table-cell text-center">Order</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(6)].map((_, i) => (
                      <tr key={i}>
                        {[...Array(7)].map((_, j) => (
                          <td key={j}><div className="h-4 rounded animate-pulse" style={{ background: "var(--icon-bg)" }} /></td>
                        ))}
                      </tr>
                    ))
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p className="font-semibold text-sm" style={{ color: "var(--text-muted)" }}>No pages found</p>
                        <button onClick={openAdd} className="mt-3 text-sm font-semibold underline" style={{ color: "#12D6C5" }}>
                          Add your first page
                        </button>
                      </td>
                    </tr>
                  ) : paginated.map((p, idx) => {
                    const PageIcon = getPageIcon(p.slug);
                    const type = getPageType(p.slug);
                    const isSelected = selected.has(p.id);
                    return (
                      <tr key={p.id} style={{ background: isSelected ? "var(--nav-item-active-bg)" : undefined }}>
                        <td className="!px-4">
                          <button onClick={() => handleSelect(p.id)}>
                            {isSelected
                              ? <CheckSquare className="h-4 w-4" style={{ color: "#12D6C5" }} />
                              : <Square className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                            }
                          </button>
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--icon-bg)" }}>
                              <PageIcon className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>{p.title}</p>
                              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>/{p.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: type.bg, color: type.color }}>
                            {type.label}
                          </span>
                        </td>
                        <td><StatusBadge isActive={p.isActive} /></td>
                        <td className="hidden lg:table-cell text-xs" style={{ color: "var(--text-muted)" }}>
                          <p>{formatDate(p.updatedAt)}</p>
                          <p className="text-[10px] mt-0.5">by Admin</p>
                        </td>
                        <td className="hidden sm:table-cell text-center text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
                          {(page - 1) * ROWS_PER_PAGE + idx + 1}
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <a href={`/${p.slug}`} target="_blank" rel="noreferrer"
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ color: "var(--text-muted)" }}
                              onMouseEnter={e => { e.currentTarget.style.background = "var(--hover-bg)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                              title="View page"
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                            <button
                              onClick={() => openEdit(p)}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ color: "var(--text-muted)" }}
                              onMouseEnter={e => { e.currentTarget.style.background = "var(--hover-bg)"; e.currentTarget.style.color = "#12D6C5"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                              title="Edit page"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <div className="relative" ref={openMenu === p.id ? menuRef : undefined}>
                              <button
                                onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)}
                                className="p-1.5 rounded-lg transition-colors"
                                style={{ color: "var(--text-muted)" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "var(--hover-bg)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                              {openMenu === p.id && (
                                <div
                                  className="absolute right-0 mt-1 w-44 rounded-xl overflow-hidden z-50 shadow-2xl"
                                  style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
                                >
                                  {[
                                    { label: p.isActive ? "Set as Draft" : "Publish", action: () => handleToggleStatus(p), color: p.isActive ? "#F59E0B" : "#16C784" },
                                    { label: "Edit Page", action: () => openEdit(p), color: "var(--text-primary)" },
                                    { label: "Delete Page", action: () => handleDelete(p.id), color: "#EF4444" },
                                  ].map(item => (
                                    <button
                                      key={item.label}
                                      onClick={item.action}
                                      className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                                      style={{ color: item.color }}
                                      onMouseEnter={e => { e.currentTarget.style.background = "var(--hover-bg)"; }}
                                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                                    >
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
              <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid var(--card-border)" }}>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Showing {Math.min((page - 1) * ROWS_PER_PAGE + 1, sorted.length)} to {Math.min(page * ROWS_PER_PAGE, sorted.length)} of {sorted.length} pages
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={e => { if (page > 1) e.currentTarget.style.background = "var(--hover-bg)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className="h-8 w-8 rounded-lg text-xs font-semibold transition-colors"
                      style={page === n
                        ? { background: "#12D6C5", color: "#fff" }
                        : { color: "var(--text-muted)" }
                      }
                      onMouseEnter={e => { if (page !== n) e.currentTarget.style.background = "var(--hover-bg)"; }}
                      onMouseLeave={e => { if (page !== n) e.currentTarget.style.background = "transparent"; }}
                    >
                      {n}
                    </button>
                  ))}
                  {totalPages > 5 && <span style={{ color: "var(--text-muted)" }} className="text-xs px-1">...</span>}
                  {totalPages > 5 && (
                    <button onClick={() => setPage(totalPages)} className="h-8 w-8 rounded-lg text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                      {totalPages}
                    </button>
                  )}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={e => { if (page < totalPages) e.currentTarget.style.background = "var(--hover-bg)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>Rows per page:</span>
                  <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{ROWS_PER_PAGE}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="xl:w-72 space-y-4 shrink-0">
          {/* Page Overview */}
          <div className="admin-card !p-5">
            <h3 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>Page Overview</h3>
            <DonutChart published={published} draft={draft} />
          </div>

          {/* Quick Actions */}
          <div className="admin-card !p-5">
            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Quick Actions</h3>
            <div className="space-y-1">
              {[
                { label: "Add New Page", icon: Plus, action: openAdd, color: "#12D6C5" },
                { label: "Bulk Import Pages", icon: Upload, action: () => {}, color: "var(--text-secondary)" },
                { label: "Export Pages", icon: Download, action: () => {}, color: "var(--text-secondary)" },
                { label: "Page Settings", icon: Settings, action: () => {}, color: "var(--text-secondary)" },
                { label: "Reorder Pages", icon: SortAsc, action: () => {}, color: "var(--text-secondary)" },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
                  style={{ color: item.color }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--hover-bg)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                  <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-50" />
                </button>
              ))}
            </div>
          </div>

          {/* Top Pages */}
          {topPages.length > 0 && (
            <div className="admin-card !p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Top Pages</h3>
                <button className="text-xs font-semibold" style={{ color: "#12D6C5" }}>View All</button>
              </div>
              <div className="space-y-3">
                {topPages.map(p => {
                  const PageIcon = getPageIcon(p.slug);
                  return (
                    <div key={p.id} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--icon-bg)" }}>
                        <PageIcon className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{p.title}</p>
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>/{p.slug}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{p.views.toLocaleString()}</p>
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>views</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Last Published */}
          <div className="admin-card !p-5">
            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Last Published</h3>
            {pages.filter(p => p.isActive).slice(0, 1).map(p => (
              <div key={p.id}>
                <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{formatDate(p.updatedAt)}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>by Admin User</p>
                <span className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(22,199,132,0.12)", color: "#16C784" }}>
                  Published
                </span>
              </div>
            ))}
            {pages.filter(p => p.isActive).length === 0 && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>No published pages yet</p>
            )}
          </div>

          {/* Tips */}
          <div className="admin-card !p-5">
            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Tips</h3>
            <div className="space-y-2">
              {["Drag and drop sections to reorder them.", "Toggle sections on/off to show or hide them from the homepage."].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: "#12D6C5" }} />
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "var(--modal-overlay)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--card-border)" }}>
              <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                {editingPage ? "Edit Page" : "Add New Page"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-muted)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--hover-bg)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>Page Title *</label>
                  <input value={form.title} onChange={e => {
                    const title = e.target.value;
                    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                    setForm(f => ({ ...f, title, ...(!editingPage ? { slug } : {}) }));
                  }} className="admin-input w-full" placeholder="About Us" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>Slug *</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2" style={{ color: "var(--text-muted)" }}>
                      <Globe className="h-3.5 w-3.5" />
                    </span>
                    <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="admin-input w-full font-mono text-sm" placeholder="about-us" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>Page Content</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="admin-input w-full resize-none" rows={6} placeholder="Write your page content here..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>Meta Title</label>
                  <input value={form.metaTitle} onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))} className="admin-input w-full" placeholder="SEO title" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>Meta Description</label>
                  <input value={form.metaDescription} onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))} className="admin-input w-full" placeholder="SEO description" />
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "var(--hover-bg)" }}>
                <button
                  onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className="relative h-6 w-11 rounded-full transition-colors shrink-0"
                  style={{ background: form.isActive ? "#12D6C5" : "var(--icon-bg)" }}
                >
                  <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" style={{ transform: form.isActive ? "translateX(22px)" : "translateX(2px)" }} />
                </button>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {form.isActive ? "Published" : "Draft"}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {form.isActive ? "Page is live on the website" : "Page is hidden from public view"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid var(--card-border)" }}>
              <button onClick={() => setShowModal(false)} className="btn-secondary h-10 px-5 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary h-10 px-5 text-sm flex items-center gap-2">
                <Save className="h-4 w-4" />
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
