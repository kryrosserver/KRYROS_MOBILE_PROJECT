"use client";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Megaphone, RefreshCw, Layout, Type, Palette, Link as LinkIcon, Bell, Calendar, Sun, Moon, Menu, ChevronDown, Search } from "lucide-react";

export default function AnnouncementPage() {
  const BG = "#F8F9FA";
  const CARD = "#FFFFFF";
  const BORDER = "#E5E7EB";
  const TEXT = "#111827";
  const TEXT2 = "#4B5563";
  const TEXT3 = "#9CA3AF";
  const HOVER = "#F9FAFB";
  const HEADER_BG = "#FFFFFF";
  const ICON_BG = "#F9FAFB";
  const ACCENT = "#6366F1";

  useEffect(() => {}, []);

  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/footer/config", { cache: "no-store" });
      if (res.ok) setConfig(await res.json());
    } finally { setLoading(false); }
  };

  useEffect(() => { loadConfig(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms/footer/config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });
      if (res.ok) { setMsg("Announcement bar updated"); setTimeout(() => setMsg(null), 3000); }
    } finally { setSaving(false); }
  };

  const card = { background: CARD, border: "1px solid #E5E7EB", borderRadius: 14 };

  return (
    <div style={{ background: "#F8F9FA", minHeight: "100vh", padding: "24px" }}>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><Link href="/admin/cms" style={{ display: "flex", alignItems: "center", gap: 6, background: CARD, border: "1px solid #E5E7EB", borderRadius: 8, padding: "5px 12px", color: TEXT2, fontSize: 12, textDecoration: "none" }}><ArrowLeft style={{ width: 13, height: 13 }} /> Back to CMS</Link></div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>Announcement Bar</h2>
              <p style={{ fontSize: 12, color: TEXT2, marginTop: 4 }}>Configure the promotional bar at the top of your site</p>
            </div>
            <button onClick={handleSave} disabled={saving || !config}
              style={{ background: "#6366F1", border: "none", padding: "10px 24px", color: "#0B1320", fontWeight: 700, fontSize: 13, cursor: "pointer", borderRadius: 10 }}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {msg && <div style={{ background: "rgba(22,199,132,0.1)", border: "1px solid rgba(22,199,132,0.25)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#16C784", fontWeight: 600 }}>{msg}</div>}

          {loading && <div style={{ padding: "48px 0", textAlign: "center", color: TEXT2, fontSize: 13 }}><RefreshCw style={{ width: 28, height: 28, margin: "0 auto 10px", opacity: 0.3 }} /><div>Loading...</div></div>}

          {config && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div style={{ ...card, padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #E5E7EB" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Layout style={{ width: 16, height: 16, color: "#6366F1" }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Visibility Settings</span>
                  </div>
                  <button onClick={() => setConfig({ ...config, announcementBarEnabled: !config.announcementBarEnabled })}
                    style={{ width: 44, height: 24, borderRadius: 12, border: "none", background: config.announcementBarEnabled ? "#6366F1" : ICON_BG, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                    <span style={{ position: "absolute", top: 3, left: config.announcementBarEnabled ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    { label: "Announcement Text", key: "announcementBarText", placeholder: "e.g. 30% off special...", icon: Type, multi: true },
                    { label: "Action Link", key: "announcementBarLink", placeholder: "/shop or https://...", icon: LinkIcon },
                    { label: "Background Color", key: "announcementBarBgColor", placeholder: "bg-kryros-dark", icon: Palette },
                    { label: "Text Color", key: "announcementBarTextColor", placeholder: "text-white", icon: Palette },
                  ].map(f => (
                    <div key={f.key}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: TEXT2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        <f.icon style={{ width: 12, height: 12 }} />{f.label}
                      </div>
                      {(f as any).multi ? (
                        <textarea value={config[f.key] || ""} onChange={e => setConfig({ ...config, [f.key]: e.target.value })} placeholder={f.placeholder}
                          style={{ width: "100%", height: 80, background: ICON_BG, border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 12px", color: TEXT, fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box" }} />
                      ) : (
                        <input value={config[f.key] || ""} onChange={e => setConfig({ ...config, [f.key]: e.target.value })} placeholder={f.placeholder}
                          style={{ width: "100%", background: ICON_BG, border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 12px", color: TEXT, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ ...card, padding: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 16 }}>Live Preview</div>
                <div style={{ background: HOVER, borderRadius: 12, padding: 24, border: `2px dashed #E5E7EB`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 180 }}>
                  {!config.announcementBarEnabled ? (
                    <p style={{ fontSize: 12, color: TEXT2, fontStyle: "italic" }}>Announcement Bar is Hidden</p>
                  ) : (
                    <div style={{ width: "100%", padding: "8px 16px", textAlign: "center", fontSize: 12, fontWeight: 700, borderRadius: 8, background: config.announcementBarBgColor || "#6366F1", color: config.announcementBarTextColor || "#fff" }}>
                      {config.announcementBarText || "Announcement text will show here"}
                    </div>
                  )}
                  <p style={{ fontSize: 11, color: TEXT2, marginTop: 16, textAlign: "center", maxWidth: 240 }}>This is how your announcement bar will appear at the top of your storefront.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  );
}