import { Link } from "wouter";
import { ShieldCheck, Truck, HeadphonesIcon, RotateCcw } from "lucide-react";

const perks = [
  { icon: Truck, title: "Free Delivery", body: "On all orders over $100 worldwide" },
  { icon: ShieldCheck, title: "Secure Payments", body: "100% protected with SSL encryption" },
  { icon: RotateCcw, title: "Easy Returns", body: "30-day hassle-free return policy" },
  { icon: HeadphonesIcon, title: "24/7 Support", body: "Dedicated support team always ready" },
];

export default function BottomCTA() {
  return (
    <section className="mt-12 mb-0">

      {/* Perks strip */}
      <div className="bg-muted/50 border-t border-b border-border py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {perks.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground leading-tight">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main CTA banner */}
      <div
        className="relative overflow-hidden py-12 md:py-16"
        style={{ background: "linear-gradient(135deg, #07392f 0%, #0a5544 55%, #0d6b57 100%)" }}
      >
        {/* Background circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)" }} />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #1FA89A 0%, transparent 70%)" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 text-center">
          <p className="text-primary text-xs md:text-sm font-bold uppercase tracking-widest mb-3 opacity-80">
            Shop Smarter, Live Better
          </p>
          <h2 className="text-2xl md:text-4xl font-black text-white mb-3 leading-tight">
            Everything You Need,<br className="hidden md:block" /> All in One Place
          </h2>
          <p className="text-white/60 text-sm md:text-base max-w-md mx-auto mb-8 leading-relaxed">
            Tech, fashion, lifestyle — browse thousands of products from top brands with fast delivery and secure checkout.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/shop">
              <button className="px-6 py-3 bg-white text-gray-900 rounded-xl font-bold text-sm hover:bg-white/90 transition-all active:scale-95">
                Start Shopping
              </button>
            </Link>
            <Link href="/get-now">
              <button className="px-6 py-3 bg-white/15 border border-white/25 text-white rounded-xl font-bold text-sm hover:bg-white/25 transition-all backdrop-blur-sm">
                Explore Get Now
              </button>
            </Link>
          </div>
        </div>
      </div>

    </section>
  );
}
