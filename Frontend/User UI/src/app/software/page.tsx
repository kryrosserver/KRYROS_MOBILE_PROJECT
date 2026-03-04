"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Download, 
  Star, 
  Shield, 
  Clock, 
  CheckCircle,
  ArrowRight,
  CreditCard,
  Layers,
  Users,
  Globe
} from "lucide-react";

const softwareProducts = [
  {
    id: 1,
    name: "Microsoft Office 2024",
    description: "Full suite including Word, Excel, PowerPoint, Outlook",
    category: "Productivity",
    price: 2500,
    image: "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 1250,
    licenseType: "Perpetual",
    features: ["Lifetime license", "Multi-device", "Updates included"]
  },
  {
    id: 2,
    name: "Antivirus Pro 2024",
    description: "Advanced protection against viruses, malware, and ransomware",
    category: "Security",
    price: 800,
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=400&fit=crop",
    rating: 4.9,
    reviews: 890,
    licenseType: "Annual",
    features: ["Real-time protection", "VPN included", "24/7 support"]
  },
  {
    id: 3,
    name: "Adobe Creative Cloud",
    description: "Complete creative suite with Photoshop, Illustrator, Premiere Pro",
    category: "Design",
    price: 4500,
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=400&fit=crop",
    rating: 4.7,
    reviews: 2100,
    licenseType: "Annual",
    features: ["All apps included", "Cloud storage", "Templates"]
  },
  {
    id: 4,
    name: "KRYROS POS System",
    description: "Point of Sale software for retail and restaurants",
    category: "Business",
    price: 3500,
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop",
    rating: 4.6,
    reviews: 340,
    licenseType: "Annual",
    features: ["Inventory management", "Sales reports", "Multi-store"]
  },
  {
    id: 5,
    name: "Video Editing Studio",
    description: "Professional video editing with effects and transitions",
    category: "Media",
    price: 1800,
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=400&fit=crop",
    rating: 4.5,
    reviews: 560,
    licenseType: "Perpetual",
    features: ["4K support", "No watermarks", "Export options"]
  },
  {
    id: 6,
    name: "Cloud Backup Pro",
    description: "Secure cloud storage and automatic backup solution",
    category: "Security",
    price: 600,
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 420,
    licenseType: "Annual",
    features: ["1TB storage", "Auto-backup", "Encryption"]
  }
];

const categories = ["All", "Productivity", "Security", "Design", "Business", "Media"];

const whyBuy = [
  { icon: Shield, title: "Secure License Keys", desc: "Genuine licenses with verification" },
  { icon: Clock, title: "Instant Delivery", desc: "License key delivered within minutes" },
  { icon: Users, title: "Expert Support", desc: "Technical assistance when you need it" },
  { icon: Download, title: "Easy Download", desc: "Direct download from our portal" }
];

export default function SoftwarePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = softwareProducts.filter(product => {
    if (selectedCategory !== "All" && product.category !== selectedCategory) return false;
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fillRule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fillOpacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]"></div>
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-500/20 px-4 py-1.5 text-sm font-medium text-green-400">
              <Globe className="h-4 w-4" />
              Software Store
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
              Premium Software & Licenses
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
              Genuine software licenses, instant delivery, and expert support
            </p>
          </div>
        </div>
      </div>

      {/* Why Buy Section */}
      <div className="bg-white py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-6 md:grid-cols-4">
            {whyBuy.map((item) => (
              <div key={item.title} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100">
                  <item.icon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-green-500 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="relative w-full max-w-md">
              <Input
                type="text"
                placeholder="Search software..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="pb-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md">
                <div className="relative aspect-video overflow-hidden rounded-t-xl bg-slate-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-medium text-white">
                    {product.category}
                  </span>
                </div>
                
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{product.description}</p>
                  
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{product.rating}</span>
                    </div>
                    <span className="text-sm text-slate-500">({product.reviews} reviews)</span>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.features.slice(0, 2).map((feature) => (
                      <span key={feature} className="flex items-center gap-1 text-xs text-slate-500">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {feature}
                      </span>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-slate-900">K {product.price.toLocaleString()}</span>
                      <span className="ml-2 text-sm text-slate-500">/ {product.licenseType}</span>
                    </div>
                  </div>
                  
                  <Button className="mt-4 w-full bg-green-500 hover:bg-green-600">
                    <Download className="mr-2 h-4 w-4" />
                    Buy Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="rounded-xl bg-white py-12 text-center">
              <p className="text-slate-600">No software found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-green-500 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white">Need Custom Software Solutions?</h2>
          <p className="mx-auto mt-4 max-w-xl text-green-100">
            Contact us for enterprise licenses, bulk orders, and custom solutions
          </p>
          <Button size="lg" className="mt-8 bg-white text-green-600 hover:bg-green-50">
            Contact Sales <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
