"use client"

import { useState } from "react"
import { Search, X, ArrowRight, TrendingUp, History } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

interface MobileSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSearchModal({ isOpen, onClose }: MobileSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`)
      onClose()
    }
  }

  const popularSearches = ["iPhone 15", "Samsung S24", "MacBook Air", "AirPods Pro"]
  const recentSearches = ["Wireless Charger", "Case for iPhone"]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] bg-white flex flex-col"
        >
          {/* Header */}
          <div className="p-4 flex items-center gap-4 border-b border-slate-50">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search products..."
                className="w-full h-12 pl-12 pr-4 bg-slate-50 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <button 
              onClick={onClose}
              className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-10">
            {/* Recent Searches */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <History className="h-3 w-3" /> Recent Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((s) => (
                  <button 
                    key={s}
                    onClick={() => { setSearchQuery(s); router.push(`/shop?search=${s}`); onClose(); }}
                    className="px-4 py-2 bg-slate-50 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Searches */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <TrendingUp className="h-3 w-3" /> Popular Searches
              </h3>
              <div className="space-y-2">
                {popularSearches.map((s) => (
                  <button 
                    key={s}
                    onClick={() => { setSearchQuery(s); router.push(`/shop?search=${s}`); onClose(); }}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <span className="text-sm font-bold text-slate-900">{s}</span>
                    <ArrowRight className="h-4 w-4 text-slate-300" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
