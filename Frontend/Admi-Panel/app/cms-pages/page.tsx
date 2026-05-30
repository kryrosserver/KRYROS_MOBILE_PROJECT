"use client";
import { useState, useEffect, useRef } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { useTheme } from "@/contexts/theme-context";
import {
  Layout, Edit, Trash2, Plus, Image as ImageIcon, RefreshCw,
  ChevronDown, ChevronRight, Eye, EyeOff, Check, X, Loader2,
  Globe, FileText, Home, ShoppingBag, User, HelpCircle, Shield,
  Layers, ToggleLeft, ToggleRight, Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getCmsPages, getCmsBanners, getCmsHomepageSections, getCmsSections,
  createCmsBanner, updateCmsBanner, deleteCmsBanner,
  updateCmsHomepageSection, createCmsHomepageSection, deleteCmsHomepageSection,
  updateCmsSection, createCmsSection, deleteCmsSection,
  seedAllCmsPages, resetSeedCmsHomepageSections, resetSeedCmsSections,
} from "@/lib/api";

// ── Page icon map ──────────────────────────────────────────
const PAGE_ICON: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  home: Home, shop: ShoppingBag, about: Globe, contact: FileText,
  faq: HelpCircle, help: HelpCircle, privacy: Shield, terms: Shield,
  refund: Shield, returns: Shield, shipping: Globe, security: Shield,
  wholesale: ShoppingBag, login: User, register: User,
};
function PageIcon({ slug, size = 14, color }: { slug: string; size?: number; color?: string }) {
  const Ic = PAGE_ICON[slug] || Layers;
  return <Ic size={size} color={color} />;
}

// ── Homepage section type labels ───────────────────────────
const HP_TYPE_LABELS: Record<string, string> = {
  HeroSlider: "Hero Banner Slider",
  Brands: "Brands Section",
  TrustBadges: "Trust Badges",
  CategorySection: "Category Section",
  FeaturedProducts: "Featured Products",
  FlashSale: "Flash Sale",
  PromoBanners: "Promo Banners",
  CategoryPromoBanners: "Category Promo Banners",
  ProductSection: "Products Section",
  RecentlyViewed: "Recently Viewed",
  UpgradeBanner: "Upgrade / Promo Banner",
  Newsletter: "Newsletter Section",
};

// ── Banner form fields ─────────────────────────────────────
const BANNER_FIELDS = [
  { key: "title",    label: "Title",       type: "text" },
  { key: "subtitle", label: "Subtitle",    type: "text" },
  { key: "image",    label: "Image URL",   type: "text" },
  { key: "link",     label: "Button Link", type: "text" },
  { key: "linkText", label: "Button Text", type: "text" },
  { key: "badge",    label: "Badge Text",  type: "text" },
  { key: "tag",      label: "Tag Label",   type: "text" },
];

// ── Section content fields per section name ────────────────
const SECTION_FIELDS: Record<string, Array<{ key: string; label: string; type: string }>> = {
  "Hero Banner": [
    { key: "title", label: "Banner Title", type: "text" },
    { key: "subtitle", label: "Subtitle", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "button_text", label: "Button Text", type: "text" },
    { key: "button_link", label: "Button Link", type: "text" },
    { key: "image", label: "Image URL", type: "text" },
  ],
  "Featured Products": [
    { key: "heading", label: "Section Heading", type: "text" },
    { key: "subheading", label: "Subheading", type: "text" },
    { key: "product_limit", label: "Products to Show", type: "text" },
  ],
  "Newsletter": [
    { key: "heading", label: "Heading", type: "text" },
    { key: "subheading", label: "Subheading", type: "text" },
    { key: "button_text", label: "Button Text", type: "text" },
  ],
  "Contact Form": [
    { key: "heading", label: "Section Heading", type: "text" },
    { key: "email", label: "Contact Email", type: "text" },
    { key: "phone", label: "Phone", type: "text" },
    { key: "address", label: "Address", type: "textarea" },
  ],
  "Company Story": [
    { key: "heading", label: "Heading", type: "text" },
    { key: "content", label: "Story Content", type: "textarea" },
    { key: "button_text", label: "Button Text", type: "text" },
    { key: "button_link", label: "Button Link", type: "text" },
  ],
  "Terms Text": [
    { key: "heading", label: "Heading", type: "text" },
    { key: "content", label: "Terms Content", type: "textarea" },
    { key: "last_updated", label: "Last Updated", type: "text" },
  ],
  "Policy Text": [
    { key: "heading", label: "Heading", type: "text" },
    { key: "content", label: "Policy Content", type: "textarea" },
    { key: "last_updated", label: "Last Updated", type: "text" },
  ],
};
const DEFAULT_SECTION_FIELDS = [
  { key: "heading", label: "Section Heading", type: "text" },
  { key: "subtitle", label: "Subtitle", type: "text" },
  { key: "content", label: "Content", type: "textarea" },
  { key: "button_text", label: "Button Text", type: "text" },
  { key: "button_link", label: "Button Link", type: "text" },
];

type FormData = Record<string, string>;

function CmsContent() {
  const { theme } = useTheme();
  const D          = theme === "dark";
  const bg         = D ? "#080E1A" : "#F1F5F9";
  const card       = D ? "#0D1523" : "#FFFFFF";
  const border     = D ? "#1E293B" : "#E2E8F0";
  const textMain   = D ? "#FFFFFF" : "#0F172A";
  const textMuted  = D ? "#8E9AAF" : "#64748B";
  const surface    = D ? "#101826" : "#F8FAFC";
  const inputBg    = D ? "#060D18" : "#F8FAFC";

  // ── State ──────────────────────────────────────────────────
  const [pages, setPages]               = useState<any[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("home");
  const [banners, setBanners]           = useState<any[]>([]);
  const [hpSections, setHpSections]     = useState<any[]>([]);
  const [pageSections, setPageSections] = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [seedingPages, setSeedingPages] = useState(false);

  // Banner edit modal
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [bannerForm, setBannerForm]       = useState<FormData>({});
  const [showBannerModal, setShowBannerModal] = useState(false);

  // Section edit modal
  const [editingSection, setEditingSection] = useState<any | null>(null);
  const [sectionForm, setSectionForm]       = useState<FormData>({});
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [modalSectionName, setModalSectionName] = useState("");

  // Expanded accordion sections
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["banners", "hp-sections"]));

  // ── Load on mount ──────────────────────────────────────────
  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (selectedSlug && selectedSlug !== "home") {
      loadPageSections(selectedSlug);
    }
  }, [selectedSlug]);

  async function loadAll() {
    setLoading(true);
    try {
      const [pagesRes, bannersRes, hpRes] = await Promise.all([
        getCmsPages().catch(() => ({ data: [] })),
        getCmsBanners().catch(() => ({ data: [] })),
        getCmsHomepageSections().catch(() => ({ data: [] })),
      ]);
      const pagesArr = Array.isArray(pagesRes.data) ? pagesRes.data
        : Array.isArray(pagesRes.data?.data) ? pagesRes.data.data : [];
      const bannersArr = Array.isArray(bannersRes.data) ? bannersRes.data
        : Array.isArray(bannersRes.data?.data) ? bannersRes.data.data : [];
      const hpArr = Array.isArray(hpRes.data) ? hpRes.data
        : Array.isArray(hpRes.data?.data) ? hpRes.data.data : [];
      setPages(pagesArr);
      setBanners(bannersArr);
      setHpSections(hpArr);
    } catch {
      toast.error("Failed to load CMS data");
    } finally {
      setLoading(false);
    }
  }

  async function loadPageSections(slug: string) {
    try {
      const res = await getCmsSections(slug).catch(() => ({ data: [] }));
      const arr = Array.isArray(res.data) ? res.data
        : Array.isArray(res.data?.data) ? res.data.data : [];
      setPageSections(arr);
    } catch {}
  }

  // ── Banner CRUD ────────────────────────────────────────────
  function openBannerEdit(banner: any) {
    setEditingBanner(banner);
    setBannerForm(banner || {});
    setShowBannerModal(true);
  }
  function openBannerCreate() {
    setEditingBanner(null);
    setBannerForm({ title: "", subtitle: "", image: "", link: "", linkText: "", badge: "", tag: "" });
    setShowBannerModal(true);
  }
  async function saveBanner() {
    setSaving(true);
    try {
      const payload: any = { ...bannerForm };
      if (editingBanner?.id) {
        await updateCmsBanner(editingBanner.id, payload);
        setBanners(prev => prev.map(b => b.id === editingBanner.id ? { ...b, ...payload } : b));
        toast.success("Banner updated!");
      } else {
        const res = await createCmsBanner({ ...payload, isActive: true });
        setBanners(prev => [...prev, res.data]);
        toast.success("Banner created!");
      }
      setShowBannerModal(false);
    } catch {
      toast.error("Failed to save banner");
    } finally {
      setSaving(false);
    }
  }
  async function deleteBannerById(id: string) {
    if (!confirm("Delete this banner?")) return;
    try {
      await deleteCmsBanner(id);
      setBanners(prev => prev.filter(b => b.id !== id));
      toast.success("Banner deleted");
    } catch {
      toast.error("Failed to delete banner");
    }
  }
  async function toggleBannerActive(banner: any) {
    try {
      await updateCmsBanner(banner.id, { isActive: !banner.isActive });
      setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, isActive: !b.isActive } : b));
    } catch {
      toast.error("Failed to update banner");
    }
  }

  // ── Homepage sections CRUD ────────────────────────────────
  async function toggleHpSection(sec: any) {
    try {
      await updateCmsHomepageSection(sec.id, { isActive: !sec.isActive });
      setHpSections(prev => prev.map(s => s.id === sec.id ? { ...s, isActive: !s.isActive } : s));
      toast.success(`${sec.type} ${!sec.isActive ? "enabled" : "disabled"}`);
    } catch {
      toast.error("Failed to update section");
    }
  }

  // ── Page sections CRUD ────────────────────────────────────
  function openSectionEdit(sec: any, sectionName: string) {
    setEditingSection(sec);
    setModalSectionName(sectionName);
    setSectionForm(sec ? { ...((sec.content || sec.config) || {}) } : {});
    setShowSectionModal(true);
  }
  function openSectionCreate(sectionName: string) {
    setEditingSection(null);
    setModalSectionName(sectionName);
    setSectionForm({});
    setShowSectionModal(true);
  }
  async function saveSection() {
    setSaving(true);
    try {
      const payload: any = { content: sectionForm, name: modalSectionName, pageSlug: selectedSlug, isActive: true };
      if (editingSection?.id) {
        await updateCmsSection(editingSection.id, payload);
        setPageSections(prev => prev.map(s => s.id === editingSection.id ? { ...s, content: sectionForm } : s));
        toast.success("Section updated!");
      } else {
        const res = await createCmsSection(payload);
        setPageSections(prev => [...prev, res.data]);
        toast.success("Section created!");
      }
      setShowSectionModal(false);
    } catch {
      toast.error("Failed to save section");
    } finally {
      setSaving(false);
    }
  }
  async function deleteSectionById(id: string) {
    if (!confirm("Delete this section?")) return;
    try {
      await deleteCmsSection(id);
      setPageSections(prev => prev.filter(s => s.id !== id));
      toast.success("Section deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }
  async function toggleSectionActive(sec: any) {
    try {
      await updateCmsSection(sec.id, { isActive: !sec.isActive });
      setPageSections(prev => prev.map(s => s.id === sec.id ? { ...s, isActive: !s.isActive } : s));
    } catch {}
  }

  // ── Seed / Reset ──────────────────────────────────────────
  async function handleSeedAllPages() {
    setSeedingPages(true);
    try {
      await seedAllCmsPages();
      await loadAll();
      toast.success("All pages seeded!");
    } catch {
      toast.error("Failed to seed pages");
    } finally {
      setSeedingPages(false);
    }
  }
  async function handleResetHomepageSections() {
    if (!confirm("This will wipe and re-seed homepage section configs. Your uploaded banners are safe. Continue?")) return;
    setSaving(true);
    try {
      await resetSeedCmsHomepageSections();
      const res = await getCmsHomepageSections();
      const arr = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
      setHpSections(arr);
      toast.success("Homepage sections re-seeded!");
    } catch {
      toast.error("Reset failed");
    } finally {
      setSaving(false);
    }
  }
  async function handleResetPageSections(slug: string) {
    if (!confirm(`Reset sections for "${slug}"? Old section data will be wiped and re-seeded. Continue?`)) return;
    setSaving(true);
    try {
      await resetSeedCmsSections(slug);
      await loadPageSections(slug);
      toast.success(`Sections for "${slug}" re-seeded!`);
    } catch {
      toast.error("Reset failed");
    } finally {
      setSaving(false);
    }
  }

  // ── Helper styles ──────────────────────────────────────────
  const cardSt = (extra?: React.CSSProperties): React.CSSProperties => ({
    background: card, border: `1px solid ${border}`, borderRadius: 12, ...extra,
  });
  const btnSm = (color = "#1FA89A", bg = "transparent"): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 5, padding: "5px 10px",
    borderRadius: 7, border: `1px solid ${color}`, background: bg,
    color, cursor: "pointer", fontSize: 11.5, fontWeight: 600,
  });

  // ── Accordion toggle ───────────────────────────────────────
  function toggleExpand(key: string) {
    setExpanded(prev => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  }

  // ── Group page sections by name ────────────────────────────
  const sectionGroups = pageSections.reduce((acc: Record<string, any[]>, s) => {
    const name = s.name || s.type || "Section";
    if (!acc[name]) acc[name] = [];
    acc[name].push(s);
    return acc;
  }, {});

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
        <Loader2 size={28} color="#1FA89A" style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ marginLeft: 12, color: textMuted }}>Loading CMS data…</span>
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  // ── Derived page list ──────────────────────────────────────
  const USER_UI_PAGES = [
    { slug: "home",            title: "Home" },
    { slug: "shop",            title: "Shop" },
    { slug: "about",           title: "About Us" },
    { slug: "contact",         title: "Contact" },
    { slug: "faq",             title: "FAQ" },
    { slug: "help",            title: "Help Center" },
    { slug: "wholesale",       title: "Wholesale" },
    { slug: "get-now",         title: "Get Now (BNPL)" },
    { slug: "track-order",     title: "Track Order" },
    { slug: "pickup-stations", title: "Pickup Stations" },
    { slug: "privacy",         title: "Privacy Policy" },
    { slug: "terms",           title: "Terms & Conditions" },
    { slug: "refund",          title: "Refund Policy" },
    { slug: "returns",         title: "Returns" },
    { slug: "shipping",        title: "Shipping Info" },
    { slug: "security",        title: "Security" },
    { slug: "login",           title: "Login" },
    { slug: "register",        title: "Register" },
  ];

  const displayPages = pages.length > 0
    ? pages.map(p => ({ slug: p.slug, title: p.title || p.slug }))
    : USER_UI_PAGES;

  const selectedPage = displayPages.find(p => p.slug === selectedSlug) || displayPages[0];

  return (
    <div style={{ display: "flex", height: "calc(100vh - 80px)", overflow: "hidden" }}>

      {/* ── LEFT SIDEBAR: Page List ── */}
      <div style={{ width: 230, flexShrink: 0, background: card, borderRight: `1px solid ${border}`, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 12px 10px", borderBottom: `1px solid ${border}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: textMuted, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 10 }}>Pages</div>
          <button
            onClick={handleSeedAllPages}
            disabled={seedingPages}
            style={{ display: "flex", alignItems: "center", gap: 5, width: "100%", padding: "7px 10px", borderRadius: 7, border: `1px solid #1FA89A`, background: "rgba(31,168,154,0.08)", color: "#1FA89A", cursor: "pointer", fontSize: 11, fontWeight: 600 }}
          >
            {seedingPages ? <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} /> : <RefreshCw size={11} />}
            Seed All Pages
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
          {displayPages.map(page => {
            const isSelected = page.slug === selectedSlug;
            return (
              <button
                key={page.slug}
                onClick={() => setSelectedSlug(page.slug)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%",
                  padding: "8px 10px", borderRadius: 8, marginBottom: 2,
                  border: "none", textAlign: "left", cursor: "pointer",
                  background: isSelected ? "rgba(31,168,154,0.12)" : "transparent",
                  color: isSelected ? "#1FA89A" : textMuted,
                  fontWeight: isSelected ? 600 : 400, fontSize: 12.5,
                }}
              >
                <PageIcon slug={page.slug} size={13} color={isSelected ? "#1FA89A" : textMuted} />
                {page.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN AREA: Sections ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: 20, background: bg }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: textMain, margin: 0 }}>
              <PageIcon slug={selectedSlug} size={16} color={textMain} />
              {" "}{selectedPage?.title || selectedSlug}
            </h2>
            <div style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>/{selectedSlug}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {selectedSlug === "home" && (
              <button onClick={handleResetHomepageSections} disabled={saving} style={btnSm("#f59e0b", "rgba(245,158,11,0.08)")}>
                <RefreshCw size={11} /> Reset Home Sections
              </button>
            )}
            {selectedSlug !== "home" && (
              <button onClick={() => handleResetPageSections(selectedSlug)} disabled={saving} style={btnSm("#6366f1", "rgba(99,102,241,0.08)")}>
                <RefreshCw size={11} /> Reset Sections
              </button>
            )}
            <button onClick={() => loadAll()} style={btnSm("#1FA89A", "rgba(31,168,154,0.08)")}>
              <RefreshCw size={11} /> Refresh
            </button>
          </div>
        </div>

        {/* ── HOME PAGE: Banners + HP Sections ── */}
        {selectedSlug === "home" && (
          <>
            {/* Hero Banners */}
            <div style={cardSt({ marginBottom: 14 })}>
              <button
                onClick={() => toggleExpand("banners")}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "transparent", border: "none", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(31,168,154,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ImageIcon size={14} color="#1FA89A" />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: textMain }}>Hero Banners</div>
                    <div style={{ fontSize: 11, color: textMuted }}>{banners.length} banner{banners.length !== 1 ? "s" : ""} · Slides in the hero carousel</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={e => { e.stopPropagation(); openBannerCreate(); }} style={btnSm("#1FA89A", "rgba(31,168,154,0.08)")}>
                    <Plus size={11} /> Add Banner
                  </button>
                  {expanded.has("banners") ? <ChevronDown size={16} color={textMuted} /> : <ChevronRight size={16} color={textMuted} />}
                </div>
              </button>
              {expanded.has("banners") && (
                <div style={{ borderTop: `1px solid ${border}`, padding: "12px 18px" }}>
                  {banners.length === 0 ? (
                    <div style={{ fontSize: 12, color: textMuted, textAlign: "center", padding: "20px 0" }}>No banners yet. Add your first banner above.</div>
                  ) : banners.map(b => (
                    <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${border}` }}>
                      {b.image ? (
                        <img src={b.image} alt={b.title} style={{ width: 64, height: 42, objectFit: "cover", borderRadius: 6, flexShrink: 0, border: `1px solid ${border}` }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div style={{ width: 64, height: 42, borderRadius: 6, background: surface, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${border}` }}>
                          <ImageIcon size={18} color={textMuted} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: textMain, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.title || "Untitled Banner"}</div>
                        {b.subtitle && <div style={{ fontSize: 11, color: textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.subtitle}</div>}
                        {b.link && <div style={{ fontSize: 10.5, color: "#1FA89A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.link}</div>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <button onClick={() => toggleBannerActive(b)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
                          {b.isActive ? <ToggleRight size={20} color="#1FA89A" /> : <ToggleLeft size={20} color={textMuted} />}
                        </button>
                        <button onClick={() => openBannerEdit(b)} style={btnSm("#6366f1")}>
                          <Edit size={10} /> Edit
                        </button>
                        <button onClick={() => deleteBannerById(b.id)} style={btnSm("#ef4444")}>
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Homepage Sections */}
            <div style={cardSt({ marginBottom: 14 })}>
              <button
                onClick={() => toggleExpand("hp-sections")}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "transparent", border: "none", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Layers size={14} color="#6366f1" />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: textMain }}>Homepage Sections</div>
                    <div style={{ fontSize: 11, color: textMuted }}>{hpSections.length} sections · Toggle visibility below</div>
                  </div>
                </div>
                {expanded.has("hp-sections") ? <ChevronDown size={16} color={textMuted} /> : <ChevronRight size={16} color={textMuted} />}
              </button>
              {expanded.has("hp-sections") && (
                <div style={{ borderTop: `1px solid ${border}`, padding: "12px 18px" }}>
                  {hpSections.length === 0 ? (
                    <div style={{ fontSize: 12, color: textMuted, textAlign: "center", padding: "20px 0" }}>
                      No sections seeded yet.{" "}
                      <button onClick={handleResetHomepageSections} style={{ background: "none", border: "none", color: "#1FA89A", cursor: "pointer", fontSize: 12 }}>Click here to seed them.</button>
                    </div>
                  ) : hpSections.sort((a, b) => (a.order || 0) - (b.order || 0)).map(sec => (
                    <div key={sec.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${border}` }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: sec.isActive ? "#1FA89A" : textMuted, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: textMain }}>{HP_TYPE_LABELS[sec.type] || sec.type || sec.title || "Section"}</div>
                        <div style={{ fontSize: 10.5, color: textMuted }}>Type: {sec.type} · Order: {sec.order ?? "–"}</div>
                      </div>
                      <span style={{
                        fontSize: 10.5, fontWeight: 600, padding: "2px 8px", borderRadius: 10,
                        background: sec.isActive ? "rgba(31,168,154,0.12)" : "rgba(100,116,139,0.12)",
                        color: sec.isActive ? "#1FA89A" : textMuted,
                      }}>{sec.isActive ? "Active" : "Hidden"}</span>
                      <button onClick={() => toggleHpSection(sec)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
                        {sec.isActive ? <ToggleRight size={20} color="#1FA89A" /> : <ToggleLeft size={20} color={textMuted} />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── OTHER PAGES: Page-specific sections ── */}
        {selectedSlug !== "home" && (
          <div style={cardSt()}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: textMain }}>Page Sections</div>
              <button onClick={() => openSectionCreate("Custom Section")} style={btnSm("#1FA89A", "rgba(31,168,154,0.08)")}>
                <Plus size={11} /> Add Section
              </button>
            </div>
            <div style={{ padding: "12px 18px" }}>
              {pageSections.length === 0 ? (
                <div style={{ fontSize: 12, color: textMuted, textAlign: "center", padding: "30px 0" }}>
                  No sections for this page yet.{" "}
                  <button onClick={() => handleResetPageSections(selectedSlug)} style={{ background: "none", border: "none", color: "#1FA89A", cursor: "pointer", fontSize: 12 }}>
                    Seed default sections
                  </button>
                </div>
              ) : Object.entries(sectionGroups).map(([groupName, items]) => (
                <div key={groupName} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: textMuted, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>{groupName}</div>
                  {(items as any[]).map(sec => (
                    <div key={sec.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: surface, borderRadius: 8, marginBottom: 6, border: `1px solid ${border}` }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: textMain }}>
                          {(sec.content || sec.config)?.heading || (sec.content || sec.config)?.title || groupName}
                        </div>
                        <div style={{ fontSize: 10.5, color: textMuted }}>Order: {sec.order ?? "–"} · {sec.isActive ? "Active" : "Hidden"}</div>
                      </div>
                      <button onClick={() => toggleSectionActive(sec)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                        {sec.isActive ? <ToggleRight size={18} color="#1FA89A" /> : <ToggleLeft size={18} color={textMuted} />}
                      </button>
                      <button onClick={() => openSectionEdit(sec, groupName)} style={btnSm("#6366f1")}>
                        <Edit size={10} /> Edit
                      </button>
                      <button onClick={() => deleteSectionById(sec.id)} style={btnSm("#ef4444")}>
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── BANNER EDIT MODAL ── */}
      {showBannerModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: card, borderRadius: 14, width: "100%", maxWidth: 520, maxHeight: "90vh", overflow: "auto", border: `1px solid ${border}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${border}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: textMain }}>{editingBanner ? "Edit Banner" : "Add New Banner"}</div>
              <button onClick={() => setShowBannerModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color={textMuted} /></button>
            </div>
            <div style={{ padding: "16px 20px" }}>
              {BANNER_FIELDS.map(f => (
                <div key={f.key} style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: textMuted, marginBottom: 5 }}>{f.label}</label>
                  <input
                    type="text"
                    value={bannerForm[f.key] || ""}
                    onChange={e => setBannerForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.label}
                    style={{ width: "100%", padding: "9px 12px", background: inputBg, border: `1px solid ${border}`, borderRadius: 8, color: textMain, fontSize: 13 }}
                  />
                </div>
              ))}
              {bannerForm.image && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: textMuted, marginBottom: 5 }}>Preview</div>
                  <img src={bannerForm.image} alt="preview" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, border: `1px solid ${border}` }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", padding: "14px 20px", borderTop: `1px solid ${border}` }}>
              <button onClick={() => setShowBannerModal(false)} style={btnSm(textMuted)}>Cancel</button>
              <button onClick={saveBanner} disabled={saving} style={{ ...btnSm("#fff", "#1FA89A"), border: "none" }}>
                {saving ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={12} />}
                {saving ? "Saving…" : "Save Banner"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION EDIT MODAL ── */}
      {showSectionModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: card, borderRadius: 14, width: "100%", maxWidth: 520, maxHeight: "90vh", overflow: "auto", border: `1px solid ${border}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${border}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: textMain }}>{editingSection ? "Edit" : "Add"} · {modalSectionName}</div>
              <button onClick={() => setShowSectionModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color={textMuted} /></button>
            </div>
            <div style={{ padding: "16px 20px" }}>
              {(SECTION_FIELDS[modalSectionName] || DEFAULT_SECTION_FIELDS).map(f => (
                <div key={f.key} style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: textMuted, marginBottom: 5 }}>{f.label}</label>
                  {f.type === "textarea" ? (
                    <textarea
                      value={sectionForm[f.key] || ""}
                      onChange={e => setSectionForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.label}
                      rows={4}
                      style={{ width: "100%", padding: "9px 12px", background: inputBg, border: `1px solid ${border}`, borderRadius: 8, color: textMain, fontSize: 13, resize: "vertical" }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={sectionForm[f.key] || ""}
                      onChange={e => setSectionForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.label}
                      style={{ width: "100%", padding: "9px 12px", background: inputBg, border: `1px solid ${border}`, borderRadius: 8, color: textMain, fontSize: 13 }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", padding: "14px 20px", borderTop: `1px solid ${border}` }}>
              <button onClick={() => setShowSectionModal(false)} style={btnSm(textMuted)}>Cancel</button>
              <button onClick={saveSection} disabled={saving} style={{ ...btnSm("#fff", "#1FA89A"), border: "none" }}>
                {saving ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={12} />}
                {saving ? "Saving…" : "Save Section"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        button { font-family: inherit; }
        input, textarea { font-family: inherit; outline: none; }
        input:focus, textarea:focus { border-color: #1FA89A !important; }
      `}</style>
    </div>
  );
}

export default function CmsPagesPage() {
  return (
    <AdminShell noPadding>
      <CmsContent />
    </AdminShell>
  );
}
