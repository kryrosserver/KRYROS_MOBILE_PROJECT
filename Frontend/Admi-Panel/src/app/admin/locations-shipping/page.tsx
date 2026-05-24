"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Globe,
  Map as MapIcon,
  Building2,
  Truck,
  Settings2,
  MapPin,
  ChevronRight
} from "lucide-react";

export default function ShippingDashboardPage() {
  const [counts, setCounts] = useState({ countries: 0, states: 0, cities: 0, zones: 0, methods: 0 });
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [cRes, sRes, ctRes, zRes, stRes] = await Promise.all([
          fetch("/api/admin/countries"),
          fetch("/api/admin/states"),
          fetch("/api/admin/cities"),
          fetch("/api/admin/shipping-zones"),
          fetch("/api/admin/shipping-zones/status"),
        ]);
        if (cRes.ok)  { const d = await cRes.json();  setCounts(p => ({ ...p, countries: d.length })); }
        if (sRes.ok)  { const d = await sRes.json();  setCounts(p => ({ ...p, states: d.length })); }
        if (ctRes.ok) { const d = await ctRes.json(); setCounts(p => ({ ...p, cities: d.length })); }
        if (zRes.ok)  { const d = await zRes.json();  setCounts(p => ({ ...p, zones: d.length })); }
        if (stRes.ok) { const d = await stRes.json(); setIsEnabled(d); }
      } catch (err) {}
    };
    loadCounts();
  }, []);

  const sections = [
    {
      id: "countries", label: "Countries",          icon: Globe,     count: counts.countries,
      href: "/admin/locations-shipping/countries",  description: "Manage supported nations and their currencies.",
      iconBg: "rgba(18,214,197,0.12)", iconColor: "#12D6C5",
    },
    {
      id: "states",    label: "States / Provinces", icon: MapIcon,   count: counts.states,
      href: "/admin/locations-shipping/states",     description: "Define administrative regions for specific countries.",
      iconBg: "rgba(59,130,246,0.12)", iconColor: "#3B82F6",
    },
    {
      id: "cities",    label: "Cities",             icon: Building2, count: counts.cities,
      href: "/admin/locations-shipping/cities",     description: "Specific city-level data for precise shipping.",
      iconBg: "rgba(245,158,11,0.12)", iconColor: "#F59E0B",
    },
    {
      id: "zones",     label: "Shipping Zones",     icon: Truck,     count: counts.zones,
      href: "/admin/locations-shipping/zones",      description: "Group locations into zones with custom rates.",
      iconBg: "rgba(239,68,68,0.12)", iconColor: "#EF4444",
    },
    {
      id: "global",    label: "Global Methods",     icon: Settings2, count: 0,
      href: "/admin/locations-shipping/global",     description: "Default shipping rules for the entire storefront.",
      iconBg: "rgba(139,92,246,0.12)", iconColor: "#8B5CF6",
    },
  ];

  return (
    <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(18,214,197,0.12)" }}
          >
            <MapPin className="h-5 w-5" style={{ color: "#12D6C5" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Locations & Shipping
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
              Configure where you ship and how much it costs
            </p>
          </div>
        </div>

        {/* System Status Badge */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest self-start sm:self-auto"
          style={isEnabled
            ? { background: "rgba(22,199,132,0.12)", color: "#16C784", border: "1px solid rgba(22,199,132,0.25)" }
            : { background: "var(--icon-bg)", color: "var(--text-muted)", border: "1px solid var(--card-border)" }
          }
        >
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: isEnabled ? "#16C784" : "var(--text-muted)" }}
          />
          System: {isEnabled ? "Location Based" : "Global Only"}
        </div>
      </div>

      {/* Section Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <Link
            key={section.id}
            href={section.href}
            className="group admin-card flex flex-col gap-4 transition-all duration-200"
            style={{ textDecoration: "none" }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = section.iconColor;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--card-border)";
              e.currentTarget.style.transform = "none";
            }}
          >
            <div className="flex items-start justify-between">
              <div
                className="p-3 rounded-xl"
                style={{ background: section.iconBg }}
              >
                <section.icon className="h-5 w-5" style={{ color: section.iconColor }} />
              </div>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: section.iconBg, color: section.iconColor }}
              >
                {section.count} Items
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                {section.label}
              </h3>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {section.description}
              </p>
            </div>
            <div
              className="flex items-center text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: section.iconColor }}
            >
              Configure <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
