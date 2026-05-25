import { useEffect, useState } from "react";
import { Truck, ShieldCheck, RefreshCcw, Headphones, Star, Zap, Gift, Heart } from "lucide-react";
import { API_BASE } from "@/lib/api";

const ICON_MAP: Record<string, any> = {
  Truck, ShieldCheck, RefreshCcw, Headphones, Star, Zap, Gift, Heart,
};

const FALLBACK = [
  { icon: "Truck", title: "Free Shipping", subtitle: "On orders over $100" },
  { icon: "ShieldCheck", title: "Secure Payments", subtitle: "100% Secure" },
  { icon: "RefreshCcw", title: "Easy Returns", subtitle: "7-Day Returns" },
  { icon: "Headphones", title: "24/7 Support", subtitle: "We are here" },
];

export default function TrustBadges() {
  const [badges, setBadges] = useState(FALLBACK);

  useEffect(() => {
    fetch(`${API_BASE}/api/cms/site-config/trust-badges`, { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.value?.items?.length) setBadges(d.value.items); })
      .catch(() => {});
  }, []);

  return (
    <section className="border-t border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-3 md:px-6">
        {/* Mobile: 2×2 grid */}
        <div className="grid grid-cols-2 gap-0 md:hidden divide-y divide-border">
          {badges.map(({ icon, title, subtitle }, i) => {
            const Icon = ICON_MAP[icon] || Truck;
            return (
              <div key={i} className={`flex items-center gap-2.5 py-3 px-3 ${i % 2 === 0 ? "border-r border-border" : ""}`}>
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground leading-tight">{title}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
        {/* Desktop: single row with dividers */}
        <div className="hidden md:flex items-center divide-x divide-border">
          {badges.map(({ icon, title, subtitle }, i) => {
            const Icon = ICON_MAP[icon] || Truck;
            return (
              <div key={i} className="flex items-center gap-3 py-4 px-8 flex-1">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">{subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
