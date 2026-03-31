"use client"

import { cn } from "@/lib/utils"

interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 32, className }: LogoProps) {
  // Scaling factors based on the original 32px size (h-8 w-8)
  const iconSize = size
  const fontSize = size * 0.625 // 20px for 32px size
  const dotSize = size * 0.125 // 4px for 32px size
  const secondaryFontSize = size * 0.25 // 8px for 32px size

  return (
    <div className={cn("flex items-center gap-2 group", className)}>
      <div className="relative shrink-0">
        <div 
          style={{ width: iconSize, height: iconSize }}
          className="bg-primary rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-12 transition-transform duration-300 shadow-sm"
        >
          <span 
            style={{ fontSize: fontSize }}
            className="text-white font-black italic select-none"
          >
            K
          </span>
        </div>
        <div 
          style={{ width: dotSize, height: dotSize }}
          className="absolute -top-0.5 -right-0.5 bg-slate-900 rounded-full border-2 border-white shadow-sm" 
        />
      </div>
      <div className="flex flex-col">
        <span 
          style={{ fontSize: fontSize }}
          className="font-black text-slate-900 uppercase tracking-tighter leading-none"
        >
          Kryros
        </span>
        <span 
          style={{ fontSize: secondaryFontSize }}
          className="font-black text-primary uppercase tracking-[0.2em] leading-none mt-1"
        >
          Mobile Tech
        </span>
      </div>
    </div>
  )
}
