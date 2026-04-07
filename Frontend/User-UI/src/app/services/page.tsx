"use client"

import { Smartphone, PenTool, ShieldCheck, Zap, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ServicesPage() {
  const services = [
    {
      title: "Screen Replacement",
      description: "Quick and high-quality screen repairs for all major smartphone and tablet brands.",
      icon: <Smartphone className="h-6 w-6 text-primary" />
    },
    {
      title: "Battery Upgrades",
      description: "Extend your device's life with original battery replacements and performance optimization.",
      icon: <Zap className="h-6 w-6 text-primary" />
    },
    {
      title: "Software Diagnostics",
      description: "Fixing software glitches, data recovery, and system updates to keep your device smooth.",
      icon: <PenTool className="h-6 w-6 text-primary" />
    },
    {
      title: "Extended Warranty",
      description: "Protect your tech beyond the standard period with our flexible warranty extensions.",
      icon: <ShieldCheck className="h-6 w-6 text-primary" />
    }
  ]

  return (
    <main className="min-h-screen bg-slate-50 py-12 md:py-24">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto space-y-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-7xl font-black text-slate-900 uppercase tracking-tight leading-[0.95]">
                Professional <span className="text-primary">Tech Services</span>
              </h1>
              <p className="mt-8 text-xl text-slate-500 font-medium leading-relaxed">
                Beyond selling premium devices, we provide expert maintenance and support 
                to ensure your technology stays at its peak performance.
              </p>
            </div>
            <Link href="/contact">
              <Button className="h-14 px-10 font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                Book a Service
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((s, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-md transition-all">
                <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-colors">
                  {s.icon}
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-4">{s.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed mb-8">{s.description}</p>
                <Link href="/contact" className="text-primary font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:underline">
                  Inquire Now <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>

          <div className="bg-primary p-12 md:p-20 rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-12 shadow-2xl shadow-primary/30 overflow-hidden relative">
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight max-w-md leading-tight">Expert Technicians Ready to Help</h2>
              <p className="text-primary-foreground/80 font-medium max-w-sm">Our certified experts have years of experience handling premium global technology.</p>
              <Button variant="secondary" className="h-12 px-8 font-black uppercase tracking-widest text-primary">
                Learn More
              </Button>
            </div>
            <div className="h-64 w-64 bg-white/10 rounded-full blur-3xl absolute top-0 right-0 -mr-20 -mt-20" />
          </div>
        </div>
      </div>
    </main>
  )
}
