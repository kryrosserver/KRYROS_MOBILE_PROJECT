"use client";

import React, { useState, useEffect, useRef } from "react";
import { resolveImageUrl } from "@/lib/utils";
import Link from "next/link";
import {
  Plus, GripVertical, Trash2, Edit, Eye, EyeOff,
  RefreshCw, X, Layers, Image as ImageIcon, Grid, List,
  Type, Settings, Palette, PlayCircle, ShieldCheck,
  CreditCard, Layout, Package, ChevronRight, MoreVertical,
  Home, Save, Info
} from "lucide-react";

interface SectionType {
  id: string;
  label: string;
  icon: any;
  description: string;
  color: string;
  bg: string;
}

const SECTION_TYPES: SectionType[] = [
  { id: "HeroSlider", label: "Hero Slider", icon: Layers, description: "Main promotional slider using banners", color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
  { id: "TrustBadges", label: "Trust Badges", icon: ShieldCheck, description: "Display features like Fast Delivery, Secure Payment", color: "#16C784", bg: "rgba(22,199,132,0.12)" },
  { id: "FlashSale", label: "Flash Sale", icon: PlayCircle, description: "Display active flash sales with countdown", color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  { id: "PromoBanner", label: "Promo Banner", icon: ImageIcon, description: "Big full-width promotional banner", color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
  { id: "ProductPromoList", label: "Product Promos", icon: List, description: "Vertical list of product promotions", color: "#EC4899", bg: "rgba(236,72,153,0.12)" },
  { id: "CategoriesGrid", label: "Categories", icon: Grid, description: "Grid of featured categories", color: "#12D6C5", bg: "rgba(18,214,197,0.12)" },
  { id: "PopularTagsProducts", label: "Popular Tags", icon: Palette, description: "Products filtered by popular tags", color: "#F97316", bg: "rgba(249,115,22,0.12)" },
  { id: "ProductGrid", label: "Product Grid", icon: Grid, description: "Display a grid of products from a category", color: "#6366F1", bg: "rgba(99,102,241,0.12)" },
  { id: "DualBannerSection", label: "Dual Banners", icon: Layout, description: "Two side-by-side promotional banners", color: "#14B8A6", bg: "rgba(20,184,166,0.12)" },
  { id: "PopularFiltersProducts", label: "Popular Filters", icon: Settings, description: "Products filtered by popular options", color: "#84CC16", bg: "rgba(132,204,22,0.12)" },
  { id: "TrendProductsBanner", label: "Trend Products", icon: PlayCircle, description: "Trending products promotion banner", color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
  { id: "ProductReviews", label: "Reviews", icon: Palette, description: "Customer product reviews", color: "#A78BFA", bg: "rgba(167,139,250,0.12)" },
  { id: "DiscountBanner", label: "Discount Banner", icon: ImageIcon, description: "Special discount promotion banner", color: "#FB923C", bg: "rgba(251,146,60,0.12)" },
  { id: "BannerGrid", label: "Banner Grid", icon: Layout, description: "Display 2 or 3 promotional banners in a row", color: "#38BDF8", bg: "rgba(56,189,248,0.12)" },
  { id: "FeaturedCategory", label: "Category Focus", icon: Grid, description: "Products from a specific category", color: "#4ADE80", bg: "rgba(74,222,128,0.12)" },
  { id: "CreditSection", label: "Credit Info", icon: CreditCard, description: "Information about credit plans", color: "#FACC15", bg: "rgba(250,204,21,0.12)" },
  { id: "TextBlock", label: "Text Block", icon: Type, description: "Custom text or HTML content", color: "#94A3B8", bg: "rgba(148,163,184,0.12)" },
  { id: "CategoryProducts", label: "Category Products", icon: Grid, description: "Display a specific category with its products", color: "#12D6C5", bg: "rgba(18,214,197,0.12)" },
];

function getSectionInfo(type: string) {
  return SECTION_TYPES.find(t => t.id === type) || SECTION_TYPES[0];
}

function DonutChart({ active, inactive }: { active: number; inactive: number }) {
  const total = active + inactive || 1;
  const r = 40, cx = 50, cy = 50, circ = 2 * Math.PI * r;
  const aDash = (active / total) * circ;
  return (
    <div className="flex items-center gap-4">
      <svg width={100} height={100} viewBox="0 0 100 100">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--icon-bg)" strokeWidth="10" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#16C784" strokeWidth="10"
          strokeDasharray={`${aDash} ${circ}`} strokeDashoffset={0} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EF4444" strokeWidth="10"
          strokeDasharray={`${circ - aDash} ${circ}`} strokeDashoffset={-aDash} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-primary)">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="8" fill="var(--text-muted)">Total</text>
      </svg>
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#16C784" }} />
          <span style={{ color: "var(--text-secondary)" }}>Active</span>
          <span className="font-bold ml-auto pl-3" style={{ color: "var(--text-primary)" }}>{active} ({Math.round((active/total)*100)}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#EF4444" }} />
          <span style={{ color: "var(--text-secondary)" }}>Inactive</span>
          <span className="font-bold ml-auto pl-3" style={{ color: "var(--text-primary)" }}>{inactive} (0%)</span>
        </div>
      </div>
    </div>
  );
}

async function compressImage(file: File, maxWidth = 1500, quality = 0.8): Promise<string> {
  const blobURL = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = blobURL;
  });
  const scale = Math.min(1, maxWidth / img.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(blobURL);
  const isPng = file.type.includes("png");
  return canvas.toDataURL(isPng ? "image/png" : "image/jpeg", quality);
}

export default function HomePageCMS() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

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

  const loadSections = async () => {
    setLoading(true);
    try {
      const res = await fetch("/internal/admin/cms/homepage-sections/manage", { credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        setSections(Array.isArray(data) ? data : []);
      }
    } catch {
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  const seedSections = async () => {
    setLoading(true);
    try {
      const res = await fetch("/internal/admin/cms/homepage-sections/seed", { method: "POST", credentials: "same-origin" });
      const data = await res.json();
      loadSections();
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSections(); }, []);

  const toggleActive = async (section: any) => {
    const res = await fetch(`/internal/admin/cms/homepage-sections/${section.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !section.isActive }),
      credentials: "same-origin"
    });
    if (res.ok) loadSections();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this section?")) return;
    const res = await fetch(`/internal/admin/cms/homepage-sections/${id}`, { method: "DELETE", credentials: "same-origin" });
    if (res.ok) loadSections();
  };

  const moveOrder = (index: number, direction: "up" | "down") => {
    const newSections = [...sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;
    setSections(newSections.map((s, idx) => ({ ...s, order: idx + 1 })));
    setHasChanges(true);
  };

  const saveLayout = async () => {
    setSaving(true);
    try {
      for (const section of sections) {
        await fetch(`/internal/admin/cms/homepage-sections/${section.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: section.order }),
          credentials: "same-origin"
        });
      }
      setHasChanges(false);
      await loadSections();
    } finally {
      setSaving(false);
    }
  };

  const activeSections = sections.filter(s => s.isActive);
  const inactiveSections = sections.filter(s => !s.isActive);
  const lastPublished = sections.find(s => s.updatedAt) || sections[0];

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
            <Link href="/admin/cms" className="hover:underline" style={{ color: "var(--text-muted)" }}>CMS & Pages</Link>
            <span>/</span>
            <span style={{ color: "var(--text-primary)" }}>Home Page</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Home Page</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadSections}
            className="btn-secondary h-10 px-4 flex items-center gap-2 text-sm"
          >
            <Eye className="h-4 w-4" /> Preview Home Page
          </button>
          {hasChanges ? (
            <button
              onClick={saveLayout}
              disabled={saving}
              className="btn-primary h-10 px-4 flex items-center gap-2 text-sm"
            >
              <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
            </button>
          ) : (
            <button
              onClick={loadSections}
              className="btn-primary h-10 px-4 flex items-center gap-2 text-sm"
            >
              <Save className="h-4 w-4" /> Save Changes
            </button>
          )}
          <button className="btn-secondary h-10 w-10 flex items-center justify-center p-0">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sections List */}
        <div className="flex-1 min-w-0">
          <div className="admin-card !p-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--card-border)" }}>
              <div>
                <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Home Page Sections</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Manage and customize the content sections displayed on your homepage.</p>
              </div>
              <Link
                href="/admin/cms/homepage/add-section"
                className="btn-primary h-9 px-4 flex items-center gap-2 text-sm"
              >
                <Plus className="h-4 w-4" /> Add Section
              </Link>
            </div>

            {/* Section Rows */}
            <div>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: "1px solid var(--card-border)" }}>
                    <div className="h-10 w-10 rounded-xl animate-pulse" style={{ background: "var(--icon-bg)" }} />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-40 rounded animate-pulse" style={{ background: "var(--icon-bg)" }} />
                      <div className="h-2 w-24 rounded animate-pulse" style={{ background: "var(--icon-bg)" }} />
                    </div>
                  </div>
                ))
              ) : sections.length === 0 ? (
                <div className="py-16 text-center">
                  <Layout className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="font-semibold text-sm mb-4" style={{ color: "var(--text-muted)" }}>No sections created</p>
                  <button onClick={seedSections} className="btn-secondary flex items-center gap-2 mx-auto text-sm">
                    <RefreshCw className="h-4 w-4" /> Restore Default Sections
                  </button>
                </div>
              ) : (
                sections.map((section, index) => {
                  const info = getSectionInfo(section.type);
                  const IconComp = info.icon;
                  const countLabel = section.type === "HeroSlider" ? "3 Slides"
                    : section.type === "CategoriesGrid" ? "12 Categories"
                    : section.type === "ProductGrid" ? "8 Products"
                    : section.type === "TrustBadges" ? "4 Badges"
                    : section.type === "ProductReviews" ? "6 Testimonials"
                    : section.type === "PromoBanner" ? "2 Banners"
                    : "1 Section";

                  return (
                    <div
                      key={section.id}
                      className="flex items-center gap-4 px-5 py-4 transition-colors"
                      style={{ borderBottom: "1px solid var(--card-border)", color: "var(--text-primary)" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "var(--hover-bg)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                      {/* Drag handle */}
                      <GripVertical className="h-4 w-4 shrink-0 cursor-grab" style={{ color: "var(--text-muted)" }} />

                      {/* Icon */}
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: info.bg }}
                      >
                        <IconComp className="h-5 w-5" style={{ color: info.color }} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                          {section.title || info.label}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {info.description}
                        </p>
                      </div>

                      {/* Count */}
                      <div className="hidden sm:block text-xs shrink-0" style={{ color: section.isActive ? "#16C784" : "var(--text-muted)" }}>
                        <span>{countLabel}</span>
                        <br />
                        <span style={{ color: section.isActive ? "#16C784" : "#F59E0B" }}>
                          {section.isActive ? "● Active" : "● Inactive"}
                        </span>
                      </div>

                      {/* Toggle */}
                      <button
                        onClick={() => toggleActive(section)}
                        className="shrink-0 relative"
                        style={{ width: 40, height: 22 }}
                      >
                        <div
                          className="absolute inset-0 rounded-full transition-all"
                          style={{ background: section.isActive ? "#16C784" : "var(--icon-bg)" }}
                        />
                        <div
                          className="absolute top-0.5 rounded-full transition-all"
                          style={{
                            width: 18, height: 18,
                            background: "#fff",
                            left: section.isActive ? "calc(100% - 20px)" : 2,
                          }}
                        />
                      </button>

                      {/* Edit button */}
                      <button
                        onClick={() => {}}
                        className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors shrink-0"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "var(--hover-bg)"; e.currentTarget.style.color = "#12D6C5"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      {/* More options */}
                      <button
                        className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors shrink-0"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "var(--hover-bg)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add New Section Footer */}
            {sections.length > 0 && (
              <div
                className="px-5 py-4 flex flex-col items-center gap-1"
                style={{ borderTop: "1px solid var(--card-border)" }}
              >
                <button
                  onClick={seedSections}
                  className="flex items-center gap-2 text-sm font-medium transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#12D6C5"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; }}
                >
                  <Plus className="h-4 w-4" /> Add New Section
                </button>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Drag and drop sections to reorder</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="xl:w-72 space-y-4 shrink-0">
          {/* Home Page Overview */}
          <div className="admin-card !p-5">
            <h3 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>Home Page Overview</h3>
            <DonutChart active={activeSections.length} inactive={inactiveSections.length} />
          </div>

          {/* Quick Actions */}
          <div className="admin-card !p-5">
            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Quick Actions</h3>
            <div className="space-y-1">
              {[
                { label: "Preview Home Page", icon: Eye, action: () => {} },
                { label: "Import Home Page", icon: RefreshCw, action: () => {} },
                { label: "Export Home Page", icon: RefreshCw, action: () => {} },
                { label: "Reset to Default", icon: RefreshCw, action: seedSections },
                { label: "Home Page Settings", icon: Settings, action: () => {} },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
                  style={{ color: "var(--text-secondary)" }}
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

          {/* Last Published */}
          <div className="admin-card !p-5">
            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Last Published</h3>
            {lastPublished ? (
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                  {lastPublished.updatedAt
                    ? new Date(lastPublished.updatedAt).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" }) +
                      " at " + new Date(lastPublished.updatedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
                    : "May 24, 2025 at 10:30 AM"}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>by Admin User</p>
                <span className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(22,199,132,0.12)", color: "#16C784" }}>
                  Published
                </span>
              </div>
            ) : (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>No published sections yet</p>
            )}
          </div>

          {/* Tips */}
          <div className="admin-card !p-5">
            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Tips</h3>
            <div className="space-y-2">
              {[
                "Drag and drop sections to reorder them.",
                "Toggle sections on/off to show or hide them from the homepage.",
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: "#12D6C5" }} />
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
      </div>
    </div>
  );
}
