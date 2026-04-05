"use client"

import { Home, Store, ShoppingBag, User, MapPin } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCart } from "@/providers/CartProvider"
import { useState, useEffect } from "react"

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { getItemCount } = useCart()
  const cartCount = getItemCount()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY
        
        // Only trigger hide/show logic if we've scrolled more than a small threshold
        // to prevent flickering on tiny movements
        if (Math.abs(currentScrollY - lastScrollY) < 5) return

        if (currentScrollY < 50) {
          setIsVisible(true)
        } else if (currentScrollY > lastScrollY) {
          // Scrolling down
          setIsVisible(false)
        } else {
          // Scrolling up
          setIsVisible(true)
        }
        
        setLastScrollY(currentScrollY)
      }
    }

    window.addEventListener('scroll', controlNavbar, { passive: true })
    return () => {
      window.removeEventListener('scroll', controlNavbar)
    }
  }, [lastScrollY])

  const navItems = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Shop", icon: Store, href: "/shop" },
    { label: "Cart", icon: ShoppingBag, href: "/cart", badge: cartCount },
    { label: "Account", icon: User, href: "/dashboard" },
    { label: "Track", icon: MapPin, href: "/track" },
  ] as const;

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-[100] h-16 bg-white/95 backdrop-blur-md md:hidden flex items-center justify-around px-2 pb-safe border-t border-slate-100 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        const badge = "badge" in item ? item.badge : 0;

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`relative flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all duration-300 ${
              isActive ? "text-primary scale-105" : "text-black hover:text-primary"
            }`}
          >
            <div className="relative">
              <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
              {badge > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-primary text-[8px] font-black text-white border-2 border-white">
                  {badge}
                </span>
              )}
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest transition-opacity ${isActive ? "opacity-100" : "opacity-70"}`}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
