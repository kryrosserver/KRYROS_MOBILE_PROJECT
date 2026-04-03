"use client"

import React from "react"
import { Truck, ShieldCheck, Smartphone, ArrowRight } from "lucide-react"

interface TrustBadgesProps {
  section: any
}

const ICON_MAP: Record<string, any> = {
  Truck,
  ShieldCheck,
  Smartphone,
  ArrowRight
}

export function TrustBadges({ section }: TrustBadgesProps) {
  const items = section.config?.items || []

  return (
    <section className="py-4 md:py-10">
      <div className="container-custom">
        <div className="bg-white rounded-[1.5rem] md:rounded-[3rem] p-6 md:p-12 border border-slate-100 shadow-xl shadow-slate-100/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4">
            {items.map((item: any, idx: number) => {
              const Icon = ICON_MAP[item.icon] || ArrowRight
              return (
                <div key={idx} className="flex flex-row items-center gap-3 md:gap-4 text-left">
                  <div className="h-10 w-10 md:h-14 md:w-14 shrink-0 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center text-primary border border-slate-100">
                    <Icon className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-[9px] md:text-xs font-black uppercase tracking-widest text-slate-900 leading-tight">{item.title}</span>
                    <p className="hidden md:block text-[10px] text-slate-500 font-medium uppercase tracking-tight">{item.subtitle}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
