"use client";

import { useState, useEffect, useRef } from "react";
import {
  Building, Mail, Phone, MapPin, Clock, Upload,
  ChevronLeft, Save, Check, Plus, Trash2, Calendar,
  Lock, Unlock, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { useAdminSettings } from "@/providers/AdminSettingsProvider";

const ACCENT = "#12D6C5";

function ToggleSwitch({ checked, onChange, danger }: { checked: boolean; onChange: (v: boolean) => void; danger?: boolean }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shrink-0"
      style={{ background: checked ? (danger ? "#EF4444" : ACCENT) : "var(--icon-bg)" }}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
        style={{ transform: checked ? "translateX(1.375rem)" : "translateX(0.25rem)" }}
      />
    </button>
  );
}

export default function CompanySettingsPage() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf: number;
    function applyHeight(s: number) { if (!innerRef.current || !outerRef.current) return; outerRef.current.style.height = "auto"; const h = innerRef.current.scrollHeight * s; const avail = window.innerWidth < 1024 ? window.innerHeight - 64 : Infinity; outerRef.current.style.height = `${Math.max(h, avail)}px`; }
    function recalc() { if (!innerRef.current || !outerRef.current) return; const vw = outerRef.current.offsetWidth || window.innerWidth; const base = vw < 960 ? 750 : 1380; if (vw <= 599) { innerRef.current.style.width = "750px"; innerRef.current.style.transform = "none"; innerRef.current.style.transformOrigin = "top left"; if (outerRef.current) { outerRef.current.style.overflowX = "auto"; outerRef.current.style.height = "auto"; } return; } if (outerRef.current) outerRef.current.style.overflowX = "hidden"; const s = Math.min(1, vw / base); innerRef.current.style.width = `${base}px`; innerRef.current.style.transform = `scale(${s})`; innerRef.current.style.transformOrigin = "top left"; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(s))); }
    recalc(); const t = setTimeout(recalc, 400); window.addEventListener("resize", recalc); return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newClosureDate, setNewClosureDate] = useState("");
  const [newClosureReason, setNewClosureReason] = useState("");
  const [currentStatus, setCurrentStatus] = useState<{ isClosed: boolean; reason: string }>({ isClosed: false, reason: "" });

  const {
    companyName, setCompanyName,
    logoDataUrl, setLogoDataUrl,
    openingTime, setOpeningTime,
    closingTime, setClosingTime,
    isStoreClosedManual, setIsStoreClosedManual,
    closedMessage, setClosedMessage,
    scheduledClosures, setScheduledClosures,
  } = useAdminSettings();

  useEffect(() => {
    const check = () => {
      if (isStoreClosedManual) { setCurrentStatus({ isClosed: true, reason: "Manual Lock Active" }); return; }
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const closure = scheduledClosures.find((c: any) => c.date === today);
      if (closure) { setCurrentStatus({ isClosed: true, reason: `Scheduled: ${closure.reason}` }); return; }
      try {
        const cur = now.getHours() + now.getMinutes() / 60;
        const [sh, sm] = openingTime.split(":").map(Number);
        const [eh, em] = closingTime.split(":").map(Number);
        const start = sh + (sm || 0) / 60, end = eh + (em || 0) / 60;
        const closed = start < end ? (cur < start || cur > end) : (cur < start && cur > end);
        setCurrentStatus(closed ? { isClosed: true, reason: `Outside Hours (${openingTime}–${closingTime})` } : { isClosed: false, reason: "Store is Open" });
      } catch { setCurrentStatus({ isClosed: false, reason: "Store is Open" }); }
    };
    check();
    const t = setInterval(check, 10000);
    return () => clearInterval(t);
  }, [isStoreClosedManual, scheduledClosures, openingTime, closingTime]);

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.ok ? r.json() : null).then(data => {
      if (!data) return;
      const g = (k: string) => data.find((s: any) => s.key === k)?.value;
      if (g("opening_time")) setOpeningTime(g("opening_time"));
      if (g("closing_time")) setClosingTime(g("closing_time"));
      if (g("is_store_closed_manual")) setIsStoreClosedManual(g("is_store_closed_manual") === "true");
      if (g("store_closed_message")) setClosedMessage(g("store_closed_message"));
      if (g("scheduled_closures")) { try { setScheduledClosures(JSON.parse(g("scheduled_closures"))); } catch { /* ignore */ } }
    }).catch(() => { /* ignore */ });
  }, [setOpeningTime, setClosingTime, setIsStoreClosedManual, setClosedMessage, setScheduledClosures]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const keys = [
        { key: "opening_time", value: openingTime },
        { key: "closing_time", value: closingTime },
        { key: "is_store_closed_manual", value: String(isStoreClosedManual) },
        { key: "store_closed_message", value: closedMessage },
        { key: "scheduled_closures", value: JSON.stringify(scheduledClosures) },
      ];
      for (const s of keys) {
        const r = await fetch(`/api/admin/settings/${s.key}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ value: s.value }) });
        if (!r.ok) throw new Error(`Failed to save ${s.key}`);
      }
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (e: unknown) { alert(e instanceof Error ? e.message : "Error saving settings"); }
    finally { setIsSaving(false); }
  };

  const toggleLock = async (lock: boolean) => {
    if (lock && !confirm("Lock the store? Customers will not be able to purchase.")) return;
    setIsStoreClosedManual(lock);
    try {
      const r = await fetch("/api/admin/settings/is_store_closed_manual", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ value: String(lock) }) });
      if (!r.ok) { setIsStoreClosedManual(!lock); alert("Failed. Please try again."); }
      else { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    } catch { setIsStoreClosedManual(!lock); }
  };

  const Field = ({ label, icon: Icon, children }: { label: string; icon?: any; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "var(--text-muted)" }} />}
        {children}
      </div>
    </div>
  );

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: "var(--bg-primary)", margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: "var(--bg-primary)", padding: "24px" }}>
        <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)" }}>

          {/* Header */}
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/admin/settings" className="h-9 w-9 rounded-xl flex items-center justify-center btn-secondary !px-0">
                <ChevronLeft className="h-4 w-4" />
              </Link>
              <div>
                <div className="flex items-center gap-2 text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>
                  <Link href="/admin/settings" style={{ color: "var(--text-muted)" }}>Settings</Link>
                  <span>/</span><span>Company</span>
                </div>
                <h1 className="text-2xl font-bold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>Company Profile</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Live store status */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                style={currentStatus.isClosed
                  ? { background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }
                  : { background: "rgba(22,199,132,0.12)", color: "#16C784", border: "1px solid rgba(22,199,132,0.25)" }
                }>
                <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: currentStatus.isClosed ? "#EF4444" : "#16C784" }} />
                {currentStatus.isClosed ? "Store Locked" : "Store Active"}
              </div>
              <button onClick={handleSave} disabled={isSaving}
                className="btn-primary flex items-center gap-2 px-5 h-10 disabled:opacity-60"
                style={saved ? { background: "#16C784" } : {}}>
                {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {isSaving ? "Saving…" : saved ? "Saved!" : "Save Profile"}
              </button>
            </div>
          </div>

          {/* Store lock banner */}
          {currentStatus.isClosed ? (
            <div className="admin-card flex flex-row items-center justify-between gap-4 !p-5" style={{ border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.06)" }}>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center animate-pulse" style={{ background: "rgba(239,68,68,0.15)" }}>
                  <Lock className="h-5 w-5" style={{ color: "#EF4444" }} />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: "#EF4444" }}>Store is Currently Locked</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Reason: {currentStatus.reason}</p>
                </div>
              </div>
              {isStoreClosedManual && (
                <button onClick={() => toggleLock(false)} className="px-5 h-10 rounded-xl text-sm font-bold transition-all" style={{ background: "#EF4444", color: "#fff" }}>
                  Unlock Store Now
                </button>
              )}
            </div>
          ) : (
            <div className="admin-card flex flex-row items-center justify-between gap-4 !p-5" style={{ border: "1px solid rgba(22,199,132,0.2)", background: "rgba(22,199,132,0.05)" }}>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(22,199,132,0.15)" }}>
                  <Unlock className="h-5 w-5" style={{ color: "#16C784" }} />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: "#16C784" }}>Store is Active</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Following standard opening hours</p>
                </div>
              </div>
              <button onClick={() => toggleLock(true)} className="px-5 h-10 rounded-xl text-sm font-bold transition-all btn-secondary" style={{ color: "#EF4444", borderColor: "rgba(239,68,68,0.3)" }}>
                <Lock className="h-4 w-4 inline mr-1.5" /> Instant Store Lock
              </button>
            </div>
          )}

          {/* Company Info + Logo */}
          <div className="admin-card">
            <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "var(--text-muted)" }}>Business Identity</p>
            <div className="grid grid-cols-2 gap-6">
              {/* Left */}
              <div className="space-y-4">
                <Field label="Company Name" icon={Building}>
                  <input value={companyName} onChange={e => setCompanyName(e.target.value)} className="admin-input pl-10 w-full" placeholder="e.g. Kryros Mobile" />
                </Field>
                <Field label="Support Email" icon={Mail}>
                  <input type="email" defaultValue="kryrosmobile@gmail.com" className="admin-input pl-10 w-full" />
                </Field>
                <Field label="Phone Number" icon={Phone}>
                  <input type="tel" defaultValue="+260966423719" className="admin-input pl-10 w-full" />
                </Field>
              </div>
              {/* Right */}
              <div className="space-y-4">
                <Field label="Timezone" icon={Clock}>
                  <select defaultValue="Africa/Lusaka" className="admin-input pl-10 w-full">
                    <option value="Africa/Lusaka">Africa/Lusaka (GMT+2)</option>
                    <option value="UTC">UTC (GMT+0)</option>
                  </select>
                </Field>
                <Field label="Office Address" icon={MapPin}>
                  <MapPin className="absolute left-3 top-3 h-4 w-4 pointer-events-none" style={{ color: "var(--text-muted)" }} />
                  <textarea defaultValue="Across the Globe" rows={3} className="admin-input pl-10 w-full resize-none" />
                </Field>
              </div>
            </div>

            {/* Logo */}
            <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--card-border)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>Brand Logo</p>
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-dashed" style={{ borderColor: "var(--card-border)", background: "var(--hover-bg)" }}>
                  {logoDataUrl
                    ? <img src={logoDataUrl} alt="logo" className="h-full w-full object-contain p-2" />
                    : <span className="text-3xl font-black" style={{ color: "var(--text-muted)" }}>{(companyName || "K")[0]}</span>}
                </div>
                <div>
                  <label className="btn-secondary flex items-center gap-2 px-4 h-9 cursor-pointer">
                    <Upload className="h-4 w-4" /> Upload Logo
                    <input type="file" accept="image/*" className="hidden" onChange={async e => {
                      const f = e.target.files?.[0]; if (!f) return;
                      const reader = new FileReader();
                      reader.onload = ev => setLogoDataUrl(ev.target?.result as string);
                      reader.readAsDataURL(f);
                    }} />
                  </label>
                  <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>PNG or SVG, 512×512px recommended</p>
                </div>
              </div>
            </div>
          </div>

          {/* Store Availability */}
          <div className="admin-card">
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Store Availability</p>
              <div className="flex items-center gap-4">
                <button onClick={() => { setOpeningTime("08:00"); setClosingTime("18:00"); setIsStoreClosedManual(false); setClosedMessage("We are currently closed."); setScheduledClosures([]); }}
                  className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Reset Defaults</button>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Manual Lock</span>
                  <ToggleSwitch checked={isStoreClosedManual} onChange={v => toggleLock(v)} danger />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Opening Time" icon={Clock}>
                    <input type="time" value={openingTime} onChange={e => setOpeningTime(e.target.value)} className="admin-input pl-10 w-full" />
                  </Field>
                  <Field label="Closing Time" icon={Clock}>
                    <input type="time" value={closingTime} onChange={e => setClosingTime(e.target.value)} className="admin-input pl-10 w-full" />
                  </Field>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>Closed Store Message</label>
                  <textarea value={closedMessage} onChange={e => setClosedMessage(e.target.value)} rows={3} className="admin-input w-full resize-none" placeholder="Message shown when store is closed…" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>Scheduled Closures</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "var(--text-muted)" }} />
                    <input type="date" value={newClosureDate} onChange={e => setNewClosureDate(e.target.value)} className="admin-input pl-10 w-full" />
                  </div>
                  <input placeholder="Reason (e.g. Holiday)" value={newClosureReason} onChange={e => setNewClosureReason(e.target.value)} className="admin-input flex-1" />
                  <button onClick={() => {
                    if (!newClosureDate) return;
                    setScheduledClosures([...scheduledClosures, { id: Math.random().toString(36).slice(2), date: newClosureDate, reason: newClosureReason || "Holiday" }]);
                    setNewClosureDate(""); setNewClosureReason("");
                  }} className="btn-primary h-10 px-4 flex items-center gap-1 shrink-0">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {scheduledClosures.length === 0 ? (
                    <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>No scheduled closures</p>
                  ) : scheduledClosures.map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: "var(--hover-bg)" }}>
                      <div>
                        <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{c.date}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{c.reason}</p>
                      </div>
                      <button onClick={() => setScheduledClosures(scheduledClosures.filter((x: any) => x.id !== c.id))}
                        className="h-7 w-7 rounded-lg flex items-center justify-center"
                        style={{ color: "#EF4444" }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
