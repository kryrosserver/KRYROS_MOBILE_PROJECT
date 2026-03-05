"use client";

import { Button } from "@/components/ui/button";
import { 
  Store, 
  Award, 
  Users, 
  Truck, 
  Star,
  ArrowRight,
  Shield,
  HeadphonesIcon,
  CreditCard
} from "lucide-react";

const stats = [
  { label: "Years Experience", value: "5+" },
  { label: "Happy Customers", value: "10,000+" },
  { label: "Products", value: "1,000+" },
  { label: "Partner Brands", value: "50+" }
];

const team = [
  {
    name: "John Moyo",
    role: "CEO & Founder",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
    bio: "Visionary leader with 10+ years in tech retail"
  },
  {
    name: "Sarah Chanda",
    role: "Operations Manager",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    bio: "Expert in supply chain and logistics"
  },
  {
    name: "Emmanuel Phiri",
    role: "Technical Lead",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    bio: "Certified technician with expertise in Apple products"
  },
  {
    name: "Grace Mwape",
    role: "Customer Experience",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
    bio: "Dedicated to ensuring customer satisfaction"
  }
];

const values = [
  {
    icon: Shield,
    title: "Trust & Reliability",
    description: "We build lasting relationships through transparency and honest service"
  },
  {
    icon: Award,
    title: "Quality Products",
    description: "Only genuine products from authorized distributors"
  },
  {
    icon: HeadphonesIcon,
    title: "Customer First",
    description: "Your satisfaction is our top priority always"
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Quick and reliable delivery across Zambia"
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fillRule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fillOpacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]"></div>
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              About KRYROS
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
              Zambia's premier destination for technology, electronics, and innovative financing solutions
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-green-500 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-6 text-center sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-green-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story */}
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Our Story</h2>
              <p className="mt-4 text-slate-600">
                Founded in 2019, KRYROS MOBILE TECH LIMITED has grown to become one of Zambia's most trusted 
                technology retailers. What started as a small phone shop has evolved into a comprehensive 
                digital platform offering retail, wholesale, credit financing, and professional tech services.
              </p>
              <p className="mt-4 text-slate-600">
                We believe everyone deserves access to the latest technology, which is why we introduced our 
                flexible Buy Now, Pay Later system - making smartphones, laptops, and gadgets accessible 
                to all Zambians regardless of their financial situation.
              </p>
              <p className="mt-4 text-slate-600">
                Our commitment to quality, authentic products, and exceptional customer service has earned 
                us the trust of thousands of customers across the country.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-1">
                <div className="h-full rounded-xl bg-white p-8 flex items-center justify-center">
                  <div className="text-center">
                    <Store className="mx-auto h-16 w-16 text-green-500" />
                    <p className="mt-4 text-2xl font-bold text-slate-900">KRYROS</p>
                    <p className="text-slate-600">Mobile Tech Limited</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Our Values</h2>
            <p className="mt-2 text-slate-600">The principles that guide everything we do</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div key={value.title} className="rounded-xl border border-slate-200 p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                  <value.icon className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{value.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Meet Our Team</h2>
            <p className="mt-2 text-slate-600">The people behind KRYROS</p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <div key={member.name} className="group rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-lg font-semibold text-slate-900">{member.name}</h3>
                  <p className="text-sm text-green-600">{member.role}</p>
                  <p className="mt-2 text-sm text-slate-600">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-slate-900 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white">Join the KRYROS Family</h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Experience the best in tech retail and financing in Zambia
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="bg-green-500 hover:bg-green-600">
              Shop Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              Contact Us
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
