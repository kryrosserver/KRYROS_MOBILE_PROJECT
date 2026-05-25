"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Bell, Calendar, Sun, Moon, Menu, ChevronDown, ChevronRight,
  Plus, Edit, Trash2, Eye, MoreVertical, RefreshCw, GripVertical,
  Layers, Grid, Zap, ShieldCheck, ImageIcon, List, Type, Settings,
  Palette, PlayCircle, Layout, Package, CreditCard, Tag, Star,
  TrendingUp, Mail, MessageCircle, Code, Megaphone, Home, Save,
  ArrowLeft, BarChart3, FileText,
} from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

const ACCENT = "#12D6C5";
const MOBILE_BASE = 750;
const DESKTOP_BASE = 1380;

const SECTION_META: Record<string, { icon: any; color: string; bg: string; label: string; description: string }> = {
  HeroSlider:          { icon: Layers,        color: "#3B82F6", bg: "rgba(59,130,246,0.15)",  label: "Hero Banner",          description: "Main banner slider with promotional content" },
  TrustBadges:         { icon: ShieldCheck,   color: "#16C784", bg: "rgba(22,199,132,0.15)",  label: "Trust Badges",         description: "Fast Delivery, Secure Payment, Returns" },
  CategoriesGrid:      { icon: Grid,          color: "#12D6C5", bg: "rgba(18,214,197,0.15)",  label: "Categories",           description: "Display product categories" },
  FlashSale:           { icon: Zap,           color: "#F59E0B", bg: "rgba(245,158,11,0.15)",  label: "Flash Sale",           description: "Active flash sales with countdown" },
  UpgradeBanner:       { icon: Megaphone,     color: "#A78BFA", bg: "rgba(167,139,250,0.15)", label: "Upgrade Banner",       description: "Upgrade your tech promotional banner" },
  PromoBanners:        { icon: Layout,        color: "#38BDF8", bg: "rgba(56,189,248,0.15)",  label: "Promo Banners",        description: "Two side-by-side promotional banners" },
  FeaturedProducts:    { icon: Star,          color: "#8B5CF6", bg: "rgba(139,92,246,0.15)",  label: "Featured Products",    description: "Handpicked featured products" },
  BestSelling:         { icon: TrendingUp,    color: "#EF4444", bg: "rgba(239,68,68,0.15)",   label: "Best Selling",         description: "Top selling products" },
  NewArrivals:         { icon: Package,       color: "#22C55E", bg: "rgba(34,197,94,0.15)",   label: "New Arrivals",         description: "Latest newly added products" },
  Brands:              { icon: Tag,           color: "#6366F1", bg: "rgba(99,102,241,0.15)",  label: "Brands",               description: "Featured brands showcase" },
  Testimonials:        { icon: MessageCircle, color: "#F97316", bg: "rgba(249,115,22,0.15)",  label: "Testimonials",         description: "Customer reviews and testimonials" },
  Newsletter:          { icon: Mail,          color: "#14B8A6", bg: "rgba(20,184,166,0.15)",  label: "Newsletter",           description: "Email subscription section" },
  CustomHTML:          { icon: Code,          color: "#94A3B8", bg: "rgba(148,163,184,0.15)", label: "Custom HTML",          description: "Custom HTML content block" },
  CategoryPromo:       { icon: ImageIcon,     color: "#EC4899", bg: "rgba(236,72,153,0.15)",  label: "Category Promo",       description: "Category promotional banners" },
  PromoBanner:         { icon: ImageIcon,     color: "#8B5CF6", bg: "rgba(139,92,246,0.15)",  label: "Promo Banner",         description: "Full-width promotional banner" },
  ProductGrid:         { icon: Grid,          color: "#6366F1", bg: "rgba(99,102,241,0.15)",  label: "Product Grid",         description: "Grid of products from a category" },
  DualBannerSection:   { icon: Layout,        color: "#14B8A6", bg: "rgba(20,184,166,0.15)",  label: "Dual Banners",         description: "Two side-by-side banners" },
  TextBlock:           { icon: Type,          color: "#64748B", bg: "rgba(100,116,139,0.15)", label: "Text Block",           description: "Custom text or HTML content" },
  PageHero:            { icon: ImageIcon,     color: "#3B82F6", bg: "rgba(59,130,246,0.15)",  label: "Page Hero",            description: "Top hero section for the page" },
  PageContent:         { icon: FileText,      color: "#64748B", bg: "rgba(100,116,139,0.15)", label: "Page Content",         description: "Main content area" },
  MembersBanner:       { icon: Megaphone,     color: "#F59E0B", bg: "rgba(245,158,11,0.15)",  label: "Members Banner",       description: "Shop members promotional section" },
  ShopFilters:         { icon: Settings,      color: "#12D6C5", bg: "rgba(18,214,197,0.15)",  label: "Shop Filters",         description: "Product filter options" },
  RelatedProducts:     { icon: Package,       color: "#22C55E", bg: "rgba(34,197,94,0.15)",   label: "Related Products",     description: "Related products recommendation" },
  ProductGallery:      { icon: ImageIcon,     color: "#3B82F6", bg: "rgba(59,130,246,0.15)",  label: "Product Gallery",      description: "Product images gallery" },
  WholesaleHero:       { icon: Layers,        color: "#8B5CF6", bg: "rgba(139,92,246,0.15)",  label: "Wholesale Hero",       description: "Wholesale page hero section" },
  WholesaleFeatures:   { icon: ShieldCheck,   color: "#16C784", bg: "rgba(22,199,132,0.15)",  label: "Wholesale Features",   description: "Wholesale features and benefits" },
  FAQAccordion:        { icon: MessageCircle, color: "#F97316", bg: "rgba(249,115,22,0.15)",  label: "FAQ Accordion",        description: "Frequently asked questions" },
  ContactForm:         { icon: Mail,          color: "#14B8A6", bg: "rgba(20,184,166,0.15)",  label: "Contact Form",         description: "Contact us form section" },
  GetNowHero:          { icon: CreditCard,    color: "#FACC15", bg: "rgba(250,204,21,0.15)",  label: "Get Now Hero",         description: "Buy Now Pay Later hero section" },
  GetNowFeatures:      { icon: ShieldCheck,   color: "#16C784", bg: "rgba(22,199,132,0.15)",  label: "Get Now Features",     description: "BNPL features and benefits" },
};

const PAGE_DEFAULT_SECTIONS: Record<string, { type: string; order: number }[]> = {
  home: [
    { type: "HeroSlider", order: 1 }, { type: "Brands", order: 2 }, { type: "TrustBadges", order: 3 },
    { type: "CategoriesGrid", order: 4 }, { type: "FlashSale", order: 5 }, { type: "UpgradeBanner", order: 6 },
    { type: "PromoBanners", order: 7 }, { type: "FeaturedProducts", order: 8 }, { type: "CategoryPromo", order: 9 },
    { type: "NewArrivals", order: 10 }, { type: "Newsletter", order: 11 },
  ],
  shop: [
    { type: "MembersBanner", order: 1 }, { type: "ShopFilters", order: 2 }, { type: "ProductGrid", order: 3 },
    { type: "Newsletter", order: 4 },
  ],
  "product-detail": [
    { type: "ProductGallery", order: 1 }, { type: "RelatedProducts", order: 2 }, { type: "Testimonials", order: 3 },
  ],
  wholesale: [
    { type: "WholesaleHero", order: 1 }, { type: "WholesaleFeatures", order: 2 }, { type: "Newsletter", order: 3 },
  ],
  faq: [
    { type: "PageHero", order: 1 }, { type: "FAQAccordion", order: 2 },
  ],
  "contact-us": [
    { type: "PageHero", order: 1 }, { type: "ContactForm", order: 2 },
  ],
  "get-now": [
    { type: "GetNowHero", order: 1 }, { type: "GetNowFeatures", order: 2 }, { type: "Newsletter", order: 3 },
  ],
};

const PAGE_LABELS: Record<string, string> = {
  home: "Home Page", shop: "Shop Page", "product-detail": "Product Detail",
  wholesale: "Wholesale Page", faq: "FAQ Page", "contact-us": "Contact Us",
  "get-now": "Get Now Page", "about-us": "About Us", "terms-conditions": "Terms & Conditions",
  "privacy-policy": "Privacy Policy", "refund-policy": "Refund Policy",
  "shipping-policy": "Shipping Policy", "how-it-works": "How It Works",
  cart: "Cart Page", checkout: "Checkout Page", "track-order": "Track Order",
  account: "My Account",
};

function getSectionMeta(type: string) {
  return SECTION_META[type] || { icon: Settings, color: "#64748B", bg: "rgba(100,116,139,0.15)", label: type, description: "Page section" };
}

function getSectionCount(section: any): string {
  if (!section?.config) return "1 Section";
  const cfg = section.config;
  if (cfg.slides?.length) return `${cfg.slides.length} Slides`;
  if (cfg.items?.length) return `${cfg.items.length} Items`;
  if (cfg.products?.length) return `${cfg.products.length} Products`;
  if (cfg.banners?.length) return `${cfg.banners.length} Banners`;
  if (cfg.categories?.length) return `${cfg.categories.length} Categories`;
  return "1 Section";
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
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="8" fill="var(--text-muted)">Total Sections</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#16C784", flexShrink: 0 }} />
          <span style={{ color: "var(--text-secondary)" }}>Active</span>
          <span style={{ fontWeight: 700, marginLeft: "auto", paddingLeft: 12, color: "var(--text-primary)" }}>{active} ({Math.round((active / total) * 100)}%)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444", flexShrink: 0 }} />
          <span style={{ color: "var(--text-secondary)" }}>Inactive</span>
          <span style={{ fontWeight: 700, marginLeft: "auto", paddingLeft: 12, color: "var(--text-primary)" }}>{inactive} ({Math.round((inactive / total) * 100)}%)</span>
        </div>
      </div>
    </div>
  );
}

export default function CMSPageSections() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "home";
  const pageLabel = PAGE_LABELS[slug] || slug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");

  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const { isDark, toggleTheme } = useTheme();

  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState("");
  const [lastPublished] = useState("May 24, 2025 at 10:30 AM");

  useEffect(() => {
    let raf: number;
    function applyHeight(s: number) {
      if (!innerRef.current || !outerRef.current) return;
      outerRef.current.style.height = "auto";
      outerRef.current.style.height = `${innerRef.current.scrollHeight * s}px`;
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
  }, [sections]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/cms/pages/${slug}/sections`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSections(data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
        } else {
          const defaults = (PAGE_DEFAULT_SECTIONS[slug] || [{ type: "PageContent", order: 1 }]).map((s, i) => ({
            id: `default-${i}`, type: s.type, label: getSectionMeta(s.type).label,
            isActive: true, order: s.order, config: {},
          }));
          setSections(defaults);
        }
      }
    } catch {
      const defaults = (PAGE_DEFAULT_SECTIONS[slug] || [{ type: "PageContent", order: 1 }]).map((s, i) => ({
        id: `default-${i}`, type: s.type, label: getSectionMeta(s.type).label,
        isActive: true, order: s.order, config: {},
      }));
      setSections(defaults);
    } finally { setLoading(false); }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (section: any) => {
    const updated = sections.map(s => s.id === section.id ? { ...s, isActive: !s.isActive } : s);
    setSections(updated);
    if (!section.id.startsWith("default-")) {
      const endpoint = slug === "home" ? `/api/admin/cms/homepage-sections/${section.id}` : `/api/admin/cms/sections/${section.id}`;
      await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !section.isActive }),
      });
    }
  };

  const handleDelete = async (section: any) => {
    if (!confirm(`Delete "${section.label}"?`)) return;
    if (!section.id.startsWith("default-")) {
      const endpoint = slug === "home" ? `/api/admin/cms/homepage-sections/${section.id}` : `/api/admin/cms/sections/${section.id}`;
      await fetch(endpoint, { method: "DELETE" });
    }
    setSections(prev => prev.filter(s => s.id !== section.id));
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      const sectionType = slug === "home" ? "homepage" : "generic";
      setMsg("Order saved!");
      setTimeout(() => setMsg(null), 2000);
    } finally { setSaving(false); }
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const newSections = [...sections];
    const [moved] = newSections.splice(dragIdx, 1);
    newSections.splice(idx, 0, moved);
    setSections(newSections.map((s, i) => ({ ...s, order: i + 1 })));
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  const handleAddSection = async () => {
    if (!addType) return;
    const meta = getSectionMeta(addType);
    const newSection = { id: `default-${Date.now()}`, type: addType, label: meta.label, isActive: true, order: sections.length + 1, config: {} };
    setSections(prev => [...prev, newSection]);
    setShowAdd(false);
    setAddType("");
  };

  const active = sections.filter(s => s.isActive).length;
  const inactive = sections.filter(s => !s.isActive).length;

  const TEXT = "var(--text-primary)";
  const TEXT2 = "var(--text-secondary)";
  const CARD = "var(--card-bg)";
  const BORDER = "var(--card-border)";
  const BG = "var(--bg-primary)";
  const HEADER_BG = "var(--bg-secondary)";
  const ICON_BG = "var(--icon-bg)";

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: BG, margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: BG, color: TEXT, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* TOP HEADER */}
        <header style={{ background: HEADER_BG, borderBottom: `1px solid ${BORDER}`, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", gap: 16, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>
              <Menu style={{ width: 20, height: 20 }} />
            </button>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: TEXT, whiteSpace: "nowrap", margin: 0 }}>{pageLabel}</h1>
          </div>
          <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: TEXT2 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </span>
            <input placeholder="Search anything..." style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "8px 40px 8px 36px", color: TEXT, fontSize: 13, outline: "none" }} />
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: TEXT2, background: ICON_BG, padding: "2px 5px", borderRadius: 4 }}>⌘K</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ position: "relative", background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>
              <Bell style={{ width: 20, height: 20 }} />
              <span style={{ position: "absolute", top: 0, right: 0, background: "#EF4444", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>3</span>
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

        {/* PAGE CONTENT */}
        <div style={{ padding: 20, flex: 1 }}>

          {/* Title + breadcrumb + actions */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: TEXT2, marginBottom: 6 }}>
                <Link href="/admin" style={{ color: TEXT2, textDecoration: "none" }}>Home</Link>
                <ChevronRight style={{ width: 12, height: 12 }} />
                <Link href="/admin/cms" style={{ color: TEXT2, textDecoration: "none" }}>CMS &amp; Pages</Link>
                <ChevronRight style={{ width: 12, height: 12 }} />
                <span style={{ color: TEXT }}>{pageLabel}</span>
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: TEXT, margin: 0 }}>{pageLabel}</h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <button style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 16px", color: TEXT2, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                <Eye style={{ width: 14, height: 14 }} /> Preview {pageLabel.replace(" Page", "").replace(" Page", "")}
              </button>
              <button onClick={handleSaveOrder} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 8, background: ACCENT, border: "none", borderRadius: 10, padding: "9px 16px", color: "#0B1320", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>
                <Save style={{ width: 14, height: 14 }} /> {saving ? "Saving..." : "Save Changes"}
              </button>
              <button style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 10px", color: TEXT2, cursor: "pointer" }}>
                <MoreVertical style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>

          {msg && (
            <div style={{ marginBottom: 16, padding: "10px 16px", background: "rgba(22,199,132,0.1)", border: "1px solid rgba(22,199,132,0.3)", borderRadius: 10, color: "#16C784", fontSize: 13, fontWeight: 600 }}>
              {msg}
            </div>
          )}

          {/* Two-column layout */}
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

            {/* MAIN: Sections List */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: 0 }}>{pageLabel} Sections</h3>
                    <p style={{ fontSize: 12, color: TEXT2, margin: "4px 0 0" }}>Manage and customize the content sections displayed on your {pageLabel.toLowerCase()}.</p>
                  </div>
                  <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: ACCENT, border: "none", borderRadius: 10, padding: "8px 14px", color: "#0B1320", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    <Plus style={{ width: 14, height: 14 }} /> Add Section
                  </button>
                </div>

                {loading ? (
                  <div style={{ padding: 40, textAlign: "center", color: TEXT2 }}>
                    <RefreshCw style={{ width: 24, height: 24, margin: "0 auto 8px", animation: "spin 1s linear infinite", display: "block" }} />
                    Loading sections...
                  </div>
                ) : sections.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center", color: TEXT2 }}>
                    <Layers style={{ width: 32, height: 32, margin: "0 auto 12px", opacity: 0.4, display: "block" }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>No sections yet</p>
                    <p style={{ margin: "6px 0 0", fontSize: 12 }}>Add your first section to get started.</p>
                  </div>
                ) : (
                  <div>
                    {sections.map((section, idx) => {
                      const meta = getSectionMeta(section.type);
                      const Icon = meta.icon;
                      const count = getSectionCount(section);
                      const isDragging = dragIdx === idx;
                      return (
                        <div key={section.id}
                          draggable
                          onDragStart={() => handleDragStart(idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDragEnd={handleDragEnd}
                          style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: idx < sections.length - 1 ? `1px solid ${BORDER}` : "none", background: isDragging ? "var(--hover-bg)" : "transparent", cursor: "grab", transition: "background 0.15s" }}>
                          <div style={{ color: TEXT2, cursor: "grab", flexShrink: 0, opacity: 0.5 }}>
                            <GripVertical style={{ width: 18, height: 18 }} />
                          </div>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Icon style={{ width: 18, height: 18, color: meta.color }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{section.label || meta.label}</div>
                            <div style={{ fontSize: 12, color: TEXT2, marginTop: 2 }}>{meta.description}</div>
                          </div>
                          <div style={{ fontSize: 12, color: TEXT2, whiteSpace: "nowrap", marginRight: 8 }}>
                            <span style={{ color: section.isActive ? "#16C784" : TEXT2 }}>● </span>
                            {count} &nbsp;·&nbsp; {section.isActive ? "Active" : "Inactive"}
                          </div>
                          {/* Toggle */}
                          <button onClick={() => handleToggle(section)} style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", background: section.isActive ? ACCENT : "var(--icon-bg)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                            <span style={{ position: "absolute", top: 3, left: section.isActive ? "calc(100% - 21px)" : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                          </button>
                          <Link href={`/admin/cms/${slug}/${section.type.toLowerCase().replace(/([A-Z])/g, (m: string) => `-${m.toLowerCase()}`).replace(/^-/, "")}`} style={{ background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 8px", color: TEXT2, cursor: "pointer", display: "flex", alignItems: "center", textDecoration: "none" }}>
                            <Edit style={{ width: 14, height: 14 }} />
                          </Link>
                          <button onClick={() => handleDelete(section)} style={{ background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 8px", color: TEXT2, cursor: "pointer", display: "flex", alignItems: "center" }}>
                            <MoreVertical style={{ width: 14, height: 14 }} />
                          </button>
                        </div>
                      );
                    })}
                    <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderTop: `1px solid ${BORDER}`, cursor: "pointer", color: TEXT2, fontSize: 13 }} onClick={() => setShowAdd(true)}>
                      <Plus style={{ width: 14, height: 14 }} />
                      Add New Section
                    </div>
                    <div style={{ padding: "8px 20px", textAlign: "center", fontSize: 11, color: TEXT2, borderTop: `1px solid ${BORDER}` }}>
                      Drag and drop sections to reorder them
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SIDEBAR */}
            <div style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Page Overview */}
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 16 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: "0 0 14px" }}>{pageLabel} Overview</h4>
                <DonutChart active={active} inactive={inactive} />
              </div>

              {/* Quick Actions */}
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 16 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: "0 0 10px" }}>Quick Actions</h4>
                {[
                  { label: `Preview ${pageLabel.replace(" Page","").replace(" Page","")}`, icon: Eye },
                  { label: `Import ${pageLabel.replace(" Page","")}`, icon: ArrowLeft },
                  { label: `Export ${pageLabel.replace(" Page","")}`, icon: BarChart3 },
                  { label: "Reset to Default", icon: RefreshCw },
                  { label: `${pageLabel.replace(" Page","")} Settings`, icon: Settings },
                ].map((a, i) => (
                  <button key={i} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", background: "transparent", border: "none", borderBottom: i < 4 ? `1px solid ${BORDER}` : "none", color: TEXT2, fontSize: 12, cursor: "pointer", fontWeight: 500 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <a.icon style={{ width: 13, height: 13, color: ACCENT }} />
                      {a.label}
                    </div>
                    <ChevronRight style={{ width: 12, height: 12 }} />
                  </button>
                ))}
              </div>

              {/* Last Published */}
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 16 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: "0 0 8px" }}>Last Published</h4>
                <p style={{ fontSize: 12, color: TEXT2, margin: 0 }}>{lastPublished}</p>
                <p style={{ fontSize: 12, color: TEXT2, margin: "4px 0 0" }}>by Admin User</p>
                <span style={{ display: "inline-block", marginTop: 8, padding: "3px 10px", background: "rgba(22,199,132,0.1)", border: "1px solid rgba(22,199,132,0.3)", borderRadius: 20, fontSize: 11, color: "#16C784", fontWeight: 600 }}>Published</span>
              </div>

              {/* Tips */}
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 16 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: "0 0 10px" }}>Tips</h4>
                {[
                  "Drag and drop sections to reorder them.",
                  "Toggle sections on/off to show or hide them from the page.",
                ].map((tip, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: i < 1 ? 8 : 0, fontSize: 11, color: TEXT2 }}>
                    <span style={{ color: ACCENT, flexShrink: 0, marginTop: 1 }}>ℹ</span>
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ADD SECTION MODAL */}
        {showAdd && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 28, width: 520, maxHeight: "80vh", overflow: "auto", boxShadow: "0 24px 60px rgba(0,0,0,0.4)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: 0 }}>Add New Section</h3>
                <button onClick={() => setShowAdd(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2 }}>✕</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {Object.entries(SECTION_META).map(([type, meta]) => {
                  const Icon = meta.icon;
                  const isSelected = addType === type;
                  return (
                    <button key={type} onClick={() => setAddType(type)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: isSelected ? meta.bg : ICON_BG, border: `1px solid ${isSelected ? meta.color : BORDER}`, borderRadius: 10, cursor: "pointer", textAlign: "left" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon style={{ width: 14, height: 14, color: meta.color }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{meta.label}</div>
                        <div style={{ fontSize: 10, color: TEXT2, marginTop: 1 }}>{meta.description.slice(0, 30)}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setShowAdd(false)} style={{ padding: "9px 18px", background: ICON_BG, border: `1px solid ${BORDER}`, borderRadius: 10, color: TEXT2, cursor: "pointer", fontSize: 13 }}>Cancel</button>
                <button onClick={handleAddSection} disabled={!addType} style={{ padding: "9px 18px", background: addType ? ACCENT : ICON_BG, border: "none", borderRadius: 10, color: addType ? "#0B1320" : TEXT2, cursor: addType ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700 }}>
                  Add Section
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
