import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { API_BASE } from "@/lib/api";

const FALLBACK = {
  heading: "Upgrade Your Tech Game",
  subtitle: "Unbeatable performance. Unmatched style.",
  ctaText: "Shop Now",
  ctaLink: "/shop",
  discountText: "30%",
  discountSubtext: "OFF",
  bgImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=85",
};

export default function UpgradeBanner() {
  const [cfg, setCfg] = useState(FALLBACK);

  useEffect(() => {
    fetch(`${API_BASE}/api/cms/site-config/upgrade-banner`, { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.value) setCfg({ ...FALLBACK, ...d.value }); })
      .catch(() => {});
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 mb-6">
      <div className="relative rounded-2xl overflow-hidden" style={{ height: 185 }}>
        <img
          src={cfg.bgImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(100deg, rgba(5,15,30,0.92) 0%, rgba(5,20,40,0.70) 55%, rgba(5,40,40,0.28) 100%)" }}
        />
        <div className="relative z-10 flex items-center justify-between h-full px-5 py-5 gap-2">
          <div className="flex flex-col justify-center gap-2 min-w-0 flex-1">
            <h2 className="text-[15px] md:text-2xl font-black text-white leading-snug">{cfg.heading}</h2>
            <p className="text-[10px] text-white/60 leading-relaxed">{cfg.subtitle}</p>
            <Link href={cfg.ctaLink}>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-teal-500 text-white rounded-xl text-[11px] font-bold hover:bg-teal-400 transition-all active:scale-95 w-fit">
                {cfg.ctaText} <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
          <div className="text-right flex-shrink-0 pl-2">
            <p className="text-[9px] font-semibold text-white/50 uppercase tracking-widest mb-0.5">Up to</p>
            <p className="text-5xl md:text-6xl font-black text-teal-400 leading-none">{cfg.discountText}</p>
            <p className="text-2xl md:text-3xl font-black text-teal-400 -mt-1">{cfg.discountSubtext}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
