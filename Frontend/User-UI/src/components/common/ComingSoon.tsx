"use client"

import { Clock, Send, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export function ComingSoon() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center space-y-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
            Coming Soon
          </div>
          
          <div className="space-y-6">
            <h1 className="text-4xl md:text-7xl font-black text-slate-900 uppercase tracking-tight leading-[0.95]">
              Something <span className="text-primary">Exciting</span> is Building.
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl mx-auto">
              We're working hard to bring you the best global technology experience across the globe. 
              This feature will be available very soon.
            </p>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center justify-center gap-4">
              <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">Stay Notified</h3>
                <p className="text-sm text-slate-500 font-medium">Be the first to know when we launch.</p>
              </div>
            </div>

            <form className="flex flex-col md:flex-row gap-4">
              <Input 
                placeholder="Enter your email address" 
                className="h-14 bg-slate-50 border-none rounded-2xl px-6 font-medium flex-1"
              />
              <Button className="h-14 px-10 font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20">
                Notify Me <Send className="h-4 w-4 ml-2" />
              </Button>
            </form>
          </div>

          <div className="pt-8">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all">
              <ArrowRight className="h-4 w-4 rotate-180" /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
