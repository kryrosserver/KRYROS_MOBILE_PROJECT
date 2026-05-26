"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Bell, Calendar, Sun, Moon, Menu, ChevronDown, ChevronRight,
  Plus, Edit, Trash2, Save, ArrowLeft, RefreshCw, X, ImageIcon,
  Monitor, Tablet, Smartphone, Eye, MoreVertical,
  GripVertical, CheckCircle, Settings, Layers,
} from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { resolveImageUrl } from "@/lib/utils";

const ACCENT = "#12D6C5";
const MOBILE_BASE = 750;
const DESKTOP_BASE = 1380;

const PAGE_LABELS: Record<string, string> = {
  home: "Home Page", shop: "Shop Page", "product-detail": "Product Detail",
  wholesale: "Wholesale Page", faq: "FAQ Page", "contact-us": "Contact Us",
  "get-now": "Get Now Page", "about-us": "About Us", "terms-conditions": "Terms & Conditions",
  "privacy-policy": "Privacy Policy", "refund-policy": "Refund Policy",
  "shipping-policy": "Shipping Policy", "how-it-works": "How It Works",
  cart: "Cart Page", checkout: "Checkout Page", "track-order": "Track Order",
  account: "My Account",
};

const SECTION_LABELS: Record<string, string> = {
  "hero-slider": "Hero Banner", "trust-badges": "Trust Badges", "categories-grid": "Categories",
  "flash-sale": "Flash Sale", "upgrade-banner": "Upgrade Banner", "promo-banners": "Promo Banners",
  "featured-products": "Featured Products", "best-selling": "Best Selling Products",
  "new-arrivals": "New Arrivals", "brands": "Brands", "testimonials": "Testimonials",
  "newsletter": "Newsletter", "custom-h-t-m-l": "Custom HTML", "category-promo": "Category Promo",
  "promo-banner": "Promotional Banner", "product-grid": "Product Grid",
  "members-banner": "Members Banner", "shop-filters": "Shop Filters",
  "related-products": "Related Products", "product-gallery": "Product Gallery",
  "wholesale-hero": "Wholesale Hero", "wholesale-features": "Wholesale Features",
  "f-a-q-accordion": "FAQ Accordion", "contact-form": "Contact Form",
  "get-now-hero": "Get Now Hero", "get-now-features": "Get Now Features",
  "page-hero": "Page Hero", "page-content": "Page Content",
};

async function compressImage(file: File, maxWidth = 1920, quality = 0.85): Promise<string> {
  const blobURL = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image(); i.onload = () => resolve(i); i.onerror = reject; i.src = blobURL;
  });
  const scale = Math.min(1, maxWidth / img.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d")!; ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(blobURL);
  return canvas.toDataURL(file.type.includes("png") ? "image/png" : "image/jpeg", quality);
}

export default function CMSSectionEditor() {
  const params = useParams();
  const slug = (params?.slug as string) || "home";
  const sectionKey = (params?.section as string) || "";
  const pageLabel = PAGE_LABELS[slug] || slug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
  const sectionLabel = SECTION_LABELS[sectionKey] || sectionKey.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");

  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const { isDark, toggleTheme } = useTheme();

  const [section, setSection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [displaySettings, setDisplaySettings] = useState({ desktop: true, tablet: true, mobile: true });
  const [autoSlide, setAutoSlide] = useState(true);
  const [slideInterval, setSlideInterval] = useState(5);
  const [slides, setSlides] = useState<any[]>([]);
  const [editingSlide, setEditingSlide] = useState<any | null>(null);
  const [editingSlideIdx, setEditingSlideIdx] = useState<number | null>(null);
  const [form, setForm] = useState({
    sectionTitle: "", mainHeading: "", description: "",
    primaryBtnText: "Shop Now", primaryBtnLink: "/shop",
    secondaryBtnText: "Explore Categories", secondaryBtnLink: "/categories",
    bgImage: "", items: [] as any[],
  });

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
      if (vw <= 599) { innerRef.current.style.width = "750px"; innerRef.current.style.transform = "none"; innerRef.current.style.transformOrigin = "top left"; if (outerRef.current) { outerRef.current.style.overflowX = "auto"; outerRef.current.style.height = "auto"; } return; } if (outerRef.current) outerRef.current.style.overflowX = "hidden"; const s = Math.min(1, vw / baseW);
      innerRef.current.style.width = `${baseW}px`;
      innerRef.current.style.transform = `scale(${s})`;
      innerRef.current.style.transformOrigin = "top left";
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(s)));
    }
    recalc(); const t = setTimeout(recalc, 400);
    window.addEventListener("resize", recalc);
    return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, [section, slides, editingSlide]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/cms/pages/${slug}/sections`, { cache: "no-store" });
      if (res.ok) {
        const allSections = await res.json();
        const typeKey = sectionKey.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        const match = Array.isArray(allSections)
          ? allSections.find((s: any) =>
              s.type?.toLowerCase() === typeKey.toLowerCase() ||
              s.type?.toLowerCase().replace(/([A-Z])/g, "-$1").toLowerCase() === sectionKey
            )
          : null;
        if (match) {
          setSection(match);
          setIsActive(match.isActive ?? true);
          const cfg = match.config || {};
          setForm(prev => ({
            ...prev,
            sectionTitle: cfg.sectionTitle || sectionLabel,
            mainHeading: cfg.mainHeading || cfg.heading || "",
            description: cfg.description || cfg.subtitle || "",
            primaryBtnText: cfg.primaryBtnText || cfg.ctaText || "Shop Now",
            primaryBtnLink: cfg.primaryBtnLink || cfg.ctaLink || "/shop",
            secondaryBtnText: cfg.secondaryBtnText || "Explore Categories",
            secondaryBtnLink: cfg.secondaryBtnLink || "/categories",
            bgImage: cfg.bgImage || cfg.image || "",
            items: cfg.items || [],
          }));
          if (cfg.autoSlide !== undefined) setAutoSlide(cfg.autoSlide);
          if (cfg.slideInterval) setSlideInterval(cfg.slideInterval);
          if (cfg.display) setDisplaySettings(cfg.display);

          // For hero-slider: always load from cms_banners (the real source of truth)
          if (sectionKey === "hero-slider") {
            try {
              const bannerRes = await fetch("/internal/cms/banners/manage", { cache: "no-store", credentials: "same-origin" });
              if (bannerRes.ok) {
                const bannerData = await bannerRes.json();
                const list = Array.isArray(bannerData) ? bannerData : (bannerData?.banners ?? []);
                setSlides(list);
              } else {
                // Fallback to section config slides
                if (cfg.slides?.length) setSlides(cfg.slides);
                else if (cfg.banners?.length) setSlides(cfg.banners);
                else setSlides([]);
              }
            } catch {
              if (cfg.slides?.length) setSlides(cfg.slides);
              else if (cfg.banners?.length) setSlides(cfg.banners);
              else setSlides([]);
            }
          } else {
            if (cfg.slides?.length) setSlides(cfg.slides);
            else if (cfg.banners?.length) setSlides(cfg.banners);
            else setSlides([]);
          }
        } else {
          setSection({ id: null, type: sectionKey, label: sectionLabel, isActive: true, config: {} });
          // Even with no section record, load cms_banners for hero-slider
          if (sectionKey === "hero-slider") {
            try {
              const bannerRes = await fetch("/internal/cms/banners/manage", { cache: "no-store", credentials: "same-origin" });
              if (bannerRes.ok) {
                const bannerData = await bannerRes.json();
                const list = Array.isArray(bannerData) ? bannerData : (bannerData?.banners ?? []);
                setSlides(list);
              } else setSlides([]);
            } catch { setSlides([]); }
          } else {
            setSlides([]);
          }
        }
      }
    } catch {
      setSection({ id: null, type: sectionKey, label: sectionLabel, isActive: true, config: {} });
      setSlides([]);
    } finally { setLoading(false); }
  }, [slug, sectionKey, sectionLabel]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const config = { ...form, slides, autoSlide, slideInterval, display: displaySettings, isActive };
      if (section?.id) {
        const endpoint = slug === "home"
          ? `/api/admin/cms/homepage-sections/${section.id}`
          : `/api/admin/cms/sections/${section.id}`;
        await fetch(endpoint, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ config, isActive }),
        });
      }
      // For hero-slider: also push slide active-status changes back to cms_banners
      if (sectionKey === "hero-slider") {
        await Promise.allSettled(
          slides
            .filter((s: any) => s.id && !String(s.id).startsWith("slide-"))
            .map((s: any) =>
              fetch(`/internal/cms/banners/${s.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ isActive: s.isActive }),
              })
            )
        );
      }
      setMsg("Changes saved successfully!");
      setTimeout(() => setMsg(null), 3000);
    } finally { setSaving(false); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string, slideIdx?: number) => {
    const file = e.target.files?.[0]; if (!file) return;
    const compressed = await compressImage(file);
    if (slideIdx !== undefined) {
      setSlides(prev => prev.map((s, i) => i === slideIdx ? { ...s, image: compressed } : s));
    } else {
      setForm(prev => ({ ...prev, [key]: compressed }));
    }
  };

  const addSlide = () => {
    const newSlide = { id: `slide-${Date.now()}`, title: "New Slide", heading: "Your Heading Here", description: "Slide description", image: "", ctaText: "Shop Now", ctaLink: "/shop", ctaText2: "Explore", ctaLink2: "/categories", isActive: true, updatedAt: new Date().toISOString() };
    setSlides(prev => [...prev, newSlide]);
    setEditingSlide({ ...newSlide });
    setEditingSlideIdx(slides.length);
  };

  const updateSlide = (idx: number, updates: any) => setSlides(prev => prev.map((s, i) => i === idx ? { ...s, ...updates } : s));
  const deleteSlide = (idx: number) => {
    const slide = slides[idx];
    setSlides(prev => prev.filter((_, i) => i !== idx));
    if (editingSlideIdx === idx) { setEditingSlide(null); setEditingSlideIdx(null); }
    // For hero-slider: delete from cms_banners
    if (sectionKey === "hero-slider" && slide?.id && !String(slide.id).startsWith("slide-")) {
      if (confirm("Delete this banner permanently?")) {
        fetch(`/internal/cms/banners/${slide.id}`, { method: "DELETE", credentials: "same-origin" }).catch(() => {});
      }
    }
  };
  const openEditSlide = (s: any, idx: number) => { setEditingSlide({ ...s }); setEditingSlideIdx(idx); };
  const saveSlideEdit = async () => {
    if (editingSlideIdx !== null && editingSlide) {
      updateSlide(editingSlideIdx, editingSlide);
      // For hero-slider: persist changes directly to cms_banners
      if (sectionKey === "hero-slider" && editingSlide.id && !String(editingSlide.id).startsWith("slide-")) {
        const payload: any = {
          title: editingSlide.title ?? editingSlide.heading ?? "",
          subtitle: editingSlide.subtitle ?? editingSlide.description ?? "",
          image: editingSlide.image ?? "",
          link: editingSlide.ctaLink ?? editingSlide.link ?? "",
          linkText: editingSlide.ctaText ?? editingSlide.linkText ?? "Shop Now",
          isActive: editingSlide.isActive ?? true,
        };
        fetch(`/internal/cms/banners/${editingSlide.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(payload),
        }).catch(() => {});
      }
    }
    setEditingSlide(null);
    setEditingSlideIdx(null);
  };

  const isSlidesType = ["hero-slider", "promo-banners", "dual-banner-section"].includes(sectionKey);
  const isItemsType = ["trust-badges", "wholesale-features", "get-now-features"].includes(sectionKey);
  const isTextType = ["page-content", "text-block", "custom-h-t-m-l"].includes(sectionKey);

  const TEXT = "var(--text-primary)"; const TEXT2 = "var(--text-secondary)";
  const CARD = "var(--card-bg)"; const BORDER = "var(--card-border)";
  const BG = "var(--bg-primary)"; const HEADER_BG = "var(--bg-secondary)";
  const ICON_BG = "var(--icon-bg)";

  const inputStyle: React.CSSProperties = { width: "100%", background: ICON_BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 12px", color: TEXT, fontSize: 13, outline: "none", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: TEXT2, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" };
  const cardStyle: React.CSSProperties = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14 };

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: BG, margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: BG, color: TEXT, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* TOP HEADER */}
        <header style={{ background: HEADER_BG, borderBottom: `1px solid ${BORDER}`, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", gap: 16, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>
              <Menu style={{ width: 20, height: 20 }} />
            </button>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: TEXT, whiteSpace: "nowrap", margin: 0 }}>Edit {sectionLabel}</h1>
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
              <Calendar style={{ width: 14, height: 14 }} /> May 20 – May 26, 2025 <ChevronDown style={{ width: 13, height: 13 }} />
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
                <Link href={`/admin/cms/${slug}`} style={{ color: TEXT2, textDecoration: "none" }}>{pageLabel}</Link>
                <ChevronRight style={{ width: 12, height: 12 }} />
                <span style={{ color: TEXT }}>Edit {sectionLabel}</span>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>Edit {sectionLabel}</h2>
              <p style={{ fontSize: 13, color: TEXT2, margin: "4px 0 0" }}>Customize the content and display settings for this section.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <Link
                href={`/admin/cms/${slug}`}
                style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 16px", color: TEXT2, fontSize: 13, cursor: "pointer", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
                <ArrowLeft style={{ width: 14, height: 14 }} /> Back to {pageLabel}
              </Link>
              <button
                onClick={handleSave}
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

          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: TEXT2 }}>
              <RefreshCw style={{ width: 28, height: 28, margin: "0 auto 12px", animation: "spin 1s linear infinite", display: "block" }} />
              Loading section data...
            </div>
          ) : (

            /* ── 2-COLUMN LAYOUT ── */
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

              {/* ── LEFT: Main Content Editor ── */}
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Section overview card */}
                <div style={{ ...cardStyle, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(18,214,197,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Layers style={{ width: 20, height: 20, color: ACCENT }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{sectionLabel}</div>
                    <div style={{ fontSize: 12, color: TEXT2, marginTop: 2 }}>
                      {isSlidesType ? `${slides.length} slide${slides.length !== 1 ? "s" : ""} configured` : isItemsType ? `${form.items.length} item${form.items.length !== 1 ? "s" : ""} configured` : "Content configured"}
                    </div>
                  </div>
                  <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: isActive ? "rgba(22,199,132,0.12)" : "rgba(239,68,68,0.1)", color: isActive ? "#16C784" : "#EF4444", border: `1px solid ${isActive ? "rgba(22,199,132,0.3)" : "rgba(239,68,68,0.3)"}` }}>
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Slides / Items / Content editor */}
                <div style={{ ...cardStyle, overflow: "hidden" }}>
                  <div style={{ padding: "14px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: HEADER_BG }}>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: 0 }}>
                        {isSlidesType ? "Slides" : isItemsType ? "Items" : isTextType ? "Content Editor" : "Section Data"}
                      </h3>
                      <p style={{ fontSize: 12, color: TEXT2, margin: "3px 0 0" }}>
                        {isSlidesType ? `Manage the slides displayed in the ${sectionLabel.toLowerCase()}` : isItemsType ? "Manage the items in this section" : "Edit the main content for this section"}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {sectionKey === "hero-slider" && (
                        <Link
                          href="/admin/cms/homepage/edit-hero-banner"
                          style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(18,214,197,0.1)", border: `1px solid ${ACCENT}`, borderRadius: 10, padding: "8px 14px", color: ACCENT, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                          <ImageIcon style={{ width: 13, height: 13 }} /> Manage Banners
                        </Link>
                      )}
                      {(isSlidesType || isItemsType) && (
                        <button
                          onClick={addSlide}
                          style={{ display: "flex", alignItems: "center", gap: 6, background: ACCENT, border: "none", borderRadius: 10, padding: "8px 14px", color: "#0B1320", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                          <Plus style={{ width: 13, height: 13 }} /> Add {isSlidesType ? "Slide" : "Item"}
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: 20 }}>
                    {sectionKey === "hero-slider" && (
                      <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 10, display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <svg style={{ width: 15, height: 15, color: "#3B82F6", flexShrink: 0, marginTop: 1 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 700, color: "#3B82F6", margin: "0 0 2px" }}>Hero banners loaded from your Banners library</p>
                          <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
                            Showing {slides.length} existing banner{slides.length !== 1 ? "s" : ""}. To add new banners or upload images, click <strong style={{ color: "var(--text-primary)" }}>"Manage Banners"</strong> in the top-right.
                          </p>
                        </div>
                      </div>
                    )}
                    {isTextType ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div>
                          <label style={labelStyle}>Section Title</label>
                          <input value={form.sectionTitle} onChange={e => setForm(p => ({ ...p, sectionTitle: e.target.value }))} style={inputStyle} placeholder="Section title..." />
                        </div>
                        <div>
                          <label style={labelStyle}>HTML Content</label>
                          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            style={{ ...inputStyle, minHeight: 280, resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
                            placeholder="Enter your HTML content here..." />
                        </div>
                      </div>
                    ) : (isSlidesType || isItemsType) ? (
                      slides.length === 0 ? (
                        <div style={{ textAlign: "center", padding: 60, color: TEXT2 }}>
                          <Layers style={{ width: 40, height: 40, margin: "0 auto 14px", opacity: 0.3, display: "block" }} />
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: TEXT }}>No {isSlidesType ? "slides" : "items"} yet</p>
                          <p style={{ margin: "6px 0 16px", fontSize: 13 }}>Click "Add {isSlidesType ? "Slide" : "Item"}" to get started.</p>
                          <button onClick={addSlide} style={{ padding: "9px 20px", background: ACCENT, border: "none", borderRadius: 10, color: "#0B1320", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                            + Add {isSlidesType ? "Slide" : "Item"}
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {slides.map((slide, idx) => (
                            <div key={slide.id || idx} style={{ border: `1px solid ${editingSlideIdx === idx ? ACCENT : BORDER}`, borderRadius: 12, overflow: "hidden", background: editingSlideIdx === idx ? "rgba(18,214,197,0.04)" : "transparent" }}>

                              {/* Slide row */}
                              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
                                <span style={{ width: 28, height: 28, borderRadius: 8, background: ICON_BG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: TEXT2, flexShrink: 0 }}>
                                  {String(idx + 1).padStart(2, "0")}
                                </span>
                                {slide.image ? (
                                  <img src={resolveImageUrl(slide.image)} alt="" style={{ width: 56, height: 40, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
                                ) : (
                                  <div style={{ width: 56, height: 40, borderRadius: 6, background: ICON_BG, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <ImageIcon style={{ width: 14, height: 14, color: TEXT2 }} />
                                  </div>
                                )}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {slide.heading || slide.title || `Slide ${idx + 1}`}
                                  </div>
                                  <div style={{ fontSize: 12, color: TEXT2, marginTop: 2 }}>
                                    {(slide.subtitle || slide.description) ? (slide.subtitle || slide.description).slice(0, 50) + ((slide.subtitle || slide.description).length > 50 ? "…" : "") : "No description"}
                                  </div>
                                </div>
                                <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: slide.isActive !== false ? "rgba(22,199,132,0.1)" : "rgba(239,68,68,0.1)", color: slide.isActive !== false ? "#16C784" : "#EF4444", border: `1px solid ${slide.isActive !== false ? "rgba(22,199,132,0.3)" : "rgba(239,68,68,0.3)"}`, flexShrink: 0 }}>
                                  {slide.isActive !== false ? "Active" : "Inactive"}
                                </span>
                                <button onClick={() => openEditSlide(slide, idx)} style={{ background: ICON_BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "7px 10px", color: TEXT2, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, whiteSpace: "nowrap" }}>
                                  <Edit style={{ width: 13, height: 13 }} /> Edit
                                </button>
                                <button onClick={() => deleteSlide(idx)} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "7px 8px", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center" }}>
                                  <Trash2 style={{ width: 13, height: 13 }} />
                                </button>
                              </div>

                              {/* Inline slide editor */}
                              {editingSlideIdx === idx && editingSlide && (
                                <div style={{ borderTop: `1px solid ${BORDER}`, padding: 16, display: "flex", flexDirection: "column", gap: 12, background: ICON_BG }}>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div>
                                      <label style={labelStyle}>Title (Small)</label>
                                      <input value={editingSlide.title || ""} onChange={e => setEditingSlide((p: any) => ({ ...p, title: e.target.value }))} style={inputStyle} placeholder="Welcome to Kryros" />
                                    </div>
                                    <div>
                                      <label style={labelStyle}>Main Heading</label>
                                      <input value={editingSlide.heading || ""} onChange={e => setEditingSlide((p: any) => ({ ...p, heading: e.target.value }))} style={inputStyle} placeholder="Discover the best..." />
                                    </div>
                                  </div>
                                  <div>
                                    <label style={labelStyle}>Description</label>
                                    <textarea value={editingSlide.description || ""} onChange={e => setEditingSlide((p: any) => ({ ...p, description: e.target.value }))} style={{ ...inputStyle, resize: "vertical", minHeight: 60 }} />
                                  </div>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
                                    <div>
                                      <label style={labelStyle}>CTA Text</label>
                                      <input value={editingSlide.ctaText || ""} onChange={e => setEditingSlide((p: any) => ({ ...p, ctaText: e.target.value }))} style={inputStyle} />
                                    </div>
                                    <div>
                                      <label style={labelStyle}>CTA Link</label>
                                      <input value={editingSlide.ctaLink || ""} onChange={e => setEditingSlide((p: any) => ({ ...p, ctaLink: e.target.value }))} style={inputStyle} />
                                    </div>
                                    <div>
                                      <label style={labelStyle}>CTA 2 Text</label>
                                      <input value={editingSlide.ctaText2 || ""} onChange={e => setEditingSlide((p: any) => ({ ...p, ctaText2: e.target.value }))} style={inputStyle} />
                                    </div>
                                    <div>
                                      <label style={labelStyle}>CTA 2 Link</label>
                                      <input value={editingSlide.ctaLink2 || ""} onChange={e => setEditingSlide((p: any) => ({ ...p, ctaLink2: e.target.value }))} style={inputStyle} />
                                    </div>
                                  </div>
                                  <div>
                                    <label style={labelStyle}>Slide Image</label>
                                    <div style={{ border: `2px dashed ${BORDER}`, borderRadius: 10, padding: 12, textAlign: "center", position: "relative", cursor: "pointer" }}>
                                      {editingSlide.image ? (
                                        <div style={{ position: "relative" }}>
                                          <img src={resolveImageUrl(editingSlide.image)} alt="" style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 6 }} />
                                          <button onClick={() => setEditingSlide((p: any) => ({ ...p, image: "" }))} style={{ position: "absolute", top: 4, right: 4, background: "#EF4444", border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", color: "#fff", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                                        </div>
                                      ) : (
                                        <>
                                          <ImageIcon style={{ width: 20, height: 20, color: TEXT2, margin: "0 auto 4px", display: "block" }} />
                                          <p style={{ fontSize: 12, color: TEXT2, margin: 0 }}>Click to upload image</p>
                                        </>
                                      )}
                                      <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; const c = await compressImage(f); setEditingSlide((p: any) => ({ ...p, image: c })); }} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
                                    </div>
                                  </div>
                                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                    <button onClick={() => { setEditingSlide(null); setEditingSlideIdx(null); }} style={{ padding: "8px 16px", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT2, cursor: "pointer", fontSize: 13 }}>Cancel</button>
                                    <button onClick={saveSlideEdit} style={{ padding: "8px 16px", background: ACCENT, border: "none", borderRadius: 8, color: "#0B1320", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Save Slide</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}

                          <div style={{ textAlign: "center", padding: "6px 0", fontSize: 12, color: TEXT2 }}>
                            Showing 1 to {slides.length} of {slides.length} {isSlidesType ? "slides" : "items"}
                          </div>
                        </div>
                      )
                    ) : (
                      /* Generic section — image + link + CTA */
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <div>
                          <label style={labelStyle}>Section Title (Small)</label>
                          <input value={form.sectionTitle} onChange={e => setForm(p => ({ ...p, sectionTitle: e.target.value }))} style={inputStyle} placeholder="Welcome to Kryros" />
                        </div>
                        <div>
                          <label style={labelStyle}>Main Heading</label>
                          <textarea value={form.mainHeading} onChange={e => setForm(p => ({ ...p, mainHeading: e.target.value }))} style={{ ...inputStyle, resize: "vertical", minHeight: 70 }} placeholder="Discover the best products..." />
                        </div>
                        <div>
                          <label style={labelStyle}>Description</label>
                          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ ...inputStyle, resize: "vertical", minHeight: 80 }} placeholder="Shop from a wide range..." />
                          <div style={{ fontSize: 10, color: TEXT2, marginTop: 4, textAlign: "right" }}>{form.description.length}/200</div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          <div>
                            <label style={labelStyle}>Primary Button Text</label>
                            <input value={form.primaryBtnText} onChange={e => setForm(p => ({ ...p, primaryBtnText: e.target.value }))} style={inputStyle} placeholder="Shop Now" />
                          </div>
                          <div>
                            <label style={labelStyle}>Primary Button Link</label>
                            <input value={form.primaryBtnLink} onChange={e => setForm(p => ({ ...p, primaryBtnLink: e.target.value }))} style={inputStyle} placeholder="/shop" />
                          </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          <div>
                            <label style={labelStyle}>Secondary Button Text</label>
                            <input value={form.secondaryBtnText} onChange={e => setForm(p => ({ ...p, secondaryBtnText: e.target.value }))} style={inputStyle} placeholder="Explore" />
                          </div>
                          <div>
                            <label style={labelStyle}>Secondary Button Link</label>
                            <input value={form.secondaryBtnLink} onChange={e => setForm(p => ({ ...p, secondaryBtnLink: e.target.value }))} style={inputStyle} placeholder="/categories" />
                          </div>
                        </div>
                        <div>
                          <label style={labelStyle}>Background / Banner Image</label>
                          <div style={{ border: `2px dashed ${BORDER}`, borderRadius: 10, padding: 16, textAlign: "center", position: "relative" }}>
                            {form.bgImage ? (
                              <div style={{ position: "relative" }}>
                                <img src={resolveImageUrl(form.bgImage)} alt="" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8 }} />
                                <button onClick={() => setForm(p => ({ ...p, bgImage: "" }))} style={{ position: "absolute", top: 6, right: 6, background: "#EF4444", border: "none", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", color: "#fff", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                              </div>
                            ) : (
                              <>
                                <ImageIcon style={{ width: 26, height: 26, color: TEXT2, margin: "0 auto 8px", display: "block" }} />
                                <p style={{ fontSize: 13, color: TEXT2, margin: "0 0 4px", fontWeight: 600 }}>Click to upload image</p>
                                <p style={{ fontSize: 11, color: TEXT2, margin: 0 }}>PNG, JPG, WebP up to 5MB</p>
                              </>
                            )}
                            <input type="file" accept="image/*" onChange={e => handleImageUpload(e, "bgImage")} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── RIGHT: Settings Panel ── */}
              <div style={{ width: 300, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}>

                {/* Live Preview */}
                <div style={{ ...cardStyle, overflow: "hidden" }}>
                  <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, background: HEADER_BG }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: 0 }}>Live Preview</h4>
                    <p style={{ fontSize: 11, color: TEXT2, margin: "3px 0 0" }}>How this section will look on the storefront.</p>
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ borderRadius: 8, overflow: "hidden", background: "#0B1320", aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      {(slides[0]?.image || form.bgImage) ? (
                        <>
                          <img src={resolveImageUrl(slides[0]?.image || form.bgImage)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} />
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.2))" }} />
                          <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
                            <p style={{ fontSize: 7, color: "rgba(255,255,255,0.7)", margin: "0 0 2px" }}>{form.sectionTitle || sectionLabel}</p>
                            <p style={{ fontSize: 9, fontWeight: 700, color: "#fff", margin: "0 0 4px", lineHeight: 1.2, maxWidth: 80 }}>{(slides[0]?.title || slides[0]?.heading || form.mainHeading || "Your Heading").slice(0, 30)}</p>
                            <div style={{ display: "flex", gap: 4 }}>
                              <span style={{ padding: "2px 5px", background: ACCENT, borderRadius: 3, fontSize: 6, color: "#0B1320", fontWeight: 700 }}>{form.primaryBtnText || "Shop Now"}</span>
                              <span style={{ padding: "2px 5px", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 3, fontSize: 6, color: "#fff" }}>{form.secondaryBtnText || "Explore"}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)" }}>
                          <Eye style={{ width: 20, height: 20, margin: "0 auto 6px", display: "block" }} />
                          <p style={{ fontSize: 10, margin: 0 }}>Add content to preview</p>
                        </div>
                      )}
                    </div>
                    {slides.length > 1 && (
                      <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 8 }}>
                        {slides.map((_, i) => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i === 0 ? ACCENT : BORDER }} />)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section Status */}
                <div style={{ ...cardStyle, padding: 16 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: "0 0 10px" }}>Section Status</h4>
                  <p style={{ fontSize: 12, color: TEXT2, margin: "0 0 12px" }}>Enable or disable this section on {pageLabel.toLowerCase()}.</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Visible on Page</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button
                        onClick={() => setIsActive(!isActive)}
                        style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", background: isActive ? ACCENT : ICON_BG, position: "relative", transition: "background 0.2s" }}>
                        <span style={{ position: "absolute", top: 3, left: isActive ? "calc(100% - 21px)" : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                      </button>
                      <span style={{ fontSize: 12, color: isActive ? "#16C784" : TEXT2, fontWeight: 600 }}>{isActive ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                </div>

                {/* Display Settings */}
                <div style={{ ...cardStyle, padding: 16 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: "0 0 6px" }}>Display Settings</h4>
                  <p style={{ fontSize: 11, color: TEXT2, margin: "0 0 14px" }}>Choose which devices show this section.</p>
                  {[
                    { key: "desktop", icon: Monitor, label: "Desktop" },
                    { key: "tablet",  icon: Tablet,  label: "Tablet" },
                    { key: "mobile",  icon: Smartphone, label: "Mobile" },
                  ].map(({ key, icon: Icon, label }) => (
                    <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: key !== "mobile" ? `1px solid ${BORDER}` : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Icon style={{ width: 15, height: 15, color: TEXT2 }} />
                        <span style={{ fontSize: 13, color: TEXT }}>{label}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={displaySettings[key as keyof typeof displaySettings]}
                        onChange={e => setDisplaySettings(p => ({ ...p, [key]: e.target.checked }))}
                        style={{ accentColor: ACCENT, width: 15, height: 15 }} />
                    </div>
                  ))}
                </div>

                {/* Additional Settings — slides only */}
                {isSlidesType && (
                  <div style={{ ...cardStyle, padding: 16 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: "0 0 14px" }}>Slider Settings</h4>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Auto Slide</span>
                        <p style={{ fontSize: 11, color: TEXT2, margin: "2px 0 0" }}>Auto-advance slides</p>
                      </div>
                      <button
                        onClick={() => setAutoSlide(!autoSlide)}
                        style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", background: autoSlide ? ACCENT : ICON_BG, position: "relative", transition: "background 0.2s" }}>
                        <span style={{ position: "absolute", top: 3, left: autoSlide ? "calc(100% - 21px)" : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                      </button>
                    </div>
                    {autoSlide && (
                      <div>
                        <label style={labelStyle}>Interval (seconds)</label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={slideInterval}
                          onChange={e => setSlideInterval(Number(e.target.value))}
                          style={{ ...inputStyle, width: "100%" }} />
                      </div>
                    )}
                  </div>
                )}

                {/* Slides upload hint for slide-type sections */}
                {isSlidesType && (
                  <div style={{ ...cardStyle, padding: 16 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: "0 0 10px" }}>Quick Add</h4>
                    <button
                      onClick={addSlide}
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px", background: "rgba(18,214,197,0.08)", border: `1px dashed ${ACCENT}`, borderRadius: 10, color: ACCENT, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      <Plus style={{ width: 14, height: 14 }} /> Add New Slide
                    </button>
                    {slides.length > 0 && (
                      <p style={{ fontSize: 11, color: TEXT2, margin: "8px 0 0", textAlign: "center" }}>{slides.length} / 5 slides used</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
