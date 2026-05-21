import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { fetchBanners, type ApiBanner } from "@/lib/api";

interface PromoBanner {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image: string;
  overlayFrom: string;
  overlayTo: string;
}

const FALLBACK: PromoBanner[] = [
  {
    id: "getnow",
    tag: "GET NOW",
    title: "Smart Payment Plan",
    subtitle: "Buy now, pay in easy monthly instalments.",
    cta: "Learn More",
    href: "/get-now",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80",
    overlayFrom: "rgba(5,30,22,0.88)",
    overlayTo: "rgba(5,30,22,0.25)",
  },
  {
    id: "shipping",
    tag: "FREE SHIPPING",
    title: "Free Shipping Nationwide",
    subtitle: "On all orders over K500.",
    cta: "Shop Now",
    href: "/shop",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80",
    overlayFrom: "rgba(5,20,40,0.88)",
    overlayTo: "rgba(5,20,40,0.25)",
  },
];

const OVERLAYS = [
  { from: "rgba(5,30,22,0.88)", to: "rgba(5,30,22,0.25)" },
  { from: "rgba(5,20,40,0.88)", to: "rgba(5,20,40,0.25)" },
];

function apiBannerToPromo(b: ApiBanner, index: number): PromoBanner {
  const o = OVERLAYS[index % OVERLAYS.length];
  return {
    id: b.id,
    tag: b.tag || b.badge || "OFFER",
    title: b.title,
    subtitle: b.subtitle || "",
    cta: b.linkText || "Learn More",
    href: b.link || "/shop",
    image: b.image || FALLBACK[0].image,
    overlayFrom: o.from,
    overlayTo: o.to,
  };
}

export default function PromoBanners() {
  const [banners, setBanners] = useState<PromoBanner[]>(FALLBACK);

  useEffect(() => {
    fetchBanners()
      .then((data) => {
        const promo = data.filter(
          (b) => b.position !== undefined && b.position >= 10 && b.position < 20
        );
        const toUse = promo.length >= 2 ? promo.slice(0, 2) : data.slice(0, 2);
        if (toUse.length >= 1) setBanners(toUse.map(apiBannerToPromo));
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-4 md:py-6">
      <div className="px-3 md:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {banners.map((b) => (
            <div key={b.id} className="relative rounded-2xl overflow-hidden" style={{ height: 150 }}>
              <img src={b.image} alt={b.title} className="absolute inset-0 w-full h-full object-cover" />
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(to right, ${b.overlayFrom} 0%, ${b.overlayTo} 70%, transparent 100%)` }}
              />
              <div className="relative z-10 h-full flex flex-col justify-between p-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: "#1FA89A" }}>
                    {b.tag}
                  </p>
                  <h3 className="text-white font-black text-[13px] md:text-base leading-tight">{b.title}</h3>
                  <p className="text-white/60 text-[9px] mt-1 leading-snug line-clamp-2">{b.subtitle}</p>
                </div>
                <Link href={b.href}>
                  <div className="flex items-center gap-1 text-[10px] font-semibold cursor-pointer hover:gap-2 transition-all whitespace-nowrap" style={{ color: "#1FA89A" }}>
                    {b.cta} <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
