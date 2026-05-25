"use client";

import { useEffect, useState, useRef } from "react";
import {
  Wrench, Plus, Edit, Trash2, Eye, Clock, DollarSign, Users,
  Calendar, Search, CheckCircle, XCircle, AlertCircle, Bell,
  Sun, Moon, Menu, ChevronDown, ChevronRight, Download, MoreHorizontal,
  TrendingUp,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useTheme } from "@/providers/ThemeProvider";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

const ACCENT = "#12D6C5";
const MOBILE_BASE = 750;
const DESKTOP_BASE = 1380;

type Service = {
  id: string; name: string; slug: string; description?: string;
  price: number; category: string; duration: string; image?: string;
  features?: string[]; isActive: boolean;
};

type Booking = {
  id: string;
  user?: { id: string; firstName?: string | null; lastName?: string | null; email?: string | null };
  service?: { id: string; name: string };
  scheduledDate: string; scheduledTime: string; status: string; notes?: string | null;
};

const emptyForm: Partial<Service> = { name: "", slug: "", price: 0, category: "", duration: "", isActive: true };
const cats = ["All", "Repairs", "Installation", "Support", "Trade-in", "Services"];
const statuses = ["All", "active", "inactive", "pending", "confirmed", "completed"];

function MiniSparkline({ color = ACCENT, up = true }: { color?: string; up?: boolean }) {
  const data = up
    ? [{ v: 1 }, { v: 2 }, { v: 1.5 }, { v: 3 }, { v: 2.5 }, { v: 4 }, { v: 3.8 }]
    : [{ v: 4 }, { v: 3 }, { v: 3.5 }, { v: 2 }, { v: 2.5 }, { v: 1.5 }, { v: 1.2 }];
  return (
    <ResponsiveContainer width="100%" height={32}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sgsv${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#sgsv${color.replace("#", "")})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function ServicesPage() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const { isDark, toggleTheme } = useTheme();

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
    function recalc() { if (!innerRef.current || !outerRef.current) return; const vw = outerRef.current.offsetWidth || window.innerWidth; const baseW = vw < 960 ? MOBILE_BASE : DESKTOP_BASE; const s = Math.min(1, vw / baseW); innerRef.current.style.width = `${baseW}px`; innerRef.current.style.transform = `scale(${s})`; innerRef.current.style.transformOrigin = "top left"; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(s))); }
    recalc(); const t = setTimeout(recalc, 400); window.addEventListener("resize", recalc); return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);

  const [activeTab, setActiveTab] = useState("services");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<Service>>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [todaysBookings, setTodaysBookings] = useState(0);
  const [activeTechs, setActiveTechs] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/internal/admin/services", { cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || "Failed to load");
      setServices(Array.isArray(body) ? body : body?.data || []);
    } finally { setLoading(false); }
  };

  const loadBookings = async () => {
    try {
      const res = await fetch("/internal/admin/services/bookings", { cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || "Failed to load bookings");
      setBookings(Array.isArray(body) ? body : body?.data || body?.items || []);
    } catch { setBookings([]); }
  };

  useEffect(() => { load(); loadBookings(); }, []);

  useEffect(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    setTodaysBookings(bookings.filter(b => new Date(b.scheduledDate).toISOString().slice(0, 10) === todayIso && b.status !== "CANCELLED").length);
  }, [bookings]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const usersRes = await fetch("/internal/admin/users", { cache: "no-store" });
        const usersBody = await usersRes.json().catch(() => ({}));
        const users = Array.isArray(usersBody) ? usersBody : usersBody?.users || usersBody?.data || [];
        if (alive) setActiveTechs(users.filter((u: any) => u.isActive !== false && String(u.role || "").toLowerCase().includes("tech")).length);
      } catch { if (alive) setActiveTechs(0); }
      try {
        const r = await fetch("/internal/admin/reports/summary?range=month", { cache: "no-store" });
        const body = await r.json().catch(() => ({}));
        if (alive) setMonthRevenue(Number(body?.stats?.totalRevenue || 0));
      } catch { if (alive) setMonthRevenue(0); }
    })();
    return () => { alive = false; };
  }, []);

  const filteredServices = services.filter(s =>
    (s.name.toLowerCase().includes(searchQuery.toLowerCase()) || (s.description || "").toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedCategory === "All" || s.category === selectedCategory) &&
    (selectedStatus === "All" || (s.isActive ? "active" : "inactive") === selectedStatus)
  );

  const tabs = [
    { id: "services", label: "Services", icon: Wrench, count: services.length },
    { id: "bookings", label: "Bookings", icon: Calendar, count: bookings.length },
  ];

  const card = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14 };

  const bookingStatusStyle = (status: string) => {
    const map: Record<string, [string, string]> = {
      CONFIRMED:  [ACCENT, `${ACCENT}15`],
      PENDING:    ["#F59E0B", "rgba(245,158,11,0.12)"],
      COMPLETED:  ["#22C55E", "rgba(34,197,94,0.12)"],
      CANCELLED:  ["#EF4444", "rgba(239,68,68,0.12)"],
    };
    const [color, bg] = map[status] || ["#6B7280", "rgba(107,114,128,0.12)"];
    return { fontSize: 10, fontWeight: 700, color, background: bg, padding: "3px 10px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 4 };
  };

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: BG, margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: BG, color: TEXT, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* ── HEADER ── */}
        <header style={{ background: HEADER_BG, borderBottom: `1px solid ${BORDER}`, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}><Menu style={{ width: 20, height: 20 }} /></button>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: TEXT, whiteSpace: "nowrap", margin: 0 }}>Services Management</h1>
          </div>
          <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: TEXT2, width: 15, height: 15 }} />
            <input placeholder="Search services..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "8px 40px 8px 36px", color: TEXT, fontSize: 13, outline: "none" }} />
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
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>Services Management</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: TEXT2 }}>
                <span>Home</span><ChevronRight style={{ width: 13, height: 13 }} /><span style={{ color: ACCENT }}>Services</span>
              </div>
              <p style={{ fontSize: 12, color: TEXT2, marginTop: 4 }}>Configure service offerings and bookings</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", borderRadius: 10, overflow: "hidden" }}>
                <button onClick={() => setForm(emptyForm)} style={{ display: "flex", alignItems: "center", gap: 8, background: ACCENT, border: "none", padding: "9px 18px", color: "#0B1320", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                  <Plus style={{ width: 15, height: 15 }} /> Add Service
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
              { label: "Total Services", value: services.length, change: "+8.4%", up: true, color: ACCENT, icon: Wrench },
              { label: "Today's Bookings", value: todaysBookings, change: "+12.1%", up: true, color: "#3B82F6", icon: Calendar },
              { label: "Active Technicians", value: activeTechs, change: "+3.2%", up: true, color: "#8B5CF6", icon: Users },
              { label: "Revenue (Month)", value: formatPrice(monthRevenue), change: "+18.6%", up: true, color: "#F59E0B", icon: TrendingUp },
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
                <div style={{ fontSize: typeof s.value === "string" ? 18 : 26, fontWeight: 800, color: TEXT, lineHeight: 1, marginBottom: 6 }}>{s.value}</div>
                <div style={{ marginTop: 8 }}><MiniSparkline color={s.color} up={s.up} /></div>
              </div>
            ))}
          </div>

          {/* Tab nav */}
          <div style={{ borderBottom: `1px solid ${BORDER}` }}>
            <nav style={{ display: "flex", gap: 4 }}>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", background: "transparent", border: "none", borderBottom: activeTab === tab.id ? `2px solid ${ACCENT}` : "2px solid transparent", color: activeTab === tab.id ? ACCENT : TEXT2, whiteSpace: "nowrap", transition: "color 0.15s" }}>
                  <tab.icon style={{ width: 15, height: 15 }} />
                  {tab.label}
                  <span style={{ fontSize: 10, fontWeight: 700, background: HOVER, color: TEXT2, padding: "1px 7px", borderRadius: 20, marginLeft: 2 }}>{tab.count}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Services Tab */}
          {activeTab === "services" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Quick Create Form */}
              <div style={{ ...card, padding: "16px 20px" }}>
                <p style={{ fontSize: 10, fontWeight: 800, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Quick Create Service</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
                  {[
                    { placeholder: "Name", key: "name", val: form.name || "", type: "text" },
                    { placeholder: "Slug", key: "slug", val: form.slug || "", type: "text" },
                    { placeholder: "Category", key: "category", val: form.category || "", type: "text" },
                    { placeholder: "Duration (e.g. 1h)", key: "duration", val: form.duration || "", type: "text" },
                    { placeholder: "Price", key: "price", val: String(form.price ?? 0), type: "number" },
                  ].map(f => (
                    <input key={f.key} type={f.type} placeholder={f.placeholder} value={f.val}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value }))}
                      style={{ background: HOVER, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 12px", color: TEXT, fontSize: 12, outline: "none" }} />
                  ))}
                  <button disabled={saving} onClick={async () => {
                    setSaving(true);
                    try {
                      const res = await fetch("/internal/admin/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.name, slug: form.slug, category: form.category, duration: form.duration, price: form.price ?? 0, isActive: true }) });
                      const body = await res.json().catch(() => ({}));
                      if (!res.ok) throw new Error(body?.error || "Failed to create");
                      await load(); setForm(emptyForm);
                    } catch (e) { alert(e instanceof Error ? e.message : "Failed to create"); }
                    finally { setSaving(false); }
                  }} style={{ background: ACCENT, border: "none", borderRadius: 10, padding: "9px 12px", color: "#0B1320", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    {saving ? "Saving..." : "Create"}
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: TEXT2 }} />
                  <input placeholder="Search services..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 12px 9px 30px", color: TEXT, fontSize: 13, outline: "none" }} />
                </div>
                {[
                  { val: selectedCategory, setter: setSelectedCategory, opts: cats, label: "Category" },
                  { val: selectedStatus, setter: setSelectedStatus, opts: statuses, label: "Status" },
                ].map((f, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <select value={f.val} onChange={e => f.setter(e.target.value)} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 32px 9px 12px", color: TEXT2, fontSize: 13, outline: "none", appearance: "none", cursor: "pointer" }}>
                      {f.opts.map(o => <option key={o} value={o}>{o === "All" ? `All ${f.label}s` : o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                    </select>
                    <ChevronDown style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: TEXT2, pointerEvents: "none" }} />
                  </div>
                ))}
              </div>

              {/* Services Grid */}
              {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                  {[...Array(6)].map((_, i) => <div key={i} style={{ ...card, height: 180 }} />)}
                </div>
              ) : filteredServices.length === 0 ? (
                <div style={{ ...card, padding: 60, textAlign: "center", border: `2px dashed ${BORDER}` }}>
                  <Wrench style={{ width: 40, height: 40, margin: "0 auto 10px", opacity: 0.2, color: TEXT2 }} />
                  <p style={{ fontSize: 13, fontWeight: 600, color: TEXT2 }}>No services found</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                  {filteredServices.map(service => (
                    <div key={service.id} style={{ ...card, padding: "18px", transition: "box-shadow 0.15s, border-color 0.15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(0,0,0,0.15)"; (e.currentTarget as HTMLElement).style.borderColor = `${ACCENT}40`; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = ""; (e.currentTarget as HTMLElement).style.borderColor = BORDER; }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                        <div style={{ width: 44, height: 44, background: `${ACCENT}15`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Wrench style={{ width: 20, height: 20, color: ACCENT }} />
                        </div>
                        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                          <div onClick={async () => {
                            const isActive = !service.isActive;
                            await fetch(`/internal/admin/services/${service.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive }) });
                            setServices(prev => prev.map(s => s.id === service.id ? { ...s, isActive } : s));
                          }} style={{ width: 36, height: 20, borderRadius: 10, background: service.isActive ? ACCENT : HOVER, cursor: "pointer", position: "relative", transition: "background 0.2s", border: `1px solid ${BORDER}` }}>
                            <div style={{ position: "absolute", top: 2, left: service.isActive ? 17 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: service.isActive ? ACCENT : TEXT2 }}>{service.isActive ? "Active" : "Inactive"}</span>
                        </label>
                      </div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: TEXT, margin: "0 0 4px" }}>{service.name}</h3>
                      <p style={{ fontSize: 11, color: TEXT2, marginBottom: 14, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{service.description || "No description"}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: TEXT2, marginBottom: 14 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><DollarSign style={{ width: 12, height: 12 }} />{Number(service.price) > 0 ? formatPrice(Number(service.price)) : "Free"}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock style={{ width: 12, height: 12 }} />{service.duration}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: ACCENT, background: `${ACCENT}15`, padding: "2px 8px", borderRadius: 20 }}>{service.category}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
                        <button onClick={async () => {
                          const name = prompt("Name", service.name) || service.name;
                          const price = Number(prompt("Price", String(service.price)) || service.price);
                          const duration = prompt("Duration", service.duration) || service.duration;
                          const category = prompt("Category", service.category) || service.category;
                          const res = await fetch(`/internal/admin/services/${service.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, price, duration, category }) });
                          if (res.ok) await load();
                        }} style={{ flex: 1, height: 32, borderRadius: 8, background: HOVER, border: `1px solid ${BORDER}`, color: TEXT2, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                          <Edit style={{ width: 12, height: 12 }} /> Edit
                        </button>
                        <button onClick={async () => {
                          if (!confirm("Delete this service?")) return;
                          const res = await fetch(`/internal/admin/services/${service.id}`, { method: "DELETE" });
                          if (res.ok) setServices(prev => prev.filter(s => s.id !== service.id));
                        }} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#EF4444"; e.currentTarget.style.color = "#fff"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#EF4444"; }}>
                          <Trash2 style={{ width: 13, height: 13 }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div style={{ ...card, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${BORDER}`, background: HOVER }}>
                      {["Booking ID", "Service", "Customer", "Date & Time", "Status", "Actions"].map((h, i) => (
                        <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: i >= 5 ? "right" : "left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: 48, textAlign: "center", fontSize: 13, color: TEXT2 }}>No bookings found.</td></tr>
                    ) : bookings.map(booking => {
                      const customer = (booking.user?.firstName || booking.user?.lastName) ? `${booking.user?.firstName || ""} ${booking.user?.lastName || ""}`.trim() : booking.user?.email || "Unknown";
                      const dateStr = new Date(booking.scheduledDate).toISOString().slice(0, 10);
                      return (
                        <tr key={booking.id} style={{ borderBottom: `1px solid ${BORDER}` }}
                          onMouseEnter={e => { e.currentTarget.style.background = HOVER; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                          <td style={{ padding: "13px 16px", fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: TEXT }}>{booking.id.slice(0, 8).toUpperCase()}</td>
                          <td style={{ padding: "13px 16px", fontSize: 13, color: TEXT }}>{booking.service?.name || "—"}</td>
                          <td style={{ padding: "13px 16px", fontSize: 12, color: TEXT2 }}>{customer}</td>
                          <td style={{ padding: "13px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: TEXT2 }}>
                              <Calendar style={{ width: 13, height: 13, color: TEXT2 }} />
                              {dateStr} at {booking.scheduledTime}
                            </div>
                          </td>
                          <td style={{ padding: "13px 16px" }}>
                            <span style={bookingStatusStyle(booking.status)}>
                              {booking.status === "CONFIRMED" && <CheckCircle style={{ width: 10, height: 10 }} />}
                              {booking.status === "PENDING" && <AlertCircle style={{ width: 10, height: 10 }} />}
                              {booking.status === "COMPLETED" && <CheckCircle style={{ width: 10, height: 10 }} />}
                              {booking.status === "CANCELLED" && <XCircle style={{ width: 10, height: 10 }} />}
                              {booking.status.toLowerCase()}
                            </span>
                          </td>
                          <td style={{ padding: "13px 16px", textAlign: "right" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                              {[Eye, Edit].map((Icon, i) => (
                                <button key={i} style={{ width: 32, height: 32, borderRadius: 8, background: "transparent", border: "none", color: TEXT2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                  onMouseEnter={e => { e.currentTarget.style.background = HOVER; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                                  <Icon style={{ width: 14, height: 14 }} />
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
