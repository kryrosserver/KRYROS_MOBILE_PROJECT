"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Send, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cmsApi } from "@/lib/api";

export function NewsletterPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    // Fetch newsletter config from admin
    cmsApi.getFooterConfig().then(res => {
      if (res.data && res.data.newsletterPopupEnabled) {
        setConfig(res.data);
        
        // Check if user has already dismissed or subscribed
        const hasSeenPopup = localStorage.getItem("kryros_newsletter_seen");
        
        if (!hasSeenPopup) {
          // Show popup after configured delay
          const timer = setTimeout(() => {
            setIsVisible(true);
          }, res.data.newsletterPopupDelay || 3000);
          return () => clearTimeout(timer);
        }
      }
    });
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Don't show again for 24 hours if closed without subscribing
    const expiry = new Date().getTime() + 24 * 60 * 60 * 1000;
    localStorage.setItem("kryros_newsletter_seen", expiry.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setIsSubscribed(true);
      // If subscribed, don't show again for 30 days
      const expiry = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem("kryros_newsletter_seen", expiry.toString());
      
      // Close after 2 seconds of showing success message
      setTimeout(() => {
        setIsVisible(false);
      }, 2500);
    } catch (error) {
      console.error("Subscription failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-[500px] overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col">
              {/* Image Section */}
              <div className="relative h-48 w-full bg-gradient-to-br from-kryros-primary to-blue-900 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                   <Mail className="h-32 w-32 text-white" />
                </div>
                <Image
                  src={config?.newsletterPopupImage || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1000&auto=format&fit=crop"}
                  alt="Newsletter"
                  fill
                  className="object-cover mix-blend-overlay"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                   <div className="bg-kryros-accent/20 backdrop-blur-md px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 border border-white/10">
                      KRYROS EXCLUSIVE
                   </div>
                   <h3 className="text-2xl font-black tracking-tight">{config?.newsletterPopupTitle || "Unlock Premium Deals"}</h3>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-8 text-center">
                {!isSubscribed ? (
                  <>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                      {config?.newsletterPopupSubtitle || (
                        <>Join our community and be the first to know about <span className="text-kryros-primary font-bold">new arrivals</span>, flash sales, and tech guides.</>
                      )}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 pl-12 rounded-xl border-slate-200 focus:ring-kryros-primary focus:border-kryros-primary"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full h-12 rounded-xl bg-kryros-primary hover:bg-kryros-primary/90 text-white font-bold text-lg shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
                      >
                        {isLoading ? (
                          <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Subscribe Now
                            <Send className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>

                    <p className="mt-6 text-[11px] text-slate-400">
                      *By subscribing, you agree to our Terms & Conditions and Privacy Policy. 
                      You can unsubscribe at any time.
                    </p>
                  </>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-8"
                  >
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-slate-900 mb-2">You're on the list!</h4>
                    <p className="text-slate-600">
                      Welcome to KRYROS. Check your inbox soon for your exclusive welcome offer.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
