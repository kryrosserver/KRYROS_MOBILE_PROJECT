"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  Users, 
  Star, 
  Package,
  Store,
  ChevronRight
} from "lucide-react";

export default function WholesaleDashboardPage() {
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
      color: "bg-teal-50 text-[#12D6C5]",
      hoverBorder: "hover:border-[#12D6C5]/30",
    },
    {
      id: "deals",
      label: "Featured Deals",
      icon: Star,
      count: counts.deals,
      href: "/admin/wholesale/deals",
      description: "Customize the wholesale offers shown on the storefront.",
      color: "bg-amber-50 text-amber-500",
      hoverBorder: "hover:border-amber-400/30",
    },
    {
      id: "products",
      label: "Wholesale Inventory",
      icon: Package,
      count: counts.products,
      href: "/admin/wholesale/products",
      description: "Exclusive products only available to wholesale buyers.",
      color: "bg-blue-50 text-blue-600",
      hoverBorder: "hover:border-blue-400/30",
    }
  ];

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Store className="h-6 w-6 text-slate-400" />
          Wholesale Hub
        </h1>
        <p className="text-slate-500 text-sm mt-1">Manage your B2B operations and inventory</p>
      </div>

      {/* Summary stat strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Active Accounts", value: counts.accounts },
          { label: "Active Deals", value: counts.deals },
          { label: "Wholesale Products", value: counts.products },
        ].map((s, i) => (
          <div key={i} className="admin-card !p-4">
            <div className="text-2xl font-bold text-slate-900">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <Link
            key={section.id}
            href={section.href}
            className={`group admin-card flex flex-col gap-4 hover:shadow-lg ${section.hoverBorder} transition-all duration-200`}
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${section.color}`}>
                <section.icon className="h-5 w-5" />
              </div>
              <span className="badge badge-info text-xs">{section.count} Items</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-base group-hover:text-[#12D6C5] transition-colors">
                {section.label}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{section.description}</p>
            </div>
            <div className="flex items-center text-xs font-semibold text-[#12D6C5] opacity-0 group-hover:opacity-100 transition-opacity">
              Open Section <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
