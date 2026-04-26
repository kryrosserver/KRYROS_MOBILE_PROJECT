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
    <section className="py-6 md:py-10 bg-slate-50/50">
      <div className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {items.map((item: any, idx: number) => {
            const Icon = ICON_MAP[item.icon] || ArrowRight
            return (
              <div 
                key={idx}
                className="flex flex-col items-center text-center p-4 md:p-6 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md"
              >
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary mb-3">
                  <Icon className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <h3 className="font-black text-[11px] md:text-sm text-slate-900 uppercase tracking-tight mb-1">
                  {item.title}
                </h3>
                <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {item.subtitle}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
