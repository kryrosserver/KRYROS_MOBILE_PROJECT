"use client";

import { useState } from "react";
import { 
  Building, Mail, Phone, Globe, MapPin, Clock, Upload, 
  ChevronLeft, Save, Check
} from "lucide-react";
import Link from "next/link";
import { useAdminSettings } from "@/providers/AdminSettingsProvider";

export default function CompanySettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const { 
    companyName, setCompanyName, 
    logoDataUrl, setLogoDataUrl 
  } = useAdminSettings();

  const companySettings = {
    email: "kryrosmobile@gmail.com",
    phone: "+260966423719",
    address: "Across the Globe",
    website: "https://kryrosmobile.com",
    timezone: "Africa/Lusaka",
    currency: "USD"
  };

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/settings" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Company Profile</h1>
            <p className="text-slate-500 text-sm">Manage your business identity and contact info</p>
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
          {isSaving ? "Saving..." : saved ? "Saved!" : "Save Profile"}
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-8 shadow-xl shadow-slate-200/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Company Name</label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e)=> setCompanyName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-green-500 focus:bg-white outline-none transition-all font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Support Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  defaultValue={companySettings.email}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-green-500 focus:bg-white outline-none transition-all font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  defaultValue={companySettings.phone}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-green-500 focus:bg-white outline-none transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Timezone</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                  defaultValue={companySettings.timezone}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-green-500 focus:bg-white outline-none transition-all font-medium appearance-none"
                >
                  <option value="Africa/Lusaka">Africa/Lusaka (GMT+2)</option>
                  <option value="UTC">UTC (GMT+0)</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Office Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                <textarea
                  defaultValue={companySettings.address}
                  rows={3}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-green-500 focus:bg-white outline-none transition-all font-medium resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logo Section */}
        <div className="mt-12 pt-8 border-t border-slate-50">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6">Brand Assets</h3>
          <div className="flex items-center gap-8">
            <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center bg-slate-50">
              {logoDataUrl ? (
                <img src={logoDataUrl} alt="logo" className="h-full w-full object-contain p-2" />
              ) : (
                <span className="text-3xl font-black text-slate-200">{(companyName || "K")[0]}</span>
              )}
            </div>
            <div className="space-y-3">
              <label className="inline-flex items-center gap-2 px-6 py-2 bg-white border-2 border-slate-100 text-slate-700 rounded-xl hover:border-green-500/30 hover:bg-green-50 transition-all cursor-pointer font-bold text-xs uppercase tracking-widest">
                <Upload className="h-4 w-4" />
                <span>Upload Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => setLogoDataUrl(ev.target?.result as string);
                    reader.readAsDataURL(f);
                  }}
                />
              </label>
              <p className="text-[10px] text-slate-400 font-medium">PNG or SVG. Recommended size 512x512px.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}