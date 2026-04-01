"use client"

import { Clock, Wallet, Percent, ShieldCheck, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CreditSection() {
  const benefits = [
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Quick Approval",
      desc: "Get approved in 24 hours"
    },
    {
      icon: <Percent className="h-6 w-6" />,
      title: "Low Interest",
      desc: "Affordable monthly plans"
    },
    {
      icon: <Wallet className="h-6 w-6" />,
      title: "0% Deposit",
      desc: "For selected customers"
    }
  ]

  return (
    <section className="py-12 md:py-24 bg-[#0a1121] text-white overflow-hidden relative">
      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 md:gap-16 items-center">
          
          {/* Left Side: Content & Small Cards */}
          <div className="lg:col-span-7 space-y-8 md:space-y-12">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tight leading-[0.9] md:leading-[1]">
                Get the Tech You <br />
                <span className="text-primary">Want</span>, Pay Later.
              </h2>
              <p className="text-base md:text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
                Our flexible credit plans allow you to own the latest mobile technology 
                with manageable monthly installments.
              </p>
            </div>
            
            {/* Benefits Cards - Horizontal Scroll on Mobile */}
            <div className="-mx-5 md:mx-0 overflow-x-auto flex md:grid md:grid-cols-3 gap-4 px-5 md:px-0 scrollbar-hide snap-x snap-mandatory">
              {benefits.map((b, i) => (
                <div key={i} className="min-w-[180px] md:min-w-0 flex-shrink-0 space-y-4 p-6 md:p-8 rounded-[1.5rem] bg-white/5 border border-white/10 snap-start hover:bg-white/[0.08] transition-colors">
                  <div className="text-primary">{b.icon}</div>
                  <div className="space-y-1">
                    <h4 className="text-[10px] md:text-xs font-black uppercase tracking-tight">{b.title}</h4>
                    <p className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-tight">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/credit">
                <Button className="h-14 px-10 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-2xl shadow-primary/20 rounded-xl">
                  Apply Now <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/about" className="hidden md:block">
                <Button variant="outline" className="h-14 px-10 font-black uppercase tracking-widest border-white/10 hover:bg-white/5 rounded-xl">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Side: Large Feature Card */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white/5 p-4 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/10 relative z-10 shadow-2xl">
              <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2rem] md:rounded-[3rem] p-10 md:p-16 flex flex-col justify-center border border-white/5 relative overflow-hidden min-h-[400px]">
                <div className="relative z-10 space-y-8">
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl md:rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40">
                    <ShieldCheck className="h-8 w-8 md:h-10 md:w-10 text-white" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight">Secure & <br />Transparent</h3>
                    <p className="text-slate-400 text-sm md:text-lg font-medium leading-relaxed max-w-xs">
                      No hidden fees, no surprises. Just straightforward financing for your next upgrade.
                    </p>
                  </div>
                </div>
                {/* Decorative Glow */}
                <div className="absolute -bottom-10 -right-10 h-64 w-64 bg-primary/20 rounded-full blur-[80px]" />
                <div className="absolute -top-10 -left-10 h-40 w-40 bg-blue-500/10 rounded-full blur-[60px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
