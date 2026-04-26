"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  Image as ImageIcon, 
  Layout, 
  Filter, 
  Megaphone, 
  Sparkles, 
  MessageSquare 
} from "lucide-react";

export default function CMSPage() {
  const [bannersCount, setBannersCount] = useState(0);
  const [sections, setSections] = useState<any[]>([]);
  const [footerConfig, setFooterConfig] = useState<any>(null);

  useEffect(() => {
    // Load counts for dashboard
    const loadData = async () => {
      try {
        const [bannersRes, sectionsRes, footerRes] = await Promise.all([
          fetch("/internal/cms/banners/manage", { credentials: "same-origin" }),
          fetch("/internal/admin/cms/sections", { credentials: "same-origin" }),
          fetch("/api/admin/cms/footer/config", { credentials: "same-origin" })
        ]);

        if (bannersRes.ok) {
          const data = await bannersRes.json();
          setBannersCount(Array.isArray(data) ? data.length : data?.data?.length || 0);
        }
        if (sectionsRes.ok) {
          const data = await sectionsRes.json();
          setSections(Array.isArray(data) ? data : data?.data || []);
        }
        if (footerRes.ok) {
          const data = await footerRes.json();
          setFooterConfig(data);
        }
      } catch (err) {
        console.error("Failed to load dashboard counts:", err);
      }
    };
    loadData();
  }, []);

  const tabs = [
    { id: "homepage", label: "Home Sections", icon: Layout, count: 0, href: "/admin/cms/homepage" },
    { id: "shop_filters", label: "Shop Fast Filters", icon: Filter, count: sections.filter((s:any) => s.type === "fast_filters" && s.isActive).length, href: "/admin/cms/shop-filters" },
    { id: "announcement", label: "Announcement Bar", icon: Megaphone, count: footerConfig?.announcementBarEnabled ? 1 : 0, href: "/admin/cms/announcement" },
    { id: "newsletter", label: "Newsletter Popup", icon: Sparkles, count: footerConfig?.newsletterPopupEnabled ? 1 : 0, href: "/admin/cms/newsletter" },
    { id: "testimonials", label: "Testimonials", icon: MessageSquare, count: sections.filter((s:any) => s.type === "testimonials" && s.isActive).length, href: "/admin/cms/testimonials" },
    { id: "footer", label: "Footer Links", icon: Layout, count: 0, href: "/admin/cms/footer" },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Content Management</h1>
        <p className="text-slate-500 font-medium">Select a section to manage your storefront layout</p>
      </div>

      {/* Modern Dashboard Grid - Reduced size */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className="group relative flex flex-col p-4 rounded-[1.5rem] border-2 border-slate-100 bg-white hover:border-[#1FA89A]/30 hover:shadow-lg transition-all duration-300 text-left overflow-hidden shadow-sm"
          >
            <div className="mb-3 p-3 rounded-xl w-fit bg-slate-50 text-slate-400 group-hover:bg-[#1FA89A] group-hover:text-white transition-colors">
              <tab.icon className="h-5 w-5" />
            </div>
            
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-black uppercase tracking-tight text-[10px] text-slate-600 group-hover:text-slate-900 line-clamp-1">
                {tab.label}
              </h3>
            </div>
            
            <div className="flex items-center justify-between mt-auto">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                {tab.count} Items
              </span>
              <div className="h-1.5 w-1.5 rounded-full bg-slate-100 group-hover:bg-[#1FA89A] transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}