"use client"

import { useEffect, useState } from "react"
import { wishlistApi } from "@/lib/api"
import { useAuth } from "@/providers/AuthProvider"
import { useRouter } from "next/navigation"
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react"
import { ProductCard } from "@/components/home/ProductCard"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
      return
    }

    if (isAuthenticated) {
      fetchWishlist()
    }
  }, [isAuthenticated, authLoading, router])

  const fetchWishlist = async () => {
    setLoading(true)
    try {
      const res = await wishlistApi.getMine()
      if (res.data) {
        setItems(res.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (productId: string) => {
    try {
      await wishlistApi.remove(productId)
      setItems(items.filter(item => item.product.id !== productId))
    } catch (err) {
      console.error(err)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <Heart className="h-10 w-10 text-slate-200" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Your wishlist is empty</h1>
        <p className="mt-2 text-slate-500 font-medium mb-8">Save items you love to find them easily later.</p>
        <Link href="/shop">
          <Button className="h-12 px-8 font-black uppercase tracking-widest">Start Browsing</Button>
        </Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 md:py-20">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">My Wishlist</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{items.length} Items Saved</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {items.map((item) => (
            <div key={item.id} className="group relative">
              <ProductCard product={item.product} />
              <button 
                onClick={() => handleRemove(item.product.id)}
                className="absolute top-4 right-4 h-10 w-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 shadow-sm transition-all md:opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
