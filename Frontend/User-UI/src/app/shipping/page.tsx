"use client"

import { Truck, Clock, ShieldCheck, MapPin, MessageCircle, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ShippingPage() {
  const deliveryOptions = [
    {
      title: "Standard Delivery",
      description: "2-3 business days within Lusaka and Copperbelt regions.",
      time: "2-3 Days",
      price: "K50.00",
      icon: <Truck className="h-6 w-6 text-primary" />
    },
    {
      title: "Express Shipping",
      description: "Next-day delivery for orders placed before 12:00 PM.",
      time: "Next Day",
      price: "K120.00",
      icon: <Clock className="h-6 w-6 text-primary" />
    },
    {
      title: "Countrywide Shipping",
      description: "3-5 business days for deliveries to other provinces in Zambia.",
      time: "3-5 Days",
      price: "K150.00",
      icon: <MapPin className="h-6 w-6 text-primary" />
    }
  ]

  return (
    <main className="min-h-screen bg-slate-50 py-12 md:py-24">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tight leading-tight">
              Fast & Reliable <span className="text-primary">Shipping</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              We deliver your premium tech safely across Zambia. Track your order 
              from our warehouse to your doorstep.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {deliveryOptions.map((option, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-8">
                  {option.icon}
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-4">{option.title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 flex-grow">{option.description}</p>
                <div className="w-full space-y-4 pt-6 border-t border-slate-50">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                    <span>Time</span>
                    <span className="text-slate-900">{option.time}</span>
                  </div>
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                    <span>Cost</span>
                    <span className="text-primary">{option.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-10 md:p-16 rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">Delivery Information</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <ShieldCheck className="h-6 w-6 text-green-500 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">Insured Shipping</p>
                      <p className="text-sm text-slate-500 font-medium">All orders are insured against damage or loss during transit.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Package className="h-6 w-6 text-blue-500 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">Secure Packaging</p>
                      <p className="text-sm text-slate-500 font-medium">We use premium protective packaging for all fragile tech items.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-slate-900 rounded-3xl text-white space-y-6">
                <h3 className="text-xl font-black uppercase tracking-tight">Track Your Order</h3>
                <p className="text-slate-400 font-medium text-sm leading-relaxed">
                  Enter your order number and email on our tracking page to get real-time updates on your delivery status.
                </p>
                <Link href="/track" className="block">
                  <Button className="w-full h-12 font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                    Track Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-10 bg-primary/5 rounded-[2.5rem] border border-primary/10">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Have specific requirements?</h3>
              <p className="text-slate-500 font-medium mt-1">Contact us for custom shipping arrangements or bulk orders.</p>
            </div>
            <Link href="/contact">
              <Button variant="outline" className="h-12 px-8 font-black uppercase tracking-widest border-primary text-primary hover:bg-primary hover:text-white">
                <MessageCircle className="h-5 w-5 mr-2" /> Talk to Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
