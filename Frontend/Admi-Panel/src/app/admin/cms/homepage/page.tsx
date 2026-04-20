"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  Edit, 
  Eye, 
  EyeOff, 
  ChevronUp, 
  ChevronDown,
  Layout,
  Image as ImageIcon,
  Grid,
  List,
  Type,
  Settings,
  RefreshCw,
  X,
  Palette,
  PlayCircle,
  ShieldCheck,
  CreditCard,
  Layers,
  LucideIcon,
  Package
} from "lucide-react";

interface SectionType {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

const SECTION_TYPES: SectionType[] = [
  { id: "HeroSlider", label: "Hero Slider", icon: Layers, description: "Main promotional slider using banners" },
  { id: "TrustBadges", label: "Trust Badges", icon: ShieldCheck, description: "Display features like Fast Delivery, Secure Payment" },
  { id: "FlashSale", label: "Flash Sale", icon: PlayCircle, description: "Display active flash sales with countdown" },
  { id: "PromoBanner", label: "Promo Banner", icon: ImageIcon, description: "Big full-width promotional banner" },
  { id: "ProductPromoList", label: "Product Promos", icon: List, description: "Vertical list of product promotions" },
  { id: "CategoriesGrid", label: "Categories", icon: List, description: "Grid of featured categories" },
  { id: "PopularTagsProducts", label: "Popular Tags", icon: Palette, description: "Products filtered by popular tags" },
  { id: "ProductGrid", label: "Product Grid", icon: Grid, description: "Display a grid of products from a category" },
  { id: "DualBannerSection", label: "Dual Banners", icon: Layout, description: "Two side-by-side promotional banners" },
  { id: "PopularFiltersProducts", label: "Popular Filters", icon: Settings, description: "Products filtered by popular options" },
  { id: "TrendProductsBanner", label: "Trend Products", icon: PlayCircle, description: "Trending products promotion banner" },
  { id: "ProductReviews", label: "Reviews", icon: Palette, description: "Customer product reviews" },
  { id: "DiscountBanner", label: "Discount Banner", icon: ImageIcon, description: "Special discount promotion banner" },
  { id: "BannerGrid", label: "Banner Grid", icon: Layout, description: "Display 2 or 3 promotional banners in a row" },
  { id: "FeaturedCategory", label: "Category Focus", icon: Grid, description: "Products from a specific category" },
  { id: "CreditSection", label: "Credit Info", icon: CreditCard, description: "Information about credit plans" },
  { id: "TextBlock", label: "Text Block", icon: Type, description: "Custom text or HTML content" },
];

const ANIMATIONS = ["none", "fadeIn", "slideUp", "slideIn", "slideInLeft", "zoomIn", "bounceIn"];

export default function HomePageCMS() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [form, setForm] = useState({
    type: "HeroSlider",
    title: "",
    subtitle: "",
    description: "",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    imageUrl: "",
    videoUrl: "",
    link: "",
    linkText: "Learn More",
    order: 0,
    isActive: true,
    animation: "none",
    config: {} as any
  });

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
    const type = isPng ? "image/png" : "image/jpeg";
    return canvas.toDataURL(type, quality);
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({ 
          ...prev, 
          imageUrl: data.url,
          config: {
            ...prev.config,
            backgroundImageUrl: data.url,
            imageUrl: data.url
          }
        }));
      } else {
        alert("Failed to upload image");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image");
    }
  };

  const loadSections = async () => {
    setLoading(true);
    try {
      const res = await fetch("/internal/admin/cms/homepage-sections/manage", { credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        setSections(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load sections", err);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  const seedSections = async () => {
    setLoading(true);
    try {
      const res = await fetch("/internal/admin/cms/homepage-sections/seed", { 
        method: "POST",
        credentials: "same-origin"
      });
      const data = await res.json();
      alert(data.message || "Seeding operation finished");
      loadSections();
    } catch (err) {
      alert("Failed to seed sections. Check server logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSections(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = editingSection ? "PUT" : "POST";
      const url = editingSection 
        ? `/internal/admin/cms/homepage-sections/${editingSection.id}` 
        : "/internal/admin/cms/homepage-sections";
      
      const config = { ...form.config };
      
      if (form.imageUrl) {
        config.backgroundImageUrl = form.imageUrl;
        config.imageUrl = form.imageUrl;
      }
      
      if (form.link) {
        config.buttonLink = form.link;
      }
      
      const dataToSend = {
        ...form,
        config
      };
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
        credentials: "same-origin"
      });

      if (res.ok) {
        setShowAdd(false);
        setEditingSection(null);
        loadSections();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this section?")) return;
    const res = await fetch(`/internal/admin/cms/homepage-sections/${id}`, { 
      method: "DELETE",
      credentials: "same-origin"
    });
    if (res.ok) loadSections();
  };

  const toggleActive = async (section: any) => {
    const res = await fetch(`/internal/admin/cms/homepage-sections/${section.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !section.isActive }),
      credentials: "same-origin"
    });
    if (res.ok) loadSections();
  };

  const moveOrder = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    // Swap positions in the local array
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // Re-assign orders based on index
    const updated = newSections.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSections(updated);
    setHasChanges(true);
  };

  const saveLayout = async () => {
    setSaving(true);
    try {
      // Update all sections sequentially to ensure DB consistency
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
      alert("Layout saved permanently!");
    } catch (error) {
      console.error("Failed to save layout", error);
      alert("Failed to save layout. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Homepage CMS</h1>
          <p className="text-slate-500 text-sm">Design and structure your homepage dynamically</p>
        </div>
        <button 
          onClick={() => {
            setEditingSection(null);
            setForm({
              type: "HeroSlider", title: "", subtitle: "", description: "",
              backgroundColor: "#ffffff", textColor: "#000000", imageUrl: "",
              videoUrl: "", link: "", linkText: "Learn More",
              order: (sections?.length || 0) + 1, isActive: true, animation: "none", config: {}
            });
            setShowAdd(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Section
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900">{editingSection ? 'Edit Section' : 'Create New Section'}</h2>
            <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-white rounded-full transition-colors">
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>
          
          <div className="p-6 space-y-8">
            {/* Form Fields */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Section Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SECTION_TYPES.map(type => {
                    const IconComp = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setForm({ ...form, type: type.id })}
                        className={`p-3 rounded-xl border-2 transition-all text-left flex flex-col items-center gap-2 ${
                          form.type === type.id 
                            ? 'border-green-500 bg-green-50 text-green-700' 
                            : 'border-slate-100 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <IconComp className="h-5 w-5" />
                        <span className="text-[10px] font-bold uppercase text-center">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Section Title</label>
                  <input 
                    value={form.title} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, title: e.target.value})}
                    className="admin-input" 
                    placeholder="Main Title"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Subtitle</label>
                  <input 
                    value={form.subtitle} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, subtitle: e.target.value})}
                    className="admin-input" 
                    placeholder="Small Subtitle"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Description</label>
                <textarea 
                  value={form.description} 
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({...form, description: e.target.value})}
                  className="admin-input h-24 resize-none" 
                  placeholder="Detailed description..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Background Color</label>
                  <div className="flex gap-2">
                    <input 
                      type="color"
                      value={form.backgroundColor} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, backgroundColor: e.target.value})}
                      className="h-10 w-12 rounded border p-1"
                    />
                    <input 
                      value={form.backgroundColor} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, backgroundColor: e.target.value})}
                      className="admin-input flex-1 font-mono uppercase"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Text Color</label>
                  <div className="flex gap-2">
                    <input 
                      type="color"
                      value={form.textColor} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, textColor: e.target.value})}
                      className="h-10 w-12 rounded border p-1"
                    />
                    <input 
                      value={form.textColor} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, textColor: e.target.value})}
                      className="admin-input flex-1 font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Image</label>
                <div className="flex gap-2">
                  <input 
                    value={form.imageUrl} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, imageUrl: e.target.value})}
                    className="admin-input flex-1" 
                    placeholder="https://images.unsplash.com/..."
                  />
                  <input
                    type="file"
                    id="section-image-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="section-image-upload" className="btn-secondary px-4 py-2 cursor-pointer flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" /> Upload
                  </label>
                </div>
                {form.imageUrl && (
                  <div className="mt-3">
                    <img 
                      src={form.imageUrl} 
                      alt="Preview" 
                      className="w-full h-40 object-cover rounded-lg border border-slate-200"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Button Link</label>
                  <input 
                    value={form.link} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, link: e.target.value})}
                    className="admin-input" 
                    placeholder="/shop or https://..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Button Text</label>
                  <input 
                    value={form.linkText} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, linkText: e.target.value})}
                    className="admin-input" 
                    placeholder="Shop Now"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Entrance Animation</label>
                <select 
                  value={form.animation}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({...form, animation: e.target.value})}
                  className="admin-input"
                >
                  {ANIMATIONS.map(anim => (
                    <option key={anim} value={anim}>{anim}</option>
                  ))}
                </select>
              </div>

              {form.type === 'TrustBadges' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Badge Config</h3>
                  {(form.config?.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-2 items-end">
                      <div className="flex-1 space-y-2">
                        <input 
                          value={item.title}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const newItems = [...(form.config?.items || [])];
                            newItems[idx].title = e.target.value;
                            setForm({ ...form, config: { ...(form.config || {}), items: newItems } });
                          }}
                          className="admin-input py-1 text-xs" 
                          placeholder="Title"
                        />
                        <input 
                          value={item.subtitle}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const newItems = [...(form.config?.items || [])];
                            newItems[idx].subtitle = e.target.value;
                            setForm({ ...form, config: { ...(form.config || {}), items: newItems } });
                          }}
                          className="admin-input py-1 text-xs" 
                          placeholder="Subtitle"
                        />
                      </div>
                      <select 
                        value={item.icon}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                          const newItems = [...(form.config?.items || [])];
                          newItems[idx].icon = e.target.value;
                          setForm({ ...form, config: { ...(form.config || {}), items: newItems } });
                        }}
                        className="admin-input py-1 text-xs w-24"
                      >
                        <option value="Truck">Truck</option>
                        <option value="ShieldCheck">Shield</option>
                        <option value="Smartphone">Phone</option>
                        <option value="ArrowRight">Arrow</option>
                      </select>
                      <button 
                        onClick={() => {
                          const newItems = (form.config?.items || []).filter((_: any, i: number) => i !== idx);
                          setForm({ ...form, config: { ...(form.config || {}), items: newItems } });
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const newItems = [...(form.config?.items || []), { title: 'New Badge', subtitle: 'Description', icon: 'Truck' }];
                      setForm({ ...form, config: { ...(form.config || {}), items: newItems } });
                    }}
                    className="text-[10px] font-black uppercase text-primary flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add Badge
                  </button>
                </div>
              )}

              {form.type === 'FeaturedCategory' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Category Focus Config</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400">Category Slug</label>
                      <input 
                        value={form.config?.categorySlug || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, config: { ...(form.config || {}), categorySlug: e.target.value } })}
                        className="admin-input py-1 text-xs"
                        placeholder="e.g. smartphones"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400">Limit</label>
                      <input 
                        type="number"
                        value={form.config?.limit || 4}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, config: { ...(form.config || {}), limit: parseInt(e.target.value) } })}
                        className="admin-input py-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {form.type === 'BannerGrid' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Banner Grid Config</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400">Layout</label>
                        <select 
                          value={form.config?.layout || '2-cols'}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, config: { ...(form.config || {}), layout: e.target.value } })}
                          className="admin-input py-1 text-xs"
                        >
                          <option value="2-cols">2 Columns</option>
                          <option value="3-cols">3 Columns</option>
                          <option value="1-2-split">1 Large, 2 Small</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400">Gap</label>
                        <select 
                          value={form.config?.gap || '4'}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, config: { ...(form.config || {}), gap: e.target.value } })}
                          className="admin-input py-1 text-xs"
                        >
                          <option value="2">Small</option>
                          <option value="4">Medium</option>
                          <option value="8">Large</option>
                        </select>
                      </div>
                    </div>
                    
                    {(form.config?.items || []).map((item: any, idx: number) => (
                      <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-400">Banner {idx + 1}</span>
                          <button onClick={() => {
                            const newItems = (form.config?.items || []).filter((_: any, i: number) => i !== idx);
                            setForm({ ...form, config: { ...(form.config || {}), items: newItems } });
                          }} className="text-red-500 hover:bg-red-50 p-1 rounded">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <input 
                          value={item.imageUrl}
                          onChange={(e) => {
                            const newItems = [...(form.config?.items || [])];
                            newItems[idx].imageUrl = e.target.value;
                            setForm({ ...form, config: { ...(form.config || {}), items: newItems } });
                          }}
                          className="admin-input py-1 text-xs" placeholder="Image URL"
                        />
                        <input 
                          value={item.link}
                          onChange={(e) => {
                            const newItems = [...(form.config?.items || [])];
                            newItems[idx].link = e.target.value;
                            setForm({ ...form, config: { ...(form.config || {}), items: newItems } });
                          }}
                          className="admin-input py-1 text-xs" placeholder="Link (e.g. /shop)"
                        />
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const newItems = [...(form.config?.items || []), { imageUrl: '', link: '' }];
                        setForm({ ...form, config: { ...(form.config || {}), items: newItems } });
                      }}
                      className="text-[10px] font-black uppercase text-primary flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add Banner
                    </button>
                  </div>
                </div>
              )}

              {form.type === 'ProductGrid' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Product Grid Config</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400">Limit</label>
                      <input 
                        type="number"
                        value={form.config?.limit || 8}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, config: { ...(form.config || {}), limit: parseInt(e.target.value) } })}
                        className="admin-input py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400">Filter</label>
                      <select 
                        value={form.config?.filter || 'all'}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, config: { ...(form.config || {}), filter: e.target.value } })}
                        className="admin-input py-1 text-xs"
                      >
                        <option value="all">All Products</option>
                        <option value="featured">Featured Only</option>
                        <option value="new">Newest First</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {form.type === 'FlashSale' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Flash Sale Config</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400">End Date & Time</label>
                      <input 
                        type="datetime-local"
                        value={form.config?.endTime || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, config: { ...(form.config || {}), endTime: e.target.value } })}
                        className="admin-input py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400">Product Limit</label>
                      <input 
                        type="number"
                        value={form.config?.limit || 4}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, config: { ...(form.config || {}), limit: parseInt(e.target.value) } })}
                        className="admin-input py-1 text-xs"
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-[10px] text-blue-700 font-bold uppercase tracking-tight space-y-2">
                    <p>This section automatically displays products marked as "isFlashSale" in the product manager.</p>
                    <p className="text-blue-900 underline font-black">Make sure to set a Flash Sale Price and End Date for each product!</p>
                  </div>
                </div>
              )}

              {form.type === 'CategoriesGrid' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Categories Grid Config</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400">Limit</label>
                      <input 
                        type="number"
                        value={form.config?.limit || 6}
                        onChange={(e) => setForm({ ...form, config: { ...(form.config || {}), limit: parseInt(e.target.value) } })}
                        className="admin-input py-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {form.type === 'PopularTagsProducts' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Popular Tags Config</h3>
                  {(form.config?.tags || []).map((tag: any, idx: number) => (
                    <div key={idx} className="flex gap-2 items-end">
                      <div className="flex-1 space-y-2">
                        <input 
                          value={tag.label}
                          onChange={(e) => {
                            const newTags = [...(form.config?.tags || [])];
                            newTags[idx].label = e.target.value;
                            setForm({ ...form, config: { ...(form.config || {}), tags: newTags } });
                          }}
                          className="admin-input py-1 text-xs" 
                          placeholder="Tag Label"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <label className="text-[8px] font-bold uppercase text-slate-400">Active</label>
                        <input 
                          type="checkbox"
                          checked={tag.isActive}
                          onChange={(e) => {
                            const newTags = [...(form.config?.tags || [])];
                            newTags[idx].isActive = e.target.checked;
                            setForm({ ...form, config: { ...(form.config || {}), tags: newTags } });
                          }}
                          className="h-4 w-4"
                        />
                      </div>
                      <button 
                        onClick={() => {
                          const newTags = (form.config?.tags || []).filter((_: any, i: number) => i !== idx);
                          setForm({ ...form, config: { ...(form.config || {}), tags: newTags } });
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const newTags = [...(form.config?.tags || []), { label: 'New Tag', isActive: false }];
                      setForm({ ...form, config: { ...(form.config || {}), tags: newTags } });
                    }}
                    className="text-[10px] font-black uppercase text-primary flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add Tag
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400">Product Limit</label>
                      <input 
                        type="number"
                        value={form.config?.limit || 10}
                        onChange={(e) => setForm({ ...form, config: { ...(form.config || {}), limit: parseInt(e.target.value) } })}
                        className="admin-input py-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {form.type === 'PopularFiltersProducts' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Popular Filters Config</h3>
                  {(form.config?.filters || []).map((filter: any, idx: number) => (
                    <div key={idx} className="flex gap-2 items-end">
                      <div className="flex-1 space-y-2">
                        <input 
                          value={filter.label}
                          onChange={(e) => {
                            const newFilters = [...(form.config?.filters || [])];
                            newFilters[idx].label = e.target.value;
                            setForm({ ...form, config: { ...(form.config || {}), filters: newFilters } });
                          }}
                          className="admin-input py-1 text-xs" 
                          placeholder="Filter Label"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <label className="text-[8px] font-bold uppercase text-slate-400">Active</label>
                        <input 
                          type="checkbox"
                          checked={filter.isActive}
                          onChange={(e) => {
                            const newFilters = [...(form.config?.filters || [])];
                            newFilters[idx].isActive = e.target.checked;
                            setForm({ ...form, config: { ...(form.config || {}), filters: newFilters } });
                          }}
                          className="h-4 w-4"
                        />
                      </div>
                      <button 
                        onClick={() => {
                          const newFilters = (form.config?.filters || []).filter((_: any, i: number) => i !== idx);
                          setForm({ ...form, config: { ...(form.config || {}), filters: newFilters } });
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const newFilters = [...(form.config?.filters || []), { label: 'New Filter', isActive: false }];
                      setForm({ ...form, config: { ...(form.config || {}), filters: newFilters } });
                    }}
                    className="text-[10px] font-black uppercase text-primary flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add Filter
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400">Product Limit</label>
                      <input 
                        type="number"
                        value={form.config?.limit || 8}
                        onChange={(e) => setForm({ ...form, config: { ...(form.config || {}), limit: parseInt(e.target.value) } })}
                        className="admin-input py-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {form.type === 'ProductReviews' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Product Reviews Config</h3>
                  {(form.config?.reviews || []).map((review: any, idx: number) => (
                    <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400">Review {idx + 1}</span>
                        <button onClick={() => {
                          const newReviews = (form.config?.reviews || []).filter((_: any, i: number) => i !== idx);
                          setForm({ ...form, config: { ...(form.config || {}), reviews: newReviews } });
                        }} className="text-red-500 hover:bg-red-50 p-1 rounded">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input 
                          value={review.customerName}
                          onChange={(e) => {
                            const newReviews = [...(form.config?.reviews || [])];
                            newReviews[idx].customerName = e.target.value;
                            setForm({ ...form, config: { ...(form.config || {}), reviews: newReviews } });
                          }}
                          className="admin-input py-1 text-xs" placeholder="Customer Name"
                        />
                        <input 
                          value={review.role}
                          onChange={(e) => {
                            const newReviews = [...(form.config?.reviews || [])];
                            newReviews[idx].role = e.target.value;
                            setForm({ ...form, config: { ...(form.config || {}), reviews: newReviews } });
                          }}
                          className="admin-input py-1 text-xs" placeholder="Role (e.g., Verified Buyer)"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input 
                          type="number" min="1" max="5"
                          value={review.rating}
                          onChange={(e) => {
                            const newReviews = [...(form.config?.reviews || [])];
                            newReviews[idx].rating = parseInt(e.target.value);
                            setForm({ ...form, config: { ...(form.config || {}), reviews: newReviews } });
                          }}
                          className="admin-input py-1 text-xs" placeholder="Rating (1-5)"
                        />
                        <input 
                          value={review.date}
                          onChange={(e) => {
                            const newReviews = [...(form.config?.reviews || [])];
                            newReviews[idx].date = e.target.value;
                            setForm({ ...form, config: { ...(form.config || {}), reviews: newReviews } });
                          }}
                          className="admin-input py-1 text-xs" placeholder="Date"
                        />
                        <input 
                          value={review.customerImage}
                          onChange={(e) => {
                            const newReviews = [...(form.config?.reviews || [])];
                            newReviews[idx].customerImage = e.target.value;
                            setForm({ ...form, config: { ...(form.config || {}), reviews: newReviews } });
                          }}
                          className="admin-input py-1 text-xs" placeholder="Customer Image URL"
                        />
                      </div>
                      <textarea 
                        value={review.reviewText}
                        onChange={(e) => {
                          const newReviews = [...(form.config?.reviews || [])];
                          newReviews[idx].reviewText = e.target.value;
                          setForm({ ...form, config: { ...(form.config || {}), reviews: newReviews } });
                        }}
                        className="admin-input py-1 text-xs h-16 resize-none" placeholder="Review Text"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input 
                          value={review.purchasedProduct}
                          onChange={(e) => {
                            const newReviews = [...(form.config?.reviews || [])];
                            newReviews[idx].purchasedProduct = e.target.value;
                            setForm({ ...form, config: { ...(form.config || {}), reviews: newReviews } });
                          }}
                          className="admin-input py-1 text-xs" placeholder="Purchased Product"
                        />
                        <input 
                          value={review.purchasedProductImage}
                          onChange={(e) => {
                            const newReviews = [...(form.config?.reviews || [])];
                            newReviews[idx].purchasedProductImage = e.target.value;
                            setForm({ ...form, config: { ...(form.config || {}), reviews: newReviews } });
                          }}
                          className="admin-input py-1 text-xs" placeholder="Product Image URL"
                        />
                        <input 
                          value={review.purchasedProductLink}
                          onChange={(e) => {
                            const newReviews = [...(form.config?.reviews || [])];
                            newReviews[idx].purchasedProductLink = e.target.value;
                            setForm({ ...form, config: { ...(form.config || {}), reviews: newReviews } });
                          }}
                          className="admin-input py-1 text-xs" placeholder="Product Link"
                        />
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const newReviews = [...(form.config?.reviews || []), { 
                        customerName: 'Customer Name', 
                        role: 'Verified Buyer', 
                        rating: 5, 
                        date: 'Jan 2026',
                        customerImage: '',
                        reviewText: 'Great product!',
                        purchasedProduct: 'Product Name',
                        purchasedProductImage: '',
                        purchasedProductLink: '/shop'
                      }];
                      setForm({ ...form, config: { ...(form.config || {}), reviews: newReviews } });
                    }}
                    className="text-[10px] font-black uppercase text-primary flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add Review
                  </button>
                </div>
              )}

              {form.type === 'DualBannerSection' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Dual Banners Config</h3>
                  {(form.config?.banners || []).map((banner: any, idx: number) => (
                    <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400">Banner {idx + 1}</span>
                        <button onClick={() => {
                          const newBanners = (form.config?.banners || []).filter((_: any, i: number) => i !== idx);
                          setForm({ ...form, config: { ...(form.config || {}), banners: newBanners } });
                        }} className="text-red-500 hover:bg-red-50 p-1 rounded">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input 
                          value={banner.title}
                          onChange={(e) => {
                            const newBanners = [...(form.config?.banners || [])];
                            newBanners[idx].title = e.target.value;
                            setForm({ ...form, config: { ...(form.config || {}), banners: newBanners } });
                          }}
                          className="admin-input py-1 text-xs" placeholder="Title"
                        />
                        <input 
                          value={banner.subtitle}
                          onChange={(e) => {
                            const newBanners = [...(form.config?.banners || [])];
                            newBanners[idx].subtitle = e.target.value;
                            setForm({ ...form, config: { ...(form.config || {}), banners: newBanners } });
                          }}
                          className="admin-input py-1 text-xs" placeholder="Subtitle"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input 
                          value={banner.link}
                          onChange={(e) => {
                            const newBanners = [...(form.config?.banners || [])];
                            newBanners[idx].link = e.target.value;
                            setForm({ ...form, config: { ...(form.config || {}), banners: newBanners } });
                          }}
                          className="admin-input py-1 text-xs" placeholder="Link"
                        />
                        <input 
                          value={banner.linkText}
                          onChange={(e) => {
                            const newBanners = [...(form.config?.banners || [])];
                            newBanners[idx].linkText = e.target.value;
                            setForm({ ...form, config: { ...(form.config || {}), banners: newBanners } });
                          }}
                          className="admin-input py-1 text-xs" placeholder="Link Text"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="flex gap-2">
                          <input 
                            type="color"
                            value={banner.backgroundColor}
                            onChange={(e) => {
                              const newBanners = [...(form.config?.banners || [])];
                              newBanners[idx].backgroundColor = e.target.value;
                              setForm({ ...form, config: { ...(form.config || {}), banners: newBanners } });
                            }}
                            className="h-8 w-10 rounded border p-0.5"
                          />
                          <input 
                            value={banner.backgroundColor}
                            onChange={(e) => {
                              const newBanners = [...(form.config?.banners || [])];
                              newBanners[idx].backgroundColor = e.target.value;
                              setForm({ ...form, config: { ...(form.config || {}), banners: newBanners } });
                            }}
                            className="admin-input py-1 text-xs flex-1 font-mono" placeholder="BG Color"
                          />
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="color"
                            value={banner.textColor}
                            onChange={(e) => {
                              const newBanners = [...(form.config?.banners || [])];
                              newBanners[idx].textColor = e.target.value;
                              setForm({ ...form, config: { ...(form.config || {}), banners: newBanners } });
                            }}
                            className="h-8 w-10 rounded border p-0.5"
                          />
                          <input 
                            value={banner.textColor}
                            onChange={(e) => {
                              const newBanners = [...(form.config?.banners || [])];
                              newBanners[idx].textColor = e.target.value;
                              setForm({ ...form, config: { ...(form.config || {}), banners: newBanners } });
                            }}
                            className="admin-input py-1 text-xs flex-1 font-mono" placeholder="Text Color"
                          />
                        </div>
                        <input 
                          value={banner.imageUrl}
                          onChange={(e) => {
                            const newBanners = [...(form.config?.banners || [])];
                            newBanners[idx].imageUrl = e.target.value;
                            setForm({ ...form, config: { ...(form.config || {}), banners: newBanners } });
                          }}
                          className="admin-input py-1 text-xs" placeholder="Image URL"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input 
                          value={banner.badge}
                          onChange={(e) => {
                            const newBanners = [...(form.config?.banners || [])];
                            newBanners[idx].badge = e.target.value;
                            setForm({ ...form, config: { ...(form.config || {}), banners: newBanners } });
                          }}
                          className="admin-input py-1 text-xs" placeholder="Badge (optional)"
                        />
                        <div className="flex gap-2">
                          <input 
                            type="color"
                            value={banner.badgeColor}
                            onChange={(e) => {
                              const newBanners = [...(form.config?.banners || [])];
                              newBanners[idx].badgeColor = e.target.value;
                              setForm({ ...form, config: { ...(form.config || {}), banners: newBanners } });
                            }}
                            className="h-8 w-10 rounded border p-0.5"
                          />
                          <input 
                            value={banner.badgeColor}
                            onChange={(e) => {
                              const newBanners = [...(form.config?.banners || [])];
                              newBanners[idx].badgeColor = e.target.value;
                              setForm({ ...form, config: { ...(form.config || {}), banners: newBanners } });
                            }}
                            className="admin-input py-1 text-xs flex-1 font-mono" placeholder="Badge Color"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const newBanners = [...(form.config?.banners || []), { 
                        title: 'Banner Title', 
                        subtitle: 'Banner Subtitle',
                        link: '/shop',
                        linkText: 'Shop Now',
                        backgroundColor: '#FFF1F2',
                        textColor: '#000000',
                        imageUrl: '',
                        badge: '',
                        badgeColor: '#EF4444'
                      }];
                      setForm({ ...form, config: { ...(form.config || {}), banners: newBanners } });
                    }}
                    className="text-[10px] font-black uppercase text-primary flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add Banner
                  </button>
                </div>
              )}

              {form.type === 'ProductPromoList' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Product Promos Config</h3>
                  {(form.config?.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400">Promo {idx + 1}</span>
                        <button onClick={() => {
                          const newItems = (form.config?.items || []).filter((_: any, i: number) => i !== idx);
                          setForm({ ...form, config: { ...(form.config || {}), items: newItems } });
                        }} className="text-red-500 hover:bg-red-50 p-1 rounded">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input 
                          value={item.title}
                          onChange={(e) => {
                            const newItems = [...(form.config?.items || [])];
                            newItems[idx].title = e.target.value;
                            setForm({ ...form, config: { ...(form.config || {}), items: newItems } });
                          }}
                          className="admin-input py-1 text-xs" placeholder="Title"
                        />
                        <input 
                          value={item.subtitle}
                          onChange={(e) => {
                            const newItems = [...(form.config?.items || [])];
                            newItems[idx].subtitle = e.target.value;
                            setForm({ ...form, config: { ...(form.config || {}), items: newItems } });
                          }}
                          className="admin-input py-1 text-xs" placeholder="Subtitle"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input 
                          value={item.link}
                          onChange={(e) => {
                            const newItems = [...(form.config?.items || [])];
                            newItems[idx].link = e.target.value;
                            setForm({ ...form, config: { ...(form.config || {}), items: newItems } });
                          }}
                          className="admin-input py-1 text-xs" placeholder="Link"
                        />
                        <input 
                          value={item.linkText}
                          onChange={(e) => {
                            const newItems = [...(form.config?.items || [])];
                            newItems[idx].linkText = e.target.value;
                            setForm({ ...form, config: { ...(form.config || {}), items: newItems } });
                          }}
                          className="admin-input py-1 text-xs" placeholder="Link Text"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="flex gap-2">
                          <input 
                            type="color"
                            value={item.backgroundColor}
                            onChange={(e) => {
                              const newItems = [...(form.config?.items || [])];
                              newItems[idx].backgroundColor = e.target.value;
                              setForm({ ...form, config: { ...(form.config || {}), items: newItems } });
                            }}
                            className="h-8 w-10 rounded border p-0.5"
                          />
                          <input 
                            value={item.backgroundColor}
                            onChange={(e) => {
                              const newItems = [...(form.config?.items || [])];
                              newItems[idx].backgroundColor = e.target.value;
                              setForm({ ...form, config: { ...(form.config || {}), items: newItems } });
                            }}
                            className="admin-input py-1 text-xs flex-1 font-mono" placeholder="BG Color"
                          />
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="color"
                            value={item.textColor}
                            onChange={(e) => {
                              const newItems = [...(form.config?.items || [])];
                              newItems[idx].textColor = e.target.value;
                              setForm({ ...form, config: { ...(form.config || {}), items: newItems } });
                            }}
                            className="h-8 w-10 rounded border p-0.5"
                          />
                          <input 
                            value={item.textColor}
                            onChange={(e) => {
                              const newItems = [...(form.config?.items || [])];
                              newItems[idx].textColor = e.target.value;
                              setForm({ ...form, config: { ...(form.config || {}), items: newItems } });
                            }}
                            className="admin-input py-1 text-xs flex-1 font-mono" placeholder="Text Color"
                          />
                        </div>
                        <input 
                          value={item.imageUrl}
                          onChange={(e) => {
                            const newItems = [...(form.config?.items || [])];
                            newItems[idx].imageUrl = e.target.value;
                            setForm({ ...form, config: { ...(form.config || {}), items: newItems } });
                          }}
                          className="admin-input py-1 text-xs" placeholder="Image URL"
                        />
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const newItems = [...(form.config?.items || []), { 
                        title: 'Promo Title', 
                        subtitle: 'Promo Subtitle',
                        link: '/shop',
                        linkText: 'Shop Now',
                        backgroundColor: '#EEF2FF',
                        textColor: '#4F46E5',
                        imageUrl: ''
                      }];
                      setForm({ ...form, config: { ...(form.config || {}), items: newItems } });
                    }}
                    className="text-[10px] font-black uppercase text-primary flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add Promo
                  </button>
                </div>
              )}

              {form.type === 'TrendProductsBanner' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Trend Products Config</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400">Title</label>
                      <input 
                        value={form.config?.title || ''}
                        onChange={(e) => setForm({ ...form, config: { ...(form.config || {}), title: e.target.value } })}
                        className="admin-input py-1 text-xs"
                        placeholder="Trending Products"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400">Button Text</label>
                      <input 
                        value={form.config?.buttonText || ''}
                        onChange={(e) => setForm({ ...form, config: { ...(form.config || {}), buttonText: e.target.value } })}
                        className="admin-input py-1 text-xs"
                        placeholder="Shop Now"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400">Button Link</label>
                      <input 
                        value={form.config?.buttonLink || ''}
                        onChange={(e) => setForm({ ...form, config: { ...(form.config || {}), buttonLink: e.target.value } })}
                        className="admin-input py-1 text-xs"
                        placeholder="/shop"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex gap-2">
                      <input 
                        type="color"
                        value={form.config?.backgroundColor || '#FFF7ED'}
                        onChange={(e) => setForm({ ...form, config: { ...(form.config || {}), backgroundColor: e.target.value } })}
                        className="h-10 w-12 rounded border p-1"
                      />
                      <div className="flex-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">BG Color</label>
                        <input 
                          value={form.config?.backgroundColor || '#FFF7ED'}
                          onChange={(e) => setForm({ ...form, config: { ...(form.config || {}), backgroundColor: e.target.value } })}
                          className="admin-input py-1 text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="color"
                        value={form.config?.textColor || '#78350F'}
                        onChange={(e) => setForm({ ...form, config: { ...(form.config || {}), textColor: e.target.value } })}
                        className="h-10 w-12 rounded border p-1"
                      />
                      <div className="flex-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Text Color</label>
                        <input 
                          value={form.config?.textColor || '#78350F'}
                          onChange={(e) => setForm({ ...form, config: { ...(form.config || {}), textColor: e.target.value } })}
                          className="admin-input py-1 text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400">Image URL</label>
                      <input 
                        value={form.config?.imageUrl || ''}
                        onChange={(e) => setForm({ ...form, config: { ...(form.config || {}), imageUrl: e.target.value } })}
                        className="admin-input py-1 text-xs"
                        placeholder="Image URL"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase text-slate-400">Badges</h4>
                    {(form.config?.badges || []).map((badge: any, idx: number) => (
                      <div key={idx} className="flex gap-2 items-end">
                        <input 
                          value={badge.label}
                          onChange={(e) => {
                            const newBadges = [...(form.config?.badges || [])];
                            newBadges[idx].label = e.target.value;
                            setForm({ ...form, config: { ...(form.config || {}), badges: newBadges } });
                          }}
                          className="admin-input py-1 text-xs flex-1" 
                          placeholder="Badge Label"
                        />
                        <div className="flex gap-1">
                          <input 
                            type="color"
                            value={badge.backgroundColor}
                            onChange={(e) => {
                              const newBadges = [...(form.config?.badges || [])];
                              newBadges[idx].backgroundColor = e.target.value;
                              setForm({ ...form, config: { ...(form.config || {}), badges: newBadges } });
                            }}
                            className="h-8 w-8 rounded border p-0.5"
                          />
                          <input 
                            type="color"
                            value={badge.color}
                            onChange={(e) => {
                              const newBadges = [...(form.config?.badges || [])];
                              newBadges[idx].color = e.target.value;
                              setForm({ ...form, config: { ...(form.config || {}), badges: newBadges } });
                            }}
                            className="h-8 w-8 rounded border p-0.5"
                          />
                        </div>
                        <button 
                          onClick={() => {
                            const newBadges = (form.config?.badges || []).filter((_: any, i: number) => i !== idx);
                            setForm({ ...form, config: { ...(form.config || {}), badges: newBadges } });
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const newBadges = [...(form.config?.badges || []), { label: 'New Badge', backgroundColor: '#FEE2E2', color: '#991B1B' }];
                        setForm({ ...form, config: { ...(form.config || {}), badges: newBadges } });
                      }}
                      className="text-[10px] font-black uppercase text-primary flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add Badge
                    </button>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase text-slate-400">Featured Products</h4>
                    {(form.config?.featuredProducts || []).map((product: string, idx: number) => (
                      <div key={idx} className="flex gap-2 items-end">
                        <input 
                          value={product}
                          onChange={(e) => {
                            const newProducts = [...(form.config?.featuredProducts || [])];
                            newProducts[idx] = e.target.value;
                            setForm({ ...form, config: { ...(form.config || {}), featuredProducts: newProducts } });
                          }}
                          className="admin-input py-1 text-xs flex-1" 
                          placeholder="Product Name"
                        />
                        <button 
                          onClick={() => {
                            const newProducts = (form.config?.featuredProducts || []).filter((_: any, i: number) => i !== idx);
                            setForm({ ...form, config: { ...(form.config || {}), featuredProducts: newProducts } });
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const newProducts = [...(form.config?.featuredProducts || []), 'Product Name'];
                        setForm({ ...form, config: { ...(form.config || {}), featuredProducts: newProducts } });
                      }}
                      className="text-[10px] font-black uppercase text-primary flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add Product
                    </button>
                  </div>
                </div>
              )}

              {form.type === 'CreditSection' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Credit Section Config</h3>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                    <span className="text-[10px] font-bold text-slate-400">Benefits</span>
                    {(form.config?.benefits || []).map((benefit: any, idx: number) => (
                      <div key={idx} className="flex gap-2 items-end">
                        <div className="flex-1 space-y-2">
                          <input 
                            value={benefit.title}
                            onChange={(e) => {
                              const newBenefits = [...(form.config?.benefits || [])];
                              newBenefits[idx].title = e.target.value;
                              setForm({ ...form, config: { ...(form.config || {}), benefits: newBenefits } });
                            }}
                            className="admin-input py-1 text-xs" 
                            placeholder="Benefit Title"
                          />
                          <input 
                            value={benefit.desc}
                            onChange={(e) => {
                              const newBenefits = [...(form.config?.benefits || [])];
                              newBenefits[idx].desc = e.target.value;
                              setForm({ ...form, config: { ...(form.config || {}), benefits: newBenefits } });
                            }}
                            className="admin-input py-1 text-xs" 
                            placeholder="Description"
                          />
                        </div>
                        <button 
                          onClick={() => {
                            const newBenefits = (form.config?.benefits || []).filter((_: any, i: number) => i !== idx);
                            setForm({ ...form, config: { ...(form.config || {}), benefits: newBenefits } });
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const newBenefits = [...(form.config?.benefits || []), { title: 'New Benefit', desc: 'Description', icon: 'Clock' }];
                        setForm({ ...form, config: { ...(form.config || {}), benefits: newBenefits } });
                      }}
                      className="text-[10px] font-black uppercase text-primary flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add Benefit
                    </button>
                  </div>
                </div>
              )}

              {form.type === 'TextBlock' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Text Block Config</h3>
                  <p className="text-xs text-slate-500">Text Block uses the main Title, Subtitle, and Description fields above. No additional configuration needed.</p>
                </div>
              )}

              {form.type === 'PromoBanner' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Promo Banner Config</h3>
                  <p className="text-xs text-slate-500">Promo Banner uses the main Image and Button Link fields above. No additional configuration needed.</p>
                </div>
              )}

              {form.type === 'DiscountBanner' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Discount Banner Config</h3>
                  <p className="text-xs text-slate-500">Discount Banner uses the main Image and Button Link fields above. No additional configuration needed.</p>
                </div>
              )}

              {form.type === 'HeroSlider' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Hero Slider Config</h3>
                  <p className="text-xs text-slate-500">Hero Slider uses the Banners module. No additional configuration needed here.</p>
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Live Preview Hint</h3>
                <div 
                  className="p-6 rounded-lg border shadow-sm flex flex-col items-center justify-center text-center gap-2 min-h-[150px]"
                  style={{ backgroundColor: form.backgroundColor, color: form.textColor }}
                >
                  {form.type === 'FlashSale' && (
                    <div className="mb-2 flex items-center gap-1 bg-slate-900 text-white px-3 py-1.5 rounded-full text-[8px] font-black uppercase">
                      <PlayCircle className="h-3 w-3 text-green-500" /> 00 : 00 : 00
                    </div>
                  )}
                  <h4 className="font-black uppercase tracking-tight">{form.title || 'Section Title'}</h4>
                  <p className="text-xs opacity-80">{form.subtitle || 'Optional subtitle goes here'}</p>
                  {form.link && (
                    <div className="mt-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest" style={{ borderColor: form.textColor }}>
                      {form.linkText}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="btn-primary min-w-[150px] font-black uppercase tracking-widest"
            >
              {saving ? 'Saving...' : editingSection ? 'Update Section' : 'Create Section'}
            </button>
            <button 
              onClick={() => { setShowAdd(false); setEditingSection(null); }}
              className="btn-secondary font-black uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sections List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Layout</h2>
            {hasChanges && (
              <button 
                onClick={saveLayout}
                disabled={saving}
                className="px-4 py-1.5 bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 animate-bounce"
              >
                {saving ? 'Saving...' : 'Save Permanent Layout'}
              </button>
            )}
          </div>
          <button onClick={loadSections} className="p-2 hover:bg-white rounded-full transition-colors">
            <RefreshCw className={`h-4 w-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {sections.map((section, index) => (
            <div key={section.id} className="p-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors group">
              <div className="flex flex-col gap-1">
                <button 
                  disabled={index === 0 || saving}
                  onClick={() => moveOrder(index, 'up')}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg hover:border-primary hover:text-primary disabled:opacity-30 shadow-sm transition-all active:scale-90"
                  title="Move Up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button 
                  disabled={index === sections.length - 1 || saving}
                  onClick={() => moveOrder(index, 'down')}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg hover:border-primary hover:text-primary disabled:opacity-30 shadow-sm transition-all active:scale-90"
                  title="Move Down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                {(() => {
                  const typeInfo = SECTION_TYPES.find(t => t.id === section.type);
                  const IconComp = typeInfo?.icon || Layout;
                  return <IconComp className="h-6 w-6 text-slate-500" />;
                })()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 truncate uppercase tracking-tight">{section.title || 'Untitled Section'}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200">
                    {section.type}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">{section.subtitle || 'No subtitle'}</p>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => toggleActive(section)}
                  className={`p-2 rounded-lg transition-colors ${section.isActive ? 'text-green-500 hover:bg-green-50' : 'text-slate-300 hover:bg-slate-100'}`}
                  title={section.isActive ? 'Hide' : 'Show'}
                >
                  {section.isActive ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </button>
                <button 
                  onClick={() => {
                    setEditingSection(section);
                    const config = section.config || {};
                    setForm({ 
                      ...section,
                      imageUrl: section.imageUrl || config.backgroundImageUrl || config.imageUrl || '',
                      link: section.link || config.buttonLink || '',
                    });
                    setShowAdd(true);
                  }}
                  className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => handleDelete(section.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}

          {sections.length === 0 && !loading && (
            <div className="p-12 text-center">
              <Layout className="h-12 w-12 text-slate-200 mx-auto mb-3" />
              <h3 className="text-slate-900 font-bold uppercase tracking-widest mb-1">No Sections Created</h3>
              <p className="text-slate-500 text-sm mb-6">Start building your KRYROS homepage by adding your first section or restore the defaults.</p>
              <button 
                onClick={seedSections}
                className="btn-secondary flex items-center gap-2 mx-auto"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Restore Default Sections
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}