import Link from 'next/link';

interface Review {
  customerName: string;
  customerImage: string;
  role: string;
  rating: number;
  reviewText: string;
  date: string;
  purchasedProduct: string;
  purchasedProductImage: string;
  purchasedProductLink: string;
}

interface ProductReviewsProps {
  title: string;
  subtitle: string;
  config: {
    reviews: Review[];
  };
}

export default function ProductReviews({ title, subtitle, config }: ProductReviewsProps) {
  return (
    <section className="w-full py-10 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600">{subtitle}</p>
          </div>
          <Link href="/reviews" className="flex items-center text-gray-800 hover:text-blue-600">
            <span>All Reviews</span>
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {config.reviews.map((review, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  {review.customerImage ? (
                    <img
                      src={review.customerImage}
                      alt={review.customerName}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                      <span className="text-gray-600 font-bold">{review.customerName.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-lg">{review.customerName}</h4>
                    <span className="text-sm text-blue-600 border border-blue-600 rounded-full px-2 py-0.5">
                      {review.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-green-600 font-bold bg-green-100 px-2 py-1 rounded">
                    {review.rating}/5
                  </span>
                </div>

                <p className="text-gray-700 mb-4">{review.reviewText}</p>
                <p className="text-gray-500 text-sm">{review.date}</p>
              </div>

              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <Link href={review.purchasedProductLink} className="flex items-center">
                  {review.purchasedProductImage && (
                    <img
                      src={review.purchasedProductImage}
                      alt={review.purchasedProduct}
                      className="w-16 h-16 object-contain mr-3"
                    />
                  )}
                  <span className="font-medium text-gray-900">{review.purchasedProduct}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
