"use client"

import { ShieldCheck, RefreshCcw, Truck, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ReturnsPage() {
  const policies = [
    {
      title: "7-Day Return Policy",
      description: "If you're not satisfied with your purchase, you can return it within 7 days for a full refund or exchange.",
      icon: <RefreshCcw className="h-6 w-6 text-primary" />
    },
    {
      title: "Original Condition",
      description: "Products must be returned in their original packaging, with all accessories and proof of purchase.",
      icon: <ShieldCheck className="h-6 w-6 text-primary" />
    },
    {
      title: "Easy Collection",
      description: "We'll arrange a courier to collect the item from your doorstep at your convenience.",
      icon: <Truck className="h-6 w-6 text-primary" />
    }
  ]

  return (
    <main className="min-h-screen bg-slate-50 py-12 md:py-24">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tight">
              Returns & <span className="text-primary">Refunds</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              We want you to be completely satisfied with your purchase. If things don't work out, 
              our return process is simple and transparent.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {policies.map((p, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  {p.icon}
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 mb-3">{p.title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-10 md:p-16 text-white text-center space-y-8">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Need to return an item?</h2>
            <p className="text-slate-400 font-medium max-w-xl mx-auto">
              Start your return process by contacting our support team with your order number and reason for return.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <Button className="h-14 px-10 font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                  Contact Support
                </Button>
              </Link>
              <Button variant="outline" className="h-14 px-10 font-black uppercase tracking-widest border-white/20 hover:bg-white/5">
                <MessageCircle className="h-5 w-5 mr-2" /> WhatsApp Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
