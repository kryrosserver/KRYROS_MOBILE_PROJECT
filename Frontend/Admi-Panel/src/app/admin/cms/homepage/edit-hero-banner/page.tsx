"use client";

import React, { useState, useEffect, useRef } from "react";
import { resolveImageUrl } from "@/lib/utils";
import Link from "next/link";
import {
  Plus, Trash2, Edit, GripVertical, Save, ArrowLeft,
  RefreshCw, X, Image as ImageIcon, Monitor, Tablet,
  Smartphone, HelpCircle, ExternalLink, MoreVertical,
  ChevronRight, Info, Sun, Moon, Check
} from "lucide-react";

async function compressImage(file: File, maxWidth = 1920, quality = 0.85): Promise<string> {
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
  return canvas.toDataURL(file.type.includes("png") ? "image/png" : "image/jpeg", quality);
}

const DEFAULT_FORM = {
  title: "",
  subtitle: "",
  tag: "",
  badge: "",
  mediaType: "image",
  image: "",
  videoUrl: "",
  link: "",
  linkText: "Shop Now",
  secondaryCta: "Explore Categories",
  secondaryCtaLink: "/categories",
  position: 0,
  isActive: true,
};

export default function EditHeroBannerPage() {
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSlide, setActiveSlide] = useState<any>(null);
  const [editingSlide, setEditingSlide] = useState<any>(null);
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [sectionStatus, setSectionStatus] = useState(true);
  const [displayDesktop, setDisplayDesktop] = useState(true);
  const [displayTablet, setDisplayTablet] = useState(true);
  const [displayMobile, setDisplayMobile] = useState(true);
  const [autoSlide, setAutoSlide] = useState(true);
  const [changeInterval, setChangeInterval] = useState(5);
  const [sectionTitle, setSectionTitle] = useState("Welcome to Kryros");
  const [sectionHeading, setSectionHeading] = useState("Discover the best products at unbeatable prices");
  const [sectionDesc, setSectionDesc] = useState("Shop from a wide range of premium products across multiple categories. Quality, affordability, and customer satisfaction – guaranteed.");
  const [primaryBtnText, setPrimaryBtnText] = useState("Shop Now");
  const [primaryBtnLink, setPrimaryBtnLink] = useState("/shop");
  const [secondaryBtnText, setSecondaryBtnText] = useState("Explore Categories");
  const [secondaryBtnLink, setSecondaryBtnLink] = useState("/categories");
  const [bannerImage, setBannerImage] = useState("");
  const [bannerImageName, setBannerImageName] = useState("hero-banner-1.jpg");
  const [bannerImageSize, setBannerImageSize] = useState("1920 x 800 px");
  const [charCount, setCharCount] = useState(0);
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

  const loadSlides = async () => {
    setLoading(true);
    try {
      const res = await fetch("/internal/cms/banners/manage", { cache: "no-store", credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        const arr = Array.isArray(data) ? data : data?.data || [];
        setSlides(arr);
        if (arr.length > 0 && !activeSlide) setActiveSlide(arr[0]);
      }
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { loadSlides(); }, []);

  const openEdit = (slide: any) => {
    setEditingSlide(slide);
    setForm({
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      tag: slide.tag || "",
      badge: slide.badge || "",
      mediaType: slide.mediaType || "image",
      image: slide.image || "",
      videoUrl: slide.videoUrl || "",
      link: slide.link || "",
      linkText: slide.linkText || "Shop Now",
      secondaryCta: slide.secondaryCta || "Explore Categories",
      secondaryCtaLink: slide.secondaryCtaLink || "/categories",
      position: slide.position || 0,
      isActive: slide.isActive ?? true,
    });
  };

  const openAdd = () => {
    setEditingSlide(null);
    setForm({ ...DEFAULT_FORM, position: slides.length });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = editingSlide ? "PUT" : "POST";
      const url = editingSlide ? `/internal/cms/banners/${editingSlide.id}` : "/internal/cms/banners";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "same-origin"
      });
      if (res.ok) {
        setEditingSlide(null);
        loadSlides();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this slide?")) return;
    await fetch(`/internal/cms/banners/${id}`, { method: "DELETE", credentials: "same-origin" });
    loadSlides();
  };

  const handleToggle = async (slide: any) => {
    await fetch(`/internal/cms/banners/${slide.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !slide.isActive }),
      credentials: "same-origin"
    });
    loadSlides();
  };

  const formatDate = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return `Updated ${d.toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })} at ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
  };

  const previewSlide = activeSlide || slides[0];

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
            <Link href="/admin/cms/homepage" className="hover:underline" style={{ color: "var(--text-muted)" }}>Home Page</Link>
            <span>/</span>
            <span style={{ color: "var(--text-primary)" }}>Edit Hero Banner</span>
          </div>
          <h1 className="text-2xl font-bold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>Edit Hero Banner</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/cms/homepage" className="btn-secondary h-10 px-4 flex items-center gap-2 text-sm">
            <ArrowLeft className="h-4 w-4" /> Back to Home Page
          </Link>
          <button className="btn-primary h-10 px-4 flex items-center gap-2 text-sm">
            <Save className="h-4 w-4" /> Save Changes
          </button>
          <button className="btn-secondary h-10 w-10 flex items-center justify-center p-0">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="flex flex-col xl:flex-row gap-6">

        {/* LEFT: Section Content */}
        <div className="xl:w-72 shrink-0 space-y-4">
          <div className="admin-card !p-0 overflow-hidden">
            {/* Tabs */}
            <div className="flex" style={{ borderBottom: "1px solid var(--card-border)" }}>
              {["Content", "Design"].map((tab, i) => (
                <button
                  key={tab}
                  className="flex-1 py-3 text-sm font-semibold transition-colors"
                  style={i === 0
                    ? { color: "#12D6C5", borderBottom: "2px solid #12D6C5" }
                    : { color: "var(--text-muted)", borderBottom: "2px solid transparent" }
                  }
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-sm font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>Section Content</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Update the content for the hero banner section.</p>
              </div>

              {/* Section Title Small */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Section Title (Small)</label>
                <input
                  value={sectionTitle}
                  onChange={e => setSectionTitle(e.target.value)}
                  className="admin-input w-full text-sm"
                  placeholder="Welcome to Kryros"
                />
              </div>

              {/* Main Heading */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Main Heading</label>
                <textarea
                  value={sectionHeading}
                  onChange={e => setSectionHeading(e.target.value)}
                  className="admin-input w-full text-sm resize-none"
                  rows={3}
                  placeholder="Discover the best products at unbeatable prices"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Description</label>
                <textarea
                  value={sectionDesc}
                  onChange={e => { setSectionDesc(e.target.value); setCharCount(e.target.value.length); }}
                  className="admin-input w-full text-sm resize-none"
                  rows={4}
                  maxLength={200}
                  placeholder="Shop from a wide range of premium products..."
                />
                <p className="text-right text-xs mt-1" style={{ color: "var(--text-muted)" }}>{charCount}/200</p>
              </div>

              {/* Primary Button */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Primary Button</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] mb-1" style={{ color: "var(--text-muted)" }}>Text</label>
                    <input value={primaryBtnText} onChange={e => setPrimaryBtnText(e.target.value)} className="admin-input w-full text-xs" placeholder="Shop Now" />
                  </div>
                  <div>
                    <label className="block text-[10px] mb-1" style={{ color: "var(--text-muted)" }}>Link</label>
                    <div className="relative">
                      <input value={primaryBtnLink} onChange={e => setPrimaryBtnLink(e.target.value)} className="admin-input w-full text-xs pr-7" placeholder="/shop" />
                      <ExternalLink className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3" style={{ color: "var(--text-muted)" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Button */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Secondary Button</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] mb-1" style={{ color: "var(--text-muted)" }}>Text</label>
                    <input value={secondaryBtnText} onChange={e => setSecondaryBtnText(e.target.value)} className="admin-input w-full text-xs" placeholder="Explore Categories" />
                  </div>
                  <div>
                    <label className="block text-[10px] mb-1" style={{ color: "var(--text-muted)" }}>Link</label>
                    <div className="relative">
                      <input value={secondaryBtnLink} onChange={e => setSecondaryBtnLink(e.target.value)} className="admin-input w-full text-xs pr-7" placeholder="/categories" />
                      <ExternalLink className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3" style={{ color: "var(--text-muted)" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Banner Image */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Banner Image / Slider</label>
                <div
                  className="rounded-xl p-3 flex items-center gap-3"
                  style={{ border: "1px solid var(--card-border)", background: "var(--bg-primary)" }}
                >
                  <div className="h-14 w-20 rounded-lg overflow-hidden shrink-0" style={{ background: "var(--icon-bg)" }}>
                    {bannerImage ? (
                      <img src={bannerImage} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-6 w-6" style={{ color: "var(--text-muted)" }} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{bannerImageName}</p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{bannerImageSize}</p>
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={async e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const base64 = await compressImage(file);
                        setBannerImage(base64);
                        setBannerImageName(file.name);
                        setBannerImageSize(`${Math.round(file.size / 1024)} KB`);
                      }}
                    />
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: "var(--icon-bg)", color: "#EF4444" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--icon-bg)"; }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </div>
                  </label>
                </div>

                {/* Add New Slide */}
                <button
                  onClick={openAdd}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors"
                  style={{ border: "1px dashed var(--card-border)", color: "var(--text-muted)" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#12D6C5"; e.currentTarget.style.color = "#12D6C5"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
                >
                  <Plus className="h-4 w-4" /> Add New Slide
                </button>
                <p className="text-center text-[10px] mt-1.5" style={{ color: "var(--text-muted)" }}>You can add up to 5 slides</p>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE: Slides Manager */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className="admin-card !p-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--card-border)" }}>
              <div>
                <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Slides</h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Manage hero banner slides.</p>
              </div>
              <button onClick={openAdd} className="btn-primary h-9 px-4 flex items-center gap-2 text-sm">
                <Plus className="h-4 w-4" /> Add Slide
              </button>
            </div>

            {/* Active Slide Preview */}
            {previewSlide && (
              <div className="p-4" style={{ borderBottom: "1px solid var(--card-border)" }}>
                <div className="relative rounded-2xl overflow-hidden" style={{ height: 280 }}>
                  {previewSlide.image ? (
                    <img src={resolveImageUrl(previewSlide.image)} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0B1320, #162035)" }}>
                      <div className="text-center px-8">
                        <p className="text-xs font-semibold mb-2" style={{ color: "#12D6C5" }}>{sectionTitle}</p>
                        <h3 className="text-2xl font-bold text-white mb-3">{sectionHeading}</h3>
                        <p className="text-sm text-white/60 mb-6 max-w-sm mx-auto">{sectionDesc}</p>
                        <div className="flex items-center justify-center gap-3">
                          <span className="px-5 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "#12D6C5" }}>{primaryBtnText}</span>
                          <span className="px-5 py-2 rounded-lg text-sm font-semibold text-white" style={{ border: "1px solid rgba(255,255,255,0.3)" }}>{secondaryBtnText}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Slide dots */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    {slides.slice(0, 5).map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveSlide(s)}
                        className="rounded-full transition-all"
                        style={{
                          width: activeSlide?.id === s.id ? 20 : 8,
                          height: 8,
                          background: activeSlide?.id === s.id ? "#12D6C5" : "rgba(255,255,255,0.5)",
                        }}
                      />
                    ))}
                  </div>
                  {/* Actions overlay */}
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <button className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
                      <GripVertical className="h-3.5 w-3.5 text-white" />
                    </button>
                    <button onClick={() => openEdit(previewSlide)} className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
                      <Edit className="h-3.5 w-3.5 text-white" />
                    </button>
                    <button onClick={() => handleDelete(previewSlide.id)} className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
                      <Trash2 className="h-3.5 w-3.5 text-white" />
                    </button>
                  </div>
                  {/* Slide number */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold text-white" style={{ background: "rgba(0,0,0,0.5)" }}>
                    {String(slides.indexOf(activeSlide) + 1).padStart(2, "0")}
                  </div>
                </div>
              </div>
            )}

            {/* Slides List */}
            <div>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: "1px solid var(--card-border)" }}>
                    <div className="h-14 w-20 rounded-xl animate-pulse shrink-0" style={{ background: "var(--icon-bg)" }} />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-40 rounded animate-pulse" style={{ background: "var(--icon-bg)" }} />
                      <div className="h-2 w-24 rounded animate-pulse" style={{ background: "var(--icon-bg)" }} />
                    </div>
                  </div>
                ))
              ) : slides.length === 0 ? (
                <div className="py-12 text-center">
                  <ImageIcon className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>No slides yet</p>
                  <button onClick={openAdd} className="mt-3 btn-primary text-sm h-9 px-4">Add First Slide</button>
                </div>
              ) : (
                slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className="flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors"
                    style={{
                      borderBottom: "1px solid var(--card-border)",
                      background: activeSlide?.id === slide.id ? "var(--nav-item-active-bg)" : "transparent"
                    }}
                    onClick={() => setActiveSlide(slide)}
                    onMouseEnter={e => { if (activeSlide?.id !== slide.id) e.currentTarget.style.background = "var(--hover-bg)"; }}
                    onMouseLeave={e => { if (activeSlide?.id !== slide.id) e.currentTarget.style.background = "transparent"; }}
                  >
                    {/* Slide number */}
                    <span className="text-sm font-bold shrink-0 w-6 text-center" style={{ color: "var(--text-muted)" }}>
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* Thumbnail */}
                    <div className="h-14 w-20 rounded-xl overflow-hidden shrink-0" style={{ background: "var(--icon-bg)" }}>
                      {slide.image ? (
                        <img src={resolveImageUrl(slide.image)} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                        {slide.title || "Untitled Slide"}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {slide.updatedAt ? formatDate(slide.updatedAt) : "Not yet saved"}
                      </p>
                    </div>

                    {/* Status badge */}
                    <span
                      className="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={slide.isActive
                        ? { background: "rgba(22,199,132,0.12)", color: "#16C784" }
                        : { background: "rgba(245,158,11,0.12)", color: "#F59E0B" }
                      }
                    >
                      {slide.isActive ? "Active" : "Inactive"}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => openEdit(slide)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "var(--hover-bg)"; e.currentTarget.style.color = "#12D6C5"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(slide.id)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#EF4444"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {slides.length > 0 && (
              <div className="px-5 py-3 text-xs" style={{ color: "var(--text-muted)", borderTop: "1px solid var(--card-border)" }}>
                Showing 1 to {slides.length} of {slides.length} slides
              </div>
            )}
          </div>

          {/* Edit Slide Form (inline) */}
          {editingSlide !== undefined && editingSlide !== null && (
            <div className="admin-card !p-0 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--card-border)" }}>
                <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {editingSlide ? "Edit Slide" : "Add New Slide"}
                </h3>
                <button onClick={() => setEditingSlide(null)} className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ color: "var(--text-muted)" }}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Title</label>
                    <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="admin-input w-full text-sm" placeholder="e.g. New Summer Collection" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Subtitle</label>
                    <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} className="admin-input w-full text-sm" placeholder="e.g. Up to 50% Off" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Button Text</label>
                    <input value={form.linkText} onChange={e => setForm(f => ({ ...f, linkText: e.target.value }))} className="admin-input w-full text-sm" placeholder="Shop Now" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Button Link</label>
                    <input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} className="admin-input w-full text-sm" placeholder="/shop" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Image URL</label>
                    <div className="flex gap-2">
                      <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} className="admin-input flex-1 text-sm" placeholder="https://..." />
                      <label className="cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={async e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const base64 = await compressImage(file);
                          setForm(f => ({ ...f, image: base64 }));
                        }} />
                        <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: "var(--icon-bg)", color: "var(--text-muted)" }}>
                          <ImageIcon className="h-4 w-4" />
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center gap-3">
                    <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Active</label>
                    <button
                      onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                      className="relative"
                      style={{ width: 40, height: 22 }}
                    >
                      <div className="absolute inset-0 rounded-full transition-all" style={{ background: form.isActive ? "#16C784" : "var(--icon-bg)" }} />
                      <div className="absolute top-0.5 rounded-full transition-all" style={{ width: 18, height: 18, background: "#fff", left: form.isActive ? "calc(100% - 20px)" : 2 }} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 h-10 text-sm">
                    {saving ? "Saving..." : editingSlide ? "Update Slide" : "Add Slide"}
                  </button>
                  <button onClick={() => setEditingSlide(null)} className="btn-secondary h-10 px-5 text-sm">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Add slide form (when editingSlide is null but user clicked Add) */}
          {editingSlide === null && form.title !== undefined && (
            <div className="admin-card !p-0 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--card-border)" }}>
                <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Add New Slide</h3>
                <button onClick={() => setEditingSlide(undefined as any)} className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ color: "var(--text-muted)" }}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Title</label>
                    <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="admin-input w-full text-sm" placeholder="e.g. New Summer Collection" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Subtitle</label>
                    <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} className="admin-input w-full text-sm" placeholder="e.g. Up to 50% Off" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Button Text</label>
                    <input value={form.linkText} onChange={e => setForm(f => ({ ...f, linkText: e.target.value }))} className="admin-input w-full text-sm" placeholder="Shop Now" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Button Link</label>
                    <input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} className="admin-input w-full text-sm" placeholder="/shop" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Image URL</label>
                    <div className="flex gap-2">
                      <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} className="admin-input flex-1 text-sm" placeholder="https://..." />
                      <label className="cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={async e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const base64 = await compressImage(file);
                          setForm(f => ({ ...f, image: base64 }));
                        }} />
                        <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: "var(--icon-bg)", color: "var(--text-muted)" }}>
                          <ImageIcon className="h-4 w-4" />
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 h-10 text-sm">
                    {saving ? "Saving..." : "Add Slide"}
                  </button>
                  <button onClick={() => setEditingSlide(undefined as any)} className="btn-secondary h-10 px-5 text-sm">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Live Preview + Settings */}
        <div className="xl:w-64 shrink-0 space-y-4">
          {/* Live Preview */}
          <div className="admin-card !p-5">
            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Live Preview</h3>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>See how this section looks on the homepage.</p>
            <div className="rounded-xl overflow-hidden" style={{ height: 120, background: "linear-gradient(135deg, #0B1320, #162035)" }}>
              {previewSlide?.image ? (
                <img src={resolveImageUrl(previewSlide.image)} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full flex items-center justify-center px-4">
                  <div className="text-center">
                    <p className="text-[9px] font-semibold mb-1" style={{ color: "#12D6C5" }}>{sectionTitle}</p>
                    <p className="text-xs font-bold text-white leading-tight">{sectionHeading.slice(0, 40)}{sectionHeading.length > 40 ? "..." : ""}</p>
                  </div>
                </div>
              )}
            </div>
            {/* Dots */}
            <div className="flex items-center justify-center gap-1.5 mt-2">
              {Math.max(slides.length, 3).toString().split("").map((_, i) => (
                <div key={i} className="rounded-full" style={{ width: i === 0 ? 14 : 6, height: 6, background: i === 0 ? "#12D6C5" : "var(--icon-bg)" }} />
              ))}
            </div>
          </div>

          {/* Section Status */}
          <div className="admin-card !p-5">
            <h3 className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>Section Status</h3>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Enable or disable this section on homepage.</p>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Status</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSectionStatus(v => !v)}
                  className="relative"
                  style={{ width: 44, height: 24 }}
                >
                  <div className="absolute inset-0 rounded-full transition-all" style={{ background: sectionStatus ? "#16C784" : "var(--icon-bg)" }} />
                  <div className="absolute top-1 rounded-full transition-all" style={{ width: 16, height: 16, background: "#fff", left: sectionStatus ? "calc(100% - 20px)" : 4 }} />
                </button>
                <span className="text-xs font-semibold" style={{ color: sectionStatus ? "#16C784" : "var(--text-muted)" }}>
                  {sectionStatus ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div className="admin-card !p-5">
            <h3 className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>Display Settings</h3>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Choose on which devices this section will appear.</p>
            <div className="space-y-2.5">
              {[
                { label: "Desktop", icon: Monitor, val: displayDesktop, set: setDisplayDesktop },
                { label: "Tablet", icon: Tablet, val: displayTablet, set: setDisplayTablet },
                { label: "Mobile", icon: Smartphone, val: displayMobile, set: setDisplayMobile },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <button
                    onClick={() => item.set(v => !v)}
                    className="h-4.5 w-4.5 rounded flex items-center justify-center shrink-0 transition-all"
                    style={{
                      width: 18, height: 18,
                      background: item.val ? "#12D6C5" : "transparent",
                      border: `2px solid ${item.val ? "#12D6C5" : "var(--card-border)"}`,
                    }}
                  >
                    {item.val && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                  </button>
                  <item.icon className="h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} />
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Settings */}
          <div className="admin-card !p-5">
            <h3 className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>Additional Settings</h3>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Customize extra behavior for this section.</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Auto Slide Change</span>
                <button
                  onClick={() => setAutoSlide(v => !v)}
                  className="relative"
                  style={{ width: 44, height: 24 }}
                >
                  <div className="absolute inset-0 rounded-full transition-all" style={{ background: autoSlide ? "#16C784" : "var(--icon-bg)" }} />
                  <div className="absolute top-1 rounded-full transition-all" style={{ width: 16, height: 16, background: "#fff", left: autoSlide ? "calc(100% - 20px)" : 4 }} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Change Interval (seconds)</span>
                <input
                  type="number"
                  value={changeInterval}
                  onChange={e => setChangeInterval(Number(e.target.value))}
                  className="admin-input text-sm text-right"
                  style={{ width: 60 }}
                  min={1}
                  max={30}
                />
              </div>
            </div>
          </div>

          {/* Need Help? */}
          <div className="admin-card !p-5">
            <h3 className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>Need Help?</h3>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Learn how to manage homepage sections.</p>
            <button
              className="w-full flex items-center justify-center gap-2 h-9 rounded-xl text-sm font-medium transition-colors"
              style={{ border: "1px solid var(--card-border)", color: "var(--text-secondary)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--hover-bg)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <HelpCircle className="h-4 w-4" /> View Documentation
              <ExternalLink className="h-3.5 w-3.5 ml-auto" />
            </button>
          </div>
        </div>
      </div>
    </div>
      </div>
    </div>
  );
}
