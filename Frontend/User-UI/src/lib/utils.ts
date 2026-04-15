import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency = 'USD'): string {
  // Handle invalid price values gracefully to prevent crashes
  const validPrice = typeof price === 'number' && !isNaN(price) ? price : 0;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: (currency === 'ZMW' || currency === 'USD') ? 0 : 2,
    maximumFractionDigits: (currency === 'ZMW' || currency === 'USD') ? 0 : 2,
  }).format(validPrice)
}

export function resolveImageUrl(url?: string): string {
  if (!url || typeof url !== 'string') return "";
  
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return "";

  // If it's already a full URL (http/https), a Data URL (Base64), or a blob URL, return it as is
  if (
    trimmedUrl.startsWith("http") || 
    trimmedUrl.startsWith("https") || 
    trimmedUrl.startsWith("data:") || 
    trimmedUrl.startsWith("blob:") ||
    trimmedUrl.startsWith("//") ||
    trimmedUrl.startsWith("www.")
  ) {
    // If it starts with www., prepend https:// for safety
    return trimmedUrl.startsWith("www.") ? `https://${trimmedUrl}` : trimmedUrl;
  }
  
  // If it's a relative path (e.g., /uploads/...), prefix it with the backend URL
  const rawApi = process.env.NEXT_PUBLIC_API_URL || "https://kryrosbackend-hxfp.onrender.com";
  // Remove trailing /api if present to get the base server URL
  const baseUrl = rawApi.replace(/\/api$/, "");
  
  // Ensure the path starts with a single slash
  const cleanPath = trimmedUrl.startsWith("/") ? trimmedUrl : `/${trimmedUrl}`;
  
  return `${baseUrl}${cleanPath}`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function calculateDiscount(original: number, sale: number): number {
  return Math.round(((original - sale) / original) * 100)
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function getTimeRemaining(endTime: Date | string): {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
} {
  const total = new Date(endTime).getTime() - new Date().getTime()
  const seconds = Math.floor((total / 1000) % 60)
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))

  return { days, hours, minutes, seconds, total }
}

export function generateWhatsAppMessage(data: {
  orderNumber: string
  orderId?: string
  customer: { firstName: string; lastName: string; phone: string; email: string }
  address: {
    street: string
    city: string
    state: string
    country: string
    zipCode?: string
    manual?: boolean
  }
  items: Array<{ name: string; quantity: number; price: number; variant?: string }>
  subtotal: number
  shipping: number
  total: number
  currency: { code: string; symbol: string }
  notes?: string
}) {
  const format = (val: number) => `${data.currency.symbol}${val.toLocaleString()}`

  let message = `*KRYROS ORDER: #${data.orderNumber}*\n\n`
  
  message += `*👤 Customer:* ${data.customer.firstName} ${data.customer.lastName}\n`
  message += `*📍 Delivery:* ${data.address.street}, ${data.address.city}\n\n`

  message += `*📦 Items:*\n`
  data.items.forEach((item) => {
    message += `- ${item.quantity}x ${item.name}${item.variant ? ` (${item.variant})` : ''}\n`
  })
  message += `\n`

  message += `*💰 Total: ${format(data.total)}*\n`
  if (data.notes) message += `*📝 Note:* ${data.notes}\n`
  
  message += `\n*🚚 Track your order here:* https://kryros.com/track?id=${data.orderNumber}&email=${encodeURIComponent(data.customer.email)}\n`
  message += `*Order Number:* ${data.orderNumber}\n`
  message += `*Email Address:* ${data.customer.email}\n\n`
  
  message += `_Please send payment details to complete this order. Thanks!_`

  return message
}
