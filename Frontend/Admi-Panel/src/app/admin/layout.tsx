"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { AdminSettingsProvider } from "@/providers/AdminSettingsProvider";

/* ── Inline SVG icons matching the HTML design ── */
const IconDashboard = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
const IconOrders = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>;
const IconProducts = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>;
const IconCustomers = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
const IconPayments = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const IconReports = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const IconNotif = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
const IconCMS = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>;
const IconWholesale = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
const IconDelivery = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconSettings = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 1 0 20.1 8"/></svg>;
const IconArr = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>;
const IconSearch = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconBell = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
const IconLogout = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconHam = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;

/* ── Constants ── */
const SIDEBAR_W = 230;
const SIDEBAR_BG = "#12172B";
const ACCENT = "#6366F1";
const ORANGE = "#F97316";
const PINK = "#EC4899";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubs, setOpenSubs] = useState<Record<string, boolean>>({});

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const toggleSub = (key: string) => {
    setOpenSubs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const niBase: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 9,
    padding: "8px 10px", borderRadius: 9,
    color: "rgba(255,255,255,.48)", fontSize: 12.5, fontWeight: 500,
    cursor: "pointer", transition: "all .13s",
    position: "relative", marginBottom: 1, userSelect: "none",
  };

  const SubMenu = ({ items, keyName, activeIdx = 0 }: { items: string[]; keyName: string; activeIdx?: number }) => (
    <div style={{
      overflow: "hidden",
      maxHeight: openSubs[keyName] ? "260px" : "0",
      transition: "max-height .25s ease",
      paddingLeft: 16,
    }}>
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "7px 10px", borderRadius: 8,
            fontSize: 11.5, color: i === activeIdx ? ACCENT : "rgba(255,255,255,.38)",
            cursor: "pointer", transition: "all .13s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,.78)"; e.currentTarget.style.background = "rgba(255,255,255,.04)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = i === activeIdx ? ACCENT : "rgba(255,255,255,.38)"; e.currentTarget.style.background = "transparent"; }}
        >
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", flexShrink: 0 }} />
          {it}
        </div>
      ))}
    </div>
  );

  const NavItem = ({ href, icon: Icon, label, badge, hasSub, subKey }: {
    href?: string; icon: () => React.ReactElement; label: string; badge?: string | number; hasSub?: boolean; subKey?: string;
  }) => {
    const isActive = href ? pathname === href : false;
    const activeStyle: React.CSSProperties = isActive
      ? { background: "rgba(99,102,241,.2)", color: "#fff" }
      : {};

    const content = (
      <>
        {/* Active left accent bar */}
        {isActive && (
          <span style={{
            position: "absolute", left: 0, top: "22%", bottom: "22%",
            width: 3, borderRadius: "0 3px 3px 0", background: ACCENT,
          }} />
        )}
        <span style={{ width: 16, height: 16, flexShrink: 0 }}><Icon /></span>
        <span style={{ flex: 1, whiteSpace: "nowrap" }}>{label}</span>
        {badge !== undefined && (
          <span style={{ background: ORANGE, color: "#fff", fontSize: 9.5, fontWeight: 700, padding: "2px 6px", borderRadius: 99 }}>{badge}</span>
        )}
        {hasSub && (
          <span style={{ width: 12, height: 12, flexShrink: 0, opacity: subKey && openSubs[subKey] ? .7 : .35, transition: "transform .2s", transform: subKey && openSubs[subKey] ? "rotate(90deg)" : "none" }}><IconArr /></span>
        )}
      </>
    );

    const base = (
      <div
        style={{ ...niBase, ...activeStyle }}
        onClick={hasSub && subKey ? () => toggleSub(subKey) : undefined}
        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.color = "rgba(255,255,255,.82)"; } }}
        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,.48)"; } }}
      >
        {content}
      </div>
    );

    if (href) {
      return (
        <Link href={href} style={{ textDecoration: "none" }} onClick={() => setMobileOpen(false)}>
          {base}
        </Link>
      );
    }
    return base;
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", position: "relative", fontFamily: "'Inter', sans-serif" }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 200 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: SIDEBAR_W, flexShrink: 0, background: SIDEBAR_BG,
        display: "flex", flexDirection: "column", height: "100%",
        overflow: "hidden", position: "relative", zIndex: 300,
        transition: "transform .25s cubic-bezier(.4,0,.2,1)",
      }} className={`sidebar-aside${mobileOpen ? " open" : ""}`}>
        {/* Logo */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "18px 16px", borderBottom: "1px solid rgba(255,255,255,.06)", flexShrink: 0,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: `linear-gradient(135deg, ${ORANGE}, ${PINK})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 15, color: "#fff", flexShrink: 0,
          }}>K</div>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#fff", letterSpacing: "-.2px" }}>KRY<span style={{ color: ORANGE, fontStyle: "normal" }}>ROS</span></div>
        </div>

        {/* Scrollable nav */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "8px 8px 0", scrollbarWidth: "thin" }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "rgba(255,255,255,.22)", padding: "12px 8px 5px" }}>Main</div>

          <NavItem href="/admin" icon={IconDashboard} label="Dashboard" />

          <NavItem icon={IconOrders} label="Orders" badge={8} hasSub subKey="orders" />
          <SubMenu items={["All Orders", "Pending", "Completed", "Cancelled"]} keyName="orders" activeIdx={0} />

          <NavItem icon={IconProducts} label="Products" hasSub subKey="products" />
          <SubMenu items={["All Products", "Categories", "Inventory"]} keyName="products" />

          <NavItem href="/admin/contacts" icon={IconCustomers} label="Customers" />

          <NavItem icon={IconPayments} label="Payments" hasSub subKey="payments" />
          <SubMenu items={["Transactions", "Invoices", "Expenses", "Estimates"]} keyName="payments" />

          <NavItem href="/admin/reports" icon={IconReports} label="Reports" />

          <NavItem icon={IconNotif} label="Notifications" badge={3} hasSub subKey="notifications" />
          <SubMenu items={["Push Notification", "SMS", "SMTP / Email"]} keyName="notifications" />

          <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "rgba(255,255,255,.22)", padding: "12px 8px 5px" }}>Store</div>

          <NavItem icon={IconCMS} label="CMS & Pages" hasSub subKey="cms" />
          <SubMenu items={["Home Page", "Shop Page", "Banners"]} keyName="cms" />

          <NavItem href="/admin/wholesale" icon={IconWholesale} label="Wholesale" />
          <NavItem href="/admin/locations-shipping" icon={IconDelivery} label="Delivery Zones" />

          <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "rgba(255,255,255,.22)", padding: "12px 8px 5px" }}>System</div>

          <NavItem href="/admin/settings" icon={IconSettings} label="Settings" />

          <div style={{ height: 12 }} />
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,.06)",
          display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: `linear-gradient(135deg, ${ORANGE}, ${PINK})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 12, color: "#fff", flexShrink: 0,
          }}>K</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Admin</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 1 }}>Super Admin</div>
          </div>
          <span style={{ width: 14, height: 14, color: "rgba(255,255,255,.3)", cursor: "pointer", flexShrink: 0 }}><IconLogout /></span>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden", background: "#F5F6FA" }}>
        {/* Topbar */}
        <div style={{
          height: 60, flexShrink: 0, background: "#fff", borderBottom: "1px solid #E5E7EB",
          display: "flex", alignItems: "center", padding: "0 20px", gap: 10,
        }}>
          {/* Hamburger (mobile) */}
          <button
            onClick={() => setMobileOpen(true)}
            style={{
              display: "none", width: 36, height: 36, borderRadius: 9,
              background: "#F5F6FA", border: "1px solid #E5E7EB",
              alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
            }}
            className="tb-ham-btn"
          >
            <span style={{ width: 16, height: 16, color: "#4B5563" }}><IconHam /></span>
          </button>

          <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Dashboard</div>

          {/* Search */}
          <div style={{ position: "relative", flex: 1, maxWidth: 260, marginLeft: 8 }} className="tb-search-wrap">
            <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "#9CA3AF" }}><IconSearch /></span>
            <input
              placeholder="Search orders, customers…"
              style={{
                width: "100%", background: "#F5F6FA", border: "1px solid #E5E7EB",
                borderRadius: 9, padding: "7px 10px 7px 30px",
                fontSize: 12, fontFamily: "inherit", color: "#111827", outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            {/* Period buttons */}
            <div style={{ display: "flex", background: "#F5F6FA", border: "1px solid #E5E7EB", borderRadius: 9, overflow: "hidden" }} className="period-wrap">
              {["Week", "Month", "Year"].map((p, i) => (
                <button key={p} style={{
                  background: i === 1 ? ACCENT : "none", border: "none",
                  padding: "6px 12px", fontSize: 11.5, fontWeight: 500,
                  color: i === 1 ? "#fff" : "#9CA3AF", cursor: "pointer",
                  fontFamily: "inherit", transition: "all .13s",
                  borderRadius: i === 1 ? 7 : 0, margin: i === 1 ? 2 : 0,
                }}>{p}</button>
              ))}
            </div>

            {/* Bell */}
            <button style={{
              width: 34, height: 34, borderRadius: 9, background: "#F5F6FA",
              border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", position: "relative",
            }}>
              <span style={{ width: 15, height: 15, color: "#4B5563" }}><IconBell /></span>
              <span style={{
                position: "absolute", top: 6, right: 6, width: 7, height: 7,
                borderRadius: "50%", background: ORANGE, border: "1.5px solid #fff",
              }} />
            </button>

            {/* Avatar */}
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: `linear-gradient(135deg, ${ORANGE}, ${PINK})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 12, color: "#fff", cursor: "pointer",
            }}>K</div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          <AdminSettingsProvider>
            {children}
          </AdminSettingsProvider>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 860px) {
          .sidebar-aside {
            position: fixed !important;
            left: 0; top: 0;
            transform: translateX(-100%) !important;
            box-shadow: 4px 0 24px rgba(0,0,0,.35);
          }
          .sidebar-aside.open {
            transform: translateX(0) !important;
          }
          .tb-ham-btn {
            display: flex !important;
          }
          .tb-search-wrap {
            display: none !important;
          }
          .period-wrap {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
