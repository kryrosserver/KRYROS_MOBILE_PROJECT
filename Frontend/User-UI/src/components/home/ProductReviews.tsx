"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Star, Loader2 } from "lucide-react"
import { reviewsApi } from "@/lib/api"

interface ProductReviewsProps {
  section: any
}

export function ProductReviews({ section }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedReviews = async () => {
      try {
        const res = await reviewsApi.getAll({ isFeatured: true, take: 10 })
        if (res.data) {
          // Map backend reviews to UI format
          const formattedReviews = res.data.data.map(r => {
            const firstName = r.user?.firstName || "Guest";
            const lastName = r.user?.lastName ? `${r.user.lastName.charAt(0)}.` : "User";
            
            return {
              customerName: r.user ? `${firstName} ${lastName}` : "Guest User",
              customerImage: r.user?.avatar || r.imageUrl,
              role: r.isVerified ? "VERIFIED BUYER" : "GUEST REVIEWER",
              isVerified: r.isVerified,
              rating: r.rating,
              reviewText: r.comment,
              date: new Date(r.createdAt).toLocaleDateString(),
              purchasedProduct: r.product?.name,
              purchasedProductImage: r.product?.images?.[0]?.url || "/placeholder.jpg",
              purchasedProductLink: `/product/${r.product?.id}`
            };
          })
          setReviews(formattedReviews)
        }
      } catch (err) {
        console.error("Failed to fetch featured reviews:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedReviews()
  }, [])

  if (loading) {
    return (
      <div className="container-custom py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-200" />
      </div>
    )
  }

  if (reviews.length === 0) return null

  return (
    <div className="container-custom py-6 md:py-12 bg-white">
      <div className="flex items-center justify-between mb-6 md:mb-10">
        <div className="max-w-xl">
          <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight mb-2 text-slate-900 leading-none">
            {section.title || "Product Reviews"}
          </h2>
          {section.subtitle && (
            <p className="text-xs md:text-base text-slate-500 font-medium leading-relaxed">
              {section.subtitle}
            </p>
          )}
        </div>
        <Link 
          href="/reviews" 
          className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-colors flex items-center gap-2 group whitespace-nowrap"
        >
          All Reviews <ArrowRight className="h-3 w-3 md:h-4 md:w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0">
        {reviews.map((review: any, index: number) => (
          <div key={index} className="min-w-[240px] md:min-w-[280px] snap-start bg-white border border-slate-100 rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-lg transition-all duration-500">
            <div className="p-4 md:p-6 flex flex-col items-center text-center flex-1">
              {/* Reviewer Header */}
              <div className="flex flex-col items-center gap-2 mb-3">
                {review.customerImage ? (
                  <img
                    src={review.customerImage}
                    alt={review.customerName}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-slate-50"
                  />
                ) : (
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-50 flex items-center justify-center text-lg font-black text-slate-300">
                    {review.customerName?.charAt(0) || '?'}
                  </div>
                )}
                <div>
                  <h4 className="font-black text-sm md:text-base text-slate-900 mb-0.5">
                    {review.customerName}
                  </h4>
                  <span className={`inline-block text-[7px] md:text-[8px] font-black uppercase tracking-[0.1em] border rounded-full px-2 py-0.5 ${
                    review.isVerified 
                      ? "text-blue-600 border-blue-600/20 bg-blue-50/30" 
                      : "text-slate-500 border-slate-200 bg-slate-50/50"
                  }`}>
                    {review.role || "REVIEWER"}
                  </span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1.5 mb-3">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 md:w-4 md:h-4 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`}
                    />
                  ))}
                </div>
                <span className="text-[7px] md:text-[8px] font-black text-white bg-[#1FA89A] px-1.5 py-0.5 rounded-full leading-none">
                  {review.rating}/5
                </span>
              </div>

              {/* Review Text */}
              <p className="text-slate-500 text-[10px] md:text-xs font-medium leading-relaxed mb-3 line-clamp-4">
                {review.reviewText}
              </p>

              {/* Date */}
              <p className="mt-auto text-[7px] md:text-[8px] uppercase tracking-[0.15em] font-black text-slate-300">
                {review.date}
              </p>
            </div>

            {/* Product Tag */}
            <div className="border-t border-slate-50 p-3 md:p-4 bg-slate-50/30">
              <Link href={review.purchasedProductLink || '/shop'} className="flex items-center gap-2 group">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg p-1 flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-105 transition-transform">
                  <img
                    src={review.purchasedProductImage || '/placeholder.jpg'}
                    alt={review.purchasedProduct}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-black text-[9px] md:text-[10px] text-slate-900 uppercase tracking-tight leading-tight group-hover:text-primary transition-colors flex-1">
                  {review.purchasedProduct}
                </span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
