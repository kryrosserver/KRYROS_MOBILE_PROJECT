// User Types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  avatar?: string
  role: UserRole
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export type UserRole = 'customer' | 'wholesaler' | 'admin' | 'super_admin'

// Product Types
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  price: number
  salePrice?: number
  sku: string
  category: Category
  brand?: Brand
  images: ProductImage[]
  variants?: ProductVariant[]
  tags: string[]
  isFeatured: boolean
  isFlashSale: boolean
  flashSalePrice?: number
  flashSaleEnd?: string
  discountPercentage?: number
  stock: number
  stockCurrent?: number
  allowCredit: boolean
  creditMinimum?: number
  rating: number
  reviewCount: number
  specifications?: Record<string, string>
  createdAt: string
  updatedAt: string
}

export interface ProductImage {
  id: string
  url: string
  alt: string
  isPrimary: boolean
}

export interface ProductVariant {
  id: string
  name: string
  type: 'color' | 'size' | 'storage' | 'ram' | 'other'
  value: string
  price: number
  stock: number
  sku: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  icon?: string
  parentId?: string
  children?: Category[]
  productCount?: number
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo?: string
  description?: string
}

// Cart Types
export interface CartItem {
  product: Product
  variant?: ProductVariant
  quantity: number
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  discount: number
  total: number
}

// Order Types
export interface Order {
  id: string
  orderNumber: string
  user: User
  items: OrderItem[]
  subtotal: number
  discount: number
  tax: number
  shipping: number
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  shippingAddress: Address
  billingAddress: Address
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  product: Product
  variant?: ProductVariant
  quantity: number
  price: number
  total: number
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_paid'

export type PaymentMethod = 'card' | 'bank_transfer' | 'mobile_money' | 'wallet' | 'credit'

// Credit/Installment Types
export interface CreditProfile {
  id: string
  user: User
  creditLimit: number
  availableCredit: number
  usedCredit: number
  creditScore: number
  status: 'active' | 'suspended' | 'blacklisted'
  createdAt: string
  updatedAt: string
}

export interface CreditPlan {
  id: string
  name: string
  duration: number // months
  interestRate: number
  minimumAmount: number
  maximumAmount: number
  description?: string
}

export interface CreditAccount {
  id: string
  user: User
  product: Product
  creditPlan: CreditPlan
  amount: number
  totalPayable: number
  monthlyPayment: number
  paidAmount: number
  remainingAmount: number
  nextPaymentDate: string
  status: 'active' | 'completed' | 'defaulted' | 'cancelled'
  payments: CreditPayment[]
  createdAt: string
}

export interface CreditPayment {
  id: string
  amount: number
  dueDate: string
  paidDate?: string
  status: 'pending' | 'paid' | 'late' | 'missed'
  penalty?: number
}

// Service Types
export interface Service {
  id: string
  name: string
  slug: string
  description: string
  price: number
  category: string
  duration: string
  image?: string
  features: string[]
  isActive: boolean
}

export interface ServiceBooking {
  id: string
  user: User
  service: Service
  scheduledDate: string
  scheduledTime: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  notes?: string
  createdAt: string
}

// Wallet Types
export interface Wallet {
  id: string
  user: User
  balance: number
  pendingBalance: number
  currency: string
}

export interface Transaction {
  id: string
  wallet: Wallet
  amount: number
  type: 'credit' | 'debit'
  description: string
  reference: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
}

// Wholesale Types
export interface WholesaleAccount {
  id: string
  user: User
  companyName: string
  taxId: string
  status: 'pending' | 'approved' | 'suspended'
  discountTier: number
  createdAt: string
}

export interface WholesalePrice {
  id: string
  product: Product
  minQuantity: number
  price: number
}

// CMS Types
export interface Banner {
  id: string
  title: string
  subtitle?: string
  image: string
  link?: string
  linkText?: string
  isActive: boolean
  position: number
}

export interface CMSection {
  id: string
  type: SectionType
  title: string
  subtitle?: string
  isActive: boolean
  order: number
  config?: Record<string, unknown>
}

export type SectionType =
  | 'hero'
  | 'flash_sales'
  | 'categories'
  | 'featured_products'
  | 'promo_banners'
  | 'wholesale_deals'
  | 'credit_offers'
  | 'services'
  | 'software'
  | 'testimonials'
  | 'blog'

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Form Types
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
}

export interface CheckoutFormData {
  shippingAddress: Address
  billingAddress: Address
  paymentMethod: PaymentMethod
  notes?: string
}

export interface Address {
  id?: string
  firstName: string
  lastName: string
  company?: string
  street: string
  city: string
  state: string
  country: string
  zipCode: string
  phone: string
  isDefault?: boolean
}
