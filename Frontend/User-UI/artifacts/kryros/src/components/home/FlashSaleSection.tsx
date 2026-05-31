import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Zap, ChevronRight } from "lucide-react";
import { fetchFlashSaleProducts } from "@/lib/api";
import type { Product } from "@/lib/api";
import UnifiedProductCard from "@/components/UnifiedProductCard";

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

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {/* Countdown timer card */}
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
          <UnifiedProductCard
            key={p.id}
            product={p}
            className="flex-shrink-0 w-[calc(50vw-16px)]"
          />
        ))}
      </div>
    </section>
  );
}
