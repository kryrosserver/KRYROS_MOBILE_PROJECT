"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/home/ProductCard";
import { products } from "@/lib/store-data";
import { 
  Users, 
  Truck, 
  BadgePercent, 
  FileText, 
  HeadphonesIcon,
  ArrowRight,
  CheckCircle,
  Star
} from "lucide-react";

const wholesaleProducts = products.slice(0, 9);
const bulkPricingTiers = [
  { quantity: "10-49 units", discount: "5% off" },
  { quantity: "50-99 units", discount: "10% off" },
  { quantity: "100-499 units", discount: "15% off" },
  { quantity: "500+ units", discount: "20% off" },
];

const benefits = [
  {
    icon: BadgePercent,
    title: "Bulk Discounts",
    description: "Get up to 20% off on bulk orders"
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Free delivery on orders over K 20,000"
  },
  {
    icon: FileText,
    title: "Invoicing",
    description: "Professional invoices for your business"
  },
  {
    icon: HeadphonesIcon,
    title: "Priority Support",
    description: "Dedicated account manager"
  }
];

const testimonials = [
  {
    name: "TechZone Electronics",
    role: "Retail Partner",
    content: "KRYROS wholesale has been instrumental in growing our business. Great prices and excellent service!",
    rating: 5
  },
  {
    name: "Mwebantu Ltd",
    role: "Reseller",
    content: "The bulk pricing and reliable delivery have made us stick with KRYROS for years.",
    rating: 5
  },
  {
    name: "Zambia Tech Shop",
    role: "Dealer",
    content: "Best wholesale partner in Zambia. Products are always authentic and well-packaged.",
    rating: 5
  }
];

export default function WholesalePage() {
  const [minOrder, setMinOrder] = useState(10);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fillRule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fillOpacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]"></div>
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-green-500/20 px-4 py-1.5 text-sm font-medium text-green-400">
                <Users className="h-4 w-4" />
                Wholesale Program
              </div>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
                Business Wholesale Pricing
              </h1>
              <p className="mt-4 text-lg text-slate-300">
                Partner with KRYROS for premium electronics at unbeatable wholesale prices. 
                Built for retailers, resellers, and businesses.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button size="lg" className="bg-green-500 hover:bg-green-600">
                  Apply for Account <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  View Catalog
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="rounded-2xl bg-white/10 p-8 backdrop-blur-sm">
                <h3 className="mb-6 text-xl font-semibold text-white">Wholesale Benefits</h3>
                <div className="space-y-4">
                  {benefits.map((benefit) => (
                    <div key={benefit.title} className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500">
                        <benefit.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{benefit.title}</h4>
                        <p className="text-sm text-slate-400">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Pricing Tiers */}
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Volume Discounts</h2>
            <p className="mt-2 text-slate-600">The more you buy, the more you save</p>
          </div>
          
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {bulkPricingTiers.map((tier) => (
                <div key={tier.quantity} className="rounded-xl border-2 border-slate-200 bg-white p-6 text-center transition-all hover:border-green-500 hover:shadow-md">
                  <p className="text-sm text-slate-600">{tier.quantity}</p>
                  <p className="mt-2 text-2xl font-bold text-green-600">{tier.discount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Wholesale Products */}
      <div className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Wholesale Catalog</h2>
              <p className="mt-1 text-slate-600">Browse products available for wholesale</p>
            </div>
            <Button variant="outline">
              Download Full Catalog
            </Button>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {wholesaleProducts.map((product) => (
              <ProductCard key={product.id} product={{...product, price: Math.round(product.price * 0.7)}} />
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Button size="lg" className="bg-green-500 hover:bg-green-600">
              View All Products <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Wholesale Account Requirements</h2>
            <p className="mt-2 text-slate-600">What you need to apply</p>
          </div>
          
          <div className="mx-auto max-w-3xl">
            <div className="rounded-xl border border-slate-200 bg-white p-8">
              <div className="space-y-4">
                {[
                  "Valid business registration certificate",
                  "Tax identification number (TIN)",
                  "Proof of business address",
                  "Minimum initial order of 10 units",
                  "Valid trading license"
                ].map((req, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-slate-700">{req}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-600">
                  <strong>Note:</strong> Minimum order quantity (MOQ) varies by product. 
                  Contact our wholesale team for specific product requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-slate-900 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white">What Our Partners Say</h2>
            <p className="mt-2 text-slate-400">Trusted by businesses across Zambia</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="rounded-xl bg-slate-800 p-6">
                <div className="mb-4 flex items-center gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-4 text-slate-300">"{testimonial.content}"</p>
                <div>
                  <p className="font-medium text-white">{testimonial.name}</p>
                  <p className="text-sm text-slate-400">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-green-500 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white">Start Your Wholesale Journey</h2>
          <p className="mx-auto mt-4 max-w-xl text-green-100">
            Apply today and get access to exclusive wholesale pricing and benefits
          </p>
          <Button size="lg" className="mt-8 bg-white text-green-600 hover:bg-green-50">
            Apply Now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
