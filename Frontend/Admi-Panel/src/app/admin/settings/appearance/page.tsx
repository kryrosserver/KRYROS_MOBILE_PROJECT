"use client";

import { useState, useRef, useEffect } from "react";
import { Palette, Layout, Check, ChevronLeft, Save, Sun, Moon, Monitor } from "lucide-react";
import Link from "next/link";
import { useAdminSettings } from "@/providers/AdminSettingsProvider";

const ACCENT = "#12D6C5";

const COLORS = [
  { label: "Kryros Teal",  hex: "#12D6C5" },
  { label: "Emerald",      hex: "#10b981" },
  { label: "Blue",         hex: "#3b82f6" },
  { label: "Violet",       hex: "#8b5cf6" },
  { label: "Amber",        hex: "#f59e0b" },
  { label: "Rose",         hex: "#ef4444" },
  { label: "Slate",        hex: "#0f172a" },
];

const THEMES = [
  { id: "light",  label: "Light",  icon: Sun },
  { id: "dark",   label: "Dark",   icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

export default function AppearanceSettingsPage() {
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
  const { accentColor, setAccentColor, theme, setTheme } = useAdminSettings();

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => { setIsSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }, 600);
  };

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
                  <span>/</span><span>Appearance</span>
                </div>
                <h1 className="text-2xl font-bold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>Appearance</h1>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Customize the look and feel of the admin dashboard</p>
              </div>
            </div>
            <button onClick={handleSave} disabled={isSaving}
              className="btn-primary flex items-center gap-2 px-5 h-10 disabled:opacity-60"
              style={saved ? { background: "#16C784" } : {}}>
              {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Saving…" : saved ? "Saved!" : "Save Appearance"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-5">

              {/* Theme Picker */}
              <div className="admin-card">
                <p className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                  <Monitor className="h-3.5 w-3.5" /> Interface Theme
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {THEMES.map(t => {
                    const isSelected = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id as any)}
                        className="p-4 rounded-2xl border-2 transition-all text-center"
                        style={isSelected
                          ? { borderColor: ACCENT, background: `${ACCENT}12` }
                          : { borderColor: "var(--card-border)", background: "var(--hover-bg)" }
                        }
                      >
                        <div className="h-14 rounded-xl mb-3 overflow-hidden" style={{
                          background: t.id === "light" ? "#f8fafc"
                            : t.id === "dark" ? "#0f172a"
                            : "linear-gradient(135deg, #f8fafc 50%, #0f172a 50%)",
                          border: "2px solid var(--card-border)"
                        }} />
                        <div className="flex items-center justify-center gap-1.5">
                          <t.icon className="h-3.5 w-3.5" style={{ color: isSelected ? ACCENT : "var(--text-muted)" }} />
                          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: isSelected ? ACCENT : "var(--text-muted)" }}>
                            {t.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color */}
              <div className="admin-card">
                <p className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                  <Palette className="h-3.5 w-3.5" /> Brand Accent Color
                </p>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map(c => (
                    <button
                      key={c.hex}
                      onClick={() => setAccentColor(c.hex)}
                      title={c.label}
                      className="h-12 w-12 rounded-2xl border-4 transition-all flex items-center justify-center"
                      style={{
                        background: c.hex,
                        borderColor: accentColor === c.hex ? "var(--text-primary)" : "transparent",
                        transform: accentColor === c.hex ? "scale(1.12)" : "scale(1)",
                        boxShadow: accentColor === c.hex ? `0 4px 16px ${c.hex}55` : "none",
                      }}
                    >
                      {accentColor === c.hex && <Check className="h-5 w-5 text-white" />}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-4 pt-4" style={{ borderTop: "1px solid var(--card-border)" }}>
                  <div className="h-8 w-8 rounded-xl" style={{ background: accentColor }} />
                  <div>
                    <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                      {COLORS.find(c => c.hex === accentColor)?.label ?? "Custom"}
                    </p>
                    <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{accentColor}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column — Live Preview */}
            <div className="admin-card">
              <p className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                <Layout className="h-3.5 w-3.5" /> Live Preview
              </p>
              <div className="rounded-2xl p-6" style={{ background: theme === "dark" ? "#0f172a" : "#f8fafc", border: "1px solid var(--card-border)" }}>
                {/* Fake sidebar + content */}
                <div className="flex gap-4">
                  <div className="w-32 rounded-xl p-3 space-y-2" style={{ background: theme === "dark" ? "#1e293b" : "#fff" }}>
                    {["Dashboard", "Products", "Orders", "Settings"].map((item, i) => (
                      <div key={item} className="h-7 rounded-lg flex items-center px-2 gap-2"
                        style={i === 0 ? { background: `${accentColor}18` } : {}}>
                        <div className="h-2.5 w-2.5 rounded-sm" style={{ background: i === 0 ? accentColor : (theme === "dark" ? "#334155" : "#e2e8f0") }} />
                        <div className="h-2 rounded flex-1" style={{ background: i === 0 ? accentColor : (theme === "dark" ? "#334155" : "#e2e8f0"), opacity: i === 0 ? 0.8 : 0.5 }} />
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {[0, 1].map(i => (
                        <div key={i} className="rounded-xl p-3" style={{ background: theme === "dark" ? "#1e293b" : "#fff" }}>
                          <div className="h-6 w-6 rounded-lg mb-2" style={{ background: `${accentColor}20` }}>
                            <div className="h-full w-full rounded-lg" style={{ background: accentColor, opacity: 0.5 }} />
                          </div>
                          <div className="h-2 rounded w-3/4 mb-1.5" style={{ background: theme === "dark" ? "#334155" : "#e2e8f0" }} />
                          <div className="h-4 rounded w-1/2" style={{ background: accentColor, opacity: 0.8 }} />
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl p-3" style={{ background: theme === "dark" ? "#1e293b" : "#fff" }}>
                      <div className="h-8 rounded-lg flex items-center justify-center font-bold text-[10px] uppercase tracking-widest" style={{ background: accentColor, color: "#fff" }}>
                        Primary Action Button
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs mt-4 text-center" style={{ color: "var(--text-muted)" }}>
                Changes apply across the entire admin interface
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
