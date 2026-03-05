"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  CreditCard, 
  Calculator, 
  Clock, 
  Shield, 
  CheckCircle,
  ArrowRight,
  Users,
  Star,
  ChevronRight
} from "lucide-react";

const creditPlans = [
  { 
    id: 1, 
    name: "Starter", 
    months: 3, 
    interest: "5%", 
    minAmount: 1000, 
    maxAmount: 10000,
    icon: "🚀"
  },
  { 
    id: 2, 
    name: "Standard", 
    months: 6, 
    interest: "8%", 
    minAmount: 5000, 
    maxAmount: 30000,
    icon: "⭐"
  },
  { 
    id: 3, 
    name: "Premium", 
    months: 12, 
    interest: "12%", 
    minAmount: 10000, 
    maxAmount: 100000,
    icon: "👑"
  },
];

const howItWorks = [
  { 
    step: 1, 
    title: "Choose Your Product", 
    description: "Select any product from our store and click 'Buy on Credit'",
    icon: ShoppingCart 
  },
  { 
    step: 2, 
    title: "Select Plan", 
    description: "Pick a payment plan that fits your budget",
    icon: Calculator 
  },
  { 
    step: 3, 
    title: "Quick Approval", 
    description: "Get approved within minutes with minimal documents",
    icon: Clock 
  },
  { 
    step: 4, 
    title: "Start Paying", 
    description: "Make easy monthly installments and own your product",
    icon: CreditCard 
  },
];

const testimonials = [
  {
    name: "Chanda Mwansa",
    role: "Business Owner",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    content: "The credit system helped me get my business laptop without draining my savings. Very convenient!",
    rating: 5
  },
  {
    name: "Brian Sampa",
    role: "Teacher",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    content: "Easy monthly payments made it possible for me to afford the latest iPhone. Great service!",
    rating: 5
  },
  {
    name: "Agness Phiri",
    role: "Nurse",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    content: "Transparent process with no hidden fees. Highly recommend KRYROS credit!",
    rating: 5
  }
];

function ShoppingCart(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>;
}

export default function CreditPage() {
  const [calculatorAmount, setCalculatorAmount] = useState(10000);
  const [calculatorMonths, setCalculatorMonths] = useState(6);
  const selectedPlan = creditPlans.find(p => p.months === calculatorMonths) || creditPlans[1];
  const interest = parseFloat(selectedPlan.interest);
  const totalInterest = calculatorAmount * (interest / 100);
  const totalAmount = calculatorAmount + totalInterest;
  const monthlyPayment = totalAmount / calculatorMonths;

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fillRule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fillOpacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]"></div>
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              Buy Now, <span className="text-green-400">Pay Later</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
              Get the tech you need with flexible installment plans. No stress, just easy payments.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="bg-green-500 hover:bg-green-600">
                Apply Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Calculator */}
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Credit Calculator</h2>
            <p className="mt-2 text-slate-600">See how much you'll pay each month</p>
          </div>
          
          <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-lg">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Amount Needed (K)
                  </label>
                  <Input
                    type="number"
                    value={calculatorAmount}
                    onChange={(e) => setCalculatorAmount(Number(e.target.value))}
                    className="text-lg"
                  />
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={calculatorAmount}
                    onChange={(e) => setCalculatorAmount(Number(e.target.value))}
                    className="mt-3 w-full accent-green-500"
                  />
                  <div className="mt-1 flex justify-between text-xs text-slate-500">
                    <span>K 1,000</span>
                    <span>K 100,000</span>
                  </div>
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Payment Period
                  </label>
                  <div className="flex gap-2">
                    {creditPlans.map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => setCalculatorMonths(plan.months)}
                        className={`flex-1 rounded-lg border-2 p-3 text-center transition-all ${
                          calculatorMonths === plan.months
                            ? "border-green-500 bg-green-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <span className="block text-lg font-bold text-slate-900">{plan.months}</span>
                        <span className="text-xs text-slate-500">months</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl bg-slate-50 p-6">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">Payment Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Product Price</span>
                    <span className="font-medium text-slate-900">K {calculatorAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Interest ({selectedPlan.interest})</span>
                    <span className="font-medium text-slate-900">K {totalInterest.toLocaleString()}</span>
                  </div>                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Amount</span>
                    <span className="font-bold text-slate-900">K {totalAmount.toLocaleString()}</span>
                  </div>
                  <hr className="my-3 border-slate-200" />
                  <div className="rounded-lg bg-green-500 p-4 text-white">
                    <p className="text-sm opacity-90">Monthly Payment</p>
                    <p className="text-2xl font-bold">K {monthlyPayment.toLocaleString()}</p>
                  </div>
                </div>
                
                <Button className="mt-4 w-full bg-green-500 hover:bg-green-600">
                  Apply for This Plan
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
            <p className="mt-2 text-slate-600">Get your favorite tech in 4 simple steps</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-4">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <item.icon className="h-8 w-8" />
                </div>
                <div className="mb-2 text-sm font-bold text-green-500">Step {item.step}</div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Credit Plans */}
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Credit Plans</h2>
            <p className="mt-2 text-slate-600">Choose the plan that works for you</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {creditPlans.map((plan) => (
              <div
                key={plan.id}
                className="relative rounded-2xl border-2 border-slate-200 bg-white p-8 transition-all hover:border-green-500 hover:shadow-lg"
              >
                <div className="mb-4 text-4xl">{plan.icon}</div>
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <p className="mt-1 text-slate-600">{plan.months} months</p>
                
                <div className="my-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Interest Rate</span>
                    <span className="font-medium text-slate-900">{plan.interest}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Min Amount</span>
                    <span className="font-medium text-slate-900">K {plan.minAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Max Amount</span>
                    <span className="font-medium text-slate-900">K {plan.maxAmount.toLocaleString()}</span>
                  </div>
                </div>
                
                <Button className="w-full bg-green-500 hover:bg-green-600">
                  Select Plan
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-slate-900 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white">Why Choose KRYROS Credit</h2>
            <p className="mt-2 text-slate-400">We're trusted by thousands of customers</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl bg-slate-800 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-500">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Secure & Safe</h3>
              <p className="text-slate-400">Your data and payments are protected with bank-level security</p>
            </div>
            <div className="rounded-xl bg-slate-800 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-500">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Quick Approval</h3>
              <p className="text-slate-400">Get approved within minutes, not days</p>
            </div>
            <div className="rounded-xl bg-slate-800 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-500">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Personal Support</h3>
              <p className="text-slate-400">Our team is here to help you every step of the way</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">What Our Customers Say</h2>
            <p className="mt-2 text-slate-600">Join thousands of happy customers</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-4 text-slate-600">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200">
                    <img src={testimonial.image} alt={testimonial.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-green-500 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Get Started?</h2>
          <p className="mx-auto mt-4 max-w-xl text-green-100">
            Apply now and get approved within minutes. No hidden fees, no stress.
          </p>
          <Button size="lg" className="mt-8 bg-white text-green-600 hover:bg-green-50">
            Apply Now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      </div>
    </div>
  );
}
