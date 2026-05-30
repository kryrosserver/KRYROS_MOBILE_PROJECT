import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Zap, Heart, ShoppingCart, Star, ChevronRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCurrencyStore } from "@/store/currencyStore";
import { toast } from "sonner";
import { fetchFlashSaleProducts } from "@/lib/api";
import type { Product } from "@/lib/api";

function useCountdown(initialSeconds: number) {
  const [total, setTotal] = useState(initialSeconds);
  useEffect(() => {
    const t = setInterval(() => setTotal((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const hours = Math.floor((total % 86400) / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return { hours, mins, secs };
}

function FlashCard({ product }: { product: Product }) {
  const addToCart = useCartStore((s) => s.addToCart);
  const { items: wishlist, toggleWishlist } = useWishlistStore();
  const format = useCurrencyStore((s) => s.format);
  const wishlisted = wishlist.includes(product.id);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="flex-shrink-0 w-[140px] md:w-[160px] bg-card border border-border rounded-2xl overflow-hidden cursor-pointer group hover:shadow-md hover:border-primary/30 transition-all duration-200"
      onClick={() => (window.location.href = `/product/${product.id}`)}
    >
      <div className="relative bg-muted h-[100px]">
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
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-xs">No image</div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-xs font-semibold text-foreground leading-tight line-clamp-2 mb-1.5 min-h-[30px]">{product.name}</p>
        <div className="flex items-center gap-0.5 mb-1.5">
          <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
          <span className="text-[10px] text-muted-foreground ml-0.5">{product.rating > 0 ? product.rating : "–"}</span>
        </div>
        <div className="flex items-end justify-between gap-1">
          <div>
            <div className="text-sm font-black text-primary">{format(product.price)}</div>
            {product.oldPrice > product.price && (
              <span className="text-[10px] text-muted-foreground line-through">{format(product.oldPrice)}</span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart({ id: product.id, name: product.name, price: product.price, image: product.image, qty: 1 });
              toast.success("Added to cart", { description: product.name });
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

export default function FlashSaleSection() {
  const { hours, mins, secs } = useCountdown(8 * 3600 + 45 * 60 + 32);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchFlashSaleProducts().then((data) => setProducts(data.slice(0, 8)));
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <h2 className="text-base md:text-xl font-black text-foreground">Flash Sale</h2>
        </div>
        <Link href="/shop">
          <span className="flex items-center gap-0.5 text-xs md:text-sm text-primary font-semibold cursor-pointer hover:underline">
            View All Deals <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        <div className="flex-shrink-0 w-[140px] md:w-[155px] bg-card border border-border rounded-2xl flex flex-col items-center justify-center p-4 gap-2">
          <p className="text-[10px] text-muted-foreground font-medium">Ends In</p>
          <div className="flex items-center gap-1">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-primary tabular-nums leading-none">
                {String(hours).padStart(2, "0")}
              </span>
              <span className="text-[8px] text-muted-foreground mt-0.5 uppercase tracking-wide">HRS</span>
            </div>
            <span className="text-xl font-black text-primary mb-3">:</span>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-primary tabular-nums leading-none">
                {String(mins).padStart(2, "0")}
              </span>
              <span className="text-[8px] text-muted-foreground mt-0.5 uppercase tracking-wide">MINS</span>
            </div>
            <span className="text-xl font-black text-primary mb-3">:</span>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-primary tabular-nums leading-none">
                {String(secs).padStart(2, "0")}
              </span>
              <span className="text-[8px] text-muted-foreground mt-0.5 uppercase tracking-wide">SECS</span>
            </div>
          </div>
        </div>

        {products.map((p) => (
          <FlashCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
