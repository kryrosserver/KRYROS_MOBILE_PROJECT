"use client";

import { useEffect, useState, useRef } from "react";
import {
  Star, MessageCircle, CheckCircle, Home, Trash2, Loader2,
  Search, User, Bell, Calendar, Sun, Moon, Menu, ChevronDown,
  ChevronRight, Download, MoreHorizontal, ThumbsUp, Filter,
} from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

const ACCENT = "#12D6C5";
const MOBILE_BASE = 750;
const DESKTOP_BASE = 1380;

type Review = {
  id: string;
  rating: number;
  comment: string;
  imageUrl?: string;
  isVerified: boolean;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
  user: { firstName: string; lastName: string; avatar?: string };
  product: { name: string; images: { url: string }[] };
};

function MiniSparkline({ color = ACCENT, up = true }: { color?: string; up?: boolean }) {
  const data = up
    ? [{ v: 1 }, { v: 2 }, { v: 1.5 }, { v: 3 }, { v: 2.5 }, { v: 4 }, { v: 3.8 }]
    : [{ v: 4 }, { v: 3 }, { v: 3.5 }, { v: 2 }, { v: 2.5 }, { v: 1.5 }, { v: 1.2 }];
  return (
    <ResponsiveContainer width="100%" height={32}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sgr${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#sgr${color.replace("#", "")})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function ReviewsPage() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const { isDark, toggleTheme } = useTheme();

  const BG = "var(--bg-primary)";
  const CARD = "var(--card-bg)";
  const BORDER = "var(--card-border)";
  const TEXT = "var(--text-primary)";
  const TEXT2 = "var(--text-secondary)";
  const HOVER = "var(--hover-bg)";
  const HEADER_BG = "var(--bg-secondary)";
  const ICON_BG = "var(--icon-bg)";

  useEffect(() => {
    let raf: number;
    function applyHeight(s: number) { if (!innerRef.current || !outerRef.current) return; outerRef.current.style.height = "auto"; outerRef.current.style.height = `${innerRef.current.scrollHeight * s}px`; }
    function recalc() { if (!innerRef.current || !outerRef.current) return; const vw = outerRef.current.offsetWidth || window.innerWidth; const baseW = vw < 960 ? MOBILE_BASE : DESKTOP_BASE; const s = Math.min(1, vw / baseW); innerRef.current.style.width = `${baseW}px`; innerRef.current.style.transform = `scale(${s})`; innerRef.current.style.transformOrigin = "top left"; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(s))); }
    recalc(); const t = setTimeout(recalc, 400); window.addEventListener("resize", recalc); return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState("ALL");

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reviews");
      if (res.ok) { const data = await res.json(); setReviews(data.data); }
    } catch (err) {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleToggleStatus = async (id: string, field: "isApproved" | "isFeatured", currentVal: boolean) => {
    try {
      setUpdatingId(id);
      const res = await fetch(`/api/admin/reviews/${id}/status`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !currentVal }),
      });
      if (res.ok) setReviews(prev => prev.map(r => r.id === id ? { ...r, [field]: !currentVal } : r));
    } catch (err) {}
    finally { setUpdatingId(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      setUpdatingId(id);
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (res.ok) setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) {}
    finally { setUpdatingId(null); }
  };

  const filteredReviews = reviews.filter(r =>
    (ratingFilter === "ALL" || r.rating === parseInt(ratingFilter)) &&
    (r.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     r.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     r.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0.0";
  const card = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14 };

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: BG, margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: BG, color: TEXT, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* ── HEADER ── */}
        <header style={{ background: HEADER_BG, borderBottom: `1px solid ${BORDER}`, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}><Menu style={{ width: 20, height: 20 }} /></button>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: TEXT, whiteSpace: "nowrap", margin: 0 }}>Reviews Management</h1>
          </div>
          <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: TEXT2, width: 15, height: 15 }} />
            <input placeholder="Search reviews..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "8px 40px 8px 36px", color: TEXT, fontSize: 13, outline: "none" }} />
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: TEXT2, background: ICON_BG, padding: "2px 5px", borderRadius: 4 }}>⌘K</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ position: "relative", background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>
              <Bell style={{ width: 20, height: 20 }} />
              <span style={{ position: "absolute", top: 0, right: 0, background: "#EF4444", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>1</span>
            </button>
            <button onClick={toggleTheme} style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>{isDark ? <Sun style={{ width: 20, height: 20 }} /> : <Moon style={{ width: 20, height: 20 }} />}</button>
            <button style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "7px 14px", color: TEXT2, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
              <Calendar style={{ width: 14, height: 14 }} /> May 20 – May 26, 2025 <ChevronDown style={{ width: 13, height: 13 }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0B1320" }}>K</div>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: TEXT, lineHeight: 1 }}>Admin</div><div style={{ fontSize: 10, color: TEXT2, marginTop: 1 }}>Super Admin</div></div>
              <ChevronDown style={{ width: 14, height: 14, color: TEXT2 }} />
            </div>
          </div>
        </header>

        {/* ── BODY ── */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Page title + actions */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>Reviews Management</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: TEXT2 }}>
                <span>Home</span><ChevronRight style={{ width: 13, height: 13 }} /><span style={{ color: ACCENT }}>Reviews</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 18px", color: TEXT2, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                <Download style={{ width: 15, height: 15 }} /> Export <ChevronDown style={{ width: 13, height: 13 }} />
              </button>
              <button style={{ display: "flex", alignItems: "center", justifyContent: "center", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 12px", color: TEXT2, cursor: "pointer" }}>
                <MoreHorizontal style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { label: "Total Reviews", value: reviews.length, change: "+12.4%", up: true, color: ACCENT, icon: MessageCircle },
              { label: "Approved", value: reviews.filter(r => r.isApproved).length, change: "+8.1%", up: true, color: "#22C55E", icon: CheckCircle },
              { label: "Featured", value: reviews.filter(r => r.isFeatured).length, change: "+3.2%", up: true, color: "#F59E0B", icon: ThumbsUp },
              { label: "Avg Rating", value: avgRating, change: "+0.2", up: true, color: "#8B5CF6", icon: Star },
            ].map((s, i) => (
              <div key={i} style={{ ...card, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <s.icon style={{ width: 20, height: 20, color: s.color }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.up ? "#22C55E" : "#EF4444" }}>
                    {s.up ? "▲" : "▼"} {s.change}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: TEXT2, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: typeof s.value === "string" ? 22 : 26, fontWeight: 800, color: TEXT, lineHeight: 1, marginBottom: 6 }}>{s.value}</div>
                <div style={{ marginTop: 8 }}><MiniSparkline color={s.color} up={s.up} /></div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
              <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: TEXT2 }} />
              <input placeholder="Search reviews..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 12px 9px 30px", color: TEXT, fontSize: 13, outline: "none" }} />
            </div>
            <div style={{ position: "relative" }}>
              <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}
                style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 32px 9px 12px", color: TEXT2, fontSize: 13, outline: "none", appearance: "none", cursor: "pointer" }}>
                <option value="ALL">All Ratings</option>
                {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
              </select>
              <ChevronDown style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: TEXT2, pointerEvents: "none" }} />
            </div>
            <button onClick={fetchReviews} style={{ display: "flex", alignItems: "center", gap: 6, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 16px", color: TEXT2, fontSize: 13, cursor: "pointer" }}>
              <Filter style={{ width: 13, height: 13 }} /> Refresh
            </button>
          </div>

          {/* Reviews Grid */}
          {loading ? (
            <div style={{ ...card, padding: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <Loader2 style={{ width: 32, height: 32, color: ACCENT }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: TEXT2, margin: 0 }}>Loading reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div style={{ ...card, padding: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, textAlign: "center" }}>
              <MessageCircle style={{ width: 48, height: 48, opacity: 0.2, color: TEXT2 }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: TEXT2, margin: 0 }}>No reviews found</p>
              <p style={{ fontSize: 11, color: TEXT2, margin: 0 }}>Customer reviews will appear here.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {filteredReviews.map((review) => (
                <div key={review.id} style={{ ...card, padding: "18px", display: "flex", flexDirection: "column", gap: 14, transition: "box-shadow 0.15s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(0,0,0,0.15)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = ""; }}>

                  {/* Product Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 14, borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ width: 48, height: 48, borderRadius: 10, overflow: "hidden", background: HOVER, border: `1px solid ${BORDER}`, flexShrink: 0 }}>
                      <img src={review.product?.images?.[0]?.url || "/placeholder.jpg"} alt={review.product?.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 3 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Product Review</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{review.product?.name}</div>
                    </div>
                  </div>

                  {/* Reviewer */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: ICON_BG, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: TEXT2, overflow: "hidden", flexShrink: 0 }}>
                        {review.user?.avatar ? <img src={review.user.avatar} alt="User" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (review.user ? review.user.firstName?.charAt(0) : <User style={{ width: 16, height: 16 }} />)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>
                          {review.user ? `${review.user.firstName} ${review.user.lastName}` : "Guest User"}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} style={{ width: 11, height: 11, color: i < review.rating ? "#F59E0B" : BORDER, fill: i < review.rating ? "#F59E0B" : "none" }} />
                          ))}
                          {review.isVerified && (
                            <span style={{ fontSize: 9, fontWeight: 700, color: "#22C55E", background: "rgba(34,197,94,0.12)", padding: "2px 6px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 3 }}>
                              <CheckCircle style={{ width: 9, height: 9 }} /> Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: 10, color: TEXT2 }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Comment */}
                  <p style={{ fontSize: 12, lineHeight: 1.6, background: HOVER, borderRadius: 10, padding: "10px 12px", color: TEXT2, margin: 0, fontStyle: "italic" }}>
                    "{review.comment}"
                  </p>

                  {/* Review Image */}
                  {review.imageUrl && (
                    <div style={{ borderRadius: 10, overflow: "hidden", aspectRatio: "16/9" }}>
                      <img src={review.imageUrl} alt="Review" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
                    <button disabled={updatingId === review.id}
                      onClick={() => handleToggleStatus(review.id, "isApproved", review.isApproved)}
                      style={{ flex: 1, height: 36, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", border: "1px solid", transition: "all 0.15s",
                        background: review.isApproved ? "rgba(18,214,197,0.12)" : HOVER,
                        color: review.isApproved ? ACCENT : TEXT2,
                        borderColor: review.isApproved ? "rgba(18,214,197,0.3)" : BORDER,
                      }}>
                      <CheckCircle style={{ width: 12, height: 12 }} />
                      {review.isApproved ? "Approved" : "Approve"}
                    </button>
                    <button disabled={updatingId === review.id}
                      onClick={() => handleToggleStatus(review.id, "isFeatured", review.isFeatured)}
                      style={{ flex: 1, height: 36, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", border: "1px solid", transition: "all 0.15s",
                        background: review.isFeatured ? ACCENT : HOVER,
                        color: review.isFeatured ? "#fff" : TEXT2,
                        borderColor: review.isFeatured ? ACCENT : BORDER,
                      }}>
                      <Home style={{ width: 12, height: 12 }} />
                      {review.isFeatured ? "Featured" : "Feature"}
                    </button>
                    <button disabled={updatingId === review.id} onClick={() => handleDelete(review.id)}
                      style={{ width: 36, height: 36, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", flexShrink: 0 }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#EF4444"; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#EF4444"; }}>
                      <Trash2 style={{ width: 14, height: 14 }} />
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
