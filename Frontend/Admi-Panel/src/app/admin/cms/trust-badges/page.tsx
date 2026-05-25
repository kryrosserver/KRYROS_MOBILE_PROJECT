"use client";

import { useEffect, useState, useRef } from "react";
import { RefreshCw, Plus, Trash2, Save, Shield, Bell, Calendar, Sun, Moon, Menu, ChevronDown, Search } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

const ACCENT = "#12D6C5";
const MOBILE_BASE = 750;
const DESKTOP_BASE = 1380;
const ICON_OPTIONS = ["Truck", "ShieldCheck", "RefreshCcw", "Headphones", "Star", "Zap", "Gift", "Heart"];
const DEFAULT_ITEMS = [
  { icon: "Truck", title: "Free Shipping", subtitle: "On orders over $100" },
  { icon: "ShieldCheck", title: "Secure Payments", subtitle: "100% Secure" },
  { icon: "RefreshCcw", title: "Easy Returns", subtitle: "7-Day Returns" },
  { icon: "Headphones", title: "24/7 Support", subtitle: "We are here" },
];

export default function TrustBadgesPage() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const { isDark, toggleTheme } = useTheme();
  const BG = "var(--bg-primary)"; const CARD = "var(--card-bg)"; const BORDER = "var(--card-border)";
  const TEXT = "var(--text-primary)"; const TEXT2 = "var(--text-secondary)"; const HOVER = "var(--hover-bg)";
  const HEADER_BG = "var(--bg-secondary)"; const ICON_BG = "var(--icon-bg)";

  useEffect(() => {
    let raf: number;
    function applyHeight(s: number) { if (!innerRef.current || !outerRef.current) return; outerRef.current.style.height = "auto"; outerRef.current.style.height = `${innerRef.current.scrollHeight * s}px`; }
    function recalc() { if (!innerRef.current || !outerRef.current) return; const vw = outerRef.current.offsetWidth || window.innerWidth; const baseW = vw < 960 ? MOBILE_BASE : DESKTOP_BASE; if (vw <= 599) { innerRef.current.style.width = "750px"; innerRef.current.style.transform = "none"; innerRef.current.style.transformOrigin = "top left"; if (outerRef.current) { outerRef.current.style.overflowX = "auto"; outerRef.current.style.height = "auto"; } return; } if (outerRef.current) outerRef.current.style.overflowX = "hidden"; const s = Math.min(1, vw / baseW); innerRef.current.style.width = `${baseW}px`; innerRef.current.style.transform = `scale(${s})`; innerRef.current.style.transformOrigin = "top left"; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(s))); }
    recalc(); const t = setTimeout(recalc, 400); window.addEventListener("resize", recalc); return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);

  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/site-config/trust-badges", { cache: "no-store" });
      if (res.ok) { const d = await res.json(); if (d?.value?.items) setItems(d.value.items); }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms/site-config/trust-badges", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "trust-badges", value: { items } }) });
      if (res.ok) { setMsg("Saved!"); setTimeout(() => setMsg(null), 2000); }
    } finally { setSaving(false); }
  };

  const card = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14 };

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: BG, margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: BG, color: TEXT, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <header style={{ background: HEADER_BG, borderBottom: `1px solid ${BORDER}`, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}><Menu style={{ width: 20, height: 20 }} /></button>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: TEXT, whiteSpace: "nowrap", margin: 0 }}>Trust Badges</h1>
          </div>
          <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: TEXT2, width: 15, height: 15 }} />
            <input placeholder="Search..." style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "8px 40px 8px 36px", color: TEXT, fontSize: 13, outline: "none" }} />
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: TEXT2, background: ICON_BG, padding: "2px 5px", borderRadius: 4 }}>⌘K</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ position: "relative", background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>
              <Bell style={{ width: 20, height: 20 }} /><span style={{ position: "absolute", top: 0, right: 0, background: "#EF4444", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>1</span>
            </button>
            <button onClick={toggleTheme} style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>{isDark ? <Sun style={{ width: 20, height: 20 }} /> : <Moon style={{ width: 20, height: 20 }} />}</button>
            <button style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "7px 14px", color: TEXT2, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
              <Calendar style={{ width: 14, height: 14 }} /> May 20 – May 26, 2025 <ChevronDown style={{ width: 13, height: 13 }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0B1320" }}>K</div>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: TEXT, lineHeight: 1 }}>Admin</div><div style={{ fontSize: 10, color: TEXT2, marginTop: 1 }}>Super Admin</div></div>
              <ChevronDown style={{ width: 14, height: 14, color: TEXT2 }} />
            </div>
          </div>
        </header>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>Trust Badges</h2>
              <p style={{ fontSize: 12, color: TEXT2, marginTop: 4 }}>Configure trust signals shown across your storefront</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setItems([...items, { icon: "Star", title: "New Badge", subtitle: "Description" }])}
                style={{ display: "flex", alignItems: "center", gap: 6, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 16px", color: TEXT2, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                <Plus style={{ width: 14, height: 14 }} /> Add Badge
              </button>
              <button onClick={handleSave} disabled={saving}
                style={{ background: ACCENT, border: "none", padding: "9px 18px", color: "#0B1320", fontWeight: 700, fontSize: 13, cursor: "pointer", borderRadius: 10 }}>
                <Save style={{ width: 14, height: 14, display: "inline", marginRight: 6 }} />{saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {msg && <div style={{ background: "rgba(22,199,132,0.1)", border: "1px solid rgba(22,199,132,0.25)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#16C784", fontWeight: 600 }}>{msg}</div>}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
            {loading ? [...Array(4)].map((_, i) => <div key={i} style={{ ...card, padding: 20, height: 100 }}><div style={{ height: "100%", borderRadius: 10, background: HOVER }} /></div>) :
              items.map((item, idx) => (
                <div key={idx} style={{ ...card, padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${ACCENT}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Shield style={{ width: 18, height: 18, color: ACCENT }} />
                    </div>
                    <button onClick={() => setItems(items.filter((_, i) => i !== idx))}
                      style={{ padding: 6, borderRadius: 8, border: `1px solid ${BORDER}`, background: CARD, color: "#EF4444", cursor: "pointer" }}>
                      <Trash2 style={{ width: 13, height: 13 }} />
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: TEXT2, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Icon</div>
                      <select value={item.icon} onChange={e => setItems(items.map((it, i) => i === idx ? { ...it, icon: e.target.value } : it))}
                        style={{ width: "100%", background: ICON_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "8px 12px", color: TEXT, fontSize: 13, outline: "none", appearance: "none" }}>
                        {ICON_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: TEXT2, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Title</div>
                      <input value={item.title} onChange={e => setItems(items.map((it, i) => i === idx ? { ...it, title: e.target.value } : it))}
                        style={{ width: "100%", background: ICON_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "8px 12px", color: TEXT, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: TEXT2, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Subtitle</div>
                      <input value={item.subtitle} onChange={e => setItems(items.map((it, i) => i === idx ? { ...it, subtitle: e.target.value } : it))}
                        style={{ width: "100%", background: ICON_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "8px 12px", color: TEXT, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
