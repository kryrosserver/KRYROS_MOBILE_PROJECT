"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e)
      // For debugging/forcing it to show during development/testing
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false)
    }

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Show the prompt
    deferredPrompt.prompt()
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === "accepted") {
      console.log("User accepted the PWA install prompt")
    } else {
      console.log("User dismissed the PWA install prompt")
    }

    // We've used the prompt, and can't use it again
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    sessionStorage.setItem("pwa_dismissed", "true")
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] md:left-auto md:right-8 md:bottom-8 md:w-96 animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="flex gap-4 items-center">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <img src="/logo-pwa.png" alt="Kryros" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Install Kryros App</h3>
              <p className="text-xs text-slate-500 font-medium">Add to your home screen for a better experience</p>
            </div>
          </div>
          <button onClick={handleDismiss} className="p-1 hover:bg-slate-50 rounded-lg transition-colors">
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>
        <Button 
          onClick={handleInstall}
          className="w-full h-11 font-black uppercase tracking-widest text-[10px] gap-2 rounded-xl shadow-lg shadow-primary/20"
        >
          <Download className="h-4 w-4" />
          Install Now
        </Button>
      </div>
    </div>
  )
}
