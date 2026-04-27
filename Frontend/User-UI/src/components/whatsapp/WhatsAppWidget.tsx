"use client"

import { MessageCircle, X, Send } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [userMessage, setUserMessage] = useState("")
  const [isPumping, setIsPumping] = useState(false)

  const primaryColor = "#1FA89A"
  const whatsappNumber = "260966423719" // Support number

  useEffect(() => {
    // Check if we already showed the auto-popup
    const hasSeenPopup = localStorage.getItem("kryros_wa_popup_seen")
    
    if (!hasSeenPopup) {
      // Start pumping animation
      setIsPumping(true)
      
      // Stop pumping after 3 pumps (approx 3 seconds) and open chat
      const timer = setTimeout(() => {
        setIsPumping(false)
        setIsOpen(true)
        localStorage.setItem("kryros_wa_popup_seen", "true")
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [])

  const handleChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalMessage = userMessage.trim() || "Hi! Can I help you find the right solution?"
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(finalMessage)}`, '_blank')
    setIsOpen(false)
    setUserMessage("")
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes wa-pump {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(31, 168, 154, 0.7); }
          50% { transform: scale(1.15); box-shadow: 0 0 0 20px rgba(31, 168, 154, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(31, 168, 154, 0); }
        }
        .animate-wa-pump {
          animation: wa-pump 1s ease-in-out 3;
        }
      `}} />
      
      <div className="fixed bottom-24 right-6 z-[100] flex flex-col items-end gap-4 md:bottom-8 md:right-8">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20, originX: 1, originY: 1 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 w-[320px] sm:w-[360px] mb-2 relative"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="mb-5 pr-8">
                <p className="text-slate-700 text-[17px] font-medium leading-snug">
                  Hi! Can I help you find the right solution?
                </p>
              </div>
              
              <form onSubmit={handleChat} className="flex items-center gap-3">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 h-12 px-4 border border-slate-600/30 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1FA89A] focus:ring-1 focus:ring-[#1FA89A] transition-all"
                  autoFocus
                />
                <button
                  type="submit"
                  className="h-12 w-12 shrink-0 rounded-full flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95 shadow-md"
                  style={{ backgroundColor: primaryColor }}
                  aria-label="Send message"
                >
                  <Send className="h-[18px] w-[18px] ml-0.5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`h-16 w-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-90 text-white ${isPumping && !isOpen ? 'animate-wa-pump' : ''}`}
          style={{ backgroundColor: isOpen ? '#0f172a' : primaryColor }}
          aria-label={isOpen ? "Close chat widget" : "Open chat widget"}
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-8 w-8" />}
        </button>
      </div>
    </>
  )
}
