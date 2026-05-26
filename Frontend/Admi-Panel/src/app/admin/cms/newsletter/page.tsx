"use client";

import { useEffect, useState, useRef } from "react";
import {
  Bell, Sun, Moon, Menu, ChevronDown, Save, ArrowLeft,
  Type, Image as ImageIcon, Clock, Layout, RefreshCw, CheckCircle, X,
} from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import Link from "next/link";

const ACCENT = "#12D6C5";

export default function NewsletterPage() {
  const { isDark, toggleTheme } = useTheme();

  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const BG = "var(--bg-primary)";
  const CARD = "var(--card-bg)";
  const BORDER = "var(--card-border)";
  const TEXT = "var(--text-primary)";
  const TEXT2 = "var(--text-secondary)";
  const HOVER = "var(--hover-bg)";
  const HEADER_BG = "var(--bg-secondary)";

  useEffect(() => {}, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/footer/config", { cache: "no-store", credentials: "same-origin" });
      if (res.ok) setConfig(await res.json());
    } finally { setLoading(false); }
  };

  useEffect(() => { loadConfig(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms/footer/config", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config), credentials: "same-origin",
      });
      if (res.ok) { setToast("Newsletter popup updated successfully"); setTimeout(() => setToast(null), 3000); }
    } finally { setSaving(false); }
  };

  const inp: React.CSSProperties = { width: "100%", background: HOVER, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 14px", color: TEXT, fontSize: 13, outline: "none" };
  const lbl: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 800, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 };
  const card: React.CSSProperties = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px" };

  return (
    <div style={{ overflow: "hidden", background: BG, margin: "-24px", width: "calc(100% + 48px)" }}>
      <div style={{ background: BG, color: TEXT, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* HEADER */}
        <header style={{ background: HEADER_BG, borderBottom: `1px solid ${BORDER}`, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", gap: 16, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}><Menu style={{ width: 20, height: 20 }} /></button>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: TEXT, whiteSpace: "nowrap", margin: 0 }}>Newsletter Popup</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ position: "relative", background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>
              <Bell style={{ width: 20, height: 20 }} />
              <span style={{ position: "absolute", top: 0, right: 0, background: "#EF4444", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>1</span>
            </button>
            <button onClick={toggleTheme} style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>{isDark ? <Sun style={{ width: 20, height: 20 }} /> : <Moon style={{ width: 20, height: 20 }} />}</button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0B1320" }}>K</div>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: TEXT, lineHeight: 1 }}>Admin</div><div style={{ fontSize: 10, color: TEXT2 }}>Super Admin</div></div>
              <ChevronDown style={{ width: 14, height: 14, color: TEXT2 }} />
            </div>
          </div>
        </header>

        {/* BODY */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Page title */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><Link href="/admin/cms" style={{ display: "flex", alignItems: "center", gap: 6, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "5px 12px", color: TEXT2, fontSize: 12, textDecoration: "none" }}><ArrowLeft style={{ width: 13, height: 13 }} /> Back to CMS</Link></div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>Newsletter Popup</h2>
              <p style={{ fontSize: 13, color: TEXT2, marginTop: 4 }}>Manage the lead capture popup on your store</p>
            </div>
            <button onClick={handleSave} disabled={saving || !config}
              style={{ display: "flex", alignItems: "center", gap: 8, background: ACCENT, border: "none", borderRadius: 10, padding: "10px 22px", color: "#0B1320", fontWeight: 800, fontSize: 13, cursor: saving || !config ? "not-allowed" : "pointer", opacity: saving || !config ? 0.7 : 1 }}>
              <Save style={{ width: 15, height: 15 }} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* Toast */}
          {toast && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", fontSize: 13, fontWeight: 700, color: "#22C55E" }}>
              <CheckCircle style={{ width: 18, height: 18 }} />
              {toast}
              <button onClick={() => setToast(null)} style={{ marginLeft: "auto", background: "transparent", border: "none", cursor: "pointer", color: "#22C55E" }}><X style={{ width: 16, height: 16 }} /></button>
            </div>
          )}

          {loading && (
            <div style={{ ...card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
              <RefreshCw style={{ width: 32, height: 32, color: TEXT2, opacity: 0.3 }} />
              <p style={{ color: TEXT2, fontWeight: 700, fontSize: 13, marginTop: 12 }}>Loading Configuration...</p>
            </div>
          )}

          {config && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{alignItems: "start"}}>

              {/* Settings */}
              <div style={card}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 16, borderBottom: `1px solid ${BORDER}`, marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Layout style={{ width: 16, height: 16, color: ACCENT }} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: TEXT, textTransform: "uppercase", letterSpacing: "0.06em" }}>Visibility Settings</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: TEXT2 }}>{config.newsletterPopupEnabled ? "Enabled" : "Disabled"}</span>
                    <div onClick={() => setConfig({ ...config, newsletterPopupEnabled: !config.newsletterPopupEnabled })}
                      style={{ width: 42, height: 23, borderRadius: 12, background: config.newsletterPopupEnabled ? ACCENT : HOVER, border: `1px solid ${BORDER}`, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                      <div style={{ position: "absolute", top: 3, left: config.newsletterPopupEnabled ? 20 : 3, width: 17, height: 17, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={lbl}><Type style={{ width: 12, height: 12 }} /> Popup Title</label>
                    <input value={config.newsletterPopupTitle || ""} onChange={e => setConfig({ ...config, newsletterPopupTitle: e.target.value })} style={inp} placeholder="e.g. Unlock Premium Deals" />
                  </div>
                  <div>
                    <label style={lbl}><Type style={{ width: 12, height: 12 }} /> Popup Subtitle</label>
                    <textarea value={config.newsletterPopupSubtitle || ""} onChange={e => setConfig({ ...config, newsletterPopupSubtitle: e.target.value })}
                      rows={3} style={{ ...inp, resize: "none" }} placeholder="What's the value proposition?" />
                  </div>
                  <div>
                    <label style={lbl}><ImageIcon style={{ width: 12, height: 12 }} /> Popup Image URL</label>
                    <input value={config.newsletterPopupImage || ""} onChange={e => setConfig({ ...config, newsletterPopupImage: e.target.value })} style={inp} placeholder="https://..." />
                  </div>
                  <div>
                    <label style={lbl}><Clock style={{ width: 12, height: 12 }} /> Display Delay (ms)</label>
                    <input type="number" value={config.newsletterPopupDelay || 3000} onChange={e => setConfig({ ...config, newsletterPopupDelay: parseInt(e.target.value) })} style={inp} placeholder="e.g. 3000" />
                    <p style={{ fontSize: 10, color: TEXT2, marginTop: 4 }}>How many milliseconds after page load before the popup appears</p>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div style={card}>
                <div style={{ paddingBottom: 16, borderBottom: `1px solid ${BORDER}`, marginBottom: 20 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: TEXT, textTransform: "uppercase", letterSpacing: "0.06em" }}>Live Preview</span>
                </div>
                <div style={{ background: HOVER, borderRadius: 16, padding: 24, border: `2px dashed ${BORDER}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 380 }}>
                  {!config.newsletterPopupEnabled ? (
                    <p style={{ color: TEXT2, fontWeight: 700, fontSize: 11, fontStyle: "italic", textTransform: "uppercase", letterSpacing: "0.08em" }}>Newsletter Popup is Hidden</p>
                  ) : (
                    <div style={{ width: "100%", maxWidth: 320, background: CARD, borderRadius: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden", border: `1px solid ${BORDER}` }}>
                      <div style={{ height: 120, background: HOVER, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {config.newsletterPopupImage
                          ? <img src={config.newsletterPopupImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Popup" />
                          : <ImageIcon style={{ width: 36, height: 36, color: TEXT2, opacity: 0.3 }} />}
                      </div>
                      <div style={{ padding: 24, textAlign: "center", display: "flex", flexDirection: "column", gap: 12 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 800, color: TEXT, textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>{config.newsletterPopupTitle || "Popup Title"}</h3>
                        <p style={{ fontSize: 11, color: TEXT2, lineHeight: 1.5, margin: 0 }}>{config.newsletterPopupSubtitle || "Popup subtitle text goes here."}</p>
                        <input type="email" disabled placeholder="Enter your email" style={{ width: "100%", height: 36, borderRadius: 8, border: `1px solid ${BORDER}`, background: HOVER, fontSize: 11, paddingLeft: 12, color: TEXT2, boxSizing: "border-box" }} />
                        <button style={{ width: "100%", height: 38, background: ACCENT, border: "none", borderRadius: 8, color: "#0B1320", fontWeight: 800, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}>Subscribe Now</button>
                      </div>
                    </div>
                  )}
                  <p style={{ marginTop: 16, color: TEXT2, fontSize: 10, textAlign: "center", maxWidth: 240 }}>This popup will appear after {config.newsletterPopupDelay || 3000}ms for new visitors.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}