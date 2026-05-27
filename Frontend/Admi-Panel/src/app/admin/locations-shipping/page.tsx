"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Globe, Map, Building2, Truck, Settings2,
  ChevronRight, RefreshCw, ToggleLeft, ToggleRight,
} from "lucide-react";

export default function ShippingDashboardPage() {
  const [counts, setCounts] = useState({ countries: 0, states: 0, cities: 0, zones: 0, methods: 0 });
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadCounts = async () => {
    setLoading(true);
    try {
      const [cRes, sRes, ctRes, zRes, stRes] = await Promise.all([
        fetch("/api/admin/countries"),
        fetch("/api/admin/states"),
        fetch("/api/admin/cities"),
        fetch("/api/admin/shipping-zones"),
        fetch("/api/admin/shipping-zones/status"),
      ]);
      if (cRes.ok)  { const d = await cRes.json();  setCounts(p => ({ ...p, countries: d.length || 0 })); }
      if (sRes.ok)  { const d = await sRes.json();  setCounts(p => ({ ...p, states: d.length || 0 })); }
      if (ctRes.ok) { const d = await ctRes.json(); setCounts(p => ({ ...p, cities: d.length || 0 })); }
      if (zRes.ok)  { const d = await zRes.json();  setCounts(p => ({ ...p, zones: d.length || 0 })); }
      if (stRes.ok) { const d = await stRes.json(); setIsEnabled(!!d); }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { loadCounts(); }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadCounts().finally(() => setTimeout(() => setIsRefreshing(false), 400));
  };

  const sections = [
    {
      label: "Countries",
      icon: Globe,
      count: counts.countries,
      href: "/admin/locations-shipping/countries",
      description: "Manage supported countries and their currencies.",
      iconBg: "rgba(99,102,241,.1)", iconColor: "#6366F1",
    },
    {
      label: "States / Provinces",
      icon: Map,
      count: counts.states,
      href: "/admin/locations-shipping/states",
      description: "Define administrative regions within countries.",
      iconBg: "rgba(59,130,246,.1)", iconColor: "#3B82F6",
    },
    {
      label: "Cities",
      icon: Building2,
      count: counts.cities,
      href: "/admin/locations-shipping/cities",
      description: "City-level data for precise delivery targeting.",
      iconBg: "rgba(245,158,11,.1)", iconColor: "#F59E0B",
    },
    {
      label: "Shipping Zones",
      icon: Truck,
      count: counts.zones,
      href: "/admin/locations-shipping/zones",
      description: "Group regions into zones with custom shipping rates.",
      iconBg: "rgba(239,68,68,.1)", iconColor: "#EF4444",
    },
    {
      label: "Global Methods",
      icon: Settings2,
      count: counts.methods,
      href: "/admin/locations-shipping/global",
      description: "Default shipping rules applied across all locations.",
      iconBg: "rgba(139,92,246,.1)", iconColor: "#8B5CF6",
    },
  ];

  const summaryStats = [
    { label: "Countries",  value: counts.countries, color: "#6366F1", bg: "rgba(99,102,241,.1)" },
    { label: "States",     value: counts.states,    color: "#3B82F6", bg: "rgba(59,130,246,.1)" },
    { label: "Cities",     value: counts.cities,    color: "#F59E0B", bg: "rgba(245,158,11,.1)" },
    { label: "Zones",      value: counts.zones,     color: "#EF4444", bg: "rgba(239,68,68,.1)" },
  ];

  return (
    <div style={{ background: "#F5F6FA", minHeight: "100%", padding: "20px 16px 40px" }}>
      <div className="max-w-full mx-auto space-y-5">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#111827" }}>Shipping &amp; Locations</h1>
            <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>Configure delivery regions, zones and shipping methods</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {/* Shipping toggle */}
            <button onClick={() => setIsEnabled(v => !v)}
              className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold border"
              style={isEnabled
                ? { background: "rgba(22,199,132,.1)", borderColor: "rgba(22,199,132,.3)", color: "#16C784" }
                : { background: "#fff", borderColor: "#E5E7EB", color: "#6B7280" }}>
              {isEnabled
                ? <ToggleRight className="h-4 w-4" />
                : <ToggleLeft className="h-4 w-4" />}
              Shipping {isEnabled ? "On" : "Off"}
            </button>
            <button onClick={handleRefresh}
              className="h-9 w-9 rounded-xl flex items-center justify-center"
              style={{ background: "#fff", border: "1px solid #E5E7EB" }}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} style={{ color: "#6B7280" }} />
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {summaryStats.map(s => (
            <div key={s.label} className="rounded-2xl p-4"
              style={{ background: "#fff", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
              <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: "#6B7280" }}>{s.label}</p>
              <p className="text-3xl font-bold" style={{ color: s.color }}>{loading ? "—" : s.value}</p>
            </div>
          ))}
        </div>

        {/* Navigation Cards */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#9CA3AF" }}>Manage Sections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map(sec => (
              <Link key={sec.label} href={sec.href}
                className="flex items-center gap-4 rounded-2xl p-5 group transition-all no-underline"
                style={{ background: "#fff", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,.05)", textDecoration: "none" }}>
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                  style={{ background: sec.iconBg }}>
                  <sec.icon className="h-5 w-5" style={{ color: sec.iconColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm" style={{ color: "#111827" }}>{sec.label}</p>
                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold"
                      style={{ background: sec.iconBg, color: sec.iconColor }}>{loading ? "—" : sec.count}</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: "#6B7280" }}>{sec.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 opacity-40 group-hover:opacity-80 transition-opacity"
                  style={{ color: "#9CA3AF" }} />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
