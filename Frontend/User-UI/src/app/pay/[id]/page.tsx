"use client"

import { useState, useEffect } from "react"
import { useCurrency } from "@/providers/CurrencyProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  Smartphone,
  ShieldCheck,
  Lock,
  ArrowRight
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"

export default function LockedPayPage() {
  const { id } = useParams()
  const router = useRouter()
  const { selectedCountry: currencyCountry } = useCurrency()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"SUMMARY" | "PAYMENT" | "COMPLETE">("SUMMARY")
  const [paymentMethod, setPaymentMethod] = useState<"MOBILE_MONEY" | "WHATSAPP" | "BANK_TRANSFER">("MOBILE_MONEY")
  const [paymentPhone, setPaymentPhone] = useState("")
  
  // Simulating fetching the locked link data
  const [linkData, setLinkData] = useState<any>(null)

  useEffect(() => {
    // In a real app, you would fetch the amount and description using the 'id'
    setLinkData({
      amount: 500, // Locked amount from admin
      description: "Service Fee for Custom Order #552",
      reference: id
    })
  }, [id])

  const handlePayment = async () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep("COMPLETE")
    }, 2000)
  }

  const currencySymbol = currencyCountry?.currencySymbol || "ZK"

  if (!linkData) return null

  return (
    <main className="min-h-screen bg-slate-50 py-12 md:py-24">
      <div className="container-custom px-4">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 space-y-2">
            <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">Secure Payment</h1>
            <p className="text-slate-500 font-medium">This payment link has a fixed amount</p>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            {step === "SUMMARY" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="space-y-6">
                  <div className="p-8 bg-slate-50 rounded-3xl border-2 border-slate-100 text-center relative overflow-hidden">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Amount to Pay</p>
                    <p className="text-5xl font-black text-slate-900">{currencySymbol}{linkData.amount.toLocaleString()}</p>
                    <div className="absolute top-4 right-4 text-primary opacity-20">
                      <Lock className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Payment Description</label>
                    <div className="p-4 bg-white border border-slate-100 rounded-xl text-sm font-medium text-slate-600">
                      {linkData.description}
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => setStep("PAYMENT")}
                  className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 gap-2"
                >
                  Choose Payment Method <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {step === "PAYMENT" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
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
                    onClick={() => setStep("SUMMARY")}
                    className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs border-slate-200"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handlePayment}
                    disabled={loading || (paymentMethod === "MOBILE_MONEY" && !paymentPhone)}
                    className="flex-[2] h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                  >
                    {loading ? "Processing..." : `Pay ${currencySymbol}${linkData.amount.toLocaleString()}`}
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
                    Your payment of {currencySymbol}{linkData.amount.toLocaleString()} has been processed successfully.
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ref: {id}</p>
                </div>
                <Button 
                  onClick={() => router.push("/")}
                  className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                  Return to Website
                </Button>
              </div>
            )}
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex items-center justify-center gap-8 opacity-50 grayscale">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Locked Amount</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
