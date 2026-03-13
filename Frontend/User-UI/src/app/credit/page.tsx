"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { productsApi, creditApi } from "@/lib/api";
import { ProductCard } from "@/components/home/ProductCard";
import { useToast } from "@/components/ui/use-toast";
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

function CreditPageContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const { toast } = useToast();

  const [products, setProducts] = useState<any[]>([]);
  const [plans, setPlans] = useState<CreditPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  
  const [calculatorAmount, setCalculatorAmount] = useState(10000);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [targetProduct, setTargetProduct] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [prodRes, planRes] = await Promise.all([
          productsApi.getCredit({ take: 8 }),
          creditApi.getPlans()
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
        
        if (planRes.data) {
          setPlans(planRes.data);
          if (planRes.data.length > 0) {
            setSelectedPlanId(planRes.data[0].id);
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
              <Button size="lg" className="bg-green-500 hover:bg-green-600" onClick={() => document.getElementById('credit-catalog')?.scrollIntoView({ behavior: 'smooth' })}>
                Browse Credit Catalog <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10" onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}>
                Calculate Payments
              </Button>
            </div>
          </div>
        </div>
      </div>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <span className="font-medium text-slate-900">{formatPrice(Number(plan.minAmount))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Max Amount</span>
                    <span className="font-medium text-slate-900">{formatPrice(Number(plan.maxAmount))}</span>
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
  );
}

export default function CreditPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-green-500" /></div>}>
      <CreditPageContent />
    </Suspense>
  );
}
