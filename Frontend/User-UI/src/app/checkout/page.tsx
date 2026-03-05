"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  CreditCard, 
  Smartphone, 
  Building, 
  Lock, 
  CheckCircle,
  ArrowLeft,
  ArrowRight
} from "lucide-react";

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
  }
];

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    zipCode: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const subtotal = 28500;
  const shipping = 0;
  const total = subtotal + shipping;

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
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">City</label>
                      <Input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Lusaka"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Province</label>
                      <Input
                        type="text"
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        placeholder="Lusaka Province"
                      />
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
                  <label className="flex cursor-pointer items-center justify-between rounded-lg border-2 border-green-500 bg-green-50 p-4">
                    <div className="flex items-center gap-3">
                      <input type="radio" name="shipping" defaultChecked className="text-green-500" />
                      <div>
                        <p className="font-medium text-slate-900">Standard Shipping</p>
                        <p className="text-sm text-slate-500">3-5 business days</p>
                      </div>
                    </div>
                    <span className="font-medium text-slate-900">Free</span>
                  </label>
                  
                  <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                      <input type="radio" name="shipping" className="text-green-500" />
                      <div>
                        <p className="font-medium text-slate-900">Express Shipping</p>
                        <p className="text-sm text-slate-500">1-2 business days</p>
                      </div>
                    </div>
                    <span className="font-medium text-slate-900">K 250</span>
                  </label>
                </div>
                
                <div className="mt-8 flex justify-between">
                  <Button variant="ghost" onClick={() => setCurrentStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    className="bg-green-500 hover:bg-green-600"
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
                  {paymentMethods.map((method) => (
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

                {paymentMethod === "card" && (
                  <div className="mt-6 space-y-4 rounded-lg border border-slate-200 p-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Card Number</label>
                      <Input placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Expiry Date</label>
                        <Input placeholder="MM/YY" />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">CVV</label>
                        <Input placeholder="123" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Cardholder Name</label>
                      <Input placeholder="JOHN DOE" />
                    </div>
                  </div>
                )}

                <div className="mt-8 flex justify-between">
                  <Button variant="ghost" onClick={() => setCurrentStep(2)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button className="bg-green-500 hover:bg-green-600">
                    Pay K {total.toLocaleString()}
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
                <div className="flex gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    <img 
                      src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=100&h=100&fit=crop" 
                      alt="iPhone"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">iPhone 15 Pro Max 256GB</p>
                    <p className="text-sm text-slate-500">Qty: 1</p>
                  </div>
                  <p className="font-medium text-slate-900">K 25,000</p>
                </div>
                
                <div className="flex gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    <img 
                      src="https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=100&h=100&fit=crop" 
                      alt="AirPods"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">AirPods Pro (2nd Gen)</p>
                    <p className="text-sm text-slate-500">Qty: 2</p>
                  </div>
                  <p className="font-medium text-slate-900">K 7,000</p>
                </div>
              </div>

              <div className="mt-6 space-y-3 border-t border-slate-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium text-slate-900">K {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Shipping</span>
                  <span className="font-medium text-green-600">{shipping === 0 ? "Free" : `K ${shipping}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax</span>
                  <span className="font-medium text-slate-900">K 0</span>
                </div>
                <hr className="my-3 border-slate-200" />
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="text-xl font-bold text-slate-900">K {total.toLocaleString()}</span>
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

      <Footer />
    </div>
  );
}
