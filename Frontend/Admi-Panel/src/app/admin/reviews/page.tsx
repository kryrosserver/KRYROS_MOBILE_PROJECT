"use client";

import { useEffect, useState } from "react";
import { Star, MessageCircle, CheckCircle, Home, Trash2, Loader2, Search, User } from "lucide-react";

type Review = {
  id: string;
  rating: number;
  comment: string;
  imageUrl?: string;
  isVerified: boolean;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  product: {
    name: string;
    images: { url: string }[];
  };
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data.data);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleToggleStatus = async (id: string, field: "isApproved" | "isFeatured", currentVal: boolean) => {
    try {
      setUpdatingId(id);
      const res = await fetch(`/api/admin/reviews/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !currentVal }),
      });
      if (res.ok) {
        setReviews(prev => prev.map(r => r.id === id ? { ...r, [field]: !currentVal } : r));
      }
    } catch (err) {
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      setUpdatingId(id);
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== id));
      }
    } catch (err) {
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredReviews = reviews.filter(r =>
    r.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reviews Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage customer feedback and featured homepage reviews.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search reviews, users, products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-input pl-10"
          />
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Reviews", value: reviews.length },
          { label: "Approved", value: reviews.filter(r => r.isApproved).length },
          { label: "Featured", value: reviews.filter(r => r.isFeatured).length },
        ].map((s, i) => (
          <div key={i} className="admin-card !p-4">
            <div className="text-2xl font-bold text-slate-900">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Reviews Grid */}
      {loading ? (
        <div className="admin-card flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#12D6C5] mb-4" />
          <p className="text-slate-400 text-sm font-semibold">Loading reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="admin-card flex flex-col items-center justify-center py-20">
          <MessageCircle className="h-14 w-14 text-slate-100 mb-4" />
          <p className="text-slate-400 font-semibold text-sm">No reviews found</p>
          <p className="text-slate-300 text-xs mt-1">Customer reviews will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="admin-card flex flex-col gap-4 hover:shadow-lg hover:border-[#12D6C5]/30 transition-all duration-200"
            >
              {/* Product Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="h-12 w-12 bg-slate-50 rounded-xl border border-slate-100 p-1 shrink-0 overflow-hidden">
                  <img
                    src={review.product?.images?.[0]?.url || "/placeholder.jpg"}
                    alt={review.product?.name}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#12D6C5] mb-0.5">Product Review</p>
                  <h4 className="text-sm font-bold text-slate-900 truncate">{review.product?.name}</h4>
                </div>
              </div>

              {/* Reviewer Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm overflow-hidden shrink-0">
                    {review.user?.avatar ? (
                      <img src={review.user.avatar} alt="User" className="h-full w-full object-cover" />
                    ) : (
                      review.user ? review.user.firstName?.charAt(0) : <User className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {review.user ? `${review.user.firstName} ${review.user.lastName}` : "Guest User"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-current" : "text-slate-200"}`} />
                        ))}
                      </div>
                      {review.isVerified && (
                        <span className="badge badge-success text-[9px]">
                          <CheckCircle className="h-2.5 w-2.5 mr-0.5" /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Comment */}
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3 italic">
                "{review.comment}"
              </p>

              {/* Review Image */}
              {review.imageUrl && (
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-100">
                  <img src={review.imageUrl} alt="Review attachment" className="h-full w-full object-cover" />
                </div>
              )}

              {/* Admin Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  disabled={updatingId === review.id}
                  onClick={() => handleToggleStatus(review.id, "isApproved", review.isApproved)}
                  className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-all border ${
                    review.isApproved
                      ? "bg-teal-50 text-[#12D6C5] border-teal-200"
                      : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  {review.isApproved ? "Approved" : "Approve"}
                </button>
                <button
                  disabled={updatingId === review.id}
                  onClick={() => handleToggleStatus(review.id, "isFeatured", review.isFeatured)}
                  className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-all border ${
                    review.isFeatured
                      ? "bg-[#12D6C5] text-white border-[#12D6C5] shadow-md"
                      : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Home className="h-3.5 w-3.5" />
                  {review.isFeatured ? "Featured" : "Feature"}
                </button>
                <button
                  disabled={updatingId === review.id}
                  onClick={() => handleDelete(review.id)}
                  className="h-10 w-10 rounded-xl border border-red-100 bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
