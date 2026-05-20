"use client";

import { useEffect, useState } from "react";
import { 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash2, 
  X,
  RefreshCw,
  ChevronLeft,
  Star,
  User,
  MapPin
} from "lucide-react";
import Link from "next/link";

interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  location: string;
}

export default function TestimonialsPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null);
  const [form, setForm] = useState<Partial<Testimonial>>({
    name: "",
    avatar: "",
    rating: 5,
    comment: "",
    location: ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTestimonials = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/internal/admin/cms/sections", { cache: "no-store", credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        const arr = Array.isArray(data) ? data : data?.data || [];
        // Testimonials are stored as sections of type 'testimonials'
        // Each section's config might contain a single testimonial or a list
        // For simplicity, we assume each section is ONE testimonial
        setSections(arr.filter((s: any) => s.type === "testimonials"));
      }
    } catch (err: any) {
      setError(`Error loading testimonials: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    if (!confirm("This will restore default testimonials. Continue?")) return;
    setSaving(true);
    try {
      const mockTestimonials = [
        {
          name: 'John Mwansa',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
          rating: 5,
          comment: 'Excellent service! Bought my iPhone on credit and the process was smooth. Highly recommend KRYROS.',
          location: 'Lusaka',
        },
        {
          name: 'Sarah Chanda',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
          rating: 5,
          comment: 'Best electronics store in Zambia. Great prices and amazing customer service.',
          location: 'Kitwe',
        },
        {
          name: 'Michael Phiri',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
          rating: 4,
          comment: 'Quick delivery and the product quality is top notch. Will definitely buy again.',
          location: 'Ndola',
        },
      ];

      for (const t of mockTestimonials) {
        await fetch("/internal/admin/cms/sections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "testimonials",
            title: t.name,
            isActive: true,
            config: t
          }),
          credentials: "same-origin"
        });
      }
      loadTestimonials();
    } catch (err: any) {
      setError(`Error seeding: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        type: "testimonials",
        title: form.name,
        isActive: true,
        config: form
      };

      const method = editingTestimonial ? "PUT" : "POST";
      const url = editingTestimonial 
        ? `/internal/admin/cms/sections/${editingTestimonial.id}` 
        : "/internal/admin/cms/sections";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "same-origin"
      });

      if (res.ok) {
        setShowAdd(false);
        setEditingTestimonial(null);
        loadTestimonials();
      }
    } catch (err: any) {
      setError(`Error saving: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      const res = await fetch(`/internal/admin/cms/sections/${id}`, { 
        method: "DELETE",
        credentials: "same-origin"
      });
      if (res.ok) loadTestimonials();
    } catch (err: any) {
      setError(`Error deleting: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/cms" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Testimonials</h1>
            <p className="text-slate-500 font-medium">Manage customer reviews and feedback</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleSeed}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors font-bold text-xs uppercase tracking-widest border border-slate-100"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Restore Defaults
          </button>
          <button
            onClick={() => {
              setEditingTestimonial(null);
              setForm({ name: "", avatar: "", rating: 5, comment: "", location: "" });
              setShowAdd(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-[#1FA89A] text-white rounded-xl hover:bg-[#168a7e] transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#1FA89A]/20"
          >
            <Plus className="h-3.5 w-3.5" />
            New Testimonial
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-8 mb-8 shadow-xl shadow-slate-200/20 animate-in zoom-in-95 duration-300 text-left">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
              {editingTestimonial ? "Edit Testimonial" : "Create New Testimonial"}
            </h2>
            <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customer Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all font-medium text-slate-900"
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all font-medium text-slate-900"
                placeholder="e.g. Lusaka, Zambia"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avatar URL</label>
              <input
                value={form.avatar}
                onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all font-medium text-slate-900"
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rating (1-5)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setForm({ ...form, rating: star })}
                    className={`p-2 rounded-lg transition-colors ${
                      (form.rating || 0) >= star ? "text-yellow-400" : "text-slate-200"
                    }`}
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Comment</label>
              <textarea
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                className="w-full h-32 p-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all font-medium text-slate-900 resize-none"
                placeholder="What did they say?"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-slate-50">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-[#1FA89A] text-white rounded-xl hover:bg-[#168a7e] transition-all font-black uppercase tracking-widest text-xs shadow-lg shadow-[#1FA89A]/20"
            >
              {saving ? "Saving..." : (editingTestimonial ? "Update Testimonial" : "Save Testimonial")}
            </button>
            <button 
              onClick={() => { setShowAdd(false); setEditingTestimonial(null); }} 
              className="px-8 py-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-all font-black uppercase tracking-widest text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => {
          const t = section.config as Testimonial;
          return (
            <div key={section.id} className="bg-white rounded-[2rem] border-2 border-slate-100 p-6 hover:shadow-lg transition-all relative group">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-50">
                  {t.avatar ? (
                    <img src={t.avatar} className="h-full w-full object-cover" alt={t.name} />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-400">
                      <User className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">{t.name}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                    <MapPin className="h-3 w-3" />
                    {t.location}
                  </div>
                </div>
              </div>

              <div className="flex mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-3 w-3 ${star <= t.rating ? "text-yellow-400 fill-current" : "text-slate-200"}`} 
                  />
                ))}
              </div>

              <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-4 italic">
                "{t.comment}"
              </p>

              <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => {
                    setEditingTestimonial(section);
                    setForm(t);
                    setShowAdd(true);
                  }}
                  className="p-2 bg-slate-50 text-slate-400 hover:text-[#1FA89A] hover:bg-[#1FA89A]/10 rounded-lg transition-all"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={() => handleDelete(section.id)}
                  className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {sections.length === 0 && !loading && (
          <div className="col-span-full py-20 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
            <MessageSquare className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No testimonials found.</p>
            <button onClick={handleSeed} className="mt-4 text-[#1FA89A] font-black uppercase text-xs hover:underline">
              Seed Default Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
}