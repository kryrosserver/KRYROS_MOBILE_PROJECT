const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kryrosbackend-hxfp.onrender.com/api'
import { ProductCard } from '@/components/home/ProductCard'

async function getFlashSales() {
  const res = await fetch(`${API_URL}/products/flash-sales`, { 
    next: { revalidate: 60 } // Revalidate every minute
  })
  if (!res.ok) return []
  return res.json()
}

export default async function FlashSalesPage() {
  const products = await getFlashSales()
  return (
    <div className="container-custom py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Flash Sales</h1>
        <p className="text-slate-500 mt-2">Limited time offers on top tech products</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {products.map((p: any) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}
