"use client"

import { useState } from "react"
import { useCurrency } from "@/providers/CurrencyProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  CreditCard, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Smartphone,
  ShieldCheck,
  ArrowRight
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function DirectPayPage() {
  const router = useRouter()
  const { convertPrice, selectedCountry: currencyCountry } = useCurrency()
  const [amount, setAmount] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"AMOUNT" | "PAYMENT" | "COMPLETE">("AMOUNT")
  const [paymentMethod, setPaymentMethod] = useState<"MOBILE_MONEY" | "WHATSAPP" | "BANK_TRANSFER">("MOBILE_MONEY")
  const [paymentPhone, setPaymentPhone] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleNext = () => {
    if (step === "AMOUNT") {
      if (!amount || parseFloat(amount) <= 0) {
        setError("Please enter a valid amount")
        return
      }
      setError(null)
      setStep("PAYMENT")
    }
  }

  const handlePayment = async () => {
    setLoading(true)
    // Here we would integrate with your payment API
    // For now, simulating success
    setTimeout(() => {
      setLoading(false)
      setStep("COMPLETE")
    }, 2000)
  }

  const currencySymbol = currencyCountry?.currencySymbol || "ZK"

  return (
    <main className="min-h-screen bg-slate-50 py-12 md:py-24">
      <div className="container-custom px-4">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 space-y-2">
            <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">Direct Payment</h1>
            <p className="text-slate-500 font-medium">Enter amount and pay securely</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in zoom-in">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            {step === "AMOUNT" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Amount to Pay ({currencySymbol})</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">{currencySymbol}</span>
                    <Input 
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-20 pl-16 text-3xl font-black rounded-3xl border-2 border-slate-100 focus:border-primary focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Payment Description (Optional)</label>
                  <Input 
                    placeholder="e.g. Store Purchase, Service Fee"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-14 rounded-2xl border-2 border-slate-100 focus:border-primary transition-all"
                  />
                </div>

                <Button 
                  onClick={handleNext}
                  className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 gap-2"
                >
                  Continue to Payment <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {step === "PAYMENT" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Total Amount</p>
                  <p className="text-3xl font-black text-slate-900">{currencySymbol}{parseFloat(amount).toLocaleString()}</p>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Select Payment Method</label>
                  <div className="grid gap-3">
                    {[
                      { id: "MOBILE_MONEY", label: "Mobile Money", icon: Smartphone, desc: "Airtel, MTN, Zamtel" },
                      { id: "WHATSAPP", label: "WhatsApp Pay", icon: CheckCircle2, desc: "Confirm via WhatsApp" },
                      { id: "BANK_TRANSFER", label: "Bank Transfer", icon: CreditCard, desc: "Direct deposit" },
                    ].map((m) => (
                      <div 
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                          paymentMethod === m.id ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${paymentMethod === m.id ? "bg-primary text-white" : "bg-slate-100 text-slate-400"}`}>
                            <m.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 uppercase text-xs tracking-tight">{m.label}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{m.desc}</p>
                          </div>
                        </div>
                        {paymentMethod === m.id && <CheckCircle2 className="h-5 w-5 text-primary" />}
                      </div>
                    ))}
                  </div>
                </div>

                {paymentMethod === "MOBILE_MONEY" && (
                  <div className="space-y-4 animate-in slide-in-from-top-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Phone Number</label>
                    <Input 
                      placeholder="+260..."
                      value={paymentPhone}
                      onChange={(e) => setPaymentPhone(e.target.value)}
                      className="h-14 rounded-2xl border-2 border-slate-100 focus:border-primary transition-all"
                    />
                  </div>
                )}

                <div className="flex gap-4">
                  <Button 
                    variant="outline"
                    onClick={() => setStep("AMOUNT")}
                    className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs border-slate-200"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handlePayment}
                    disabled={loading || (paymentMethod === "MOBILE_MONEY" && !paymentPhone)}
                    className="flex-[2] h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                  >
                    {loading ? "Processing..." : "Pay Now"}
                  </Button>
                </div>
              </div>
            )}

            {step === "COMPLETE" && (
              <div className="py-8 text-center space-y-8 animate-in zoom-in duration-500">
                <div className="h-24 w-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-100/50">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">Payment Successful!</h2>
                  <p className="text-slate-500 max-w-sm mx-auto font-medium">
                    Your payment of {currencySymbol}{parseFloat(amount).toLocaleString()} has been processed successfully.
                  </p>
                </div>
                <div className="pt-4 flex flex-col gap-3">
                  <Button 
                    onClick={() => router.push("/")}
                    className="h-14 rounded-2xl font-black uppercase tracking-widest text-xs"
                  >
                    Back to Home
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setStep("AMOUNT")
                      setAmount("")
                      setDescription("")
                    }}
                    className="h-14 rounded-2xl font-black uppercase tracking-widest text-xs border-slate-200"
                  >
                    Make Another Payment
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex items-center justify-center gap-8 opacity-50 grayscale">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Secure SSL</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
