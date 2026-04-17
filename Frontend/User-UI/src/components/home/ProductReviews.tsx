"use client"

import Link from "next/link"

interface ProductReviewsProps {
  section: any
}

export function ProductReviews({ section }: ProductReviewsProps) {
  const reviews = section.config?.reviews || []

  return (
    <div className="container-custom py-16 bg-white">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4 text-slate-900">
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="text-lg text-slate-600 max-w-2xl">
              {section.subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reviews.map((review: any, index: number) => (
          <div key={index} className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden">
            <div className="p-8">
              <div className="flex items-center mb-6">
                {review.customerImage ? (
                  <img
                    src={review.customerImage}
                    alt={review.customerName}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mr-4">
                    <span className="text-2xl font-black text-slate-600">
                      {review.customerName?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-black text-lg text-slate-900 mb-1">
                    {review.customerName}
                  </h4>
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-600 border border-blue-600 rounded-full px-3 py-1">
                    {review.role}
                  </span>
                </div>
              </div>

              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400 mr-3">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-6 h-6 ${i < review.rating ? 'fill-current' : 'text-slate-300'}`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-black text-green-600 bg-green-100 px-3 py-1 rounded-full">
                  {review.rating}/5
                </span>
              </div>

              <p className="text-slate-700 mb-6 leading-relaxed">
                {review.reviewText}
              </p>
              <p className="text-xs uppercase tracking-widest font-bold text-slate-500">
                {review.date}
              </p>
            </div>

            <div className="border-t border-slate-200 p-6 bg-white">
              <Link href={review.purchasedProductLink || '/shop'} className="flex items-center group">
                {review.purchasedProductImage && (
                  <img
                    src={review.purchasedProductImage}
                    alt={review.purchasedProduct}
                    className="w-20 h-20 object-contain mr-4 rounded-lg"
                  />
                )}
                <span className="font-bold text-slate-900 group-hover:text-kryros-green transition-colors">
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
