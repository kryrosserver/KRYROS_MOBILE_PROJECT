"use client"

import { MessageCircle, X } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [userMessage, setUserMessage] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  const whatsappNumber = "260966423719" // Support number
  const defaultMessage = "Hello Kryros, I'm interested in learning more about your products and credit plans."

  const handleChat = () => {
    const finalMessage = userMessage.trim() || defaultMessage
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(finalMessage)}`, '_blank')
    setIsOpen(false)
    setUserMessage("")
  }

  return (
    <div className="fixed bottom-24 right-6 z-[100] flex flex-col items-end gap-4 md:bottom-8 md:right-8">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-6 w-[320px] mb-2 overflow-hidden"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-green-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-green-100">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">Kryros Support</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Online Now</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-xs text-slate-600 font-bold leading-relaxed">
                  How can we help you with today? 👋
                </p>
              </div>

              <div className="relative">
                <textarea
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full min-h-[100px] p-4 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all resize-none"
                />
              </div>

              <button 
                onClick={handleChat}
                className="w-full h-14 bg-green-500 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl flex items-center justify-center gap-3 hover:bg-green-600 transition-all shadow-xl shadow-green-100 active:scale-95"
              >
                Send to WhatsApp
                <MessageCircle className="h-4 w-4" />
              </button>
            </div>
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
              className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-100 whitespace-nowrap"
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Chat with us!</p>
              </div>
              <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-r border-t border-slate-100 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`h-16 w-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-90 ${
            isOpen ? 'bg-slate-900 text-white rotate-90' : 'bg-green-500 text-white shadow-green-100'
          }`}
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-8 w-8" />}
        </button>
      </div>
    </div>
  )
}
