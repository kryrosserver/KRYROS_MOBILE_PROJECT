"use client";

import { useEffect, useState } from "react";
import { 
  Sparkles, 
  RefreshCw,
  ChevronLeft,
  Layout,
  Type,
  Image as ImageIcon,
  Clock,
  CheckCircle2,
  Circle
} from "lucide-react";
import Link from "next/link";

export default function NewsletterPage() {
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
        setMessage("Newsletter popup updated successfully");
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
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Newsletter Popup</h1>
            <p className="text-slate-500 font-medium">Manage the lead capture popup on your site</p>
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
                onClick={() => setConfig({ ...config, newsletterPopupEnabled: !config.newsletterPopupEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  config.newsletterPopupEnabled ? "bg-[#1FA89A]" : "bg-slate-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.newsletterPopupEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <Type className="h-3 w-3" />
                  Popup Title
                </div>
                <input
                  value={config.newsletterPopupTitle || ""}
                  onChange={(e) => setConfig({ ...config, newsletterPopupTitle: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all font-medium text-slate-900"
                  placeholder="e.g. Unlock Premium Deals"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <Type className="h-3 w-3" />
                  Popup Subtitle
                </div>
                <textarea
                  value={config.newsletterPopupSubtitle || ""}
                  onChange={(e) => setConfig({ ...config, newsletterPopupSubtitle: e.target.value })}
                  className="w-full h-24 p-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all font-medium text-slate-900 resize-none"
                  placeholder="What's the value proposition?"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <ImageIcon className="h-3 w-3" />
                  Popup Image URL
                </div>
                <input
                  value={config.newsletterPopupImage || ""}
                  onChange={(e) => setConfig({ ...config, newsletterPopupImage: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all font-medium text-slate-900"
                  placeholder="e.g. https://images.unsplash.com/..."
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <Clock className="h-3 w-3" />
                  Display Delay (ms)
                </div>
                <input
                  type="number"
                  value={config.newsletterPopupDelay || 3000}
                  onChange={(e) => setConfig({ ...config, newsletterPopupDelay: parseInt(e.target.value) })}
                  className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all font-medium text-slate-900"
                  placeholder="e.g. 3000"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-8 shadow-xl shadow-slate-200/20 text-left">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6">Live Preview</h2>
              
              <div className="bg-slate-50 rounded-2xl p-8 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center min-h-[400px]">
                {!config.newsletterPopupEnabled && (
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">Newsletter Popup is Hidden</p>
                )}
                
                {config.newsletterPopupEnabled && (
                  <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
                    <div className="h-32 bg-slate-100 overflow-hidden">
                      {config.newsletterPopupImage ? (
                        <img src={config.newsletterPopupImage} className="h-full w-full object-cover" alt="Popup" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-300">
                          <ImageIcon className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                    <div className="p-8 text-center space-y-4">
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{config.newsletterPopupTitle || "Popup Title"}</h3>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{config.newsletterPopupSubtitle || "Popup subtitle text goes here."}</p>
                      <input 
                        type="email" 
                        disabled 
                        placeholder="Enter your email" 
                        className="w-full h-10 px-4 rounded-lg border border-slate-200 bg-slate-50 text-[10px]"
                      />
                      <button className="w-full h-10 bg-[#1FA89A] text-white rounded-lg font-black uppercase text-[10px] tracking-widest shadow-lg shadow-[#1FA89A]/20">
                        Subscribe Now
                      </button>
                    </div>
                  </div>
                )}
                
                <p className="mt-8 text-slate-400 font-medium text-[10px] max-w-xs text-center">
                  This popup will appear after the specified delay for new visitors.
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