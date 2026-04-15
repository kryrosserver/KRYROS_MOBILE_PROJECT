"use client"

import { useCart } from "@/providers/CartProvider"
import { useCurrency } from "@/providers/CurrencyProvider"
import { useState, useEffect } from "react"
import { settingsApi } from "@/lib/api"
import { Truck } from "lucide-react"

export function FreeShippingProgress() {
  const { getSubtotal } = useCart()
  const { convertPrice } = useCurrency()
  const [shippingConfig, setShippingConfig] = useState({ fee: 50, threshold: 5000 })
  
  const subtotal = getSubtotal()
  const shippingThreshold = shippingConfig.threshold
  const progress = Math.min(100, (subtotal / shippingThreshold) * 100)
  const remaining = Math.max(0, shippingThreshold - subtotal)
  const freeShippingEligible = subtotal >= shippingThreshold

  useEffect(() => {
    settingsApi.getShippingConfig().then(res => {
      if (res.data) setShippingConfig(res.data)
    })
  }, [])

  return (
    <div className={`p-3 rounded-xl border ${freeShippingEligible ? 'bg-green-50 border-green-200' : 'bg-primary/5 border-primary/10'} space-y-2`}>
      <div className="flex items-center gap-2">
        <Truck className={`h-3.5 w-3.5 ${freeShippingEligible ? 'text-green-600' : 'text-primary'}`} />
        <h4 className={`text-[9px] font-black uppercase tracking-widest ${freeShippingEligible ? 'text-green-700' : 'text-primary'}`}>
          {freeShippingEligible ? 'FREE SHIPPING!' : 'FREE SHIPPING PROGRESS'}
        </h4>
      </div>
      
      {!freeShippingEligible && (
        <>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#1FA89A] rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <p className="text-[8px] font-bold text-slate-600">
            Add {convertPrice(remaining).formatted} more!
          </p>
        </>
      )}
      
      {freeShippingEligible && (
        <p className="text-[8px] font-bold text-green-700">
          Unlocked! 🎉
        </p>
      )}
    </div>
  )
}
