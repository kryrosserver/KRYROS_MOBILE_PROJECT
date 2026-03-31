"use client"

import { useAuth } from "@/providers/AuthProvider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Package, ChevronRight, ShoppingBag } from "lucide-react"
import Link from "next/link"

export default function OrdersPage() {
  const { isAuthenticated, isLoading } = useAuth()
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

  return (
    <main className="min-h-screen bg-slate-50 py-12 md:py-20">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
              <ChevronRight className="h-5 w-5 rotate-180 text-slate-400" />
            </Link>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Order History</h1>
          </div>

          <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="h-20 w-20 rounded-3xl bg-blue-50 flex items-center justify-center mb-6">
              <Package className="h-8 w-8 text-blue-500" />
            </div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">No orders yet</h2>
            <p className="text-slate-500 font-medium mt-2 max-w-sm">
              You haven't placed any orders yet. Once you make a purchase, you'll be able to track its status here.
            </p>
            <Link href="/shop" className="mt-10">
              <button className="h-12 px-8 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" /> Start Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
