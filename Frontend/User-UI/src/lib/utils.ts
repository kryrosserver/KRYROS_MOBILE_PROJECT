import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
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
  customer: { firstName: string; lastName: string; phone: string }
  address: {
    street: string
    city: string
    state: string
    country: string
    manual?: boolean
  }
  items: Array<{ name: string; quantity: number; price: number; variant?: string }>
  subtotal: number
  shipping: number
  total: number
  currency: { code: string; symbol: string }
}) {
  const format = (val: number) => `${data.currency.symbol} ${val.toLocaleString()}`

  let message = `*Hello KRYROS, here is my order:*%0A%0A`
  message += `*🆔 Order:* #${data.orderNumber}%0A`
  message += `*👤 Customer:* ${data.customer.firstName} ${data.customer.lastName} (${data.customer.phone})%0A`
  message += `*📍 Delivery:* ${data.address.street}, ${data.address.city}, ${data.address.state}, ${data.address.country}${data.address.manual ? ' (Manual Input)' : ''}%0A%0A`

  message += `*📦 Products:*%0A`
  data.items.forEach((item) => {
    message += `- ${item.quantity}x ${item.name}${item.variant ? ` (${item.variant})` : ''} - ${format(item.price * item.quantity)}%0A`
  })

  message += `%0A*🚚 Shipping:* ${data.shipping === 0 ? 'FREE' : format(data.shipping)}%0A%0A`
  message += `*💰 Totals:*%0A`
  message += `- Subtotal: ${format(data.subtotal)}%0A`
  message += `- Shipping: ${data.shipping === 0 ? 'FREE' : format(data.shipping)}%0A`
  message += `*🔥 TOTAL TO PAY: ${format(data.total)}*`

  return message
}
