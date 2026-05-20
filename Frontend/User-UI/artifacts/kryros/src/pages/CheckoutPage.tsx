import { useState, useRef } from "react";
import { Link } from "wouter";
import {
  Check, CreditCard, Smartphone, Building2,
  Lock, ChevronLeft, ChevronRight, Truck, Zap, Clock, Download,
  User, Mail, Phone, MapPin, Home, Globe, X, Upload, ChevronDown,
} from "lucide-react";

const ORDER_ITEMS = [
  { id: "i1", name: "iPhone 15 Pro Max 256GB", variant: "Natural Titanium", qty: 1, price: 1199.00, image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=100&q=80" },
  { id: "i2", name: "AirPods Pro 2 (USB-C)", variant: "White", qty: 1, price: 249.00, image: "https://images.unsplash.com/photo-1606741965234-b2b9b2b1c0b5?w=100&q=80" },
];
const SUBTOTAL = ORDER_ITEMS.reduce((s, i) => s + i.price * i.qty, 0);
const DISCOUNT = 100;
const TAX = 80.88;

const SHIPPING_OPTIONS = [
  { id: "standard", label: "Standard Delivery", detail: "5–10 business days", price: 0, icon: Truck },
  { id: "express", label: "Express Delivery", detail: "2–3 business days", price: 15, icon: Zap },
  { id: "priority", label: "Priority Delivery", detail: "Next business day", price: 30, icon: Clock },
];

const CHECKOUT_METHODS = [
  {
    id: "mobile", label: "Mobile Money", sub: "MTN, Airtel, Zamtel",
    iconBg: "bg-yellow-50 dark:bg-yellow-900/20",
    icon: () => <Smartphone className="w-5 h-5 text-yellow-600" />,
  },
  {
    id: "card", label: "Card Payment", sub: "Visa, Mastercard & more",
    iconBg: "bg-blue-50 dark:bg-blue-900/20",
    icon: () => <CreditCard className="w-5 h-5 text-blue-600" />,
  },
  {
    id: "bank", label: "Bank Transfer", sub: "Local & International",
    iconBg: "bg-slate-50 dark:bg-slate-800",
    icon: () => <Building2 className="w-5 h-5 text-slate-600" />,
  },
  {
    id: "whatsapp", label: "WhatsApp Payment", sub: "Pay securely on WhatsApp",
    iconBg: "bg-green-50 dark:bg-green-900/20",
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#25D366">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    id: "apple", label: "Apple Pay", sub: "Pay with Apple Pay",
    iconBg: "bg-slate-50 dark:bg-slate-800",
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-foreground" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
  },
  {
    id: "google", label: "Google Pay", sub: "Pay with Google Pay",
    iconBg: "bg-white dark:bg-slate-800 border border-border",
    icon: () => (
      <span className="text-sm font-black leading-none">
        <span className="text-blue-500">G</span>
        <span className="text-red-500">o</span>
        <span className="text-yellow-500">o</span>
        <span className="text-blue-500">g</span>
        <span className="text-green-500">l</span>
        <span className="text-red-500">e</span>
      </span>
    ),
  },
  {
    id: "crypto", label: "Crypto Payment", sub: "USDT, BTC & more",
    iconBg: "bg-orange-50 dark:bg-orange-900/20",
    icon: () => <span className="text-sm font-black text-orange-500">₿</span>,
    comingSoon: true,
  },
];

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard?.writeText(text).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="text-xs text-primary font-semibold border border-primary/40 px-3 py-1 rounded-lg hover:bg-primary/5 transition-colors"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function SecureFooter() {
  return (
    <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1.5 pt-1">
      <Lock className="w-3 h-3" /> Secure &bull; Encrypted &bull; Safe
    </p>
  );
}

const STEPS = [
  { id: 1, label: "Details" },
  { id: 2, label: "Address" },
  { id: 3, label: "Shipping" },
  { id: 4, label: "Payment" },
];

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [ordered, setOrdered] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [country, setCountry] = useState("Ghana");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [zipCode, setZipCode] = useState("");

  const [shippingId, setShippingId] = useState("standard");
  const shippingPrice = SHIPPING_OPTIONS.find((s) => s.id === shippingId)?.price ?? 0;
  const total = SUBTOTAL - DISCOUNT + TAX + shippingPrice;

  const [openMethod, setOpenMethod] = useState<string | null>(null);
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const [mmProvider, setMmProvider] = useState("MTN Mobile Money");
  const [mmPhone, setMmPhone] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [proofFile, setProofFile] = useState<string | null>(null);

  const handlePlaceOrder = () => setOrdered(true);

  if (ordered) {
    const methodLabel = CHECKOUT_METHODS.find((m) => m.id === openMethod)?.label ?? "Card";
    const isManual = openMethod === "bank" || openMethod === "whatsapp";
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-background">
        <div className="w-full max-w-sm">
          <div className="rounded-3xl overflow-hidden" style={{ background: isManual ? "linear-gradient(160deg, #2d2000 0%, #5a3a00 100%)" : "linear-gradient(160deg, #07392f 0%, #0a5544 100%)" }}>
            <div className="p-8 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isManual ? "bg-yellow-400/20 border-4 border-yellow-400" : "bg-green-400/20 border-4 border-green-400"}`}>
                {isManual ? <Clock className="w-8 h-8 text-yellow-400" /> : <Check className="w-8 h-8 text-green-400" />}
              </div>
              <h2 className="text-xl font-black text-white mb-1">{isManual ? "Order Placed — Pending" : "Order Placed!"}</h2>
              <p className="text-white/60 text-sm mb-6">
                {isManual ? "We'll confirm your order once we verify your payment." : `Thank you${firstName ? `, ${firstName}` : ""}! Your order is confirmed.`}
              </p>
              {isManual && (
                <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-2xl p-3 mb-4 text-left">
                  <p className="text-yellow-300 text-xs font-semibold">What happens next?</p>
                  <p className="text-white/60 text-xs mt-1">
                    {openMethod === "whatsapp" ? "Our team will contact you on WhatsApp to confirm your payment." : "Send your proof of transfer to support. Once confirmed, your order will be processed."}
                  </p>
                </div>
              )}
              <div className="bg-white/10 rounded-2xl p-4 text-left space-y-2.5 mb-6">
                {[
                  ["Order ID", "KRY-2024-00012345"],
                  ["Total", `$${total.toFixed(2)}`],
                  ["Payment", methodLabel],
                  ["Status", isManual ? "⏳ Pending Confirmation" : "✅ Confirmed"],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-white/60 text-xs">{label}</span>
                    <span className="text-white text-xs font-bold">{val}</span>
                  </div>
                ))}
              </div>
              <button className="w-full py-3.5 bg-white/20 border border-white/30 text-white rounded-2xl font-bold text-sm mb-2.5 flex items-center justify-center gap-2 hover:bg-white/30 transition-colors">
                <Download className="w-4 h-4" /> Download Receipt
              </button>
              <Link href="/track">
                <button className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold text-sm mb-2.5 hover:bg-primary/90 transition-colors">Track My Order</button>
              </Link>
              <Link href="/">
                <button className="w-full py-3.5 border border-white/30 text-white rounded-2xl font-bold text-sm hover:bg-white/10 transition-colors">Continue Shopping</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/cart">
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
        </Link>
        <span className="text-base font-black text-foreground">KRY<span className="text-primary">ROS</span></span>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
          <Lock className="w-3.5 h-3.5" /> Secure
        </div>
      </div>
    <div className="max-w-lg mx-auto px-4 py-5 pb-32 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-black text-foreground">Checkout</h1>
      </div>
      <p className="text-xs text-muted-foreground mb-5">Complete your order in a few easy steps</p>

      {/* Step indicator */}
      <div className="flex items-center mb-6">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2
                ${i + 1 < step ? "bg-primary border-primary text-white"
                  : i + 1 === step ? "bg-primary border-primary text-white ring-4 ring-primary/20"
                  : "bg-background border-border text-muted-foreground"}`}>
                {i + 1 < step ? <Check className="w-3.5 h-3.5" /> : s.id}
              </div>
              <span className={`text-[10px] mt-1 font-bold ${i + 1 <= step ? "text-primary" : "text-muted-foreground"}`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 -mt-4 transition-all ${i + 1 < step ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── STEP 1: PERSONAL DETAILS ── */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <h2 className="text-sm font-bold text-foreground">Your Details</h2>
            <p className="text-xs text-muted-foreground">We need these details for your order confirmation.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground mb-1.5">First Name</label>
                <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 bg-background focus-within:ring-2 focus-within:ring-primary/30">
                  <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John"
                    className="flex-1 text-sm text-foreground outline-none bg-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground mb-1.5">Last Name</label>
                <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 bg-background focus-within:ring-2 focus-within:ring-primary/30">
                  <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe"
                    className="flex-1 text-sm text-foreground outline-none bg-transparent" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground mb-1.5">Email Address</label>
              <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 bg-background focus-within:ring-2 focus-within:ring-primary/30">
                <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@email.com" type="email"
                  className="flex-1 text-sm text-foreground outline-none bg-transparent" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground mb-1.5">Phone Number</label>
              <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 bg-background focus-within:ring-2 focus-within:ring-primary/30">
                <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+233 24 123 4567" type="tel"
                  className="flex-1 text-sm text-foreground outline-none bg-transparent" />
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!firstName || !lastName || !email || !phone}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all mt-2
                ${firstName && lastName && email && phone ? "bg-primary text-white hover:bg-primary/90 active:scale-95" : "bg-muted text-muted-foreground cursor-not-allowed"}`}
            >
              Continue to Address <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: SHIPPING ADDRESS ── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <h2 className="text-sm font-bold text-foreground">Shipping Address</h2>
            <p className="text-xs text-muted-foreground">Enter where you'd like your order delivered.</p>
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground mb-1.5">Country</label>
              <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 bg-background focus-within:ring-2 focus-within:ring-primary/30">
                <Globe className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <select value={country} onChange={(e) => setCountry(e.target.value)}
                  className="flex-1 text-sm text-foreground outline-none bg-transparent">
                  <option>Ghana</option><option>Nigeria</option><option>Kenya</option>
                  <option>Zambia</option><option>Uganda</option><option>Tanzania</option>
                  <option>South Africa</option><option>United Kingdom</option>
                  <option>United States</option><option>Canada</option>
                  <option>Germany</option><option>France</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground mb-1.5">State / Region</label>
                <input value={state} onChange={(e) => setState(e.target.value)} placeholder="Greater Accra"
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 bg-background text-foreground" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground mb-1.5">City</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Accra"
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 bg-background text-foreground" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground mb-1.5">Street Address</label>
              <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 bg-background focus-within:ring-2 focus-within:ring-primary/30">
                <Home className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <input value={addressLine} onChange={(e) => setAddressLine(e.target.value)} placeholder="123 Main Street, Apt 4B"
                  className="flex-1 text-sm text-foreground outline-none bg-transparent" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground mb-1.5">Postal / ZIP Code (optional)</label>
              <input value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="00233"
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 bg-background text-foreground" />
            </div>
            {country && city && addressLine && (
              <div className="bg-muted/40 rounded-xl p-3 flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">{[addressLine, city, state, country, zipCode].filter(Boolean).join(", ")}</p>
              </div>
            )}
            <button
              onClick={() => setStep(3)}
              disabled={!city || !addressLine}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all mt-2
                ${city && addressLine ? "bg-primary text-white hover:bg-primary/90 active:scale-95" : "bg-muted text-muted-foreground cursor-not-allowed"}`}
            >
              Continue to Shipping <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => setStep(1)} className="w-full text-xs text-muted-foreground text-center hover:text-primary transition-colors">
              ← Back to Details
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: SHIPPING METHOD ── */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-4">
            <h2 className="text-sm font-bold text-foreground mb-3">Your Items ({ORDER_ITEMS.length})</h2>
            <div className="space-y-3">
              {ORDER_ITEMS.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">{item.variant} · Qty: {item.qty}</p>
                  </div>
                  <span className="text-xs font-bold text-foreground">${item.price.toLocaleString("en", { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <h2 className="text-sm font-bold text-foreground mb-3">Choose Shipping Method</h2>
            <div className="space-y-2">
              {SHIPPING_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = shippingId === opt.id;
                return (
                  <button key={opt.id} onClick={() => setShippingId(opt.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left
                      ${isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? "border-primary" : "border-muted-foreground"}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-foreground">{opt.label}</p>
                      <p className="text-[10px] text-muted-foreground">{opt.detail}</p>
                    </div>
                    <span className={`text-sm font-black ${opt.price === 0 ? "text-green-600" : "text-foreground"}`}>
                      {opt.price === 0 ? "Free" : `+$${opt.price.toFixed(2)}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
            <h2 className="text-sm font-bold text-foreground mb-3">Order Summary</h2>
            <div className="space-y-1.5 text-xs">
              {[
                ["Subtotal", `$${SUBTOTAL.toLocaleString("en", { minimumFractionDigits: 2 })}`],
                ["Shipping", shippingPrice === 0 ? "Free" : `$${shippingPrice.toFixed(2)}`],
                ["Discount", `-$${DISCOUNT.toFixed(2)}`],
                ["Tax", `$${TAX.toFixed(2)}`],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-muted-foreground">{l}</span>
                  <span className={`font-semibold ${l === "Discount" ? "text-red-500" : "text-foreground"}`}>{v}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-primary/20">
                <span className="font-black text-foreground">Total</span>
                <span className="font-black text-primary text-base">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <button onClick={() => setStep(4)}
            className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all">
            Continue to Payment <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => setStep(2)} className="w-full text-xs text-muted-foreground text-center hover:text-primary transition-colors">
            ← Back to Address
          </button>
        </div>
      )}

      {/* ── STEP 4: PAYMENT ── */}
      {step === 4 && (
        <div className="space-y-4">
          {/* You are paying summary */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">You are paying</span>
              <button onClick={() => setStep(3)} className="text-xs text-primary font-semibold hover:underline">Change</button>
            </div>
            <p className="text-3xl font-black text-foreground">USD {total.toFixed(2)}</p>
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Order Total</span>
                <span className="font-semibold text-foreground">USD {(total - TAX).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-semibold text-foreground">USD {TAX.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Method list */}
          <div>
            <p className="text-sm font-bold text-foreground mb-3">Choose payment method</p>
            <div className="space-y-2">
              {CHECKOUT_METHODS.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => !m.comingSoon && setOpenMethod(m.id)}
                    disabled={m.comingSoon}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all text-left
                      ${m.comingSoon ? "border-border opacity-60 cursor-not-allowed bg-card" : "border-border bg-card hover:border-primary/50 hover:bg-primary/[0.02] active:scale-[0.99]"}`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${m.iconBg}`}>
                      <Icon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">{m.label}</p>
                      <p className="text-[11px] text-muted-foreground">{m.sub}</p>
                    </div>
                    {m.comingSoon ? (
                      <span className="text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 px-2 py-0.5 rounded-full flex-shrink-0">
                        Coming Soon
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={() => setStep(3)} className="w-full text-xs text-muted-foreground text-center hover:text-primary transition-colors">
            ← Back to Shipping
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════
          PAYMENT METHOD BOTTOM SHEET
      ══════════════════════════════════════════ */}
      {openMethod && step === 4 && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpenMethod(null)} />
          <div className="relative bg-background rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>
            <div className="px-5 pb-8 space-y-4">
              {/* Sheet header */}
              <div className="flex items-center justify-between pt-1 pb-2">
                {(() => {
                  const m = CHECKOUT_METHODS.find((x) => x.id === openMethod)!;
                  const Icon = m.icon;
                  return (
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${m.iconBg}`}>
                        <Icon />
                      </div>
                      <span className="text-base font-black text-foreground">{m.label}</span>
                    </div>
                  );
                })()}
                <button onClick={() => setOpenMethod(null)}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                  <X className="w-4 h-4 text-foreground" />
                </button>
              </div>

              {/* ── MOBILE MONEY ── */}
              {openMethod === "mobile" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">Provider</label>
                    <div className="flex items-center gap-2 border border-border rounded-2xl px-3.5 py-3 bg-background focus-within:ring-2 focus-within:ring-primary/30">
                      <div className="w-6 h-6 rounded-md bg-yellow-400 flex items-center justify-center flex-shrink-0">
                        <span className="text-[8px] font-black text-black">MTN</span>
                      </div>
                      <select value={mmProvider} onChange={(e) => setMmProvider(e.target.value)}
                        className="flex-1 text-sm text-foreground outline-none bg-transparent">
                        <option>MTN Mobile Money</option>
                        <option>Airtel Money</option>
                        <option>Zamtel Money</option>
                        <option>M-Pesa</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">Mobile Money Number</label>
                    <div className="flex items-center gap-2 border border-border rounded-2xl px-3.5 py-3 bg-background focus-within:ring-2 focus-within:ring-primary/30">
                      <Smartphone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <input value={mmPhone} onChange={(e) => setMmPhone(e.target.value)}
                        placeholder="+260 97 123 4567" type="tel"
                        className="flex-1 text-sm text-foreground outline-none bg-transparent" />
                    </div>
                  </div>
                  <div className="bg-primary/5 border border-primary/15 rounded-2xl px-4 py-3">
                    <p className="text-[11px] text-muted-foreground">A payment prompt will be sent to your mobile phone. Please approve it to complete the payment.</p>
                  </div>
                  <div className="border-t border-border pt-4 space-y-1.5">
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">You are sending</span><span className="font-semibold text-foreground">USD {total.toFixed(2)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Order Total</span><span className="font-semibold text-foreground">USD {(total - TAX).toFixed(2)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Tax</span><span className="font-semibold text-foreground">USD {TAX.toFixed(2)}</span></div>
                  </div>
                  <button onClick={handlePlaceOrder}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all">
                    <Smartphone className="w-4 h-4" /> Pay USD {total.toFixed(2)}
                  </button>
                  <SecureFooter />
                </div>
              )}

              {/* ── CARD PAYMENT ── */}
              {openMethod === "card" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">Card Number</label>
                    <div className="flex items-center gap-2 border border-border rounded-2xl px-3.5 py-3 bg-background focus-within:ring-2 focus-within:ring-primary/30">
                      <input value={cardNum} onChange={(e) => setCardNum(e.target.value)} placeholder="1234 5678 9012 3456"
                        className="flex-1 text-sm text-foreground outline-none bg-transparent" />
                      <CreditCard className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">Expiry Date</label>
                      <input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM / YY"
                        className="w-full border border-border rounded-2xl px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 bg-background text-foreground" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">CVV</label>
                      <input value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="123" type="password"
                        className="w-full border border-border rounded-2xl px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 bg-background text-foreground" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">Cardholder Name</label>
                    <input value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="John Doe"
                      className="w-full border border-border rounded-2xl px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 bg-background text-foreground" />
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs font-semibold text-foreground">Save card for future payments</span>
                    <button onClick={() => setSaveCard(!saveCard)}
                      className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${saveCard ? "bg-primary" : "bg-muted"}`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow absolute top-1 transition-transform ${saveCard ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                  <div className="border-t border-border pt-4 space-y-1.5">
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">You are sending</span><span className="font-semibold text-foreground">USD {total.toFixed(2)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Order Total</span><span className="font-semibold text-foreground">USD {(total - TAX).toFixed(2)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Tax</span><span className="font-semibold text-foreground">USD {TAX.toFixed(2)}</span></div>
                  </div>
                  <button onClick={handlePlaceOrder}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all">
                    <Lock className="w-4 h-4" /> Pay USD {total.toFixed(2)}
                  </button>
                  <p className="text-[10px] text-center text-muted-foreground">
                    By placing your order, you agree to our <Link href="/terms"><span className="text-primary underline cursor-pointer">Terms</span></Link>
                  </p>
                  <SecureFooter />
                </div>
              )}

              {/* ── BANK TRANSFER ── */}
              {openMethod === "bank" && (
                <div className="space-y-4">
                  <div className="bg-primary/5 border border-primary/15 rounded-2xl px-4 py-3 flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-muted-foreground">Please transfer the exact amount to the account below and use your payment reference as payment note.</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Bank Name", val: "Stanbic Bank Zambia" },
                      { label: "Account Name", val: "KRYROS LIMITED" },
                      { label: "Account Number", val: "91200012345667" },
                      { label: "Reference", val: "#KRY-2024-00012345" },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <p className="text-[10px] text-muted-foreground">{label}</p>
                          <p className="text-sm font-bold text-foreground">{val}</p>
                        </div>
                        <CopyBtn text={val} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground mb-2">Upload Payment Proof (Optional)</p>
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl py-6 cursor-pointer hover:border-primary/40 hover:bg-primary/[0.02] transition-colors"
                      onClick={() => fileRef.current?.click()}>
                      <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                      <p className="text-xs font-semibold text-foreground">{proofFile ?? "Choose File or Drag & Drop"}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG, PDF up to 10MB</p>
                      <input ref={fileRef} type="file" className="hidden" accept=".png,.jpg,.jpeg,.pdf"
                        onChange={(e) => setProofFile(e.target.files?.[0]?.name ?? null)} />
                    </label>
                  </div>
                  <div className="border-t border-border pt-4 space-y-1.5">
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">You are sending</span><span className="font-semibold text-foreground">USD {total.toFixed(2)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Order Total</span><span className="font-semibold text-foreground">USD {(total - TAX).toFixed(2)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Tax</span><span className="font-semibold text-foreground">USD {TAX.toFixed(2)}</span></div>
                  </div>
                  <button onClick={handlePlaceOrder}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all">
                    <Check className="w-4 h-4" /> I Have Made the Transfer
                  </button>
                  <SecureFooter />
                </div>
              )}

              {/* ── WHATSAPP ── */}
              {openMethod === "whatsapp" && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center py-6 gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-9 h-9" fill="#25D366">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <p className="text-sm text-center text-muted-foreground px-4">You will be redirected to WhatsApp to complete your payment securely.</p>
                  </div>
                  <div className="border-t border-border pt-4 space-y-1.5">
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">You are sending</span><span className="font-semibold text-foreground">USD {total.toFixed(2)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Order Total</span><span className="font-semibold text-foreground">USD {(total - TAX).toFixed(2)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Tax</span><span className="font-semibold text-foreground">USD {TAX.toFixed(2)}</span></div>
                  </div>
                  <button onClick={handlePlaceOrder}
                    className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#1ebe5d] active:scale-95 transition-all">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Continue on WhatsApp
                  </button>
                  <SecureFooter />
                </div>
              )}

              {/* ── APPLE PAY ── */}
              {openMethod === "apple" && (
                <div className="space-y-4">
                  <p className="text-xs text-center text-muted-foreground">Authenticate with Face ID or Touch ID to complete payment.</p>
                  <div className="border-t border-border pt-4 space-y-1.5">
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">You are sending</span><span className="font-semibold text-foreground">USD {total.toFixed(2)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Order Total</span><span className="font-semibold text-foreground">USD {(total - TAX).toFixed(2)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Tax</span><span className="font-semibold text-foreground">USD {TAX.toFixed(2)}</span></div>
                  </div>
                  <button onClick={handlePlaceOrder}
                    className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                    style={{ background: "#000", color: "#fff" }}>
                     Buy with Apple Pay
                  </button>
                  <SecureFooter />
                </div>
              )}

              {/* ── GOOGLE PAY ── */}
              {openMethod === "google" && (
                <div className="space-y-4">
                  <p className="text-xs text-center text-muted-foreground">You'll be redirected to Google Pay to complete your payment.</p>
                  <div className="border-t border-border pt-4 space-y-1.5">
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">You are sending</span><span className="font-semibold text-foreground">USD {total.toFixed(2)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Order Total</span><span className="font-semibold text-foreground">USD {(total - TAX).toFixed(2)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Tax</span><span className="font-semibold text-foreground">USD {TAX.toFixed(2)}</span></div>
                  </div>
                  <button onClick={handlePlaceOrder}
                    className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all border border-border"
                    style={{ background: "#fff", color: "#000" }}>
                    <span className="font-black text-lg">
                      <span className="text-blue-500">G</span><span className="text-red-500">o</span>
                      <span className="text-yellow-500">o</span><span className="text-blue-500">g</span>
                      <span className="text-green-500">l</span><span className="text-red-500">e</span>
                    </span>
                    &nbsp;Pay
                  </button>
                  <SecureFooter />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
