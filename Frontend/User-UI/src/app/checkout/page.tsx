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
    id: "mobile_money", 
    name: "Mobile Money", 
    icon: Smartphone,
    description: "Airtel Money, MTN Mobile Money"
  },
  { 
    id: "bank_transfer", 
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

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!formData.email) errors.email = "Email is required";
    if (!formData.firstName) errors.firstName = "First name is required";
    if (!formData.lastName) errors.lastName = "Last name is required";
    if (!formData.phone) errors.phone = "Phone is required";
    if (!formData.address) errors.address = "Address is required";
    if (!formData.countryId) errors.countryId = "Country is required";
    
    if (!formData.manual) {
      if (!formData.stateId) errors.stateId = "State is required";
      if (!formData.cityId) errors.cityId = "City is required";
    } else {
      if (!formData.stateName) errors.stateName = "State name is required";
      if (!formData.cityName) errors.cityName = "City name is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const currentSteps = useMemo(() => [
    { id: 1, name: "Information", status: currentStep === 1 ? "current" : currentStep > 1 ? "completed" : "pending" },
    { id: 2, name: "Shipping", status: currentStep === 2 ? "current" : currentStep > 2 ? "completed" : "pending" },
    { id: 3, name: "Payment", status: currentStep === 3 ? "current" : "pending" }
  ], [currentStep]);

  useEffect(() => {
    const init = async () => {
      setLoadingMethods(true);
      
      // Check if new shipping is enabled
      const statusRes = await locationsApi.getShippingStatus();
      if (statusRes.data !== undefined) setIsNewShippingEnabled(statusRes.data);

      // Load initial countries
      const countriesRes = await locationsApi.getCountries();
      if (countriesRes.data) setCountries(countriesRes.data);

      // Load global shipping methods
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

  // Fetch matching shipping methods (Only if Location Shipping is enabled)
  useEffect(() => {
    if (!isNewShippingEnabled) return;

    const canFetch = formData.countryId && (
      (!formData.manual && formData.stateId && formData.cityId) ||
      (formData.manual && formData.stateName && formData.cityName)
    );

    if (canFetch) {
      setLoadingMethods(true);
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
        setLoadingMethods(false);
      });
    }
  }, [isNewShippingEnabled, formData.countryId, formData.stateId, formData.cityId, formData.manual, formData.stateName, formData.cityName]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const subtotal = useMemo(() => getSubtotal(), [getSubtotal, items]);
  const shipping = useMemo(() => {
    if (!selectedShipping) return 0;
    // Check for free shipping threshold
    const threshold = Number(selectedShipping.minThreshold || selectedShipping.freeShippingThreshold || 0);
    if (threshold > 0 && subtotal >= threshold) return 0;
    return Number(selectedShipping.price || selectedShipping.fee || 0);
  }, [selectedShipping, subtotal]);
  const total = subtotal + shipping;

  // Helper to format price in current currency
  const displayPrice = (amount: number) => {
    if (selectedCountry?.code === "US" || !selectedCountry) {
      return formatPrice(amount);
    }
    return formatLocal(convertPrice(amount).amount);
  };

  const handlePlaceOrder = async () => {
    if (!paymentMethod) return;
    setPlacingOrder(true);
    try {
      // 1. Create the address first
      // Note: We need an addressesApi or similar. Let's check lib/api.ts
      
      const orderData = {
        items: items.map(item => ({
          productId: item.product.id,
          variantId: item.variant?.id || undefined,
          quantity: item.quantity,
          price: Number(item.variant?.price || item.product.salePrice || item.product.price)
        })),
        paymentMethod: paymentMethod === 'whatsapp' ? 'WHATSAPP' : paymentMethod.toUpperCase(),
        notes: "Order via Website Checkout",
        shippingMethodId: selectedShipping?.id || undefined,
        // Clean up empty strings to undefined to satisfy backend validation
        addressDetails: {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          zipCode: formData.zipCode || undefined,
          manual: formData.manual || false,
          countryId: (formData.countryId && formData.countryId.length > 5) ? formData.countryId : undefined,
          stateId: (formData.stateId && formData.stateId.length > 5) ? formData.stateId : undefined,
          cityId: (formData.cityId && formData.cityId.length > 5) ? formData.cityId : undefined,
          countryName: countries.find(c => c.id === formData.countryId)?.name || "Zambia",
          stateName: formData.manual ? (formData.stateName || undefined) : (states.find(s => s.id === formData.stateId)?.name || undefined),
          cityName: formData.manual ? (formData.cityName || undefined) : (cities.find(c => c.id === formData.cityId)?.name || undefined),
        }
      };

      const res = await ordersApi.create(orderData);
      
      if (res.error) {
        throw new Error(res.error);
      }

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
              phone: formData.phone,
              email: formData.email
            },
            address: {
              street: formData.address,
              city: orderData.addressDetails.cityName,
              state: orderData.addressDetails.stateName,
              country: orderData.addressDetails.countryName,
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
    } catch (error: any) {
      console.error("Order creation failed", error);
      alert(error.response?.data?.message || "Failed to place order. Please try again.");
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
            {currentSteps.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  step.status === "current" 
                    ? "bg-green-500 text-white" 
                    : step.status === "completed"
                    ? "bg-green-100 text-green-600"
                    : "bg-slate-100 text-slate-500"
                }`}>
                  {step.status === "completed" ? <CheckCircle2 className="h-5 w-5" /> : step.id}
                </div>
                <span className={`ml-2 text-sm transition-colors ${
                  step.status === "current" ? "font-bold text-slate-900" : "text-slate-500"
                }`}>
                  {step.name}
                </span>
                {idx < currentSteps.length - 1 && (
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
                    <label className="mb-1 block text-sm font-medium text-slate-700">Email Address</label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className={formErrors.email ? "border-red-500" : ""}
                    />
                    {formErrors.email && <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>}
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
                        className={formErrors.firstName ? "border-red-500" : ""}
                      />
                      {formErrors.firstName && <p className="mt-1 text-xs text-red-500">{formErrors.firstName}</p>}
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Last Name</label>
                      <Input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                        className={formErrors.lastName ? "border-red-500" : ""}
                      />
                      {formErrors.lastName && <p className="mt-1 text-xs text-red-500">{formErrors.lastName}</p>}
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
                      className={formErrors.phone ? "border-red-500" : ""}
                    />
                    {formErrors.phone && <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>}
                  </div>
                </div>

                <h3 className="mt-8 text-lg font-semibold text-slate-900">Shipping Address</h3>
                
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Street Address</label>
                    <Input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="e.g. Plot 123, Great East Road"
                      className={formErrors.address ? "border-red-500" : ""}
                    />
                    {formErrors.address && <p className="mt-1 text-xs text-red-500">{formErrors.address}</p>}
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-slate-700">Country</label>
                      <select
                        name="countryId"
                        value={formData.countryId}
                        onChange={(e) => setFormData({ ...formData, countryId: e.target.value, stateId: "", cityId: "" })}
                        className={`w-full rounded-md border p-2 text-sm focus:border-green-500 focus:outline-none ${formErrors.countryId ? "border-red-500" : "border-slate-300"}`}
                        required
                      >
                        <option value="">Select Country</option>
                        {countries.map((c) => (
                          <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
                        ))}
                      </select>
                      {formErrors.countryId && <p className="mt-1 text-xs text-red-500">{formErrors.countryId}</p>}
                    </div>

                    {!formData.manual ? (
                      <>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">Province / State</label>
                          <select
                            name="stateId"
                            value={formData.stateId}
                            onChange={(e) => setFormData({ ...formData, stateId: e.target.value, cityId: "" })}
                            className={`w-full rounded-md border p-2 text-sm focus:border-green-500 focus:outline-none disabled:opacity-50 ${formErrors.stateId ? "border-red-500" : "border-slate-300"}`}
                            disabled={!formData.countryId || loadingLocations}
                            required
                          >
                            <option value="">Select State</option>
                            {states.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                          {formErrors.stateId && <p className="mt-1 text-xs text-red-500">{formErrors.stateId}</p>}
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">City</label>
                          <select
                            name="cityId"
                            value={formData.cityId}
                            onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                            className={`w-full rounded-md border p-2 text-sm focus:border-green-500 focus:outline-none disabled:opacity-50 ${formErrors.cityId ? "border-red-500" : "border-slate-300"}`}
                            disabled={!formData.stateId || loadingLocations}
                            required
                          >
                            <option value="">Select City</option>
                            {cities.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          {formErrors.cityId && <p className="mt-1 text-xs text-red-500">{formErrors.cityId}</p>}
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
                            className={formErrors.stateName ? "border-red-500" : ""}
                            required
                          />
                          {formErrors.stateName && <p className="mt-1 text-xs text-red-500">{formErrors.stateName}</p>}
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">City (Manual)</label>
                          <Input
                            type="text"
                            name="cityName"
                            value={formData.cityName}
                            onChange={(e) => setFormData({ ...formData, cityName: e.target.value })}
                            placeholder="Enter your city"
                            className={formErrors.cityName ? "border-red-500" : ""}
                            required
                          />
                          {formErrors.cityName && <p className="mt-1 text-xs text-red-500">{formErrors.cityName}</p>}
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
                    <label className="mb-1 block text-sm font-medium text-slate-700">Zip Code (Optional)</label>
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
                  <Button variant="ghost" asChild>
                    <Link href="/cart" className="flex items-center">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Cart
                    </Link>
                  </Button>
                  <Button 
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() => {
                      if (validateStep1()) {
                        setCurrentStep(2);
                        window.scrollTo(0, 0);
                      }
                    }}
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
                      No shipping methods available for your location. Please contact support.
                    </div>
                  ) : (
                    shippingMethods.map((method) => {
                      const isSelected = selectedShipping?.id === method.id;
                      const isFree = subtotal >= Number(method.freeShippingThreshold || method.minThreshold || 0);
                      const methodPrice = Number(method.price || method.fee || 0);
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
                              {isFree ? "FREE" : displayPrice(methodPrice)}
                            </p>
                            {Number(method.freeShippingThreshold || method.minThreshold || 0) > 0 && (
                              <p className="text-[10px] text-slate-400 font-medium">Free over {displayPrice(Number(method.freeShippingThreshold || method.minThreshold))}</p>
                            )}
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
                
                <div className="mt-8 flex justify-between">
                  <Button variant="ghost" onClick={() => {
                    setCurrentStep(1);
                    window.scrollTo(0, 0);
                  }}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    disabled={!selectedShipping}
                    className="bg-green-500 hover:bg-green-600 disabled:opacity-50"
                    onClick={() => {
                      setCurrentStep(3);
                      window.scrollTo(0, 0);
                    }}
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
                  {/* 1. Show Country-Specific Payment Methods */}
                  {selectedCountry?.paymentMethods?.map((method: any) => (
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
                  ))}

                  {/* 2. Always Show WhatsApp (Global Method) */}
                  {(() => {
                    const whatsapp = paymentMethods.find(m => m.id === "whatsapp");
                    if (!whatsapp) return null;
                    return (
                      <label
                        key={whatsapp.id}
                        className={`flex cursor-pointer items-center justify-between rounded-lg border-2 p-4 transition-all ${
                          paymentMethod === whatsapp.id
                            ? "border-green-500 bg-green-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="payment"
                            value={whatsapp.id}
                            checked={paymentMethod === whatsapp.id}
                            onChange={() => setPaymentMethod(whatsapp.id)}
                            className="text-green-500"
                          />
                          <whatsapp.icon className="h-5 w-5 text-slate-600" />
                          <div>
                            <p className="font-medium text-slate-900">{whatsapp.name}</p>
                            <p className="text-sm text-slate-500">{whatsapp.description}</p>
                          </div>
                        </div>
                      </label>
                    );
                  })()}

                  {/* 3. Show Other Default Methods ONLY if no country methods exist */}
                  {!selectedCountry?.paymentMethods?.length && paymentMethods.filter(m => m.id !== "whatsapp").map((method) => (
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
                  ))}
                </div>

                <div className="mt-8 flex justify-between">
                  <Button variant="ghost" onClick={() => {
                    setCurrentStep(2);
                    window.scrollTo(0, 0);
                  }}>
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
                    {paymentMethod === 'whatsapp' ? 'Place Order & Send to WhatsApp' : `Complete Order - ${displayPrice(total)}`}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-xl bg-white p-6 shadow-sm sticky top-24">
              <h3 className="text-lg font-semibold text-slate-900">Order Summary</h3>
              
              <div className="mt-4 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((ci: CartItem) => {
                  const itemId = ci.product.id + (ci.variant?.id ? `:${ci.variant.id}` : "");
                  const primary = ci.product.images?.find((i) => i.isPrimary)?.url || ci.product.images?.[0]?.url || "";
                  const unitPrice = Number(ci.variant?.price || ci.product.salePrice || ci.product.price);
                  return (
                    <div key={itemId} className="flex gap-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-100">
                        <Image 
                          src={primary || "/placeholder.png"} 
                          alt={ci.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{ci.product.name}</p>
                        <p className="text-xs text-slate-500">Qty: {ci.quantity}</p>
                        {ci.variant && (
                          <p className="text-[10px] text-slate-400 font-medium">Variant: {ci.variant.value}</p>
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-900 whitespace-nowrap">{displayPrice(unitPrice * ci.quantity)}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 space-y-3 border-t border-slate-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Subtotal</span>
                  <span className="font-bold text-slate-900">{displayPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Shipping</span>
                  <span className={`font-bold ${shipping === 0 ? "text-green-600" : "text-slate-900"}`}>
                    {shipping === 0 ? "FREE" : displayPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Tax (16%)</span>
                  <span className="font-bold text-slate-900">{displayPrice(subtotal * 0.16)}</span>
                </div>
                <hr className="my-3 border-slate-200" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="text-2xl font-black text-slate-900">{displayPrice(total + (subtotal * 0.16))}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 rounded-lg bg-green-50 p-3 border border-green-100">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <p className="text-xs text-green-700 font-medium leading-tight">Your order is secure. You can track your purchase in your dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
