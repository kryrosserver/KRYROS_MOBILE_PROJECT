"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react"

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 md:py-24">
      <div className="container-custom">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-start">
            {/* Contact Information */}
            <div className="space-y-12">
              <div>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tight leading-tight">
                  Get in <span className="text-primary">Touch</span>
                </h1>
                <p className="mt-6 text-lg text-slate-500 font-medium max-w-md">
                  Have questions about our products or credit plans? Our team is here to help you.
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Call Us</p>
                    <p className="text-lg font-bold text-slate-900">+260 971 234 567</p>
                    <p className="text-sm text-slate-500 font-medium">Mon-Fri, 08:00 - 17:00</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Email Us</p>
                    <p className="text-lg font-bold text-slate-900">info@kryros.com</p>
                    <p className="text-sm text-slate-500 font-medium">We reply within 24 hours</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Visit Us</p>
                    <p className="text-lg font-bold text-slate-900">Lusaka, Zambia</p>
                    <p className="text-sm text-slate-500 font-medium">Central Business District</p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-primary rounded-3xl text-white space-y-4 shadow-xl shadow-primary/20">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-6 w-6" />
                  <h3 className="font-black uppercase tracking-widest text-sm">Live Support</h3>
                </div>
                <p className="font-medium text-primary-foreground/90">Chat with us on WhatsApp for immediate assistance regarding orders or credit applications.</p>
                <Button variant="secondary" className="w-full h-12 font-black uppercase tracking-widest text-primary">
                  Start Chat
                </Button>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">Send a Message</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">First Name</label>
                    <Input placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Last Name</label>
                    <Input placeholder="Doe" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <Input type="email" placeholder="john@example.com" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject</label>
                  <Input placeholder="How can we help?" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Message</label>
                  <Textarea placeholder="Tell us more about your inquiry..." className="min-h-[150px] resize-none" />
                </div>

                <Button className="w-full h-14 font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                  Send Message <Send className="h-4 w-4 ml-2" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
