import { useState } from "react";
import { Search, MapPin, Clock, Navigation, Package, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const stations = [
  { id: "s1", name: "KRYROS Main Hub", address: "123 Business Avenue, Downtown\nNew York, NY 10001", hours: "Open · Closes 8:00 PM", distance: "0.8 km", recommended: true, image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&q=80" },
  { id: "s2", name: "KRYROS Westside Point", address: "456 West 34th Street, Midtown West\nNew York, NY 10018", hours: "Open · Closes 9:00 PM", distance: "1.6 km", recommended: false, image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=80" },
  { id: "s3", name: "KRYROS Brooklyn Center", address: "789 Atlantic Avenue, Brooklyn\nNew York, NY 11217", hours: "Open · Closes 7:00 PM", distance: "3.2 km", recommended: false, image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=200&q=80" },
  { id: "s4", name: "KRYROS Queens Point", address: "321 Queens Boulevard, Queens\nNew York, NY 11377", hours: "Open · Closes 6:30 PM", distance: "4.5 km", recommended: false, image: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=200&q=80" },
];

const benefits = [
  { icon: Clock, title: "Save Time", desc: "Skip delivery wait and pick up when it suits you." },
  { icon: Package, title: "Secure & Safe", desc: "Your orders are stored securely until you pick them up." },
  { icon: Navigation, title: "No Delivery Fees", desc: "Pick up for free from any of our stations." },
  { icon: Clock, title: "Flexible Hours", desc: "Extended hours to fit your busy schedule." },
];

export default function PickupStationsPage() {
  const [searchQ, setSearchQ] = useState("");

  const filtered = stations.filter((s) =>
    !searchQ || s.name.toLowerCase().includes(searchQ.toLowerCase()) || s.address.toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 pb-28">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-foreground">Pickup Stations</h1>
          <p className="text-muted-foreground text-xs mt-1 leading-5">
            Choose a pickup station near you and collect<br />your orders quickly and easily.
          </p>
        </div>
        <div className="bg-primary/5 border border-primary/30 rounded-2xl px-3 py-2.5 flex items-start gap-2 cursor-pointer min-w-[155px] hover:border-primary/50 transition-colors">
          <div className="flex-1">
            <p className="text-[10px] font-bold text-primary mb-0.5">Fast & Convenient</p>
            <p className="text-[9px] text-muted-foreground leading-snug">Pick up your orders at your<br />convenience, anytime.</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by city, area or station name..."
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button className="w-12 h-12 bg-card border border-border rounded-xl flex items-center justify-center hover:border-primary/50 transition-colors flex-shrink-0">
          <Navigation className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Map */}
      <div className="relative rounded-2xl overflow-hidden mb-5" style={{ height: 200, background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #e8f5e9 100%)" }}>
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#4CAF50" strokeWidth="0.5"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {/* Road lines */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="100" x2="100%" y2="100" stroke="white" strokeWidth="8" opacity="0.7" />
          <line x1="0" y1="140" x2="100%" y2="140" stroke="white" strokeWidth="4" opacity="0.5" />
          <line x1="200" y1="0" x2="200" y2="100%" stroke="white" strokeWidth="6" opacity="0.6" />
          <line x1="320" y1="0" x2="320" y2="100%" stroke="white" strokeWidth="4" opacity="0.5" />
        </svg>
        {/* Map pins */}
        {[{ x: "28%", y: "35%", primary: false }, { x: "50%", y: "28%", primary: false }, { x: "66%", y: "55%", primary: true }, { x: "78%", y: "32%", primary: false }].map((pin, i) => (
          <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: pin.x, top: pin.y }}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg ${pin.primary ? "bg-primary" : "bg-foreground"}`}>
              <MapPin className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        ))}
        {/* Center dot (user location) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md z-10 relative" />
            <div className="absolute inset-0 w-4 h-4 rounded-full bg-blue-400/40 animate-ping" />
          </div>
        </div>
        {/* Use My Location */}
        <button className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-xl text-xs font-bold shadow-lg hover:opacity-90 transition-opacity whitespace-nowrap">
          <Navigation className="w-3.5 h-3.5" />
          Use My Location
        </button>
      </div>

      {/* Nearby stations */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-foreground">Nearby Pickup Stations</h2>
        <span className="text-xs text-muted-foreground cursor-pointer flex items-center gap-0.5">Sort by: Nearest <span className="text-[10px]">▼</span></span>
      </div>

      <div className="space-y-3 mb-5">
        {filtered.map((station, i) => (
          <motion.div
            key={station.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-card border border-border rounded-2xl p-3 flex items-center gap-3 cursor-pointer hover:border-primary/30 transition-all"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
              <img src={station.image} alt={station.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="font-bold text-foreground text-xs truncate">{station.name}</p>
                {station.recommended && (
                  <span className="text-[8px] font-bold px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full flex-shrink-0">Recommended</span>
                )}
              </div>
              <div className="flex items-start gap-1 mb-0.5">
                <MapPin className="w-2.5 h-2.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-[9px] text-muted-foreground leading-snug">{station.address.replace("\n", ", ")}</p>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-2.5 h-2.5 text-green-500 flex-shrink-0" />
                <p className="text-[9px] text-green-600">{station.hours}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-muted-foreground">{station.distance}</span>
                <Navigation className="w-3 h-3 text-muted-foreground" />
              </div>
              <button className="px-2.5 py-1 bg-green-500/10 text-green-600 border border-green-500/20 rounded-lg text-[9px] font-bold">
                Open Now
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* How pickup works */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-3 mb-5 cursor-pointer hover:border-primary/40 transition-colors">
        <Package className="w-8 h-8 text-primary flex-shrink-0" />
        <div className="flex-1">
          <p className="font-bold text-foreground text-sm">How Pickup Works</p>
          <p className="text-xs text-muted-foreground">Choose a station, place your order, and we'll notify you when it's ready for pickup.</p>
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 border border-primary/40 text-primary rounded-xl text-xs font-bold flex-shrink-0">
          Learn More <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Why Choose Pickup */}
      <h2 className="text-sm font-bold text-foreground mb-3">Why Choose Pickup?</h2>
      <div className="grid grid-cols-4 gap-2">
        {benefits.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex flex-col items-center text-center p-2 bg-card border border-border rounded-xl">
            <Icon className="w-4 h-4 text-primary mb-1.5" />
            <p className="text-[9px] font-bold text-foreground leading-tight mb-0.5">{title}</p>
            <p className="text-[8px] text-muted-foreground leading-tight">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
