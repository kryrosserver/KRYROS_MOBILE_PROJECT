import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Heart, ShoppingCart, Star, ChevronRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { toast } from "sonner";
import { fetchProducts } from "@/lib/api";
import type { Product } from "@/lib/api";

interface ApiParams {
  take?: number;
  skip?: number;
  categoryId?: string;
  categorySlug?: string;
  featured?: boolean;
  isFlashSale?: boolean;
  popularity?: "trending" | "bestseller" | "new" | "hot" | "sale";
}

interface TabDef {
  label: string;
  params: ApiParams;
}

interface ProductSectionProps {
  title: string;
  viewAllHref?: string;
  tabs?: TabDef[];
  params?: ApiParams;
  limit?: number;
  scroll?: boolean;
}

function HCard({ product }: { product: Product }) {
  const addToCart = useCartStore((s) => s.addToCart);
  const { items: wishlist, toggleWishlist } = useWishlistStore();
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
            <div className="text-sm font-black text-foreground">${product.price.toLocaleString()}</div>
            {product.oldPrice > product.price && (
              <span className="text-[10px] text-muted-foreground line-through">${product.oldPrice.toLocaleString()}</span>
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

export default function ProductSection({
  title,
  viewAllHref = "/shop",
  tabs,
  params = {},
  limit = 8,
  scroll = true,
}: ProductSectionProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);

  const activeParams = tabs ? tabs[activeTab].params : params;

  useEffect(() => {
    fetchProducts({ ...activeParams, take: limit }).then(setProducts);
  }, [activeTab, JSON.stringify(activeParams), limit]);

  if (products.length === 0) return null;

  return (
    <section className="py-4 md:py-6">
      <div className="px-3 md:px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base md:text-xl font-black text-foreground">{title}</h2>
            {tabs && (
              <div className="flex gap-1">
                {tabs.map((tab, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] md:text-xs font-semibold transition-all ${
                      activeTab === i ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link href={viewAllHref}>
            <span className="text-xs md:text-sm text-primary font-semibold cursor-pointer hover:underline flex items-center gap-0.5 whitespace-nowrap">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>

        {scroll ? (
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {products.map((p) => (
              <HCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {products.map((p) => (
              <HCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
