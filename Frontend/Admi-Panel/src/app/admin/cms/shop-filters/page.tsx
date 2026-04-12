"use client";

import { useEffect, useState } from "react";
import { 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  X,
  RefreshCw,
  ChevronLeft,
  CheckCircle2,
  Circle
} from "lucide-react";
import Link from "next/link";

interface FilterItem {
  label: string;
  icon: string;
  isActive: boolean;
}

export default function ShopFiltersPage() {
  const [section, setSection] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<FilterItem>({
    label: "",
    icon: "⭐",
    isActive: true
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFilters = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/internal/admin/cms/sections", { cache: "no-store", credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        const arr = Array.isArray(data) ? data : data?.data || [];
        const fastFilters = arr.find((s: any) => s.type === "fast_filters");
        if (fastFilters) {
          setSection(fastFilters);
        }
      }
    } catch (err: any) {
      setError(`Error loading filters: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms/sections/seed", {
        method: "POST",
        credentials: "same-origin"
      });
      if (res.ok) {
        loadFilters();
      }
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadFilters();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentItems = [...(section?.config?.items || [])];
      if (editingIndex !== null) {
        currentItems[editingIndex] = form;
      } else {
        currentItems.push(form);
      }

      const payload = {
        type: "fast_filters",
        title: section?.title || "Refine Your Search",
        isActive: true,
        config: { ...section?.config, items: currentItems }
      };

      const method = section ? "PUT" : "POST";
      const url = section 
        ? `/internal/admin/cms/sections/${section.id}` 
        : "/internal/admin/cms/sections";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "same-origin"
      });

      if (res.ok) {
        setShowAdd(false);
        setEditingIndex(null);
        loadFilters();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm("Delete this filter?")) return;
    const currentItems = (section?.config?.items || []).filter((_: any, i: number) => i !== index);
    
    setSaving(true);
    try {
      const res = await fetch(`/internal/admin/cms/sections/${section.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: { ...section.config, items: currentItems }
        }),
        credentials: "same-origin"
      });
      if (res.ok) loadFilters();
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (index: number) => {
    const currentItems = [...(section?.config?.items || [])];
    currentItems[index].isActive = !currentItems[index].isActive;
    
    setSaving(true);
    try {
      const res = await fetch(`/internal/admin/cms/sections/${section.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: { ...section.config, items: currentItems }
        }),
        credentials: "same-origin"
      });
      if (res.ok) loadFilters();
    } finally {
      setSaving(false);
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
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Shop Fast Filters</h1>
            <p className="text-slate-500 font-medium">Quick filter buttons for your shop page</p>
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
              setEditingIndex(null);
              setForm({ label: "", icon: "⭐", isActive: true });
              setShowAdd(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-[#1FA89A] text-white rounded-xl hover:bg-[#168a7e] transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#1FA89A]/20"
          >
            <Plus className="h-3.5 w-3.5" />
            New Filter
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-8 mb-8 shadow-xl shadow-slate-200/20 animate-in zoom-in-95 duration-300 text-left">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
              {editingIndex !== null ? "Edit Filter" : "Create New Filter"}
            </h2>
            <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filter Label</label>
              <input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all font-medium text-slate-900"
                placeholder="e.g. BEST SELLERS"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Emoji Icon</label>
              <input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all font-medium text-slate-900"
                placeholder="e.g. ⭐"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-slate-50">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-[#1FA89A] text-white rounded-xl hover:bg-[#168a7e] transition-all font-black uppercase tracking-widest text-xs shadow-lg shadow-[#1FA89A]/20"
            >
              {saving ? "Saving..." : (editingIndex !== null ? "Update Filter" : "Save Filter")}
            </button>
            <button 
              onClick={() => { setShowAdd(false); setEditingIndex(null); }} 
              className="px-8 py-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-all font-black uppercase tracking-widest text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {(section?.config?.items || []).map((item: FilterItem, idx: number) => (
          <div key={idx} className="bg-white rounded-2xl border-2 border-slate-100 p-4 hover:shadow-md transition-all group relative">
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-[#1FA89A] transition-colors text-center">
                {item.label}
              </span>
              <button 
                onClick={() => toggleActive(idx)}
                className={`mt-2 flex items-center gap-1 text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${
                  item.isActive ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"
                }`}
              >
                {item.isActive ? <CheckCircle2 className="h-2 w-2" /> : <Circle className="h-2 w-2" />}
                {item.isActive ? "Active" : "Hidden"}
              </button>
            </div>

            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => {
                  setEditingIndex(idx);
                  setForm(item);
                  setShowAdd(true);
                }}
                className="p-1.5 bg-slate-50 text-slate-400 hover:text-[#1FA89A] rounded-lg transition-all"
              >
                <Edit className="h-3 w-3" />
              </button>
              <button 
                onClick={() => handleDelete(idx)}
                className="p-1.5 bg-slate-50 text-slate-400 hover:text-red-500 rounded-lg transition-all"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}

        {(section?.config?.items || []).length === 0 && !loading && (
          <div className="col-span-full py-20 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
            <Filter className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No filters found.</p>
            <button onClick={handleSeed} className="mt-4 text-[#1FA89A] font-black uppercase text-xs hover:underline">
              Seed Default Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}