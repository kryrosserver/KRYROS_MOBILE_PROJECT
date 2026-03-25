 "use client"
 
 import { useEffect, useState } from "react"
 import { useAuth } from "@/providers/AuthProvider"
 import { cmsApi, wholesaleApi } from "@/lib/api"
 import { Button } from "@/components/ui/button"
 import { formatPrice } from "@/lib/utils"
 import { ProductCard } from "@/components/home/ProductCard"
 import { Loader2, Package, ShieldCheck, Zap } from "lucide-react"

 const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kryrosbackend-hxfp.onrender.com/api'
 
 export default function WholesalePage() {
   const { user, isAuthenticated } = useAuth()
   const [deals, setDeals] = useState<any[]>([])
   const [wholesaleProducts, setWholesaleProducts] = useState<any[]>([])
   const [enabled, setEnabled] = useState<boolean>(false)
   const [account, setAccount] = useState<any | null>(null)
   const [loading, setLoading] = useState(true)
   const [productsLoading, setProductsLoading] = useState(true)
   const [form, setForm] = useState({ companyName: "", taxId: "", address: "", contactPerson: "" })
   const [submitting, setSubmitting] = useState(false)
 
   useEffect(() => {
     let active = true
     cmsApi.getSections().then(res => {
       const arr = Array.isArray(res.data) ? res.data : []
      const sect = arr.find((s: any) => s.type === "wholesale_deals" && s.isActive)
      if (active) {
        setEnabled(!!sect)
        if (sect && Array.isArray(sect.config?.items)) setDeals(sect.config.items)
      }
     }).finally(() => active && setLoading(false))

     // Fetch actual wholesale-only products
     fetch(`${API_URL}/products?isWholesaleOnly=true`).then(res => res.json()).then(data => {
       if (active) setWholesaleProducts(Array.isArray(data) ? data : (data.data || []))
     }).catch(console.error).finally(() => active && setProductsLoading(false))

     return () => { active = false }
   }, [])
 
   useEffect(() => {
     let active = true
     if (isAuthenticated && user?.id) {
       wholesaleApi.getAccount(user.id).then(res => {
         if (active) setAccount(res.data || null)
       }).catch(() => active && setAccount(null))
     }
     return () => { active = false }
   }, [isAuthenticated, user?.id])
 
   const apply = async () => {
     if (!isAuthenticated || !user?.id) return
     setSubmitting(true)
     const payload = { userId: user.id, ...form }
     const res = await wholesaleApi.apply(payload)
     setSubmitting(false)
     if (!res.error) {
       setAccount(res.data || payload)
     }
   }
 
   return (
     <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 py-12">
         <div className="mx-auto max-w-7xl px-4">
           <h1 className="text-3xl font-bold text-white">Wholesale</h1>
          <p className="mt-2 text-slate-300">Apply for a wholesale account and access bulk pricing</p>
         </div>
       </div>
 
      <div className="mx-auto max-w-7xl px-4 py-10 grid gap-8 lg:grid-cols-3">
        {!loading && !enabled ? (
          <div className="lg:col-span-3">
            <div className="rounded-2xl border bg-white p-12 text-center">
              <h2 className="text-2xl font-bold text-slate-900">Wholesale Coming Soon</h2>
              <p className="mt-2 text-slate-600">Wholesale catalog and application will be available here.</p>
            </div>
          </div>
        ) : null}

         <div className="lg:col-span-2 space-y-10">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
               <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-4"><Package className="h-6 w-6" /></div>
               <h3 className="font-bold text-slate-900">Bulk Packs</h3>
               <p className="text-xs text-slate-500 mt-1">Order in cartons and save up to 40%</p>
             </div>
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
               <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4"><ShieldCheck className="h-6 w-6" /></div>
               <h3 className="font-bold text-slate-900">Official Warranty</h3>
               <p className="text-xs text-slate-500 mt-1">Full support on all wholesale units</p>
             </div>
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
               <div className="h-12 w-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 mb-4"><Zap className="h-6 w-6" /></div>
               <h3 className="font-bold text-slate-900">Priority Shipping</h3>
               <p className="text-xs text-slate-500 mt-1">Fast delivery for our business partners</p>
             </div>
           </div>

           <div>
             <h2 className="mb-6 text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
               <span className="h-8 w-1 bg-green-500 rounded-full"></span>
               Wholesale Catalog
             </h2>
             
             {productsLoading ? (
               <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed">
                 <Loader2 className="h-8 w-8 animate-spin text-slate-300 mb-2" />
                 <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Loading Catalog...</p>
               </div>
             ) : wholesaleProducts.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
                 <p className="text-slate-400 font-medium italic">No wholesale products available currently.</p>
               </div>
             ) : (
               <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                 {wholesaleProducts.map((product) => (
                   <ProductCard key={product.id} product={product} />
                 ))}
               </div>
             )}
           </div>
         </div>
 
         <div>
           <div className="rounded-xl border bg-white p-6">
             <h2 className="text-lg font-semibold text-slate-900">Wholesale Account</h2>
             {isAuthenticated ? (
               account ? (
                 <div className="mt-3 space-y-2 text-sm">
                   <p><span className="text-slate-600">Company:</span> <span className="font-medium text-slate-900">{account.companyName}</span></p>
                   <p><span className="text-slate-600">Status:</span> <span className="font-medium text-slate-900">{(account.status || "").toLowerCase()}</span></p>
                   <p><span className="text-slate-600">Discount Tier:</span> <span className="font-medium text-slate-900">{account.discountTier ?? 1}</span></p>
                 </div>
               ) : (
                 <>
                   <p className="mt-2 text-sm text-slate-600">Apply for a wholesale account to access bulk discounts.</p>
                   <div className="mt-4 space-y-3">
                     <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Company Name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
                     <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Tax ID (optional)" value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} />
                     <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                     <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Contact Person" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
                     <Button onClick={apply} disabled={submitting} className="w-full bg-green-500 hover:bg-green-600">
                       {submitting ? "Submitting..." : "Apply for Wholesale"}
                     </Button>
                   </div>
                 </>
               )
             ) : (
               <p className="mt-2 text-sm text-slate-600">Please sign in to apply for wholesale.</p>
             )}
           </div>
         </div>
       </div>
     </div>
   )
 }
