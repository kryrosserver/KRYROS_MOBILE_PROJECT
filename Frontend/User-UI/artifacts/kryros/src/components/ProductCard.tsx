import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import type { Product } from "@/data/mockData";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ id: product.id, name: product.name, price: product.price, qty: 1, image: product.image });
    toast.success("Added to cart", { description: product.name });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist", { description: product.name });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group"
      data-testid={`card-product-${product.id}`}
    >
      <div className="bg-card border border-border rounded-[22px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer" onClick={() => window.location.href = `/product/${product.id}`}>
          {/* Image area */}
          <div className="relative bg-[#DFE3E8] dark:bg-muted aspect-square flex items-center justify-center overflow-hidden">
            {!imgError ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
            )}

            {/* Discount badge */}
            {product.discount > 0 && (
              <span className="absolute top-2.5 left-2.5 bg-destructive text-white text-xs font-bold px-2 py-0.5 rounded-lg z-10">
                -{product.discount}%
              </span>
            )}
            {product.isNew && !product.discount && (
              <span className="absolute top-2.5 left-2.5 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-lg z-10">
                NEW
              </span>
            )}

            {/* Wishlist button */}
            <button
              onClick={handleWishlist}
              data-testid={`btn-wishlist-${product.id}`}
              className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 z-10"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${wishlisted ? "fill-destructive text-destructive" : "text-muted-foreground"}`}
              />
            </button>

            {/* Quick view */}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 z-10"
            >
              <Eye className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Info */}
          <div className="p-3 md:p-4 flex flex-col flex-1">
            <p className="text-[11px] text-muted-foreground font-medium mb-0.5">{product.brand}</p>
            <h3 className="text-sm md:text-[15px] font-semibold text-foreground leading-snug mb-1 line-clamp-2">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground mb-2 truncate">{product.specs}</p>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base md:text-lg font-bold text-foreground">
                ${product.price.toLocaleString("en", { minimumFractionDigits: 2 })}
              </span>
              {product.oldPrice > product.price && (
                <span className="text-xs text-muted-foreground line-through">
                  ${product.oldPrice.toLocaleString("en", { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="mb-3">
              {product.stock > 0 ? (
                <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  In Stock
                </span>
              ) : (
                <span className="text-[10px] font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2 mt-auto">
              <button
                onClick={handleAddToCart}
                data-testid={`btn-add-cart-${product.id}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-primary text-primary rounded-xl text-xs font-semibold hover:bg-primary/5 transition-all active:scale-95"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Add to Cart
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); window.location.href = `/product/${product.id}`; }}
                data-testid={`btn-buy-now-${product.id}`}
                className="flex-1 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all active:scale-95 whitespace-nowrap px-2"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
    </motion.div>
  );
}
