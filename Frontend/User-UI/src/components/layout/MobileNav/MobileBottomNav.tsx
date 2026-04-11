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
      className={`fixed bottom-0 left-0 right-0 z-[100] h-14 bg-white/98 backdrop-blur-lg md:hidden flex items-center justify-around px-0.5 pb-safe border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] overflow-hidden transition-transform duration-300 ease-in-out ${
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
            className={`relative flex flex-1 flex-col items-center justify-center min-w-0 h-full py-1 transition-all duration-300 ${
              isActive ? "text-primary scale-105" : "text-slate-500 hover:text-primary"
            }`}
          >
            <div className="relative flex-shrink-0 flex items-center justify-center mb-0.5">
              <Icon className={`h-4.5 w-4.5 ${isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
              {badge > 0 && (
                <span className="absolute -top-1 -right-2 flex h-3.5 min-w-[14px] px-0.5 items-center justify-center rounded-full bg-primary text-[7px] font-bold text-white border border-white shadow-sm">
                  {badge}
                </span>
              )}
            </div>
            <span className={`text-[8px] font-bold uppercase tracking-tighter truncate w-full text-center px-0.5 transition-all ${isActive ? "opacity-100" : "opacity-90"}`}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
