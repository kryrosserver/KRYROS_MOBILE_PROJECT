"use client";

import Link from "next/link";
import { 
  Building, 
  Bell, 
  CreditCard, 
  Shield, 
  Palette,
  Settings as SettingsIcon
} from "lucide-react";

export default function SettingsDashboardPage() {
  const sections = [
    {
      id: "company",
      label: "Company Profile",
      icon: Building,
      href: "/admin/settings/company",
      description: "Manage business identity, contact info, and branding."
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      href: "/admin/settings/notifications",
      description: "Control how you receive system alerts and email updates."
    },
    {
      id: "payment",
      label: "Payment Gateways",
      icon: CreditCard,
      href: "/admin/settings/payment",
      description: "Configure online payment providers and bank transfers."
    },
    {
      id: "security",
      label: "Security Center",
      icon: Shield,
      href: "/admin/settings/security",
      description: "Protect your admin account with 2FA and password rules."
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: Palette,
      href: "/admin/settings/appearance",
      description: "Customize colors, themes, and dashboard layouts."
    }
  ];

  return (
    <div className="space-y-8 pb-20">
      <div className="text-left">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-slate-400" />
          Settings Hub
        </h1>
        <p className="text-slate-500 font-medium">Manage global configuration and preferences</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Link
            key={section.id}
            href={section.href}
            className="group relative flex flex-col p-6 rounded-[2rem] border-2 border-slate-100 bg-white hover:border-slate-900/30 hover:shadow-xl transition-all duration-300 text-left overflow-hidden shadow-sm"
          >
            <div className="mb-4 p-4 rounded-2xl w-fit bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <section.icon className="h-6 w-6" />
            </div>
            
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-black uppercase tracking-tight text-lg text-slate-900 group-hover:text-slate-600 transition-colors">
                {section.label}
              </h3>
            </div>
            
            <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
              {section.description}
            </p>

            <div className="mt-auto flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity">
                Open Settings
              </span>
              <div className="h-2 w-2 rounded-full bg-slate-100 group-hover:bg-slate-900 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}