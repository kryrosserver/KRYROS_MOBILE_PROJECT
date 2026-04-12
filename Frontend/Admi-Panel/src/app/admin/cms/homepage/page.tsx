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
  LucideIcon
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
  { id: "CategoriesGrid", label: "Categories", icon: List, description: "Grid of featured categories" },
  { id: "ProductGrid", label: "Product Grid", icon: Grid, description: "Display a grid of products from a category" },
  { id: "BannerGrid", label: "Banner Grid", icon: Layout, description: "Display 2 or 3 promotional banners in a row" },
  { id: "FeaturedCategory", label: "Category Focus", icon: Grid, description: "Products from a specific category" },
  { id: "CreditSection", label: "Credit Info", icon: CreditCard, description: "Information about credit plans" },
  { id: "TextBlock", label: "Text Block", icon: Type, description: "Custom text or HTML content" },
];

const ANIMATIONS = ["none", "fadeIn", "slideUp", "slideInLeft", "zoomIn", "bounceIn"];

export default function HomePageCMS() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  
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
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const temp = newSections[index].order;
    newSections[index].order = newSections[targetIndex].order;
    newSections[targetIndex].order = temp;

    // Update both sections in backend
    await Promise.all([
      fetch(`/internal/admin/cms/homepage-sections/${newSections[index].id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: newSections[index].order }),
        credentials: "same-origin"
      }),
      fetch(`/internal/admin/cms/homepage-sections/${newSections[targetIndex].id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: newSections[targetIndex].order }),
        credentials: "same-origin"
      })
    ]);
    loadSections();
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
          
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
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
            </div>

            {/* Right Column: Media & Links */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Image URL</label>
                <input 
                  value={form.imageUrl} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, imageUrl: e.target.value})}
                  className="admin-input" 
                  placeholder="https://images.unsplash.com/..."
                />
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
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-[10px] text-blue-700 font-bold uppercase tracking-tight">
                    This section automatically displays products marked as "isFlashSale" in the product manager.
                  </div>
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Live Preview Hint</h3>
                <div 
                  className="p-6 rounded-lg border shadow-sm flex flex-col items-center justify-center text-center gap-2 min-h-[150px]"
                  style={{ backgroundColor: form.backgroundColor, color: form.textColor }}
                >
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
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Layout</h2>
          <button onClick={loadSections} className="p-2 hover:bg-white rounded-full transition-colors">
            <RefreshCw className={`h-4 w-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {sections.map((section, index) => (
            <div key={section.id} className="p-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors group">
              <div className="flex flex-col gap-1">
                <button 
                  disabled={index === 0}
                  onClick={() => moveOrder(index, 'up')}
                  className="p-1 hover:bg-white rounded disabled:opacity-30"
                >
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                </button>
                <button 
                  disabled={index === sections.length - 1}
                  onClick={() => moveOrder(index, 'down')}
                  className="p-1 hover:bg-white rounded disabled:opacity-30"
                >
                  <ChevronDown className="h-4 w-4 text-slate-400" />
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
                    setForm({ ...section });
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
