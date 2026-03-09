 "use client"
 
 import { useEffect, useState } from "react"
 import Link from "next/link"
 import { useRouter } from "next/navigation"
 import { Button } from "@/components/ui/button"
 import { ordersApi } from "@/lib/api"
 import { useAuth } from "@/providers/AuthProvider"
 
 export default function OrderDetailPage({ params }: { params: { id: string } }) {
   const { isAuthenticated, isLoading } = useAuth()
   const router = useRouter()
   const [mounted, setMounted] = useState(false)
   const [order, setOrder] = useState<any | null>(null)
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
     ordersApi.getById(params.id).then(res => {
       if (!active) return
       setOrder(res.data || null)
       setLoading(false)
     }).catch(() => {
       if (!active) return
       setOrder(null)
       setLoading(false)
     })
     return () => { active = false }
   }, [params.id])
 
   if (!mounted || isLoading || (!isAuthenticated && mounted)) {
     return (
       <div className="min-h-screen flex items-center justify-center">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
       </div>
     )
   }
 
   if (loading) {
     return (
       <div className="mx-auto max-w-7xl px-4 py-8">
         <div className="rounded-xl border bg-white p-10 text-center text-slate-600">
           Loading order...
         </div>
       </div>
     )
   }
 
   if (!order) {
     return (
       <div className="mx-auto max-w-7xl px-4 py-8">
         <div className="rounded-xl border bg-white p-10 text-center">
           <p className="text-slate-600">Order not found.</p>
           <Link href="/dashboard/orders" className="inline-block mt-4">
             <Button className="bg-green-500 hover:bg-green-600">Back to Orders</Button>
           </Link>
         </div>
       </div>
     )
   }
 
   return (
     <div className="mx-auto max-w-7xl px-4 py-8">
       <div className="mb-6 flex items-center justify-between">
         <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Order {order.orderNumber || order.id}</h1>
         <Link href="/dashboard/orders">
           <Button variant="ghost">Back to Orders</Button>
         </Link>
       </div>
 
       <div className="grid gap-6 lg:grid-cols-3">
         <div className="lg:col-span-2 rounded-xl border bg-white p-6">
           <h2 className="mb-4 text-lg font-semibold text-slate-900">Items</h2>
           <div className="space-y-4">
             {(order.items || []).map((item: any) => (
               <div key={item.id} className="flex items-center justify-between">
                 <div>
                   <p className="font-medium text-slate-900">{item.product?.name || "Item"}</p>
                   <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                 </div>
                 <div className="text-sm font-medium text-slate-900">
                   K {(Number(item.total) || Number(item.price) || 0).toLocaleString()}
                 </div>
               </div>
             ))}
           </div>
         </div>
 
         <div className="rounded-xl border bg-white p-6">
           <h2 className="mb-4 text-lg font-semibold text-slate-900">Summary</h2>
           <div className="space-y-2 text-sm">
             <div className="flex justify-between">
               <span className="text-slate-600">Subtotal</span>
               <span className="font-medium text-slate-900">K {(Number(order.subtotal) || 0).toLocaleString()}</span>
             </div>
             <div className="flex justify-between">
               <span className="text-slate-600">Shipping</span>
               <span className="font-medium text-slate-900">K {(Number(order.shipping) || 0).toLocaleString()}</span>
             </div>
             <div className="flex justify-between">
               <span className="text-slate-600">Tax</span>
               <span className="font-medium text-slate-900">K {(Number(order.tax) || 0).toLocaleString()}</span>
             </div>
             <hr className="my-2 border-slate-200" />
             <div className="flex justify-between text-base">
               <span className="text-slate-600">Total</span>
               <span className="font-bold text-slate-900">K {(Number(order.total) || 0).toLocaleString()}</span>
             </div>
           </div>
           <div className="mt-4 text-sm">
             <p>Status: <span className="font-medium">{order.status}</span></p>
             <p>Payment: <span className="font-medium">{order.paymentStatus}</span></p>
           </div>
         </div>
       </div>
     </div>
   )
 }
