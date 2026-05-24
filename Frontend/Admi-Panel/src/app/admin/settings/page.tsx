"use client";

import Link from "next/link";
import { 
  Building, 
  Bell, 
  CreditCard, 
  Shield, 
  Palette,
  Settings as SettingsIcon,
  ChevronRight
} from "lucide-react";

export default function SettingsDashboardPage() {
  const sections = [
    {
      id: "company",
      label: "Company Profile",
      icon: Building,
      href: "/admin/settings/company",
      description: "Manage business identity, contact info, and branding.",
      color: "bg-teal-50 text-[#12D6C5]",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      href: "/admin/settings/notifications",
      description: "Control how you receive system alerts and email updates.",
      color: "bg-amber-50 text-amber-500",
    },
    {
      id: "payment",
      label: "Payment Gateways",
      icon: CreditCard,
      href: "/admin/settings/payment",
      description: "Configure online payment providers and bank transfers.",
      color: "bg-green-50 text-green-600",
    },
    {
      id: "security",
      label: "Security Center",
      icon: Shield,
      href: "/admin/settings/security",
      description: "Protect your admin account with 2FA and password rules.",
      color: "bg-red-50 text-red-500",
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: Palette,
      href: "/admin/settings/appearance",
      description: "Customize colors, themes, and dashboard layouts.",
      color: "bg-purple-50 text-purple-600",
    }
  ];

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <SettingsIcon className="h-6 w-6 text-slate-400" />
          Settings Hub
        </h1>
        <p className="text-slate-500 text-sm mt-1">Manage global configuration and platform preferences</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <Link
            key={section.id}
            href={section.href}
            className="group admin-card flex flex-col gap-4 hover:shadow-lg hover:border-slate-300 transition-all duration-200"
          >
            <div className={`p-3 rounded-xl w-fit ${section.color}`}>
              <section.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-base group-hover:text-[#12D6C5] transition-colors">
                {section.label}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{section.description}</p>
            </div>
            <div className="flex items-center text-xs font-semibold text-[#12D6C5] opacity-0 group-hover:opacity-100 transition-opacity">
              Configure <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
