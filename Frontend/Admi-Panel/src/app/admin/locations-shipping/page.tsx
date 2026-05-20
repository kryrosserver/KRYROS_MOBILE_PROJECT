"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  Globe, 
  Map as MapIcon, 
  Building2, 
  Truck, 
  Settings2,
  MapPin
} from "lucide-react";

export default function ShippingDashboardPage() {
  const [counts, setCounts] = useState({
    countries: 0,
    states: 0,
    cities: 0,
    zones: 0,
    methods: 0
  });
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [cRes, sRes, ctRes, zRes, stRes] = await Promise.all([
          fetch("/api/admin/countries"),
          fetch("/api/admin/states"),
          fetch("/api/admin/cities"),
          fetch("/api/admin/shipping-zones"),
          fetch("/api/admin/shipping-zones/status")
        ]);

        if (cRes.ok) {
          const data = await cRes.json();
          setCounts(prev => ({ ...prev, countries: data.length }));
        }
        if (sRes.ok) {
          const data = await sRes.json();
          setCounts(prev => ({ ...prev, states: data.length }));
        }
        if (ctRes.ok) {
          const data = await ctRes.json();
          setCounts(prev => ({ ...prev, cities: data.length }));
        }
        if (zRes.ok) {
          const data = await zRes.json();
          setCounts(prev => ({ ...prev, zones: data.length }));
        }
        if (stRes.ok) {
          const data = await stRes.json();
          setIsEnabled(data);
        }
      } catch (err) {
        console.error("Error loading shipping counts:", err);
      }
    };
    loadCounts();
  }, []);

  const sections = [
    {
      id: "countries",
      label: "Countries",
      icon: Globe,
      count: counts.countries,
      href: "/admin/locations-shipping/countries",
      description: "Manage supported nations and their currencies."
    },
    {
      id: "states",
      label: "States / Provinces",
      icon: MapIcon,
      count: counts.states,
      href: "/admin/locations-shipping/states",
      description: "Define administrative regions for specific countries."
    },
    {
      id: "cities",
      label: "Cities",
      icon: Building2,
      count: counts.cities,
      href: "/admin/locations-shipping/cities",
      description: "Specific city-level data for precise shipping."
    },
    {
      id: "zones",
      label: "Shipping Zones",
      icon: Truck,
      count: counts.zones,
      href: "/admin/locations-shipping/zones",
      description: "Group locations into zones with custom rates."
    },
    {
      id: "global",
      label: "Global Methods",
      icon: Settings2,
      count: 0,
      href: "/admin/locations-shipping/global",
      description: "Default shipping rules for the entire storefront."
    }
  ];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
            <MapPin className="h-8 w-8 text-green-600" />
            Locations & Shipping
          </h1>
          <p className="text-slate-500 font-medium">Configure where you ship and how much it costs</p>
        </div>
        
        <div className={`px-4 py-2 rounded-2xl border-2 flex items-center gap-3 ${isEnabled ? "bg-green-50 border-green-100 text-green-700" : "bg-slate-50 border-slate-100 text-slate-400"}`}>
          <div className={`h-2.5 w-2.5 rounded-full ${isEnabled ? "bg-green-500 animate-pulse" : "bg-slate-300"}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">
            System: {isEnabled ? "Location Based" : "Global Only"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Link
            key={section.id}
            href={section.href}
            className="group relative flex flex-col p-6 rounded-[2rem] border-2 border-slate-100 bg-white hover:border-green-500/30 hover:shadow-xl transition-all duration-300 text-left overflow-hidden shadow-sm"
          >
            <div className="mb-4 p-4 rounded-2xl w-fit bg-slate-50 text-slate-400 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <section.icon className="h-6 w-6" />
            </div>
            
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-black uppercase tracking-tight text-lg text-slate-900 group-hover:text-green-600 transition-colors">
                {section.label}
              </h3>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                {section.count} Items
              </span>
            </div>
            
            <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
              {section.description}
            </p>

            <div className="mt-auto flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Configure Section
              </span>
              <div className="h-2 w-2 rounded-full bg-slate-100 group-hover:bg-green-600 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}