"use client";

import { useState } from "react";
import { 
  Palette, Palette as ThemeIcon, Layout, Check, 
  ChevronLeft, Save
} from "lucide-react";
import Link from "next/link";
import { useAdminSettings } from "@/providers/AdminSettingsProvider";

export default function AppearanceSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const { 
    accentColor, setAccentColor,
    theme, setTheme 
  } = useAdminSettings();

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  };

  const colors = [
    { label: "Emerald", hex: "#10b981" },
    { label: "Blue", hex: "#3b82f6" },
    { label: "Violet", hex: "#8b5cf6" },
    { label: "Amber", hex: "#f59e0b" },
    { label: "Rose", hex: "#ef4444" },
    { label: "Kryros", hex: "#1FA89A" },
    { label: "Slate", hex: "#0f172a" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/settings" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Appearance</h1>
            <p className="text-slate-500 text-sm">Customize the look and feel of your admin dashboard</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all shadow-lg ${
            saved 
              ? "bg-green-500 text-white shadow-green-500/20" 
              : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20"
          }`}
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {isSaving ? "Saving..." : saved ? "Saved!" : "Save Appearance"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Theme Section */}
          <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-8 shadow-xl shadow-slate-200/20">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
              <ThemeIcon className="h-5 w-5 text-green-500" />
              Interface Theme
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {["light", "dark", "system"].map((t) => (
                <label key={t} className="cursor-pointer">
                  <input 
                    type="radio" 
                    name="theme" 
                    value={t} 
                    checked={theme === t} 
                    onChange={() => setTheme(t as any)}
                    className="peer sr-only" 
                  />
                  <div className="p-4 rounded-2xl border-2 border-slate-50 peer-checked:border-green-500 peer-checked:bg-green-50 transition-all text-center">
                    <div className={`h-16 rounded-xl mb-3 ${
                      t === 'light' ? 'bg-white border-2 border-slate-100' : 
                      t === 'dark' ? 'bg-slate-900' : 
                      'bg-gradient-to-br from-white to-slate-900 border-2 border-slate-100'
                    }`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 capitalize">{t}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Accent Color Section */}
          <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-8 shadow-xl shadow-slate-200/20">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
              <Palette className="h-5 w-5 text-green-500" />
              Brand Colors
            </h3>
            <div className="flex flex-wrap gap-4">
              {colors.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setAccentColor(color.hex)}
                  className={`h-14 w-14 rounded-2xl border-4 transition-all hover:scale-110 flex items-center justify-center ${
                    accentColor === color.hex ? "border-slate-900 shadow-xl" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.label}
                >
                  {accentColor === color.hex && <Check className="h-6 w-6 text-white" />}
                </button>
              ))}
            </div>
            <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Active Accent: <span className="font-mono text-slate-900 ml-1">{accentColor}</span>
            </p>
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-8 shadow-xl shadow-slate-200/20">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
              <Layout className="h-5 w-5 text-green-500" />
              Live Preview
            </h3>
            <div className={`p-8 rounded-[1.5rem] border-2 border-slate-50 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: accentColor }}>
                    <div className="h-4 w-4 bg-white rounded-full opacity-20" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="h-2 w-24 bg-slate-100 rounded" />
                    <div className="h-1.5 w-16 bg-slate-50 rounded" />
                  </div>
                </div>
                <div className="h-10 w-full rounded-lg" style={{ backgroundColor: `${accentColor}10`, color: accentColor }}>
                  <div className="h-full flex items-center px-4 font-bold text-[10px] uppercase tracking-widest">Primary Button</div>
                </div>
              </div>
            </div>
            <p className="mt-6 text-xs text-slate-400 font-medium italic text-center">
              Changes applied here will be visible across the entire administration interface.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}