"use client"

import Link from "next/link"
import { useAuth } from "@/providers/AuthProvider"
import { Button } from "@/components/ui/button"
import { User, LogOut, LayoutDashboard } from "lucide-react"

export function AuthButtons() {
  const { user, logout, isAuthenticated } = useAuth()

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-primary transition-colors">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User className="h-4 w-4" />
          </div>
          <span className="hidden md:inline">{user.firstName}</span>
        </Link>
        <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/login">
        <Button variant="ghost" size="sm" className="font-bold uppercase tracking-widest text-[11px]">
          Login
        </Button>
      </Link>
      <Link href="/register">
        <Button size="sm" className="font-bold uppercase tracking-widest text-[11px]">
          Register
        </Button>
      </Link>
    </div>
  )
}
