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
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <svg width={100} height={100} viewBox="0 0 100 100">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--icon-bg)" strokeWidth="10" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#16C784" strokeWidth="10"
          strokeDasharray={`${aDash} ${circ}`} strokeDashoffset={0} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EF4444" strokeWidth="10"
          strokeDasharray={`${circ - aDash} ${circ}`} strokeDashoffset={-aDash} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-primary)">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="8" fill="var(--text-secondary)">Total</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11 }}>
        {[
          { color: "#16C784", label: "Active",   val: active,   pct: Math.round((active / total) * 100) },
          { color: "#EF4444", label: "Inactive",  val: inactive,  pct: 0 },
        ].map(row => (
          <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: row.color, flexShrink: 0 }} />
            <span style={{ color: "var(--text-secondary)" }}>{row.label}</span>
            <span style={{ fontWeight: 700, color: "var(--text-primary)", marginLeft: "auto", paddingLeft: 10 }}>{row.val} ({row.pct}%)</span>
          </div>
        ))}
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
      outerRef.current.style.height = `${visualH}px`;
    }
    function recalc() {
      if (!innerRef.current || !outerRef.current) return;
      const vw = outerRef.current.offsetWidth || window.innerWidth;
      const baseW = vw < 960 ? 750 : 1380;
      if (vw <= 599) { innerRef.current.style.width = "750px"; innerRef.current.style.transform = "none"; innerRef.current.style.transformOrigin = "top left"; if (outerRef.current) { outerRef.current.style.overflowX = "auto"; outerRef.current.style.height = "auto"; } return; } if (outerRef.current) outerRef.current.style.overflowX = "hidden"; const nextScale = Math.min(1, vw / baseW);
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
    <div style={{ color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: 16, paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>
            <Link href="/admin" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <Link href="/admin/cms" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>CMS & Pages</Link>
            <span>/</span>
            <span style={{ color: "#12D6C5" }}>Home Page</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", whiteSpace: "nowrap", margin: 0 }}>Home Page</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={loadSections}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 10, padding: "9px 16px", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>
            <Eye style={{ width: 15, height: 15 }} /> Preview Home Page
          </button>
          <button onClick={hasChanges ? saveLayout : loadSections} disabled={saving}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "#12D6C5", border: "none", borderRadius: 10, padding: "9px 16px", color: "#0B1320", fontSize: 13, cursor: saving ? "not-allowed" : "pointer", fontWeight: 800, opacity: saving ? 0.7 : 1 }}>
            <Save style={{ width: 15, height: 15 }} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button style={{ width: 38, height: 38, background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 10, color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MoreVertical style={{ width: 15, height: 15 }} />
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div style={{ display: "flex", gap: 16, alignItems: "start" }}>
        {/* Sections List */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--card-border)" }}>
              <div>
                <h2 style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Home Page Sections</h2>
                <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 3 }}>Manage and customize the content sections displayed on your homepage.</p>
              </div>
              <Link href="/admin/cms/homepage/add-section"
                style={{ display: "flex", alignItems: "center", gap: 7, background: "#12D6C5", border: "none", borderRadius: 10, padding: "8px 14px", color: "#0B1320", fontWeight: 800, fontSize: 12, cursor: "pointer", textDecoration: "none" }}>
                <Plus style={{ width: 14, height: 14 }} /> Add Section
              </Link>
            </div>

            {/* Section Rows */}
            <div>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: "1px solid var(--card-border)" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--icon-bg)" }} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ height: 11, width: 160, borderRadius: 6, background: "var(--icon-bg)" }} />
                      <div style={{ height: 8, width: 100, borderRadius: 6, background: "var(--icon-bg)" }} />
                    </div>
                  </div>
                ))
              ) : sections.length === 0 ? (
                <div style={{ padding: "60px 20px", textAlign: "center" }}>
                  <Layout style={{ width: 36, height: 36, color: "var(--text-secondary)", opacity: 0.2, margin: "0 auto 10px" }} />
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 14 }}>No sections created</p>
                  <button onClick={seedSections}
                    style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 10, padding: "8px 16px", color: "var(--text-secondary)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    <RefreshCw style={{ width: 13, height: 13 }} /> Restore Default Sections
                  </button>
                </div>
              ) : (
                sections.map((section) => {
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
                    <div key={section.id}
                      style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: "1px solid var(--card-border)", color: "var(--text-primary)", transition: "background 0.1s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "var(--hover-bg)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                      <GripVertical style={{ width: 14, height: 14, flexShrink: 0, cursor: "grab", color: "var(--text-secondary)" }} />
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: info.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <IconComp style={{ width: 18, height: 18, color: info.color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{section.title || info.label}</p>
                        <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>{info.description}</p>
                      </div>
                      <div style={{ fontSize: 11, flexShrink: 0, textAlign: "right" }}>
                        <span style={{ color: section.isActive ? "#16C784" : "var(--text-secondary)" }}>{countLabel}</span>
                        <br />
                        <span style={{ color: section.isActive ? "#16C784" : "#F59E0B", fontWeight: 700 }}>
                          {section.isActive ? "● Active" : "● Inactive"}
                        </span>
                      </div>
                      <div onClick={() => toggleActive(section)} style={{ width: 40, height: 22, borderRadius: 12, background: section.isActive ? "#16C784" : "var(--icon-bg)", position: "relative", cursor: "pointer", flexShrink: 0, transition: "background 0.2s" }}>
                        <div style={{ position: "absolute", top: 2, left: section.isActive ? "calc(100% - 20px)" : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                      </div>
                      <button onClick={() => {}}
                        style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", background: "transparent", border: "none", cursor: "pointer", flexShrink: 0 }}
                        onMouseEnter={e => { e.currentTarget.style.background = "var(--hover-bg)"; e.currentTarget.style.color = "#12D6C5"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                        <Edit style={{ width: 14, height: 14 }} />
                      </button>
                      <button style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", background: "transparent", border: "none", cursor: "pointer", flexShrink: 0 }}
                        onMouseEnter={e => { e.currentTarget.style.background = "var(--hover-bg)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                        <MoreVertical style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add New Section Footer */}
            {sections.length > 0 && (
              <div style={{ padding: "14px 20px", borderTop: "1px solid var(--card-border)", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <button onClick={seedSections}
                  style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", background: "transparent", border: "none", cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#12D6C5"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; }}>
                  <Plus style={{ width: 13, height: 13 }} /> Add New Section
                </button>
                <p style={{ fontSize: 10, color: "var(--text-secondary)" }}>Drag and drop sections to reorder</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "20px" }}>
            <h3 style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Home Page Overview</h3>
            <DonutChart active={activeSections.length} inactive={inactiveSections.length} />
          </div>

          <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "20px" }}>
            <h3 style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { label: "Preview Home Page", icon: Eye, action: () => {} },
                { label: "Import Home Page", icon: RefreshCw, action: () => {} },
                { label: "Export Home Page", icon: RefreshCw, action: () => {} },
                { label: "Reset to Default", icon: RefreshCw, action: seedSections },
                { label: "Home Page Settings", icon: Settings, action: () => {} },
              ].map(item => (
                <button key={item.label} onClick={item.action}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 10, fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--hover-bg)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                  <item.icon style={{ width: 14, height: 14, flexShrink: 0 }} />
                  {item.label}
                  <ChevronRight style={{ width: 12, height: 12, marginLeft: "auto", opacity: 0.4 }} />
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "20px" }}>
            <h3 style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Last Published</h3>
            {lastPublished ? (
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>
                  {lastPublished.updatedAt
                    ? new Date(lastPublished.updatedAt).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" }) +
                      " at " + new Date(lastPublished.updatedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
                    : "May 24, 2025 at 10:30 AM"}
                </p>
                <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>by Admin User</p>
                <span style={{ marginTop: 8, display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "rgba(22,199,132,0.12)", color: "#16C784" }}>
                  Published
                </span>
              </div>
            ) : (
              <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>No published sections yet</p>
            )}
          </div>

          <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "20px" }}>
            <h3 style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Tips</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "Drag and drop sections to reorder them.",
                "Toggle sections on/off to show or hide them from the homepage.",
              ].map((tip, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <Info style={{ width: 13, height: 13, flexShrink: 0, marginTop: 1, color: "#12D6C5" }} />
                  <p style={{ fontSize: 11, lineHeight: 1.5, color: "var(--text-secondary)" }}>{tip}</p>
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
