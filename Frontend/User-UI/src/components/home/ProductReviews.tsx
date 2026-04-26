"use client"

import Link from "next/link"
import { ArrowRight, Star } from "lucide-react"

interface ProductReviewsProps {
  section: any
}

export function ProductReviews({ section }: ProductReviewsProps) {
  const reviews = section.config?.reviews || [
    {
      customerName: "John Doe",
      role: "REVIEWER",
      rating: 5,
      reviewText: "Electronic products are developing a little more every day to make our lives easier. They adapt to the developing digital world.",
      date: "3 YEARS AGO",
      purchasedProduct: "13-inch MacBook Air",
      purchasedProductImage: "/mock/laptop.png",
      purchasedProductLink: "/product/macbook-air"
    },
    {
      customerName: "John Doe",
      role: "REVIEWER",
      rating: 5,
      reviewText: "Electronic products are developing a little more every day to make our lives easier. They adapt to the developing digital world.",
      date: "3 YEARS AGO",
      purchasedProduct: "65\" Customisable Frame",
      purchasedProductImage: "/mock/tv.png",
      purchasedProductLink: "/product/frame-tv"
    }
  ]

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

      <div className="flex overflow-x-auto gap-4 pb-6 scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {reviews.map((review: any, index: number) => (
          <div key={index} className="min-w-[260px] md:min-w-0 bg-white border border-slate-100 rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-lg transition-all duration-500">
            <div className="p-6 md:p-8 flex flex-col items-center text-center flex-1">
              {/* Reviewer Header */}
              <div className="flex flex-col items-center gap-3 mb-4">
                {review.customerImage ? (
                  <img
                    src={review.customerImage}
                    alt={review.customerName}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-slate-50"
                  />
                ) : (
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-50 flex items-center justify-center text-2xl font-black text-slate-300">
                    {review.customerName?.charAt(0) || '?'}
                  </div>
                )}
                <div>
                  <h4 className="font-black text-lg md:text-xl text-slate-900 mb-1">
                    {review.customerName}
                  </h4>
                  <span className="inline-block text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 border border-blue-600/20 rounded-full px-3 py-1 bg-blue-50/30">
                    {review.role || "REVIEWER"}
                  </span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 md:w-5 md:h-5 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`}
                    />
                  ))}
                </div>
                <span className="text-[9px] md:text-[10px] font-black text-white bg-[#1FA89A] px-2 py-1 rounded-full leading-none">
                  {review.rating}/5
                </span>
              </div>

              {/* Review Text */}
              <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed mb-4 line-clamp-3">
                {review.reviewText}
              </p>

              {/* Date */}
              <p className="mt-auto text-[8px] md:text-[9px] uppercase tracking-[0.2em] font-black text-slate-300">
                {review.date}
              </p>
            </div>

            {/* Product Tag */}
            <div className="border-t border-slate-50 p-4 md:p-6 bg-slate-50/30">
              <Link href={review.purchasedProductLink || '/shop'} className="flex items-center gap-3 group">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-105 transition-transform">
                  <img
                    src={review.purchasedProductImage || '/placeholder.jpg'}
                    alt={review.purchasedProduct}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-black text-[10px] md:text-xs text-slate-900 uppercase tracking-tight leading-tight group-hover:text-primary transition-colors flex-1">
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
