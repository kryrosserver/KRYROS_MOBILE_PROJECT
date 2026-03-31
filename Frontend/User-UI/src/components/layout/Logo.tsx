"use client"

import Link from "next/link"

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="relative">
        <div className="h-8 w-8 bg-primary rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-12 transition-transform duration-300">
          <span className="text-white font-black text-xl italic">K</span>
        </div>
        <div className="absolute -top-1 -right-1 h-3 w-3 bg-slate-900 rounded-full border-2 border-white" />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">
          Kryros
        </span>
        <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] leading-none mt-1">
          Mobile Tech
        </span>
      </div>
    </Link>
  )
}
