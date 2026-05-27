"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import {
  Users, Star, Package, Store, ChevronRight,
  Bell, Calendar, Sun, Moon, Menu, ChevronDown, Search,
} from "lucide-react";

export default function WholesaleDashboardPage() {
  const BG = "#F5F6FA";
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
    { id: "accounts", label: "Wholesale Accounts", icon: Users, count: counts.accounts, href: "/admin/wholesale/accounts", description: "Manage applications and approved wholesale partners.", iconColor: "#6366F1", iconBg: "rgba(18,214,197,0.12)" },
    { id: "deals",    label: "Featured Deals",      icon: Star,  count: counts.deals,    href: "/admin/wholesale/deals",    description: "Customize the wholesale offers shown on the storefront.", iconColor: "#F59E0B", iconBg: "rgba(245,158,11,0.12)" },
    { id: "products", label: "Wholesale Inventory", icon: Package, count: counts.products, href: "/admin/wholesale/products", description: "Exclusive products only available to wholesale buyers.", iconColor: "#3B82F6", iconBg: "rgba(59,130,246,0.12)" },
  ];

  const card = { background: CARD, border: "1px solid #E5E7EB", borderRadius: 14 };

  return (
    <div style={{ background: "#F5F6FA", minHeight: "100%", padding: "24px" }}>

        {/* Body */}

          {/* Page title */}
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
              <Store style={{ width: 24, height: 24, color: TEXT2 }} /> Wholesale Hub
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: TEXT2 }}>
              <Link href="/admin" style={{ color: TEXT2, textDecoration: "none" }}>Home</Link>
              <ChevronRight style={{ width: 13, height: 13 }} />
              <span style={{ color: "#6366F1" }}>Wholesale</span>
            </div>
            <p style={{ fontSize: 12, color: TEXT2, marginTop: 6 }}>Manage your B2B operations and inventory</p>
          </div>

          {/* Summary stat strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "Active Accounts",    value: counts.accounts, color: "#6366F1" },
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div style={{ display: "flex", alignItems: "center", fontSize: 12, fontWeight: 700, color: "#6366F1" }}>
                  Open Section <ChevronRight style={{ width: 13, height: 13, marginLeft: 4 }} />
                </div>
              </Link>
            ))}
          </div>

        </div>
  );
}