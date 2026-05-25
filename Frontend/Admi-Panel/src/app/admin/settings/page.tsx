"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Building,
  Bell,
  CreditCard,
  Shield,
  Palette,
  Settings as SettingsIcon,
  ChevronRight,
  Search,
  Calendar,
  Sun,
  Moon,
  Menu,
  ChevronDown
} from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

export default function SettingsDashboardPage() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf: number;
    function applyHeight(nextScale: number) { if (!innerRef.current || !outerRef.current) return; outerRef.current.style.height = "auto"; const naturalH = innerRef.current.scrollHeight; const visualH = naturalH * nextScale; const isMobile = window.innerWidth < 1024; const screenAvail = isMobile ? window.innerHeight - 64 : Infinity; outerRef.current.style.height = `${visualH}px`; }
    function recalc() { if (!innerRef.current || !outerRef.current) return; const vw = outerRef.current.offsetWidth || window.innerWidth; const baseW = vw < 960 ? 750 : 1380; const nextScale = Math.min(1, vw / baseW); innerRef.current.style.width = `${baseW}px`; innerRef.current.style.transform = `scale(${nextScale})`; innerRef.current.style.transformOrigin = "top left"; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(nextScale))); }
    recalc(); const t = setTimeout(recalc, 400); window.addEventListener("resize", recalc); return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);
  const sections = [
    {
      id: "company",
      label: "Company Profile",
      icon: Building,
      href: "/admin/settings/company",
      description: "Manage business identity, contact info, and branding.",
      iconBg: "rgba(18,214,197,0.12)",
      iconColor: "#12D6C5",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      href: "/admin/settings/notifications",
      description: "Control how you receive system alerts and email updates.",
      iconBg: "rgba(245,158,11,0.12)",
      iconColor: "#F59E0B",
    },
    {
      id: "payment",
      label: "Payment Gateways",
      icon: CreditCard,
      href: "/admin/settings/payment",
      description: "Configure online payment providers and bank transfers.",
      iconBg: "rgba(22,199,132,0.12)",
      iconColor: "#16C784",
    },
    {
      id: "security",
      label: "Security Center",
      icon: Shield,
      href: "/admin/settings/security",
      description: "Protect your admin account with 2FA and password rules.",
      iconBg: "rgba(239,68,68,0.12)",
      iconColor: "#EF4444",
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: Palette,
      href: "/admin/settings/appearance",
      description: "Customize colors, themes, and dashboard layouts.",
      iconBg: "rgba(139,92,246,0.12)",
      iconColor: "#8B5CF6",
    },
  ];

  const { isDark, toggleTheme } = useTheme();

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: "var(--bg-primary)", margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: "var(--bg-primary)", color: "var(--text-primary)", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <header style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--card-border)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 4 }}><Menu style={{ width: 20, height: 20 }} /></button>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", margin: 0 }}>Settings Hub</h1>
          </div>
          <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", width: 15, height: 15 }} />
            <input placeholder="Search settings..." style={{ width: "100%", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 10, padding: "8px 40px 8px 36px", color: "var(--text-primary)", fontSize: 13, outline: "none" }} />
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "var(--text-secondary)", background: "var(--icon-bg)", padding: "2px 5px", borderRadius: 4 }}>⌘K</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ position: "relative", background: "transparent", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 4 }}>
              <Bell style={{ width: 20, height: 20 }} />
              <span style={{ position: "absolute", top: 0, right: 0, background: "#EF4444", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>1</span>
            </button>
            <button onClick={toggleTheme} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 4 }}>{isDark ? <Sun style={{ width: 20, height: 20 }} /> : <Moon style={{ width: 20, height: 20 }} />}</button>
            <button style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 10, padding: "7px 14px", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
              <Calendar style={{ width: 14, height: 14 }} /> May 20 – May 26, 2025 <ChevronDown style={{ width: 13, height: 13 }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#12D6C5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0B1320" }}>K</div>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>Admin</div><div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 1 }}>Super Admin</div></div>
              <ChevronDown style={{ width: 14, height: 14, color: "var(--text-secondary)" }} />
            </div>
          </div>
        </header>
        <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)", padding: "20px" }}>
          <div>
            <h2 className="text-2xl font-bold flex whitespace-nowrap items-center gap-3" style={{ color: "var(--text-primary)" }}>
              <SettingsIcon className="h-6 w-6" style={{ color: "var(--text-muted)" }} />
              Settings Hub
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Manage global configuration and platform preferences</p>
          </div>

      {/* Settings Cards Grid */}
      <div className="grid grid-cols-3 gap-4">
        {sections.map((section) => (
          <Link
            key={section.id}
            href={section.href}
            className="group admin-card flex flex-col gap-4 transition-all duration-200"
            style={{ textDecoration: "none" }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.borderColor = "#12D6C5";
              el.style.boxShadow = "0 8px 32px rgba(18,214,197,0.12)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.borderColor = "var(--card-border)";
              el.style.boxShadow = "";
            }}
          >
            <div
              className="p-3 rounded-xl w-fit"
              style={{ background: section.iconBg }}
            >
              <section.icon className="h-5 w-5" style={{ color: section.iconColor }} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base transition-colors" style={{ color: "var(--text-primary)" }}>
                {section.label}
              </h3>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {section.description}
              </p>
            </div>
            <div
              className="flex items-center text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: "#12D6C5" }}
            >
              Configure <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
      </div>
    </div>
  );
}
