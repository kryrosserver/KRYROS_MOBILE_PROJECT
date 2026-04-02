"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Clock, CheckCircle2, ArrowRight, Wallet, Percent, Sparkles } from "lucide-react"
import Link from "next/link"
import { productsApi } from "@/lib/api"
import { ProductCard } from "@/components/home/ProductCard"

export default function CreditPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productsApi.getAll({ 
      take: 20, 
      allowCredit: true,
      isWholesaleOnly: false 
    }).then(res => {
      if (res.data) {
        const productList = (res.data as any).data || (Array.isArray(res.data) ? res.data : []);
        setProducts(productList)
      }
      setLoading(false)
    })
  }, [])
  const features = [
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Quick Approval",
      description: "Get approved for a credit plan in as little as 24 hours with minimal documentation."
    },
    {
      icon: <Percent className="h-6 w-6 text-primary" />,
      title: "Low Interest",
      description: "Enjoy competitive interest rates that make premium tech affordable for everyone."
    },
    {
      icon: <Wallet className="h-6 w-6 text-primary" />,
      title: "Flexible Terms",
      description: "Choose from 3, 6, or 12-month payment plans that fit your monthly budget."
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      title: "Secure & Transparent",
      description: "No hidden fees or surprise charges. We believe in clear and honest financing."
    }
  ]

  const steps = [
    "Select your desired product",
    "Choose 'Buy on Credit' at checkout",
    "Complete the simple application form",
    "Receive approval and get your device"
  ]

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-white py-20 border-b border-slate-100">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-7xl font-black text-slate-900 uppercase tracking-tight leading-[0.95]">
              Get the Tech You <span className="text-primary">Want</span>, Pay Later.
            </h1>
            <p className="mt-8 text-xl text-slate-500 font-medium leading-relaxed">
              Kryros Credit makes it easier than ever to own the latest mobile technology. 
              Break down your payments into manageable monthly installments.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/credit/apply">
                <Button className="h-14 px-10 font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                  Apply Now <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/shop">
                <Button variant="outline" className="h-14 px-10 font-black uppercase tracking-widest border-2">
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-8">How It Works</h2>
              <div className="space-y-6">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-6 items-center">
                    <div className="h-10 w-10 rounded-full bg-primary text-white font-black flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-lg font-bold text-slate-300">{step}</p>
                  </div>
                ))}
              </div>
              <div className="mt-12 p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4 text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                  <h4 className="font-black uppercase tracking-widest text-sm">Requirements</h4>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-400 font-medium">
                  <li className="flex items-center gap-2">• Valid ID Document</li>
                  <li className="flex items-center gap-2">• Proof of Income</li>
                  <li className="flex items-center gap-2">• 3 Months Bank Statement</li>
                  <li className="flex items-center gap-2">• Active Mobile Money</li>
                </ul>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-primary/20 rounded-full absolute -top-20 -right-20 blur-3xl animate-pulse" />
              <div className="bg-white/5 p-4 rounded-[3rem] border border-white/10 relative z-10">
                <div className="bg-slate-800 rounded-[2.5rem] p-12 aspect-square flex flex-col justify-center items-center text-center border border-white/5">
                  <div className="h-20 w-20 rounded-3xl bg-primary flex items-center justify-center mb-8 shadow-2xl shadow-primary/40">
                    <Percent className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-4xl font-black uppercase tracking-tight mb-4">0% Deposit</h3>
                  <p className="text-slate-400 font-medium max-w-xs">Available for selected loyal customers and payroll schemes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credit Products Listing */}
      <section className="py-24 border-b border-slate-100">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">Available Now</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tight">Products on <span className="text-primary">Credit</span></h2>
              <p className="mt-4 text-slate-500 font-medium text-lg">Browse our latest collection available for flexible payment plans.</p>
            </div>
            <Link href="/shop?allowCredit=true">
              <Button variant="ghost" className="font-black uppercase tracking-widest text-xs hover:bg-slate-100 px-6 h-12">
                View All <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-slate-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-20 rounded-[3rem] text-center border border-dashed border-slate-200">
              <p className="text-slate-400 font-bold uppercase tracking-widest">No credit products found at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 text-center">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tight">Ready to Upgrade?</h2>
            <p className="text-lg text-slate-500 font-medium">Join thousands of Zambians who trust Kryros for their technology needs.</p>
            <Link href="/credit/apply">
              <Button className="h-16 px-12 font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/20 text-lg">
                Start My Application
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
