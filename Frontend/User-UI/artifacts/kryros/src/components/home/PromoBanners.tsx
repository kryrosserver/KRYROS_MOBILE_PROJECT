import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const banners = [
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
    title: "Free Shipping Worldwide",
    subtitle: "On all orders over $100.",
    cta: "Shop Now",
    href: "/shop",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80",
    overlayFrom: "rgba(5,20,40,0.88)",
    overlayTo: "rgba(5,20,40,0.25)",
  },
];

export default function PromoBanners() {
  return (
    <section className="py-4 md:py-6">
      <div className="px-3 md:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {banners.map((b) => (
            <div
              key={b.id}
              className="relative rounded-2xl overflow-hidden"
              style={{ height: 150 }}
            >
              {/* Full background image */}
              <img
                src={b.image}
                alt={b.title}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to right, ${b.overlayFrom} 0%, ${b.overlayTo} 70%, transparent 100%)`,
                }}
              />

              {/* Text content overlaid */}
              <div className="relative z-10 h-full flex flex-col justify-between p-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: "#1FA89A" }}>
                    {b.tag}
                  </p>
                  <h3 className="text-white font-black text-[13px] md:text-base leading-tight">
                    {b.title}
                  </h3>
                  <p className="text-white/60 text-[9px] mt-1 leading-snug line-clamp-2">
                    {b.subtitle}
                  </p>
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
