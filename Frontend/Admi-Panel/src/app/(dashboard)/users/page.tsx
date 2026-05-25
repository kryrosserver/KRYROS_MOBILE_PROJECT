"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell, Search, Calendar, Sun, Moon, ChevronDown, ChevronRight,
  Menu, Users, Shield, ShieldCheck, UserPlus, Download, MoreHorizontal,
  Eye, Edit, Filter, RefreshCw, UserCheck, ChevronLeft, ChevronRight as ChevronR,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import { useTheme } from "@/providers/ThemeProvider";

const ACCENT = "#12D6C5";
const MOBILE_BASE = 960;
const DESKTOP_BASE = 1380;

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "#12D6C5",
  ADMIN: "#8B5CF6",
  EDITOR: "#3B82F6",
  MODERATOR: "#F59E0B",
  CUSTOMER: "#6B7280",
  WHOLESALER: "#22C55E",
};
const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  EDITOR: "Editor",
  MODERATOR: "Moderator",
  CUSTOMER: "User",
  WHOLESALER: "Wholesaler",
};

function MiniSparkline({ color, up }: { color: string; up: boolean }) {
  const data = up
    ? [{ v: 1 }, { v: 2 }, { v: 1.5 }, { v: 3 }, { v: 2.5 }, { v: 4 }, { v: 3.8 }]
    : [{ v: 4 }, { v: 3 }, { v: 3.5 }, { v: 2 }, { v: 2.5 }, { v: 1.5 }, { v: 1.2 }];
  return (
    <ResponsiveContainer width="100%" height={32}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sg${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
          fill={`url(#sg${color.replace("#", "")})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastActive?: string;
};

const ROWS_PER_PAGE = 10;

export default function UsersPage() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const { isDark, toggleTheme } = useTheme();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [verifiedFilter, setVerifiedFilter] = useState("ALL");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const BG = "var(--bg-primary)";
  const CARD = "var(--card-bg)";
  const BORDER = "var(--card-border)";
  const TEXT = "var(--text-primary)";
  const TEXT2 = "var(--text-secondary)";
  const HEADER_BG = "var(--bg-secondary)";
  const ICON_BG = "var(--icon-bg)";
  const HOVER = "var(--hover-bg)";

  useEffect(() => {
    let raf: number;
    function applyHeight(s: number) {
      if (!innerRef.current || !outerRef.current) return;
      outerRef.current.style.height = "auto";
      const naturalH = innerRef.current.scrollHeight;
      const visualH = naturalH * s;
      const isMob = window.innerWidth < 1024;
      const avail = isMob ? window.innerHeight - 64 : Infinity;
      outerRef.current.style.height = `${Math.max(visualH, avail)}px`;
    }
    function recalc() {
      if (!innerRef.current || !outerRef.current) return;
      const vw = outerRef.current.offsetWidth || window.innerWidth;
      const baseW = vw < 960 ? MOBILE_BASE : DESKTOP_BASE;
      const s = Math.min(1, vw / baseW);
      innerRef.current.style.width = `${baseW}px`;
      innerRef.current.style.transform = `scale(${s})`;
      innerRef.current.style.transformOrigin = "top left";
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(s)));
    }
    recalc();
    const t = setTimeout(recalc, 400);
    window.addEventListener("resize", recalc);
    return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, [users]);

  useEffect(() => {
    setLoading(true);
    fetch("/internal/admin/users", { cache: "no-store" })
      .then(r => r.json())
      .then(data => setUsers(Array.isArray(data) ? data : data?.users || data?.data || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const name = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase();
    const matchSearch = !searchTerm || name.includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchStatus = statusFilter === "ALL" || (statusFilter === "ACTIVE" ? u.isActive : !u.isActive);
    const matchVerified = verifiedFilter === "ALL" || (verifiedFilter === "VERIFIED" ? u.isVerified : !u.isVerified);
    return matchSearch && matchRole && matchStatus && matchVerified;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pageUsers = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const admins = users.filter(u => u.role === "ADMIN" || u.role === "SUPER_ADMIN");
  const superAdmins = users.filter(u => u.role === "SUPER_ADMIN");
  const regular = users.filter(u => u.role !== "ADMIN" && u.role !== "SUPER_ADMIN");

  const roleGroups = [
    { name: "Super Admins", count: superAdmins.length, color: "#12D6C5" },
    { name: "Admins", count: admins.filter(u => u.role === "ADMIN").length, color: "#8B5CF6" },
    { name: "Editors", count: users.filter(u => u.role === "EDITOR").length, color: "#3B82F6" },
    { name: "Moderators", count: users.filter(u => u.role === "MODERATOR").length, color: "#F59E0B" },
    { name: "Regular Users", count: regular.length, color: "#6B7280" },
  ];

  const recentUsers = [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const toggleSelect = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll = () => setSelected(s => s.length === pageUsers.length ? [] : pageUsers.map(u => u.id));

  const card = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14 };

  const initials = (u: User) => `${u.firstName?.[0] || ""}${u.lastName?.[0] || ""}`.toUpperCase() || "U";
  const avatarColor = (role: string) => ROLE_COLORS[role] || "#6B7280";

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} mins ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
    return `${Math.floor(hrs / 24)} days ago`;
  };

  const pageNums = (() => {
    const nums: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) nums.push(i);
    } else {
      nums.push(1, 2, 3, 4, 5, "...", totalPages);
    }
    return nums;
  })();

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: BG, margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: BG, color: TEXT }}>

        {/* ── HEADER ── */}
        <header style={{
          background: HEADER_BG, borderBottom: `1px solid ${BORDER}`,
          height: 60, display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 24px", gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>
              <Menu style={{ width: 20, height: 20 }} />
            </button>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: TEXT, whiteSpace: "nowrap" }}>User Management</h1>
          </div>

          <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: TEXT2, width: 15, height: 15 }} />
            <input placeholder="Search users by name, email, phone..." style={{
              width: "100%", background: CARD, border: `1px solid ${BORDER}`,
              borderRadius: 10, padding: "8px 40px 8px 36px", color: TEXT, fontSize: 13, outline: "none",
            }} />
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: TEXT2, background: ICON_BG, padding: "2px 5px", borderRadius: 4 }}>⌘K</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ position: "relative", background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>
              <Bell style={{ width: 20, height: 20 }} />
              <span style={{ position: "absolute", top: 0, right: 0, background: "#EF4444", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>1</span>
            </button>
            <button onClick={toggleTheme} style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>
              {isDark ? <Sun style={{ width: 20, height: 20 }} /> : <Moon style={{ width: 20, height: 20 }} />}
            </button>
            <button style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "7px 14px", color: TEXT2, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
              <Calendar style={{ width: 14, height: 14 }} />
              May 20 – May 26, 2025
              <ChevronDown style={{ width: 13, height: 13 }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0B1320", flexShrink: 0 }}>K</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, lineHeight: 1 }}>Admin</div>
                <div style={{ fontSize: 10, color: TEXT2, marginTop: 1 }}>Super Admin</div>
              </div>
              <ChevronDown style={{ width: 14, height: 14, color: TEXT2 }} />
            </div>
          </div>
        </header>

        {/* ── BODY ── */}
        <div style={{ padding: "20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Page title + actions — full width above both columns */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>User Management</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: TEXT2 }}>
                  <span>Home</span>
                  <ChevronRight style={{ width: 13, height: 13 }} />
                  <span>Users &amp; Roles</span>
                  <ChevronRight style={{ width: 13, height: 13 }} />
                  <span style={{ color: ACCENT }}>All Users</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", borderRadius: 10, overflow: "hidden" }}>
                  <button style={{ display: "flex", alignItems: "center", gap: 8, background: ACCENT, border: "none", padding: "9px 18px", color: "#0B1320", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    <UserPlus style={{ width: 15, height: 15 }} />
                    Add Admin
                  </button>
                  <button style={{ background: "#10C4B5", border: "none", padding: "9px 10px", color: "#0B1320", cursor: "pointer", borderLeft: "1px solid rgba(0,0,0,0.15)" }}>
                    <ChevronDown style={{ width: 14, height: 14 }} />
                  </button>
                </div>
                <button style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 18px", color: TEXT2, fontSize: 13, cursor: "pointer" }}>
                  <Download style={{ width: 15, height: 15 }} />
                  Import Users
                  <ChevronDown style={{ width: 13, height: 13 }} />
                </button>
                <button style={{ display: "flex", alignItems: "center", justifyContent: "center", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 12px", color: TEXT2, cursor: "pointer" }}>
                  <MoreHorizontal style={{ width: 16, height: 16 }} />
                </button>
              </div>
          </div>

          {/* Two-column row: stats/table left + sidebar right — both start at same top edge */}
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

          {/* LEFT MAIN */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {[
                { label: "Total Users", value: users.length || 12845, change: "+18.4%", up: true, color: "#22C55E", icon: Users },
                { label: "Admins", value: admins.length || 24, change: "+12.4%", up: true, color: "#8B5CF6", icon: ShieldCheck },
                { label: "Super Admins", value: superAdmins.length || 3, change: "+7.1%", up: true, color: "#3B82F6", icon: Shield },
                { label: "Regular Users", value: regular.length || 12818, change: "+19.3%", up: true, color: "#F59E0B", icon: Users },
              ].map((c, i) => (
                <div key={i} style={{ ...card, padding: "16px 16px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${c.color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <c.icon style={{ width: 18, height: 18, color: c.color }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: TEXT2, fontWeight: 600 }}>{c.label}</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: TEXT, lineHeight: 1.2 }}>{c.value.toLocaleString()}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#22C55E" }}>↑ {c.change}</span>
                    <span style={{ fontSize: 10, color: TEXT2 }}>vs last month</span>
                  </div>
                  <MiniSparkline color={c.color} up={c.up} />
                </div>
              ))}
            </div>

            {/* Filter Bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: TEXT2, width: 14, height: 14 }} />
                <input
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                  placeholder="Search users by name, email, phone..."
                  style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 12px 9px 36px", color: TEXT, fontSize: 13, outline: "none" }}
                />
              </div>
              {[
                { value: roleFilter, set: (v: string) => { setRoleFilter(v); setPage(1); }, options: [["ALL", "All Roles"], ["SUPER_ADMIN", "Super Admin"], ["ADMIN", "Admin"], ["EDITOR", "Editor"], ["MODERATOR", "Moderator"], ["CUSTOMER", "User"]] },
                { value: statusFilter, set: (v: string) => { setStatusFilter(v); setPage(1); }, options: [["ALL", "All Status"], ["ACTIVE", "Active"], ["INACTIVE", "Inactive"]] },
                { value: verifiedFilter, set: (v: string) => { setVerifiedFilter(v); setPage(1); }, options: [["ALL", "All Verified"], ["VERIFIED", "Verified"], ["UNVERIFIED", "Unverified"]] },
              ].map((f, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <select
                    value={f.value}
                    onChange={e => f.set(e.target.value)}
                    style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 36px 9px 14px", color: TEXT2, fontSize: 13, outline: "none", appearance: "none", cursor: "pointer", minWidth: 120 }}
                  >
                    {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <ChevronDown style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: TEXT2, pointerEvents: "none" }} />
                </div>
              ))}
              <button style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 16px", color: TEXT2, fontSize: 13, cursor: "pointer" }}>
                <Filter style={{ width: 14, height: 14 }} />
                Filters
              </button>
              <button style={{ display: "flex", alignItems: "center", justifyContent: "center", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 12px", color: TEXT2, cursor: "pointer" }}>
                <Filter style={{ width: 14, height: 14 }} />
              </button>
            </div>

            {/* Table */}
            <div style={{ ...card, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--table-header-bg)", borderBottom: `1px solid ${BORDER}` }}>
                      <th style={{ padding: "12px 14px", textAlign: "left", width: 40 }}>
                        <input
                          type="checkbox"
                          checked={selected.length === pageUsers.length && pageUsers.length > 0}
                          onChange={toggleAll}
                          style={{ accentColor: ACCENT, width: 15, height: 15 }}
                        />
                      </th>
                      {["User", "Role", "Status", "Joined Date", "Last Active", "Actions"].map(h => (
                        <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, color: TEXT2, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [...Array(8)].map((_, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                          <td colSpan={7} style={{ padding: "14px" }}>
                            <div style={{ height: 14, background: ICON_BG, borderRadius: 6, animation: "pulse 1.5s infinite" }} />
                          </td>
                        </tr>
                      ))
                    ) : pageUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: "48px", textAlign: "center", color: TEXT2, fontSize: 14 }}>
                          No users found.
                        </td>
                      </tr>
                    ) : pageUsers.map((u) => (
                      <tr key={u.id} style={{ borderBottom: `1px solid ${BORDER}` }}
                        onMouseEnter={e => (e.currentTarget.style.background = HOVER)}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "12px 14px" }}>
                          <input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggleSelect(u.id)}
                            style={{ accentColor: ACCENT, width: 15, height: 15 }} />
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${avatarColor(u.role)}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: avatarColor(u.role), flexShrink: 0, border: `2px solid ${avatarColor(u.role)}50` }}>
                              {initials(u)}
                            </div>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{u.firstName} {u.lastName}</span>
                                {u.isVerified && <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#22C55E", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#fff", fontWeight: 700 }}>✓</span>}
                              </div>
                              <div style={{ fontSize: 11, color: TEXT2, marginTop: 1 }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: ROLE_COLORS[u.role] || "#6B7280", background: `${ROLE_COLORS[u.role] || "#6B7280"}18`, padding: "4px 10px", borderRadius: 20, border: `1px solid ${ROLE_COLORS[u.role] || "#6B7280"}30` }}>
                            <Shield style={{ width: 10, height: 10 }} />
                            {ROLE_LABELS[u.role] || u.role}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: u.isActive ? "#22C55E" : "#EF4444", background: u.isActive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", padding: "4px 10px", borderRadius: 20 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: u.isActive ? "#22C55E" : "#EF4444", flexShrink: 0 }} />
                            {u.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", fontSize: 12, color: TEXT2 }}>
                          {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                            {new Date(u.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: TEXT2 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", flexShrink: 0 }} />
                            {timeAgo(u.createdAt)}
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {[Eye, Edit, MoreHorizontal].map((Icon, ii) => (
                              <button key={ii} style={{ width: 30, height: 30, borderRadius: 8, background: ICON_BG, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: TEXT2 }}
                                onMouseEnter={e => { e.currentTarget.style.background = HOVER; e.currentTarget.style.color = TEXT; }}
                                onMouseLeave={e => { e.currentTarget.style.background = ICON_BG; e.currentTarget.style.color = TEXT2; }}>
                                <Icon style={{ width: 13, height: 13 }} />
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderTop: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: 12, color: TEXT2 }}>
                  Showing {filtered.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1} to {Math.min(page * ROWS_PER_PAGE, filtered.length)} of {filtered.length.toLocaleString()} users
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    style={{ width: 32, height: 32, borderRadius: 8, background: CARD, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: TEXT2, opacity: page === 1 ? 0.4 : 1 }}>
                    <ChevronLeft style={{ width: 14, height: 14 }} />
                  </button>
                  {pageNums.map((n, i) => (
                    <button key={i} onClick={() => typeof n === "number" && setPage(n)}
                      style={{ minWidth: 32, height: 32, borderRadius: 8, border: `1px solid ${n === page ? ACCENT : BORDER}`, background: n === page ? ACCENT : CARD, color: n === page ? "#0B1320" : TEXT2, fontSize: 13, fontWeight: n === page ? 700 : 400, cursor: "pointer" }}>
                      {n}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    style={{ width: 32, height: 32, borderRadius: 8, background: CARD, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: TEXT2, opacity: page === totalPages ? 0.4 : 1 }}>
                    <ChevronR style={{ width: 14, height: 14 }} />
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8 }}>
                    <span style={{ fontSize: 12, color: TEXT2 }}>Rows per page:</span>
                    <div style={{ position: "relative" }}>
                      <select style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "5px 28px 5px 10px", color: TEXT, fontSize: 12, outline: "none", appearance: "none" }}>
                        <option>10</option>
                        <option>25</option>
                        <option>50</option>
                      </select>
                      <ChevronDown style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, color: TEXT2, pointerEvents: "none" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ width: 270, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}>

            {/* User Roles Overview */}
            <div style={{ ...card, padding: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 12 }}>User Roles Overview</div>
              <div style={{ position: "relative", height: 160 }}>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={roleGroups.filter(r => r.count > 0)} cx="50%" cy="50%" innerRadius={48} outerRadius={68} dataKey="count" paddingAngle={3}>
                      {roleGroups.filter(r => r.count > 0).map((r, i) => <Cell key={i} fill={r.color} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "var(--tooltip-bg)", border: `1px solid ${BORDER}`, borderRadius: 8 }}
                      labelStyle={{ color: TEXT2 }} itemStyle={{ color: TEXT }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: TEXT }}>{users.length.toLocaleString() || "12,845"}</div>
                  <div style={{ fontSize: 10, color: TEXT2 }}>Total Users</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 10 }}>
                {roleGroups.map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: TEXT2 }}>{r.name}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>
                      {r.count.toLocaleString()} ({users.length > 0 ? ((r.count / users.length) * 100).toFixed(2) : "0.00"}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ ...card, padding: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 12 }}>Quick Actions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Add New Admin", icon: UserPlus },
                  { label: "Add New Role", icon: Shield },
                  { label: "Bulk Import Users", icon: Download },
                  { label: "Export Users Data", icon: Download },
                ].map((a, i) => (
                  <button key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: HOVER, border: `1px solid ${BORDER}`, borderRadius: 10, cursor: "pointer", color: TEXT2, width: "100%" }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${ACCENT}12`; e.currentTarget.style.borderColor = `${ACCENT}40`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = HOVER; e.currentTarget.style.borderColor = BORDER; }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: ICON_BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <a.icon style={{ width: 14, height: 14, color: TEXT2 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{a.label}</span>
                    </div>
                    <ChevronRight style={{ width: 14, height: 14 }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Registrations */}
            <div style={{ ...card, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Recent Registrations</div>
                <span style={{ fontSize: 11, color: ACCENT, cursor: "pointer" }}>View All</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {(recentUsers.length > 0 ? recentUsers : [
                  { firstName: "Brian", lastName: "Sampa", email: "user@gmail.com", role: "CUSTOMER", createdAt: new Date(Date.now() - 2 * 60000).toISOString() },
                  { firstName: "Grace", lastName: "Nkonde", email: "grace@gmail.com", role: "CUSTOMER", createdAt: new Date(Date.now() - 8 * 60000).toISOString() },
                  { firstName: "Peter", lastName: "Lubinda", email: "peter@gmail.com", role: "CUSTOMER", createdAt: new Date(Date.now() - 15 * 60000).toISOString() },
                  { firstName: "Lena", lastName: "Musonda", email: "lena@gmail.com", role: "CUSTOMER", createdAt: new Date(Date.now() - 22 * 60000).toISOString() },
                  { firstName: "Michelo", lastName: "Zulu", email: "m@gmail.com", role: "CUSTOMER", createdAt: new Date(Date.now() - 35 * 60000).toISOString() },
                ] as any[]).map((u: any, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: [ACCENT, "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"][i % 5] + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: [ACCENT, "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"][i % 5], flexShrink: 0 }}>
                      {`${u.firstName?.[0] || ""}${u.lastName?.[0] || ""}`.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{u.firstName} {u.lastName}</div>
                      <div style={{ fontSize: 11, color: TEXT2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                    </div>
                    <div style={{ fontSize: 11, color: TEXT2, whiteSpace: "nowrap", flexShrink: 0 }}>{timeAgo(u.createdAt)}</div>
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
