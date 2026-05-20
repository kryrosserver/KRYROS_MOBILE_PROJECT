import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Tag, Truck, ShieldCheck, Headphones, ShoppingCart, ChevronRight, Heart, LayoutGrid, Search, ClipboardList, SendHorizonal, CheckCircle2 } from "lucide-react";

const categories = [
  { id: "smartphones", name: "Smartphones", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200&q=80" },
  { id: "laptops", name: "Laptops", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&q=80" },
  { id: "electronics", name: "Electronics", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200&q=80" },
  { id: "accessories", name: "Accessories", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80" },
  { id: "audio", name: "Audio", image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=200&q=80" },
];

const wholesaleProducts = [
  { id: "p1", name: "iPhone 15 Pro Max", specs: "256GB | Titanium", price: 989.00, save: 10, minOrder: 5, image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80" },
  { id: "p2", name: "MacBook Air M2", specs: "13-inch | 512GB", price: 1129.00, save: 22, minOrder: 3, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80" },
  { id: "p3", name: "Sony WH-1000XM5", specs: "Wireless Headphones", price: 289.00, save: 22, minOrder: 10, image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80" },
  { id: "p4", name: "Nike Air Max 270", specs: "Men's Shoes", price: 95.00, save: 16, minOrder: 20, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" },
];

const steps = [
  { icon: Search, title: "Browse Products", desc: "Explore products available for wholesale" },
  { icon: ClipboardList, title: "Add to Quote", desc: "Add products to your quote list" },
  { icon: SendHorizonal, title: "Submit Quote", desc: "Our team will review your request" },
  { icon: CheckCircle2, title: "Confirm & Order", desc: "Confirm the quote and place your order" },
];

const features = [
  { icon: Tag, title: "Bulk Discounts", desc: "Better prices on larger quantities" },
  { icon: Truck, title: "Priority Shipping", desc: "Faster delivery for wholesale orders" },
  { icon: ShieldCheck, title: "Secure Payments", desc: "Safe & encrypted transactions" },
  { icon: Headphones, title: "Dedicated Support", desc: "24/7 priority customer support" },
];

export default function WholesalePage() {
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 pb-28">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-foreground">Wholesale</h1>
          <p className="text-muted-foreground text-xs mt-1 leading-5">
            Bulk buying made simple. Best prices for<br />your business.
          </p>
        </div>
        <div className="bg-primary/5 border border-primary/30 rounded-2xl px-3 py-2.5 flex items-start gap-2 cursor-pointer min-w-[160px] hover:border-primary/50 transition-colors">
          <div className="flex-1">
            <p className="text-[10px] font-bold text-primary mb-0.5">Wholesale Benefits</p>
            <p className="text-[9px] text-muted-foreground leading-snug">Lower prices, priority support<br />and exclusive offers.</p>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
        </div>
      </div>

      {/* Hero Banner */}
      <div className="rounded-2xl overflow-hidden mb-6 relative" style={{ background: "linear-gradient(135deg, #050F1A 0%, #0A1E2E 100%)" }}>
        <div className="flex items-center p-5 gap-3">
          <div className="flex-1">
            <h2 className="text-xl font-black text-white leading-tight">Buy More,</h2>
            <h2 className="text-xl font-black text-primary leading-tight mb-2">Save More!</h2>
            <p className="text-white/50 text-xs mb-4 leading-relaxed">Exclusive wholesale prices on<br />thousands of products.</p>
            <Link href="/shop">
              <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-xl font-bold text-xs hover:bg-white/90 transition-all">
                Explore Products <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
          <div className="relative flex-shrink-0 w-36 h-32">
            <div className="absolute right-0 top-0 w-22 h-22 rounded-xl overflow-hidden shadow-xl" style={{ width: 80, height: 80 }}>
              <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&q=80" alt="MacBook" className="w-full h-full object-cover" />
            </div>
            <div className="absolute left-0 bottom-0 w-16 h-16 rounded-xl overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=200&q=80" alt="Sony" className="w-full h-full object-cover" />
            </div>
            <div className="absolute right-0 bottom-0 flex flex-col items-center justify-center w-16 h-16 rounded-2xl border-2 border-primary/40 bg-primary/10">
              <span className="text-[8px] text-white/60 font-medium">UP TO</span>
              <span className="text-lg font-black text-primary leading-none">40%</span>
              <span className="text-[8px] text-white/60 font-medium">OFF</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shop by Category */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">Shop by Category</h2>
          <span className="text-xs text-primary font-semibold cursor-pointer">View All</span>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
          {categories.map((cat) => (
            <div key={cat.id} className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
              <div className="w-[58px] h-[58px] rounded-2xl overflow-hidden border border-border group-hover:border-primary transition-all">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[9px] font-medium text-muted-foreground group-hover:text-primary transition-colors text-center">{cat.name}</span>
            </div>
          ))}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
            <div className="w-[58px] h-[58px] rounded-2xl border border-border bg-muted group-hover:border-primary transition-all flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-[9px] font-medium text-muted-foreground group-hover:text-primary transition-colors">More</span>
          </div>
        </div>
      </div>

      {/* Feature badges */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex flex-col items-center text-center p-2 bg-card border border-border rounded-xl">
            <Icon className="w-4 h-4 text-primary mb-1" />
            <p className="text-[9px] font-bold text-foreground leading-tight mb-0.5">{title}</p>
            <p className="text-[8px] text-muted-foreground leading-tight">{desc}</p>
          </div>
        ))}
      </div>

      {/* Top Wholesale Deals */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">Top Wholesale Deals</h2>
          <span className="text-xs text-primary font-semibold cursor-pointer">View All</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {wholesaleProducts.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
            >
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="relative">
                  <span className="absolute top-2 left-2 z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/20">
                    Save {p.save}%
                  </span>
                  <button
                    onClick={() => setLiked((l) => ({ ...l, [p.id]: !l[p.id] }))}
                    className="absolute top-2 right-2 z-10 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow-sm"
                  >
                    <Heart className={`w-3 h-3 ${liked[p.id] ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                  </button>
                  <img src={p.image} alt={p.name} className="w-full aspect-square object-cover bg-muted" />
                </div>
                <div className="p-2.5">
                  <p className="text-[11px] font-bold text-foreground leading-tight mb-0.5 line-clamp-2">{p.name}</p>
                  <p className="text-[9px] text-muted-foreground mb-1.5">{p.specs}</p>
                  <p className="text-sm font-black text-foreground leading-tight">
                    ${p.price.toFixed(2)}<span className="text-[9px] text-muted-foreground font-normal"> /unit</span>
                  </p>
                  <p className="text-[9px] text-muted-foreground mb-2">Min. Order: {p.minOrder} units</p>
                  <button className="w-full flex items-center justify-center gap-1 py-1.5 border border-border rounded-lg text-[9px] font-bold text-foreground hover:bg-muted transition-all">
                    <ShoppingCart className="w-3 h-3" />
                    Add to Quote
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Want Better Prices */}
      <div className="flex items-center justify-between bg-card border border-border rounded-2xl p-4 mb-5">
        <div className="flex-1 mr-3">
          <p className="text-xs font-bold text-foreground mb-1">Want Better Prices?</p>
          <p className="text-[9px] text-muted-foreground leading-snug">Request a custom quote for bulk orders and get the best deals curated for your business.</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-xl text-[10px] font-bold hover:bg-primary/90 transition-all flex-shrink-0 whitespace-nowrap">
          Request a Quote <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* How Wholesale Works */}
      <div>
        <h2 className="text-sm font-bold text-foreground mb-4">How Wholesale Works</h2>
        <div className="flex items-start">
          {steps.map((step, i) => (
            <div key={step.title} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center text-center flex-1 min-w-0 px-0.5">
                <div className="w-10 h-10 rounded-xl border border-border bg-primary/10 flex items-center justify-center mb-2 shadow-sm">
                  <step.icon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-[9px] font-bold text-foreground leading-tight mb-0.5">{i + 1}. {step.title}</p>
                <p className="text-[8px] text-muted-foreground leading-tight">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight className="w-3 h-3 text-muted-foreground/50 flex-shrink-0 mb-5" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
