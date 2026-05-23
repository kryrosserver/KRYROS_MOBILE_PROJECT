import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Heart, ShoppingCart, Trash2, ChevronLeft, PackageSearch } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { useCurrencyStore } from "@/store/currencyStore";
import { API_BASE } from "@/lib/api";

interface Product {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  images: { url: string; isPrimary: boolean }[];
  slug?: string;
}

export default function WishlistPage() {
  const { items: wishlistIds, toggleWishlist } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addToCart);
  const format = useCurrencyStore((s) => s.format);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wishlistIds.length === 0) {
      setProducts([]);
      return;
    }
    setLoading(true);
    Promise.all(
      wishlistIds.map((id) =>
        fetch(`${API_BASE}/api/products/${id}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      )
    )
      .then((results) => {
        setProducts(results.filter(Boolean) as Product[]);
      })
      .finally(() => setLoading(false));
  }, [wishlistIds.join(",")]);

  const getImage = (p: Product) => {
    const primary = p.images?.find((i) => i.isPrimary);
    return primary?.url ?? p.images?.[0]?.url ?? "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80";
  };

  const handleAddToCart = (product: Product) => {
    addToCart({ id: product.id, name: product.name, price: product.price, image: getImage(product), qty: 1 });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/">
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
        </Link>
        <span className="text-base font-black text-foreground">
          KRY<span className="text-primary">ROS</span>
        </span>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
          <Heart className="w-4 h-4 text-primary fill-primary" />
          Wishlist
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-foreground">My Wishlist</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {wishlistIds.length === 0
              ? "Your wishlist is empty"
              : `${wishlistIds.length} saved item${wishlistIds.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {wishlistIds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-5">
              <PackageSearch className="w-9 h-9 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-black text-foreground mb-2">Nothing saved yet</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Tap the heart icon on any product to save it here for later.
            </p>
            <Link href="/shop">
              <button className="px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 transition-colors">
                Browse Products
              </button>
            </Link>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {wishlistIds.map((id) => (
              <div key={id} className="rounded-2xl bg-muted animate-pulse h-64" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {products.map((product) => {
              const img = getImage(product);
              const discount =
                product.comparePrice && product.comparePrice > product.price
                  ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                  : null;

              return (
                <div
                  key={product.id}
                  className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col group"
                >
                  <div className="relative">
                    <Link href={`/product/${product.id}`}>
                      <img
                        src={img}
                        alt={product.name}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    {discount && (
                      <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        -{discount}%
                      </span>
                    )}
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-2 right-2 w-7 h-7 bg-white/90 dark:bg-black/60 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>

                  <div className="p-3 flex flex-col flex-1 gap-2">
                    <Link href={`/product/${product.id}`}>
                      <p className="text-xs font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors cursor-pointer leading-snug">
                        {product.name}
                      </p>
                    </Link>
                    <div className="mt-auto">
                      <div className="flex items-baseline gap-1.5 mb-2">
                        <span className="text-sm font-black text-primary">{format(product.price)}</span>
                        {product.comparePrice && product.comparePrice > product.price && (
                          <span className="text-[10px] text-muted-foreground line-through">
                            {format(product.comparePrice)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-primary hover:text-white transition-all"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {products.length > 0 && (
          <div className="mt-8 text-center">
            <Link href="/shop">
              <button className="px-6 py-3 border border-border text-foreground rounded-2xl font-bold text-sm hover:bg-muted transition-colors">
                Continue Shopping
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
