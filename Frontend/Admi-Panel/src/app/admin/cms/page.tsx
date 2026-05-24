"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Image as ImageIcon,
  Layout,
  Filter,
  Megaphone,
  Sparkles,
  ChevronRight
} from "lucide-react";

export default function CMSPage() {
  const [bannersCount, setBannersCount] = useState(0);
  const [sections, setSections] = useState<any[]>([]);
  const [footerConfig, setFooterConfig] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bannersRes, sectionsRes, footerRes] = await Promise.all([
          fetch("/internal/cms/banners/manage", { credentials: "same-origin" }),
          fetch("/internal/admin/cms/sections", { credentials: "same-origin" }),
          fetch("/api/admin/cms/footer/config", { credentials: "same-origin" }),
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
      } catch (err) {}
    };
    loadData();
  }, []);

  const tabs = [
    {
      id: "homepage",
      label: "Home Sections",
      icon: Layout,
      count: 0,
      href: "/admin/cms/homepage",
      iconBg: "rgba(18,214,197,0.12)",
      iconColor: "#12D6C5",
    },
    {
      id: "banners",
      label: "Banners",
      icon: ImageIcon,
      count: bannersCount,
      href: "/admin/cms/banners",
      iconBg: "rgba(59,130,246,0.12)",
      iconColor: "#3B82F6",
    },
    {
      id: "shop_filters",
      label: "Shop Fast Filters",
      icon: Filter,
      count: sections.filter((s: any) => s.type === "fast_filters" && s.isActive).length,
      href: "/admin/cms/shop-filters",
      iconBg: "rgba(245,158,11,0.12)",
      iconColor: "#F59E0B",
    },
    {
      id: "announcement",
      label: "Announcement Bar",
      icon: Megaphone,
      count: footerConfig?.announcementBarEnabled ? 1 : 0,
      href: "/admin/cms/announcement",
      iconBg: "rgba(239,68,68,0.12)",
      iconColor: "#EF4444",
    },
    {
      id: "newsletter",
      label: "Newsletter Popup",
      icon: Sparkles,
      count: footerConfig?.newsletterPopupEnabled ? 1 : 0,
      href: "/admin/cms/newsletter",
      iconBg: "rgba(139,92,246,0.12)",
      iconColor: "#8B5CF6",
    },
    {
      id: "footer",
      label: "Footer Links",
      icon: Layout,
      count: 0,
      href: "/admin/cms/footer",
      iconBg: "rgba(22,199,132,0.12)",
      iconColor: "#16C784",
    },
  ];

  return (
    <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)" }}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Content Management
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Select a section to manage your storefront layout
        </p>
      </div>

      {/* CMS Section Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className="group admin-card flex flex-col gap-4 transition-all duration-200"
            style={{ textDecoration: "none" }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = tab.iconColor;
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
                style={{ background: tab.iconBg }}
              >
                <tab.icon className="h-5 w-5" style={{ color: tab.iconColor }} />
              </div>
              {tab.count > 0 && (
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: tab.iconBg, color: tab.iconColor }}
                >
                  {tab.count} Items
                </span>
              )}
            </div>
            <div className="flex-1">
              <h3
                className="font-bold text-base"
                style={{ color: "var(--text-primary)" }}
              >
                {tab.label}
              </h3>
            </div>
            <div
              className="flex items-center text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: tab.iconColor }}
            >
              Open <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
