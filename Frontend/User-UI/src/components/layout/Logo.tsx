"use client"

import { cn } from "@/lib/utils"

import Image from "next/image"

interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 32, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5 group", className)}>
      <div className="relative shrink-0 flex items-center justify-center">
        <Image 
          src="/logo.png" 
          alt="Kryros Logo" 
          width={size} 
          height={size} 
          className="object-contain"
        />
      </div>
      <div className="flex items-center h-full">
        <span 
          className="font-black text-[#2A3A4A] uppercase tracking-tighter leading-none"
          style={{ fontSize: size * 0.65 }}
        >
          KRYROS
        </span>
      </div>
    </div>
  )
}
