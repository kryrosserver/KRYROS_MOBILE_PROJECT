"use client"

import { MessageCircle, X } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  const whatsappNumber = "+260971234567" // Support number
  const message = "Hello Kryros, I'm interested in learning more about your products and credit plans."

  const handleChat = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-6 w-[320px] mb-2"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-green-500 flex items-center justify-center text-white shrink-0">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">Kryros Support</h4>
                <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Online Now</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
              Hello! 👋 How can we help you today? Chat with our team for quick support.
            </p>

            <button 
              onClick={handleChat}
              className="w-full h-12 bg-green-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 hover:bg-green-600 transition-all shadow-lg shadow-green-100"
            >
              Start WhatsApp Chat
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <AnimatePresence>
          {showNotification && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white px-4 py-2 rounded-xl shadow-xl border border-slate-100 whitespace-nowrap hidden md:block"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Chat with us!</p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`h-16 w-16 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-500 ${isOpen ? 'bg-slate-900 text-white' : 'bg-green-500 text-white'}`}
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-8 w-8" />}
        </button>
      </div>
    </div>
  )
}
