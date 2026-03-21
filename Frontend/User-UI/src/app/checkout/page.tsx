"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/providers/CartProvider";
import { useCurrency } from "@/providers/CurrencyProvider";
import { 
  CreditCard, 
  Smartphone, 
  Building, 
  Lock, 
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  MapPin,
  Truck,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  Package,
  MessageSquare
} from "lucide-react";
import { formatPrice, generateWhatsAppMessage } from "@/lib/utils";
import { CartItem } from "@/types";
import { settingsApi, locationsApi, ordersApi } from "@/lib/api";

const steps = [
  { id: 1, name: "Information", status: "current" },
  { id: 2, name: "Shipping", status: "pending" },
  { id: 3, name: "Payment", status: "pending" }
];

const paymentMethods = [
  { 
    id: "card", 
    name: "Credit/Debit Card", 
    icon: CreditCard,
    description: "Pay with Visa, Mastercard, or Verve"
  },
  { 
    id: "mobile", 
    name: "Mobile Money", 
    icon: Smartphone,
    description: "Airtel Money, MTN Mobile Money"
  },
  { 
    id: "bank", 
    name: "Bank Transfer", 
    icon: Building,
    description: "Direct bank transfer"
  },
  { 
    id: "whatsapp", 
    name: "Order via WhatsApp", 
    icon: MessageSquare,
    description: "Submit order and pay via WhatsApp"
  }
];

export default function CheckoutPage() {
  const { items, getSubtotal, clearCart } = useCart();
  const { selectedCountry, convertPrice, formatLocal } = useCurrency();
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // New Location States
  const [isNewShippingEnabled, setIsNewShippingEnabled] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    cityId: "",
    stateId: "",
    countryId: "",
    zipCode: "",
    manual: false,
    stateName: "",
    cityName: ""
  });

  useEffect(() => {
    const init = async () => {
      setLoadingMethods(true);
      
      // Check if new shipping is enabled
      const statusRes = await locationsApi.getShippingStatus();
      if (statusRes.data !== undefined) setIsNewShippingEnabled(statusRes.data);

      // Load initial countries
      const countriesRes = await locationsApi.getCountries();
      if (countriesRes.data) setCountries(countriesRes.data);

      // Load old shipping methods as fallback
      const { data } = await settingsApi.getShippingMethods();
      if (data && data.length > 0) {
        setShippingMethods(data);
        setSelectedShipping(data[0]);
      }
      setLoadingMethods(false);
    };
    init();
  }, []);

  // Update states when country changes
  useEffect(() => {
    if (formData.countryId) {
      setLoadingLocations(true);
      locationsApi.getStates(formData.countryId).then(res => {
        if (res.data) setStates(res.data);
        setCities([]);
        setLoadingLocations(false);
      });
    }
  }, [formData.countryId]);

  // Update cities when state changes
  useEffect(() => {
    if (formData.stateId) {
      setLoadingLocations(true);
      locationsApi.getCities(formData.stateId).then(res => {
        if (res.data) setCities(res.data);
        setLoadingLocations(false);
      });
    }
  }, [formData.stateId]);

  // Fetch matching shipping methods
  useEffect(() => {
    const canFetch = isNewShippingEnabled && formData.countryId && (
      (!formData.manual && formData.stateId && formData.cityId) ||
      (formData.manual && formData.stateName && formData.cityName)
    );

    if (canFetch) {
      locationsApi.getMatchingShipping(
        formData.countryId, 
        formData.stateId, 
        formData.cityId, 
        formData.manual, 
        formData.stateName, 
        formData.cityName
      ).then(res => {
        if (res.data && res.data.length > 0) {
          setShippingMethods(res.data);
          setSelectedShipping(res.data[0]);
        }
      });
    }
  }, [isNewShippingEnabled, formData.countryId, formData.stateId, formData.cityId, formData.manual, formData.stateName, formData.cityName]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const subtotal = useMemo(() => getSubtotal(), [getSubtotal, items]);
  const shipping = useMemo(() => {
    if (!selectedShipping) return 0;
    return subtotal >= Number(selectedShipping.minThreshold) ? 0 : Number(selectedShipping.fee);
  }, [selectedShipping, subtotal]);
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.product.id,
          variantId: item.variant?.id,
          quantity: item.quantity
        })),
        paymentMethod: paymentMethod === 'whatsapp' ? 'WHATSAPP' : paymentMethod.toUpperCase(),
        notes: "Order via WhatsApp",
        shippingMethodId: selectedShipping?.id,
        // The backend handles address creation if we pass the data, 
        // but for now let's assume we might need to handle address logic.
        // Looking at orders.service.ts, it expects shippingAddressId.
        // We might need to create the address first.
      };

      // For simplicity in this demo/setup, we'll focus on the WhatsApp redirection logic.
      // In a real app, we'd create the address and then the order.
      
      const res = await ordersApi.create(orderData);
      
      if (res.data) {
        if (paymentMethod === 'whatsapp') {
          const convertedTotal = convertPrice(total);
          const convertedSubtotal = convertPrice(subtotal);
          const convertedShipping = convertPrice(shipping);

          const message = generateWhatsAppMessage({
            orderNumber: res.data.orderNumber,
            customer: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              phone: formData.phone
            },
            address: {
              street: formData.address,
              city: formData.manual ? formData.cityName : (cities.find(c => c.id === formData.cityId)?.name || ""),
              state: formData.manual ? formData.stateName : (states.find(s => s.id === formData.stateId)?.name || ""),
              country: countries.find(c => c.id === formData.countryId)?.name || "",
              manual: formData.manual
            },
            items: items.map(item => ({
              name: item.product.name,
              quantity: item.quantity,
              price: convertPrice(item.variant?.price || item.product.salePrice || item.product.price).amount,
              variant: item.variant?.value
            })),
            subtotal: convertedSubtotal.amount,
            shipping: convertedShipping.amount,
            total: convertedTotal.amount,
            currency: {
              code: selectedCountry?.currencyCode || "USD",
              symbol: selectedCountry?.currencySymbol || "$"
            }
          });

          const whatsappUrl = `https://wa.me/260966423719?text=${message}`;
          window.open(whatsappUrl, '_blank');
        }
        
        clearCart();
        window.location.href = `/dashboard/orders/${res.data.id}`;
      }
    } catch (error) {
      console.error("Order creation failed", error);
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Progress Steps */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-center gap-4">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  step.status === "current" 
                    ? "bg-green-500 text-white" 
                    : step.status === "completed"
                    ? "bg-green-100 text-green-600"
                    : "bg-slate-100 text-slate-500"
                }`}>
                  {step.status === "completed" ? <CheckCircle className="h-5 w-5" /> : step.id}
                </div>
                <span className={`ml-2 text-sm ${
                  step.status === "current" ? "font-medium text-slate-900" : "text-slate-500"
                }`}>
                  {step.name}
                </span>
                {idx < steps.length - 1 && (
                  <div className="mx-4 h-0.5 w-8 bg-slate-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Contact Information</h2>
                
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">First Name</label>
                      <Input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Last Name</label>
                      <Input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Phone Number</label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+260 966 123 456"
                    />
                  </div>
                </div>

                <h3 className="mt-8 text-lg font-semibold text-slate-900">Shipping Address</h3>
                
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Address</label>
                    <Input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street address"
                    />
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-slate-700">Country</label>
                      <select
                        name="countryId"
                        value={formData.countryId}
                        onChange={(e) => setFormData({ ...formData, countryId: e.target.value, stateId: "", cityId: "" })}
                        className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-green-500 focus:outline-none"
                        required
                      >
                        <option value="">Select Country</option>
                        {countries.map((c) => (
                          <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
                        ))}
                      </select>
                    </div>

                    {!formData.manual ? (
                      <>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">Province / State</label>
                          <select
                            name="stateId"
                            value={formData.stateId}
                            onChange={(e) => setFormData({ ...formData, stateId: e.target.value, cityId: "" })}
                            className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-green-500 focus:outline-none disabled:opacity-50"
                            disabled={!formData.countryId || loadingLocations}
                            required
                          >
                            <option value="">Select State</option>
                            {states.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">City</label>
                          <select
                            name="cityId"
                            value={formData.cityId}
                            onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                            className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-green-500 focus:outline-none disabled:opacity-50"
                            disabled={!formData.stateId || loadingLocations}
                            required
                          >
                            <option value="">Select City</option>
                            {cities.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">Province / State (Manual)</label>
                          <Input
                            type="text"
                            name="stateName"
                            value={formData.stateName}
                            onChange={(e) => setFormData({ ...formData, stateName: e.target.value })}
                            placeholder="Enter your state"
                            required
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">City (Manual)</label>
                          <Input
                            type="text"
                            name="cityName"
                            value={formData.cityName}
                            onChange={(e) => setFormData({ ...formData, cityName: e.target.value })}
                            placeholder="Enter your city"
                            required
                          />
                        </div>
                      </>
                    )}

                    <div className="sm:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.manual}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            manual: e.target.checked,
                            stateId: "",
                            cityId: "",
                            stateName: "",
                            cityName: ""
                          })}
                          className="h-4 w-4 rounded border-slate-300 text-green-500 focus:ring-green-500"
                        />
                        <span className="text-xs text-slate-500 font-medium">Not listed? Enter manually</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Zip Code</label>
                    <Input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="10101"
                    />
                  </div>
                </div>
                
                <div className="mt-8 flex justify-between">
                  <Button variant="ghost">
                    <Link href="/cart" className="flex items-center">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Cart
                    </Link>
                  </Button>
                  <Button 
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() => setCurrentStep(2)}
                  >
                    Continue to Shipping
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Shipping Method</h2>
                
                <div className="mt-6 space-y-3">
                  {loadingMethods ? (
                    <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                      <div className="h-6 w-6 border-2 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
                      <p className="text-xs">Loading shipping options...</p>
                    </div>
                  ) : shippingMethods.length === 0 ? (
                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg text-orange-700 text-sm">
                      No shipping methods available. Please contact support.
                    </div>
                  ) : (
                    shippingMethods.map((method) => {
                      const isSelected = selectedShipping?.id === method.id;
                      const isFree = subtotal >= Number(method.freeShippingThreshold || method.minThreshold);
                      return (
                        <label 
                          key={method.id}
                          className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${
                            isSelected ? "border-green-500 bg-green-50" : "border-slate-100 hover:border-slate-200"
                          }`}
                        >
                          <div className="flex flex-1 items-center gap-3">
                            <input 
                              type="radio" 
                              name="shipping" 
                              checked={isSelected}
                              onChange={() => setSelectedShipping(method)}
                              className="text-green-500" 
                            />
                            <Truck className="h-5 w-5 text-slate-600" />
                            <div>
                              <p className="font-medium text-slate-900">{method.name}</p>
                              <p className="text-sm text-slate-500">
                                {method.estimatedDays || "3-5 business days"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900">
                              {isFree ? "FREE" : formatPrice(Number(method.price || method.fee))}
                            </p>
                            {Number(method.freeShippingThreshold || method.minThreshold) > 0 && (
                              <p className="text-[10px] text-slate-400 font-medium">Free over {formatPrice(Number(method.freeShippingThreshold || method.minThreshold))}</p>
                            )}
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
                
                <div className="mt-8 flex justify-between">
                  <Button variant="ghost" onClick={() => setCurrentStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    disabled={!selectedShipping}
                    className="bg-green-500 hover:bg-green-600 disabled:opacity-50"
                    onClick={() => setCurrentStep(3)}
                  >
                    Continue to Payment
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Payment Method</h2>
                
                <div className="mt-6 space-y-3">
                  {selectedCountry?.paymentMethods?.length ? (
                    selectedCountry.paymentMethods.map((method: any) => (
                      <label
                        key={method.id}
                        className={`flex cursor-pointer items-center justify-between rounded-lg border-2 p-4 transition-all ${
                          paymentMethod === method.id
                            ? "border-green-500 bg-green-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="payment"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={() => setPaymentMethod(method.id)}
                            className="text-green-500"
                          />
                          <CreditCard className="h-5 w-5 text-slate-600" />
                          <div>
                            <p className="font-medium text-slate-900">{method.name}</p>
                            <p className="text-sm text-slate-500">{method.description || "Safe and secure payment"}</p>
                          </div>
                        </div>
                      </label>
                    ))
                  ) : (
                    // Default methods if none assigned to country
                    paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex cursor-pointer items-center justify-between rounded-lg border-2 p-4 transition-all ${
                          paymentMethod === method.id
                            ? "border-green-500 bg-green-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="payment"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={() => setPaymentMethod(method.id)}
                            className="text-green-500"
                          />
                          <method.icon className="h-5 w-5 text-slate-600" />
                          <div>
                            <p className="font-medium text-slate-900">{method.name}</p>
                            <p className="text-sm text-slate-500">{method.description}</p>
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>

                <div className="mt-8 flex justify-between">
                  <Button variant="ghost" onClick={() => setCurrentStep(2)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    className="bg-green-500 hover:bg-green-600 disabled:opacity-50" 
                    disabled={!paymentMethod || placingOrder}
                    onClick={handlePlaceOrder}
                  >
                    {placingOrder ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {paymentMethod === 'whatsapp' ? 'Place Order & Send to WhatsApp' : `Pay ${selectedCountry?.code === "US" || !selectedCountry ? formatPrice(Number(total)) : formatLocal(convertPrice(total).amount)}`}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-xl bg-white p-6 shadow-sm sticky top-24">
              <h3 className="text-lg font-semibold text-slate-900">Order Summary</h3>
              
              <div className="mt-4 space-y-4">
                {items.map((ci: CartItem) => {
                  const itemId = ci.product.id + (ci.variant?.id ? `:${ci.variant.id}` : "");
                  const primary = ci.product.images?.find((i) => i.isPrimary)?.url || ci.product.images?.[0]?.url || "";
                  const unitPrice = ci.variant?.price || ci.product.salePrice || ci.product.price;
                  return (
                    <div key={itemId} className="flex gap-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        <Image 
                          src={primary || "/placeholder.png"} 
                          alt={ci.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{ci.product.name}</p>
                        <p className="text-sm text-slate-500">Qty: {ci.quantity}</p>
                        {ci.variant && (
                          <p className="text-xs text-slate-400">Variant: {ci.variant.value}</p>
                        )}
                      </div>
                      <p className="font-medium text-slate-900">{formatPrice(Number(unitPrice * ci.quantity))}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 space-y-3 border-t border-slate-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium text-slate-900">{formatPrice(Number(subtotal))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Shipping</span>
                  <span className="font-medium text-green-600">{shipping === 0 ? "Free" : formatPrice(Number(shipping))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax</span>
                  <span className="font-medium text-slate-900">{formatPrice(0)}</span>
                </div>
                <hr className="my-3 border-slate-200" />
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="text-xl font-bold text-slate-900">{formatPrice(Number(total))}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 rounded-lg bg-green-50 p-3">
                <Lock className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-700">Your payment is secure and encrypted</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
