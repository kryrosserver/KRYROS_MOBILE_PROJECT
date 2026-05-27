"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { AdminSettingsProvider } from "@/providers/AdminSettingsProvider";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, Users, Package, LayoutGrid, Tag,
  MessageSquare, Box, Store, CreditCard, Wallet,
  Globe, MapPin, Wrench, FileText, FileCode,
  Bell, BarChart3, Settings, Search, LogOut, Menu,
  ChevronRight,
} from "lucide-react";

/* ── wrapper so every icon is a () => ReactElement ── */
const I = (IconComp: LucideIcon) => {
  const C = () => <IconComp size={16} strokeWidth={1.8} />;
  return C;
};

/* ── Constants ── */
const SIDEBAR_W = 230;
const SIDEBAR_BG = "#12172B";
const ACCENT = "#6366F1";
const ORANGE = "#F97316";
const PINK = "#EC4899";
const MOBILE_BP = 860;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openSubs, setOpenSubs] = useState<Record<string, boolean>>({});

  /* Detect mobile via JS — avoids CSS specificity conflicts with inline styles */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BP);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* Close sidebar on route change */
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
          <ChevronRight size={12} color="rgba(255,255,255,.35)" style={{ flexShrink: 0, opacity: subKey && openSubs[subKey] ? .7 : .35, transition: "transform .2s", transform: subKey && openSubs[subKey] ? "rotate(90deg)" : "none" }} />
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

  /* Sidebar style: on mobile it floats fixed over content so main area gets 100% width */
  const sidebarStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 400,
        width: SIDEBAR_W, background: SIDEBAR_BG,
        display: "flex", flexDirection: "column", height: "100vh",
        overflow: "hidden",
        transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform .25s cubic-bezier(.4,0,.2,1)",
        boxShadow: mobileOpen ? "4px 0 32px rgba(0,0,0,.45)" : "none",
      }
    : {
        width: SIDEBAR_W, flexShrink: 0, background: SIDEBAR_BG,
        display: "flex", flexDirection: "column", height: "100%",
        overflow: "hidden", zIndex: 10,
        transition: "transform .25s cubic-bezier(.4,0,.2,1)",
      };

  return (
    <div style={{
      display: "flex", height: "100vh", width: "100%",
      overflow: "hidden", position: "relative",
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* Single mobile overlay — only rendered when sidebar is open on mobile */}
      {isMobile && mobileOpen && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,.5)",
            zIndex: 399,
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={sidebarStyle}>
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
          <div style={{ fontWeight: 800, fontSize: 15, color: "#fff", letterSpacing: "-.2px" }}>
            KRY<span style={{ color: ORANGE }}>ROS</span>
          </div>
        </div>

        {/* Scrollable nav */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "8px 8px 0", scrollbarWidth: "thin" }}>
          <NavItem href="/admin"                    icon={I(LayoutDashboard)} label="Dashboard" />
          <NavItem href="/admin/users"              icon={I(Users)}           label="Users & Roles" />
          <NavItem href="/admin/orders"             icon={I(Package)}         label="Orders" />
          <NavItem href="/admin/categories"         icon={I(LayoutGrid)}      label="Categories" />
          <NavItem href="/admin/brands"             icon={I(Tag)}             label="Brands" />
          <NavItem href="/admin/reviews"            icon={I(MessageSquare)}   label="Reviews" />
          <NavItem href="/admin/products"           icon={I(Box)}             label="Products" />
          <NavItem href="/admin/wholesale"          icon={I(Store)}           label="Wholesale" />
          <NavItem href="/admin/credit"             icon={I(CreditCard)}      label="Credit System" />
          <NavItem href="/admin/wallet"             icon={I(Wallet)}          label="Wallet & Payments" />
          <NavItem href="/admin/countries"          icon={I(Globe)}           label="Countries / Currencies" />
          <NavItem href="/admin/locations-shipping" icon={I(MapPin)}          label="Locations & Shipping" />
          <NavItem href="/admin/services"           icon={I(Wrench)}          label="Services" />
          <NavItem href="/admin/invoice"            icon={I(FileText)}        label="Invoicing" />
          <NavItem href="/admin/cms"                icon={I(FileCode)}        label="CMS & Pages" />
          <NavItem href="/admin/notifications"      icon={I(Bell)}            label="Notifications" />
          <NavItem href="/admin/reports"            icon={I(BarChart3)}       label="Reports" />
          <NavItem href="/admin/settings"           icon={I(Settings)}        label="Settings" />
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
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Admin User</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 1 }}>Super Admin</div>
          </div>
          <LogOut size={14} color="rgba(255,255,255,.3)" style={{ cursor: "pointer" }} />
        </div>
      </aside>

      {/* Main — always gets full remaining width; on mobile sidebar is fixed so this = 100% */}
      <div style={{
        flex: 1, minWidth: 0, display: "flex", flexDirection: "column",
        overflow: "hidden", background: "#F5F6FA",
      }}>
        {/* Topbar */}
        <div style={{
          height: 60, flexShrink: 0, background: "#fff",
          borderBottom: "1px solid #E5E7EB",
          display: "flex", alignItems: "center",
          padding: isMobile ? "0 14px" : "0 20px", gap: 10,
        }}>
          {/* Hamburger — mobile only */}
          {isMobile && (
            <button
              onClick={() => setMobileOpen(true)}
              style={{
                width: 36, height: 36, borderRadius: 9,
                background: "#F5F6FA", border: "1px solid #E5E7EB",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", flexShrink: 0,
              }}
            >
              <Menu size={16} color="#4B5563" />
            </button>
          )}

          <div style={{ fontSize: isMobile ? 13 : 15, fontWeight: 700, color: "#111827" }}>
            KRYROS Admin
          </div>

          {/* Search — desktop only */}
          {!isMobile && (
            <div style={{ position: "relative", flex: 1, maxWidth: 260, marginLeft: 8 }}>
              <Search size={13} color="#9CA3AF" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }} />
              <input
                placeholder="Search orders, customers…"
                style={{
                  width: "100%", background: "#F5F6FA", border: "1px solid #E5E7EB",
                  borderRadius: 9, padding: "7px 10px 7px 30px",
                  fontSize: 12, fontFamily: "inherit", color: "#111827", outline: "none",
                }}
              />
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            {/* Period selector — desktop only */}
            {!isMobile && (
              <div style={{ display: "flex", background: "#F5F6FA", border: "1px solid #E5E7EB", borderRadius: 9, overflow: "hidden" }}>
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
            )}

            {/* Bell */}
            <button style={{
              width: 34, height: 34, borderRadius: 9, background: "#F5F6FA",
              border: "1px solid #E5E7EB", display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", position: "relative",
            }}>
              <Bell size={15} color="#4B5563" />
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
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", minWidth: 0 }}>
          <AdminSettingsProvider>
            {children}
          </AdminSettingsProvider>
        </div>
      </div>
    </div>
  );
}
