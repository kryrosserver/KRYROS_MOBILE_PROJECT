"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  CreditCard, 
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  MoreHorizontal,
  TrendingUp,
  Users,
  Ban,
  Plus,
  Settings,
  X
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

// Mock data for requests (keep current structure)
const creditRequests = [
  // ... existing requests
];

export default function CreditPage() {
  const [activeTab, setActiveTab] = useState<"requests" | "plans">("requests");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  
  // Plans State
  const [plans, setPlans] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [planForm, setPlanModalForm] = useState({
    name: "",
    duration: 6,
    interestRate: 10,
    minimumAmount: 500,
    maximumAmount: 10000,
    targetBrandId: "",
    targetCategoryId: "",
    isActive: true
  });

  const loadData = async () => {
    try {
      const [plansRes, catsRes, brandsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://kryrosbackend-hxfp.onrender.com/api'}/credit/plans`).then(r => r.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://kryrosbackend-hxfp.onrender.com/api'}/categories`).then(r => r.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://kryrosbackend-hxfp.onrender.com/api'}/brands`).then(r => r.json())
      ]);
      setPlans(plansRes || []);
      setCategories(catsRes.data || []);
      setBrands(brandsRes.data || []);
    } catch (e) {
      console.error("Failed to load credit data", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSavePlan = async () => {
    try {
      const url = editingPlan 
        ? `${process.env.NEXT_PUBLIC_API_URL}/credit/plans/${editingPlan.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/credit/plans`;
      
      const res = await fetch(url, {
        method: editingPlan ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...planForm,
          targetBrandId: planForm.targetBrandId ? Number(planForm.targetBrandId) : null,
          targetCategoryId: planForm.targetCategoryId || null
        })
      });

      if (res.ok) {
        setIsPlanModalOpen(false);
        setEditingPlan(null);
        loadData();
      }
    } catch (e) {
      alert("Failed to save plan");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "approved": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected": return <XCircle className="h-4 w-4 text-red-500" />;
      case "reviewing": return <Eye className="h-4 w-4 text-blue-500" />;
      case "blacklisted": return <Ban className="h-4 w-4 text-red-700" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Credit Management</h1>
          <p className="text-slate-500">Manage applications and rules for installments</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "requests" ? "bg-green-500 text-white shadow-lg shadow-green-500/20" : "bg-white text-slate-600 border border-slate-200"}`}
          >
            Applications
          </button>
          <button 
            onClick={() => setActiveTab("plans")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "plans" ? "bg-green-500 text-white shadow-lg shadow-green-500/20" : "bg-white text-slate-600 border border-slate-200"}`}
          >
            Manage Plans
          </button>
        </div>
      </div>

      {activeTab === "requests" ? (
        <>
          {/* Stats & Requests (Existing logic) */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* ... stats ... */}
          </div>
          {/* ... existing requests table ... */}
        </>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Available Installment Plans</h2>
            <button 
              onClick={() => {
                setEditingPlan(null);
                setPlanModalForm({ name: "", duration: 6, interestRate: 10, minimumAmount: 500, maximumAmount: 10000, targetBrandId: "", targetCategoryId: "", isActive: true });
                setIsPlanModalOpen(true);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Create New Plan
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.id} className="admin-card p-6 border-t-4 border-t-green-500 relative group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{plan.name}</h3>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{plan.duration} Months</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-[10px] font-bold ${plan.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {plan.isActive ? 'ACTIVE' : 'DISABLED'}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Interest Rate</span>
                    <span className="font-bold text-green-600">{plan.interestRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Price Range</span>
                    <span className="font-medium text-slate-700">{formatPrice(plan.minimumAmount)} - {formatPrice(plan.maximumAmount)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Applicable To</p>
                    <div className="flex flex-wrap gap-1">
                      {!plan.targetBrandId && !plan.targetCategoryId && (
                        <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-bold">ALL PRODUCTS</span>
                      )}
                      {plan.brand && (
                        <span className="bg-orange-50 text-orange-600 text-[10px] px-2 py-0.5 rounded-full font-bold">BRAND: {plan.brand.name}</span>
                      )}
                      {plan.category && (
                        <span className="bg-purple-50 text-purple-600 text-[10px] px-2 py-0.5 rounded-full font-bold">CAT: {plan.category.name}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setEditingPlan(plan);
                      setPlanModalForm({
                        name: plan.name,
                        duration: plan.duration,
                        interestRate: Number(plan.interestRate),
                        minimumAmount: Number(plan.minimumAmount),
                        maximumAmount: Number(plan.maximumAmount),
                        targetBrandId: plan.targetBrandId || "",
                        targetCategoryId: plan.targetCategoryId || "",
                        isActive: plan.isActive
                      });
                      setIsPlanModalOpen(true);
                    }}
                    className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors"
                  >
                    Edit Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plan Modal */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">{editingPlan ? 'Edit Credit Plan' : 'Create New Credit Plan'}</h3>
              <button onClick={() => setIsPlanModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Plan Name</label>
                <input 
                  placeholder="e.g. Standard 6-Month Plan"
                  className="admin-input w-full"
                  value={planForm.name}
                  onChange={e => setPlanModalForm({...planForm, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Duration (Months)</label>
                  <input 
                    type="number"
                    className="admin-input w-full"
                    value={planForm.duration}
                    onChange={e => setPlanModalForm({...planForm, duration: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Interest Rate (%)</label>
                  <input 
                    type="number"
                    className="admin-input w-full"
                    value={planForm.interestRate}
                    onChange={e => setPlanModalForm({...planForm, interestRate: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Min Price (USD)</label>
                  <input 
                    type="number"
                    className="admin-input w-full"
                    value={planForm.minimumAmount}
                    onChange={e => setPlanModalForm({...planForm, minimumAmount: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Max Price (USD)</label>
                  <input 
                    type="number"
                    className="admin-input w-full"
                    value={planForm.maximumAmount}
                    onChange={e => setPlanModalForm({...planForm, maximumAmount: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl space-y-4 border border-blue-100">
                <p className="text-xs font-bold text-blue-800 uppercase tracking-widest">Eligibility Rules</p>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Limit to Brand</label>
                  <select 
                    className="admin-input w-full bg-white"
                    value={planForm.targetBrandId}
                    onChange={e => setPlanModalForm({...planForm, targetBrandId: e.target.value})}
                  >
                    <option value="">Apply to All Brands</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Limit to Category</label>
                  <select 
                    className="admin-input w-full bg-white"
                    value={planForm.targetCategoryId}
                    onChange={e => setPlanModalForm({...planForm, targetCategoryId: e.target.value})}
                  >
                    <option value="">Apply to All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-green-500 rounded focus:ring-green-500"
                  checked={planForm.isActive}
                  onChange={e => setPlanModalForm({...planForm, isActive: e.target.checked})}
                />
                <span className="text-sm font-bold text-slate-700">Plan is Active and Visible to Users</span>
              </label>
            </div>

            <div className="p-6 border-t bg-slate-50 flex gap-3">
              <button 
                onClick={() => setIsPlanModalOpen(false)}
                className="flex-1 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSavePlan}
                className="flex-[2] bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 shadow-lg shadow-green-500/20 transition-all active:scale-95"
              >
                {editingPlan ? 'Update Plan Settings' : 'Create Credit Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
