import { Link } from "wouter";
import { Heart, ShoppingCart, Star, Clock, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCurrencyStore } from "@/store/currencyStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import type { Product } from "@/lib/api";

function RecentCard({ product }: { product: Product }) {
  const addToCart = useCartStore((s) => s.addToCart);
  const { items: wishlist, toggleWishlist } = useWishlistStore();
  const format = useCurrencyStore((s) => s.format);
  const wishlisted = wishlist.includes(product.id);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="flex-shrink-0 w-[148px] md:w-[180px] bg-card border border-border rounded-2xl overflow-hidden cursor-pointer group hover:shadow-lg hover:border-primary/30 transition-all duration-200"
      onClick={() => (window.location.href = `/product/${product.id}`)}
    >
      <div className="relative bg-muted aspect-square">
        {product.discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md z-10">
            -{product.discount}%
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
            toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist");
          }}
          className="absolute top-2 right-2 w-6 h-6 bg-white/80 dark:bg-black/50 rounded-full flex items-center justify-center z-10 shadow"
        >
          <Heart className={`w-3 h-3 ${wishlisted ? "fill-red-500 text-red-500" : "text-foreground/50"}`} />
        </button>
        {!imgError && product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-xs">No image</div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-xs font-semibold text-foreground leading-tight line-clamp-2 mb-1.5 min-h-[30px]">{product.name}</p>
        {product.rating > 0 && (
          <div className="flex items-center gap-0.5 mb-1.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-2.5 h-2.5 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20"}`} />
            ))}
            <span className="text-[9px] text-muted-foreground ml-0.5">({product.reviewCount})</span>
          </div>
        )}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-sm font-black text-foreground">{format(product.price)}</div>
            {product.oldPrice > product.price && (
              <span className="text-[10px] text-muted-foreground line-through">{format(product.oldPrice)}</span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart({ id: product.id, name: product.name, price: product.price, image: product.image, qty: 1 });
              toast.success("Added to cart");
            }}
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity active:scale-90"
            style={{ background: "#1FA89A" }}
          >
            <ShoppingCart className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RecentlyViewedSection() {
  const { items, clear } = useRecentlyViewedStore();

  if (items.length === 0) return null;

  return (
    <section className="py-4 md:py-6">
      <div className="px-3 md:px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <h2 className="text-base md:text-xl font-black text-foreground">Recently Viewed</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={clear}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Clear
            </button>
            <Link href="/shop">
              <span className="text-xs md:text-sm text-primary font-semibold cursor-pointer hover:underline flex items-center gap-0.5 whitespace-nowrap">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {items.map((product) => (
            <RecentCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
