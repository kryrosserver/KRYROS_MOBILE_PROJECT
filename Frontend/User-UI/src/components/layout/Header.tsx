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
  ChevronDown,
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
import { megaMenuCategories as staticMegaMenuCategories } from "@/lib/store-data"

export function TopBar() {
  const [shippingConfig, setShippingConfig] = useState({ fee: 50, threshold: 5000 });

  useEffect(() => {
    settingsApi.getShippingConfig().then(res => {
      if (res.data) setShippingConfig(res.data);
    });
  }, []);

  return (
    <div className="bg-kryros-dark text-primary-foreground md:block hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs">
        <div className="hidden items-center gap-4 md:flex">
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            +260 966 423 719
          </span>
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            kryrosmobile@gmail.com
          </span>
        </div>
        <div className="flex w-full items-center justify-center gap-4 md:w-auto md:justify-end">
          <span className="flex items-center gap-1 text-kryros-green font-bold">
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
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [accountOpen, setAccountOpen] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [wishlistCount, setWishlistCount] = useState<number>(0)
  const [shippingConfig, setShippingConfig] = useState({ fee: 50, threshold: 5000 });
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  
  const megaMenuRef = useRef<HTMLDivElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)
  const { getItemCount } = useCart()

  useEffect(() => {
    // Fetch categories with their brands for the dynamic Mega Menu
    categoriesApi.getAll().then(res => {
      if (res.data) {
        // We need to ensure the backend returns brands linked to categories
        setCategories(res.data.filter((c: any) => c.isActive !== false))
      }
    })
  }, [])

  useEffect(() => {
    settingsApi.getShippingConfig().then(res => {
      if (res.data) setShippingConfig(res.data);
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setMegaMenuOpen(false)
      }
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
    return () => { active = false; window.removeEventListener('wishlist:changed', handler as any) }
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    };
  }, [mobileMenuOpen]);

  const suggestions = [
    "iPhone 16 Pro Max",
    "Samsung Galaxy S25",
    "MacBook Pro",
    "iPad Pro",
    "AirPods Pro",
  ].filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 shadow-lg backdrop-blur-md"
          : "bg-background border-b border-slate-100"
      }`}
    >
      {/* Mobile Promo Bar - Sticky with Header */}
      <div className="bg-kryros-green text-white py-1 px-4 text-center text-[10px] font-bold uppercase tracking-widest md:hidden">
        Free Delivery Over {formatPrice(shippingConfig.threshold)}
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Logo size={isScrolled ? 32 : 38} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              href="/"
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Home
            </Link>
            <div ref={megaMenuRef} className="relative">
              <button
                onMouseEnter={() => setMegaMenuOpen(true)}
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Categories
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${megaMenuOpen ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {megaMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    onMouseLeave={() => setMegaMenuOpen(false)}
                    className="absolute left-1/2 top-full mt-2 w-[640px] -translate-x-1/2 rounded-xl border border-border bg-card p-6 shadow-xl"
                  >
                    <div className="grid grid-cols-4 gap-6">
                      {/* Dynamically render columns based on categories from DB */}
                      {categories.filter(c => c.brands?.length > 0 || c.showOnHome).slice(0, 4).map((cat) => (
                        <div key={cat.id}>
                          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {cat.name}
                          </h4>
                          <ul className="flex flex-col gap-2">
                            {/* Render brands linked to this category */}
                            {cat.brands?.slice(0, 6).map((brand: any) => (
                              <li key={brand.id}>
                                <Link
                                  href={`/shop?category=${cat.slug}&brand=${brand.slug}`}
                                  onClick={() => setMegaMenuOpen(false)}
                                  className="text-sm text-foreground transition-colors hover:text-kryros-green capitalize"
                                >
                                  {brand.name}
                                </Link>
                              </li>
                            ))}
                            {/* If no brands, show link to category shop */}
                            {(!cat.brands || cat.brands.length === 0) && (
                              <li>
                                <Link
                                  href={`/shop?category=${cat.slug}`}
                                  onClick={() => setMegaMenuOpen(false)}
                                  className="text-sm text-muted-foreground italic hover:text-kryros-green"
                                >
                                  View all {cat.name}
                                </Link>
                              </li>
                            )}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex items-center gap-3 rounded-lg bg-kryros-green/10 p-4">
                      <CreditCard className="h-5 w-5 text-kryros-green" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Buy Now, Pay Later
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Flexible installment plans on all products over {formatPrice(100)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link
              href="/shop"
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Shop
            </Link>
            <Link
              href="/credit"
              className="rounded-md px-3 py-2 text-sm font-medium text-kryros-green transition-colors hover:bg-kryros-green/10"
            >
              Credit Plans
            </Link>
            <Link
              href="/wholesale"
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Wholesale
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="relative hidden flex-1 lg:block lg:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                className="w-full rounded-lg border border-border bg-secondary py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-kryros-green focus:outline-none focus:ring-1 focus:ring-kryros-green"
              />
            </div>
            <AnimatePresence>
              {searchOpen && searchQuery.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute left-0 right-0 top-full mt-2 rounded-lg border border-border bg-card p-2 shadow-lg"
                >
                  {suggestions.length > 0 ? (
                    suggestions.map((s) => (
                      <Link
                        key={s}
                        href={`/shop?q=${encodeURIComponent(s)}`}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary"
                      >
                        <Search className="h-3.5 w-3.5 text-muted-foreground" />
                        {s}
                      </Link>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      No results found
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="rounded-md p-2 text-foreground transition-colors hover:bg-secondary lg:hidden"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              href="/wishlist"
              className="relative rounded-md p-2 text-foreground transition-colors hover:bg-secondary"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-kryros-green text-[10px] font-bold text-accent-foreground">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              href="/cart"
              className="relative rounded-md p-2 text-foreground transition-colors hover:bg-secondary"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-kryros-orange text-[10px] font-bold text-accent-foreground">
                {getItemCount()}
              </span>
            </Link>
            <div className="hidden lg:block ml-2">
              <AuthButtons />
            </div>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-md p-2 text-foreground transition-colors hover:bg-secondary lg:hidden"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Services bar */}
      <div className="hidden border-t border-border lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-4 py-2">
          {[
            { icon: Truck, text: `Free Shipping Over ${formatPrice(shippingConfig.threshold)}` },
            { icon: CreditCard, text: "Flexible Credit Plans" },
            { icon: Headset, text: "24/7 Support" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
              <Icon className="h-3.5 w-3.5 text-kryros-green" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] h-screen w-screen overflow-hidden">
            {/* Backdrop with fade-in */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Sidebar with slide-in from left */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col bg-card shadow-xl"
            >
              <div className="flex h-full flex-col overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-4 py-4 h-16 shrink-0">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-kryros-green">
                      <span className="text-sm font-bold text-accent-foreground">K</span>
                    </div>
                    <span className="text-lg font-bold text-foreground">KRYROS</span>
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md p-1 text-foreground hover:bg-secondary"
                    aria-label="Close menu"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="px-4 py-4 border-b border-border shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="w-full rounded-lg border border-border bg-secondary py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-kryros-green focus:outline-none"
                    />
                  </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 py-4 overscroll-contain custom-scrollbar">
                  <div className="flex flex-col gap-1">
                    {/* User Account Quick Link */}
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center gap-3 rounded-xl bg-kryros-green/10 px-4 py-4 mb-4 text-sm font-bold text-kryros-green transition-colors hover:bg-kryros-green/20"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-kryros-green text-white">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base">My Account</span>
                        <span className="text-[10px] text-kryros-green/70 font-medium uppercase tracking-wider">Manage your profile & orders</span>
                      </div>
                    </Link>

                    {["Home", "Shop", "Credit Plans", "Wholesale"].map((item) => (
                      <Link
                        key={item}
                        href={item === "Home" ? "/" : `/${item.toLowerCase().replace(" ", "-")}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                      >
                        {item}
                      </Link>
                    ))}
                    <hr className="my-2 border-border" />
                    <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Categories
                    </p>
                    <div className="space-y-1 pb-4">
                      {categories.map((cat) => {
                        const isExpanded = expandedCategories.includes(cat.id);
                        const hasBrands = cat.brands?.length > 0;
                        
                        const toggleExpand = (e: React.MouseEvent) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setExpandedCategories(prev => 
                            isExpanded ? prev.filter(id => id !== cat.id) : [...prev, cat.id]
                          );
                        };

                        return (
                          <div key={cat.id} className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Link
                                href={`/shop?category=${cat.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex-1 flex items-center justify-between rounded-md px-3 py-2 text-sm font-bold text-foreground transition-colors hover:bg-secondary capitalize"
                              >
                                <span>{cat.name}</span>
                                <span className="text-[10px] bg-secondary-foreground/10 px-1.5 py-0.5 rounded-full">
                                  {cat._count?.products || 0}
                                </span>
                              </Link>
                              {hasBrands && (
                                <button
                                  onClick={toggleExpand}
                                  className="p-2 rounded-md hover:bg-secondary text-muted-foreground transition-colors"
                                  aria-label={isExpanded ? "Collapse" : "Expand"}
                                >
                                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                                </button>
                              )}
                            </div>
                            
                            {/* Brands under this category in mobile */}
                            <AnimatePresence>
                              {hasBrands && isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="ml-4 border-l border-border pl-2 space-y-1 py-1">
                                    {cat.brands.slice(0, 10).map((brand: any) => (
                                      <Link
                                        key={brand.id}
                                        href={`/shop?category=${cat.slug}&brand=${brand.slug}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary capitalize"
                                      >
                                        {brand.name}
                                      </Link>
                                    ))}
                                    <Link
                                      href={`/shop?category=${cat.slug}`}
                                      onClick={() => setMobileMenuOpen(false)}
                                      className="block rounded-md px-3 py-1.5 text-xs font-bold text-kryros-green transition-colors hover:bg-secondary capitalize"
                                    >
                                      View All {cat.name}
                                    </Link>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </nav>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  )
}
