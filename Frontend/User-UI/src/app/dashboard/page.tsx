"use client"

import { useAuth } from "@/providers/AuthProvider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { 
  ShoppingBag, 
  Clock, 
  Wallet, 
  User, 
  ChevronRight,
  Package,
  ArrowUpRight
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const stats = [
    { label: "Total Orders", value: "0", icon: <ShoppingBag className="h-5 w-5" />, color: "bg-blue-500" },
    { label: "Active Plans", value: "0", icon: <Clock className="h-5 w-5" />, color: "bg-orange-500" },
    { label: "Wallet Balance", value: "K0.00", icon: <Wallet className="h-5 w-5" />, color: "bg-green-500" },
  ]

  const quickLinks = [
    { label: "Order History", href: "/dashboard/orders", icon: <Package className="h-5 w-5" /> },
    { label: "Installment Plans", href: "/dashboard/installments", icon: <Clock className="h-5 w-5" /> },
    { label: "My Wallet", href: "/dashboard/wallet", icon: <Wallet className="h-5 w-5" /> },
    { label: "Profile Settings", href: "/dashboard/profile", icon: <User className="h-5 w-5" /> },
  ]

  return (
    <main className="min-h-screen bg-slate-50 py-12 md:py-20">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
                Welcome back, <span className="text-primary">{user?.firstName}</span>
              </h1>
              <p className="text-slate-500 font-medium mt-1">Manage your orders and credit plans from your dashboard.</p>
            </div>
            <Link href="/shop">
              <button className="h-12 px-6 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2">
                Continue Shopping <ArrowUpRight className="h-4 w-4" />
              </button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
                <div className={`h-12 w-12 rounded-2xl ${stat.color} text-white flex items-center justify-center shrink-0`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Quick Links */}
            <div className="lg:col-span-1 space-y-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 ml-1">Quick Actions</h2>
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                {quickLinks.map((link, i) => (
                  <Link 
                    key={i} 
                    href={link.href}
                    className={`flex items-center justify-between p-5 hover:bg-slate-50 transition-colors ${i !== quickLinks.length - 1 ? 'border-b border-slate-50' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-slate-400">{link.icon}</div>
                      <span className="font-bold text-slate-700">{link.label}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Orders Placeholder */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 ml-1">Recent Activity</h2>
              <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                  <ShoppingBag className="h-8 w-8 text-slate-200" />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">No recent activity</h3>
                <p className="text-slate-500 font-medium mt-2 max-w-xs">
                  Your recent orders and credit applications will appear here once you make your first purchase.
                </p>
                <Link href="/shop" className="mt-8 text-primary font-black uppercase tracking-widest text-xs hover:underline">
                  Browse our catalog
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
