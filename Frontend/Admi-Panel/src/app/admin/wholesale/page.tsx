"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import {
  Users,
  Star,
  Package,
  Store,
  ChevronRight
} from "lucide-react";

export default function WholesaleDashboardPage() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf: number;
    function applyHeight(nextScale: number) { if (!innerRef.current || !outerRef.current) return; outerRef.current.style.height = "auto"; const naturalH = innerRef.current.scrollHeight; const visualH = naturalH * nextScale; const isMobile = window.innerWidth < 1024; const screenAvail = isMobile ? window.innerHeight - 64 : Infinity; outerRef.current.style.height = `${Math.max(visualH, screenAvail)}px`; }
    function recalc() { if (!innerRef.current || !outerRef.current) return; const vw = outerRef.current.offsetWidth || window.innerWidth; const baseW = vw < 960 ? 960 : 1380; const nextScale = Math.min(1, vw / baseW); innerRef.current.style.width = `${baseW}px`; innerRef.current.style.transform = `scale(${nextScale})`; innerRef.current.style.transformOrigin = "top left"; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(nextScale))); }
    recalc(); const t = setTimeout(recalc, 400); window.addEventListener("resize", recalc); return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);
  const [counts, setCounts] = useState({
    accounts: 0,
    deals: 0,
    products: 0
  });

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [accRes, dealsRes, prodRes] = await Promise.all([
          fetch("/api/admin/wholesale/accounts"),
          fetch("/internal/admin/cms/sections"),
          fetch("/api/admin/products?showInactive=true")
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
      } catch (err) {}
    };
    loadCounts();
  }, []);

  const sections = [
    {
      id: "accounts",
      label: "Wholesale Accounts",
      icon: Users,
      count: counts.accounts,
      href: "/admin/wholesale/accounts",
      description: "Manage applications and approved wholesale partners.",
      iconBg: "rgba(18,214,197,0.12)",
      iconColor: "#12D6C5",
    },
    {
      id: "deals",
      label: "Featured Deals",
      icon: Star,
      count: counts.deals,
      href: "/admin/wholesale/deals",
      description: "Customize the wholesale offers shown on the storefront.",
      iconBg: "rgba(245,158,11,0.12)",
      iconColor: "#F59E0B",
    },
    {
      id: "products",
      label: "Wholesale Inventory",
      icon: Package,
      count: counts.products,
      href: "/admin/wholesale/products",
      description: "Exclusive products only available to wholesale buyers.",
      iconBg: "rgba(59,130,246,0.12)",
      iconColor: "#3B82F6",
    },
  ];

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: "var(--bg-primary)", margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: "var(--bg-primary)", padding: "24px" }}>
    <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)" }}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: "var(--text-primary)" }}>
          <Store className="h-6 w-6" style={{ color: "var(--text-muted)" }} />
          Wholesale Hub
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Manage your B2B operations and inventory
        </p>
      </div>

      {/* Summary stat strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Active Accounts",    value: counts.accounts },
          { label: "Active Deals",       value: counts.deals },
          { label: "Wholesale Products", value: counts.products },
        ].map((s, i) => (
          <div key={i} className="admin-card !p-4">
            <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <Link
            key={section.id}
            href={section.href}
            className="group admin-card flex flex-col gap-4 transition-all duration-200"
            style={{ textDecoration: "none" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = section.iconColor; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.transform = "none"; }}
          >
            <div className="flex items-start justify-between">
              <div
                className="p-3 rounded-xl"
                style={{ background: section.iconBg }}
              >
                <section.icon className="h-5 w-5" style={{ color: section.iconColor }} />
              </div>
              <span className="badge badge-info text-xs">{section.count} Items</span>
            </div>
            <div className="flex-1">
              <h3
                className="font-bold text-base transition-colors"
                style={{ color: "var(--text-primary)" }}
              >
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
              Open Section <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
      </div>
    </div>
  );
}
