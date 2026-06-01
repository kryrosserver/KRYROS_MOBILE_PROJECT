import { useState } from "react";
import { Heart, ShoppingCart, Zap, Package } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCurrencyStore } from "@/store/currencyStore";
import type { Product } from "@/lib/api";

interface UnifiedProductCardProps {
  product: Product;
  /** Outer div class — "w-full" for grid, "w-[calc(50vw-16px)]" for scroll */
  className?: string;
  /** Optional extra badge text e.g. "🔥 Trending" */
  badge?: string;
}

/** Strip specs that are empty JSON artifacts like "[]" or blank strings */
function validSpecs(specs: string | undefined | null): string {
  if (!specs) return "";
  const t = specs.trim();
  if (t === "" || t === "[]" || t === "{}" || t === "null") return "";
  return t;
}

export default function UnifiedProductCard({
  product,
  className = "w-full",
  badge,
}: UnifiedProductCardProps) {
  const [imgErr, setImgErr] = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const format = useCurrencyStore((s) => s.format);
  const wishlisted = isWishlisted(product.id);

  const monthlyText = product.creditMessage || `${format(product.price / 12)}/mo`;
  const specs = validSpecs(product.specs);

  return (
    <div
      className={`${className} bg-card border border-border rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow flex flex-col`}
      onClick={() => (window.location.href = `/product/${product.id}`)}
    >
      {/* ── Image ── */}
      <div className="relative bg-[#f5f5f5] dark:bg-muted aspect-[4/3] overflow-hidden">
        {!imgErr && product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            No image
          </div>
        )}

        {product.discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg z-10">
            -{product.discount}%
          </span>
        )}
        {product.isWholesaleOnly && (
          <span className="absolute top-2 left-2 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-lg z-10">
            Wholesale
          </span>
        )}
        {badge && (
          <span className="absolute bottom-2 left-2 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-lg z-10">
            {badge}
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
            toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist", { description: product.name });
          }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center z-10 shadow-sm"
        >
          <Heart className={`w-3.5 h-3.5 transition-colors ${wishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
        </button>
      </div>

      {/* ── Info: flex-col flex-1 so buttons always pin to bottom ── */}
      <div className="p-2.5 flex flex-col flex-1">

        {/* Name — NO min-h, just natural height */}
        <h3 className="text-xs font-semibold text-foreground leading-snug line-clamp-2 mb-0.5">
          {product.name}
        </h3>

        {/* Specs — only rendered if real data exists (filters out "[]" etc.) */}
        {specs && (
          <p className="text-[10px] text-muted-foreground truncate mb-1">{specs}</p>
        )}

        {/* Price + old price */}
        <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0 mb-1">
          <span className="text-sm font-bold text-foreground">{format(product.price)}</span>
          {product.oldPrice > product.price && (
            <span className="text-[10px] text-muted-foreground line-through">{format(product.oldPrice)}</span>
          )}
        </div>

        {/* Rating + Stock — stars IN FRONT of badge, only if rating exists */}
        <div className="flex items-center gap-1 mb-1.5">
          {product.rating > 0 && !product.isWholesaleOnly && (
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-2 h-2 flex-shrink-0 ${
                    star <= Math.round(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-300 text-gray-300"
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-[9px] text-muted-foreground ml-0.5">({product.reviewCount})</span>
            </div>
          )}

          {!product.isWholesaleOnly && (
            product.stock > 0 ? (
              <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                In Stock
              </span>
            ) : (
              <span className="text-[10px] font-medium text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                Out of Stock
              </span>
            )
          )}
          {product.allowCredit && (
            <span className="text-[10px] text-primary font-bold whitespace-nowrap truncate">
              {monthlyText}
            </span>
          )}
          {product.isWholesaleOnly && (
            <>
              {product.wholesalePrice && (
                <span className="text-[10px] text-blue-600 font-semibold whitespace-nowrap">
                  W: {format(product.wholesalePrice)}
                </span>
              )}
              <span className="text-[9px] text-muted-foreground flex items-center gap-0.5 whitespace-nowrap">
                <Package className="w-2.5 h-2.5" />
                Min {product.wholesaleMoq || 1}pc
              </span>
            </>
          )}
        </div>

        {/* Buttons — mt-auto pins to bottom, handles height differences cleanly */}
        <div className="flex items-center gap-1.5 mt-auto pt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart({ id: product.id, name: product.name, price: product.price, qty: 1, image: product.image });
              toast.success("Added to cart", { description: product.name });
            }}
            className="w-8 h-7 flex items-center justify-center border border-teal-600 rounded-lg flex-shrink-0 hover:bg-teal-50 transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-teal-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/product/${product.id}`;
            }}
            className="flex-1 h-7 bg-teal-600 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-teal-700 transition-colors"
          >
            <Zap className="w-3 h-3" />
            {product.allowCredit ? "Get Now" : "Buy Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
