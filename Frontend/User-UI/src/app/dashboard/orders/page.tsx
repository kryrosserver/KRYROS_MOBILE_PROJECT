 "use client"
 
 import { useEffect, useState } from "react"
 import Link from "next/link"
 import { useRouter } from "next/navigation"
 import { Button } from "@/components/ui/button"
 import { ordersApi } from "@/lib/api"
 import { useAuth } from "@/providers/AuthProvider"
 
 export default function OrdersPage() {
   const { isAuthenticated, isLoading } = useAuth()
   const router = useRouter()
   const [mounted, setMounted] = useState(false)
   const [orders, setOrders] = useState<any[]>([])
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
     ordersApi.getMyOrders().then(res => {
       if (!active) return
       setOrders(Array.isArray(res.data) ? res.data : [])
       setLoading(false)
     }).catch(() => {
       if (!active) return
       setOrders([])
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
         <h1 className="text-2xl md:text-3xl font-bold text-slate-900">My Orders</h1>
       </div>
 
       {loading ? (
         <div className="rounded-xl border bg-white p-10 text-center text-slate-600">
           Loading orders...
         </div>
       ) : orders.length === 0 ? (
         <div className="rounded-xl border bg-white p-10 text-center">
           <p className="text-slate-600">You have no orders yet.</p>
           <Link href="/shop" className="inline-block mt-4">
             <Button className="bg-green-500 hover:bg-green-600">Start Shopping</Button>
           </Link>
         </div>
       ) : (
         <div className="overflow-x-auto rounded-xl border bg-white">
           <table className="w-full">
             <thead>
               <tr className="border-b border-slate-200">
                 <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Order #</th>
                 <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Date</th>
                 <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                 <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Payment</th>
                 <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Total</th>
                 <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Action</th>
               </tr>
             </thead>
             <tbody>
               {orders.map((o) => (
                 <tr key={o.id} className="border-b border-slate-100">
                   <td className="px-4 py-3 font-mono text-sm">{o.orderNumber || o.id}</td>
                   <td className="px-4 py-3 text-sm text-slate-600">{new Date(o.createdAt || Date.now()).toLocaleDateString()}</td>
                   <td className="px-4 py-3">
                     <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                       {o.status || "—"}
                     </span>
                   </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "inline-flex rounded-full px-2 py-1 text-xs font-medium " +
                        (o.paymentStatus === "PAID"
                          ? "bg-green-100 text-green-700"
                          : o.paymentStatus === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-slate-100 text-slate-700")
                      }
                    >
                       {o.paymentStatus || "—"}
                     </span>
                   </td>
                   <td className="px-4 py-3 text-sm font-medium text-slate-900">K {(Number(o.total) || 0).toLocaleString()}</td>
                   <td className="px-4 py-3 text-right">
                     <Link href={`/dashboard/orders/${o.id}`}>
                       <Button variant="ghost" size="sm">View</Button>
                     </Link>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       )}
     </div>
   )
 }
