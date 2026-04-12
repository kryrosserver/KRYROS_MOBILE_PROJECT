"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  Users, 
  Star, 
  Package,
  Store
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
      } catch (err) {
        console.error("Error loading wholesale counts:", err);
      }
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
      description: "Manage applications and approved wholesale partners."
    },
    {
      id: "deals",
      label: "Featured Deals",
      icon: Star,
      count: counts.deals,
      href: "/admin/wholesale/deals",
      description: "Customize the wholesale offers shown on the storefront."
    },
    {
      id: "products",
      label: "Wholesale Inventory",
      icon: Package,
      count: counts.products,
      href: "/admin/wholesale/products",
      description: "Exclusive products only available to wholesale buyers."
    }
  ];

  return (
    <div className="space-y-8 pb-20">
      <div className="text-left">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
          <Store className="h-8 w-8 text-blue-600" />
          Wholesale Hub
        </h1>
        <p className="text-slate-500 font-medium">Manage your B2B operations and inventory</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Link
            key={section.id}
            href={section.href}
            className="group relative flex flex-col p-6 rounded-[2rem] border-2 border-slate-100 bg-white hover:border-blue-500/30 hover:shadow-xl transition-all duration-300 text-left overflow-hidden shadow-sm"
          >
            <div className="mb-4 p-4 rounded-2xl w-fit bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <section.icon className="h-6 w-6" />
            </div>
            
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-black uppercase tracking-tight text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                {section.label}
              </h3>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                {section.count} Items
              </span>
            </div>
            
            <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
              {section.description}
            </p>

            <div className="mt-auto flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Open Section
              </span>
              <div className="h-2 w-2 rounded-full bg-slate-100 group-hover:bg-blue-600 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}