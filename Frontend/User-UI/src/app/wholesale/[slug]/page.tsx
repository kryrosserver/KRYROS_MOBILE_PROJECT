'use client';

import { useEffect, useState } from 'react'
import { useCart } from '@/providers/CartProvider'
import { useCurrency } from '@/providers/CurrencyProvider'
import { useAuth } from '@/providers/AuthProvider'
import { wholesaleApi } from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Heart, Shield, Truck, Clock, CreditCard, ChevronLeft, ChevronRight, RefreshCw, Eye, MessageCircle, Minus, Plus, Check, Info } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kryrosbackend-hxfp.onrender.com/api'

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<any>(null)
  const [wholesaleAccount, setWholesaleAccount] = useState<any>(null)
  const [wholesaleTiers, setWholesaleTiers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [includeAccessory, setIncludeAccessory] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    if (product) {
      setQuantity(product.wholesaleMoq || 1)
    }
  }, [product])
  const cart = useCart()
  const { selectedCountry, convertPrice, formatLocal } = useCurrency()
  const { user, isAuthenticated } = useAuth()

  // Helper to format price in current currency
  const displayPrice = (amount: number) => {
    return convertPrice(amount).formatted;
  };

  useEffect(() => {
    setMounted(true)
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Try slug first
        let res = await fetch(`${API_URL}/products/slug/${params.slug}`, { 
          next: { revalidate: 600 } // Cache for 10 minutes
        })
        let data = null
        
        if (res.ok) {
          data = await res.json()
        } else {
          // Fallback: treat slug as id
          res = await fetch(`${API_URL}/products/${params.slug}`, { 
            next: { revalidate: 600 } // Cache for 10 minutes
          })
          if (res.ok) {
            data = await res.json()
          }
        }

        if (!data) {
          setError("Product not found")
        } else {
          setProduct(data)
          // Fetch wholesale tiers if product found
          const tiersRes = await fetch(`${API_URL}/wholesale/prices/${data.id}`)
          if (tiersRes.ok) {
            setWholesaleTiers(await tiersRes.json())
          }
        }
      } catch (err) {
        console.error("Fetch error:", err)
        setError("Unable to connect to the server. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchProduct()
    }
  }, [params.slug])

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      wholesaleApi.getAccount(user.id).then(res => {
        setWholesaleAccount(res.data || null)
      }).catch(() => setWholesaleAccount(null))
    }
  }, [isAuthenticated, user?.id])

  const handleAddToCart = () => {
    if (cart && typeof cart.addItem === 'function' && product) {
      cart.addItem(product, undefined, quantity);
    }
  };

  const handleBuyNow = () => {
    if (cart && typeof cart.addItem === 'function' && product) {
      cart.addItem(product, undefined, quantity);
      const accessory = product.productRelations?.[0]?.related;
      if (includeAccessory && accessory) {
        cart.addItem(accessory, undefined, 1);
      }
      window.location.href = '/checkout';
    }
  };

  const handleWishlist = () => {
    console.log("Wishlist clicked");
  };

  if (!mounted) return null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <p className="text-slate-500 font-medium">Loading premium details...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">{error || "Product not found"}</h1>
          <p className="text-slate-500 mb-6">We couldn't find the product you're looking for.</p>
          <Button onClick={() => window.location.href = '/wholesale'} className="bg-green-600 w-full hover:bg-green-700 h-12 font-bold">
            Back to Wholesale
          </Button>
        </div>
      </div>
    )
  }

  const p = product;
  const price = Number(p.price || 0);
  const originalPrice = p.originalPrice ? Number(p.originalPrice) : (p.discountPercentage ? price / (1 - p.discountPercentage / 100) : null);
  const stockTotal = Math.max(1, Number(p.stockTotal || 0));
  const stockCurrent = Math.max(0, Number(p.stockCurrent || 0));
  
  const relations = Array.isArray(p.productRelations) ? p.productRelations : [];
  const accessory = relations.length > 0 && relations[0]?.related ? relations[0].related : null;
  const accessoryPrice = accessory ? Number(accessory.price || 0) : 0;

  const totalPrice = includeAccessory && accessory
    ? (price + accessoryPrice) * 0.92
    : price;

  const scarcityPercentage = Math.max(0, Math.min(100, ((stockTotal - stockCurrent) / stockTotal) * 100));

  const isWholesale = p.isWholesaleOnly;
  const unitsPerPack = p.unitsPerPack || 1;
  const unitPrice = totalPrice / unitsPerPack;
  const moq = p.wholesaleMoq || 1;

  const rawImages = Array.isArray(p.images) ? p.images : [];
  const images = rawImages.length > 0 
    ? rawImages.map((img: any) => ({ url: typeof img === 'string' ? img : (img.url || '/placeholder.jpg') }))
    : [{ url: '/placeholder.jpg' }];
  
  const mainImage = images[activeImageIdx]?.url || '/placeholder.jpg';

  let specs = [];
  try {
    if (p.specifications) {
      const parsed = typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications;
      specs = Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    specs = [];
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12">
      <div className="container-custom">
        {/* Breadcrumbs / Category & Brand */}
        <div className="flex flex-wrap items-center gap-2 mb-6 text-xs font-bold uppercase tracking-wider text-slate-400">
          <a href="/wholesale" className="hover:text-blue-600 transition-colors">Wholesale</a>
          <span className="h-1 w-1 rounded-full bg-slate-300"></span>
          <span className="text-slate-600">{p.category?.name || 'Uncategorized'}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          {/* Left: Images */}
          <div className="space-y-4">
            <div className="group relative aspect-square overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {p.isNew && (
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-widest">
                    New Arrival
                  </span>
                )}
                {p.discountPercentage && (
                  <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-widest">
                    -{p.discountPercentage}% OFF
                  </span>
                )}
              </div>

              <Image
                src={mainImage}
                alt={p.name || "Product"}
                fill
                className="object-contain p-4 transition-transform duration-500"
                priority
                unoptimized={typeof mainImage === 'string' && mainImage.startsWith('data:')}
              />
              
              {images.length > 1 && (
                <>
                  <button 
                    onClick={() => setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-800 shadow-md transition-all hover:bg-white opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button 
                    onClick={() => setActiveImageIdx((prev) => (prev + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-800 shadow-md transition-all hover:bg-white opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                {images.map((img: any, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-xl bg-white shadow-sm ring-2 transition-all snap-start ${idx === activeImageIdx ? 'ring-blue-600' : 'ring-slate-100 hover:ring-slate-300'}`}
                  >
                    <Image 
                      src={img.url || '/placeholder.jpg'} 
                      alt={`Thumbnail ${idx + 1}`} 
                      fill 
                      className="object-contain p-1.5" 
                      unoptimized={typeof img.url === 'string' && img.url.startsWith('data:')}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Purchase Block */}
          <div className="flex flex-col space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{p.name}</h1>
              <p className="mt-2 text-sm text-slate-500 font-medium">{p.sku}</p>
              {p.shortDescription && (
                <p className="mt-4 text-slate-600 font-medium leading-relaxed">{p.shortDescription}</p>
              )}
            </div>

            <div className="bg-white p-6 md:p-8 border border-slate-100 shadow-sm rounded-lg">
              {isWholesale && (
                <div className="mb-4 inline-block bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded uppercase tracking-widest shadow-sm">
                  Wholesale Pack
                </div>
              )}
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-4">
                  <span className="text-3xl md:text-4xl font-extrabold text-red-600 tracking-tight">
                    {displayPrice(totalPrice)}
                  </span>
                  {originalPrice && (
                    <span className="text-lg text-slate-400 line-through font-medium">
                      {displayPrice(originalPrice)}
                    </span>
                  )}
                </div>
                {isWholesale && unitsPerPack > 1 && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      Pack of {unitsPerPack}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      ({displayPrice(unitPrice)} per unit)
                    </span>
                  </div>
                )}
              </div>

              {p.allowCredit && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-xs font-bold text-blue-900 uppercase tracking-wide">Credit Available</p>
                    <p className="text-[11px] font-medium text-blue-700">
                      {p.creditMessage || `Starting from ${displayPrice(Number(p.creditMinimum || 0))} per month`}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-red-500">Ordered: {stockTotal - stockCurrent}</span>
                  <span className="text-green-600">Items Available: {stockCurrent}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                  <div 
                    className="h-full bg-red-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${scarcityPercentage}%` }} 
                  />
                </div>
              </div>

              <div className="mt-8 border border-slate-100 rounded-md p-4 bg-slate-50/30">
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center border border-slate-200 bg-white rounded-md h-12 overflow-hidden shadow-sm">
                    <button 
                      className="px-3 hover:bg-slate-50 text-slate-400 h-full disabled:opacity-50"
                      onClick={() => setQuantity(q => Math.max(moq, q - 1))}
                      disabled={quantity <= moq}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input 
                      type="number" 
                      value={quantity} 
                      readOnly
                      className="w-12 text-center font-bold text-slate-800 focus:outline-none h-full border-x border-slate-100" 
                    />
                    <button 
                      className="px-3 hover:bg-slate-50 text-slate-400 h-full disabled:opacity-50"
                      onClick={() => setQuantity(q => Math.min(stockCurrent || 1000, q + 1))}
                      disabled={quantity >= (stockCurrent || 1000)}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 uppercase tracking-widest text-sm shadow-lg active:scale-95 disabled:bg-slate-300"
                    onClick={handleAddToCart}
                    disabled={isWholesale && wholesaleAccount?.status !== "APPROVED"}
                  >
                    {isWholesale && wholesaleAccount?.status !== "APPROVED" ? "Wholesale Only" : "Add to cart"}
                  </Button>
                </div>

                <div className="mt-4 flex gap-3">
                  <div className="flex gap-2">
                    <button 
                      onClick={handleWishlist}
                      className="h-12 w-12 flex items-center justify-center rounded-md border border-slate-200 bg-white text-blue-600 hover:bg-blue-50 shadow-sm"
                    >
                      <Heart className="h-5 w-5" />
                    </button>
                    <button className="h-12 w-12 flex items-center justify-center rounded-md border border-slate-200 bg-white text-blue-600 hover:bg-blue-50 shadow-sm">
                      <RefreshCw className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <Button 
                    className="flex-1 bg-[#0a192f] hover:bg-[#112240] text-white font-bold h-12 uppercase tracking-widest text-sm shadow-lg active:scale-95 disabled:bg-slate-300"
                    onClick={handleBuyNow}
                    disabled={isWholesale && wholesaleAccount?.status !== "APPROVED"}
                  >
                    {isWholesale && wholesaleAccount?.status !== "APPROVED" ? "Account Required" : "Buy Now"}
                  </Button>
                </div>
                
                {isWholesale && (!isAuthenticated || wholesaleAccount?.status !== "APPROVED") && (
                  <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex gap-3 items-start">
                    <Info className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-indigo-800 font-medium">
                      This is a wholesale-only product. You must be an <Link href="/wholesale" className="underline font-bold">Approved Partner</Link> to purchase bulk packs.
                    </div>
                  </div>
                )}
              </div>

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
                          <input type="checkbox" checked readOnly className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                          <span className="text-xs font-bold text-slate-700 truncate">This Item: {p.name}</span>
                        </div>
                        <p className="text-[10px] font-bold text-green-600 mt-0.5 uppercase">{stockCurrent} IN STOCK</p>
                      </div>
                      <span className="text-sm font-extrabold text-red-600">{displayPrice(price)}</span>
                    </div>

                    <div className="flex items-center gap-4 group opacity-60 hover:opacity-100 transition-opacity">
                      <div className="relative h-12 w-12 shrink-0 rounded border border-slate-100 overflow-hidden bg-slate-50">
                        <Image 
                          src={typeof accessory.images?.[0] === 'string' ? accessory.images[0] : accessory.images?.[0]?.url || '/placeholder.jpg'} 
                          alt={accessory.name || "Accessory"} 
                          fill 
                          className="object-contain p-1" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            className="h-4 w-4 rounded border-slate-300 text-blue-600" 
                            checked={includeAccessory}
                            onChange={(e) => setIncludeAccessory(e.target.checked)}
                          />
                          <span className="text-xs font-bold text-slate-700 truncate">{accessory.name}</span>
                        </div>
                        <p className="text-[10px] font-bold text-green-600 mt-0.5 uppercase">IN STOCK</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-red-600">{displayPrice(accessoryPrice)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8">
                <Button 
                  asChild
                  className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold h-14 uppercase tracking-widest text-sm shadow-xl flex items-center justify-center gap-3 active:scale-95"
                >
                  <a 
                    href={`https://wa.me/?text=${encodeURIComponent(`Hello, I would like to know more about the product: ${p.name || 'this product'}. (SKU: ${p.sku || 'N/A'})`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-6 w-6" />
                    REQUEST INFORMATION
                  </a>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {p.deliveryInfo && (
                <div className="bg-white p-4 border border-slate-100 rounded-lg flex items-center gap-4 shadow-sm">
                  <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600"><Truck className="h-5 w-5" /></div>
                  <div className="flex-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivery Info</div>
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">{p.deliveryInfo}</div>
                  </div>
                </div>
              )}
              {p.warrantyInfo && (
                <div className="bg-white p-4 border border-slate-100 rounded-lg flex items-center gap-4 shadow-sm">
                  <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center text-green-600"><Shield className="h-5 w-5" /></div>
                  <div className="flex-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Warranty</div>
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">{p.warrantyInfo}</div>
                  </div>
                </div>
              )}
              {!p.deliveryInfo && p.hasFreeReturns && (
                <div className="bg-white p-4 border border-slate-100 rounded-lg flex items-center gap-4 shadow-sm">
                  <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center text-green-600"><Truck className="h-5 w-5" /></div>
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    ✓ {p.freeReturnsText || "FREE RETURNS"}
                  </div>
                </div>
              )}
              {!p.warrantyInfo && p.hasFiveYearGuarantee && (
                <div className="bg-white p-4 border border-slate-100 rounded-lg flex items-center gap-4 shadow-sm">
                  <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600"><Shield className="h-5 w-5" /></div>
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    ✓ {p.fiveYearGuaranteeText || "5 YEARS GUARANTEE"}
                  </div>
                </div>
              )}
              {p.hasInstallmentOptions && (
                <div className="bg-white p-4 border border-slate-100 rounded-lg flex items-center gap-4 shadow-sm">
                  <div className="h-10 w-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-600"><CreditCard className="h-5 w-5" /></div>
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    ✓ {p.installmentOptionsText || "INSTALLMENT OPTIONS"}
                  </div>
                </div>
              )}
            </div>

            {p.wholesalePrice && (
              <div className="space-y-3">
                {wholesaleAccount?.status === "APPROVED" ? (
                  <div className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-400" />
                        <span className="text-sm font-black text-white uppercase tracking-widest">Wholesale Tiers</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-800 px-2 py-1 rounded">Approved Partner</span>
                    </div>
                    
                    <div className="space-y-2">
                      {/* Base Tier (Quantity 1) */}
                      <div className="flex justify-between items-center py-2 border-b border-slate-800">
                        <span className="text-xs text-slate-400 font-medium">1+ units</span>
                        <span className="text-sm font-bold text-green-400">{displayPrice(Number(p.wholesalePrice))}</span>
                      </div>
                      
                      {/* Custom Tiers */}
                      {wholesaleTiers.map((tier, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0">
                          <span className="text-xs text-slate-400 font-medium">{tier.minQuantity}+ units</span>
                          <span className="text-sm font-bold text-green-400">{displayPrice(Number(tier.price))}</span>
                        </div>
                      ))}
                    </div>
                    
                    <p className="mt-4 text-[10px] text-slate-500 italic leading-relaxed">
                      Wholesale prices are applied automatically in your cart based on the total quantity.
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-900 p-4 rounded-lg flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
                        <Check className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Wholesale Available</span>
                    </div>
                    <span className="text-sm font-black text-green-400">{displayPrice(Number(p.wholesalePrice))}</span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-6 pt-4">
              {specs.length > 0 && (
                <div className="bg-white p-6 md:p-8 border border-slate-100 shadow-sm rounded-lg">
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <span className="w-8 h-1 bg-blue-600 rounded-full"></span>
                    Specifications
                  </h3>
                  <div className="grid gap-y-3">
                    {specs.map((spec: any, idx: number) => (
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
                  {p.description || "No description available."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar - Professional App Feel */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 md:hidden pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.1)] px-5">
        <div className="flex gap-4">
          <button 
            onClick={handleWishlist}
            className="h-12 w-12 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 active:bg-slate-50 transition-colors"
          >
            <Heart className="h-6 w-6" />
          </button>
          
          <div className="flex-1 grid grid-cols-2 gap-2">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-black h-12 rounded-xl text-[11px] uppercase tracking-wider shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
              onClick={handleAddToCart}
              disabled={isWholesale && wholesaleAccount?.status !== "APPROVED"}
            >
              {isWholesale && wholesaleAccount?.status !== "APPROVED" ? "Wholesale Only" : "Add to cart"}
            </Button>
            <Button 
              className="bg-[#0a192f] hover:bg-[#112240] text-white font-black h-12 rounded-xl text-[11px] uppercase tracking-wider shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
              onClick={handleBuyNow}
              disabled={isWholesale && wholesaleAccount?.status !== "APPROVED"}
            >
              {isWholesale && wholesaleAccount?.status !== "APPROVED" ? "Account Required" : "Buy Now"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
