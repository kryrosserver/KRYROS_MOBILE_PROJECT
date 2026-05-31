import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { Heart, ShoppingCart, Star, Truck, Share2, Minus, Plus, ChevronRight, Box, MapPin, Shield, CreditCard, Smartphone, Building2, MessageCircle, BarChart2, Zap } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCurrencyStore } from "@/store/currencyStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { fetchProductById, fetchProducts, API_BASE } from "@/lib/api";
import type { Product } from "@/lib/api";
import UnifiedProductCard from "@/components/UnifiedProductCard";

interface CreditPlan {
  id: string;
  duration: number;
  interestRate: number;
  minimumAmount: number;
  isActive: boolean;
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [creditPlans, setCreditPlans] = useState<CreditPlan[]>([]);

  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const addToCart = useCartStore((s) => s.addToCart);
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const format = useCurrencyStore((s) => s.format);
  const addToRecentlyViewed = useRecentlyViewedStore((s) => s.addProduct);

  useEffect(() => {
    fetch(`${API_BASE}/api/credit/plans`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        const active: CreditPlan[] = Array.isArray(data) ? data.filter((p: CreditPlan) => p.isActive) : [];
        setCreditPlans(active);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchProductById(id).then((p) => {
      setProduct(p);
      setLoading(false);
      if (p) {
        addToRecentlyViewed(p);
        fetchProducts({ take: 8 }).then((all) => {
          setRelated(all.filter((r) => r.id !== p.id).slice(0, 4));
        });
      }
    });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto bg-background min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-lg mx-auto bg-background min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-foreground font-semibold">Product not found</p>
        <Link href="/shop"><button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold">Browse Shop</button></Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const thumbImages = product.images.length > 0 ? product.images : [product.image, product.image, product.image, product.image].filter(Boolean);

  const defaultPlan = creditPlans[0];
  const planDuration = defaultPlan?.duration ?? 12;
  const planInterestRate = defaultPlan?.interestRate ?? 0;
  const totalWithInterest = product.price * (1 + planInterestRate / 100);
  const monthly = Math.round(totalWithInterest / planDuration);
  const upfront = Math.round(product.price * 0.10);
  const totalPayable = Math.round(totalWithInterest);

  const handleAddToCart = () => {
    addToCart({ id: product.id, name: product.name, price: product.price, qty, image: product.image });
    toast.success("Added to cart!", { description: `${qty}× ${product.name}` });
  };

  const handleBuyNow = () => {
    addToCart({ id: product.id, name: product.name, price: product.price, qty, image: product.image });
    navigate("/checkout");
  };

  return (
    <div className="max-w-lg mx-auto bg-background min-h-screen pb-28">

      {/* Hero image */}
      <div className="relative mx-3 mt-3 rounded-3xl overflow-hidden bg-[#EFEFEF] dark:bg-muted" style={{ aspectRatio: "1/1" }}>
        {thumbImages[activeImg] ? (
          <img src={thumbImages[activeImg]} alt={product.name} className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No image</div>
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.discount > 0 && (
            <span className="bg-red-500 text-white text-[11px] font-black px-2.5 py-1 rounded-xl">-{product.discount}%</span>
          )}
          {product.isBestSeller && (
            <span className="bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-xl">Best Seller</span>
          )}
        </div>
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button className="w-9 h-9 bg-white dark:bg-card rounded-full shadow-md flex items-center justify-center">
            <Share2 className="w-4 h-4 text-foreground" />
          </button>
          <button className="w-9 h-9 bg-white dark:bg-card rounded-full shadow-md flex items-center justify-center">
            <Box className="w-4 h-4 text-foreground" />
          </button>
        </div>
        {thumbImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {thumbImages.map((_, i) => (
              <div key={i} onClick={() => setActiveImg(i)} className={`rounded-full cursor-pointer transition-all ${i === activeImg ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`} />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {thumbImages.length > 1 && (
        <div className="flex items-center gap-2 px-3 mt-3">
          {thumbImages.slice(0, 4).map((img, i) => (
            <button key={i} onClick={() => setActiveImg(i)} className={`w-14 h-14 rounded-2xl overflow-hidden border-2 bg-[#F5F5F5] dark:bg-muted flex-shrink-0 transition-all ${i === activeImg ? "border-primary" : "border-transparent"}`}>
              <img src={img} alt="" className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      )}

      <div className="px-4 mt-4 space-y-4">
        {/* Title + stock */}
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-black text-foreground leading-snug flex-1">{product.name}</h1>
          <span className={`flex-shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-xl ${product.stock > 0 ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        {/* Spec bar */}
        {(product.brand || product.category || product.specs) && (
          <p className="text-xs text-muted-foreground -mt-2">
            {[product.brand, product.specs].filter(Boolean).join(" · ")}
          </p>
        )}

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center justify-between flex-wrap gap-1">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "fill-yellow-200 text-yellow-200"}`} />
                ))}
              </div>
              <span className="text-xs font-bold text-foreground">{product.rating}</span>
              {product.reviewCount > 0 && (
                <span className="text-xs text-muted-foreground">({product.reviewCount.toLocaleString()} reviews)</span>
              )}
            </div>
          </div>
        )}

        {/* Price */}
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-3xl font-black text-foreground">
              {format(product.price)}
            </span>
            {product.oldPrice > product.price && (
              <span className="text-base text-muted-foreground line-through">
                {format(product.oldPrice)}
              </span>
            )}
            {product.discount > 0 && (
              <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">Save {product.discount}%</span>
            )}
          </div>
        </div>

        {/* Quantity + Wishlist + Compare */}
        <div className="flex items-center gap-4 py-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">Quantity</span>
            <div className="flex items-center border border-border rounded-xl overflow-hidden">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors">
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-8 text-center text-sm font-semibold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
          <button onClick={() => { toggleWishlist(product.id); toast.success(wishlisted ? "Removed" : "Saved to wishlist!"); }}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">
            <Heart className={`w-4 h-4 ${wishlisted ? "fill-red-500 text-red-500" : ""}`} /> Wishlist
          </button>
          <button className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">
            <BarChart2 className="w-4 h-4" /> Compare
          </button>
        </div>

        {/* Delivery row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Truck, title: "Free Delivery", sub: "On orders above minimum", subColor: "text-primary" },
            { icon: MapPin, title: "Pickup Available", sub: "at KRYROS Stations", subColor: "text-muted-foreground" },
            { icon: Shield, title: "Delivery Protection", sub: "Cover against loss or damage", subColor: "text-muted-foreground", arrow: true },
          ].map(({ icon: Icon, title, sub, subColor, arrow }) => (
            <div key={title} className="border border-border rounded-xl p-2.5 cursor-pointer hover:border-primary/30 transition-all">
              <Icon className="w-4 h-4 text-primary mb-1.5" />
              <p className="text-[10px] font-bold text-foreground leading-tight">{title}</p>
              <p className={`text-[9px] ${subColor} leading-snug mt-0.5`}>{sub}</p>
              {arrow && <ChevronRight className="w-3 h-3 text-muted-foreground mt-1" />}
            </div>
          ))}
        </div>

        

        {/* Expandable sections */}
        <div className="border border-border rounded-2xl overflow-hidden divide-y divide-border">
          {[
            { id: "description", label: "Description", content: product.description || "No description available." },
            { id: "specs", label: "Specifications", content: product.specs || "No specifications available." },
            { id: "reviews", label: "Reviews", extra: product.rating > 0 ? String(product.rating) : undefined, stars: product.rating > 0, content: product.reviewCount > 0 ? `${product.reviewCount.toLocaleString()} verified reviews` : "No reviews yet." },
          ].map(({ id, label, extra, stars, content }) => (
            <div key={id}>
              <button onClick={() => setOpenSection(openSection === id ? null : id)} className="w-full flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{label}</span>
                  {stars && extra && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold">{extra}</span>
                      <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}</div>
                    </div>
                  )}
                </div>
                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${openSection === id ? "rotate-90" : ""}`} />
              </button>
              {openSection === id && (
                <div className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-border pt-3">
                  {content}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* You May Also Like */}
        {related.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-foreground">You May Also Like</h2>
              <Link href="/shop"><span className="text-xs text-primary font-semibold">View all</span></Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {related.map((p) => (
                <UnifiedProductCard key={p.id} product={p} className="w-full" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border px-4 py-3 z-30">
        <div className="flex gap-3 max-w-lg mx-auto">
          <button onClick={handleAddToCart} disabled={product.stock === 0}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50">
            <ShoppingCart className="w-4 h-4" /> Add to Cart
          </button>
          <button onClick={handleBuyNow} disabled={product.stock === 0}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-foreground text-background rounded-2xl font-bold text-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-50">
            <Zap className="w-4 h-4" /> Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
