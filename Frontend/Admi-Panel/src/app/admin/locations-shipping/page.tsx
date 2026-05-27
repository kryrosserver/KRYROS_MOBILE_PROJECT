"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import {
  Globe,
  Map as MapIcon,
  Building2,
  Truck,
  Settings2,
  MapPin,
  ChevronRight,
  Search,
  Bell,
  Calendar,
  Sun,
  Moon,
  Menu,
  ChevronDown
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
      iconBg: "rgba(18,214,197,0.12)", iconColor: "#6366F1",
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
    <div style={{ background: "#F8F9FA", minHeight: "100vh", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Shipping & Locations</h2>
          <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>Manage shipping settings and delivery locations</p>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "8px 16px" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Shipping Enabled</span>
          <input type="checkbox" checked={isEnabled} onChange={e => setIsEnabled(e.target.checked)} />
        </label>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4" style={{ marginBottom: 20 }}>
        {[
          { label: "Countries", value: counts.countries, color: "#6366F1", icon: "MapPin" },
          { label: "States", value: counts.states, color: "#22C55E", icon: "Map" },
          { label: "Cities", value: counts.cities, color: "#F59E0B", icon: "Building" },
          { label: "Zones", value: counts.zones, color: "#8B5CF6", icon: "Layers" },
          { label: "Methods", value: counts.methods, color: "#EC4899", icon: "Truck" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 40, textAlign: "center" }}>
        <p style={{ color: "#9CA3AF", fontSize: 13 }}>Shipping location management coming soon.</p>
      </div>
    </div>
  );
}
