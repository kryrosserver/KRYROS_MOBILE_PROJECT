"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Truck,
  CreditCard,
  Headset,
} from "lucide-react"
import { Logo } from "./Logo"
import { AuthButtons } from "./AuthButtons"
import { useCart } from "@/providers/CartProvider"
import { wishlistApi, settingsApi, categoriesApi } from "@/lib/api"
import { formatPrice } from "@/lib/utils"

export function TopBar() {
  const [shippingConfig, setShippingConfig] = useState({ fee: 50, threshold: 5000 });

  useEffect(() => {
    settingsApi.getShippingConfig().then(res => {
      if (res.data) setShippingConfig(res.data);
    });
  }, []);

  return (
    <div className="bg-slate-900 text-white md:block hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            +260 966 423 719
          </span>
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            kryrosmobile@gmail.com
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-green-400 font-bold">
            <Truck className="h-3 w-3" />
            Free Shipping Over {formatPrice(shippingConfig.threshold)}
          </span>
        </div>
      </div>
    </div>
  )
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [accountOpen, setAccountOpen] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const accountRef = useRef<HTMLDivElement>(null)
  const { getItemCount } = useCart()
  const [wishlistCount, setWishlistCount] = useState<number>(0)
  const [shippingConfig, setShippingConfig] = useState({ fee: 50, threshold: 5000 });

  useEffect(() => {
    categoriesApi.getAll().then(res => {
      if (res.data) setCategories(res.data.filter((c: any) => c.isActive !== false).slice(0, 5))
    })
  }, [])

  useEffect(() => {
    settingsApi.getShippingConfig().then(res => {
      if (res.data) setShippingConfig(res.data);
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    let active = true
    const refresh = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) { setWishlistCount(0); return }
      wishlistApi.getMine()
        .then(res => {
          if (!active) return
          if (res?.error) { setWishlistCount(0); return }
          setWishlistCount(Array.isArray(res.data) ? res.data.length : 0)
        })
        .catch(() => { if (active) setWishlistCount(0) })
    }
    refresh()
    const handler = () => refresh()
    window.addEventListener('wishlist:changed', handler as any)
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  const suggestions = [
    "iPhone 15 Pro Max",
    "Samsung Galaxy S24",
    "MacBook Pro",
    "iPad Pro",
    "AirPods Pro",
  ].filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 shadow-md backdrop-blur-md"
          : "bg-white border-b border-slate-100"
      }`}
    >
      {/* Mobile Promo Bar - Sticky with Header */}
      <div className="bg-green-600 text-white py-1 px-4 text-center text-[10px] font-bold uppercase tracking-widest md:hidden">
        Free Delivery Over {formatPrice(shippingConfig.threshold)}
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className={`flex items-center justify-between gap-4 transition-all duration-300 ${isScrolled ? 'h-14 lg:h-16' : 'h-16 lg:h-20'}`}>
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Logo size={isScrolled ? 30 : 36} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              href="/"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
            >
              Home
            </Link>
            
            <Link
              href="/shop"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
            >
              Shop
            </Link>

            <Link
              href="/all-products"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
            >
              All Products
            </Link>

            {/* Dynamic Categories */}
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100 capitalize"
              >
                {cat.name}
              </Link>
            ))}

            <Link
              href="/credit"
              className="rounded-md px-3 py-2 text-sm font-medium text-green-600 transition-colors hover:bg-green-50"
            >
              Credit
            </Link>

            <Link
              href="/wholesale"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
            >
              Wholesale
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="relative hidden flex-1 lg:block lg:max-w-xs xl:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all"
              />
            </div>
            <AnimatePresence>
              {searchOpen && searchQuery.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute left-0 right-0 top-full mt-2 rounded-lg border border-slate-200 bg-white p-2 shadow-lg"
                >
                  {suggestions.length > 0 ? (
                    suggestions.map((s) => (
                      <Link
                        key={s}
                        href={`/shop?q=${encodeURIComponent(s)}`}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-900 hover:bg-slate-100"
                      >
                        <Search className="h-3.5 w-3.5 text-slate-400" />
                        {s}
                      </Link>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-slate-500">
                      No results found
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="rounded-full p-1.5 text-slate-900 transition-colors hover:bg-slate-100 lg:hidden"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              href="/wishlist"
              className="relative rounded-full p-1.5 text-slate-900 transition-colors hover:bg-slate-100"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-green-500 text-[9px] font-bold text-white ring-1 ring-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              href="/cart"
              className="group relative flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-white transition-all hover:bg-slate-800"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden text-xs font-bold md:block">Cart</span>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[9px] font-bold text-white">
                {getItemCount()}
              </span>
            </Link>
            <div className="hidden lg:block ml-2">
              <AuthButtons />
            </div>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-full p-1.5 text-slate-900 transition-colors hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Services bar */}
      <div className="hidden border-t border-slate-200 lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-4 py-2">
          {[
            { icon: Truck, text: "Free Shipping Over " + formatPrice(shippingConfig.threshold) },
            { icon: CreditCard, text: "Flexible Credit Plans" },
            { icon: Headset, text: "24/7 Support" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-xs text-slate-500">
              <Icon className="h-3.5 w-3.5 text-green-500" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 left-0 w-[280px] bg-white shadow-2xl"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                    <Logo size={32} />
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-full p-2 text-slate-900 hover:bg-slate-100 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Mobile Search */}
                <div className="px-4 py-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:outline-none"
                    />
                  </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 pb-8">
                  <div className="flex flex-col gap-1">
                    <Link
                      href="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
                    >
                      Home
                    </Link>

                    <div className="mt-4 px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Categories
                    </div>
                    <div className="space-y-1">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/shop?category=${cat.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 capitalize"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>

                    <div className="mt-4 px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Our Shop
                    </div>
                    <div className="space-y-1">
                      {["Shop", "All Products", "Credit", "Wholesale"].map((item) => (
                        <Link
                          key={item}
                          href={`/${item.toLowerCase().replace(" ", "-")}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          {item}
                        </Link>
                      ))}
                    </div>
                  </div>
                </nav>

                <div className="border-t border-slate-100 p-4 bg-slate-50/50">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-[0.98]"
                  >
                    <User className="h-4 w-4" />
                    My Account
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  )
}
