"use client";

import { useEffect, useState } from "react";
import { 
  Megaphone, 
  RefreshCw,
  ChevronLeft,
  Layout,
  Type,
  Palette,
  Link as LinkIcon
} from "lucide-react";
import Link from "next/link";

export default function AnnouncementPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/footer/config", { cache: "no-store", credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms/footer/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
        credentials: "same-origin"
      });
      if (res.ok) {
        setMessage("Announcement bar updated successfully");
        setTimeout(() => setMessage(null), 3000);
      }
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
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Announcement Bar</h1>
            <p className="text-slate-500 font-medium">Configure the promotional bar at the top of your site</p>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving || !config}
          className="inline-flex items-center justify-center gap-2 px-8 py-2 bg-[#1FA89A] text-white rounded-xl hover:bg-[#168a7e] transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#1FA89A]/20"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {message && (
        <div className="p-4 bg-green-50 text-green-700 rounded-2xl border border-green-100 font-bold text-xs uppercase tracking-widest text-center animate-in fade-in zoom-in duration-300">
          {message}
        </div>
      )}

      {config && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settings */}
          <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-8 shadow-xl shadow-slate-200/20 text-left space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <Layout className="h-5 w-5 text-[#1FA89A]" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Visibility Settings</h2>
              </div>
              <button
                onClick={() => setConfig({ ...config, announcementBarEnabled: !config.announcementBarEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  config.announcementBarEnabled ? "bg-[#1FA89A]" : "bg-slate-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.announcementBarEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <Type className="h-3 w-3" />
                  Announcement Text
                </div>
                <textarea
                  value={config.announcementBarText || ""}
                  onChange={(e) => setConfig({ ...config, announcementBarText: e.target.value })}
                  className="w-full h-24 p-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all font-medium text-slate-900 resize-none"
                  placeholder="e.g. 30% discount on all products special for November!"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <LinkIcon className="h-3 w-3" />
                  Action Link
                </div>
                <input
                  value={config.announcementBarLink || ""}
                  onChange={(e) => setConfig({ ...config, announcementBarLink: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all font-medium text-slate-900"
                  placeholder="e.g. /shop or https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Palette className="h-3 w-3" />
                    Background Color
                  </div>
                  <input
                    value={config.announcementBarBgColor || ""}
                    onChange={(e) => setConfig({ ...config, announcementBarBgColor: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all font-medium text-slate-900"
                    placeholder="e.g. bg-kryros-dark"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Palette className="h-3 w-3" />
                    Text Color
                  </div>
                  <input
                    value={config.announcementBarTextColor || ""}
                    onChange={(e) => setConfig({ ...config, announcementBarTextColor: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all font-medium text-slate-900"
                    placeholder="e.g. text-kryros-green"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-8 shadow-xl shadow-slate-200/20 text-left">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6">Live Preview</h2>
              
              <div className="bg-slate-50 rounded-2xl p-8 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center min-h-[200px]">
                {!config.announcementBarEnabled && (
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">Announcement Bar is Hidden</p>
                )}
                
                {config.announcementBarEnabled && (
                  <div className={`w-full py-2 px-4 text-center text-xs font-bold uppercase tracking-widest rounded-lg shadow-sm ${config.announcementBarBgColor} ${config.announcementBarTextColor}`}>
                    {config.announcementBarText || "Announcement text will show here"}
                  </div>
                )}
                
                <p className="mt-8 text-slate-400 font-medium text-[10px] max-w-xs text-center">
                  This is how your announcement bar will appear at the very top of your storefront pages.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="py-20 text-center">
          <RefreshCw className="h-10 w-10 text-slate-200 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Loading Configuration...</p>
        </div>
      )}
    </div>
  );
}