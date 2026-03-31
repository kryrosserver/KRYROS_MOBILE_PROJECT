"use client"

import { useAuth } from "@/providers/AuthProvider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Wallet, Plus, ArrowUpRight, History, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function WalletPage() {
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
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">My Wallet</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Balance Card */}
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest bg-primary px-3 py-1 rounded-full">Active</div>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Available Balance</p>
                  <p className="text-5xl font-black">K0.00</p>
                </div>
                <div className="flex gap-4">
                  <button className="flex-1 h-12 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all">
                    <Plus className="h-4 w-4" /> Top Up
                  </button>
                  <button className="flex-1 h-12 bg-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 hover:bg-white/20 transition-all">
                    Withdraw
                  </button>
                </div>
              </div>
              <div className="absolute -bottom-20 -right-20 h-64 w-64 bg-primary/20 rounded-full blur-3xl" />
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 flex flex-col justify-center space-y-8 shadow-sm">
              <div className="flex items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-500">
                  <ArrowUpRight className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Spent</p>
                  <p className="text-xl font-black text-slate-900">K0.00</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                  <History className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Transaction</p>
                  <p className="text-xl font-black text-slate-900">No activity</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 ml-1">Transaction History</h2>
            <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                <History className="h-8 w-8 text-slate-200" />
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">No transactions</h3>
              <p className="text-slate-500 font-medium mt-2 max-w-sm">
                Your wallet transactions, top-ups, and order payments will appear here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
