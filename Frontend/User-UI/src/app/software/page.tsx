"use client"

import { Laptop, Code, Cloud, Lock, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SoftwarePage() {
  const solutions = [
    {
      title: "Inventory Management",
      description: "Cloud-based tracking for retail businesses to manage stock levels in real-time.",
      icon: <Cloud className="h-6 w-6 text-primary" />
    },
    {
      title: "Custom Web Apps",
      description: "Tailored digital solutions built to solve your specific business challenges.",
      icon: <Code className="h-6 w-6 text-primary" />
    },
    {
      title: "POS Systems",
      description: "Modern point-of-sale software optimized for Zambian retail environments.",
      icon: <Laptop className="h-6 w-6 text-primary" />
    },
    {
      title: "Enterprise Security",
      description: "Advanced cybersecurity implementation to protect your business data.",
      icon: <Lock className="h-6 w-6 text-primary" />
    }
  ]

  return (
    <main className="min-h-screen bg-slate-50 py-12 md:py-24">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto space-y-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                Digital Solutions
              </div>
              <h1 className="text-4xl md:text-7xl font-black text-slate-900 uppercase tracking-tight leading-[0.95]">
                Empowering Your <span className="text-primary">Business</span>
              </h1>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                At Kryros, we don't just provide hardware. We build the software that 
                drives modern Zambian enterprises forward.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact">
                  <Button className="h-14 px-10 font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                    Get a Quote
                  </Button>
                </Link>
                <Button variant="outline" className="h-14 px-10 font-black uppercase tracking-widest border-2">
                  View Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-primary/20 rounded-full absolute -top-10 -right-10 blur-3xl animate-pulse" />
              <div className="bg-white p-4 rounded-[3rem] border border-slate-100 shadow-sm relative z-10">
                <div className="bg-slate-900 rounded-[2.5rem] p-12 aspect-square flex flex-col justify-center border border-white/5">
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-4 items-center p-4 rounded-2xl bg-white/5 border border-white/10">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <div className="h-2 w-32 bg-white/10 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {solutions.map((s, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  {s.icon}
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 mb-3">{s.title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-white p-12 md:p-20 rounded-[3rem] border border-slate-100 shadow-sm text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-slate-900">Custom Development</h2>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              Need something unique? Our engineering team specializes in building 
              custom software tailored to your specific operational needs.
            </p>
            <Link href="/contact" className="inline-block">
              <Button variant="ghost" className="text-primary font-black uppercase tracking-widest text-sm flex items-center gap-2">
                Talk to our Engineers <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
