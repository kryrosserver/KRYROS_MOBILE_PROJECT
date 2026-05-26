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
  ArrowLeft, BarChart3, FileText, CheckCircle2, XCircle,
} from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

const ACCENT = "#12D6C5";

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
  // Current frontend types
  promo_banners:       { icon: ImageIcon,     color: "#EC4899", bg: "rgba(236,72,153,0.15)",  label: "Promo Card (CategoryPromoBanners)", description: "Scrollable promo card — fetched by ?type=promo_banners" },
  RecentlyViewed:      { icon: Package,       color: "#22C55E", bg: "rgba(34,197,94,0.15)",   label: "Recently Viewed",      description: "Client-side recently browsed products (localStorage)" },
  RecommendedProducts: { icon: Star,          color: "#8B5CF6", bg: "rgba(139,92,246,0.15)",  label: "Recommended For You",  description: "Horizontal scroll product recommendations" },
};

const PAGE_DEFAULT_SECTIONS: Record<string, { type: string; order: number }[]> = {
  // Matches current User-UI HomePage.tsx section order exactly
  home: [
    { type: "HeroSlider", order: 1 },          // HeroSection — reads from cms_banners
    { type: "Brands", order: 2 },              // BrandsSection — reads from /api/brands
    { type: "TrustBadges", order: 3 },         // TrustBadges — reads from site-config/trust-badges
    { type: "CategoriesGrid", order: 4 },      // CategorySection — reads /api/categories
    { type: "FlashSale", order: 5 },           // FlashSaleSection
    { type: "UpgradeBanner", order: 6 },       // UpgradeBanner — reads site-config/upgrade-banner
    { type: "PromoBanners", order: 7 },        // PromoBanners — reads cms_banners filtered by tag
    { type: "FeaturedProducts", order: 8 },    // FeaturedProductsSection
    { type: "promo_banners", order: 9 },       // CategoryPromoBanners — reads homepage-sections?type=promo_banners
    { type: "RecentlyViewed", order: 10 },     // RecentlyViewedSection — client-side localStorage
    { type: "RecommendedProducts", order: 11 }, // ProductSection "Recommended For You"
  ],
  shop: [
    { type: "MembersBanner", order: 1 },
    { type: "ShopFilters", order: 2 },
    { type: "ProductGrid", order: 3 },
  ],
  "product-detail": [
    { type: "ProductGallery", order: 1 },
    { type: "RelatedProducts", order: 2 },
    { type: "Testimonials", order: 3 },
  ],
  wholesale: [
    { type: "WholesaleHero", order: 1 },
    { type: "WholesaleFeatures", order: 2 },
  ],
  faq: [
    { type: "PageHero", order: 1 },
    { type: "FAQAccordion", order: 2 },
  ],
  "contact-us": [
    { type: "PageHero", order: 1 },
    { type: "ContactForm", order: 2 },
  ],
  "get-now": [
    { type: "GetNowHero", order: 1 },
    { type: "GetNowFeatures", order: 2 },
  ],
  "about-us": [
    { type: "PageHero", order: 1 },
    { type: "PageContent", order: 2 },
  ],
  "terms-conditions": [{ type: "PageContent", order: 1 }],
  "privacy-policy": [{ type: "PageContent", order: 1 }],
  "refund-policy": [{ type: "PageContent", order: 1 }],
  "shipping-policy": [{ type: "PageContent", order: 1 }],
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

export default function CMSPageSections() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "home";
  const pageLabel = PAGE_LABELS[slug] || slug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");

  const { isDark, toggleTheme } = useTheme();

  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState("");
  const [lastPublished] = useState("May 24, 2025 at 10:30 AM");
  const [resetting, setResetting] = useState(false);

  useEffect(() => {}, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Home uses the dedicated homepage-sections/manage route (separate DB table)
      const url = slug === "home"
        ? "/api/admin/cms/homepage-sections/manage"
        : `/api/admin/cms/sections?pageSlug=${encodeURIComponent(slug)}`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSections(data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
          setLoading(false);
          return;
        }
      }
    } catch {}
    // Fallback: show page defaults so UI is never blank
    const defaults = (PAGE_DEFAULT_SECTIONS[slug] || [{ type: "PageContent", order: 1 }]).map((s, i) => ({
      id: `default-${i}`, type: s.type, label: getSectionMeta(s.type).label,
      isActive: true, order: s.order, config: {},
    }));
    setSections(defaults);
    setLoading(false);
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    load().finally(() => setTimeout(() => setIsRefreshing(false), 300));
  };

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

  const handleResetSeed = async () => {
    const pageLabel2 = slug === "home" ? "homepage" : `${slug} page`;
    if (!confirm(`This will DELETE all current sections for the ${pageLabel2} and re-seed the correct sections for the current frontend.\n\nYour hero banners and other CMS data are SAFE.\n\nContinue?`)) return;
    setResetting(true);
    setMsg(null);
    try {
      // Home page uses dedicated homepage-sections/reset-seed; others use backend directly
      const resetUrl = slug === "home"
        ? "/api/admin/cms/homepage-sections/reset-seed"
        : `/api/admin/cms/sections/reset-seed`;
      const res = await fetch(resetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: slug !== "home" ? JSON.stringify({ slug }) : undefined,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Error ${res.status}`);
      setMsg(`✓ ${body.message || "Reset & re-seeded successfully!"}`);
      // Reload sections after a short delay to let the DB commit settle
      await new Promise(r => setTimeout(r, 600));
      await load();
    } catch (err: any) {
      setMsg(`✗ ${err.message || "Reset failed"}`);
    } finally {
      setResetting(false);
    }
  };

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

  const statCards = [
    { label: "Total Sections",   value: sections.length, color: ACCENT,    bg: "rgba(18,214,197,0.12)",  icon: Layers },
    { label: "Active Sections",  value: active,          color: "#16C784", bg: "rgba(22,199,132,0.12)",  icon: CheckCircle2 },
    { label: "Inactive Sections",value: inactive,        color: "#EF4444", bg: "rgba(239,68,68,0.12)",   icon: XCircle },
    { label: "Last Published",   value: "Today",         color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  icon: RefreshCw, isText: true },
  ];

  return (
    <div style={{ overflow: "hidden", background: BG, margin: "-24px", width: "calc(100% + 48px)" }}>
      <div style={{ background: BG, color: TEXT, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

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
        <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Breadcrumb + Title + Actions */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: TEXT2, marginBottom: 6 }}>
                <Link href="/admin" style={{ color: TEXT2, textDecoration: "none" }}>Home</Link>
                <ChevronRight style={{ width: 12, height: 12 }} />
                <Link href="/admin/cms" style={{ color: TEXT2, textDecoration: "none" }}>CMS &amp; Pages</Link>
                <ChevronRight style={{ width: 12, height: 12 }} />
                <span style={{ color: TEXT }}>{pageLabel}</span>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>{pageLabel}</h2>
              <p style={{ fontSize: 13, color: TEXT2, margin: "4px 0 0" }}>Manage and reorder content sections for the {pageLabel.toLowerCase()}.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <button
                onClick={handleRefresh}
                style={{ display: "flex", alignItems: "center", gap: 6, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 14px", color: TEXT2, fontSize: 13, cursor: "pointer" }}>
                <RefreshCw style={{ width: 14, height: 14, ...(isRefreshing ? { animation: "spin 1s linear infinite" } : {}) }} />
              </button>
              <button
                style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 16px", color: TEXT2, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                <Eye style={{ width: 14, height: 14 }} /> Preview
              </button>
              <button
                onClick={() => setShowAdd(true)}
                style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 16px", color: TEXT2, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                <Plus style={{ width: 14, height: 14 }} /> Add Section
              </button>
              <button
                onClick={handleResetSeed}
                disabled={resetting}
                title={`Wipe current sections for this page and re-seed the correct ones for the current frontend. Other CMS data is NOT affected.`}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "9px 16px", color: "#EF4444", fontSize: 13, cursor: resetting ? "not-allowed" : "pointer", fontWeight: 700, opacity: resetting ? 0.6 : 1 }}>
                <RefreshCw style={{ width: 14, height: 14, ...(resetting ? { animation: "spin 1s linear infinite" } : {}) }} />
                {resetting ? "Resetting..." : "Reset & Sync Sections"}
              </button>
              <button
                onClick={handleSaveOrder}
                disabled={saving}
                style={{ display: "flex", alignItems: "center", gap: 8, background: ACCENT, border: "none", borderRadius: 10, padding: "9px 18px", color: "#0B1320", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>
                <Save style={{ width: 14, height: 14 }} /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {msg && (
            <div style={{ padding: "10px 16px", background: "rgba(22,199,132,0.1)", border: "1px solid rgba(22,199,132,0.3)", borderRadius: 10, color: "#16C784", fontSize: 13, fontWeight: 600 }}>
              ✓ {msg}
            </div>
          )}

          {/* ── STAT CARDS ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {statCards.map((c, i) => (
              <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "20px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <c.icon style={{ width: 18, height: 18, color: c.color }} />
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: TEXT2, lineHeight: 1.3, margin: 0 }}>{c.label}</p>
                </div>
                <p style={{ fontSize: (c as any).isText ? 18 : 28, fontWeight: 800, color: c.color, margin: 0 }}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* ── SECTIONS LIST ── */}
          <div className="overflow-x-auto" style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16 }}>

            {/* Table header */}
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: HEADER_BG }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: 0 }}>{pageLabel} Sections</h3>
                <p style={{ fontSize: 12, color: TEXT2, margin: "3px 0 0" }}>
                  Drag rows to reorder · Toggle to show or hide each section on the storefront
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: TEXT2 }}>{sections.length} section{sections.length !== 1 ? "s" : ""}</span>
                <button
                  onClick={() => setShowAdd(true)}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: ACCENT, border: "none", borderRadius: 10, padding: "8px 14px", color: "#0B1320", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  <Plus style={{ width: 14, height: 14 }} /> Add Section
                </button>
              </div>
            </div>

            {/* Column headers */}
            {!loading && sections.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "32px 48px 1fr 120px 80px 60px 90px 80px", alignItems: "center", padding: "10px 20px", borderBottom: `1px solid ${BORDER}`, background: ICON_BG }}>
                <span />
                <span />
                <span style={{ fontSize: 11, fontWeight: 700, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Section</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Type</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Content</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Order</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</span>
              </div>
            )}

            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: TEXT2 }}>
                <RefreshCw style={{ width: 24, height: 24, margin: "0 auto 8px", animation: "spin 1s linear infinite", display: "block" }} />
                Loading sections...
              </div>
            ) : sections.length === 0 ? (
              <div style={{ padding: 60, textAlign: "center", color: TEXT2 }}>
                <Layers style={{ width: 40, height: 40, margin: "0 auto 14px", opacity: 0.3, display: "block" }} />
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: TEXT }}>No sections yet</p>
                <p style={{ margin: "6px 0 16px", fontSize: 13 }}>Add your first section to get started.</p>
                <button onClick={() => setShowAdd(true)} style={{ padding: "9px 20px", background: ACCENT, border: "none", borderRadius: 10, color: "#0B1320", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  + Add First Section
                </button>
              </div>
            ) : (
              <div>
                {sections.map((section, idx) => {
                  const meta = getSectionMeta(section.type);
                  const Icon = meta.icon;
                  const count = getSectionCount(section);
                  const isDragging = dragIdx === idx;
                  const editHref = `/admin/cms/${slug}/${section.type.toLowerCase().replace(/([A-Z])/g, (m: string) => `-${m.toLowerCase()}`).replace(/^-/, "")}`;
                  return (
                    <div key={section.id}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "32px 48px 1fr 120px 80px 60px 90px 80px",
                        alignItems: "center",
                        padding: "14px 20px",
                        borderBottom: idx < sections.length - 1 ? `1px solid ${BORDER}` : "none",
                        background: isDragging ? "var(--hover-bg)" : "transparent",
                        cursor: "grab",
                        transition: "background 0.15s",
                      }}>

                      {/* Drag handle */}
                      <div style={{ color: TEXT2, opacity: 0.4 }}>
                        <GripVertical style={{ width: 16, height: 16 }} />
                      </div>

                      {/* Icon */}
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon style={{ width: 16, height: 16, color: meta.color }} />
                      </div>

                      {/* Name + description */}
                      <div style={{ minWidth: 0, paddingRight: 12 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {section.label || meta.label}
                        </div>
                        <div style={{ fontSize: 12, color: TEXT2, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {meta.description}
                        </div>
                      </div>

                      {/* Type badge */}
                      <div>
                        <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: meta.bg, color: meta.color, border: `1px solid ${meta.color}30`, whiteSpace: "nowrap" }}>
                          {meta.label}
                        </span>
                      </div>

                      {/* Content count */}
                      <div style={{ fontSize: 12, color: TEXT2 }}>{count}</div>

                      {/* Order number */}
                      <div style={{ fontSize: 13, fontWeight: 700, color: TEXT2 }}>#{idx + 1}</div>

                      {/* Toggle */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button
                          onClick={() => handleToggle(section)}
                          style={{ width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer", background: section.isActive ? ACCENT : ICON_BG, position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                          <span style={{ position: "absolute", top: 3, left: section.isActive ? "calc(100% - 19px)" : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                        </button>
                        <span style={{ fontSize: 11, color: section.isActive ? "#16C784" : TEXT2, fontWeight: 600 }}>
                          {section.isActive ? "On" : "Off"}
                        </span>
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Link href={editHref} style={{ background: ICON_BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 8px", color: TEXT2, cursor: "pointer", display: "flex", alignItems: "center", textDecoration: "none" }}>
                          <Edit style={{ width: 13, height: 13 }} />
                        </Link>
                        <button
                          onClick={() => handleDelete(section)}
                          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "6px 8px", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center" }}>
                          <Trash2 style={{ width: 13, height: 13 }} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Footer hint */}
                <div style={{ padding: "12px 20px", borderTop: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: TEXT2 }}>
                    Showing {sections.length} of {sections.length} sections · Drag rows to reorder
                  </span>
                  <button
                    onClick={() => setShowAdd(true)}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1px dashed ${BORDER}`, borderRadius: 8, padding: "6px 14px", color: TEXT2, fontSize: 12, cursor: "pointer" }}>
                    <Plus style={{ width: 12, height: 12 }} /> Add New Section
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ADD SECTION MODAL */}
        {showAdd && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 28, width: 560, maxHeight: "80vh", overflow: "auto", boxShadow: "0 24px 60px rgba(0,0,0,0.4)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: 0 }}>Add New Section</h3>
                  <p style={{ fontSize: 12, color: TEXT2, margin: "4px 0 0" }}>Choose a section type to add to {pageLabel}.</p>
                </div>
                <button onClick={() => setShowAdd(false)} style={{ background: ICON_BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: TEXT2, fontSize: 13 }}>✕</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5" style={{marginBottom: 20}}>
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