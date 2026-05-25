"use client";

import { useState, useRef, useEffect } from "react";
import {
  Plus, Search, Mail, MapPin, Edit2, Trash2, Users,
  MoreVertical, Bell, Calendar, Sun, Moon, Menu, ChevronDown,
  ChevronRight, Download, MoreHorizontal, UserCheck, UserX,
} from "lucide-react";
import { useInvoiceStore, Client } from "@/providers/InvoiceStore";
import { useTheme } from "@/providers/ThemeProvider";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

const ACCENT = "#12D6C5";
const MOBILE_BASE = 750;
const DESKTOP_BASE = 1380;

function MiniSparkline({ color = ACCENT, up = true }: { color?: string; up?: boolean }) {
  const data = up
    ? [{ v: 1 }, { v: 2 }, { v: 1.5 }, { v: 3 }, { v: 2.5 }, { v: 4 }, { v: 3.8 }]
    : [{ v: 4 }, { v: 3 }, { v: 3.5 }, { v: 2 }, { v: 2.5 }, { v: 1.5 }, { v: 1.2 }];
  return (
    <ResponsiveContainer width="100%" height={32}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sgc${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#sgc${color.replace("#", "")})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function ContactsPage() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const { isDark, toggleTheme } = useTheme();
  const { clients, addClient } = useInvoiceStore();
  const [showAdd, setShowAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newClient, setNewClient] = useState<Omit<Client, "id">>({ name: "", email: "", address: "" });

  const BG = "var(--bg-primary)";
  const CARD = "var(--card-bg)";
  const BORDER = "var(--card-border)";
  const TEXT = "var(--text-primary)";
  const TEXT2 = "var(--text-secondary)";
  const HOVER = "var(--hover-bg)";
  const HEADER_BG = "var(--bg-secondary)";
  const ICON_BG = "var(--icon-bg)";

  useEffect(() => {
    let raf: number;
    function applyHeight(s: number) { if (!innerRef.current || !outerRef.current) return; outerRef.current.style.height = "auto"; outerRef.current.style.height = `${innerRef.current.scrollHeight * s}px`; }
    function recalc() { if (!innerRef.current || !outerRef.current) return; const vw = outerRef.current.offsetWidth || window.innerWidth; const baseW = vw < 960 ? MOBILE_BASE : DESKTOP_BASE; if (vw <= 599) { innerRef.current.style.width = "750px"; innerRef.current.style.transform = "none"; innerRef.current.style.transformOrigin = "top left"; if (outerRef.current) { outerRef.current.style.overflowX = "auto"; outerRef.current.style.height = "auto"; } return; } if (outerRef.current) outerRef.current.style.overflowX = "hidden"; const s = Math.min(1, vw / baseW); innerRef.current.style.width = `${baseW}px`; innerRef.current.style.transform = `scale(${s})`; innerRef.current.style.transformOrigin = "top left"; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(s))); }
    recalc(); const t = setTimeout(recalc, 400); window.addEventListener("resize", recalc); return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, [clients]);

  const handleAdd = () => {
    if (!newClient.name) return;
    addClient(newClient);
    setNewClient({ name: "", email: "", address: "" });
    setShowAdd(false);
  };

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const card = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14 };

  const COLORS = ["#12D6C5", "#3B82F6", "#F59E0B", "#8B5CF6", "#EF4444", "#22C55E"];

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: BG, margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: BG, color: TEXT, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* ── HEADER ── */}
        <header style={{ background: HEADER_BG, borderBottom: `1px solid ${BORDER}`, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}><Menu style={{ width: 20, height: 20 }} /></button>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: TEXT, whiteSpace: "nowrap", margin: 0 }}>Client / Supplier</h1>
          </div>
          <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: TEXT2, width: 15, height: 15 }} />
            <input placeholder="Search contacts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "8px 40px 8px 36px", color: TEXT, fontSize: 13, outline: "none" }} />
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: TEXT2, background: ICON_BG, padding: "2px 5px", borderRadius: 4 }}>⌘K</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ position: "relative", background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>
              <Bell style={{ width: 20, height: 20 }} />
              <span style={{ position: "absolute", top: 0, right: 0, background: "#EF4444", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>1</span>
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

        {/* ── BODY ── */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Page title + actions */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>Client / Supplier</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: TEXT2 }}>
                <span>Home</span>
                <ChevronRight style={{ width: 13, height: 13 }} />
                <span style={{ color: ACCENT }}>Contacts</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", borderRadius: 10, overflow: "hidden" }}>
                <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: ACCENT, border: "none", padding: "9px 18px", color: "#0B1320", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                  <Plus style={{ width: 15, height: 15 }} /> Add Contact
                </button>
                <button style={{ background: "#10C4B5", border: "none", padding: "9px 10px", color: "#0B1320", cursor: "pointer", borderLeft: "1px solid rgba(0,0,0,0.15)" }}>
                  <ChevronDown style={{ width: 14, height: 14 }} />
                </button>
              </div>
              <button style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 18px", color: TEXT2, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                <Download style={{ width: 15, height: 15 }} /> Export <ChevronDown style={{ width: 13, height: 13 }} />
              </button>
              <button style={{ display: "flex", alignItems: "center", justifyContent: "center", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 12px", color: TEXT2, cursor: "pointer" }}>
                <MoreHorizontal style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { label: "Total Contacts", value: clients.length, change: "+12.4%", up: true, color: ACCENT, icon: Users },
              { label: "With Email", value: clients.filter(c => c.email).length, change: "+8.1%", up: true, color: "#22C55E", icon: UserCheck },
              { label: "With Address", value: clients.filter(c => c.address).length, change: "+5.3%", up: true, color: "#8B5CF6", icon: MapPin },
              { label: "New This Month", value: 0, change: "0.0%", up: true, color: "#F59E0B", icon: UserX },
            ].map((s, i) => (
              <div key={i} style={{ ...card, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <s.icon style={{ width: 20, height: 20, color: s.color }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.up ? "#22C55E" : "#EF4444" }}>
                    {s.up ? "▲" : "▼"} {s.change}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: TEXT2, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: TEXT, lineHeight: 1, marginBottom: 6 }}>{s.value.toLocaleString()}</div>
                <div style={{ marginTop: 8 }}><MiniSparkline color={s.color} up={s.up} /></div>
              </div>
            ))}
          </div>

          {/* Add Contact Form */}
          {showAdd && (
            <div style={{ ...card, padding: "20px" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: "0 0 16px" }}>Add New Contact</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
                {[
                  { placeholder: "Name", key: "name", value: newClient.name },
                  { placeholder: "Email", key: "email", value: newClient.email },
                  { placeholder: "Address", key: "address", value: newClient.address },
                ].map(f => (
                  <input key={f.key} placeholder={f.placeholder} value={f.value}
                    onChange={e => setNewClient({ ...newClient, [f.key]: e.target.value })}
                    style={{ background: HOVER, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 14px", color: TEXT, fontSize: 13, outline: "none" }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button onClick={() => setShowAdd(false)} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 18px", color: TEXT2, fontSize: 13, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleAdd} style={{ background: ACCENT, border: "none", borderRadius: 10, padding: "9px 18px", color: "#0B1320", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save Contact</button>
              </div>
            </div>
          )}

          {/* Search bar */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
              <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: TEXT2 }} />
              <input placeholder="Search contacts..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 12px 9px 30px", color: TEXT, fontSize: 13, outline: "none" }} />
            </div>
          </div>

          {/* Contacts Grid */}
          {filtered.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {filtered.map((c, idx) => {
                const color = COLORS[idx % COLORS.length];
                return (
                  <div key={c.id} style={{ ...card, padding: "20px", transition: "box-shadow 0.15s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(0,0,0,0.15)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = ""; }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${color}20`, border: `2px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, color }}>
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <button style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4, borderRadius: 6 }}
                        onMouseEnter={e => { e.currentTarget.style.background = HOVER; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                        <MoreVertical style={{ width: 18, height: 18 }} />
                      </button>
                    </div>
                    <div style={{ marginTop: 14 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: 0 }}>{c.name}</h3>
                      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: TEXT2 }}>
                          <Mail style={{ width: 13, height: 13, color: TEXT2, flexShrink: 0 }} />
                          {c.email || "No email"}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: TEXT2 }}>
                          <MapPin style={{ width: 13, height: 13, color: TEXT2, flexShrink: 0 }} />
                          {c.address || "No address"}
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8, paddingTop: 14, borderTop: `1px solid ${BORDER}` }}>
                      <button style={{ flex: 1, fontSize: 11, fontWeight: 700, padding: "8px 0", borderRadius: 9, color: TEXT2, border: `1px solid ${BORDER}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                        onMouseEnter={e => { e.currentTarget.style.background = HOVER; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                        <Edit2 style={{ width: 12, height: 12 }} /> Edit
                      </button>
                      <button style={{ flex: 1, fontSize: 11, fontWeight: 700, padding: "8px 0", borderRadius: 9, color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                        <Trash2 style={{ width: 12, height: 12 }} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ ...card, padding: 60, textAlign: "center", border: `2px dashed ${BORDER}` }}>
              <Users style={{ width: 48, height: 48, margin: "0 auto 12px", opacity: 0.2, color: TEXT2 }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: TEXT2, margin: 0 }}>No contacts yet</p>
              <button onClick={() => setShowAdd(true)} style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8, background: ACCENT, border: "none", borderRadius: 10, padding: "9px 18px", color: "#0B1320", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                <Plus style={{ width: 14, height: 14 }} /> Add Contact
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
