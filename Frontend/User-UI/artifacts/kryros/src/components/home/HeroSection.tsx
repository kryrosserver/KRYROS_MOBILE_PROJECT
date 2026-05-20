import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { fetchBanners } from "@/lib/api";
import type { ApiBanner } from "@/lib/api";

const OVERLAY_COLORS = [
  { from: "rgba(15,30,25,0.82)", to: "rgba(15,30,25,0.10)" },
  { from: "rgba(15,10,35,0.82)", to: "rgba(15,10,35,0.08)" },
  { from: "rgba(30,15,10,0.82)", to: "rgba(30,15,10,0.08)" },
  { from: "rgba(10,25,15,0.82)", to: "rgba(10,25,15,0.08)" },
];

export default function HeroSection() {
  const [banners, setBanners] = useState<ApiBanner[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetchBanners().then((data) => {
      if (data.length > 0) setBanners(data);
    });
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 5500);
    return () => clearInterval(t);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const banner = banners[current];
  const overlay = OVERLAY_COLORS[current % OVERLAY_COLORS.length];

  return (
    <section
      className="relative overflow-hidden"
      style={{ height: "clamp(280px, 46vw, 500px)" }}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={banner.id + "-img"}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55 }}
          src={banner.image || ""}
          alt={banner.title}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </AnimatePresence>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(to right, ${overlay.from} 0%, ${overlay.to} 65%, transparent 100%)`,
          transition: "background 0.5s ease",
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={banner.id + "-text"}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 flex items-center"
        >
          <div className="px-6 md:px-14 max-w-[58%] md:max-w-[50%]">
            {banner.badge && (
              <p
                className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2 md:mb-3"
                style={{ color: "#1FA89A" }}
              >
                {banner.badge}
              </p>
            )}

            <h1 className="text-[22px] md:text-[46px] font-black text-white leading-[1.05] drop-shadow-md">
              {banner.title}
            </h1>

            {banner.subtitle && (
              <h2
                className="text-[18px] md:text-[36px] font-black leading-[1.05] mb-2 md:mb-4 drop-shadow-md"
                style={{ color: "#1FA89A" }}
              >
                {banner.subtitle}
              </h2>
            )}

            {banner.link && (
              <Link href={banner.link}>
                <button
                  className="inline-flex items-center gap-2 px-5 md:px-7 py-2 md:py-3 rounded-lg font-semibold text-xs md:text-sm text-white hover:opacity-90 active:scale-95 transition-all shadow-lg mt-3 md:mt-5"
                  style={{ background: "#1FA89A" }}
                >
                  {banner.linkText || "Shop Now"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-5 h-2 bg-[#1FA89A]"
                  : "w-2 h-2 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
