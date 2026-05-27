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
import { resolveImageUrl } from "@/lib/utils";

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
  const BG = "#F5F6FA";
  const CARD = "#FFFFFF";
  const BORDER = "#E5E7EB";
  const TEXT = "#111827";
  const TEXT2 = "#4B5563";
  const TEXT3 = "#9CA3AF";
  const HOVER = "#F9FAFB";
  const HEADER_BG = "#FFFFFF";
  const ICON_BG = "#F9FAFB";
  const ACCENT = "#6366F1";

  const params = useParams();
  const slug = (params?.slug as string) || "home";
  const sectionKey = (params?.section as string) || "";
  const pageLabel = PAGE_LABELS[slug] || slug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
  const sectionLabel = SECTION_LABELS[sectionKey] || sectionKey.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");

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

      
  const inputStyle: React.CSSProperties = { width: "100%", background: ICON_BG, border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 12px", color: TEXT, fontSize: 13, outline: "none", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: TEXT2, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" };
  const cardStyle: React.CSSProperties = { background: CARD, border: "1px solid #E5E7EB", borderRadius: 14 };


  return (
    <div style={{ background: "#F5F6FA", minHeight: "100%", padding: 24 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <Link href={`/admin/cms/${slug}`} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, padding: "5px 12px", color: "#4B5563", fontSize: 12, textDecoration: "none" }}>
            <ArrowLeft style={{ width: 13, height: 13 }} /> Back to {pageLabel}
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>{sectionLabel}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: "#4B5563" }}>
              <span>CMS</span><span>›</span>
              <span>{pageLabel}</span><span>›</span>
              <span style={{ color: "#6366F1", fontWeight: 600 }}>{sectionLabel}</span>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "#6366F1", border: "none", padding: "9px 20px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: saving ? "not-allowed" : "pointer", borderRadius: 10, opacity: saving ? 0.7 : 1 }}>
            <Save style={{ width: 15, height: 15 }} /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {msg && (
        <div style={{ background: "#D1FAE5", border: "1px solid #A7F3D0", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#065F46", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle style={{ width: 16, height: 16 }} /> {msg}
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 60 }}>
          <div style={{ fontSize: 14, color: "#9CA3AF" }}>Loading section...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div style={{ gridColumn: "1 / 3" }}>
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "20px 24px 40px", marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #F3F4F6" }}>
                Section Content
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Section Title", key: "sectionTitle", placeholder: "e.g. Featured Products" },
                  { label: "Main Heading", key: "mainHeading", placeholder: "Main heading text" },
                  { label: "Description", key: "description", placeholder: "Optional description...", type: "textarea" },
                  { label: "Primary Button Text", key: "primaryBtnText", placeholder: "Shop Now" },
                  { label: "Primary Button Link", key: "primaryBtnLink", placeholder: "/shop" },
                  { label: "Secondary Button Text", key: "secondaryBtnText", placeholder: "Explore" },
                  { label: "Secondary Button Link", key: "secondaryBtnLink", placeholder: "/categories" },
                ].map(({ label, key, placeholder, type }) => (
                  <div key={key}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>{label}</label>
                    {type === "textarea" ? (
                      <textarea value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder} rows={3}
                        style={{ width: "100%", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "9px 12px", color: "#111827", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                    ) : (
                      <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder}
                        style={{ width: "100%", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "9px 12px", color: "#111827", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    )}
                  </div>
                ))}
                {/* Background Image */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Background Image</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input value={form.bgImage} onChange={e => setForm(f => ({ ...f, bgImage: e.target.value }))}
                      placeholder="https://... or upload below"
                      style={{ flex: 1, background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "9px 12px", color: "#111827", fontSize: 13, outline: "none" }} />
                    <label style={{ display: "flex", alignItems: "center", gap: 6, background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 8, padding: "9px 14px", color: "#4338CA", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                      <ImageIcon style={{ width: 14, height: 14 }} /> Upload
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleImageUpload(e, "bgImage")} />
                    </label>
                  </div>
                  {form.bgImage && (
                    <img src={form.bgImage} alt="bg preview" style={{ marginTop: 8, height: 80, borderRadius: 8, objectFit: "cover", border: "1px solid #E5E7EB" }} />
                  )}
                </div>
              </div>
            </div>

            {/* Slides Management for slider-type sections */}
            {!isItemsType && !isTextType && (
              <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>Slides / Banners ({slides.length})</h3>
                  <button onClick={() => { setEditingSlide({ title: "", subtitle: "", image: "", link: "", isActive: true }); setEditingSlideIdx(null); }}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: "#6366F1", border: "none", borderRadius: 8, padding: "7px 14px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    <Plus style={{ width: 13, height: 13 }} /> Add Slide
                  </button>
                </div>

                {editingSlide && (
                  <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: 16, marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{editingSlideIdx !== null ? "Edit Slide" : "New Slide"}</span>
                      <button onClick={() => setEditingSlide(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6B7280" }}>
                        <X style={{ width: 16, height: 16 }} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ marginBottom: 12 }}>
                      {[
                        { label: "Title", key: "title", placeholder: "Slide title" },
                        { label: "Subtitle", key: "subtitle", placeholder: "Optional subtitle" },
                        { label: "Link URL", key: "link", placeholder: "/shop" },
                        { label: "Button Text", key: "linkText", placeholder: "Shop Now" },
                      ].map(f => (
                        <div key={f.key}>
                          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 4 }}>{f.label}</label>
                          <input value={editingSlide[f.key] || ""} onChange={e => setEditingSlide((v: any) => ({ ...v, [f.key]: e.target.value }))}
                            placeholder={f.placeholder}
                            style={{ width: "100%", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 7, padding: "7px 10px", color: "#111827", fontSize: 12, outline: "none", boxSizing: "border-box" }} />
                        </div>
                      ))}
                      <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Image URL or Upload</label>
                        <div style={{ display: "flex", gap: 6 }}>
                          <input value={editingSlide.image || ""} onChange={e => setEditingSlide((v: any) => ({ ...v, image: e.target.value }))}
                            placeholder="https://..."
                            style={{ flex: 1, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 7, padding: "7px 10px", color: "#111827", fontSize: 12, outline: "none" }} />
                          <label style={{ display: "flex", alignItems: "center", gap: 4, background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 7, padding: "7px 10px", color: "#4338CA", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                            <ImageIcon style={{ width: 13, height: 13 }} /> Upload
                            <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleImageUpload(e, "image", editingSlideIdx ?? undefined)} />
                          </label>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button onClick={() => setEditingSlide(null)}
                        style={{ padding: "7px 16px", borderRadius: 7, border: "1px solid #E5E7EB", background: "#fff", color: "#374151", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        Cancel
                      </button>
                      <button onClick={() => {
                        if (editingSlideIdx !== null) {
                          const updated = [...slides]; updated[editingSlideIdx] = editingSlide;
                          setSlides(updated);
                        } else {
                          setSlides(s => [...s, { ...editingSlide, id: Date.now().toString() }]);
                        }
                        setEditingSlide(null); setEditingSlideIdx(null);
                      }}
                        style={{ padding: "7px 16px", borderRadius: 7, border: "none", background: "#6366F1", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        {editingSlideIdx !== null ? "Save" : "Add"}
                      </button>
                    </div>
                  </div>
                )}

                {slides.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 0", color: "#9CA3AF", fontSize: 13 }}>No slides yet. Click "Add Slide" to get started.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {slides.map((slide: any, idx: number) => (
                      <div key={slide.id || idx} style={{ display: "flex", alignItems: "center", gap: 12, background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px" }}>
                        {slide.image && (
                          <img src={resolveImageUrl(slide.image)} alt={slide.title} style={{ width: 64, height: 40, borderRadius: 6, objectFit: "cover", border: "1px solid #E5E7EB", flexShrink: 0 }} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>{slide.title || "Untitled"}</div>
                          {slide.subtitle && <div style={{ fontSize: 11, color: "#6B7280" }}>{slide.subtitle}</div>}
                        </div>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          <button onClick={() => { setEditingSlide({ ...slide }); setEditingSlideIdx(idx); }}
                            style={{ background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 7, padding: "5px 10px", color: "#4338CA", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                            Edit
                          </button>
                          <button onClick={() => setSlides(s => s.filter((_, i) => i !== idx))}
                            style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 7, padding: "5px 10px", color: "#DC2626", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Settings */}
          <div>
            {/* Visibility */}
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 14 }}>Visibility</h3>
              <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: "#374151" }}>Section Active</span>
                <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
              </label>
              <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Show On</div>
                {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([key, Icon]) => (
                  <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer" }}>
                    <input type="checkbox" checked={displaySettings[key]} onChange={e => setDisplaySettings(s => ({ ...s, [key]: e.target.checked }))} />
                    <Icon style={{ width: 14, height: 14, color: "#6B7280" }} />
                    <span style={{ fontSize: 13, color: "#374151", textTransform: "capitalize" }}>{key}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Slider Settings */}
            {!isItemsType && !isTextType && (
              <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 14 }}>Slider Settings</h3>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: "#374151" }}>Auto Slide</span>
                  <input type="checkbox" checked={autoSlide} onChange={e => setAutoSlide(e.target.checked)} />
                </label>
                {autoSlide && (
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Interval (seconds)</label>
                    <input type="number" value={slideInterval} min={1} max={30}
                      onChange={e => setSlideInterval(Number(e.target.value))}
                      style={{ width: "100%", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 12px", color: "#111827", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
