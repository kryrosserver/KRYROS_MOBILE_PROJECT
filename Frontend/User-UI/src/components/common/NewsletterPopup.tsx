"use client"

import { useState, useEffect } from "react"
import { X, Mail, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function NewsletterPopup() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const hasSeen = localStorage.getItem("newsletter_seen")
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem("newsletter_seen", "true")
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden"
          >
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col md:flex-row h-full">
              <div className="p-10 md:p-16 space-y-8 w-full">
                <div className="space-y-4 text-center">
                  <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">Join the <span className="text-primary">Kryros</span> Community</h2>
                  <p className="text-sm text-slate-500 font-medium">Get exclusive deals, tech reviews, and early access to flash sales delivered to your inbox.</p>
                </div>

                <form className="space-y-4">
                  <Input 
                    placeholder="Enter your email" 
                    className="h-14 bg-slate-50 border-none rounded-2xl px-6 font-medium text-center"
                  />
                  <Button className="w-full h-14 font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20">
                    Subscribe Now <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </form>

                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                  By subscribing, you agree to our Terms and Privacy Policy.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
