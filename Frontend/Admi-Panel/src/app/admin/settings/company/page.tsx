"use client";

import { useState, useEffect } from "react";
import { 
  Building, Mail, Phone, MapPin, Clock, Upload, 
  ChevronLeft, Save, Check, Plus, Trash2, Calendar
} from "lucide-react";
import Link from "next/link";
import { useAdminSettings } from "@/providers/AdminSettingsProvider";

export default function CompanySettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newClosureDate, setNewClosureDate] = useState("");
  const [newClosureReason, setNewClosureReason] = useState("");
  const [currentCalculatedStatus, setCurrentCalculatedStatus] = useState<{ isClosed: boolean, reason: string }>({ isClosed: false, reason: "" });
  
  const { 
    companyName, setCompanyName, 
    logoDataUrl, setLogoDataUrl,
    openingTime, setOpeningTime,
    closingTime, setClosingTime,
    isStoreClosedManual, setIsStoreClosedManual,
    closedMessage, setClosedMessage,
    scheduledClosures, setScheduledClosures
  } = useAdminSettings();

  // Calculate current status for diagnostics
  useEffect(() => {
    const checkStatus = () => {
      if (isStoreClosedManual) {
        setCurrentCalculatedStatus({ isClosed: true, reason: "Manual Lock Active" });
        return;
      }

      // Check scheduled closures
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`;
      
      const todayClosure = scheduledClosures.find((c: any) => c.date === today);
      if (todayClosure) {
        setCurrentCalculatedStatus({ isClosed: true, reason: `Scheduled: ${todayClosure.reason}` });
        return;
      }

      // Check hours
      try {
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour + currentMinute / 60;
        
        const [startH, startM] = openingTime.split(":").map(Number);
        const [endH, endM] = closingTime.split(":").map(Number);
        
        const startTime = startH + (startM || 0) / 60;
        const endTime = endH + (endM || 0) / 60;
        
        let isClosedByHours = false;
        if (startTime < endTime) {
          isClosedByHours = currentTime < startTime || currentTime > endTime;
        } else {
          isClosedByHours = currentTime < startTime && currentTime > endTime;
        }

        if (isClosedByHours) {
          setCurrentCalculatedStatus({ isClosed: true, reason: `Outside Opening Hours (${openingTime} - ${closingTime})` });
        } else {
          setCurrentCalculatedStatus({ isClosed: false, reason: "Store is Open" });
        }
      } catch (e) {
        setCurrentCalculatedStatus({ isClosed: false, reason: "Store is Open" });
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [isStoreClosedManual, scheduledClosures, openingTime, closingTime]);

  // Load settings from backend on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          applySettings(data);
        }
      } catch (e) {
        console.error("Error fetching settings:", e);
      }
    };

    const applySettings = (data: any[]) => {
      const opening = data.find((s: any) => s.key === "opening_time")?.value;
      const closing = data.find((s: any) => s.key === "closing_time")?.value;
      const manual = data.find((s: any) => s.key === "is_store_closed_manual")?.value === "true";
      const message = data.find((s: any) => s.key === "store_closed_message")?.value;
      const scheduled = data.find((s: any) => s.key === "scheduled_closures")?.value;

      if (opening) setOpeningTime(opening);
      if (closing) setClosingTime(closing);
      if (manual !== undefined) setIsStoreClosedManual(manual);
      if (message) setClosedMessage(message);
      if (scheduled) {
        try {
          setScheduledClosures(JSON.parse(scheduled));
        } catch (e) {
          console.error("Error parsing scheduled closures", e);
        }
      }
    };

    fetchSettings();
  }, [setOpeningTime, setClosingTime, setIsStoreClosedManual, setClosedMessage, setScheduledClosures]);

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
    try {
      // Save to backend
      const settingsToSave = [
        { key: "opening_time", value: openingTime },
        { key: "closing_time", value: closingTime },
        { key: "is_store_closed_manual", value: String(isStoreClosedManual) },
        { key: "store_closed_message", value: closedMessage },
        { key: "scheduled_closures", value: JSON.stringify(scheduledClosures) },
      ];

      for (const setting of settingsToSave) {
        const res = await fetch(`/api/admin/settings/${setting.key}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: setting.value }),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to save ${setting.key}`);
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      console.error("Error saving settings:", e);
      alert(e.message || "Error saving settings. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const addScheduledClosure = () => {
    if (!newClosureDate) return;
    const newClosure = {
      id: Math.random().toString(36).substr(2, 9),
      date: newClosureDate,
      reason: newClosureReason || "Holiday/Special Event"
    };
    setScheduledClosures([...scheduledClosures, newClosure]);
    setNewClosureDate("");
    setNewClosureReason("");
  };

  const removeScheduledClosure = (id: string) => {
    setScheduledClosures(scheduledClosures.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6 pb-20">
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
        <div className="flex items-center gap-4">
          {/* Real-time Status Indicator */}
          <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border-2 ${
            currentCalculatedStatus.isClosed 
              ? "bg-red-50 border-red-100 text-red-600" 
              : "bg-green-50 border-green-100 text-green-600"
          }`}>
            <div className={`h-2 w-2 rounded-full animate-pulse ${
              currentCalculatedStatus.isClosed ? "bg-red-500" : "bg-green-500"
            }`} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {currentCalculatedStatus.isClosed ? "Store Locked" : "Store Active"}
            </span>
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
      </div>

      {currentCalculatedStatus.isClosed && (
        <div className="bg-red-50 border-2 border-red-200 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-red-500/10 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 animate-pulse">
              <Clock className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xl font-black text-red-900 uppercase tracking-tight">Store is Currently Locked</p>
              <p className="text-sm text-red-600 font-bold uppercase tracking-widest opacity-80">Reason: {currentCalculatedStatus.reason}</p>
            </div>
          </div>
          {isStoreClosedManual ? (
            <button 
              onClick={async () => {
                setIsStoreClosedManual(false);
                try {
                  const res = await fetch(`/api/admin/settings/is_store_closed_manual`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ value: "false" }),
                  });
                  if (!res.ok) throw new Error("Failed to re-open");
                  setSaved(true);
                  setTimeout(() => setSaved(false), 2000);
                } catch (e) {
                  setIsStoreClosedManual(true);
                  alert("Failed to re-open store. Please try again.");
                }
              }}
              className="w-full md:w-auto px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95"
            >
              Unlock Store Now
            </button>
          ) : (
            <p className="text-xs font-bold text-red-400 uppercase tracking-widest text-center md:text-right">
              {currentCalculatedStatus.reason.includes('Hours') 
                ? "Adjust Opening Hours below to open the store." 
                : "Remove Scheduled Closure below to open the store."}
            </p>
          )}
        </div>
      )}

      {!currentCalculatedStatus.isClosed && (
        <div className="bg-green-50 border-2 border-green-100 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-green-500/5">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <Check className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xl font-black text-green-900 uppercase tracking-tight">Store is Active</p>
              <p className="text-sm text-green-600 font-bold uppercase tracking-widest opacity-80">Following standard hours</p>
            </div>
          </div>
          <button 
            onClick={async () => {
              if (confirm("Are you sure you want to INSTANTLY LOCK the store? Customers will not be able to purchase anything.")) {
                setIsStoreClosedManual(true);
                try {
                  const res = await fetch(`/api/admin/settings/is_store_closed_manual`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ value: "true" }),
                  });
                  if (!res.ok) throw new Error("Failed to lock");
                  setSaved(true);
                  setTimeout(() => setSaved(false), 2000);
                } catch (e) {
                  setIsStoreClosedManual(false);
                  alert("Failed to lock store. Please try again.");
                }
              }
            }}
            className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
          >
            Instant Store Lock
          </button>
        </div>
      )}

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

        {/* Store Availability Section */}
        <div className="mt-12 pt-8 border-t border-slate-50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Store Availability</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setOpeningTime("08:00");
                  setClosingTime("18:00");
                  setIsStoreClosedManual(false);
                  setClosedMessage("We are currently closed. Please come back later.");
                  setScheduledClosures([]);
                }}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
              >
                Reset to Defaults
              </button>
              <div className="flex items-center gap-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Manual Store Closure</label>
                <button
                  onClick={async () => {
                    const newValue = !isStoreClosedManual;
                    setIsStoreClosedManual(newValue);
                    // Instant save for this critical toggle
                    try {
                      await fetch(`/api/admin/settings/is_store_closed_manual`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ value: String(newValue) }),
                      });
                      setSaved(true);
                      setTimeout(() => setSaved(false), 2000);
                    } catch (e) {
                      console.error("Failed to toggle store status", e);
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    isStoreClosedManual ? 'bg-red-500' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isStoreClosedManual ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Opening Time</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="time"
                      value={openingTime}
                      onChange={(e) => setOpeningTime(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-green-500 focus:bg-white outline-none transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Closing Time</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="time"
                      value={closingTime}
                      onChange={(e) => setClosingTime(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-green-500 focus:bg-white outline-none transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Closed Store Message</label>
                <textarea
                  value={closedMessage}
                  onChange={(e) => setClosedMessage(e.target.value)}
                  placeholder="Message to show when the store is closed..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-green-500 focus:bg-white outline-none transition-all font-medium resize-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scheduled Closures (Specific Days)</label>
              </div>
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={newClosureDate}
                    onChange={(e) => setNewClosureDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-green-500 focus:bg-white outline-none transition-all text-xs font-medium"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Reason (e.g. New Year)"
                  value={newClosureReason}
                  onChange={(e) => setNewClosureReason(e.target.value)}
                  className="flex-[1.5] px-4 py-2 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-green-500 focus:bg-white outline-none transition-all text-xs font-medium"
                />
                <button
                  onClick={addScheduledClosure}
                  className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {scheduledClosures.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No scheduled closures</p>
                  </div>
                ) : (
                  scheduledClosures.map((closure) => (
                    <div key={closure.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{new Date(closure.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          <p className="text-[10px] font-medium text-slate-400">{closure.reason}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeScheduledClosure(closure.id)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <p className="mt-4 text-[10px] text-slate-400 font-medium">
            When the store is closed (manually, by time, or scheduled), users will be able to browse products but won't be able to add items to their cart or checkout.
          </p>
        </div>
      </div>
    </div>
  );
}
