import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Home, ShoppingBag, Zap, Package, MapPin, Truck, Info, Phone, Shield, FileText, RefreshCw,
  ChevronRight, Search, Grid2x2, Globe, Moon, Sun, DollarSign
} from "lucide-react";
import { useThemeStore } from "@/store/themeStore";

const menuItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Shop", icon: ShoppingBag, href: "/shop" },
  { label: "Get Now", icon: Zap, href: "/get-now" },
  { label: "Wholesale", icon: Package, href: "/wholesale" },
  { label: "Pickup Stations", icon: MapPin, href: "/pickup-stations" },
  { label: "Track Order", icon: Truck, href: "/track" },
];

const infoItems = [
  { label: "About Us", icon: Info, href: "/about" },
  { label: "Contact Us", icon: Phone, href: "/contact" },
  { label: "Privacy Policy", icon: Shield, href: "/privacy" },
  { label: "Terms & Conditions", icon: FileText, href: "/terms" },
  { label: "Refund Policy", icon: RefreshCw, href: "/refund" },
];

const sidebarCategories = [
  { id: "c1", name: "Smartphones", subtitle: "Latest smartphones & accessories", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=60&q=80", href: "/shop?cat=Smartphones" },
  { id: "c2", name: "Laptops", subtitle: "Powerful laptops for work & play", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=60&q=80", href: "/shop?cat=Laptops" },
  { id: "c3", name: "Fashion", subtitle: "Trendy clothes & accessories", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=60&q=80", href: "/shop?cat=Fashion" },
  { id: "c4", name: "Shoes", subtitle: "Premium shoes collection", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=60&q=80", href: "/shop?cat=Shoes" },
  { id: "c5", name: "Audio", subtitle: "Top quality sound experience", image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=60&q=80", href: "/shop?cat=Audio" },
  { id: "c6", name: "Cameras", subtitle: "Capture every moment", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=60&q=80", href: "/shop?cat=Cameras" },
  { id: "c7", name: "Gaming", subtitle: "Play beyond limits", image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=60&q=80", href: "/shop?cat=Gaming" },
  { id: "c8", name: "Accessories", subtitle: "Everything you need", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60&q=80", href: "/shop?cat=Accessories" },
  { id: "c9", name: "Electronics", subtitle: "Smart tech for everyday life", image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=60&q=80", href: "/shop?cat=Electronics" },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<"menu" | "categories">("menu");
  const [catSearch, setCatSearch] = useState("");
  const [location] = useLocation();
  const { theme, toggleTheme } = useThemeStore();

  const filteredCats = sidebarCategories.filter((c) =>
    c.name.toLowerCase().includes(catSearch.toLowerCase())
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-[88vw] md:w-[400px] bg-card flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <Link href="/" onClick={onClose}>
                <span className="text-xl font-black tracking-tight">
                  KRY<span className="text-primary">ROS</span>
                </span>
              </Link>
              <button
                onClick={onClose}
                data-testid="sidebar-close"
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab("menu")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all border-b-2 ${
                  activeTab === "menu"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Grid2x2 className="w-4 h-4" />
                Menu
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all border-b-2 ${
                  activeTab === "categories"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Grid2x2 className="w-4 h-4" />
                Categories
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === "menu" ? (
                <div className="p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 px-2">Browse</p>
                  <div className="space-y-0.5">
                    {menuItems.map(({ label, icon: Icon, href }) => {
                      const isActive = location === href || (href !== "/" && location.startsWith(href));
                      return (
                        <Link key={href} href={href} onClick={onClose}>
                          <div
                            className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all cursor-pointer group ${
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted text-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5" />
                              <span className="text-sm font-medium">{label}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 px-2 mt-6">Preferences</p>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-muted cursor-pointer">
                      <div className="flex items-center gap-3 text-foreground">
                        <DollarSign className="w-5 h-5" />
                        <span className="text-sm font-medium">Currency</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <span>USD ($)</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-muted cursor-pointer">
                      <div className="flex items-center gap-3 text-foreground">
                        <Globe className="w-5 h-5" />
                        <span className="text-sm font-medium">Language</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <span>English</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-muted cursor-pointer" onClick={toggleTheme}>
                      <div className="flex items-center gap-3 text-foreground">
                        {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        <span className="text-sm font-medium">Theme</span>
                      </div>
                      <div
                        className={`w-11 h-6 rounded-full transition-all duration-300 relative ${theme === "dark" ? "bg-primary" : "bg-muted-foreground/30"}`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${theme === "dark" ? "left-[22px]" : "left-0.5"}`}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 px-2 mt-6">Information</p>
                  <div className="space-y-0.5">
                    {infoItems.map(({ label, icon: Icon, href }) => (
                      <Link key={href} href={href} onClick={onClose}>
                        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted cursor-pointer group text-foreground">
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{label}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={catSearch}
                      onChange={(e) => setCatSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-muted rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 border border-border"
                    />
                  </div>
                  <div className="space-y-1">
                    {filteredCats.map((cat) => (
                      <Link key={cat.id} href={cat.href} onClick={onClose}>
                        <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-muted cursor-pointer group transition-all">
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">{cat.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{cat.subtitle}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 flex-shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
