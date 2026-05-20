import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ShieldCheck, Heart, ShoppingBag, CreditCard, FileCheck, Package, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  { months: 3, interest: "0% Interest", desc: ["No hidden fees", "Flexible & Easy"], popular: true },
  { months: 6, interest: "0% Interest", desc: ["Low monthly payments", "Flexible & Easy"], popular: false },
  { months: 12, interest: "0% Interest", desc: ["Best for higher amounts", "Easy installments"], popular: false },
  { months: 24, interest: "0% Interest", desc: ["Longer terms", "Smaller payments"], popular: false },
];

const steps = [
  { icon: ShoppingBag, title: "Shop", desc: "Choose the products you love" },
  { icon: CreditCard, title: "Choose Plan", desc: "Select a payment plan that suits you" },
  { icon: FileCheck, title: "Quick Approval", desc: "Get approved in seconds" },
  { icon: Package, title: "Enjoy", desc: "Receive your products and pay easy" },
];

const getNowProducts = [
  { id: "p1", name: "iPhone 15 Pro Max", specs: "256GB | Titanium", price: 1099.00, mo: 91.58, image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80" },
  { id: "p2", name: "MacBook Air M2", specs: "13-inch | 512GB", price: 1249.00, mo: 104.08, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80" },
  { id: "p3", name: "Sony WH-1000XM5", specs: "Wireless Headphones", price: 349.00, mo: 29.08, image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80" },
  { id: "p4", name: "Apple Watch Series 9", specs: "45mm | GPS", price: 399.00, mo: 33.25, image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&q=80" },
];

export default function GetNowPage() {
  const [selectedPlan, setSelectedPlan] = useState(0);
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 pb-28">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-foreground">Get Now</h1>
          <p className="text-muted-foreground text-xs mt-1 leading-5">
            Buy now, pay in easy installments<br />Simple. Flexible. Hassle-free.
          </p>
        </div>
        <div className="bg-foreground rounded-2xl px-4 py-3 flex items-center gap-2 cursor-pointer min-w-[155px]">
          <div className="flex-1">
            <p className="text-[10px] text-white/40 mb-0.5">Available Credit</p>
            <p className="text-xl font-black text-primary leading-tight">$2,450.00</p>
            <p className="text-[10px] text-white/40">of $3,000.00</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0" />
        </div>
      </div>

      {/* Hero Banner */}
      <div className="rounded-2xl overflow-hidden mb-6 bg-[#EDF7F5] relative">
        <div className="flex items-center p-5 gap-3">
          <div className="flex-1 z-10">
            <h2 className="text-[22px] font-black text-foreground leading-tight">Shop Now.</h2>
            <h2 className="text-[22px] font-black text-primary leading-tight mb-3">Pay Later.</h2>
            <p className="text-xs text-muted-foreground mb-0.5">0% interest on select plans</p>
            <p className="text-xs text-muted-foreground mb-4">Easy monthly payments</p>
            <Link href="/shop">
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary/90 transition-all">
                How It Works <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
          {/* Right side product collage */}
          <div className="relative flex-shrink-0 w-40 h-36">
            <div className="absolute right-0 top-0 w-24 h-24 rounded-2xl overflow-hidden shadow-lg">
              <img src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&q=80" alt="iPhone" className="w-full h-full object-cover" />
            </div>
            <div className="absolute left-0 top-5 w-14 h-14 rounded-xl overflow-hidden bg-white shadow-md">
              <img src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=200&q=80" alt="Sony" className="w-full h-full object-cover" />
            </div>
            <div className="absolute right-3 bottom-0 w-14 h-14 rounded-xl overflow-hidden bg-white shadow-md">
              <img src="https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200&q=80" alt="Watch" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-0 right-0 -translate-y-1 translate-x-1 bg-white rounded-lg px-2 py-1 shadow-sm flex items-center gap-1 border border-border">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[8px] font-bold text-foreground">Instant Approval</span>
            </div>
            <div className="absolute bottom-2 left-0 bg-white rounded-lg px-2 py-1 shadow-sm flex items-center gap-1 border border-border">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[8px] font-bold text-foreground">0% Interest</span>
            </div>
          </div>
        </div>
      </div>

      {/* How Get Now Works */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-foreground mb-4">How Get Now Works</h2>
        <div className="flex items-start">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center text-center flex-1 min-w-0 px-0.5">
                  <div className="w-10 h-10 rounded-xl border border-border bg-card flex items-center justify-center mb-2 shadow-sm">
                    <Icon className="w-4.5 h-4.5 text-primary" strokeWidth={1.5} style={{ width: 18, height: 18 }} />
                  </div>
                  <p className="text-[9px] font-bold text-foreground leading-tight mb-0.5">{i + 1}. {step.title}</p>
                  <p className="text-[8px] text-muted-foreground leading-tight">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-muted-foreground/50 flex-shrink-0 mb-5" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Popular On Get Now */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">Popular On Get Now</h2>
          <Link href="/shop">
            <span className="text-xs text-primary font-semibold cursor-pointer">View All</span>
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
          {getNowProducts.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex-shrink-0 w-[148px]"
            >
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="relative">
                  <span className="absolute top-2 left-2 z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/20">
                    0% Interest
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
                  <p className="text-sm font-black text-foreground leading-tight">${p.price.toFixed(2)}</p>
                  <p className="text-[9px] text-muted-foreground mb-2">or ${p.mo.toFixed(2)}/mo for 12 mos</p>
                  <button className="w-full py-1.5 bg-foreground text-background rounded-lg text-[10px] font-bold hover:opacity-90 transition-all">
                    Get Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Choose Your Plan */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-foreground mb-4">Choose Your Plan</h2>
        <div className="flex gap-2">
          {plans.map((plan, i) => (
            <button
              key={plan.months}
              onClick={() => setSelectedPlan(i)}
              className={`relative flex-1 p-2.5 rounded-2xl border-2 text-left transition-all ${
                selectedPlan === i
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[8px] font-bold px-1.5 py-0.5 bg-primary text-white rounded-full whitespace-nowrap">
                  Most Popular
                </span>
              )}
              <p className="text-2xl font-black text-foreground leading-none">{plan.months}</p>
              <p className="text-[9px] text-muted-foreground mb-1.5">Months</p>
              <p className="text-[9px] font-bold text-green-600 mb-1">{plan.interest}</p>
              {plan.desc.map((line) => (
                <p key={line} className="text-[8px] text-muted-foreground leading-snug">{line}</p>
              ))}
            </button>
          ))}
        </div>
      </div>

      {/* Safe Secure Trusted */}
      <div className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4 cursor-pointer hover:border-primary/30 transition-colors">
        <ShieldCheck className="w-6 h-6 text-primary flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs font-bold text-foreground">Safe, Secure & Trusted</p>
          <p className="text-[10px] text-muted-foreground leading-snug">Your information is protected with industry-standard security.</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </div>
    </div>
  );
}
