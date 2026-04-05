"use client"

import { Clock, Wallet, Percent, ShieldCheck, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CreditSection({ section }: { section?: any }) {
  const benefits = [
    {
      icon: <Clock className="h-5 w-5 md:h-6 md:w-6" />,
      title: "Quick Approval",
      desc: "Get approved in 24 hours"
    },
    {
      icon: <Percent className="h-5 w-5 md:h-6 md:w-6" />,
      title: "Low Interest",
      desc: "Affordable monthly plans"
    },
    {
      icon: <Wallet className="h-5 w-5 md:h-6 md:w-6" />,
      title: "0% Deposit",
      desc: "For selected customers"
    }
  ]

  return (
    <section 
      className="py-12 md:py-24 text-white overflow-hidden relative"
      style={{ backgroundColor: section?.backgroundColor || '#0a1121' }}
    >
      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 md:gap-16 items-start">
          
          {/* Main Content Area */}
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-6">
              <h2 className="text-[32px] md:text-7xl font-black uppercase tracking-tight leading-[1.05] md:leading-[1]">
                {section?.title || "Get the Tech You Want, Pay Later."}
              </h2>
              <p className="text-sm md:text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
                {section?.subtitle || "Our flexible credit plans allow you to own the latest mobile technology with manageable monthly installments."}
              </p>
            </div>
            
            {/* Benefits Cards: Side-by-Side on Mobile (Grid-cols-3) */}
            <div className="grid grid-cols-3 gap-3 md:gap-6">
              {benefits.map((b, i) => (
                <div key={i} className="flex flex-col space-y-4 p-4 md:p-8 rounded-[1rem] md:rounded-[1.5rem] bg-[#151d2e] border border-white/5 hover:bg-white/[0.05] transition-colors shadow-sm">
                  <div className="text-primary">{b.icon}</div>
                  <div className="space-y-1">
                    <h4 className="text-[9px] md:text-xs font-black uppercase tracking-tight leading-tight">{b.title}</h4>
                    <p className="text-[7px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-tight">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-row items-center gap-4">
              <Link href="/credit">
                <Button className="h-12 md:h-16 px-8 md:px-12 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs md:text-sm rounded-lg md:rounded-xl shadow-2xl shadow-primary/20 flex items-center gap-2 group">
                  Apply Now <ArrowRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" className="h-12 md:h-16 px-6 md:px-10 border-white/20 text-white hover:bg-white/10 font-black uppercase tracking-widest text-xs md:text-sm rounded-lg md:rounded-xl bg-transparent">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Featured Large Box Area */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-[#151d2e] rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 flex flex-col justify-center border border-white/5 relative overflow-hidden min-h-[300px] md:min-h-[450px] shadow-2xl">
              <div className="relative z-10 space-y-8">
                <div className="h-14 w-14 md:h-20 md:w-20 rounded-xl md:rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40">
                  <ShieldCheck className="h-7 w-7 md:h-10 md:w-10 text-white" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight">Secure & <br />Transparent</h3>
                  <p className="text-slate-400 text-sm md:text-lg font-medium leading-relaxed max-w-xs opacity-80">
                    No hidden fees, no surprises. Just straightforward financing for your next upgrade.
                  </p>
                </div>
              </div>
              {/* Subtle Decorative Elements to match reference style */}
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
