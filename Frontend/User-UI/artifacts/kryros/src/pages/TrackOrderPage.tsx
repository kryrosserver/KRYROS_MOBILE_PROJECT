import { useState } from "react";
import { Link } from "wouter";
import { Search, ChevronLeft, ChevronRight, Headphones, CheckCircle, Truck, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const statusColors: Record<string, string> = {
  "In Transit": "bg-primary/10 text-primary border-primary/20",
  "Out for Delivery": "bg-orange-500/10 text-orange-600 border-orange-500/20",
  "Delivered": "bg-green-500/10 text-green-600 border-green-500/20",
  "Cancelled": "bg-red-500/10 text-red-600 border-red-500/20",
};

const filterTabs = ["All Orders", "In Transit", "Out for Delivery", "Delivered", "Cancelled"];

const recentOrder = {
  name: "iPhone 15 Pro Max", specs: "256GB | Titanium",
  orderId: "#KRY12345678", placedOn: "May 12, 2024",
  status: "In Transit", estDelivery: "May 20, 2024",
  image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200&q=80",
  timeline: [
    { label: "Order Confirmed", date: "May 12, 2024", done: true, active: false },
    { label: "Shipped", date: "May 14, 2024", done: true, active: false },
    { label: "In Transit", date: "May 16, 2024", done: true, active: true },
    { label: "Out for Delivery", date: "Pending", done: false, active: false },
  ],
};

const allOrders = [
  { id: "o2", name: "Sony WH-1000XM5", specs: "Wireless Headphones", orderId: "#KRY87654321", placedOn: "May 10, 2024", status: "Out for Delivery", estDelivery: "May 18, 2024", image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=200&q=80" },
  { id: "o3", name: "MacBook Air M2", specs: "13-inch | 512GB", orderId: "#KRY11223344", placedOn: "May 08, 2024", status: "Delivered", estDelivery: "May 15, 2024", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&q=80" },
  { id: "o4", name: "Nike Air Max 270", specs: "Men's Shoes", orderId: "#KRY55667788", placedOn: "May 05, 2024", status: "In Transit", estDelivery: "May 19, 2024", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80" },
  { id: "o5", name: "Samsung Galaxy S24 Ultra", specs: "512GB | Titanium Black", orderId: "#KRY99887766", placedOn: "May 02, 2024", status: "Cancelled", estDelivery: "May 03, 2024", image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200&q=80" },
];

export default function TrackOrderPage() {
  const [searchQ, setSearchQ] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Orders");

  const filtered = allOrders.filter((o) => {
    if (activeFilter !== "All Orders" && o.status !== activeFilter) return false;
    if (searchQ && !o.orderId.includes(searchQ) && !o.name.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/shop">
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
        </Link>
        <span className="text-base font-black text-foreground">KRY<span className="text-primary">ROS</span></span>
        <div className="flex-1" />
        <Link href="/">
          <span className="text-xs text-primary font-semibold hover:underline">Home</span>
        </Link>
      </div>
    <div className="max-w-2xl mx-auto px-4 py-5 pb-28">
      <h1 className="text-2xl font-black text-foreground mb-0.5">Track Order</h1>
      <p className="text-muted-foreground text-xs mb-5">Stay updated with your order status in real time</p>

      {/* Search */}
      <div className="flex gap-2 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Enter Order ID or Tracking Number"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button className="px-4 py-3 bg-foreground text-background rounded-xl font-bold text-xs hover:opacity-90 transition-opacity flex-shrink-0">
          Track Order
        </button>
      </div>

      {/* Recent Orders */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">Recent Orders</h2>
          <span className="text-xs text-primary font-semibold cursor-pointer">View All</span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-start gap-3 mb-4">
            <img src={recentOrder.image} alt={recentOrder.name} className="w-14 h-14 object-cover rounded-xl bg-muted flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground text-sm">{recentOrder.name}</p>
              <p className="text-[10px] text-muted-foreground">{recentOrder.specs}</p>
              <p className="text-[10px] text-muted-foreground">Order ID: {recentOrder.orderId}</p>
              <p className="text-[10px] text-muted-foreground">Placed on: {recentOrder.placedOn}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className={`text-[9px] font-bold px-2 py-1 rounded-full border ${statusColors[recentOrder.status]}`}>
                {recentOrder.status}
              </span>
              <p className="text-[9px] text-muted-foreground mt-1.5">Est. Delivery</p>
              <p className="text-[10px] font-bold text-primary">{recentOrder.estDelivery}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 self-center ml-1" />
          </div>

          {/* Timeline */}
          <div className="flex items-start">
            {recentOrder.timeline.map((step, i) => (
              <div key={step.label} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className="relative flex items-center w-full mb-1.5">
                    {i > 0 && <div className={`flex-1 h-0.5 ${step.done ? "bg-primary" : "bg-border"}`} />}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center z-10 flex-shrink-0 shadow-sm ${step.active ? "bg-primary ring-4 ring-primary/20" : step.done ? "bg-primary" : "bg-muted border-2 border-border"}`}>
                      {step.done && !step.active && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                      {step.active && <Truck className="w-3.5 h-3.5 text-white" />}
                      {!step.done && <MapPin className="w-3 h-3 text-muted-foreground" />}
                    </div>
                    {i < recentOrder.timeline.length - 1 && <div className={`flex-1 h-0.5 ${step.done && !step.active ? "bg-primary" : "bg-border"}`} />}
                  </div>
                  <p className={`text-[9px] text-center font-medium leading-tight ${step.active ? "text-primary" : step.done ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                  <p className="text-[8px] text-muted-foreground text-center">{step.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Orders */}
      <h2 className="text-sm font-bold text-foreground mb-3">All Orders</h2>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeFilter === tab ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-3 mb-5">
        {filtered.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:border-primary/30 transition-all"
          >
            <img src={order.image} alt={order.name} className="w-14 h-14 object-cover rounded-xl bg-muted flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground text-sm truncate">{order.name}</p>
              <p className="text-[10px] text-muted-foreground">{order.specs}</p>
              <p className="text-[10px] text-muted-foreground">Order ID: {order.orderId}</p>
              <p className="text-[10px] text-muted-foreground">Placed on: {order.placedOn}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className={`text-[9px] font-bold px-2 py-1 rounded-full border ${statusColors[order.status]}`}>{order.status}</span>
              <p className="text-[9px] text-muted-foreground mt-1.5">
                {order.status === "Delivered" ? "Delivered on" : order.status === "Cancelled" ? "Cancelled on" : "Est. Delivery"}
              </p>
              <p className={`text-[10px] font-bold ${order.status === "Cancelled" ? "text-red-500" : "text-primary"}`}>{order.estDelivery}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </motion.div>
        ))}
      </div>

      {/* Need Help */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Headphones className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground">Need Help?</p>
          <p className="text-xs text-muted-foreground">Our support team is here to help you with your order.</p>
        </div>
        <button className="px-3 py-2 border border-primary/40 text-primary rounded-xl text-xs font-bold hover:bg-primary/10 transition-all flex-shrink-0">
          Contact Support
        </button>
      </div>
    </div>
    </div>
  );
}
