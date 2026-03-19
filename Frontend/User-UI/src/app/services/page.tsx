"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Smartphone, 
  Laptop, 
  Tablet, 
  Watch, 
  Wrench, 
  Clock, 
  Shield, 
  Star,
  ArrowRight,
  CheckCircle,
  Calendar
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Service = { id: string; name: string; description?: string; duration: string; price: number; category: string; image?: string };

const whyChooseUs = [
  "Certified technicians",
  "Genuine spare parts",
  "Warranty on repairs",
  "Quick turnaround time",
  "Free diagnostics",
  "Fair pricing"
];

const testimonials = [
  {
    name: "Emmanuel Mwape",
    service: "Phone Repair",
    content: "Got my iPhone screen replaced in 2 hours. Perfect work!",
    rating: 5
  },
  {
    name: "Sarah Chanda",
    service: "Laptop Repair",
    content: "They recovered all my important files. Very professional!",
    rating: 5
  },
  {
    name: "Joseph Banda",
    service: "Data Recovery",
    content: "Best repair service in Lusaka. Highly recommended!",
    rating: 5
  }
];

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://kryrosbackend-d68q.onrender.com/api'}/services`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (active) setItems(Array.isArray(d) ? d : []); })
      .catch(() => active && setItems([]))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fillRule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fillOpacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]"></div>
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              Tech Repair & Services
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
              Expert repairs for all your devices. Quick, reliable, and affordable service
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Our Services</h2>
            <p className="mt-2 text-slate-600">Professional repairs for all your devices</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading && <div className="text-slate-500">Loading services…</div>}
            {!loading && items.map((service) => (
              <div 
                key={service.id}
                className={`rounded-xl border-2 bg-white p-6 transition-all hover:shadow-lg cursor-pointer ${
                  selectedService === service.id 
                    ? "border-green-500 shadow-md" 
                    : "border-slate-200"
                }`}
                onClick={() => setSelectedService(service.id)}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100">
                  <Wrench className="h-7 w-7 text-green-600" />
                </div>
                
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{service.name}</h3>
                <p className="mt-2 text-sm text-slate-600">{service.description || "—"}</p>
                
                <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {service.duration}
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600">{formatPrice(Number(service.price))}</span>
                  <Button size="sm" className="bg-green-500 hover:bg-green-600">
                    Book Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Why Choose KRYROS Services</h2>
              <p className="mt-4 text-slate-600">
                We pride ourselves on providing top-quality repair services with customer satisfaction guaranteed.
              </p>
              
              <div className="mt-8 grid gap-3">
                {whyChooseUs.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
              
              <Button className="mt-8 bg-green-500 hover:bg-green-600">
                Get Free Quote <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="relative hidden lg:block">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-8">
                <div className="h-full rounded-xl bg-white p-6">
                  <h3 className="text-xl font-bold text-slate-900">Book a Service</h3>
                  <p className="mt-2 text-sm text-slate-600">Schedule your repair in just a few clicks</p>
                  
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Select Service</label>
                      <select className="w-full rounded-lg border border-slate-200 p-2.5">
                        <option>Phone Repair</option>
                        <option>Laptop Repair</option>
                        <option>Tablet Repair</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Device Brand</label>
                      <select className="w-full rounded-lg border border-slate-200 p-2.5">
                        <option>Apple</option>
                        <option>Samsung</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <Button className="w-full bg-green-500 hover:bg-green-600">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Appointment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">What Customers Say</h2>
            <p className="mt-2 text-slate-600">Don't just take our word for it</p>
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
                <div>
                  <p className="font-medium text-slate-900">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">{testimonial.service}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-slate-900 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white">Need Help With Your Device?</h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Contact us today for a free consultation and quote
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="bg-green-500 hover:bg-green-600">
              Book Appointment <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              Call +260 966 423 719
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
