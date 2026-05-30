import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Heart, ShoppingCart, Trash2, PackageSearch } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { useCurrencyStore } from "@/store/currencyStore";
import { useAuthStore } from "@/store/authStore";
import { API_BASE } from "@/lib/api";
import AccountLayout from "@/components/layout/AccountLayout";

interface Product {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  images: { url: string; isPrimary: boolean }[];
  slug?: string;
}

interface ApiWishlistItem {
  id: string;
  productId: string;
  product: Product;
}

export default function WishlistPage() {
  const { items: wishlistIds, toggleWishlist, _hasHydrated } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addToCart);
  const format = useCurrencyStore((s) => s.format);
  const { token } = useAuthStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [apiWishlistIds, setApiWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!token;

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      fetch(`${API_BASE}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          const list: ApiWishlistItem[] = Array.isArray(data) ? data : [];
          setApiWishlistIds(list.map((item) => item.productId ?? item.id));
          setProducts(list.map((item) => item.product).filter(Boolean));
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
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
    }
  }, [isAuthenticated, token, wishlistIds.join(",")]);

  const handleRemove = (product: Product) => {
    if (isAuthenticated) {
      fetch(`${API_BASE}/api/wishlist/${product.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(() => {
          setProducts((prev) => prev.filter((p) => p.id !== product.id));
          setApiWishlistIds((prev) => prev.filter((id) => id !== product.id));
        })
        .catch(() => {});
    } else {
      toggleWishlist(product.id);
    }
  };

  const activeIds = isAuthenticated ? apiWishlistIds : wishlistIds;

  const getImage = (p: Product) => {
    const primary = p.images?.find((i) => i.isPrimary);
    return primary?.url ?? p.images?.[0]?.url ?? "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80";
  };

  const handleAddToCart = (product: Product) => {
    addToCart({ id: product.id, name: product.name, price: product.price, image: getImage(product), qty: 1 });
  };

  const showSkeleton = isAuthenticated ? loading : !_hasHydrated;
  const isEmpty = isAuthenticated ? (!loading && products.length === 0) : (_hasHydrated && wishlistIds.length === 0);

  return (
    <AccountLayout>
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-foreground">My Wishlist</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeIds.length === 0
              ? "Your wishlist is empty"
              : `${activeIds.length} saved item${activeIds.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {showSkeleton ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl bg-muted animate-pulse h-64" />
            ))}
          </div>
        ) : isEmpty ? (
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
            {(activeIds.length > 0 ? activeIds : [1, 2]).map((id) => (
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
                        className="w-full h-40 object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    {discount && (
                      <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        -{discount}%
                      </span>
                    )}
                    <button
                      onClick={() => handleRemove(product)}
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
    </AccountLayout>
  );
}
