import { useState } from "react";
import { Link } from "wouter";
import {
  LayoutDashboard, Package, Heart, MapPin, CreditCard, Zap,
  MessageCircle, Bell, RefreshCcw, Star, Settings, ChevronRight, Check,
  Truck, MoreVertical, Plus, Globe, Sun, DollarSign, X, Search,
  ChevronDown, Menu, ShoppingBag, Info, Tag, AlertCircle,
} from "lucide-react";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: true },
  { icon: Package, label: "Orders", href: "/track" },
  { icon: Heart, label: "Wishlist", href: "/shop" },
  { icon: MapPin, label: "Addresses", href: "/dashboard" },
  { icon: CreditCard, label: "Payment Methods", href: "/dashboard" },
  { icon: Zap, label: "Get Now Plans", href: "/get-now" },
  { icon: MapPin, label: "Pickup Stations", href: "/pickup-stations" },
  { icon: MessageCircle, label: "Messages", href: "/dashboard" },
  { icon: RefreshCcw, label: "Returns & Refunds", href: "/returns" },
  { icon: Star, label: "My Reviews", href: "/dashboard" },
  { icon: Settings, label: "Settings", href: "/dashboard" },
];

const footerLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Refund Policy", href: "/refund" },
];

const notifications = [
  { id: "n1", icon: Truck, color: "text-primary bg-primary/10", title: "Order Shipped", body: "Your iPhone 15 Pro Max has been shipped.", time: "2 min ago" },
  { id: "n2", icon: Tag, color: "text-orange-500 bg-orange-500/10", title: "Flash Sale Live", body: "Up to 40% off on selected items. Grab yours now!", time: "1 hr ago" },
  { id: "n3", icon: Check, color: "text-green-500 bg-green-500/10", title: "Payment Confirmed", body: "Your payment of $1,099.00 was successful.", time: "3 hrs ago" },
  { id: "n4", icon: Info, color: "text-blue-500 bg-blue-500/10", title: "Profile Updated", body: "Your address was updated successfully.", time: "Yesterday" },
  { id: "n5", icon: AlertCircle, color: "text-red-500 bg-red-500/10", title: "Return Approved", body: "Your return request #KRY-001 has been approved.", time: "2 days ago" },
];

const recentOrders = [
  { id: "o1", name: "iPhone 15 Pro Max", orderId: "#KRY12345678", date: "May 12, 2024", status: "In Transit", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=100&q=80" },
  { id: "o2", name: "MacBook Air M2", orderId: "#KRY12345677", date: "May 08, 2024", status: "Delivered", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&q=80" },
  { id: "o3", name: "Sony WH-1000XM5", orderId: "#KRY12345676", date: "May 05, 2024", status: "Out for Delivery", image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=100&q=80" },
  { id: "o4", name: "Nike Air Max 270", orderId: "#KRY12345675", date: "May 02, 2024", status: "Delivered", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&q=80" },
];

const wishlistItems = [
  { id: "w1", name: "iPhone 15 Pro Max", price: "$1,099.00", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200&q=80" },
  { id: "w2", name: "MacBook Air M2", price: "$1,249.00", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&q=80" },
  { id: "w3", name: "Sony WH-1000XM5", price: "$349.00", image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=200&q=80" },
];

const addresses = [
  { icon: MapPin, label: "Home", lines: ["123 Business Avenue,", "Downtown, New York,", "NY 10001, USA"] },
  { icon: Package, label: "Office", lines: ["456 West 34th Street,", "Midtown West, New York,", "NY 10018, USA"] },
];

const trackingTimeline = [
  { label: "Order Confirmed", date: "May 12", done: true, active: false },
  { label: "Shipped", date: "May 14", done: true, active: false },
  { label: "In Transit", date: "May 16", done: true, active: true },
  { label: "Out for Delivery", date: "May 20", done: false, active: false },
];

const statusColors: Record<string, string> = {
  "In Transit": "bg-primary/10 text-primary",
  "Delivered": "bg-green-500/10 text-green-600",
  "Out for Delivery": "bg-orange-500/10 text-orange-600",
  "Cancelled": "bg-red-500/10 text-red-600",
};

const quickActions = [
  { icon: Package, label: "My Orders", sub: "Track and manage your orders", href: "/track" },
  { icon: RefreshCcw, label: "Returns", sub: "Request return or check status", href: "/returns" },
  { icon: CreditCard, label: "Payment Methods", sub: "Manage your saved cards and wallets", href: "/dashboard" },
  { icon: MapPin, label: "Pickup Stations", sub: "Find and manage pickup locations", href: "/pickup-stations" },
  { icon: Settings, label: "Settings", sub: "Manage your account preferences", href: "/dashboard" },
];

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <Link href="/">
          <span className="text-lg font-black text-foreground cursor-pointer">
            KRY<span className="text-primary">ROS</span>
          </span>
        </Link>
        <button
          className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-full transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <nav className="flex-1 p-2 overflow-y-auto">
        {sidebarItems.map(({ icon: Icon, label, href, active }) => (
          <Link key={label} href={href}>
            <div
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all mb-0.5
                ${active ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"}`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm font-medium ${active ? "font-semibold text-primary" : ""}`}>{label}</span>
            </div>
          </Link>
        ))}
      </nav>

      <div className="border-t border-border p-3 space-y-0.5">
        {[
          { icon: DollarSign, label: "USD - US Dollar" },
          { icon: Globe, label: "English" },
          { icon: Sun, label: "Light Mode" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-muted cursor-pointer transition-all">
            <div className="flex items-center gap-2">
              <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </div>
        ))}
        <div className="pt-2 space-y-0.5">
          {footerLinks.map(({ label, href }) => (
            <Link key={label} href={href}>
              <p className="px-3 py-1 text-[10px] text-muted-foreground hover:text-primary cursor-pointer transition-colors">{label}</p>
            </Link>
          ))}
          <p className="px-3 pt-1 text-[9px] text-muted-foreground/60">&copy; 2024 KRYROS. All rights reserved.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 border-r border-border sticky top-0 h-screen overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-56 bg-background h-full flex flex-col shadow-2xl z-10 border-r border-border">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-y-auto">

        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-background border-b border-border flex items-center justify-between px-4 md:px-6 py-3">
          <button
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            {/* Search */}
            <button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
              <Search style={{ width: 18, height: 18 }} className="text-foreground" />
            </button>

            {/* Wishlist */}
            <Link href="/shop">
              <button className="relative w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
                <Heart style={{ width: 18, height: 18 }} className="text-foreground" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-white text-[8px] font-black flex items-center justify-center">2</span>
              </button>
            </Link>

            {/* Cart */}
            <Link href="/cart">
              <button className="relative w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
                <ShoppingBag style={{ width: 18, height: 18 }} className="text-foreground" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-white text-[8px] font-black flex items-center justify-center">2</span>
              </button>
            </Link>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen((o) => !o)}
                className="relative w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
              >
                <Bell style={{ width: 18, height: 18 }} className="text-foreground" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-white text-[8px] font-black flex items-center justify-center">3</span>
              </button>

              {/* Notification dropdown */}
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-10 z-40 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <h3 className="text-sm font-bold text-foreground">Notifications</h3>
                      <button className="text-[10px] text-primary font-semibold hover:underline">Mark all read</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-border">
                      {notifications.map(({ id, icon: Icon, color, title, body, time }) => (
                        <div key={id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground">{title}</p>
                            <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{body}</p>
                          </div>
                          <span className="text-[9px] text-muted-foreground flex-shrink-0 mt-0.5 whitespace-nowrap">{time}</span>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2.5 border-t border-border">
                      <button className="w-full text-xs text-primary font-semibold text-center hover:underline">View all notifications</button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-1.5 cursor-pointer">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0 ring-2 ring-primary/30">
                <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=60&q=80" alt="Alex" className="w-full h-full object-cover" />
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 pb-28 lg:pb-10">

          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-2xl font-black text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, Alex! 👋</p>
          </div>

          {/* 4 Stat cards — compact horizontal rectangles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              { icon: ShoppingBag, label: "Total Orders", value: "24", href: "/track", iconBg: "#e6faf8", iconColor: "#0d9488" },
              { icon: Heart, label: "Wishlist Items", value: "18", href: "/shop", iconBg: "#fdf2f8", iconColor: "#ec4899" },
              { icon: Zap, label: "Get Now Credit", value: "$2,450", href: "/get-now", iconBg: "#fff7ed", iconColor: "#f97316" },
              { icon: MapPin, label: "Addresses", value: "4", href: "/dashboard", iconBg: "#f5f3ff", iconColor: "#8b5cf6" },
            ].map(({ icon: Icon, label, value, href, iconBg, iconColor }) => (
              <Link key={label} href={href}>
                <div className="bg-card border border-border rounded-xl px-3 py-3 flex items-center gap-3 hover:shadow-sm hover:border-primary/20 transition-all cursor-pointer">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
                    <Icon style={{ width: 18, height: 18, color: iconColor }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground leading-tight truncate">{label}</p>
                    <p className="text-base font-black text-foreground leading-tight">{value}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Recent Orders + Order Tracking */}
          <div className="grid lg:grid-cols-2 gap-4 mb-4">

            {/* Recent Orders */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-foreground">Recent Orders</h2>
                <Link href="/track">
                  <span className="flex items-center gap-0.5 text-xs text-primary cursor-pointer hover:underline font-medium">
                    View All Orders <ChevronRight className="w-3 h-3" />
                  </span>
                </Link>
              </div>
              <div className="space-y-1.5">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted/50 transition-all cursor-pointer">
                    <img src={order.image} alt={order.name} className="w-11 h-11 object-cover rounded-xl bg-muted flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{order.name}</p>
                      <p className="text-[10px] text-muted-foreground">Order ID: {order.orderId}</p>
                      <p className="text-[10px] text-muted-foreground">{order.date}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${statusColors[order.status] ?? "bg-muted text-muted-foreground"}`}>
                        {order.status}
                      </span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Tracking */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-foreground">Order Tracking</h2>
                <Link href="/track">
                  <span className="flex items-center gap-0.5 text-xs text-primary cursor-pointer hover:underline font-medium">
                    Track Your Order <ChevronRight className="w-3 h-3" />
                  </span>
                </Link>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2 font-medium">Latest Order</p>
              <div className="flex items-center gap-3 mb-5 p-2 rounded-xl">
                <img src={recentOrders[0].image} alt={recentOrders[0].name} className="w-12 h-12 object-cover rounded-xl bg-muted flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-foreground">{recentOrders[0].name}</p>
                  <p className="text-[10px] text-muted-foreground">Order ID: {recentOrders[0].orderId}</p>
                </div>
              </div>

              <div className="flex items-start mb-5 px-1">
                {trackingTimeline.map((step, i) => (
                  <div key={step.label} className="flex items-start flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className="flex items-center w-full">
                        {i > 0 && <div className={`flex-1 h-0.5 ${trackingTimeline[i - 1].done ? "bg-primary" : "bg-border"}`} />}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2
                          ${step.active ? "bg-primary border-primary ring-4 ring-primary/20"
                            : step.done ? "bg-primary border-primary"
                            : "bg-background border-border"}`}>
                          {step.active && <Truck className="w-3.5 h-3.5 text-white" />}
                          {step.done && !step.active && <Check className="w-3.5 h-3.5 text-white" />}
                          {!step.done && <MapPin className="w-3 h-3 text-muted-foreground" />}
                        </div>
                        {i < trackingTimeline.length - 1 && <div className={`flex-1 h-0.5 ${step.done && !step.active ? "bg-primary" : "bg-border"}`} />}
                      </div>
                      <p className={`text-[9px] text-center mt-1.5 font-semibold leading-tight px-0.5
                        ${step.active ? "text-primary" : step.done ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                      <p className="text-[8px] text-muted-foreground text-center mt-0.5">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-muted/40 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Estimated Delivery</p>
                  <p className="text-lg font-black text-primary">May 20, 2024</p>
                </div>
                <div className="flex-shrink-0 opacity-20">
                  <svg viewBox="0 0 80 50" className="w-20 h-12" fill="none">
                    <rect x="2" y="20" width="50" height="22" rx="3" fill="currentColor" className="text-foreground" />
                    <polygon points="52,20 52,36 66,36 66,28" fill="currentColor" className="text-foreground" />
                    <rect x="56" y="36" width="8" height="4" rx="2" fill="currentColor" className="text-muted-foreground" />
                    <circle cx="14" cy="40" r="5" fill="currentColor" className="text-foreground" />
                    <circle cx="14" cy="40" r="2" fill="white" />
                    <circle cx="58" cy="40" r="5" fill="currentColor" className="text-foreground" />
                    <circle cx="58" cy="40" r="2" fill="white" />
                    <rect x="6" y="24" width="8" height="6" rx="1" fill="white" opacity="0.6" />
                    <rect x="18" y="24" width="12" height="6" rx="1" fill="white" opacity="0.4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Get Now Banner */}
          <div
            className="rounded-2xl overflow-hidden mb-4 relative"
            style={{ background: "linear-gradient(135deg, #07392f 0%, #0a5544 60%, #073d2e 100%)" }}
          >
            <div className="flex items-center justify-between p-5 md:p-6">
              <div className="flex-1">
                <h3 className="text-xl font-black text-white mb-1">Get More with Get Now</h3>
                <p className="text-white/60 text-xs mb-5 max-w-[220px] leading-relaxed">
                  Shop now and pay later with flexible plans that suit you.
                </p>
                <Link href="/get-now">
                  <button className="px-5 py-2.5 bg-white text-gray-900 rounded-xl font-bold text-sm hover:bg-white/90 transition-all">
                    Explore Plans
                  </button>
                </Link>
              </div>
              <div className="flex-shrink-0 relative hidden md:flex items-end gap-2" style={{ height: 120 }}>
                <div className="absolute -top-2 left-0 flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-xl px-2.5 py-1.5 backdrop-blur-sm z-10">
                  <Check className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-bold text-white">Instant Approval</span>
                </div>
                <div className="absolute -top-2 right-0 flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-xl px-2.5 py-1.5 backdrop-blur-sm z-10">
                  <span className="text-[10px] font-bold text-white">0% Interest</span>
                </div>
                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 self-end">
                  <div className="w-full h-full bg-primary/80 flex flex-col items-center justify-end pb-2">
                    <ShoppingBag className="w-8 h-8 text-white/80 mb-1" />
                    <span className="text-[8px] font-black text-white">KRYROS</span>
                  </div>
                </div>
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl self-end flex-shrink-0">
                  <img src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=100&q=80" alt="headphones" className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-0 right-0 flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-xl px-2.5 py-1.5 backdrop-blur-sm z-10">
                  <span className="text-[10px] font-bold text-white">Flexible Plans</span>
                </div>
              </div>
            </div>
          </div>

          {/* Wishlist + Saved Addresses */}
          <div className="grid lg:grid-cols-2 gap-4 mb-6">
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-foreground">Wishlist</h2>
                <Link href="/shop">
                  <span className="flex items-center gap-0.5 text-xs text-primary cursor-pointer hover:underline font-medium">
                    View All <ChevronRight className="w-3 h-3" />
                  </span>
                </Link>
              </div>
              <div className="flex gap-3 mb-4">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="flex flex-col items-center gap-1.5 flex-1">
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-muted">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <Heart className="w-3 h-3 fill-primary text-primary" />
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-foreground">{item.price}</span>
                  </div>
                ))}
              </div>
              <Link href="/shop">
                <button className="w-full py-2.5 border border-border rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors">
                  Go to Wishlist
                </button>
              </Link>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-foreground">Saved Addresses</h2>
                <span className="flex items-center gap-0.5 text-xs text-primary cursor-pointer hover:underline font-medium">
                  Manage All <ChevronRight className="w-3 h-3" />
                </span>
              </div>
              <div className="space-y-3 mb-3">
                {addresses.map(({ icon: Icon, label, lines }) => (
                  <div key={label} className="flex items-start gap-3 p-3 bg-muted/40 rounded-xl">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground mb-0.5">{label}</p>
                      {lines.map((line, i) => (
                        <p key={i} className="text-[10px] text-muted-foreground leading-snug">{line}</p>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button className="text-[10px] text-primary font-semibold hover:underline">Edit</button>
                      <MoreVertical className="w-3.5 h-3.5 text-muted-foreground cursor-pointer" />
                    </div>
                  </div>
                ))}
              </div>
              <button className="flex items-center gap-1.5 text-primary text-xs font-semibold hover:bg-primary/5 px-3 py-2 rounded-xl transition-colors">
                <Plus className="w-3.5 h-3.5" />
                + Add New Address
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-sm font-bold text-foreground mb-3">Quick Actions</h2>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {quickActions.map(({ icon: Icon, label, sub, href }) => (
                <Link key={label} href={href}>
                  <div className="flex flex-col items-center text-center gap-2 p-3 bg-card border border-border rounded-2xl cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="text-primary" style={{ width: 18, height: 18 }} />
                    </div>
                    <p className="text-[10px] font-bold text-foreground leading-tight">{label}</p>
                    <p className="text-[9px] text-muted-foreground leading-tight hidden md:block">{sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
