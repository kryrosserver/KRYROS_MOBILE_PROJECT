 "use client"
 
 import { useEffect, useState } from "react"
 import Link from "next/link"
 import { useRouter } from "next/navigation"
 import { Button } from "@/components/ui/button"
 import { creditApi } from "@/lib/api"
 import { formatPrice } from "@/lib/utils"
 import { useAuth } from "@/providers/AuthProvider"
 
 export default function InstallmentsPage() {
   const { isAuthenticated, isLoading } = useAuth()
   const router = useRouter()
   const [mounted, setMounted] = useState(false)
   const [items, setItems] = useState<any[]>([])
   const [loading, setLoading] = useState(true)
 
   useEffect(() => {
     setMounted(true)
   }, [])
 
   useEffect(() => {
     if (mounted && !isLoading && !isAuthenticated) {
       router.push("/login")
     }
   }, [mounted, isLoading, isAuthenticated, router])
 
   useEffect(() => {
     let active = true
     creditApi.getMyCredits().then(res => {
       if (!active) return
       setItems(Array.isArray(res.data) ? res.data : [])
       setLoading(false)
     }).catch(() => {
       if (!active) return
       setItems([])
       setLoading(false)
     })
     return () => { active = false }
   }, [])
 
   if (!mounted || isLoading || (!isAuthenticated && mounted)) {
     return (
       <div className="min-h-screen flex items-center justify-center">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
       </div>
     )
   }
 
   return (
     <div className="mx-auto max-w-7xl px-4 py-8">
       <div className="mb-6 flex items-center justify-between">
         <h1 className="text-2xl md:text-3xl font-bold text-slate-900">My Installments</h1>
       </div>
 
       {loading ? (
         <div className="rounded-xl border bg-white p-10 text-center text-slate-600">
           Loading installments...
         </div>
       ) : items.length === 0 ? (
         <div className="rounded-xl border bg-white p-10 text-center">
           <p className="text-slate-600">No active installments.</p>
           <Link href="/credit" className="inline-block mt-4">
             <Button className="bg-green-500 hover:bg-green-600">Explore Credit Plans</Button>
           </Link>
         </div>
       ) : (
         <div className="grid gap-6 md:grid-cols-2">
           {items.map((it) => (
             <div key={it.id} className="rounded-xl border bg-white p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm text-slate-500">Plan</p>
                   <p className="text-lg font-semibold text-slate-900">{it.creditPlan?.name || "Standard Plan"}</p>
                   <p className="text-xs text-slate-400">{it.creditPlan?.duration || 0} months</p>
                 </div>
                 <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                   {it.status || "ACTIVE"}
                 </span>
               </div>
               
               <div className="mt-4 flex items-center gap-3 border-b border-slate-50 pb-4 mb-4">
                 <div className="h-12 w-12 rounded bg-slate-100 overflow-hidden border">
                   <img src={it.product?.images?.[0]?.url || '/placeholder.jpg'} alt={it.product?.name} className="h-full w-full object-cover" />
                 </div>
                 <div>
                   <p className="text-xs text-slate-500 uppercase">Product</p>
                   <p className="font-bold text-slate-900 line-clamp-1">{it.product?.name || "Product"}</p>
                 </div>
               </div>

               <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                 <div>
                   <p className="text-slate-600">Total Payable</p>
                   <p className="font-medium text-slate-900">{formatPrice(Number(it.totalPayable || 0))}</p>
                 </div>
                 <div>
                   <p className="text-slate-600">Monthly</p>
                   <p className="font-medium text-slate-900">{formatPrice(Number(it.monthlyPayment || 0))}</p>
                 </div>
                 <div>
                   <p className="text-slate-600">Paid</p>
                   <p className="font-medium text-slate-900">{formatPrice(Number(it.paidAmount || 0))}</p>
                 </div>
                 <div>
                   <p className="text-slate-600">Remaining</p>
                   <p className="font-medium text-slate-900 text-green-600">{formatPrice(Number(it.remainingAmount || 0))}</p>
                 </div>
               </div>
               <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
                 <div
                   className="h-2 rounded-full bg-green-500"
                   style={{ width: `${Math.min(100, Math.round(((Number(it.paidAmount) || 0) / Math.max(1, Number(it.totalPayable) || 1)) * 100))}%` }}
                 />
               </div>
               <div className="mt-4 text-xs text-slate-500">
                 Next due: {it.nextPaymentDate ? new Date(it.nextPaymentDate).toLocaleDateString() : "—"}
               </div>
             </div>
           ))}
         </div>
       )}
     </div>
   )
 }
