import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  ChevronLeft, Lock, ChevronDown, ChevronRight, X,
  Smartphone, CreditCard, Building2, Check, Upload,
} from "lucide-react";

const FEE_RATE = 0.01;

function calcFee(amount: number) {
  return Math.round(amount * FEE_RATE * 100) / 100;
}

const CURRENCIES = [
  { code: "USD", label: "US Dollar", flag: "🇺🇸" },
  { code: "ZMW", label: "Zambian Kwacha", flag: "🇿🇲" },
  { code: "GHS", label: "Ghanaian Cedi", flag: "🇬🇭" },
  { code: "NGN", label: "Nigerian Naira", flag: "🇳🇬" },
  { code: "KES", label: "Kenyan Shilling", flag: "🇰🇪" },
  { code: "GBP", label: "British Pound", flag: "🇬🇧" },
];

const METHODS = [
  {
    id: "mobile",
    label: "Mobile Money",
    sub: "MTN, Airtel, Zamtel",
    icon: Smartphone,
    iconBg: "bg-yellow-50 dark:bg-yellow-900/20",
    iconColor: "text-yellow-600",
  },
  {
    id: "card",
    label: "Card Payment",
    sub: "Visa, Mastercard & more",
    icon: CreditCard,
    iconBg: "bg-blue-50 dark:bg-blue-900/20",
    iconColor: "text-blue-600",
  },
  {
    id: "bank",
    label: "Bank Transfer",
    sub: "Local & International",
    icon: Building2,
    iconBg: "bg-slate-50 dark:bg-slate-800",
    iconColor: "text-slate-600",
  },
  {
    id: "whatsapp",
    label: "WhatsApp Payment",
    sub: "Pay securely on WhatsApp",
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#25D366">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    iconBg: "bg-green-50 dark:bg-green-900/20",
    iconColor: "text-green-600",
  },
  {
    id: "apple",
    label: "Apple Pay",
    sub: "Pay with Apple Pay",
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-foreground" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
    iconBg: "bg-slate-50 dark:bg-slate-800",
    iconColor: "text-foreground",
  },
  {
    id: "google",
    label: "Google Pay",
    sub: "Pay with Google Pay",
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
        <text x="1" y="17" fontSize="14" fontWeight="bold">
          <tspan fill="#4285F4">G</tspan>
        </text>
      </svg>
    ),
    iconBg: "bg-white dark:bg-slate-800 border border-border",
    iconColor: "",
    customIcon: (
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
    id: "crypto",
    label: "Crypto Payment",
    sub: "USDT, BTC & more",
    icon: () => <span className="text-xs font-black text-orange-500">₿</span>,
    iconBg: "bg-orange-50 dark:bg-orange-900/20",
    iconColor: "text-orange-500",
    comingSoon: true,
  },
];

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(text).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
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

function AmountSummaryBar({ amount, fee, currency }: { amount: number; fee: number; currency: string }) {
  const total = amount + fee;
  return (
    <div className="border-t border-border pt-4 mt-2 space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Amount</span>
        <span className="font-semibold text-foreground">{currency} {amount.toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Fee</span>
        <span className="font-semibold text-foreground">{currency} {fee.toFixed(2)}</span>
      </div>
    </div>
  );
}

export default function PayPage() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<1 | 2>(1);
  const [success, setSuccess] = useState(false);

  const [rawAmount, setRawAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [showCurrencyDrop, setShowCurrencyDrop] = useState(false);
  const [note, setNote] = useState("");

  const [openMethod, setOpenMethod] = useState<string | null>(null);

  const amount = parseFloat(rawAmount) || 0;
  const fee = calcFee(amount);
  const total = amount + fee;
  const currencyObj = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];

  // Card
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [saveCard, setSaveCard] = useState(false);

  // Mobile money
  const [mmProvider, setMmProvider] = useState("MTN Mobile Money");
  const [mmPhone, setMmPhone] = useState("");

  // Bank proof file
  const fileRef = useRef<HTMLInputElement>(null);
  const [proofFile, setProofFile] = useState<string | null>(null);

  const handlePay = () => setSuccess(true);

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="rounded-3xl overflow-hidden" style={{ background: "linear-gradient(160deg, #07392f 0%, #0a5544 100%)" }}>
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-400/20 border-4 border-green-400 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-black text-white mb-1">Payment Successful!</h2>
              <p className="text-white/60 text-sm mb-6">Your payment has been processed securely.</p>
              <div className="bg-white/10 rounded-2xl p-4 text-left space-y-2.5 mb-6">
                {[
                  ["Reference", "PAY-2024-00123345"],
                  ["Amount Paid", `${currency} ${total.toFixed(2)}`],
                  ["Method", METHODS.find((m) => m.id === openMethod)?.label ?? "—"],
                  ["Date", new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-white/60 text-xs">{label}</span>
                    <span className="text-white text-xs font-bold">{val}</span>
                  </div>
                ))}
              </div>
              <Link href="/">
                <button className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 transition-colors">
                  Back to Home
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-32 min-h-screen relative">
      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => (step === 2 ? setStep(1) : navigate("/"))}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-base font-black text-foreground">Pay</h1>
        <div className="flex items-center gap-1 text-[11px] text-primary font-semibold">
          <Lock className="w-3 h-3" /> Secure Payment
        </div>
      </div>

      {/* ══════════════════════════════════════════
          STEP 1 — Enter Amount
      ══════════════════════════════════════════ */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-black text-foreground">Make a Payment</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Send money securely to KRYROS</p>
          </div>

          {/* Amount input */}
          <div className="border-2 border-border rounded-2xl px-4 py-3 bg-background focus-within:border-primary/60 transition-colors">
            <label className="block text-[10px] font-semibold text-muted-foreground mb-1.5">Enter Amount</label>
            <div className="flex items-center gap-3">
              <input
                value={rawAmount}
                onChange={(e) => setRawAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0.00"
                inputMode="decimal"
                className="flex-1 text-3xl font-black text-foreground outline-none bg-transparent placeholder:text-muted-foreground/40"
              />
              <button
                onClick={() => setShowCurrencyDrop(!showCurrencyDrop)}
                className="flex items-center gap-1.5 border border-border rounded-xl px-2.5 py-1.5 bg-muted/30 hover:bg-muted transition-colors flex-shrink-0"
              >
                <span className="text-base leading-none">{currencyObj.flag}</span>
                <span className="text-xs font-bold text-foreground">{currency}</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
            {showCurrencyDrop && (
              <div className="mt-2 border border-border rounded-xl bg-card shadow-lg overflow-hidden z-10 relative">
                {CURRENCIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => { setCurrency(c.code); setShowCurrencyDrop(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-muted transition-colors text-sm ${currency === c.code ? "bg-primary/5 font-bold text-primary" : "text-foreground"}`}
                  >
                    <span className="text-base">{c.flag}</span>
                    <span className="font-semibold">{c.code}</span>
                    <span className="text-muted-foreground text-xs">— {c.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Currency selector row */}
          <div className="border border-border rounded-2xl px-4 py-3 bg-background">
            <label className="block text-[10px] font-semibold text-muted-foreground mb-1.5">Select Currency</label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{currencyObj.flag}</span>
                <span className="text-sm font-semibold text-foreground">{currency} — {currencyObj.label}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Note */}
          <div className="border border-border rounded-2xl px-4 py-3 bg-background focus-within:border-primary/60 transition-colors">
            <label className="block text-[10px] font-semibold text-muted-foreground mb-1.5">Add a note (optional)</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g Meal payment, Invoice, Support..."
              className="w-full text-sm text-foreground outline-none bg-transparent placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Payment Summary */}
          <div className="border border-border rounded-2xl px-4 py-4 bg-background space-y-2">
            <p className="text-sm font-bold text-foreground mb-3">Payment Summary</p>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold text-foreground">{currency} {amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Processing Fee</span>
              <span className="font-semibold text-foreground">{currency} {fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-black pt-2 border-t border-border">
              <span className="text-foreground">Total Payable</span>
              <span className="text-primary">{currency} {total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => amount > 0 && setStep(2)}
            disabled={amount <= 0}
            className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all
              ${amount > 0 ? "bg-primary text-white hover:bg-primary/90 active:scale-95" : "bg-muted text-muted-foreground cursor-not-allowed"}`}
          >
            <Lock className="w-4 h-4" /> Continue to Payment
          </button>
          <SecureFooter />
        </div>
      )}

      {/* ══════════════════════════════════════════
          STEP 2 — Choose Payment Method
      ══════════════════════════════════════════ */}
      {step === 2 && (
        <div className="space-y-4">
          {/* You are sending */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">You are sending</span>
              <button onClick={() => setStep(1)} className="text-xs text-primary font-semibold hover:underline">Change</button>
            </div>
            <p className="text-3xl font-black text-foreground">{currency} {total.toFixed(2)}</p>
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold text-foreground">{currency} {amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Processing Fee</span>
                <span className="font-semibold text-foreground">{currency} {fee.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Method list */}
          <div>
            <p className="text-sm font-bold text-foreground mb-3">Choose payment method</p>
            <div className="space-y-2">
              {METHODS.map((m) => {
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
                      {m.customIcon ?? <Icon />}
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
        </div>
      )}

      {/* ══════════════════════════════════════════
          PAYMENT METHOD PANELS (bottom sheet)
      ══════════════════════════════════════════ */}
      {openMethod && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpenMethod(null)}
          />
          <div className="relative bg-background rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Sheet drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            <div className="px-5 pb-8 space-y-4">
              {/* Sheet header */}
              <div className="flex items-center justify-between pt-1 pb-2">
                {(() => {
                  const m = METHODS.find((x) => x.id === openMethod)!;
                  const Icon = m.icon;
                  return (
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${m.iconBg}`}>
                        {m.customIcon ?? <Icon />}
                      </div>
                      <span className="text-base font-black text-foreground">{m.label}</span>
                    </div>
                  );
                })()}
                <button
                  onClick={() => setOpenMethod(null)}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
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
                      <select
                        value={mmProvider}
                        onChange={(e) => setMmProvider(e.target.value)}
                        className="flex-1 text-sm text-foreground outline-none bg-transparent"
                      >
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
                      <input
                        value={mmPhone}
                        onChange={(e) => setMmPhone(e.target.value)}
                        placeholder="+260 97 123 4567"
                        type="tel"
                        className="flex-1 text-sm text-foreground outline-none bg-transparent"
                      />
                    </div>
                  </div>
                  <div className="bg-primary/5 border border-primary/15 rounded-2xl px-4 py-3">
                    <p className="text-[11px] text-muted-foreground">
                      A payment prompt will be sent to your mobile phone. Please approve it to complete the payment.
                    </p>
                  </div>
                  <AmountSummaryBar amount={amount} fee={fee} currency={currency} />
                  <button
                    onClick={handlePay}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all"
                  >
                    <Smartphone className="w-4 h-4" /> Pay {currency} {total.toFixed(2)}
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
                      <input
                        value={cardNum}
                        onChange={(e) => setCardNum(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        inputMode="numeric"
                        className="flex-1 text-sm text-foreground outline-none bg-transparent"
                      />
                      <CreditCard className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">Expiry Date</label>
                      <input
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="MM / YY"
                        className="w-full border border-border rounded-2xl px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">CVV</label>
                      <input
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="123"
                        type="password"
                        className="w-full border border-border rounded-2xl px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 bg-background text-foreground"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">Cardholder Name</label>
                    <input
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full border border-border rounded-2xl px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 bg-background text-foreground"
                    />
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs font-semibold text-foreground">Save card for future payments</span>
                    <button
                      onClick={() => setSaveCard(!saveCard)}
                      className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${saveCard ? "bg-primary" : "bg-muted"}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow absolute top-1 transition-transform ${saveCard ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                  <AmountSummaryBar amount={amount} fee={fee} currency={currency} />
                  <button
                    onClick={handlePay}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all"
                  >
                    <Lock className="w-4 h-4" /> Pay {currency} {total.toFixed(2)}
                  </button>
                  <SecureFooter />
                </div>
              )}

              {/* ── BANK TRANSFER ── */}
              {openMethod === "bank" && (
                <div className="space-y-4">
                  <div className="bg-primary/5 border border-primary/15 rounded-2xl px-4 py-3 flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-muted-foreground">
                      Please transfer the exact amount to the account below and use your payment reference as payment note.
                    </p>
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
                    <label
                      className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl py-6 cursor-pointer hover:border-primary/40 hover:bg-primary/[0.02] transition-colors"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                      <p className="text-xs font-semibold text-foreground">
                        {proofFile ?? "Choose File or Drag & Drop"}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG, PDF up to 10MB</p>
                      <input
                        ref={fileRef}
                        type="file"
                        className="hidden"
                        accept=".png,.jpg,.jpeg,.pdf"
                        onChange={(e) => setProofFile(e.target.files?.[0]?.name ?? null)}
                      />
                    </label>
                  </div>
                  <AmountSummaryBar amount={amount} fee={fee} currency={currency} />
                  <button
                    onClick={handlePay}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all"
                  >
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
                    <p className="text-sm text-center text-muted-foreground px-4">
                      You will be redirected to WhatsApp to complete your payment securely.
                    </p>
                  </div>
                  <AmountSummaryBar amount={amount} fee={fee} currency={currency} />
                  <button
                    onClick={handlePay}
                    className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#1ebe5d] active:scale-95 transition-all"
                  >
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
                  <AmountSummaryBar amount={amount} fee={fee} currency={currency} />
                  <button
                    onClick={handlePay}
                    className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                    style={{ background: "#000", color: "#fff" }}
                  >
                     Buy with Apple Pay
                  </button>
                  <SecureFooter />
                </div>
              )}

              {/* ── GOOGLE PAY ── */}
              {openMethod === "google" && (
                <div className="space-y-4">
                  <p className="text-xs text-center text-muted-foreground">You'll be redirected to Google Pay to complete your payment.</p>
                  <AmountSummaryBar amount={amount} fee={fee} currency={currency} />
                  <button
                    onClick={handlePay}
                    className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all border border-border"
                    style={{ background: "#fff", color: "#000" }}
                  >
                    <span className="font-black text-lg">
                      <span className="text-blue-500">G</span>
                      <span className="text-red-500">o</span>
                      <span className="text-yellow-500">o</span>
                      <span className="text-blue-500">g</span>
                      <span className="text-green-500">l</span>
                      <span className="text-red-500">e</span>
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
  );
}
