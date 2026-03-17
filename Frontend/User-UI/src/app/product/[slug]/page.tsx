'use client';

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/providers/CartProvider'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Heart, Shield, Truck, Clock, CreditCard, ChevronLeft, ChevronRight, RefreshCw, Eye, MessageCircle, Minus, Plus, Check } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kryrosbackend.onrender.com/api'

async function getProduct(slug: string) {
  // Try slug first
  let res = await fetch(`${API_URL}/products/slug/${slug}`, { cache: 'no-store' })
  if (res.ok) {
    return res.json()
  }
  // Fallback: treat slug as id
  res = await fetch(`${API_URL}/products/${slug}`, { cache: 'no-store' })
  if (res.ok) {
    return res.json()
  }
  return null
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImageIdx, setActiveImageIdx] = useState(0)

  useEffect(() => {
    getProduct(params.slug).then(data => {
      setProduct(data)
      setLoading(false)
    })
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!product) {
    return null;
  }

  const p = product;
  
  // Safe parsing for specifications
  let specifications = [];
  try {
    if (p && p.specifications) {
      specifications = typeof p.specifications === 'string' 
        ? JSON.parse(p.specifications) 
        : (Array.isArray(p.specifications) ? p.specifications : []);
    }
  } catch (e) {
    console.error("Failed to parse specifications:", e);
  }

  const [quantity, setQuantity] = useState(1);
  const cart = useCart();

  const [includeAccessory, setIncludeAccessory] = useState(false);

  // Safe access for relations and numbers
  const productRelations = p?.productRelations || [];
  const accessory = productRelations.length > 0 ? productRelations[0]?.related : null;
  
  const basePrice = Number(p?.price || 0);
  const accessoryPrice = accessory ? Number(accessory.price || 0) : 0;
  const stockTotal = Number(p?.stockTotal || 1); // Default to 1 to avoid division by zero
  const stockCurrent = Number(p?.stockCurrent || 0);

  const totalPrice = includeAccessory && accessory
    ? (basePrice + accessoryPrice) * 0.92 // 8% discount
    : basePrice;

  const handleAddToCart = () => {
    if (cart && typeof cart.addItem === 'function') {
      cart.addItem(p, undefined, quantity);
    }
  };

  const handleBuyNow = () => {
    if (cart && typeof cart.addItem === 'function') {
      cart.addItem(p, undefined, quantity);
      if (includeAccessory && accessory) {
        cart.addItem(accessory, undefined, 1);
      }
    }
  };

  const handleWishlist = () => {
    // Add to wishlist logic
  };

  const images = Array.isArray(p?.images) && p.images.length > 0 ? p.images : [{ url: '/placeholder.jpg' }];
  const mainImage = images[activeImageIdx]?.url || '/placeholder.jpg';

  const nextImage = () => setActiveImageIdx((prev) => (prev + 1) % images.length);
  const prevImage = () => setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length);

  // Calculate scarcity percentage safely
  const scarcityPercentage = Math.max(0, Math.min(100, ((stockTotal - stockCurrent) / stockTotal) * 100));

  if (!p) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12">
      <div className="container-custom">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          {/* Left: Images */}
          <div className="space-y-4">
            <div className="group relative aspect-square overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <Image
                src={mainImage}
                alt={p.name}
                fill
                className="object-contain p-4 transition-transform duration-500"
                priority
                unoptimized={mainImage.startsWith('data:')}
              />
              
              {images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-800 shadow-md transition-all hover:bg-white hover:scale-110 opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-800 shadow-md transition-all hover:bg-white hover:scale-110 opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_: any, idx: number) => (
                      <div 
                        key={idx} 
                        className={`h-1.5 rounded-full transition-all ${idx === activeImageIdx ? 'w-6 bg-green-500' : 'w-1.5 bg-slate-300'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-4">
                {images.map((img: any, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative aspect-square overflow-hidden rounded-lg bg-white shadow-sm ring-2 transition-all ${idx === activeImageIdx ? 'ring-green-500 scale-105' : 'ring-slate-200 hover:ring-slate-300'}`}
                  >
                    <Image 
                      src={img.url} 
                      alt={p.name} 
                      fill 
                      className="object-contain p-2" 
                      unoptimized={img.url.startsWith('data:')}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Electron Purchase Block */}
          <div className="flex flex-col space-y-6">
            <div className="bg-white p-6 md:p-8 border border-slate-100 shadow-sm rounded-lg">
              {/* Pricing */}
              <div className="flex items-baseline gap-4">
                <span className="text-3xl md:text-4xl font-extrabold text-red-600 tracking-tight">
                  {formatPrice(totalPrice)}
                </span>
                {p.salePrice && (
                  <span className="text-lg text-slate-400 line-through font-medium">
                    {formatPrice(Number(p.price))}
                  </span>
                )}
              </div>

              {/* Scarcity Indicator */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-red-500">Ordered: {stockTotal - stockCurrent}</span>
                  <span className="text-green-600">Items Available: {stockCurrent}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                  <div 
                    className="h-full bg-red-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(239,68,68,0.4)]" 
                    style={{ width: `${scarcityPercentage}%` }} 
                  />
                </div>
              </div>

              {/* Add to Cart & Controls */}
              <div className="mt-8 border border-slate-100 rounded-md p-4 bg-slate-50/30">
                <div className="flex flex-wrap gap-3">
                  {/* Quantity Selector */}
                  <div className="flex items-center border border-slate-200 bg-white rounded-md h-12 overflow-hidden shadow-sm">
                    <button 
                      className="px-3 hover:bg-slate-50 text-slate-400 transition-colors h-full disabled:opacity-50"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input 
                      type="number" 
                      value={quantity} 
                      onChange={(e) => setQuantity(Math.max(1, Math.min(stockCurrent || 1, Number(e.target.value))))}
                      className="w-12 text-center font-bold text-slate-800 focus:outline-none h-full border-x border-slate-100" 
                    />
                    <button 
                      className="px-3 hover:bg-slate-50 text-slate-400 transition-colors h-full disabled:opacity-50"
                      onClick={() => setQuantity(q => Math.min(stockCurrent || 1, q + 1))}
                      disabled={quantity >= (stockCurrent || 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Add to Cart Button */}
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 uppercase tracking-widest text-sm shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                    onClick={handleAddToCart}
                    disabled={stockCurrent <= 0}
                  >
                    Add to cart
                  </Button>
                </div>

                <div className="mt-4 flex gap-3">
                  {/* Side Icons */}
                  <div className="flex gap-2">
                    <button 
                      className="h-12 w-12 flex items-center justify-center rounded-md border border-slate-200 bg-white text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                      onClick={handleWishlist}
                    >
                      <Heart className="h-5 w-5" />
                    </button>
                    <button className="h-12 w-12 flex items-center justify-center rounded-md border border-slate-200 bg-white text-blue-600 hover:bg-blue-50 transition-colors shadow-sm">
                      <RefreshCw className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Buy Now Button */}
                  <Button 
                    className="flex-1 bg-[#0a192f] hover:bg-[#112240] text-white font-bold h-12 uppercase tracking-widest text-sm shadow-lg transition-all active:scale-95"
                    onClick={handleBuyNow}
                    disabled={stockCurrent <= 0}
                  >
                    Buy Now
                  </Button>
                </div>
              </div>

              {/* Bundle Offer */}
              {accessory && (
                <div className="mt-8 border-t border-dashed border-slate-200 pt-6">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4">
                    YOU WILL GET 8% OFF ON EACH PRODUCT
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 group">
                      <div className="relative h-12 w-12 shrink-0 rounded border border-slate-100 overflow-hidden bg-slate-50">
                        <Image src={mainImage} alt={p.name} fill className="object-contain p-1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked readOnly className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                          <span className="text-xs font-bold text-slate-700 truncate">This Item: {p?.name}</span>
                        </div>
                        <p className="text-[10px] font-bold text-green-600 mt-0.5 uppercase">{stockCurrent} IN STOCK (CAN BE BACKORDERED)</p>
                      </div>
                      <span className="text-sm font-extrabold text-red-600">{formatPrice(Number(p?.price || 0))}</span>
                    </div>

                    {/* Accessory for Bundle */}
                    <div className="flex items-center gap-4 group opacity-60 hover:opacity-100 transition-opacity">
                      <div className="relative h-12 w-12 shrink-0 rounded border border-slate-100 overflow-hidden bg-slate-50">
                        <Image src={accessory?.images?.[0]?.url || '/placeholder.jpg'} alt={accessory?.name || 'Accessory'} fill className="object-contain p-1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                            checked={includeAccessory}
                            onChange={(e) => setIncludeAccessory(e.target.checked)}
                          />
                          <span className="text-xs font-bold text-slate-700 truncate">{accessory?.name}</span>
                        </div>
                        <p className="text-[10px] font-bold text-green-600 mt-0.5 uppercase">{accessory?.stockCurrent || 0} IN STOCK</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-red-600">{formatPrice(Number(accessory?.price || 0))}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Request Info Button */}
              <div className="mt-8">
                <Button 
                  asChild
                  className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold h-14 uppercase tracking-widest text-sm shadow-xl shadow-green-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <a 
                    href={`https://wa.me/?text=${encodeURIComponent(`Hello, I would like to know more about the product: ${p?.name}. (SKU: ${p?.sku})`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-6 w-6" />
                    REQUEST INFORMATION
                  </a>
                </Button>
              </div>
            </div>

            {/* Warranty & Delivery Badges */}
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-white p-4 border border-slate-100 rounded-lg flex items-center gap-4">
                <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600"><Shield className="h-5 w-5" /></div>
                <div className="text-xs font-bold text-slate-700">✓ 5 YEARS GUARANTEE</div>
              </div>
              <div className="bg-white p-4 border border-slate-100 rounded-lg flex items-center gap-4">
                <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center text-green-600"><Truck className="h-5 w-5" /></div>
                <div className="text-xs font-bold text-slate-700">✓ FREE RETURNS</div>
              </div>
              <div className="bg-white p-4 border border-slate-100 rounded-lg flex items-center gap-4">
                <div className="h-10 w-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-600"><CreditCard className="h-5 w-5" /></div>
                <div className="text-xs font-bold text-slate-700">✓ INSTALLMENT OPTIONS</div>
              </div>
            </div>

            {/* Specifications & Description */}
            <div className="space-y-6 pt-4">
              {specifications.length > 0 && (
                <div className="bg-white p-6 md:p-8 border border-slate-100 shadow-sm rounded-lg">
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <span className="w-8 h-1 bg-blue-600 rounded-full"></span>
                    Specifications
                  </h3>
                  <div className="grid gap-y-3">
                    {specifications.map((spec: any, idx: number) => (
                      <div key={idx} className="flex border-b border-slate-50 pb-3 last:border-0">
                        <span className="w-1/3 text-xs font-bold text-slate-400 uppercase tracking-tight">{spec.key}</span>
                        <span className="w-2/3 text-sm font-bold text-slate-800">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white p-6 md:p-8 border border-slate-100 shadow-sm rounded-lg">
                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span className="w-8 h-1 bg-blue-600 rounded-full"></span>
                  Description
                </h3>
                <div className="text-sm leading-relaxed text-slate-600 font-medium whitespace-pre-line">
                  {p?.description}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
