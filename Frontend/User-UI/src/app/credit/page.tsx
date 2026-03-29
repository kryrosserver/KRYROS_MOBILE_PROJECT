"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatPrice, resolveImageUrl } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { productsApi, creditApi, cmsApi } from "@/lib/api";
import { ProductCard } from "@/components/home/ProductCard";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { 
  CreditCard, 
  Calculator, 
  Clock, 
  Shield, 
  CheckCircle,
  ArrowRight,
  Users,
  Star,
  ChevronRight,
  Loader2
} from "lucide-react";

// Types from API
interface CreditPlan {
  id: string;
  name: string;
  duration: number;
  interestRate: number;
  minimumAmount: number;
  maximumAmount: number;
  description?: string;
  icon?: string;
}

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

function ShoppingCart(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>;
}

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

function CreditPageContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const { toast } = useToast();

  const [products, setProducts] = useState<any[]>([]);
  const [plans, setPlans] = useState<CreditPlan[]>([]);
  const [creditOffers, setCreditOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  
  const [calculatorAmount, setCalculatorAmount] = useState(10000);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [targetProduct, setTargetProduct] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [prodRes, planRes, cmsRes] = await Promise.all([
          productsApi.getCredit({ take: 8 }),
          // Filter plans by productId if available
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://kryrosbackend-hxfp.onrender.com/api'}/credit/plans${productId ? `?productId=${productId}` : ''}`).then(r => r.json()),
          cmsApi.getSections()
        ]);
        
        if (prodRes.data) {
          const prods = (prodRes.data as any).data || [];
          setProducts(prods);
          
          if (productId) {
            const found = prods.find((p: any) => p.id === productId);
            if (found) {
              setTargetProduct(found);
              setCalculatorAmount(Number(found.price));
              document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
            } else {
              // Fetch specific product if not in the initial 8
              const singleRes = await productsApi.getById(productId);
              if (singleRes.data) {
                setTargetProduct(singleRes.data);
                setCalculatorAmount(Number(singleRes.data.price));
                document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
              }
            }
          }
        }
        
        if (planRes) {
          setPlans(planRes);
          if (planRes.length > 0) {
            setSelectedPlanId(planRes[0].id);
          }
        }

        if (cmsRes.data) {
          const sections = Array.isArray(cmsRes.data) ? cmsRes.data : [];
          const creditSection = sections.find((s: any) => s.type === "credit_offers" && s.isActive);
          if (creditSection && Array.isArray(creditSection.config?.items)) {
            setCreditOffers(creditSection.config.items);
          }
        }
      } catch (error) {
        console.error("Failed to load credit data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [productId]);

  const handleApply = async () => {
    if (!targetProduct && !productId) {
      toast({
        title: "No product selected",
        description: "Please select a product from the catalog first.",
        variant: "destructive"
      });
      return;
    }

    setApplying(true);
    try {
      const res = await creditApi.apply({
        productId: targetProduct?.id || productId,
        planId: selectedPlanId,
        amount: calculatorAmount
      });

      if (res.error) {
        toast({
          title: "Application Failed",
          description: res.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Application Submitted!",
          description: "Your credit application has been received and is being processed.",
        });
        // Redirect to installments dashboard
        window.location.href = "/dashboard/installments";
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setApplying(false);
    }
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  const interestRate = selectedPlan ? Number(selectedPlan.interestRate) : 0;
  const duration = selectedPlan ? selectedPlan.duration : 1;
  
  const totalInterest = calculatorAmount * (interestRate / 100);
  const totalAmount = calculatorAmount + totalInterest;
  const monthlyPayment = totalAmount / duration;

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-50 py-12 md:py-20">
        <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fillRule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000000%22%20fillOpacity%3D%221%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]"></div>
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Buy Now, <span className="text-green-600">Pay Later</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg text-slate-600">
              Get the tech you need with flexible installment plans. No stress, just easy payments.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="w-full sm:w-auto bg-green-500 hover:bg-green-600" onClick={() => document.getElementById('credit-catalog')?.scrollIntoView({ behavior: 'smooth' })}>
                Browse Credit Catalog <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-slate-200 text-slate-900 hover:bg-slate-100" onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}>
                Calculate Payments
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Credit Offers */}
      {creditOffers.length > 0 && (
        <div className="py-16 bg-slate-50 border-y border-slate-100">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Special Credit Offers</h2>
              <p className="mt-2 text-slate-600">Hand-picked tech with our best installment rates</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {creditOffers.map((offer, idx) => (
                <div key={idx} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl hover:shadow-2xl transition-all group">
                  <div className="h-64 relative bg-slate-100 overflow-hidden">
                    {offer.image ? (
                      <img src={resolveImageUrl(offer.image)} alt={offer.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-300">
                        <CreditCard className="h-16 w-16" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-green-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                      Low Deposit
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{offer.title}</h3>
                    <p className="text-sm text-slate-500 mb-6">{offer.subtitle}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Down Payment</p>
                        <p className="text-lg font-black text-green-600">{formatPrice(offer.downPayment)}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Monthly</p>
                        <p className="text-lg font-black text-blue-600">{formatPrice(offer.monthlyAmount)}</p>
                      </div>
                    </div>

                    <Link href={offer.slug ? `/product/${offer.slug}` : "/credit"} className="block">
                      <Button className="w-full bg-slate-900 hover:bg-green-600 text-white font-bold py-6 rounded-2xl transition-all flex items-center justify-center gap-2 group">
                        Get Started <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Credit Catalog - THE SEPARATION */}
      <div id="credit-catalog" className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Installment Catalog</h2>
            <p className="mt-2 text-slate-600">Products available for immediate credit purchase</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-green-500" />
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-4 gap-2 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-slate-500 font-medium">No products listed for installments yet.</p>
              <Button variant="link" className="text-green-600 mt-2" onClick={() => window.location.href='/shop'}>
                Browse main shop
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Credit Calculator */}
      <div id="calculator" className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Credit Calculator</h2>
            <p className="mt-2 text-slate-600">See how much you'll pay each month</p>
          </div>
          
          <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-lg">
            {targetProduct && (
              <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-4">
                <div className="h-16 w-16 bg-white rounded-lg overflow-hidden border">
                  <img src={targetProduct.images?.[0]?.url || '/placeholder.jpg'} alt={targetProduct.name} className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-xs text-green-600 font-bold uppercase">Applying for:</p>
                  <h4 className="font-bold text-slate-900">{targetProduct.name}</h4>
                  <p className="text-sm text-slate-500">{formatPrice(Number(targetProduct.price))}</p>
                </div>
                <Button variant="ghost" size="sm" className="ml-auto text-slate-400" onClick={() => setTargetProduct(null)}>
                  Change
                </Button>
              </div>
            )}
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Amount Needed
                  </label>
                  <Input
                    type="number"
                    value={calculatorAmount}
                    onChange={(e) => setCalculatorAmount(Number(e.target.value))}
                    className="text-lg"
                    disabled={!!targetProduct}
                  />
                  {!targetProduct && (
                    <>
                      <input
                        type="range"
                        min="1000"
                        max="100000"
                        step="1000"
                        value={calculatorAmount}
                        onChange={(e) => setCalculatorAmount(Number(e.target.value))}
                        className="mt-3 w-full accent-green-500"
                      />
                    </>
                  )}
                  <div className="mt-1 flex justify-between text-xs text-slate-500">
                    <span>{formatPrice(1000)}</span>
                    <span>{formatPrice(100000)}</span>
                  </div>
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Payment Period
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {plans.map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`flex-1 min-w-[100px] rounded-lg border-2 p-3 text-center transition-all ${
                          selectedPlanId === plan.id
                            ? "border-green-500 bg-green-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <span className="block text-lg font-bold text-slate-900">{plan.duration}</span>
                        <span className="text-xs text-slate-500">months</span>
                      </button>
                    ))}
                    {plans.length === 0 && (
                      <div className="text-slate-400 text-sm py-2">No plans configured in database.</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl bg-slate-50 p-6">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">Payment Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Product Price</span>
                    <span className="font-medium text-slate-900">{formatPrice(Number(calculatorAmount))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Interest ({interestRate}%)</span>
                    <span className="font-medium text-slate-900">{formatPrice(Number(totalInterest))}</span>
                  </div>                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Amount</span>
                    <span className="font-bold text-slate-900">{formatPrice(Number(totalAmount))}</span>
                  </div>
                  <hr className="my-3 border-slate-200" />
                  <div className="rounded-lg bg-green-500 p-4 text-white">
                    <p className="text-sm opacity-90">Monthly Payment</p>
                    <p className="text-2xl font-bold">{formatPrice(Number(monthlyPayment))}</p>
                  </div>
                </div>
                
                <Button 
                  className="mt-4 w-full bg-green-500 hover:bg-green-600"
                  disabled={applying || !selectedPlanId}
                  onClick={handleApply}
                >
                  {applying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : targetProduct ? "Confirm Application" : "Apply for This Plan"}
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
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="relative rounded-2xl border-2 border-slate-200 bg-white p-8 transition-all hover:border-green-500 hover:shadow-lg"
              >
                <div className="mb-4 text-4xl">{plan.icon || '🚀'}</div>
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <p className="mt-1 text-slate-600">{plan.duration} months</p>
                
                <div className="my-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Interest Rate</span>
                    <span className="font-medium text-slate-900">{plan.interestRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Min Amount</span>
                    <span className="font-medium text-slate-900">{formatPrice(Number(plan.minimumAmount))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Max Amount</span>
                    <span className="font-medium text-slate-900">{formatPrice(Number(plan.maximumAmount))}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-green-500 hover:bg-green-600"
                  onClick={() => {
                    setSelectedPlanId(plan.id);
                    document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
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
  );
}

export default function CreditPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-green-500" /></div>}>
      <CreditPageContent />
    </Suspense>
  );
}
