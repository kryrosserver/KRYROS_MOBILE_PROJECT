"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, Facebook, Instagram, Twitter } from "lucide-react"
import { useCurrency } from "@/providers/CurrencyProvider"

export function TopBar() {
  const { countries, selectedCountry, setCountry } = useCurrency();
  const [selectedLang, setSelectedLang] = useState({ name: "English", code: "en" });

  return (
    <div className="hidden lg:block bg-[#f8fafc] border-b border-slate-200/60 py-1.5 md:py-2">
      <div className="container-custom flex items-center justify-between gap-4">
        {/* Left Side: Navigation Links */}
        <div className="flex items-center gap-4 md:gap-8 overflow-x-auto scrollbar-hide no-scrollbar flex-1 min-w-0 py-0.5 text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] text-slate-600">
          {/* Languages */}
          <div className="relative group cursor-pointer flex items-center gap-1.5 hover:text-primary transition-all shrink-0 bg-white px-2.5 py-1 rounded-full border border-slate-200/50 shadow-sm">
            <span className="whitespace-nowrap flex items-center gap-1.5">
              <span className="text-slate-400 font-bold">EN</span>
              {selectedLang.name}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-primary transition-colors" />
            <div className="absolute top-[calc(100%+6px)] left-0 w-36 bg-white shadow-2xl border border-slate-100 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[150] p-1.5 overflow-hidden">
              {["English", "French"].map(l => (
                <div 
                  key={l} 
                  onClick={() => setSelectedLang({ name: l, code: l === "English" ? "en" : "fr" })}
                  className="px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors text-[10px] font-black text-slate-500 hover:text-primary uppercase tracking-wider"
                >
                  {l}
                </div>
              ))}
            </div>
          </div>

          {/* Country/Currency */}
          <div className="relative group cursor-pointer flex items-center gap-1.5 hover:text-primary transition-all shrink-0 bg-white px-2.5 py-1 rounded-full border border-slate-200/50 shadow-sm">
            <span className="whitespace-nowrap flex items-center gap-1.5 uppercase font-bold text-slate-700">
              <span className="text-slate-400">{selectedCountry?.flag}</span>
              ({selectedCountry?.currencyCode})
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-primary transition-colors" />
            <div className="absolute top-[calc(100%+6px)] left-0 w-40 bg-white shadow-2xl border border-slate-100 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[150] p-1.5 overflow-hidden">
              <div className="max-h-60 overflow-y-auto custom-scrollbar">
                {countries.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => setCountry(c.code)}
                    className="px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-between text-[10px] font-black text-slate-500 hover:text-primary uppercase tracking-wider"
                  >
                    <span className="flex items-center gap-2">{c.flag} ({c.currencyCode})</span>
                    {selectedCountry?.code === c.code && <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(249,115,22,0.4)]" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Help Dropdown */}
          <div className="relative group cursor-pointer flex items-center gap-1.5 hover:text-primary transition-all shrink-0 bg-white px-2.5 py-1 rounded-full border border-slate-200/50 shadow-sm uppercase tracking-wider">
            <span>Quick Help</span>
            <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-primary transition-colors" />
            
            {/* Dropdown Container - White with shadow to match reference image */}
            <div className="absolute top-[calc(100%+6px)] right-0 md:left-0 w-48 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-slate-100 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[150] p-2 overflow-hidden">
              {[
                { name: "Order Tracking", href: "/orders/track" },
                { name: "Contact", href: "/support" },
                { name: "FAQ", href: "/support#faq" },
                { name: "Find Us", href: "/support#find-us" },
              ].map(item => (
                <Link 
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-3 hover:bg-slate-50 rounded-lg transition-all text-[11px] font-bold text-slate-700 hover:text-primary uppercase tracking-widest border-b border-slate-50 last:border-0"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Social Icons */}
        <div className="hidden sm:flex items-center gap-3 text-slate-400 shrink-0">
          <a href="#" className="hover:text-primary transition-all transform hover:scale-110"><Facebook className="h-3.5 w-3.5" /></a>
          <a href="#" className="hover:text-primary transition-all transform hover:scale-110"><Instagram className="h-3.5 w-3.5" /></a>
          <a href="#" className="hover:text-primary transition-all transform hover:scale-110"><Twitter className="h-3.5 w-3.5" /></a>
        </div>
      </div>
    </div>
  )
}
