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

  return (
    <div
      className={`${className} bg-card border border-border rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow`}
      onClick={() => (window.location.href = `/product/${product.id}`)}
    >
      {/* ── Image ───────────────────────────────────────────── */}
      <div className="relative bg-[#f5f5f5] dark:bg-muted aspect-square overflow-hidden">
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

        {/* Discount badge */}
        {product.discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg z-10">
            -{product.discount}%
          </span>
        )}

        {/* Wholesale badge */}
        {product.isWholesaleOnly && (
          <span className="absolute top-2 left-2 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-lg z-10">
            Wholesale
          </span>
        )}

        {/* Section badge */}
        {badge && (
          <span className="absolute bottom-2 left-2 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-lg z-10">
            {badge}
          </span>
        )}

        {/* Wishlist */}
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

      {/* ── Info ────────────────────────────────────────────── */}
      <div className="p-2.5">

        {/* Name */}
        <h3 className="text-xs font-semibold text-foreground leading-snug line-clamp-2 mb-0.5">
          {product.name}
        </h3>

        {/* Specs */}
        {product.specs && (
          <p className="text-[10px] text-muted-foreground truncate mb-1">{product.specs}</p>
        )}

        {/* Price + old price on same row */}
        <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0 mb-1">
          <span className="text-sm font-bold text-foreground">{format(product.price)}</span>
          {product.oldPrice > product.price && (
            <span className="text-[10px] text-muted-foreground line-through">{format(product.oldPrice)}</span>
          )}
        </div>

        {/* ── Stock badge + extra info on SAME ROW ────────────
            Normal products: [In Stock / Out of Stock] [from X/mo if credit]
            Wholesale:       [Wholesale: price]  [Min X units]
        ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2">

          {/* Stock status for normal + credit products */}
          {!product.isWholesaleOnly && (
            product.stock > 0 ? (
              <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                In Stock
              </span>
            ) : (
              <span className="text-[10px] font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                Out of Stock
              </span>
            )
          )}

          {/* Credit monthly price — INLINE with stock badge */}
          {product.allowCredit && (
            <span className="text-[10px] text-primary font-bold whitespace-nowrap">
              {monthlyText}
            </span>
          )}

          {/* Wholesale price + min order — all on same row */}
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

        {/* ── Buttons ─────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5">
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
