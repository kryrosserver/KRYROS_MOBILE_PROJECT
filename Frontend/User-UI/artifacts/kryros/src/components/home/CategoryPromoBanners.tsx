import { useEffect, useState } from "react";
import { Link } from "wouter";
import { fetchHomepageSections, type ApiHomepageSection } from "@/lib/api";

interface PromoCard {
  id: string;
  tag: string;
  title: string;
  sub: string;
  desc: string;
  href: string;
  gradient: string;
  emoji: string;
}

const FALLBACK_CARDS: PromoCard[] = [
  {
    id: "b1",
    tag: "UP TO 50% OFF",
    title: "Mega Deal",
    sub: "On Selected Items",
    desc: "Get the biggest discounts on top electronics and accessories",
    href: "/shop",
    gradient: "linear-gradient(135deg, #0f4c35 0%, #1a7a52 50%, #0d9488 100%)",
    emoji: "🛒",
  },
  {
    id: "b2",
    tag: "EARN REWARDS",
    title: "Refer & Earn",
    sub: "Invite Friends & Get Rewards",
    desc: "Share with friends and earn credit per referral",
    href: "/dashboard",
    gradient: "linear-gradient(135deg, #1a3a5c 0%, #1e5f8c 50%, #0ea5c9 100%)",
    emoji: "🎁",
  },
  {
    id: "b3",
    tag: "FREE DELIVERY",
    title: "Ship For Free",
    sub: "On Orders Over K500",
    desc: "Fast delivery to your doorstep at no extra cost nationwide",
    href: "/shop",
    gradient: "linear-gradient(135deg, #3b1f6b 0%, #5c2fa0 50%, #7c3aed 100%)",
    emoji: "🚚",
  },
  {
    id: "b4",
    tag: "LIMITED TIME",
    title: "Flash Sale",
    sub: "Today's Hot Deals",
    desc: "Grab the best prices before they're gone — limited stock only",
    href: "/shop",
    gradient: "linear-gradient(135deg, #7c1d1d 0%, #b91c1c 50%, #ef4444 100%)",
    emoji: "⚡",
  },
];

const GRADIENTS = [
  "linear-gradient(135deg, #0f4c35 0%, #1a7a52 50%, #0d9488 100%)",
  "linear-gradient(135deg, #1a3a5c 0%, #1e5f8c 50%, #0ea5c9 100%)",
  "linear-gradient(135deg, #3b1f6b 0%, #5c2fa0 50%, #7c3aed 100%)",
  "linear-gradient(135deg, #7c1d1d 0%, #b91c1c 50%, #ef4444 100%)",
];

const EMOJIS = ["🛒", "🎁", "🚚", "⚡"];

function sectionToCard(s: ApiHomepageSection, index: number): PromoCard {
  const cfg = s.config as any;
  return {
    id: s.id,
    tag: cfg?.tag || s.title || "OFFER",
    title: cfg?.title || s.title || "Special Offer",
    sub: cfg?.subtitle || cfg?.sub || "",
    desc: cfg?.description || cfg?.desc || "",
    href: cfg?.link || cfg?.href || "/shop",
    gradient: cfg?.gradient || GRADIENTS[index % GRADIENTS.length],
    emoji: cfg?.emoji || EMOJIS[index % EMOJIS.length],
  };
}

export default function CategoryPromoBanners() {
  const [cards, setCards] = useState<PromoCard[]>(FALLBACK_CARDS);

  useEffect(() => {
    fetchHomepageSections("promo_banners")
      .then((sections) => {
        if (sections.length >= 1) {
          setCards(sections.slice(0, 4).map(sectionToCard));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 mb-8">
      <div
        className="flex gap-3 overflow-x-auto no-scrollbar pb-2"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {cards.map((b) => (
          <Link key={b.id} href={b.href}>
            <div
              className="relative flex-shrink-0 overflow-hidden cursor-pointer group hover:shadow-xl transition-shadow duration-300"
              style={{
                background: b.gradient,
                borderRadius: 14,
                width: "min(86vw, 360px)",
                height: 165,
                scrollSnapAlign: "start",
              }}
            >
              <div className="absolute inset-0 flex flex-col justify-between p-4 pr-[44%]">
                <span
                  className="self-start text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.22)", color: "#fff" }}
                >
                  {b.tag}
                </span>
                <div>
                  <h3 className="text-white font-black text-[17px] leading-tight">{b.title}</h3>
                  <p className="text-white/80 font-medium text-[11px] leading-tight mt-0.5">{b.sub}</p>
                  <p className="text-white/55 text-[9px] leading-tight mt-1 line-clamp-2">{b.desc}</p>
                </div>
                <button
                  className="self-start text-[10px] font-bold px-3 py-1 rounded-full mt-1 transition-all group-hover:scale-105"
                  style={{ background: "rgba(255,255,255,0.22)", color: "#fff" }}
                >
                  Learn more
                </button>
              </div>
              <div className="absolute right-0 top-0 bottom-0" style={{ width: "44%" }}>
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="text-6xl select-none">{b.emoji}</div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
