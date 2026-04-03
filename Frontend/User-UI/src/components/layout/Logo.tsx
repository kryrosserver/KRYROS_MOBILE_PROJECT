"use client"

import { cn } from "@/lib/utils"

import Image from "next/image"

interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 32, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2 group", className)}>
      <div className="relative shrink-0">
        <Image 
          src="/logo.png" 
          alt="Kryros Logo" 
          width={size} 
          height={size} 
          className="object-contain"
        />
      </div>
      <div className="flex flex-col">
        <span 
          className="font-black text-[#2A3A4A] uppercase tracking-tighter leading-none"
          style={{ fontSize: size * 0.625 }}
        >
          Kryros
        </span>
        <span 
          className="font-black text-[#1FA89A] uppercase tracking-[0.2em] leading-none mt-1"
          style={{ fontSize: size * 0.25 }}
        >
          Mobile Tech
        </span>
      </div>
    </div>
  )
}
