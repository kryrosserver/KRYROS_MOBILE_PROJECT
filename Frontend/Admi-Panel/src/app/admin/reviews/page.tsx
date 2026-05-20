"use client"

import { useEffect, useState } from "react"
import { API_BASE } from "@/lib/config"
import { Star, MessageCircle, CheckCircle, Home, Trash2, Loader2, Search, ExternalLink, User, Package } from "lucide-react"

type Review = {
  id: string
  rating: number
  comment: string
  imageUrl?: string
  isVerified: boolean
  isApproved: boolean
  isFeatured: boolean
    createdAt: string
    user: {
      firstName: string
      lastName: string
      avatar?: string
    }
    product: {
    name: string
    images: { url: string }[]
  }
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/reviews`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data.data)
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleToggleStatus = async (id: string, field: "isApproved" | "isFeatured", currentVal: boolean) => {
    try {
      setUpdatingId(id)
      const res = await fetch(`${API_BASE}/reviews/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !currentVal })
      })
      if (res.ok) {
        setReviews(prev => prev.map(r => r.id === id ? { ...r, [field]: !currentVal } : r))
      }
    } catch (err) {
      console.error("Update failed:", err)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return
    try {
      setUpdatingId(id)
      const res = await fetch(`${API_BASE}/reviews/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== id))
      }
    } catch (err) {
      console.error("Delete failed:", err)
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredReviews = reviews.filter(r => 
    r.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">Reviews Management</h1>
          <p className="text-slate-500 font-medium mt-1">Manage customer feedback and featured homepage reviews.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search reviews, users, products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Reviews...</p>
        </div>
      ) : filteredReviews.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:border-blue-500/20 transition-all duration-500">
              {/* Product Info Header */}
              <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center gap-4">
                <div className="h-14 w-14 bg-white rounded-2xl border border-slate-200 p-1 shrink-0 overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                  <img src={review.product?.images?.[0]?.url || "/placeholder.jpg"} alt={review.product?.name} className="h-full w-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-0.5">Product Review</p>
                  <h4 className="text-sm font-black text-slate-900 line-clamp-1">{review.product?.name}</h4>
                </div>
              </div>

              {/* Review Content */}
              <div className="p-6 flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-sm border-2 border-white shadow-sm overflow-hidden">
                      {review.user?.avatar ? (
                        <img src={review.user.avatar} alt="User" className="h-full w-full object-cover" />
                      ) : (
                        review.user ? review.user.firstName?.charAt(0) : <User className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {review.user ? `${review.user.firstName} ${review.user.lastName}` : 'Guest User'}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-2.5 w-2.5 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} />
                          ))}
                        </div>
                        {review.isVerified && (
                          <span className="flex items-center gap-0.5 text-[8px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-1.5 py-0.5 rounded-full">
                            <CheckCircle className="h-2 w-2" /> Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="relative">
                  <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl italic">
                    "{review.comment}"
                  </p>
                </div>

                {review.imageUrl && (
                  <div className="relative group/img aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img src={review.imageUrl} alt="Review attachment" className="h-full w-full object-cover group-hover/img:scale-110 transition-transform duration-700" />
                  </div>
                )}
              </div>

              {/* Admin Actions */}
              <div className="p-6 pt-0 flex items-center gap-2">
                <button
                  disabled={updatingId === review.id}
                  onClick={() => handleToggleStatus(review.id, "isApproved", review.isApproved)}
                  className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                    review.isApproved 
                    ? "bg-green-50 text-green-600 border border-green-200 hover:bg-green-100" 
                    : "bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  <CheckCircle className={`h-4 w-4 ${review.isApproved ? "animate-pulse" : ""}`} />
                  {review.isApproved ? "Approved" : "Approve"}
                </button>

                <button
                  disabled={updatingId === review.id}
                  onClick={() => handleToggleStatus(review.id, "isFeatured", review.isFeatured)}
                  className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                    review.isFeatured 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                    : "bg-white text-slate-400 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Home className="h-4 w-4" />
                  {review.isFeatured ? "Featured" : "Feature"}
                </button>

                <button
                  disabled={updatingId === review.id}
                  onClick={() => handleDelete(review.id)}
                  className="h-12 w-12 rounded-xl border border-red-100 bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-95"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
          <MessageCircle className="h-16 w-16 text-slate-100 mb-4" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No reviews found</p>
          <p className="text-slate-300 text-xs font-bold mt-1">Reviews from customers will appear here.</p>
        </div>
      )}
    </div>
  )
}
