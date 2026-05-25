"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import {
  Users, Star, Package, Store, ChevronRight,
  Bell, Calendar, Sun, Moon, Menu, ChevronDown, Search,
} from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

const ACCENT = "#12D6C5";
const MOBILE_BASE = 750;
const DESKTOP_BASE = 1380;

export default function WholesaleDashboardPage() {
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
    function applyHeight(nextScale: number) {
      if (!innerRef.current || !outerRef.current) return;
      outerRef.current.style.height = "auto";
      outerRef.current.style.height = `${innerRef.current.scrollHeight * nextScale}px`;
    }
    function recalc() {
      if (!innerRef.current || !outerRef.current) return;
      const vw = outerRef.current.offsetWidth || window.innerWidth;
      const baseW = vw < 960 ? MOBILE_BASE : DESKTOP_BASE;
      if (vw <= 599) { innerRef.current.style.width = "750px"; innerRef.current.style.transform = "none"; innerRef.current.style.transformOrigin = "top left"; if (outerRef.current) { outerRef.current.style.overflowX = "auto"; outerRef.current.style.height = "auto"; } return; } if (outerRef.current) outerRef.current.style.overflowX = "hidden"; const nextScale = Math.min(1, vw / baseW);
      innerRef.current.style.width = `${baseW}px`;
      innerRef.current.style.transform = `scale(${nextScale})`;
      innerRef.current.style.transformOrigin = "top left";
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(nextScale)));
    }
    recalc();
    const t = setTimeout(recalc, 400);
    window.addEventListener("resize", recalc);
    return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);

  const [counts, setCounts] = useState({ accounts: 0, deals: 0, products: 0 });

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [accRes, dealsRes, prodRes] = await Promise.all([
          fetch("/api/admin/wholesale/accounts"),
          fetch("/internal/admin/cms/sections"),
          fetch("/api/admin/products?showInactive=true"),
        ]);
        if (accRes.ok) {
          const data = await accRes.json();
          setCounts(prev => ({ ...prev, accounts: data.length }));
        }
        if (dealsRes.ok) {
          const data = await dealsRes.json();
          const deals = (data?.data || data).filter((s: any) => s.type === "wholesale_deals" && s.isActive).length;
          setCounts(prev => ({ ...prev, deals }));
        }
        if (prodRes.ok) {
          const data = await prodRes.json();
          const items = Array.isArray(data?.products) ? data.products : data?.data || [];
          setCounts(prev => ({ ...prev, products: items.filter((p: any) => !!p.isWholesaleOnly).length }));
        }
      } catch {}
    };
    loadCounts();
  }, []);

  const sections = [
    { id: "accounts", label: "Wholesale Accounts", icon: Users, count: counts.accounts, href: "/admin/wholesale/accounts", description: "Manage applications and approved wholesale partners.", iconColor: ACCENT, iconBg: "rgba(18,214,197,0.12)" },
    { id: "deals",    label: "Featured Deals",      icon: Star,  count: counts.deals,    href: "/admin/wholesale/deals",    description: "Customize the wholesale offers shown on the storefront.", iconColor: "#F59E0B", iconBg: "rgba(245,158,11,0.12)" },
    { id: "products", label: "Wholesale Inventory", icon: Package, count: counts.products, href: "/admin/wholesale/products", description: "Exclusive products only available to wholesale buyers.", iconColor: "#3B82F6", iconBg: "rgba(59,130,246,0.12)" },
  ];

  const card = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14 };

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: BG, margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: BG, color: TEXT, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* ── TOP HEADER BAR ── */}
        <header style={{ background: HEADER_BG, borderBottom: `1px solid ${BORDER}`, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>
              <Menu style={{ width: 20, height: 20 }} />
            </button>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: TEXT, whiteSpace: "nowrap", margin: 0 }}>Wholesale Hub</h1>
          </div>
          <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: TEXT2, width: 15, height: 15 }} />
            <input placeholder="Search wholesale..." style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "8px 40px 8px 36px", color: TEXT, fontSize: 13, outline: "none" }} />
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
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Page title */}
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
              <Store style={{ width: 24, height: 24, color: TEXT2 }} /> Wholesale Hub
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: TEXT2 }}>
              <Link href="/admin" style={{ color: TEXT2, textDecoration: "none" }}>Home</Link>
              <ChevronRight style={{ width: 13, height: 13 }} />
              <span style={{ color: ACCENT }}>Wholesale</span>
            </div>
            <p style={{ fontSize: 12, color: TEXT2, marginTop: 6 }}>Manage your B2B operations and inventory</p>
          </div>

          {/* Summary stat strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              { label: "Active Accounts",    value: counts.accounts, color: ACCENT },
              { label: "Active Deals",        value: counts.deals,    color: "#F59E0B" },
              { label: "Wholesale Products",  value: counts.products, color: "#3B82F6" },
            ].map((s, i) => (
              <div key={i} style={{ ...card, padding: "16px 20px" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: TEXT2, marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Section cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {sections.map((section) => (
              <Link
                key={section.id}
                href={section.href}
                style={{ ...card, padding: "20px", display: "flex", flexDirection: "column", gap: 16, textDecoration: "none", transition: "border-color 0.15s, transform 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as any).style.borderColor = section.iconColor; (e.currentTarget as any).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as any).style.borderColor = BORDER; (e.currentTarget as any).style.transform = "none"; }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div style={{ padding: 12, borderRadius: 12, background: section.iconBg }}>
                    <section.icon style={{ width: 20, height: 20, color: section.iconColor }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: section.iconColor, background: section.iconBg, padding: "3px 10px", borderRadius: 20 }}>{section.count} Items</span>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: 0 }}>{section.label}</h3>
                  <p style={{ fontSize: 12, color: TEXT2, marginTop: 6, lineHeight: 1.5 }}>{section.description}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", fontSize: 12, fontWeight: 700, color: ACCENT }}>
                  Open Section <ChevronRight style={{ width: 13, height: 13, marginLeft: 4 }} />
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
