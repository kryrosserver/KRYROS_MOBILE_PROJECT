import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Heart, ShoppingCart, Star, ChevronRight, Zap, Headphones,
} from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCurrencyStore } from "@/store/currencyStore";
import { fetchProducts, fetchCategories, fetchBrands } from "@/lib/api";
import type { Product, ApiCategory, ApiBrand } from "@/lib/api";

const HERO_DATA: Record<string, { pre: string; brand: string; sub: string; bg: string; brandColor: string }> = {
  Apple:   { pre: "The best of",    brand: "Apple.",   sub: "Original products.\nBest prices on KRYROS.",    bg: "#f2f2f7",  brandColor: "#0D9488" },
  Samsung: { pre: "Innovate with",  brand: "Samsung.", sub: "Galaxy experience.\nBold tech, smarter life.",   bg: "#eef2ff",  brandColor: "#1428A0" },
  Google:  { pre: "Experience",     brand: "Google.",  sub: "Pixel phones & more.\nPure Android, pure power.", bg: "#fff8e7", brandColor: "#EA4335" },
  Xiaomi:  { pre: "More with",      brand: "Xiaomi.",  sub: "Performance & value.\nAlways innovation.",       bg: "#fff0ee",  brandColor: "#FF6900" },
  Sony:    { pre: "Premium by",     brand: "Sony.",    sub: "World-class audio.\nFeel every detail.",         bg: "#f0f0f0",  brandColor: "#1a1a1a" },
};

function ShopCard({ product }: { product: Product }) {
  const [imgErr, setImgErr] = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const format = useCurrencyStore((s) => s.format);
  const wishlisted = isWishlisted(product.id);
  const monthly = format(product.price / 12);

  return (
    <div
      className="w-full bg-card border border-border rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow"
      onClick={() => (window.location.href = `/product/${product.id}`)}
    >
      <div className="relative bg-[#f0f0f0] dark:bg-muted" style={{ height: 130 }}>
        {!imgErr && product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
        )}
        {product.discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg z-10">
            -{product.discount}%
          </span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist", { description: product.name }); }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center z-10 shadow-sm"
        >
          <Heart className={`w-3.5 h-3.5 transition-colors ${wishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
        </button>
      </div>

      <div className="p-2.5">
        <h3 className="text-xs font-semibold text-foreground leading-snug line-clamp-2 mb-0.5">{product.name}</h3>
        {product.specs && <p className="text-[10px] text-muted-foreground truncate mb-1.5">{product.specs}</p>}

        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-1.5">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-2.5 h-2.5 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
              ))}
            </div>
            {product.reviewCount > 0 && <span className="text-[9px] text-muted-foreground">({product.reviewCount.toLocaleString()})</span>}
          </div>
        )}

        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-sm font-bold text-foreground">{format(product.price)}</span>
          {product.oldPrice > product.price && (
            <span className="text-[10px] text-muted-foreground line-through">{format(product.oldPrice)}</span>
          )}
        </div>

        {/* Stock status */}
        <div className="mb-2">
          {product.stock > 0 ? (
            <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">In Stock</span>
          ) : (
            <span className="text-[10px] font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">Out of Stock</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); addToCart({ id: product.id, name: product.name, price: product.price, qty: 1, image: product.image }); toast.success("Added to cart", { description: product.name }); }}
            className="w-8 h-7 flex items-center justify-center border border-teal-600 rounded-lg flex-shrink-0 hover:bg-teal-50 transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-teal-600" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); window.location.href = `/product/${product.id}`; }}
            className="flex-1 h-7 bg-teal-600 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-teal-700 transition-colors"
          >
            <Zap className="w-3 h-3" /> Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

function BrandProductSection({ title, brandName, categoryName }: { title: string; brandName?: string; categoryName?: string }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts({ take: 8 }).then((all) => {
      const filtered = all.filter((p) => {
        if (brandName && p.brand !== brandName) return false;
        if (categoryName && p.category !== categoryName) return false;
        return true;
      });
      setProducts(filtered);
    });
  }, [brandName, categoryName]);

  if (products.length === 0) return null;

  return (
    <div className="mb-5 mx-4 bg-card border border-border/50 rounded-2xl shadow-md overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <h2 className="text-base font-black text-foreground">{title}</h2>
        <Link href="/shop">
          <span className="text-xs font-semibold text-teal-600 flex items-center gap-0.5 cursor-pointer">
            View All <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 px-4 pb-4">
        {products.map((p) => <ShopCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [selectedCat, setSelectedCat] = useState<string>("All");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [heroDot, setHeroDot] = useState(0);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [brands, setBrands] = useState<ApiBrand[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Read search query from URL (?search=...)
  const searchParam = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("search") || ""
    : "";

  useEffect(() => {
    fetchCategories().then((cats) => {
      setCategories(cats.filter((c: any) => c.isActive !== false));
    });
    fetchBrands().then((bs) => {
      setBrands(bs);
      if (bs.length > 0) setSelectedBrand(bs[0].name);
    });
    // If search param exists, fetch with search query; otherwise fetch all
    const searchQ = new URLSearchParams(window.location.search).get("search") || "";
    fetchProducts({ take: 50, search: searchQ || undefined }).then(setAllProducts);
  }, []);

  const hero = HERO_DATA[selectedBrand];

  const filteredProducts = selectedCat === "All"
    ? allProducts
    : allProducts.filter((p) => p.category === selectedCat || p.categoryId === selectedCat);

  // Client-side search filter for search results
  const searchResults = searchParam
    ? allProducts.filter((p) =>
        p.name?.toLowerCase().includes(searchParam.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchParam.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchParam.toLowerCase()) ||
        p.specs?.toLowerCase().includes(searchParam.toLowerCase())
      )
    : [];

  const uniqueBrands = Array.from(new Set(allProducts.map((p) => p.brand).filter(Boolean)));

  return (
    <div className="pb-24 md:pb-10">

      {/* ── Search Results Section ── */}
      {searchParam && (
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-black text-foreground">
                Results for &ldquo;{searchParam}&rdquo;
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {searchResults.length} product{searchResults.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <a href="/shop" className="text-xs text-primary font-semibold hover:underline">Clear ✕</a>
          </div>
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {searchResults.map((p) => <ShopCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm font-semibold">No products found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      )}

      {/* ── Normal Shop (hidden when search active) ── */}
      {!searchParam && (
      <><div className="text-center pt-4 pb-3 px-4">
        <h2 className="text-base font-black text-foreground tracking-tight">Shop All Products</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">Browse our full collection by category</p>
      </div>

      {/* Category cards */}
      {categories.length > 0 && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-4">
          <button
            onClick={() => setSelectedCat("All")}
            className={`flex-shrink-0 relative w-36 h-36 rounded-2xl overflow-hidden transition-all bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center ${selectedCat === "All" ? "ring-2 ring-teal-500 ring-offset-2" : ""}`}
          >
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,20,30,0.92) 0%, rgba(10,20,30,0.55) 55%, rgba(10,20,30,0.15) 100%)" }} />
            <div className="absolute bottom-0 left-0 right-0 p-2.5">
              <p className="text-white font-black text-xs uppercase tracking-wide leading-tight mb-1">All</p>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-0.5 bg-teal-400 rounded-full" />
                <span className="text-white/70 text-[10px] font-medium">{allProducts.length} ITEMS</span>
              </div>
            </div>
          </button>

          {categories.map((cat) => {
            const active = selectedCat === cat.name || selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.name)}
                className={`flex-shrink-0 relative w-36 h-36 rounded-2xl overflow-hidden transition-all ${active ? "ring-2 ring-teal-500 ring-offset-2" : ""}`}
              >
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
                )}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,20,30,0.92) 0%, rgba(10,20,30,0.55) 55%, rgba(10,20,30,0.15) 100%)" }} />
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <p className="text-white font-black text-xs uppercase tracking-wide leading-tight mb-1">{cat.name}</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-0.5 bg-teal-400 rounded-full" />
                    <span className="text-white/70 text-[10px] font-medium">{cat._count?.products ?? 0} ITEMS</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="mx-4 mb-4 border-t border-border" />

      {/* Hero banner for selected brand */}
      {hero && (
        <div className="mx-4 mb-5 rounded-2xl overflow-hidden" style={{ background: hero.bg }}>
          <div className="flex items-center min-h-[140px] relative overflow-hidden p-4">
            <div className="flex-1 z-10">
              <p className="text-xs text-gray-600 font-medium">{hero.pre}</p>
              <h2 className="text-2xl font-black leading-tight mb-1" style={{ color: hero.brandColor }}>{hero.brand}</h2>
              <p className="text-[11px] text-gray-600 mb-3 leading-relaxed whitespace-pre-line">{hero.sub}</p>
              <Link href="/shop">
                <button className="flex items-center gap-1.5 bg-foreground text-background text-xs font-bold px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
                  Shop {selectedBrand} <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          </div>
          <div className="flex justify-center gap-1.5 pb-3">
            {[0, 1, 2, 3].map((i) => (
              <button key={i} onClick={() => setHeroDot(i)} className={`rounded-full transition-all ${heroDot === i ? "w-4 h-1.5 bg-teal-600" : "w-1.5 h-1.5 bg-gray-300"}`} />
            ))}
          </div>
        </div>
      )}

      <div className="mx-4 mb-4 border-t border-border" />

      {/* Shop by Brand */}
      {uniqueBrands.length > 0 && (
        <div className="px-4 mb-5">
          <p className="text-sm font-bold text-foreground mb-2.5">Shop by Brand</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {uniqueBrands.slice(0, 8).map((name) => {
              const active = selectedBrand === name;
              return (
                <button
                  key={name}
                  onClick={() => { setSelectedBrand(name); setHeroDot(0); }}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-full border text-xs font-semibold transition-all ${active ? "bg-foreground text-background border-foreground" : "bg-card border-border text-foreground hover:border-teal-600/50"}`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mx-4 mb-4 border-t border-border" />

      {/* Products grid / scroll */}
      {filteredProducts.length > 0 ? (
        <div className="px-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-black text-foreground">
              {selectedCat === "All" ? "All Products" : selectedCat}
            </h2>
            <span className="text-xs text-muted-foreground">{filteredProducts.length} items</span>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {filteredProducts.map((p) => <ShopCard key={p.id} product={p} />)}
          </div>
        </div>
      ) : (
        allProducts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">Loading products...</div>
        )
      )}

      {/* Members Banner */}
      <div className="mx-4 mb-5 rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0D9488 0%, #0f766e 100%)" }}>
        <div className="flex items-center p-4 gap-3">
          <div className="flex-1">
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-0.5">KRYROS Members</p>
            <h3 className="text-xl font-black text-white leading-tight">Extra 5% Off</h3>
            <p className="text-[11px] text-white/80 mb-3">On selected products</p>
            <Link href="/register">
              <button className="flex items-center gap-1.5 bg-white text-teal-700 text-xs font-bold px-4 py-2 rounded-full hover:bg-white/90 transition-opacity">
                Join Now <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
          <div className="flex-shrink-0 flex flex-col items-center gap-1 text-right">
            <div className="bg-white/15 rounded-xl p-2 mb-1">
              <Headphones className="w-8 h-8 text-white" />
            </div>
            <p className="text-[9px] font-bold text-white/80 text-center">Members Only</p>
            <p className="text-[9px] text-white/60 text-center">Exclusive Deals</p>
            <p className="text-[10px] font-black text-white">KRY<span className="text-teal-200">ROS</span></p>
          </div>
        </div>
      </div>

      {/* Dynamic brand/category sections */}
      {brands.slice(0, 2).map((brand) => (
        <BrandProductSection key={brand.id} title={brand.name} brandName={brand.name} />
      ))}
      </>
      )}
    </div>
  );
}
