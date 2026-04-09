'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import { useToast } from '@/components/ui/use-toast'
import type { CartItem, Product, ProductVariant } from '@/types'

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
  getTotal: () => number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { toast } = useToast()

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('kryros_cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Failed to parse cart:', error)
      }
    }
  }, [])

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('kryros_cart', JSON.stringify(items))
  }, [items])

  const addItem = useCallback(
    (product: Product, variant?: ProductVariant, quantity = 1) => {
      let isUpdate = false;
      setItems((currentItems) => {
        const existingItemIndex = currentItems.findIndex(
          (item) =>
            item.product.id === product.id &&
            item.variant?.id === variant?.id
        )

        if (existingItemIndex > -1) {
          isUpdate = true;
          const updatedItems = [...currentItems]
          updatedItems[existingItemIndex].quantity += quantity
          return updatedItems
        }

        return [...currentItems, { product, variant, quantity }]
      })

      if (isUpdate) {
        toast({
          title: 'Cart updated',
          description: `${product.name} quantity updated`,
        })
      } else {
        toast({
          title: 'Added to cart',
          description: `${product.name} added to your cart`,
        })
      }
      setIsCartOpen(true)
    },
    [toast]
  )

  const removeItem = useCallback(
    (productId: string, variantId?: string) => {
      setItems((currentItems) =>
        currentItems.filter(
          (item) =>
            !(item.product.id === productId && item.variant?.id === variantId)
        )
      )
      toast({
        title: 'Removed from cart',
        description: 'Item removed from your cart',
        className: "bg-white border-slate-200 text-slate-900 shadow-xl",
      })
    },
    [toast]
  )

  const updateQuantity = useCallback(
    (productId: string, variantId: string | undefined, quantity: number) => {
      if (quantity < 1) {
        removeItem(productId, variantId)
        return
      }

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.product.id === productId && item.variant?.id === variantId
            ? { ...item, quantity }
            : item
        )
      )
    },
    [removeItem]
  )

  const clearCart = useCallback(() => {
    setItems([])
    toast({
      title: 'Cart cleared',
      description: 'All items have been removed from your cart',
    })
  }, [toast])

  const getItemCount = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }, [items])

  const getSubtotal = useCallback(() => {
    return items.reduce((total, item) => {
      const price = Number(item.variant?.price || item.product.salePrice || item.product.price) || 0
      return total + price * item.quantity
    }, 0)
  }, [items])

  const getTotal = useCallback(() => {
    // Add tax and shipping calculation here
    return getSubtotal()
  }, [getSubtotal])

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemCount,
        getSubtotal,
        getTotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
