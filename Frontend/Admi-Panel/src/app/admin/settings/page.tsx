"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Building,
  Bell,
  CreditCard,
  Shield,
  Palette,
  Settings as SettingsIcon,
  ChevronRight,
  Search,
  Calendar,
  Sun,
  Moon,
  Menu,
  ChevronDown
} from "lucide-react";

export default function SettingsDashboardPage() {
  useEffect(() => {}, []);
  const sections = [
    {
      id: "company",
      label: "Company Profile",
      icon: Building,
      href: "/admin/settings/company",
      description: "Manage business identity, contact info, and branding.",
      iconBg: "rgba(18,214,197,0.12)",
      iconColor: "#6366F1",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      href: "/admin/settings/notifications",
      description: "Control how you receive system alerts and email updates.",
      iconBg: "rgba(245,158,11,0.12)",
      iconColor: "#F59E0B",
    },
    {
      id: "payment",
      label: "Payment Gateways",
      icon: CreditCard,
      href: "/admin/settings/payment",
      description: "Configure online payment providers and bank transfers.",
      iconBg: "rgba(22,199,132,0.12)",
      iconColor: "#16C784",
    },
    {
      id: "security",
      label: "Security Center",
      icon: Shield,
      href: "/admin/settings/security",
      description: "Protect your admin account with 2FA and password rules.",
      iconBg: "rgba(239,68,68,0.12)",
      iconColor: "#EF4444",
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: Palette,
      href: "/admin/settings/appearance",
      description: "Customize colors, themes, and dashboard layouts.",
      iconBg: "rgba(139,92,246,0.12)",
      iconColor: "#8B5CF6",
    },
  ];

  return (
    <div style={{ background: "#F5F6FA", minHeight: "100%", padding: "24px" }}>
        <div className="space-y-6 pb-20" style={{ color: "#111827", padding: "20px" }}>
          <div>
            <h2 className="text-2xl font-bold flex whitespace-nowrap items-center gap-3" style={{ color: "#111827" }}>
              <SettingsIcon className="h-6 w-6" style={{ color: "var(--text-muted)" }} />
              Settings Hub
            </h2>
            <p className="text-sm mt-1" style={{ color: "#4B5563" }}>Manage global configuration and platform preferences</p>
          </div>

      {/* Settings Cards Grid */}
      <div className="grid grid-cols-3 gap-4">
        {sections.map((section) => (
          <Link
            key={section.id}
            href={section.href}
            className="group admin-card flex flex-col gap-4 transition-all duration-200"
            style={{ textDecoration: "none" }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.borderColor = "#6366F1";
              el.style.boxShadow = "0 8px 32px rgba(18,214,197,0.12)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.borderColor = "#E5E7EB";
              el.style.boxShadow = "";
            }}
          >
            <div
              className="p-3 rounded-xl w-fit"
              style={{ background: section.iconBg }}
            >
              <section.icon className="h-5 w-5" style={{ color: section.iconColor }} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base transition-colors" style={{ color: "#111827" }}>
                {section.label}
              </h3>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: "#4B5563" }}>
                {section.description}
              </p>
            </div>
            <div
              className="flex items-center text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: "#6366F1" }}
            >
              Configure <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
      </div>
  );
}