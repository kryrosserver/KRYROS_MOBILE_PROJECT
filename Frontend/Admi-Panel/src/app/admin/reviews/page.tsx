"use client";

import { useEffect, useState, useRef } from "react";
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
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf: number;
    function applyHeight(nextScale: number) { if (!innerRef.current || !outerRef.current) return; outerRef.current.style.height = "auto"; const naturalH = innerRef.current.scrollHeight; const visualH = naturalH * nextScale; const isMobile = window.innerWidth < 1024; const screenAvail = isMobile ? window.innerHeight - 64 : Infinity; outerRef.current.style.height = `${Math.max(visualH, screenAvail)}px`; }
    function recalc() { if (!innerRef.current || !outerRef.current) return; const vw = outerRef.current.offsetWidth || window.innerWidth; const baseW = vw < 960 ? 960 : 1380; const nextScale = Math.min(1, vw / baseW); innerRef.current.style.width = `${baseW}px`; innerRef.current.style.transform = `scale(${nextScale})`; innerRef.current.style.transformOrigin = "top left"; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(nextScale))); }
    recalc(); const t = setTimeout(recalc, 400); window.addEventListener("resize", recalc); return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);
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

  const stats = [
    { label: "Total Reviews", value: reviews.length, color: "var(--text-primary)" },
    { label: "Approved", value: reviews.filter(r => r.isApproved).length, color: "#16C784" },
    { label: "Featured", value: reviews.filter(r => r.isFeatured).length, color: "#12D6C5" },
  ];

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: "var(--bg-primary)", margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: "var(--bg-primary)", padding: "24px" }}>
    <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)" }}>
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Reviews Management
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Manage customer feedback and featured homepage reviews
          </p>
        </div>
        <div className="relative w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            placeholder="Search reviews, users, products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-input pl-10 w-full"
          />
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="admin-card !p-4">
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Reviews Grid */}
      {loading ? (
        <div className="admin-card flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin mb-4" style={{ color: "#12D6C5" }} />
          <p className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>Loading reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="admin-card flex flex-col items-center justify-center py-20">
          <MessageCircle className="h-14 w-14 mb-4" style={{ color: "var(--icon-bg)" }} />
          <p className="font-semibold text-sm" style={{ color: "var(--text-muted)" }}>No reviews found</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Customer reviews will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="admin-card flex flex-col gap-4 hover:shadow-lg transition-all duration-200"
              style={{ borderColor: "var(--card-border)" }}
            >
              {/* Product Header */}
              <div className="flex items-center gap-3 pb-4" style={{ borderBottom: "1px solid var(--card-border)" }}>
                <div
                  className="h-12 w-12 rounded-xl p-1 shrink-0 overflow-hidden"
                  style={{ background: "var(--hover-bg)", border: "1px solid var(--card-border)" }}
                >
                  <img
                    src={review.product?.images?.[0]?.url || "/placeholder.jpg"}
                    alt={review.product?.name}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "#12D6C5" }}>
                    Product Review
                  </p>
                  <h4 className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
                    {review.product?.name}
                  </h4>
                </div>
              </div>

              {/* Reviewer Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden shrink-0"
                    style={{ background: "var(--icon-bg)", color: "var(--text-secondary)" }}
                  >
                    {review.user?.avatar ? (
                      <img src={review.user.avatar} alt="User" className="h-full w-full object-cover" />
                    ) : (
                      review.user ? review.user.firstName?.charAt(0) : <User className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {review.user ? `${review.user.firstName} ${review.user.lastName}` : "Guest User"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < review.rating ? "fill-current" : ""}`}
                            style={{ color: i < review.rating ? "#F59E0B" : "var(--icon-bg)" }}
                          />
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
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Comment */}
              <p
                className="text-xs leading-relaxed rounded-xl p-3 italic"
                style={{ background: "var(--hover-bg)", color: "var(--text-secondary)" }}
              >
                "{review.comment}"
              </p>

              {/* Review Image */}
              {review.imageUrl && (
                <div
                  className="aspect-video rounded-xl overflow-hidden"
                  style={{ background: "var(--icon-bg)" }}
                >
                  <img src={review.imageUrl} alt="Review attachment" className="h-full w-full object-cover" />
                </div>
              )}

              {/* Admin Actions */}
              <div className="flex items-center gap-2 pt-2" style={{ borderTop: "1px solid var(--card-border)" }}>
                <button
                  disabled={updatingId === review.id}
                  onClick={() => handleToggleStatus(review.id, "isApproved", review.isApproved)}
                  className="flex-1 h-10 rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-all"
                  style={review.isApproved
                    ? { background: "rgba(18,214,197,0.12)", color: "#12D6C5", border: "1px solid rgba(18,214,197,0.3)" }
                    : { background: "var(--hover-bg)", color: "var(--text-muted)", border: "1px solid var(--card-border)" }
                  }
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  {review.isApproved ? "Approved" : "Approve"}
                </button>
                <button
                  disabled={updatingId === review.id}
                  onClick={() => handleToggleStatus(review.id, "isFeatured", review.isFeatured)}
                  className="flex-1 h-10 rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-all"
                  style={review.isFeatured
                    ? { background: "#12D6C5", color: "#fff", border: "1px solid #12D6C5" }
                    : { background: "var(--hover-bg)", color: "var(--text-muted)", border: "1px solid var(--card-border)" }
                  }
                >
                  <Home className="h-3.5 w-3.5" />
                  {review.isFeatured ? "Featured" : "Feature"}
                </button>
                <button
                  disabled={updatingId === review.id}
                  onClick={() => handleDelete(review.id)}
                  className="h-10 w-10 rounded-xl flex items-center justify-center transition-all shrink-0"
                  style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#EF4444"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#EF4444"; }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
      </div>
    </div>
  );
}
