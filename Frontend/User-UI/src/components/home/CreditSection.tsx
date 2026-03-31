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
    <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
              Financing Solutions
            </div>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.95]">
              Get the Tech You <span className="text-primary">Want</span>, Pay Later.
            </h2>
            <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-md">
              Our flexible credit plans allow you to own the latest mobile technology 
              with manageable monthly installments.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {benefits.map((b, i) => (
                <div key={i} className="space-y-3 p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-primary">{b.icon}</div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-tight">{b.title}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/credit">
                <Button className="h-14 px-10 font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                  Apply Now <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" className="h-14 px-10 font-black uppercase tracking-widest border-white/10 hover:bg-white/5">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square bg-primary/20 rounded-full absolute -top-20 -right-20 blur-3xl animate-pulse" />
            <div className="bg-white/5 p-4 rounded-[3rem] border border-white/10 relative z-10">
              <div className="bg-slate-800 rounded-[2.5rem] p-12 aspect-square flex flex-col justify-center border border-white/5 relative overflow-hidden">
                <div className="relative z-10 space-y-6">
                  <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mb-8 shadow-2xl shadow-primary/40">
                    <ShieldCheck className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-tight">Secure & Transparent</h3>
                  <p className="text-slate-400 font-medium leading-relaxed">
                    No hidden fees, no surprises. Just straightforward financing for your next upgrade.
                  </p>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-primary/10 rounded-full blur-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
