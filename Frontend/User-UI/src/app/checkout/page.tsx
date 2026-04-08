"use client"

import { useCart } from "@/providers/CartProvider"
import { useCurrency } from "@/providers/CurrencyProvider"
import { cn, resolveImageUrl, generateWhatsAppMessage } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ShieldCheck,
  Truck,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Download
} from "lucide-react"
import Link from "next/link"
import { locationsApi, settingsApi, ordersApi } from "@/lib/api"
import { useRouter } from "next/navigation"
import { generateOrderPDF } from "@/lib/pdf-utils"

type CheckoutStep = "INFORMATION" | "SHIPPING" | "PAYMENT" | "COMPLETE"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getSubtotal, clearCart } = useCart()
  const { convertPrice, selectedCountry: currencyCountry } = useCurrency()
  const [step, setStep] = useState<CheckoutStep>("INFORMATION")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastCreatedOrder, setLastCreatedOrder] = useState<any | null>(null)
  
  // Locations Data
  const [countries, setCountries] = useState<any[]>([])
  const [states, setStates] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [shippingMethods, setShippingMethods] = useState<any[]>([])
  const selectedLocationCountry = countries.find(c => c.id === formData.countryId)

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    countryId: "",
    stateId: "",
    cityId: "",
    manualLocation: false,
    stateName: "",
    cityName: "",
    shippingMethodId: "",
    paymentMethod: "WHATSAPP", // Default to WhatsApp
  })

  // Load Initial Data
  useEffect(() => {
    locationsApi.getCountries().then(res => {
      if (res.data) setCountries(res.data)
    })
  }, [])

  // Load States when Country changes
  useEffect(() => {
    if (formData.countryId) {
      locationsApi.getStates(formData.countryId).then(res => {
        if (res.data) setStates(res.data)
        setCities([])
        setFormData(prev => ({ ...prev, stateId: "", cityId: "" }))
      })
    }
  }, [formData.countryId])

  // Load Cities when State changes
  useEffect(() => {
    if (formData.stateId) {
      locationsApi.getCities(formData.stateId).then(res => {
        if (res.data) setCities(res.data)
        setFormData(prev => ({ ...prev, cityId: "" }))
      })
    }
  }, [formData.stateId])

  // Load Shipping Methods when Step changes to SHIPPING
  useEffect(() => {
    if (step === "SHIPPING") {
      setLoading(true)
      locationsApi.getMatchingShipping(
        formData.countryId,
        formData.stateId,
        formData.cityId,
        formData.manualLocation,
        formData.stateName,
        formData.cityName
      ).then(res => {
        if (res.data && res.data.length > 0) {
          const methods = res.data;
          const firstId = methods[0].id;
          setShippingMethods(methods);
          setFormData(prev => ({ ...prev, shippingMethodId: firstId }));
        }
        setLoading(false)
      }).catch(() => setLoading(false))
    }
  }, [step, formData.countryId, formData.stateId, formData.cityId])

  if (items.length === 0 && step !== "COMPLETE") {
    return (
      <div className="container-custom min-h-[60vh] flex flex-col items-center justify-center py-12 text-center">
        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-4">Your cart is empty</h1>
        <Link href="/shop">
          <Button className="font-black uppercase tracking-widest px-8 h-12">Return to Shop</Button>
        </Link>
      </div>
    )
  }

  const handleNext = () => {
    if (step === "INFORMATION") {
      if (!formData.email || !formData.firstName || !formData.lastName || !formData.phone || !formData.street) {
        setError("Please fill in all required fields")
        return
      }
      setError(null)
      setStep("SHIPPING")
    } else if (step === "SHIPPING") {
      if (!formData.shippingMethodId) {
        setError("Please select a shipping method")
        return
      }
      setError(null)
      setStep("PAYMENT")
    }
  }

  const handleBack = () => {
    if (step === "SHIPPING") setStep("INFORMATION")
    else if (step === "PAYMENT") setStep("SHIPPING")
  }

  const getSelectedShipping = () => {
    return shippingMethods.find(m => m.id === formData.shippingMethodId)
  }

  const calculateTotal = () => {
    const subtotal = getSubtotal()
    const shipping = getSelectedShipping()?.price || 0
    return subtotal + parseFloat(shipping.toString())
  }

  const handlePlaceOrder = async () => {
    setLoading(true)
    setError(null)
    try {
      const subtotal = getSubtotal()
      const shippingFee = parseFloat((getSelectedShipping()?.price || 0).toString())
      const total = subtotal + shippingFee

      const orderData = {
        items: items.map(item => ({
          productId: item.product.id,
          variantId: item.variant?.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        addressDetails: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.street,
          countryId: formData.countryId,
          stateId: formData.stateId,
          cityId: formData.cityId,
          manual: formData.manualLocation,
          stateName: formData.stateName,
          cityName: formData.cityName,
        },
        paymentMethod: formData.paymentMethod,
        shippingMethodId: formData.shippingMethodId,
        subtotal: subtotal,
        shippingFee: shippingFee,
        total: total,
      }

      const res = await ordersApi.create(orderData)
      
      if (res.data) {
        const order = res.data
        setLastCreatedOrder(order)
        
        if (formData.paymentMethod === "WHATSAPP") {
          const message = generateWhatsAppMessage({
            orderNumber: order.orderNumber,
            orderId: order.id,
            customer: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              phone: formData.phone,
              email: formData.email,
            },
            address: {
              street: formData.street,
              city: cities.find(c => c.id === formData.cityId)?.name || formData.cityName,
              state: states.find(s => s.id === formData.stateId)?.name || formData.stateName,
              country: countries.find(c => c.id === formData.countryId)?.name || "Global",
            },
            items: items.map(item => ({
              name: item.product.name,
              quantity: item.quantity,
              price: convertPrice(parseFloat(item.product.price.toString())).amount,
              variant: item.variant?.name,
            })),
            subtotal: convertPrice(subtotal).amount,
            shipping: convertPrice(shippingFee).amount,
            total: convertPrice(total).amount,
            currency: { 
              code: currencyCountry?.currencyCode || "ZMW", 
              symbol: currencyCountry?.currencySymbol || "ZK" 
            },
          })
          
          const whatsappNumber = "+260971234567" // This should ideally come from settings
          window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank')
        }

        clearCart()
        setStep("COMPLETE")
      } else {
        setError(res.error || "Failed to place order")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 py-8 md:py-20 w-full overflow-x-hidden">
      <div className="container-custom px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
          {/* Checkout Steps */}
          <div className="flex-1 space-y-6 md:space-y-10">
            <div className="flex items-center gap-2 mb-6 md:mb-8 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {[
                { id: "INFORMATION", label: "Info", icon: User },
                { id: "SHIPPING", label: "Ship", icon: Truck },
                { id: "PAYMENT", label: "Pay", icon: CreditCard },
              ].map((s, idx) => (
                <div key={s.id} className="flex items-center gap-2 shrink-0">
                  <div className={`flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full border transition-all ${
                    step === s.id 
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                      : step === "COMPLETE" || (idx === 0 && step !== "INFORMATION") || (idx === 1 && step === "PAYMENT")
                      ? "bg-green-50 border-green-200 text-green-600"
                      : "bg-white border-slate-200 text-slate-400"
                  }`}>
                    <s.icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">{s.label}</span>
                  </div>
                  {idx < 2 && <div className="h-px w-4 md:w-8 bg-slate-200" />}
                </div>
              ))}
            </div>

            {error && (
              <div className="p-3 md:p-4 bg-red-50 border border-red-100 rounded-xl md:rounded-2xl flex items-center gap-3 text-red-600">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
                <p className="text-xs md:text-sm font-bold">{error}</p>
              </div>
            )}

            <div className="bg-white p-6 md:p-12 rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
              {step === "INFORMATION" && (
                <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid gap-4 md:gap-6">
                    <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-slate-900">Contact Info</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                        <Input 
                          placeholder="your@email.com" 
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="h-11 md:h-12 rounded-xl text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number</label>
                        <Input 
                          placeholder="+260..." 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="h-11 md:h-12 rounded-xl text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:gap-6">
                    <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-slate-900">Delivery Address</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">First Name</label>
                        <Input 
                          placeholder="John" 
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="h-11 md:h-12 rounded-xl text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Last Name</label>
                        <Input 
                          placeholder="Doe" 
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="h-11 md:h-12 rounded-xl text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Street Address</label>
                      <Input 
                        placeholder="House No, Street, Area" 
                        value={formData.street}
                        onChange={(e) => setFormData({...formData, street: e.target.value})}
                        className="h-11 md:h-12 rounded-xl text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Country</label>
                        <select 
                          className="w-full h-11 md:h-12 rounded-xl border border-slate-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white"
                          value={formData.countryId}
                          onChange={(e) => setFormData({...formData, countryId: e.target.value})}
                        >
                          <option value="">Select Country</option>
                          {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">State / Province</label>
                        <select 
                          className="w-full h-11 md:h-12 rounded-xl border border-slate-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white"
                          value={formData.stateId}
                          onChange={(e) => setFormData({...formData, stateId: e.target.value})}
                          disabled={!formData.countryId}
                        >
                          <option value="">Select State</option>
                          {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">City / Town</label>
                        <select 
                          className="w-full h-11 md:h-12 rounded-xl border border-slate-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white"
                          value={formData.cityId}
                          onChange={(e) => setFormData({...formData, cityId: e.target.value})}
                          disabled={!formData.stateId}
                        >
                          <option value="">Select City</option>
                          {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={handleNext}
                      className="w-full md:w-auto h-12 md:h-14 px-8 md:px-12 font-black uppercase tracking-widest rounded-xl md:rounded-2xl shadow-xl shadow-primary/20 text-xs md:text-sm"
                    >
                      Continue <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {step === "SHIPPING" && (
                <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-2">
                    <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-slate-900">Shipping Method</h3>
                    <p className="text-slate-500 text-xs md:text-sm">Select your preferred delivery option</p>
                  </div>

                  {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-4">
                      <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Finding best rates...</p>
                    </div>
                  ) : (
                    <div className="grid gap-3 md:gap-4">
                      {shippingMethods.length > 0 ? (
                        shippingMethods.map((method) => (
                          <div 
                            key={method.id}
                            onClick={() => setFormData({...formData, shippingMethodId: method.id})}
                            className={`p-4 md:p-6 border-2 rounded-2xl md:rounded-[2rem] cursor-pointer transition-all flex items-center justify-between gap-4 ${
                              formData.shippingMethodId === method.id 
                                ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" 
                                : "border-slate-100 hover:border-slate-200"
                            }`}
                          >
                            <div className="flex items-center gap-3 md:gap-4">
                              <div className={`h-5 w-5 md:h-6 md:w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                formData.shippingMethodId === method.id ? "border-primary" : "border-slate-200"
                              }`}>
                                {formData.shippingMethodId === method.id && <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-primary" />}
                              </div>
                              <div className="space-y-0.5 md:space-y-1">
                                <p className="text-sm md:text-base font-black text-slate-900 uppercase tracking-tight">{method.name}</p>
                                <p className="text-[10px] md:text-xs text-slate-500 font-medium">Delivery: {method.estimatedDays || "2-5 days"}</p>
                              </div>
                            </div>
                            <span className="text-sm md:text-base font-black text-primary">
                              {convertPrice(method.price || method.fee).formatted}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 border-2 border-dashed border-slate-100 rounded-2xl md:rounded-[2rem] text-center">
                          <Truck className="h-8 w-8 md:h-10 md:w-10 text-slate-200 mx-auto mb-4" />
                          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] md:text-xs">No shipping available for this location.</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-4 flex flex-col md:flex-row gap-3">
                    <Button 
                      variant="outline"
                      onClick={handleBack}
                      className="h-12 md:h-14 px-8 font-black uppercase tracking-widest rounded-xl md:rounded-2xl border-slate-200 text-xs"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    <Button 
                      onClick={handleNext}
                      disabled={!formData.shippingMethodId}
                      className="flex-1 h-12 md:h-14 font-black uppercase tracking-widest rounded-xl md:rounded-2xl shadow-xl shadow-primary/20 text-xs md:text-sm"
                    >
                      Continue <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {step === "PAYMENT" && (
                <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-2">
                    <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-slate-900">Payment Method</h3>
                    <p className="text-slate-500 text-xs md:text-sm">Choose how you want to pay</p>
                  </div>

                  <div className="grid gap-3 md:gap-4">
                    <div 
                      onClick={() => setFormData({...formData, paymentMethod: "WHATSAPP"})}
                      className={`p-4 md:p-6 border-2 rounded-2xl md:rounded-[2rem] cursor-pointer transition-all flex items-center justify-between gap-4 ${
                        formData.paymentMethod === "WHATSAPP" 
                          ? "border-primary bg-primary/5" 
                          : "border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className={`h-5 w-5 md:h-6 md:w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          formData.paymentMethod === "WHATSAPP" ? "border-primary" : "border-slate-200"
                        }`}>
                          {formData.paymentMethod === "WHATSAPP" && <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-primary" />}
                        </div>
                        <div className="space-y-0.5 md:space-y-1">
                          <p className="text-sm md:text-base font-black text-slate-900 uppercase tracking-tight">WhatsApp Payment</p>
                          <p className="text-[10px] md:text-xs text-slate-500 font-medium">Place order and pay via WhatsApp</p>
                        </div>
                      </div>
                      <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" className="h-6 w-6 md:h-8 md:w-8" alt="WhatsApp" />
                    </div>

                    <div 
                      onClick={() => setFormData({...formData, paymentMethod: "BANK_TRANSFER"})}
                      className={`p-4 md:p-6 border-2 rounded-2xl md:rounded-[2rem] cursor-pointer transition-all flex items-center justify-between gap-4 ${
                        formData.paymentMethod === "BANK_TRANSFER" 
                          ? "border-primary bg-primary/5" 
                          : "border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className={`h-5 w-5 md:h-6 md:w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          formData.paymentMethod === "BANK_TRANSFER" ? "border-primary" : "border-slate-200"
                        }`}>
                          {formData.paymentMethod === "BANK_TRANSFER" && <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-primary" />}
                        </div>
                        <div className="space-y-0.5 md:space-y-1">
                          <p className="text-sm md:text-base font-black text-slate-900 uppercase tracking-tight">Bank / Mobile Money</p>
                          <p className="text-[10px] md:text-xs text-slate-500 font-medium">Direct Transfer or Mobile Money</p>
                        </div>
                      </div>
                      <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-slate-400" />
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col md:flex-row gap-3">
                    <Button 
                      variant="outline"
                      onClick={handleBack}
                      className="h-12 md:h-14 px-8 font-black uppercase tracking-widest rounded-xl md:rounded-2xl border-slate-200 text-xs"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    <Button 
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="flex-1 h-12 md:h-14 font-black uppercase tracking-widest rounded-xl md:rounded-2xl shadow-xl shadow-primary/20 bg-green-600 hover:bg-green-700 text-xs md:text-sm"
                    >
                      {loading ? "Processing..." : "Place Order via WhatsApp"}
                    </Button>
                  </div>
                </div>
              )}

              {step === "COMPLETE" && (
                <div className="py-12 md:py-20 text-center space-y-8 animate-in zoom-in duration-500">
                  <div className="h-24 w-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-100/50">
                    <CheckCircle2 className="h-12 w-12" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-900">Order Placed!</h2>
                    <p className="text-slate-500 max-w-md mx-auto font-medium">
                      Thank you for your order. We've received it and are processing it now. 
                      {formData.paymentMethod === "WHATSAPP" && " Please complete your payment via WhatsApp."}
                    </p>
                  </div>
                  <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button 
                      variant="outline" 
                      className="h-14 px-8 font-black uppercase tracking-widest rounded-2xl border-slate-200 w-full sm:w-auto gap-2"
                      onClick={() => {
                        if (lastCreatedOrder) {
                          generateOrderPDF({
                            ...lastCreatedOrder,
                            currency: {
                              code: currencyCountry?.currencyCode || 'USD',
                              symbol: currencyCountry?.currencySymbol || '$'
                            }
                          });
                        }
                      }}
                    >
                      <Download className="h-5 w-5" />
                      Download Summary
                    </Button>
                    <Link href="/dashboard/orders">
                      <Button variant="outline" className="h-14 px-8 font-black uppercase tracking-widest rounded-2xl border-slate-200 w-full sm:w-auto">
                        View My Orders
                      </Button>
                    </Link>
                    <Link href="/shop">
                      <Button className="h-14 px-8 font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 w-full sm:w-auto">
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 sticky top-24 space-y-6">
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Order Summary</h2>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.variant?.id}`} className="flex gap-4">
                    <div className="h-16 w-16 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 relative border border-slate-100">
                      <img 
                        src={typeof item.product.images?.[0] === 'string' ? item.product.images[0] : item.product.images?.[0]?.url || ""} 
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{item.product.name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.variant?.name || "Standard"}</p>
                      <p className="text-sm font-black text-primary mt-1">
                        {convertPrice(item.variant?.price || item.product.salePrice || item.product.price).formatted}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px bg-slate-100" />
              
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-slate-900">{convertPrice(getSubtotal()).formatted}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Shipping</span>
                  <span className="text-slate-900">
                    {step === "INFORMATION" ? "Calculated at next step" : convertPrice(getSelectedShipping()?.price || 0).formatted}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-black text-slate-900 pt-4 border-t border-slate-50">
                  <span>Total</span>
                  <span className="text-primary">{convertPrice(calculateTotal()).formatted}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                  Secure
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <Truck className="h-3.5 w-3.5 text-blue-500" />
                  Fast
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
